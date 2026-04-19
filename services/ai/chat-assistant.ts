import { faqKnowledge } from '@/db/mock-ai-data';
import { formatPrice } from '@/lib/utils';
import { runAiAdapter } from '@/services/ai/llm-adapter';
import { toProductLite } from '@/services/marketplace-data';
import { mapSearchIntent, searchProductsViaPythonAi } from '@/services/ai/python-ai-service';
import { buildKnowledgeAnswer } from '@/services/ai/shopyia-knowledge';
import type { AssistantIntent, ChatAssistantInput, ChatAssistantOutput, ProductLite } from '@/types/marketplace-ai';

function detectIntent(message: string): AssistantIntent {
  const text = message.toLowerCase();
  if (
    text.includes('dropshipping') ||
    text.includes('comportement client') ||
    text.includes('conversion') ||
    text.includes('recommandation') ||
    text.includes('arnaque') ||
    text.includes('securite') ||
    text.includes('ecommerce') ||
    text.includes('vente en ligne')
  ) {
    return 'general_help';
  }
  if (text.includes('difference') || text.includes('comparer') || text.includes('compare')) return 'product_compare';
  if (text.includes('livraison') || text.includes('delai') || text.includes('arriver')) return 'faq_delivery';
  if (text.includes('paiement') || text.includes('payer') || text.includes('carte') || text.includes('mobile money')) return 'faq_payment';
  if (text.includes('retour') || text.includes('rembourse')) return 'faq_returns';
  if (text.includes('cherche') || text.includes('besoin') || text.includes('prix') || text.includes('moins de')) return 'product_search';
  return 'general_help';
}

function parseBudget(message: string): number | null {
  const compact = message.replace(/\s/g, '');
  const budgetMatch = compact.match(/(\d{4,9})/);
  if (!budgetMatch) return null;
  return Number(budgetMatch[1]);
}

function parseCategoryHint(message: string): string | null {
  const text = message.toLowerCase();
  if (text.includes('etudiant') || text.includes('student')) return 'organisation';
  if (text.includes('telephone') || text.includes('power') || text.includes('battery')) return 'energie';
  if (text.includes('cuisine') || text.includes('mixeur')) return 'cuisine';
  if (text.includes('securite') || text.includes('camera')) return 'securite';
  if (text.includes('sport') || text.includes('fitness')) return 'fitness';
  if (text.includes('mobilite') || text.includes('transport') || text.includes('scooter')) return 'mobilite';
  if (text.includes('sante') || text.includes('hygiene') || text.includes('soin')) return 'sante';
  if (text.includes('ecole') || text.includes('education') || text.includes('apprentissage')) return 'education';
  if (text.includes('agriculture') || text.includes('ferme') || text.includes('semence')) return 'agriculture';
  if (text.includes('maison') || text.includes('menage') || text.includes('domestique')) return 'maison';
  return null;
}

function searchProducts(params: { message: string; country: string; city: string }): ProductLite[] {
  const all = toProductLite();
  const budget = parseBudget(params.message);
  const categoryHint = parseCategoryHint(params.message);
  const keywords = params.message.toLowerCase().split(/\s+/).filter((token) => token.length > 2);

  return all
    .map((product) => {
      let score = 0;
      if (product.country === params.country) score += 3;
      if (product.city === params.city) score += 2;
      if (budget && product.price <= budget) score += 4;
      if (budget && product.price > budget) score -= 2;
      if (categoryHint && product.categorySlug === categoryHint) score += 3;

      const haystack = `${product.name} ${product.category} ${product.companyName}`.toLowerCase();
      for (const keyword of keywords) {
        if (haystack.includes(keyword)) score += 1;
      }

      score += Math.round(product.averageRating);
      return { product, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((entry) => entry.product);
}

export async function buildChatAssistantReply(input: ChatAssistantInput): Promise<ChatAssistantOutput> {
  try {
    const intent = detectIntent(input.message);
    const knowledge = buildKnowledgeAnswer(input.locale, input.message);
    const localSuggestions = searchProducts({
      message: input.message,
      country: input.country,
      city: input.city
    });

    // The Python microservice becomes the primary search brain for product discovery,
    // while the local scorer remains as a safe fallback if it is unavailable.
    const pythonResult =
      intent === 'product_search' || intent === 'general_help'
        ? await searchProductsViaPythonAi({
            query: input.message,
            locale: input.locale,
            topK: 4
          })
        : null;

    const suggestions = pythonResult?.suggestions.length ? pythonResult.suggestions : localSuggestions;

    if (intent === 'faq_delivery') {
      return {
        intent,
        answer:
          input.locale === 'fr'
            ? `${faqKnowledge.delivery[0]} ${faqKnowledge.delivery[1]}${knowledge ? `\n\n${knowledge.text}` : ''}`
            : `Delivery timeline depends on city, stock, and transport. Same city is fastest; cross-country is longer.${knowledge ? `\n\n${knowledge.text}` : ''}`,
        suggestions,
        fallbackUsed: false
      };
    }

    if (intent === 'faq_payment') {
      return {
        intent,
        answer:
          input.locale === 'fr'
            ? `${faqKnowledge.payment[0]} ${faqKnowledge.payment[1]}${knowledge ? `\n\n${knowledge.text}` : ''}`
            : `Min-shop supports local methods and cards depending on country. Payment confirmation happens before shipping.${knowledge ? `\n\n${knowledge.text}` : ''}`,
        suggestions,
        fallbackUsed: false
      };
    }

    if (intent === 'faq_returns') {
      return {
        intent,
        answer:
          input.locale === 'fr'
            ? `${faqKnowledge.returns[0]} ${faqKnowledge.returns[1]}${knowledge ? `\n\n${knowledge.text}` : ''}`
            : `Returns depend on seller policy and product type. Damaged or non-compliant items can be reported quickly.${knowledge ? `\n\n${knowledge.text}` : ''}`,
        suggestions,
        fallbackUsed: false
      };
    }

    if (intent === 'product_compare' && suggestions.length >= 2) {
      const [a, b] = suggestions;
      const fr = `${a.name} est a ${formatPrice(a.price, input.country)} et ${b.name} est a ${formatPrice(
        b.price,
        input.country
      )}. ${a.averageRating >= b.averageRating ? a.name : b.name} est mieux note localement.`;
      const en = `${a.name} is ${formatPrice(a.price, input.country)} and ${b.name} is ${formatPrice(
        b.price,
        input.country
      )}. ${a.averageRating >= b.averageRating ? a.name : b.name} currently has a better local rating.`;
      return { intent, answer: input.locale === 'fr' ? fr : en, suggestions, fallbackUsed: false };
    }

    if (intent === 'product_search' && suggestions.length > 0) {
      if (pythonResult?.suggestions.length) {
        return {
          intent: mapSearchIntent(pythonResult.intent),
          answer: pythonResult.answer,
          suggestions,
          fallbackUsed: false
        };
      }

      const ai = await runAiAdapter({
        locale: input.locale,
        prompt:
          input.locale === 'fr'
            ? `J'ai trouve ${suggestions.length} options adaptees a ${input.city}. Je recommande ${suggestions[0].name} en priorite.`
            : `I found ${suggestions.length} options for ${input.city}. I recommend ${suggestions[0].name} first.`
      });
      return {
        intent,
        answer: ai.text,
        suggestions,
        fallbackUsed: false
      };
    }

    if (pythonResult?.suggestions.length) {
      return {
        intent: mapSearchIntent(pythonResult.intent),
        answer: `${pythonResult.answer}${knowledge ? `\n\n${knowledge.text}` : ''}`,
        suggestions,
        fallbackUsed: false
      };
    }

    if (knowledge) {
      return {
        intent: 'general_help',
        answer: knowledge.text,
        suggestions,
        fallbackUsed: false
      };
    }

    return {
      intent: 'general_help',
      answer:
        input.locale === 'fr'
          ? 'Je peux t aider a trouver un produit, comparer des offres, ou expliquer livraison, paiement et retour.'
          : 'I can help you find products, compare offers, and explain delivery, payment, and returns.',
      suggestions,
      fallbackUsed: false
    };
  } catch {
    return {
      intent: 'general_help',
      answer:
        input.locale === 'fr'
          ? 'Le service IA est indisponible pour le moment. Voici des suggestions basees sur le catalogue local.'
          : 'The AI service is temporarily unavailable. Here are local catalog suggestions.',
      suggestions: searchProducts({ message: input.message, country: input.country, city: input.city }),
      fallbackUsed: true
    };
  }
}

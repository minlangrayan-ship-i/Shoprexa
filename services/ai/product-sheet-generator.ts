import { runAiAdapter } from '@/services/ai/llm-adapter';
import type { ProductSheetRequest, ProductSheetResult } from '@/types/marketplace-ai';

function normalizeLine(line: string) {
  return line.trim().replace(/\s+/g, ' ');
}

export async function generateProductSheet(input: ProductSheetRequest, locale: 'fr' | 'en'): Promise<ProductSheetResult> {
  const missingFields: string[] = [];
  if (!input.name.trim()) missingFields.push(locale === 'fr' ? 'Nom du produit/service' : 'Product/service name');
  if (!input.categorySlug.trim()) missingFields.push(locale === 'fr' ? 'Categorie' : 'Category');
  if (!input.benefits?.trim()) missingFields.push(locale === 'fr' ? 'Benefices client' : 'Customer benefits');
  if (!input.salesZone?.trim()) missingFields.push(locale === 'fr' ? 'Zone de vente' : 'Sales zone');

  const cautionNotes: string[] = [];
  if ((input.draft ?? '').toLowerCase().includes('garanti a 100%')) {
    cautionNotes.push(locale === 'fr' ? 'Eviter les promesses absolues non prouvables.' : 'Avoid absolute claims that cannot be proven.');
  }

  if ((input.specs ?? '').trim().length < 12) {
    cautionNotes.push(
      locale === 'fr'
        ? 'Ajoute plus de caracteristiques techniques pour renforcer la confiance.'
        : 'Add clearer technical details to improve trust.'
    );
  }

  const optimizedTitle = normalizeLine(
    input.kind === 'service'
      ? `${input.name} - Service pro pour ${input.salesZone || 'votre zone'}`
      : `${input.name} - Solution fiable pour ${input.salesZone || 'votre zone'}`
  );

  const polishedDescription = normalizeLine(
    input.kind === 'service'
      ? `Service ${input.categorySlug} concu pour le contexte local. ${input.benefits || ''} ${input.specs || ''}`
      : `Produit ${input.categorySlug} pense pour les usages quotidiens. ${input.benefits || ''} ${input.specs || ''}`
  );

  const sellingPoints = [
    locale === 'fr' ? 'Presentation claire et rassurante' : 'Clear and reassuring positioning',
    locale === 'fr' ? 'Benefice client mis en avant' : 'Customer benefit highlighted',
    locale === 'fr' ? 'Adaptation au marche local' : 'Adapted to local market'
  ];

  const salesArguments = [
    locale === 'fr' ? 'Bon rapport utilite/prix pour usage quotidien' : 'Strong utility/price value for daily use',
    locale === 'fr' ? 'Information transparente sur la zone de vente et disponibilite' : 'Transparent sales zone and availability information',
    locale === 'fr' ? 'Texte concis, lisible et orienté conversion' : 'Concise, readable, conversion-oriented copy'
  ];

  if (input.draft?.trim()) {
    const ai = await runAiAdapter({
      locale,
      prompt:
        locale === 'fr'
          ? `Reformule cette fiche de facon plus professionnelle sans exageration: ${input.draft}`
          : `Rewrite this product sheet professionally without exaggeration: ${input.draft}`
    });
    sellingPoints.unshift(ai.text);
  }

  return {
    optimizedTitle,
    polishedDescription,
    sellingPoints,
    salesArguments,
    missingFields,
    cautionNotes
  };
}

import { ChatMistralAI } from '@langchain/mistralai';
import { env } from '@/lib/env';
import { getAiLabConfig } from '@/services/ai/ai-lab-config';
import type { Locale } from '@/types/marketplace-ai';

export type AiAdapterInput = {
  prompt: string;
  locale: Locale;
};

export type AiAdapterOutput = {
  text: string;
  provider: 'mock' | 'langchain_mistral';
};

let cachedMistralClient: ChatMistralAI | null = null;

function getMistralClient() {
  if (cachedMistralClient) return cachedMistralClient;
  cachedMistralClient = new ChatMistralAI({
    apiKey: env.MISTRAL_API_KEY,
    model: env.MISTRAL_MODEL,
    temperature: 0.2,
    maxTokens: 450
  });
  return cachedMistralClient;
}

export async function runAiAdapter(input: AiAdapterInput): Promise<AiAdapterOutput> {
  const config = getAiLabConfig();
  const wantsLangChainMistral = config.orchestration === 'langchain' && config.baseModel === 'mistral_7b';

  if (wantsLangChainMistral && env.MISTRAL_API_KEY) {
    try {
      const systemPrompt =
        input.locale === 'fr'
          ? 'Tu es Shopyia. Reponds de maniere concise, claire et orientee conversion e-commerce, sans promesses trompeuses.'
          : 'You are Shopyia. Reply concisely, clearly, and conversion-focused for e-commerce, without misleading claims.';

      const llm = getMistralClient();
      const response = await llm.invoke([
        ['system', systemPrompt],
        ['human', input.prompt]
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : response.content
              .map((chunk) => (typeof chunk === 'string' ? chunk : 'text' in chunk ? chunk.text : ''))
              .join(' ')
              .trim();

      if (content) {
        return {
          text: content,
          provider: 'langchain_mistral'
        };
      }
    } catch {
      // Falls back to mock adapter below when LangChain or Mistral is unavailable.
    }
  }

  const prefix = input.locale === 'fr' ? 'Assistant Min-shop:' : 'Min-shop assistant:';
  return {
    text: `${prefix} ${input.prompt}`,
    provider: 'mock'
  };
}

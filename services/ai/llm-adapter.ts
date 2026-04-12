import type { Locale } from '@/types/marketplace-ai';

export type AiAdapterInput = {
  prompt: string;
  locale: Locale;
};

export type AiAdapterOutput = {
  text: string;
  provider: 'mock';
};

// MVP mock adapter. Later this can call OpenAI or another provider.
export async function runAiAdapter(input: AiAdapterInput): Promise<AiAdapterOutput> {
  const prefix = input.locale === 'fr' ? 'Assistant Min-shop:' : 'Min-shop assistant:';
  return {
    text: `${prefix} ${input.prompt}`,
    provider: 'mock'
  };
}

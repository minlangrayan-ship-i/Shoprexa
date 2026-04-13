import { categoryKeywords } from '@/db/mock-ai-data';
import { assessImageQuality } from '@/lib/image-quality';
import type { VisionAnalysisRequest, VisionAnalysisResult, VisionSignal } from '@/types/marketplace-ai';

type VisionAnalyzer = (input: VisionAnalysisRequest) => Promise<VisionAnalysisResult>;

function normalizeToken(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeSignals(signals: VisionSignal[]) {
  const accumulator = new Map<string, number>();
  for (const signal of signals) {
    const current = accumulator.get(signal.label) ?? 0;
    accumulator.set(signal.label, Math.max(current, signal.confidence));
  }
  return Array.from(accumulator.entries())
    .map(([label, confidence]) => ({ label, confidence: Number(confidence.toFixed(2)) }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);
}

const mockVisionAnalyzer: VisionAnalyzer = async (input) => {
  if (input.images.length === 0) {
    return {
      provider: 'fallback',
      quality: 'low',
      fallbackUsed: true,
      summary:
        input.locale === 'fr'
          ? 'Aucune image fournie. Analyse visuelle basculée en mode fallback.'
          : 'No image provided. Visual analysis switched to fallback mode.',
      labels: []
    };
  }

  const textSource = normalizeToken(`${input.name ?? ''} ${input.description ?? ''} ${input.categorySlug ?? ''}`);
  const signals: VisionSignal[] = [];

  for (const [categorySlug, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (!textSource.includes(keyword)) continue;
      signals.push({ label: categorySlug, confidence: 0.55 });
      signals.push({ label: keyword, confidence: 0.62 });
    }
  }

  const imageAssessments = input.images.map((image) => assessImageQuality(image, input.locale));
  const averageImageScore = imageAssessments.reduce((sum, entry) => sum + entry.score, 0) / imageAssessments.length;
  const quality = averageImageScore >= 80 ? 'high' : averageImageScore >= 60 ? 'medium' : 'low';
  const fallbackUsed = quality === 'low';

  return {
    provider: fallbackUsed ? 'fallback' : 'mock',
    quality,
    fallbackUsed,
    summary:
      input.locale === 'fr'
        ? `Analyse visuelle mock complétée (${quality}).`
        : `Mock visual analysis completed (${quality}).`,
    labels: mergeSignals(signals)
  };
};

const analyzers: Record<string, VisionAnalyzer> = {
  mock: mockVisionAnalyzer
};

export async function analyzeProductImage(input: VisionAnalysisRequest): Promise<VisionAnalysisResult> {
  const configured = process.env.SHOPREX_VISION_PROVIDER?.trim().toLowerCase() ?? 'mock';
  const analyzer = analyzers[configured] ?? analyzers.mock;
  return analyzer(input);
}

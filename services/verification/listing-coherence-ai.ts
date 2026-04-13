import { categoryKeywords } from '@/db/mock-ai-data';
import { analyzeProductImage } from '@/services/ai/vision-adapter';
import { verifyProductConsistency } from '@/services/verification/product-consistency';
import type {
  ListingCoherenceInput,
  ListingCoherenceResult,
  VerificationStatus,
  VisionAnalysisResult
} from '@/types/marketplace-ai';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function scoreFromVision(
  vision: VisionAnalysisResult,
  expectedCategory: string,
  description: string
) {
  const expectedKeywords = categoryKeywords[expectedCategory] ?? [];
  const descriptionLower = description.toLowerCase();
  const topLabels = vision.labels.map((entry) => entry.label.toLowerCase());

  const keywordOverlap = expectedKeywords.filter(
    (keyword) => descriptionLower.includes(keyword) || topLabels.includes(keyword)
  ).length;
  const categoryHit = topLabels.includes(expectedCategory);

  const imageScoreBase = vision.quality === 'high' ? 88 : vision.quality === 'medium' ? 65 : 35;
  const crossSignalScore = clamp((categoryHit ? 55 : 28) + keywordOverlap * 8, 0, 100);
  return {
    imageScore: imageScoreBase,
    crossSignalScore
  };
}

function mapStatus(score: number): VerificationStatus {
  if (score >= 75) return 'valid';
  if (score >= 45) return 'needs_review';
  return 'suspect';
}

export async function evaluateListingCoherence(input: ListingCoherenceInput): Promise<{
  vision: VisionAnalysisResult;
  coherence: ListingCoherenceResult;
}> {
  const base = verifyProductConsistency(
    {
      name: input.name,
      categorySlug: input.categorySlug,
      description: input.description,
      images: input.images
    },
    input.locale
  );

  const vision = await analyzeProductImage({
    images: input.images,
    name: input.name,
    categorySlug: input.categorySlug,
    description: input.description,
    locale: input.locale
  });

  const { imageScore, crossSignalScore } = scoreFromVision(
    vision,
    input.categorySlug,
    input.description ?? ''
  );

  const finalScore = clamp(
    Math.round(base.score * 0.5 + imageScore * 0.25 + crossSignalScore * 0.25),
    0,
    100
  );
  const status = mapStatus(finalScore);
  const confidence = finalScore >= 75 ? 'high' : finalScore >= 45 ? 'medium' : 'low';

  const alerts = [...base.alerts];
  const recommendations = [...base.recommendations];

  if (vision.quality === 'low') {
    alerts.push(
      input.locale === 'fr'
        ? 'Qualite d image faible ou douteuse pour la verification.'
        : 'Image quality appears low or unreliable for verification.'
    );
  }

  if (crossSignalScore < 45) {
    alerts.push(
      input.locale === 'fr'
        ? 'Signal visuel et categorie peu alignes.'
        : 'Visual signal and selected category are weakly aligned.'
    );
    recommendations.push(
      input.locale === 'fr'
        ? 'Ajoute des images plus explicites et adapte la description a la categorie.'
        : 'Add clearer images and align the description with the selected category.'
    );
  }

  return {
    vision,
    coherence: {
      score: finalScore,
      status,
      confidence,
      alerts,
      recommendations,
      breakdown: {
        textScore: base.score,
        imageScore,
        crossSignalScore
      }
    }
  };
}

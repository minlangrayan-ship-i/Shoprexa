import { categoryKeywords, vagueWords } from '@/db/mock-ai-data';
import { assessImageQuality } from '@/lib/image-quality';
import type { VerificationRequest, VerificationResponse } from '@/types/marketplace-ai';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function verifyProductConsistency(input: VerificationRequest, locale: 'fr' | 'en'): VerificationResponse {
  let score = 55;
  const alerts: string[] = [];
  const recommendations: string[] = [];

  const name = input.name.toLowerCase().trim();
  const description = (input.description ?? '').toLowerCase();
  const expectedKeywords = categoryKeywords[input.categorySlug] ?? [];

  if (name.length < 6) {
    score -= 18;
    alerts.push(locale === 'fr' ? 'Nom trop court ou peu descriptif.' : 'Name is too short or vague.');
  }

  if (vagueWords.some((word) => name.includes(word))) {
    score -= 12;
    alerts.push(locale === 'fr' ? 'Nom potentiellement trompeur.' : 'Potentially misleading name.');
  }

  const keywordHits = expectedKeywords.filter((keyword) => name.includes(keyword) || description.includes(keyword)).length;
  if (keywordHits === 0) {
    score -= 20;
    alerts.push(locale === 'fr' ? 'Catégorie et contenu textuel peu cohérents.' : 'Category and textual content look inconsistent.');
  } else {
    score += Math.min(12, keywordHits * 3);
  }

  if ((input.description ?? '').trim().length < 25) {
    score -= 10;
    recommendations.push(
      locale === 'fr'
        ? 'Ajoutez une description plus détaillée (usage, bénéfice, limites).'
        : 'Add a more detailed description (usage, benefits, limits).'
    );
  }

  if (input.images.length === 0) {
    score -= 20;
    alerts.push(locale === 'fr' ? 'Aucune image fournie.' : 'No image provided.');
  } else {
    const imageAssessments = input.images.map((image) => assessImageQuality(image, locale));
    const averageImageScore = imageAssessments.reduce((sum, entry) => sum + entry.score, 0) / imageAssessments.length;

    if (averageImageScore < 60) {
      score -= 18;
      alerts.push(
        locale === 'fr'
          ? 'Qualité d’image insuffisante pour inspirer confiance.'
          : 'Image quality is too low to build trust.'
      );
    } else if (averageImageScore >= 80) {
      score += 10;
    } else {
      score += 4;
    }

    for (const assessment of imageAssessments) {
      for (const reason of assessment.reasons) {
        if (!alerts.includes(reason)) alerts.push(reason);
      }
    }
  }

  const normalizedScore = clamp(Math.round(score), 0, 100);
  const status = normalizedScore >= 75 ? 'valid' : normalizedScore >= 45 ? 'needs_review' : 'suspect';
  const confidence = normalizedScore >= 75 ? 'high' : normalizedScore >= 45 ? 'medium' : 'low';

  if (status !== 'valid') {
    recommendations.push(
      locale === 'fr'
        ? 'Ajoutez une image nette et un titre plus spécifique pour augmenter la confiance client.'
        : 'Add a clear image and a more specific title to increase buyer trust.'
    );
  }

  return {
    score: normalizedScore,
    confidence,
    status,
    alerts,
    recommendations
  };
}

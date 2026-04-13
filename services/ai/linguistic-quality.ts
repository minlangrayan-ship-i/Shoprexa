import type { Locale } from '@/types/marketplace-ai';

export type LinguisticQualityResult = {
  score: number;
  alerts: string[];
  detectedLanguage: 'fr' | 'en' | 'mixed';
  typoCount: number;
};

const brokenEncodingPattern = /Ãƒ|Ã¢â‚¬â„¢|Ã¢â‚¬Å“|Ã¢â‚¬|ï¿½/;
const suspiciousFragments = ['lorem ipsum', 'test test', 'xxx', 'pas encore', 'to do', 'coming soon', 'n/a'];

const frenchMarkers = [' le ', ' la ', ' les ', ' des ', ' pour ', ' avec ', ' service ', ' produit '];
const englishMarkers = [' the ', ' and ', ' with ', ' service ', ' product ', ' delivery ', ' for '];

const typoPatterns = [
  /\bteh\b/gi,
  /\brecieve\b/gi,
  /\badress\b/gi,
  /\bcommende\b/gi,
  /\bproduitss\b/gi,
  /\bservicess\b/gi,
  /\bdisponibilitee\b/gi,
  /\bentreprize\b/gi
];

function normalizeText(content: string) {
  return ` ${content.toLowerCase().replace(/\s+/g, ' ').trim()} `;
}

function detectLanguage(content: string) {
  const normalized = normalizeText(content);
  const frenchScore = frenchMarkers.reduce((sum, marker) => sum + (normalized.includes(marker) ? 1 : 0), 0);
  const englishScore = englishMarkers.reduce((sum, marker) => sum + (normalized.includes(marker) ? 1 : 0), 0);

  if (frenchScore > 0 && englishScore > 0) return 'mixed';
  return englishScore > frenchScore ? 'en' : 'fr';
}

function countTypos(content: string) {
  return typoPatterns.reduce((count, pattern) => count + (content.match(pattern)?.length ?? 0), 0);
}

export function assessLinguisticQuality(content: string, locale: Locale): LinguisticQualityResult {
  const alerts: string[] = [];
  let score = 100;
  const normalized = normalizeText(content);
  const typoCount = countTypos(content);
  const detectedLanguage = detectLanguage(content);

  if (brokenEncodingPattern.test(content)) {
    alerts.push(
      locale === 'fr'
        ? 'Le texte contient des caracteres mal encodes.'
        : 'The text contains broken encoded characters.'
    );
    score -= 35;
  }

  const suspiciousCount = suspiciousFragments.reduce(
    (count, fragment) => count + (normalized.includes(` ${fragment} `) ? 1 : 0),
    0
  );
  if (suspiciousCount > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Le texte contient des formulations provisoires ou peu professionnelles.'
        : 'The text contains provisional or weak wording.'
    );
    score -= suspiciousCount * 8;
  }

  if (typoCount > 0) {
    alerts.push(
      locale === 'fr'
        ? 'Des fautes detectables en francais ou en anglais ont ete relevees.'
        : 'Detectable French or English mistakes were found.'
    );
    score -= Math.min(28, typoCount * 6);
  }

  if (content.trim().length > 0) {
    const uppercaseRatio = content.replace(/[^A-Z]/g, '').length / content.length;
    if (uppercaseRatio > 0.25) {
      alerts.push(
        locale === 'fr'
          ? 'Le texte contient trop de majuscules et semble peu naturel.'
          : 'The text uses too many uppercase letters and feels unnatural.'
      );
      score -= 10;
    }
  }

  if (detectedLanguage === 'mixed' && !normalized.includes('translation') && !normalized.includes('traduction')) {
    alerts.push(
      locale === 'fr'
        ? 'Le texte melange le francais et l anglais sans transition claire.'
        : 'The text mixes French and English without a clear transition.'
    );
    score -= 8;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    alerts,
    detectedLanguage,
    typoCount
  };
}

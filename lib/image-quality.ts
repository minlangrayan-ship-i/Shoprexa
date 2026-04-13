import type { VerificationImageInput } from '@/types/marketplace-ai';

export type UploadedImageAsset = {
  src: string;
  meta: VerificationImageInput;
};

type ImageQualityAssessment = {
  score: number;
  reasons: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toMessage(locale: 'fr' | 'en', fr: string, en: string) {
  return locale === 'fr' ? fr : en;
}

export function getProductImageFitClass(src: string) {
  return src.startsWith('data:image/') ? 'object-contain bg-white p-3' : 'object-cover';
}

export function assessImageQuality(image: VerificationImageInput, locale: 'fr' | 'en'): ImageQualityAssessment {
  let score = 100;
  const reasons: string[] = [];

  if (!image.width || !image.height) {
    score -= 30;
    reasons.push(toMessage(locale, 'Dimensions de l’image inconnues.', 'Image dimensions are unknown.'));
  } else {
    if (image.width < 600 || image.height < 600) {
      score -= 45;
      reasons.push(toMessage(locale, 'Image trop petite. Minimum recommandé : 600x600 px.', 'Image is too small. Recommended minimum: 600x600 px.'));
    }

    const ratio = image.width / image.height;
    if (ratio > 2.4 || ratio < 0.42) {
      score -= 15;
      reasons.push(toMessage(locale, 'Format d’image trop extrême pour un bon affichage produit.', 'Image aspect ratio is too extreme for a product listing.'));
    }
  }

  if (typeof image.sizeKb === 'number') {
    if (image.sizeKb < 80) {
      score -= 25;
      reasons.push(toMessage(locale, 'Fichier trop léger, la qualité risque d’être insuffisante.', 'File is too light, quality may be too low.'));
    }
    if (image.sizeKb > 6000) {
      score -= 10;
      reasons.push(toMessage(locale, 'Image très lourde, pensez à la compresser légèrement.', 'Image is very heavy, consider compressing it slightly.'));
    }
  }

  return {
    score: clamp(score, 0, 100),
    reasons
  };
}

export function validateUploadedImages(images: VerificationImageInput[], locale: 'fr' | 'en') {
  if (images.length === 0) {
    return {
      ok: false,
      message: toMessage(locale, 'Ajoutez au moins une image nette pour publier cette offre.', 'Add at least one clear image to publish this offer.'),
      reasons: [toMessage(locale, 'Aucune image importée.', 'No uploaded image found.')]
    };
  }

  const assessments = images.map((image) => assessImageQuality(image, locale));
  const failing = assessments.filter((entry) => entry.score < 60);

  if (failing.length > 0) {
    const reasons = failing.flatMap((entry) => entry.reasons);
    return {
      ok: false,
      message: toMessage(locale, 'Offre non validée : ajoutez une image de meilleure qualité.', 'Offer not validated: upload a better quality image.'),
      reasons
    };
  }

  return {
    ok: true,
    message: '',
    reasons: assessments.flatMap((entry) => entry.reasons)
  };
}

export function fileToImageAsset(file: File): Promise<UploadedImageAsset> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const src = String(reader.result);
      const image = new Image();

      image.onload = () => {
        resolve({
          src,
          meta: {
            src,
            width: image.naturalWidth,
            height: image.naturalHeight,
            sizeKb: Math.round(file.size / 1024),
            mimeType: file.type,
            source: 'upload'
          }
        });
      };

      image.onerror = () => reject(new Error('image_load_failed'));
      image.src = src;
    };

    reader.onerror = () => reject(new Error('file_read_failed'));
    reader.readAsDataURL(file);
  });
}

export type ShopyiaKnowledgeTopic =
  | 'ecommerce_operations'
  | 'digital_marketing'
  | 'copywriting_conversion'
  | 'customer_trust'
  | 'dropshipping'
  | 'conversion'
  | 'security'
  | 'semantic_ai'
  | 'vision_ai';

export type ShopyiaKnowledgeCard = {
  id: string;
  topic: ShopyiaKnowledgeTopic;
  titleFr: string;
  titleEn: string;
  summaryFr: string;
  summaryEn: string;
  tags: string[];
  source: {
    label: string;
    url: string;
  };
};

const SHOPYIA_KNOWLEDGE_BASE: ShopyiaKnowledgeCard[] = [
  {
    id: 'medusa-commerce-modules',
    topic: 'ecommerce_operations',
    titleFr: 'Architecture e-commerce modulaire',
    titleEn: 'Modular e-commerce architecture',
    summaryFr:
      'Medusa decompose la logique commerce en modules (produits, commandes, stock, paiement). C est utile pour evoluer sans casser le coeur metier.',
    summaryEn:
      'Medusa structures commerce logic into modules (products, orders, inventory, payments), which helps scale features without breaking core flows.',
    tags: ['medusa', 'modules', 'orders', 'inventory', 'payments'],
    source: {
      label: 'Medusa Commerce Modules',
      url: 'https://docs.medusajs.com/resources/commerce-modules'
    }
  },
  {
    id: 'saleor-marketplace-patterns',
    topic: 'ecommerce_operations',
    titleFr: 'Pattern marketplace multi-vendeurs',
    titleEn: 'Multi-vendor marketplace pattern',
    summaryFr:
      'Saleor documente des recettes marketplace avec promotions, paiements et shipping personnalisable. Cela inspire les flux vendeurs de Min-shop.',
    summaryEn:
      'Saleor documents marketplace recipes with promotions, payment, and custom shipping that are useful for multi-seller flows.',
    tags: ['saleor', 'marketplace', 'shipping', 'payments'],
    source: {
      label: 'Saleor Docs',
      url: 'https://docs.saleor.io/'
    }
  },
  {
    id: 'odoo-upsell-crosssell',
    topic: 'conversion',
    titleFr: 'Upsell et cross-sell',
    titleEn: 'Upsell and cross-sell',
    summaryFr:
      'Odoo met en avant les options de vente additionnelle (upsell, accessoires, promotions) pour augmenter le panier moyen.',
    summaryEn:
      'Odoo highlights upsell, accessories, and promo flows to increase average order value.',
    tags: ['odoo', 'upsell', 'cross-sell', 'promotions', 'catalog'],
    source: {
      label: 'Odoo eCommerce Docs',
      url: 'https://www.odoo.com/documentation/19.0/applications/websites/ecommerce.html'
    }
  },
  {
    id: 'google-seo-starter-guide',
    topic: 'digital_marketing',
    titleFr: 'SEO pratique pour acquisition organique',
    titleEn: 'Practical SEO for organic acquisition',
    summaryFr:
      'Le guide SEO de Google recommande du contenu utile, lisible, fiable et bien structure. C est une base durable pour attirer du trafic qualifie.',
    summaryEn:
      "Google's SEO starter guide emphasizes useful, readable, reliable, and well-structured content as a durable base for qualified organic traffic.",
    tags: ['seo', 'google search', 'traffic organique', 'acquisition', 'search console'],
    source: {
      label: 'Google SEO Starter Guide',
      url: 'https://developers.google.com/search/docs/fundamentals/seo-starter-guide'
    }
  },
  {
    id: 'mailchimp-writing-principles',
    topic: 'copywriting_conversion',
    titleFr: 'Redaction claire orientee action',
    titleEn: 'Clear action-oriented writing',
    summaryFr:
      'Le guide Mailchimp insiste sur une ecriture claire, concise et utile. Des titres explicites et des boutons d action simples augmentent la comprehension et la conversion.',
    summaryEn:
      'Mailchimp style guidance emphasizes clear, concise, useful writing. Explicit headings and simple action buttons increase comprehension and conversion.',
    tags: ['copywriting', 'contenu', 'cta', 'clarte', 'redaction', 'marketing digital'],
    source: {
      label: 'Mailchimp Content Style Guide',
      url: 'https://styleguide.mailchimp.com/'
    }
  },
  {
    id: 'mailchimp-accessible-web-copy',
    topic: 'copywriting_conversion',
    titleFr: 'Contenu accessible qui convertit',
    titleEn: 'Accessible content that converts',
    summaryFr:
      'Structurer les pages avec hierarchy d information, phrases courtes et liens explicites aide les utilisateurs a passer a l action.',
    summaryEn:
      'Structuring pages with information hierarchy, short sentences, and explicit links helps users move to action.',
    tags: ['accessibilite', 'ux writing', 'structure', 'conversion', 'landing page'],
    source: {
      label: 'Mailchimp TLDR Writing Principles',
      url: 'https://styleguide.mailchimp.com/tldr/'
    }
  },
  {
    id: 'cro-foundation-wikipedia',
    topic: 'conversion',
    titleFr: 'CRO: amelioration continue des conversions',
    titleEn: 'CRO: continuous conversion improvement',
    summaryFr:
      'Le CRO est un processus systematique: mesurer, tester, corriger les frictions, puis iterer pour augmenter la part de visiteurs qui convertissent.',
    summaryEn:
      'CRO is a systematic process: measure, test, remove friction, then iterate to increase the share of visitors who convert.',
    tags: ['cro', 'conversion rate optimization', 'funnel', 'friction', 'landing page'],
    source: {
      label: 'Wikipedia Conversion Rate Optimization',
      url: 'https://en.wikipedia.org/wiki/Conversion_rate_optimization'
    }
  },
  {
    id: 'ab-testing-method',
    topic: 'conversion',
    titleFr: 'A B testing pour valider les hypotheses',
    titleEn: 'A/B testing to validate hypotheses',
    summaryFr:
      'Le test A/B compare deux variantes pour identifier celle qui performe le mieux. C est utile pour les titres, CTA, visuels et parcours checkout.',
    summaryEn:
      'A/B testing compares two variants to identify the higher performer. It is useful for headlines, CTAs, visuals, and checkout flows.',
    tags: ['a/b testing', 'split test', 'experimentation', 'cta', 'checkout'],
    source: {
      label: 'Wikipedia A/B Testing',
      url: 'https://en.wikipedia.org/wiki/A/B_testing'
    }
  },
  {
    id: 'mautic-segmentation-campaigns',
    topic: 'digital_marketing',
    titleFr: 'Segmentation et campagnes automatisees',
    titleEn: 'Segmentation and automated campaigns',
    summaryFr:
      'Mautic montre comment segmenter les contacts et declencher des campagnes selon comportement et profil, ce qui augmente la pertinence marketing.',
    summaryEn:
      'Mautic shows how to segment contacts and trigger campaigns by behavior and profile, improving marketing relevance.',
    tags: ['mautic', 'segmentation', 'campaigns', 'automation', 'lead nurturing'],
    source: {
      label: 'Mautic Segments',
      url: 'https://docs.mautic.org/en/5.x/segments/manage_segments.html'
    }
  },
  {
    id: 'mautic-forms-lead-capture',
    topic: 'digital_marketing',
    titleFr: 'Formulaires et capture de leads',
    titleEn: 'Forms and lead capture',
    summaryFr:
      'Les formulaires (campagne ou standalone) permettent de transformer des visiteurs anonymes en contacts qualifies avec progressive profiling.',
    summaryEn:
      'Forms (campaign or standalone) turn anonymous visitors into qualified contacts with progressive profiling.',
    tags: ['lead generation', 'forms', 'progressive profiling', 'marketing automation'],
    source: {
      label: 'Mautic Forms',
      url: 'https://docs.mautic.org/en/4.x/components/forms.html'
    }
  },
  {
    id: 'matomo-funnel-analysis',
    topic: 'digital_marketing',
    titleFr: 'Analyse funnel pour trouver les pertes',
    titleEn: 'Funnel analysis to find drop-offs',
    summaryFr:
      'Matomo Funnels aide a identifier les etapes ou les visiteurs abandonnent. Cela permet de prioriser les optimisations qui ont le plus d impact business.',
    summaryEn:
      'Matomo Funnels helps identify where visitors drop off. This helps prioritize optimizations with the highest business impact.',
    tags: ['matomo', 'funnel', 'drop-off', 'analytics', 'conversion'],
    source: {
      label: 'Matomo Funnels Guide',
      url: 'https://matomo.org/docs/funnels/'
    }
  },
  {
    id: 'posthog-funnel-loop',
    topic: 'digital_marketing',
    titleFr: 'Boucle test produit marketing',
    titleEn: 'Product-marketing test loop',
    summaryFr:
      'PostHog met en avant les funnels, heatmaps et replay pour relier acquisition, parcours et conversion dans un meme cycle d experimentation.',
    summaryEn:
      'PostHog highlights funnels, heatmaps, and replay to connect acquisition, journey, and conversion in a single experimentation loop.',
    tags: ['posthog', 'funnels', 'heatmaps', 'session replay', 'experiments'],
    source: {
      label: 'PostHog Platform',
      url: 'https://posthog.com/'
    }
  },
  {
    id: 'ftc-online-shopping-trust',
    topic: 'customer_trust',
    titleFr: 'Confiance client et achats en ligne',
    titleEn: 'Customer trust in online shopping',
    summaryFr:
      'La FTC recommande: verifier le vendeur, lire les politiques retour/livraison, conserver les preuves d achat et examiner les frais totaux avant paiement.',
    summaryEn:
      'FTC guidance: verify sellers, review return/shipping policies, keep purchase records, and check full costs before payment.',
    tags: ['trust', 'returns', 'delivery', 'fees', 'reviews'],
    source: {
      label: 'FTC Online Shopping',
      url: 'https://consumer.ftc.gov/online-shopping'
    }
  },
  {
    id: 'dropshipping-definition-risks',
    topic: 'dropshipping',
    titleFr: 'Dropshipping: avantages et limites',
    titleEn: 'Dropshipping: benefits and limits',
    summaryFr:
      'Le dropshipping reduit le stock initial mais donne moins de controle sur qualite, delais et marge. Une verification fournisseur forte est critique.',
    summaryEn:
      'Dropshipping lowers upfront inventory needs but reduces control over quality, shipping time, and margins. Supplier vetting is critical.',
    tags: ['dropshipping', 'supplier', 'margin', 'quality', 'delivery'],
    source: {
      label: 'Wikipedia Dropshipping',
      url: 'https://en.wikipedia.org/wiki/Dropshipping'
    }
  },
  {
    id: 'consumer-behavior-factors',
    topic: 'customer_trust',
    titleFr: 'Facteurs de comportement client',
    titleEn: 'Customer behavior factors',
    summaryFr:
      'Le comportement client depend du besoin, du risque percu, de la confiance, du prix et de l information disponible (avis, comparaison, preuve sociale).',
    summaryEn:
      'Customer behavior is shaped by need, perceived risk, trust, price sensitivity, and available information such as reviews and social proof.',
    tags: ['consumer behavior', 'trust', 'social proof', 'price'],
    source: {
      label: 'Wikipedia Consumer Behaviour',
      url: 'https://en.wikipedia.org/wiki/Consumer_behaviour'
    }
  },
  {
    id: 'owasp-auth-protection',
    topic: 'security',
    titleFr: 'Protection des comptes et sessions',
    titleEn: 'Account and session protection',
    summaryFr:
      'OWASP recommande TLS partout, messages d erreur generiques, protection anti-bruteforce et surveillance des evenements d authentification.',
    summaryEn:
      'OWASP recommends full TLS, generic auth error messages, anti-bruteforce controls, and monitoring of authentication events.',
    tags: ['owasp', 'authentication', 'session', 'security'],
    source: {
      label: 'OWASP Authentication Cheat Sheet',
      url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'
    }
  },
  {
    id: 'semantic-search-foundation',
    topic: 'semantic_ai',
    titleFr: 'Recherche semantique pour Shopyia',
    titleEn: 'Semantic search foundation for Shopyia',
    summaryFr:
      'Sentence Transformers + vecteurs permettent de trouver des produits par intention (synonymes, fautes, formulation naturelle) plutot que mots exacts.',
    summaryEn:
      'Sentence Transformers plus vector retrieval can match products by intent (synonyms, misspellings, natural language), not just exact keywords.',
    tags: ['semantic search', 'embeddings', 'retrieval', 'ai'],
    source: {
      label: 'Sentence Transformers Semantic Search',
      url: 'https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html'
    }
  },
  {
    id: 'qdrant-production-retrieval',
    topic: 'semantic_ai',
    titleFr: 'Index vectoriel evolutif',
    titleEn: 'Scalable vector index',
    summaryFr:
      'Qdrant fournit recherche vectorielle, filtres metadata et mode hybride. C est adapte pour faire evoluer Shopyia vers une recherche production.',
    summaryEn:
      'Qdrant provides vector search, metadata filters, and hybrid retrieval, which fits production-scale evolution for Shopyia.',
    tags: ['qdrant', 'vector search', 'metadata', 'hybrid search'],
    source: {
      label: 'Qdrant Search Docs',
      url: 'https://qdrant.tech/documentation/search/'
    }
  },
  {
    id: 'recbole-recommendation',
    topic: 'semantic_ai',
    titleFr: 'Recommandation open source',
    titleEn: 'Open-source recommendation',
    summaryFr:
      'RecBole fournit un socle open source pour experimenter des algorithmes de recommandation et protocoles d evaluation standardises.',
    summaryEn:
      'RecBole provides an open-source base to test recommendation algorithms with standardized evaluation protocols.',
    tags: ['recommendation', 'recbole', 'ranking', 'evaluation'],
    source: {
      label: 'RecBole',
      url: 'https://recbole.io/'
    }
  },
  {
    id: 'opencv-image-processing',
    topic: 'vision_ai',
    titleFr: 'Pretraitement image OpenCV pour qualite listing',
    titleEn: 'OpenCV image preprocessing for listing quality',
    summaryFr:
      'OpenCV fournit des briques robustes (nettete, contraste, reduction du bruit, detection de contours) utiles pour filtrer les images produits floues ou peu lisibles.',
    summaryEn:
      'OpenCV provides robust building blocks (sharpness, contrast, denoising, edge detection) to filter blurry or low-readability product images.',
    tags: ['opencv', 'image quality', 'blur detection', 'sharpness', 'preprocessing'],
    source: {
      label: 'OpenCV Image Processing Tutorials',
      url: 'https://docs.opencv.org/master/d2/d96/tutorial_py_table_of_contents_imgproc.html'
    }
  },
  {
    id: 'yolo-object-detection',
    topic: 'vision_ai',
    titleFr: 'Detection d objets open source (YOLO)',
    titleEn: 'Open-source object detection (YOLO)',
    summaryFr:
      'Ultralytics YOLO permet de detecter rapidement des objets produits dans une image pour comparer avec nom, categorie et description.',
    summaryEn:
      'Ultralytics YOLO enables fast object detection in product images to compare against listing name, category, and description.',
    tags: ['yolo', 'object detection', 'catalog moderation', 'product coherence'],
    source: {
      label: 'Ultralytics YOLO Docs',
      url: 'https://docs.ultralytics.com/'
    }
  },
  {
    id: 'detectron2-model-zoo',
    topic: 'vision_ai',
    titleFr: 'Pipeline vision extensible avec Detectron2',
    titleEn: 'Extensible vision pipeline with Detectron2',
    summaryFr:
      'Detectron2 donne un acces direct a des modeles pre-entraines (detection, segmentation) pour enrichir un controle anti-fraude produit.',
    summaryEn:
      'Detectron2 gives direct access to pre-trained models (detection, segmentation) to extend anti-fraud product checks.',
    tags: ['detectron2', 'model zoo', 'segmentation', 'detection', 'moderation'],
    source: {
      label: 'Detectron2 Model Zoo',
      url: 'https://detectron2.readthedocs.io/en/v0.6/modules/model_zoo.html'
    }
  },
  {
    id: 'clip-image-text-alignment',
    topic: 'vision_ai',
    titleFr: 'Alignement image-texte avec CLIP',
    titleEn: 'Image-text alignment with CLIP',
    summaryFr:
      'CLIP est utile pour estimer si une image correspond vraiment au texte d une annonce (titre, categorie, promesse produit).',
    summaryEn:
      'CLIP is useful to estimate whether an image truly matches listing text (title, category, product claim).',
    tags: ['clip', 'image text', 'coherence score', 'zero-shot', 'semantic matching'],
    source: {
      label: 'OpenAI CLIP',
      url: 'https://github.com/openai/CLIP'
    }
  },
  {
    id: 'segment-anything-sam',
    topic: 'vision_ai',
    titleFr: 'Segmentation produit avec Segment Anything',
    titleEn: 'Product segmentation with Segment Anything',
    summaryFr:
      'SAM permet d isoler les objets dans une image pour ameliorer la verification visuelle (produit central visible, arriere-plan, coherence).',
    summaryEn:
      'SAM can isolate objects in an image to improve visual checks (main product visibility, background noise, coherence).',
    tags: ['sam', 'segment anything', 'product image', 'visual validation'],
    source: {
      label: 'Segment Anything',
      url: 'https://github.com/facebookresearch/segment-anything'
    }
  }
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function expandMessageForScoring(message: string) {
  const normalized = normalize(message);
  const additions: string[] = [];

  const expansions: Array<{ terms: string[]; add: string[] }> = [
    {
      terms: ['marketing digital', 'digital marketing', 'marketing en ligne'],
      add: ['acquisition', 'seo', 'funnel', 'conversion', 'segmentation']
    },
    {
      terms: ['redaction', 'rédaction', 'copywriting', 'contenu', 'content'],
      add: ['cta', 'clarte', 'landing page', 'conversion', 'accessibilite']
    },
    {
      terms: ['conversion', 'convertir', 'panier', 'checkout'],
      add: ['cro', 'ab testing', 'funnel', 'friction', 'analytics']
    },
    {
      terms: ['seo', 'google', 'referencement', 'référencement'],
      add: ['search console', 'organic traffic', 'intent', 'keywords']
    },
    {
      terms: ['image', 'photo', 'visuel', 'coherence produit', 'cohérence produit', 'verification image', 'reconnaissance image'],
      add: ['opencv', 'yolo', 'clip', 'detectron2', 'segment anything', 'image quality', 'coherence score']
    }
  ];

  for (const entry of expansions) {
    if (entry.terms.some((term) => normalized.includes(normalize(term)))) {
      additions.push(...entry.add);
    }
  }

  if (!additions.length) return message;
  return `${message} ${additions.join(' ')}`;
}

function scoreCard(message: string, card: ShopyiaKnowledgeCard) {
  const text = normalize(expandMessageForScoring(message));
  let score = 0;

  for (const tag of card.tags) {
    const tagNorm = normalize(tag);
    if (text.includes(tagNorm)) score += 3;
  }

  const titleNorm = normalize(`${card.titleFr} ${card.titleEn}`);
  if (titleNorm.split(' ').some((token) => token.length > 3 && text.includes(token))) score += 2;

  const summaryNorm = normalize(`${card.summaryFr} ${card.summaryEn}`);
  if (summaryNorm.split(' ').some((token) => token.length > 4 && text.includes(token))) score += 1;

  return score;
}

export function retrieveShopyiaKnowledge(message: string, max = 3) {
  return SHOPYIA_KNOWLEDGE_BASE
    .map((card) => ({ card, score: scoreCard(message, card) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, Math.min(5, max)));
}

export function buildKnowledgeAnswer(locale: 'fr' | 'en', message: string) {
  const ranked = retrieveShopyiaKnowledge(message, 3);
  if (!ranked.length) return null;

  const lines = ranked.map((entry, index) => {
    const card = entry.card;
    const title = locale === 'fr' ? card.titleFr : card.titleEn;
    const summary = locale === 'fr' ? card.summaryFr : card.summaryEn;
    return `${index + 1}. ${title}: ${summary}`;
  });

  const sourceLine =
    locale === 'fr'
      ? `Sources: ${ranked.map((entry) => entry.card.source.url).join(' | ')}`
      : `Sources: ${ranked.map((entry) => entry.card.source.url).join(' | ')}`;

  const header =
    locale === 'fr'
      ? 'Voici les points cles issus de references ouvertes pertinentes:'
      : 'Here are key points from relevant open references:';

  return {
    text: `${header}\n${lines.join('\n')}\n${sourceLine}`,
    sources: ranked.map((entry) => entry.card.source)
  };
}

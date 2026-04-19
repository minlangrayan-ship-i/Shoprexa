export type Locale = 'fr' | 'en';

export type AssistantIntent =
  | 'product_search'
  | 'product_compare'
  | 'faq_delivery'
  | 'faq_payment'
  | 'faq_returns'
  | 'general_help';

export type AssistantMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type ProductLite = {
  id: string;
  slug: string;
  name: string;
  sellerId: string;
  price: number;
  category: string;
  categorySlug: string;
  city: string;
  country: string;
  companyName: string;
  stock: number;
  image: string;
  averageRating: number;
  kind: 'product' | 'service';
};

export type ChatAssistantInput = {
  message: string;
  locale: Locale;
  country: string;
  city: string;
  history: AssistantMessage[];
  isGuest?: boolean;
};

export type ChatAssistantOutput = {
  intent: AssistantIntent;
  answer: string;
  suggestions: ProductLite[];
  fallbackUsed: boolean;
};

export type ProductSheetRequest = {
  name: string;
  categorySlug: string;
  price?: number;
  specs?: string;
  benefits?: string;
  condition?: string;
  salesZone?: string;
  kind: 'product' | 'service';
  draft?: string;
};

export type ProductSheetResult = {
  optimizedTitle: string;
  polishedDescription: string;
  sellingPoints: string[];
  salesArguments: string[];
  missingFields: string[];
  cautionNotes: string[];
};

export type RecommendationRequest = {
  country: string;
  city?: string;
  productId?: string;
  budget?: number;
  viewedCategorySlug?: string;
  followedSellerIds?: string[];
};

export type RecommendationBlock = {
  key: 'similar' | 'popular' | 'complementary' | 'regional';
  title: string;
  items: ProductLite[];
};

export type RecommendationResponse = {
  blocks: RecommendationBlock[];
};

export type VerificationImageInput = {
  src: string;
  width?: number;
  height?: number;
  sizeKb?: number;
  mimeType?: string;
  source?: 'upload' | 'catalog';
};

export type VerificationRequest = {
  name: string;
  categorySlug: string;
  description?: string;
  images: VerificationImageInput[];
};

export type VerificationStatus = 'valid' | 'needs_review' | 'suspect';

export type VerificationResponse = {
  score: number;
  confidence: 'high' | 'medium' | 'low';
  status: VerificationStatus;
  alerts: string[];
  recommendations: string[];
};

export type DeliveryEstimateRequest = {
  sellerCountry: string;
  sellerCity: string;
  clientCountry: string;
  clientCity: string;
  stock: number;
  kind: 'product' | 'service';
  priority?: 'standard' | 'express';
};

export type DeliveryEstimateResponse = {
  transport: 'Moto' | 'Voiture' | 'Camion' | 'Avion';
  delayLabel: string;
  etaMinHours: number;
  etaMaxHours: number;
  reliability: 'high' | 'medium' | 'low';
  explanation: string;
};

export type AiHealthModuleMetrics = {
  route: string;
  requests: number;
  fallbacks: number;
  errors: number;
  fallbackRate: number;
  errorRate: number;
  lastRequestAt: string | null;
};

export type AiHealthWindow = 'today' | '7d' | '30d';

export type AiHealthWindowSnapshot = {
  window: AiHealthWindow;
  totalRequests: number;
  totalFallbacks: number;
  totalErrors: number;
  fallbackRate: number;
  errorRate: number;
  modules: AiHealthModuleMetrics[];
  events: {
    recommendationClicks: number;
  };
};

export type AiHealthAlertLevel = 'info' | 'warning' | 'critical';

export type AiHealthAlert = {
  id: string;
  level: AiHealthAlertLevel;
  message: string;
  metric: string;
  value: number;
  threshold: number;
};

export type AiHealthSnapshot = {
  totalRequests: number;
  totalFallbacks: number;
  totalErrors: number;
  fallbackRate: number;
  errorRate: number;
  modules: AiHealthModuleMetrics[];
  events: {
    recommendationClicks: number;
  };
  windows: Record<AiHealthWindow, AiHealthWindowSnapshot>;
};

export type VisionProvider = 'mock' | 'fallback';

export type VisionQuality = 'high' | 'medium' | 'low';

export type VisionSignal = {
  label: string;
  confidence: number;
};

export type VisionAnalysisRequest = {
  images: VerificationImageInput[];
  name?: string;
  categorySlug?: string;
  description?: string;
  locale: Locale;
};

export type VisionAnalysisResult = {
  provider: VisionProvider;
  quality: VisionQuality;
  fallbackUsed: boolean;
  summary: string;
  labels: VisionSignal[];
};

export type ListingCoherenceInput = {
  name: string;
  categorySlug: string;
  description?: string;
  images: VerificationImageInput[];
  locale: Locale;
};

export type ListingCoherenceResult = {
  score: number;
  status: VerificationStatus;
  confidence: 'high' | 'medium' | 'low';
  alerts: string[];
  recommendations: string[];
  breakdown: {
    textScore: number;
    imageScore: number;
    crossSignalScore: number;
  };
};

export type QueryIntent = 'find_product' | 'compare_products' | 'delivery_question' | 'general_help';

export type ParsedUserQuery = {
  raw: string;
  intent: QueryIntent;
  categorySlug: string | null;
  budgetMax: number | null;
  country: string | null;
  city: string | null;
  needs: string[];
  tokens: string[];
};

export type RankedCatalogProduct = {
  product: ProductLite;
  matchScore: number;
  coherenceScore: number;
  finalScore: number;
  reasons: string[];
};

export type GroundedAnswer = {
  text: string;
  usedProductIds: string[];
};

export type ListingIntelligenceRequest = {
  locale: Locale;
  country: string;
  city: string;
  userQuery: string;
  listing: {
    name: string;
    categorySlug: string;
    description?: string;
    images: VerificationImageInput[];
  };
  maxResults?: number;
};

export type ListingIntelligenceResponse = {
  vision: VisionAnalysisResult;
  coherence: ListingCoherenceResult;
  query: ParsedUserQuery;
  results: RankedCatalogProduct[];
  answer: GroundedAnswer;
  fallbackUsed: boolean;
};

export type AiBaseModel = 'llama3' | 'mistral_7b';
export type AiOrchestrationFramework = 'langchain' | 'llamaindex';
export type AiOutputFormat = 'structured_json' | 'assistant_text';

export type AiLabConfig = {
  baseModel: AiBaseModel;
  orchestration: AiOrchestrationFramework;
  outputFormat: AiOutputFormat;
  separateSources: boolean;
  lastUpdatedAt: string;
};

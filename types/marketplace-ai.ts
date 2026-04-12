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
};

export type RecommendationBlock = {
  key: 'similar' | 'popular' | 'complementary' | 'regional';
  title: string;
  items: ProductLite[];
};

export type RecommendationResponse = {
  blocks: RecommendationBlock[];
};

export type VerificationRequest = {
  name: string;
  categorySlug: string;
  description?: string;
  imageUrls: string[];
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

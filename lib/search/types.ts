export type SemanticProductRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags?: string[];
  price?: number;
  stock?: number;
  sellerCountry?: string | null;
  sellerCity?: string | null;
  listingCoherenceScore?: number;
};

export type SemanticSearchResult = {
  product: SemanticProductRecord;
  semanticScore: number;
  fallbackScore: number;
  finalScore: number;
  reason: string;
};


export type ListingBusinessSignals = {
  productId: string;
  trustScore: number;
  trustStatus: 'valid' | 'needs_review' | 'suspect';
  clicks: number;
  orders: number;
  complaints: number;
  returns: number;
};

export type ListingBusinessBridgeRecord = {
  productId: string;
  trust: {
    score: number;
    status: 'valid' | 'needs_review' | 'suspect';
  };
  performance: {
    clicks: number;
    orders: number;
    complaints: number;
    returns: number;
  };
};

export type ListingBusinessBridgeSnapshot = {
  generatedAt: string;
  records: ListingBusinessBridgeRecord[];
};

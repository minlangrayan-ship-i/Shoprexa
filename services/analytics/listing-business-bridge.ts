import type { ListingBusinessBridgeSnapshot, ListingBusinessSignals } from '@/types/listing-business';

// This bridge prepares a unified shape to correlate trust and business signals.
// Current implementation is intentionally lightweight and mock-friendly.
export function buildListingBusinessBridge(signals: ListingBusinessSignals[]): ListingBusinessBridgeSnapshot {
  return {
    generatedAt: new Date().toISOString(),
    records: signals.map((signal) => ({
      productId: signal.productId,
      trust: {
        score: signal.trustScore,
        status: signal.trustStatus
      },
      performance: {
        clicks: signal.clicks,
        orders: signal.orders,
        complaints: signal.complaints,
        returns: signal.returns
      }
    }))
  };
}

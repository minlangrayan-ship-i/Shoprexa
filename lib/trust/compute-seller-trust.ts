import { prisma } from '@/lib/prisma';

export type SellerTrustBreakdown = {
  identityVerified: number;
  locationCompleted: number;
  listingQuality: number;
  successfulOrders: number;
  customerScore: number;
  disputePenalty: number;
};

export type SellerTrustResult = {
  sellerId: string;
  score: number;
  badge: boolean;
  breakdown: SellerTrustBreakdown;
  meta: {
    successfulOrders: number;
    totalOrders: number;
    disputeRate: number;
    avgListingCoherence: number;
  };
};

export async function computeSellerTrustScore(sellerId: string): Promise<SellerTrustResult> {
  const seller = await prisma.seller.findUnique({
    where: { id: sellerId },
    include: {
      products: {
        select: {
          id: true,
          images: true,
          listingCoherenceScore: true
        }
      }
    }
  });

  if (!seller) {
    throw new Error('seller_not_found');
  }

  const orderItems = await prisma.orderItem.findMany({
    where: { product: { sellerId } },
    include: { order: { select: { status: true } } }
  });

  const totalOrders = orderItems.length;
  const successfulOrders = orderItems.filter((item) => item.order.status === 'DELIVERED' || item.order.status === 'PAID').length;
  const cancelledOrders = orderItems.filter((item) => item.order.status === 'CANCELLED').length;

  const avgListingCoherence = seller.products.length > 0
    ? seller.products.reduce((acc, product) => acc + product.listingCoherenceScore, 0) / seller.products.length
    : 0;

  const listedWithImagesRatio = seller.products.length > 0
    ? seller.products.filter((product) => product.images.length > 0).length / seller.products.length
    : 0;

  const disputeRate = totalOrders > 0 ? cancelledOrders / totalOrders : 0;

  const breakdown: SellerTrustBreakdown = {
    identityVerified: seller.status === 'ACTIVE' ? 18 : 8,
    locationCompleted: seller.locationVerified && Boolean(seller.address) ? 14 : 4,
    listingQuality: Math.round(((avgListingCoherence / 100) * 14) + listedWithImagesRatio * 6),
    successfulOrders: totalOrders >= 10
      ? Math.min(20, Math.round((successfulOrders / Math.max(totalOrders, 1)) * 20))
      : Math.round((successfulOrders / 10) * 20),
    customerScore: totalOrders > 0 ? Math.min(18, Math.round((successfulOrders / totalOrders) * 18)) : 6,
    disputePenalty: Math.round(disputeRate * 20)
  };

  const score = Math.max(
    0,
    Math.min(
      100,
      breakdown.identityVerified +
        breakdown.locationCompleted +
        breakdown.listingQuality +
        breakdown.successfulOrders +
        breakdown.customerScore -
        breakdown.disputePenalty
    )
  );

  const badge = score >= 75 && successfulOrders >= 10 && seller.locationVerified;

  await prisma.seller.update({
    where: { id: sellerId },
    data: {
      trustScore: score,
      trustBadge: badge
    }
  });

  return {
    sellerId,
    score,
    badge,
    breakdown,
    meta: {
      successfulOrders,
      totalOrders,
      disputeRate: Number((disputeRate * 100).toFixed(1)),
      avgListingCoherence: Number(avgListingCoherence.toFixed(1))
    }
  };
}


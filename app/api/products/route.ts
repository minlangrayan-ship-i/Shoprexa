import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { searchProductsSemantic } from '@/lib/search/semantic-service';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const category = req.nextUrl.searchParams.get('category') ?? '';
  const products = await prisma.product.findMany({
    where: {
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(category ? { category: { slug: category } } : {})
    },
    include: { category: true, seller: true }
  });

  if (q && products.length === 0) {
    const catalog = await prisma.product.findMany({
      where: category ? { category: { slug: category } } : {},
      include: { category: true, seller: true }
    });

    const semantic = searchProductsSemantic(
      q,
      catalog.map((entry) => ({
        id: entry.id,
        name: entry.name,
        description: entry.description,
        category: entry.category.name,
        tags: entry.tags,
        price: Number(entry.price),
        stock: entry.stock,
        sellerCountry: entry.seller?.country,
        sellerCity: entry.seller?.city,
        listingCoherenceScore: entry.listingCoherenceScore
      })),
      20
    );

    return NextResponse.json(semantic.map((entry) => entry.product));
  }

  return NextResponse.json(products);
}

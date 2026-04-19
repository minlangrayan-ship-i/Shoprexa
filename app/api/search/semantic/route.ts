import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { searchProductsSemantic } from '@/lib/search/semantic-service';

const schema = z.object({
  query: z.string().min(2),
  limit: z.number().int().min(1).max(30).default(12),
  country: z.string().optional(),
  city: z.string().optional(),
  maxPrice: z.number().optional()
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    include: {
      category: true,
      seller: true
    }
  });

  const normalizedProducts = products
    .filter((product) => (parsed.data.maxPrice ? Number(product.price) <= parsed.data.maxPrice : true))
    .filter((product) => (parsed.data.country ? product.seller?.country === parsed.data.country : true))
    .filter((product) => (parsed.data.city ? product.seller?.city === parsed.data.city : true))
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category.name,
      tags: product.tags,
      price: Number(product.price),
      stock: product.stock,
      sellerCountry: product.seller?.country,
      sellerCity: product.seller?.city,
      listingCoherenceScore: product.listingCoherenceScore
    }));

  const results = searchProductsSemantic(parsed.data.query, normalizedProducts, parsed.data.limit);

  return NextResponse.json({
    query: parsed.data.query,
    total: results.length,
    results
  });
}


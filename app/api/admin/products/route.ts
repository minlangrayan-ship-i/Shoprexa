import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      price: body.price,
      oldPrice: body.oldPrice,
      stock: body.stock,
      featured: Boolean(body.featured),
      images: body.images ?? [],
      categoryId: body.categoryId
    }
  });
  return NextResponse.json(product, { status: 201 });
}

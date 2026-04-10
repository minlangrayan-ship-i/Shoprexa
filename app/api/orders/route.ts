import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  shippingAddress: z.string().min(5),
  paymentProvider: z.enum(['MOCK', 'FLUTTERWAVE', 'PAYSTACK']),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1), price: z.number().min(1) })).min(1)
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json());
  if (!body.success) return NextResponse.json({ error: body.error.flatten() }, { status: 400 });

  const total = body.data.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const order = await prisma.order.create({
    data: {
      customerName: body.data.customerName,
      customerEmail: body.data.customerEmail,
      customerPhone: body.data.customerPhone,
      shippingAddress: body.data.shippingAddress,
      paymentProvider: body.data.paymentProvider,
      total,
      items: {
        create: body.data.items.map((item) => ({ productId: item.id, quantity: item.quantity, unitPrice: item.price }))
      }
    },
    include: { items: true }
  });

  return NextResponse.json(order, { status: 201 });
}

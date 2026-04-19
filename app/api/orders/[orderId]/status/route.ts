import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireRoles } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  note: z.string().max(280).optional(),
  location: z.string().max(120).optional()
});

export async function PATCH(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const access = requireRoles(request, ['ADMIN', 'SELLER']);
  if (!access.ok) return access.response;

  const { orderId } = await context.params;
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { shipment: true, items: { include: { product: { select: { sellerId: true } } } } }
  });

  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  if (access.session?.role === 'SELLER') {
    const sellerId = access.session.sellerId;
    const belongsToSeller = order.items.some((item) => item.product.sellerId && item.product.sellerId === sellerId);
    if (!belongsToSeller) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const shipment = order.shipment;
  if (!shipment) return NextResponse.json({ error: 'shipment_not_found' }, { status: 404 });

  const updated = await prisma.shipment.update({
    where: { id: shipment.id },
    data: {
      status: parsed.data.status,
      events: {
        create: {
          status: parsed.data.status,
          note: parsed.data.note,
          location: parsed.data.location,
          createdById: access.session?.userId
        }
      }
    },
    include: {
      events: { orderBy: { createdAt: 'asc' } }
    }
  });

  return NextResponse.json({ shipment: updated });
}


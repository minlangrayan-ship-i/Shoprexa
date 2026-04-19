import { NextResponse } from 'next/server';
import { requireRoles } from '@/lib/api-auth';
import { SHIPMENT_FLOW } from '@/lib/shipping';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, context: { params: Promise<{ orderId: string }> }) {
  const access = requireRoles(request, ['ADMIN', 'SELLER', 'CUSTOMER']);
  if (!access.ok) return access.response;

  const { orderId } = await context.params;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      shipment: {
        include: {
          events: { orderBy: { createdAt: 'asc' } }
        }
      }
    }
  });

  if (!order) return NextResponse.json({ error: 'order_not_found' }, { status: 404 });

  const timeline = SHIPMENT_FLOW.map((step) => {
    const matching = order.shipment?.events.find((event) => event.status === step.status) ?? null;
    return {
      status: step.status,
      labelFr: step.labelFr,
      labelEn: step.labelEn,
      reached: Boolean(matching),
      timestamp: matching?.createdAt ?? null,
      note: matching?.note ?? null,
      location: matching?.location ?? null
    };
  });

  return NextResponse.json({
    orderId: order.id,
    reference: order.reference,
    shipment: order.shipment
      ? {
          id: order.shipment.id,
          status: order.shipment.status,
          transportMode: order.shipment.transportMode,
          estimatedMinHours: order.shipment.estimatedMinHours,
          estimatedMaxHours: order.shipment.estimatedMaxHours,
          reliability: order.shipment.reliability,
          estimatedDeliveryAt: order.shipment.estimatedDeliveryAt,
          timeline
        }
      : null
  });
}


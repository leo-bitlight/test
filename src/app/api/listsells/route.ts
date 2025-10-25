import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  const sells = await prisma.sell.findMany({ where: { status: '0' }, orderBy: { id: 'desc' } });

  const orders = address ? await prisma.order.findMany({
    where: {
      OR: [
        { buyer_address: address },
        { sell_address: address },
      ]
    },
    orderBy: { id: 'desc' }
  }) : [];
  return NextResponse.json({ sells, orders });
}

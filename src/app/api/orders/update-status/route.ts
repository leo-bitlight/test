import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { orderId, status } = data;
  if (!orderId || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const order = await prisma.order.update({
    where: { id: parseInt(orderId, 10) },
    data: { status },
  });
  return NextResponse.json(order);
}

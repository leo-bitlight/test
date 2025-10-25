import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { orderId } = data;
  if (!orderId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  //data 删除orderId字段
  const updateData: any = { ...data };
  delete updateData.orderId;
  const order = await prisma.order.update({
    where: { id: parseInt(orderId, 10) },
    data: updateData,
  });
  return NextResponse.json(order);
}

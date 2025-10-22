import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { sellId, assetId, buy_psbt, buy_sign_psbt, payment_id, invoice, buyer_address, status } = data;
  
  console.log(333, data);

  try {
    const order = await prisma.order.create({
      data: {
        sellId,
        assetId,
        buy_psbt,
        buy_sign_psbt,
        payment_id,
        invoice,
        buyer_address,
        status,
      },
    });
    return NextResponse.json(order);
  } catch(e) {
    NextResponse.json({});
    console.log(e);
  }
}

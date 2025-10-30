import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();

  const {
    network,
    sellId,
    assetId,
    assetName,
    precision,
    sellPrice,
    sellAmount,
    buy_psbt,
    invoice,
    buyer_address,
    sell_address,
    txid,
    status,
  } = data;

  try {
    const order = await prisma.order.create({
      data: {
        network,
        sellId,
        assetId,
        assetName,
        precision: parseInt(precision, 10),
        sellPrice,
        sellAmount,
        buy_psbt,
        invoice,
        buyer_address,
        sell_address,
        txid,
        status,
      },
    });
    await prisma.sell.update({
      where: { id: sellId },
      data: { status: '1' },
    });
    return NextResponse.json(order);
  } catch (e) {
    NextResponse.json({});
    console.log(e);
  }
}

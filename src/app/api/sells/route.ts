import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { network, assetId, assetName, precision, sellPrice, sellAmount, sellerAddress } = data;
  if (!network || !assetId || !assetName || !precision || !sellPrice || !sellAmount || !sellerAddress) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const sell = await prisma.sell.create({
    data: {
      network,
      assetId,
      assetName,
      precision: parseInt(precision, 10),
      sellPrice: parseFloat(sellPrice),
      sellAmount: parseInt(sellAmount, 10),
      sellerAddress,
      status: "0"
    },
  });
  return NextResponse.json(sell);
}

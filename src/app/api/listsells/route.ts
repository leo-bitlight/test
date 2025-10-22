import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const arr = await prisma.sell.findMany({ orderBy: { id: 'desc' } });
  return NextResponse.json(arr);
}

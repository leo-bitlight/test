import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json();
  const id = data.id;
  const network = data.network;

  if (!id || !network) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const res = await fetch('https://bitlightlabs.com/api/asset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: id,
        network,
        page: 1,
        per_page: 20
      }),
    });
    return new Response(res.body, {
      status: res.status,
    });
  } catch (e) {
    return new Response((e as Error).message, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const body = await request.text();

  return NextResponse.json({
    received: true,
    message: 'Webhook placeholder. Verify signatures and update subscription status here.',
    hasSignature: Boolean(signature),
    payloadLength: body.length,
  });
}

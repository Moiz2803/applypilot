import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

export async function POST() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  if (!stripeKey) {
    return NextResponse.redirect(new URL('/pricing?checkout=mock', appUrl));
  }

  const stripe = new Stripe(stripeKey, {
    apiVersion: '2025-02-24.acacia',
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'ApplyPilot Pro',
          },
          recurring: {
            interval: 'month',
          },
          unit_amount: 1900,
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/pricing?upgraded=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
  });

  return NextResponse.redirect(session.url ?? `${appUrl}/pricing?checkout=error`);
}

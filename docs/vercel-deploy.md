# Vercel Deployment Guide

## 1. Import Repository

- Create new Vercel project from this repo
- Framework preset: Next.js
- Root directory: `apps/web`

## 2. Build Settings

- Install command: `pnpm install`
- Build command: `pnpm --filter @visa-ats/web build`

`apps/web/vercel.json` is included for defaults.

## 3. Environment Variables

Optional for Stripe test mode:

- `STRIPE_SECRET_KEY=sk_test_...`
- `NEXT_PUBLIC_APP_URL=https://your-domain.example`

Without Stripe key, checkout endpoint uses mock fallback.

## 4. Deploy

- Trigger deployment from Vercel dashboard
- Validate routes:
  - `/`
  - `/dashboard`
  - `/resume`
  - `/ats-checker`
  - `/job-tracker`
  - `/settings`

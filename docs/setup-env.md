# Environment Bootstrap and Verification

This repo includes a safe local setup flow for Supabase + Stripe variables used by `apps/web`.

## Commands

```bash
pnpm setup:env
pnpm check:env
```

## What `pnpm setup:env` does

Runs `.tools/scripts/setup-env.ps1` (interactive PowerShell script):

1. Prompts you for required values (no hardcoded secrets).
2. Writes `apps/web/.env.local` (creates it if missing).
3. Writes repo-root `.env.example` with placeholders only.
4. Verifies `.gitignore` protects local env files (`.env*` or `apps/web/.env.local`).
5. Validates required formats before saving.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL` (must match `https://*.supabase.co`)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (must start with `eyJ`)
- `SUPABASE_SERVICE_ROLE_KEY` (must start with `eyJ`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (must start with `pk_test_` or `pk_live_`)
- `STRIPE_SECRET_KEY` (must start with `sk_test_` or `sk_live_`)
- `STRIPE_PRICE_PRO` (must start with `price_`)
- `STRIPE_PRICE_PRO_PLUS` (must start with `price_`)
- `STRIPE_PRICE_ELITE` (must start with `price_`)
- `NEXT_PUBLIC_APP_URL` (must be `http://localhost:3000` or `https://...`)

Notes:

- Secret values are not printed back in plain text.
- Console confirmation masks all values.

## What `pnpm check:env` does

Runs `.tools/scripts/check-env.mjs`:

1. Reads `apps/web/.env.local`.
2. Validates required keys and formats.
3. Prints a clear PASS/FAIL report with masked values.
4. Exits non-zero on failure.

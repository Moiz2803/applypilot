# ApplyPilot

Smarter applications. Faster offers.

Production-grade local-first SaaS monorepo for job search optimization, ATS matching, assistive autofill, and application analytics.

## Core Product Features

- Job Match Score engine (shared) with:
  - match score
  - success probability
  - competition level
  - seniority fit
  - visa friendliness
  - missing keywords
- ATS + keyword gap analyzer
- Resume tailoring workspace (`/resume-tailor`)
- Interview prep generator (`/interview-prep`)
- Visa radar mock intelligence (`/visa-radar`)
- Job tracker with lifecycle timestamps and funnel analytics
- Chrome copilot extension with portal detection, compatibility badge, assistive autofill, and quick save/applied actions

## Tiers

- Free: 10 scans/month
- Pro: unlimited scans + autofill
- Pro+: resume tailoring + interview prep
- Elite: visa radar + analytics

## Monorepo

- `apps/web` - Next.js App Router app
- `apps/extension` - Chrome extension MV3 side-panel copilot
- `packages/shared` - Scoring, gating, and rewrite engines
- `packages/ui` - Shared UI components

## Compliance and Safety

- Assistive autofill only
- Never auto-submits job applications
- Never fills passwords
- Local-first persistence by default

## Run Locally

```bash
pnpm install
pnpm lint
pnpm test
pnpm -r build
pnpm package:extension
```

Web dev server:

```bash
pnpm --filter @visa-ats/web dev
```

## Extension Local Load

1. `pnpm build:extension`
2. Open `chrome://extensions`
3. Enable Developer Mode
4. Load unpacked from `apps/extension/dist`

## Stripe Test Mode

- If `STRIPE_SECRET_KEY` is missing, checkout redirects to mock pricing state.
- Optional env vars:
  - `STRIPE_SECRET_KEY=sk_test_...`
  - `NEXT_PUBLIC_APP_URL=http://localhost:3000`

## Screenshots (Placeholders)

- `docs/screenshots/web-dashboard.png`
- `docs/screenshots/web-onboarding.png`
- `docs/screenshots/extension-sidepanel.png`

## Branding

- Product: **ApplyPilot**
- Tagline: **Smarter applications. Faster offers.**

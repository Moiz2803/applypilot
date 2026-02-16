# Privacy Policy

## Local-First Default

ApplyPilot stores profile, resume text, usage counters, and job tracker data locally by default.

- Web app: browser local storage via Zustand persistence
- Extension: `chrome.storage.local`

## Data Collected in Local Mode

- Profile fields (name/email/phone/links/location)
- Resume text and parser metadata
- Job descriptions analyzed by user action
- Job tracker records and statuses
- Plan tier and monthly usage counters

## Data Handling Principles

- No automatic job application submission
- No password autofill
- No paid AI API dependency required
- No background scraping behind authentication walls

## Billing Integrations

If Stripe is configured, checkout data is sent to Stripe for payment processing in test/production mode.

## User Control

Users can clear browser storage and extension local storage at any time.

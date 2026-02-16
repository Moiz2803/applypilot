# Security Policy

## Reporting

Report security concerns privately to maintainers with reproducible steps and impact scope.

## Security Controls in Product

- Autofill is assistive only and user-triggered.
- Extension never auto-submits forms.
- Extension explicitly skips password fields.
- Profile/job data is local-first by default.
- Stripe webhook endpoint is placeholder-only until signed verification is configured.

## Hardening Checklist

- Add webhook signature verification before production billing use.
- Add more automated tests for hostile or malformed form structures.
- Add optional encryption-at-rest strategy for local profile cache when needed.

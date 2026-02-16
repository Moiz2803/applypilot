# Chrome Web Store Publishing Guide

## 1. Build and Package

```bash
pnpm install
pnpm build:extension
pnpm package:extension
```

Zip output: `apps/extension/extension.zip`

## 2. Validate Manifest

Required checks:

- Manifest V3 is enabled
- Permissions are limited to `storage`, `activeTab`, `scripting`, `sidePanel`
- No remote code execution

## 3. Store Listing Notes

Use clear language:

- Assistive-only autofill
- Never auto-submits applications
- Never fills passwords

## 4. Manual QA Before Submission

- Load unpacked extension from `apps/extension/dist`
- Open side panel
- Extract job description on sample portals
- Preview and apply autofill only after user click
- Confirm no submit buttons are clicked by extension

## 5. Publish

- Upload zip in Chrome Developer Dashboard
- Fill privacy section consistent with `PRIVACY.md`
- Submit for review

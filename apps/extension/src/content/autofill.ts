import type { CandidateProfile, AutofillFieldPreview } from '../shared/types';

type SupportedElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const fieldMap: Array<{ key: keyof CandidateProfile; aliases: string[] }> = [
  { key: 'firstName', aliases: ['first name', 'given name', 'firstname'] },
  { key: 'lastName', aliases: ['last name', 'surname', 'lastname'] },
  { key: 'email', aliases: ['email', 'e-mail'] },
  { key: 'phone', aliases: ['phone', 'mobile', 'telephone'] },
  { key: 'linkedIn', aliases: ['linkedin', 'linkedin url'] },
  { key: 'website', aliases: ['portfolio', 'website', 'github', 'personal site'] },
  { key: 'city', aliases: ['city', 'location', 'address city'] },
];

function normalizeText(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function escapeCssIdentifier(value: string): string {
  if (globalThis.CSS && typeof globalThis.CSS.escape === 'function') {
    return globalThis.CSS.escape(value);
  }

  return value.replace(/([\\"'])/g, '\\$1');
}

function collectLabelText(input: SupportedElement): string {
  const id = input.getAttribute('id');
  const safeId = id ? escapeCssIdentifier(id) : '';
  const directLabel = safeId ? document.querySelector(`label[for="${safeId}"]`)?.textContent ?? '' : '';
  const parentLabel = input.closest('label')?.textContent ?? '';
  const ariaLabel = input.getAttribute('aria-label') ?? '';
  const placeholder = input.getAttribute('placeholder') ?? '';
  const name = input.getAttribute('name') ?? '';
  const fieldId = input.getAttribute('id') ?? '';

  return normalizeText([directLabel, parentLabel, ariaLabel, placeholder, name, fieldId].filter(Boolean).join(' '));
}

function isSkippable(input: SupportedElement): boolean {
  const asInput = input as HTMLInputElement;
  const type = (asInput.type || '').toLowerCase();

  return type === 'password' || type === 'hidden' || type === 'submit' || type === 'button' || type === 'file';
}

function scoreAliasMatch(labelText: string, aliases: string[]): number {
  if (!labelText) return 0;

  let best = 0;
  for (const alias of aliases) {
    const normalizedAlias = normalizeText(alias);
    if (!normalizedAlias) continue;
    if (labelText.includes(normalizedAlias)) {
      best = Math.max(best, 95);
      continue;
    }

    const labelTokens = new Set(labelText.split(' '));
    const aliasTokens = normalizedAlias.split(' ');
    const matched = aliasTokens.filter((token) => labelTokens.has(token)).length;
    const partial = Math.round((matched / aliasTokens.length) * 80);
    best = Math.max(best, partial);
  }

  return best;
}

function getSelectorHint(input: SupportedElement): string {
  const id = input.getAttribute('id');
  if (id) return `#${id}`;
  const name = input.getAttribute('name');
  if (name) return `[name="${name}"]`;
  const ariaLabel = input.getAttribute('aria-label');
  if (ariaLabel) return `[aria-label="${ariaLabel}"]`;
  return input.tagName.toLowerCase();
}

function detectFieldType(input: SupportedElement): AutofillFieldPreview['fieldType'] {
  if (input.tagName.toLowerCase() === 'textarea') return 'textarea';
  if (input.tagName.toLowerCase() === 'select') return 'select';
  const asInput = input as HTMLInputElement;
  return asInput.type === 'radio' ? 'radio' : 'text';
}

function selectValue(select: HTMLSelectElement, value: string): boolean {
  const target = normalizeText(value);
  const option = [...select.options].find((opt) => normalizeText(opt.value) === target || normalizeText(opt.text) === target);
  if (!option) {
    return false;
  }

  select.value = option.value;
  return true;
}

function setRadioValue(input: HTMLInputElement, value: string): boolean {
  const name = input.name;
  if (!name) return false;

  const radios = [...document.querySelectorAll(`input[type="radio"][name="${escapeCssIdentifier(name)}"]`)] as HTMLInputElement[];
  const target = normalizeText(value);

  const match = radios.find((radio) => {
    const label = collectLabelText(radio);
    return normalizeText(radio.value) === target || label.includes(target);
  });

  if (!match) return false;

  match.checked = true;
  match.dispatchEvent(new Event('input', { bubbles: true }));
  match.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
}

export function buildAutofillPreview(profile: CandidateProfile): AutofillFieldPreview[] {
  const inputs = [...document.querySelectorAll('input, textarea, select')] as SupportedElement[];
  const previews: AutofillFieldPreview[] = [];

  for (const input of inputs) {
    if (isSkippable(input) || input.disabled || input.hasAttribute('readonly')) {
      continue;
    }

    const labelText = collectLabelText(input);
    if (!labelText) {
      continue;
    }

    let bestMatch: { key: keyof CandidateProfile; confidence: number } | null = null;
    for (const mapping of fieldMap) {
      const confidence = scoreAliasMatch(labelText, mapping.aliases);
      if (!bestMatch || confidence > bestMatch.confidence) {
        bestMatch = { key: mapping.key, confidence };
      }
    }

    if (!bestMatch || bestMatch.confidence < 40) {
      continue;
    }

    const value = profile[bestMatch.key];
    if (!value) {
      continue;
    }

    previews.push({
      key: `${bestMatch.key}:${previews.length}`,
      label: labelText,
      value,
      enabled: true,
      fieldType: detectFieldType(input),
      sourceKey: bestMatch.key,
      selectorHint: getSelectorHint(input),
      confidence: bestMatch.confidence,
    });
  }

  return previews;
}

export function applyAutofill(previews: AutofillFieldPreview[]): Array<{ label: string; success: boolean }> {
  const inputs = [...document.querySelectorAll('input, textarea, select')] as SupportedElement[];
  const results: Array<{ label: string; success: boolean }> = [];

  for (const preview of previews) {
    if (!preview.enabled) {
      continue;
    }

    const target = inputs.find((input) => {
      if (isSkippable(input)) return false;
      if (preview.selectorHint.startsWith('#') && input.id && `#${input.id}` === preview.selectorHint) return true;
      const name = input.getAttribute('name');
      if (name && preview.selectorHint === `[name="${name}"]`) return true;
      return collectLabelText(input).includes(preview.label);
    });

    if (!target) {
      void navigator.clipboard.writeText(preview.value).catch(() => undefined);
      results.push({ label: preview.label, success: false });
      continue;
    }

    let success = false;
    if (target.tagName.toLowerCase() === 'select') {
      success = selectValue(target as HTMLSelectElement, preview.value);
      if (success) {
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
    } else {
      const asInput = target as HTMLInputElement;
      if (asInput.type === 'radio') {
        success = setRadioValue(asInput, preview.value);
      } else {
        asInput.value = preview.value;
        asInput.dispatchEvent(new Event('input', { bubbles: true }));
        asInput.dispatchEvent(new Event('change', { bubbles: true }));
        success = true;
      }
    }

    if (!success) {
      void navigator.clipboard.writeText(preview.value).catch(() => undefined);
    }

    results.push({ label: preview.label, success });
  }

  return results;
}

/** @vitest-environment jsdom */

import { describe, expect, it, vi } from 'vitest';
import { applyAutofill, buildAutofillPreview } from '../src/content/autofill';

Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

describe('autofill mapping', () => {
  it('maps label and placeholder fields for preview', () => {
    document.body.innerHTML = `
      <label for="email">Email Address</label>
      <input id="email" type="email" />
      <input name="phone" placeholder="Mobile phone" />
      <input type="password" name="password" />
    `;

    const preview = buildAutofillPreview({ email: 'a@b.com', phone: '5551110000' });

    expect(preview.length).toBe(2);
    expect(preview.some((item) => item.sourceKey === 'email')).toBe(true);
    expect(preview.some((item) => item.sourceKey === 'phone')).toBe(true);
  });

  it('applies values and skips disabled toggles', () => {
    document.body.innerHTML = `
      <label for="city">City</label>
      <input id="city" type="text" />
    `;

    const result = applyAutofill([
      {
        key: 'city:0',
        label: 'city',
        value: 'Seattle',
        enabled: true,
        fieldType: 'text',
        sourceKey: 'city',
        selectorHint: '#city',
        confidence: 95,
      },
    ]);

    expect((document.getElementById('city') as HTMLInputElement).value).toBe('Seattle');
    expect(result[0]?.success).toBe(true);
  });
});

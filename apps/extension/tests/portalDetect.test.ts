/** @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';
import { detectPortal } from '../src/content/portalDetect';

function runDetect(html: string, url: string) {
  document.body.innerHTML = html;
  return detectPortal(document, new URL(url) as unknown as Location);
}

describe('portalDetect', () => {
  it('detects workday by hostname', () => {
    const result = runDetect('<div></div>', 'https://company.myworkdayjobs.com/en-US/job');
    expect(result.portal).toBe('workday');
    expect(result.compatible).toBe(true);
  });

  it('detects greenhouse by hostname and selectors', () => {
    const result = runDetect('<div id="application_form"></div>', 'https://boards.greenhouse.io/company/jobs/1');
    expect(result.portal).toBe('greenhouse');
  });

  it('returns unknown when no signatures match', () => {
    const result = runDetect('<main>hello</main>', 'https://example.com/jobs');
    expect(result.portal).toBe('unknown');
    expect(result.compatible).toBe(false);
  });
});

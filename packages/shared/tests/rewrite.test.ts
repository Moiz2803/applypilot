import { describe, expect, it } from 'vitest';
import { rewriteBullets } from '../src/rewrite';

describe('rewriteBullets', () => {
  it('rewrites bullet with STAR/CAR signal and keywords', () => {
    const bullets = ['Improved reporting process for finance team'];
    const keywords = ['SQL', 'dashboard'];

    const rewritten = rewriteBullets(bullets, keywords);

    expect(rewritten[0].rewritten).toContain('SQL');
    expect(rewritten[0].rewritten).toContain('dashboard');
    expect(rewritten[0].approved).toBe(false);
  });
});

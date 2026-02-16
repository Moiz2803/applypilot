import { describe, expect, it } from 'vitest';
import { scoreVisaFriendliness } from '../src/visaScore';

describe('scoreVisaFriendliness', () => {
  it('detects strong sponsorship signals', () => {
    const result = scoreVisaFriendliness(
      'We provide visa sponsorship for OPT and H1B candidates.',
    );

    expect(result.level).toBe('High');
    expect(result.confidence).toBeGreaterThan(70);
    expect(result.evidence.positive.length).toBeGreaterThan(0);
  });

  it('penalizes explicit no sponsorship language', () => {
    const result = scoreVisaFriendliness('US citizen only. Company cannot sponsor visas.');

    expect(result.level).toBe('Low');
    expect(result.confidence).toBeGreaterThan(70);
    expect(result.evidence.negative).toContain('cannot sponsor');
  });
});

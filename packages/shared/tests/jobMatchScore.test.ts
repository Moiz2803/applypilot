import { describe, expect, it } from 'vitest';
import { scoreJobMatch } from '../src/jobMatchScore';

describe('scoreJobMatch', () => {
  it('returns high match for aligned resume and jd', () => {
    const resume = `
      Senior software engineer with 8 years experience.
      Built React TypeScript Node AWS systems and owned architecture.
    `;
    const jd = `
      Looking for senior engineer with 7+ years, React, TypeScript, Node and AWS.
      Visa sponsorship available.
    `;

    const result = scoreJobMatch(resume, jd);
    expect(result.matchScore).toBeGreaterThan(70);
    expect(result.successProbability).toBe('High');
    expect(result.seniorityFit).toBe('Senior');
  });

  it('flags low match and missing keywords for weak resume', () => {
    const resume = 'Office admin and scheduling support.';
    const jd = 'Need Python, SQL, machine learning and distributed systems. US citizen only.';

    const result = scoreJobMatch(resume, jd);
    expect(result.matchScore).toBeLessThan(50);
    expect(result.missingKeywords.length).toBeGreaterThan(0);
    expect(result.visaFriendliness.level).toBe('Low');
  });
});

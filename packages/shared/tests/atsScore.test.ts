import { describe, expect, it } from 'vitest';
import { scoreATS } from '../src/atsScore';

describe('scoreATS', () => {
  it('returns high score for aligned resume and JD', () => {
    const resume = `
      EXPERIENCE
      Built React and TypeScript services for cloud data pipelines.
      SKILLS
      React TypeScript AWS Node.js SQL
      EDUCATION
      BS Computer Science
    `;

    const jd = `
      We need a software engineer with React, TypeScript, Node.js, SQL and AWS experience.
      Strong communication and product collaboration.
    `;

    const result = scoreATS({ resumeText: resume, jobDescription: jd });

    expect(result.score).toBeGreaterThan(60);
    expect(result.keywordCoverage).toBeGreaterThan(60);
  });

  it('returns missing keywords when resume is weak', () => {
    const resume = 'EXPERIENCE Managed schedules and handled office admin tasks.';
    const jd = 'Need Python, SQL, machine learning, and data pipelines.';

    const result = scoreATS({ resumeText: resume, jobDescription: jd });

    expect(result.missingKeywords.length).toBeGreaterThan(0);
    expect(result.score).toBeLessThan(60);
  });
});

export type VisaScoreLevel = 'High' | 'Medium' | 'Low';

export interface VisaScoreResult {
  level: VisaScoreLevel;
  confidence: number;
  evidence: {
    positive: string[];
    negative: string[];
  };
}

const positiveRules: Array<{ phrase: string; weight: number }> = [
  { phrase: 'visa sponsorship', weight: 35 },
  { phrase: 'h1b', weight: 20 },
  { phrase: 'opt', weight: 15 },
  { phrase: 'cpt', weight: 10 },
  { phrase: 'sponsor', weight: 12 },
];

const negativeRules: Array<{ phrase: string; weight: number }> = [
  { phrase: 'no sponsorship', weight: 45 },
  { phrase: 'us citizen only', weight: 40 },
  { phrase: 'cannot sponsor', weight: 50 },
];

export function scoreVisaFriendliness(input: string): VisaScoreResult {
  const text = input.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;

  const positive: string[] = [];
  const negative: string[] = [];

  for (const rule of positiveRules) {
    if (rule.phrase === 'sponsor' && /(no|cannot)\s+sponsor/.test(text)) {
      continue;
    }

    if (text.includes(rule.phrase)) {
      positiveScore += rule.weight;
      positive.push(rule.phrase);
    }
  }

  for (const rule of negativeRules) {
    if (text.includes(rule.phrase)) {
      negativeScore += rule.weight;
      negative.push(rule.phrase);
    }
  }

  const raw = positiveScore - negativeScore;
  const normalized = Math.max(0, Math.min(100, Math.round(raw + 50)));

  let level: VisaScoreLevel = 'Medium';
  if (normalized >= 70) {
    level = 'High';
  } else if (normalized < 40) {
    level = 'Low';
  }

  const confidence = Math.min(100, Math.max(20, (positive.length + negative.length) * 40));

  return {
    level,
    confidence,
    evidence: {
      positive,
      negative,
    },
  };
}

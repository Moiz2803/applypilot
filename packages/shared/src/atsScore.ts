import Fuse from 'fuse.js';

export interface ATSInput {
  resumeText: string;
  jobDescription: string;
}

export interface ATSResult {
  score: number;
  keywordCoverage: number;
  missingKeywords: string[];
  suggestions: string[];
}

const SECTION_KEYWORDS = ['experience', 'skills', 'education', 'projects'];

function uniqueWords(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9+#.-]{3,}/g) ?? [];
  return [...new Set(matches)];
}

function extractKeywords(jobDescription: string): string[] {
  const words = uniqueWords(jobDescription);
  const stopWords = new Set([
    'with',
    'from',
    'that',
    'this',
    'have',
    'your',
    'will',
    'strong',
    'need',
    'role',
    'engineer',
    'software',
  ]);
  return words.filter((word) => !stopWords.has(word)).slice(0, 12);
}

function computeKeywordCoverage(resumeText: string, jobKeywords: string[]) {
  const resumeWords = uniqueWords(resumeText);
  const fuse = new Fuse(resumeWords, {
    includeScore: true,
    threshold: 0.2,
  });

  const matched = jobKeywords.filter((keyword) => {
    if (resumeText.toLowerCase().includes(keyword)) {
      return true;
    }

    const candidate = fuse.search(keyword, { limit: 1 })[0];
    return Boolean(candidate && (candidate.score ?? 1) < 0.2);
  });

  const coverage = jobKeywords.length === 0 ? 0 : Math.round((matched.length / jobKeywords.length) * 100);
  const missing = jobKeywords.filter((keyword) => !matched.includes(keyword));

  return { coverage, missing };
}

function termFrequencyMap(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }

  const total = tokens.length || 1;
  for (const [token, count] of tf) {
    tf.set(token, count / total);
  }

  return tf;
}

function inverseDocumentFrequency(token: string, docs: string[][]): number {
  const docsWithTerm = docs.filter((doc) => doc.includes(token)).length;
  return Math.log((docs.length + 1) / (docsWithTerm + 1)) + 1;
}

function computeTfIdfSimilarity(resumeText: string, jobDescription: string): number {
  const resumeTokens = uniqueWords(resumeText);
  const jobTokens = uniqueWords(jobDescription);
  const docs = [resumeTokens, jobTokens];

  if (jobTokens.length === 0) {
    return 0;
  }

  const resumeTf = termFrequencyMap(resumeTokens);
  const jobTf = termFrequencyMap(jobTokens);

  let resumeWeight = 0;
  let jobWeight = 0;

  const keywords = jobTokens.slice(0, 40);
  for (const token of keywords) {
    const idf = inverseDocumentFrequency(token, docs);
    resumeWeight += (resumeTf.get(token) ?? 0) * idf;
    jobWeight += (jobTf.get(token) ?? 0) * idf;
  }

  if (jobWeight === 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round((resumeWeight / jobWeight) * 100)));
}

function computeSectionCompleteness(resumeText: string): number {
  const lower = resumeText.toLowerCase();
  const found = SECTION_KEYWORDS.filter((section) => lower.includes(section));
  return Math.round((found.length / SECTION_KEYWORDS.length) * 100);
}

function computeFormattingChecks(resumeText: string): number {
  const lines = resumeText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const bulletLines = lines.filter((line) => line.startsWith('-') || line.startsWith('*')).length;
  const hasBulletBalance = bulletLines > 2 || lines.length >= 4;
  const hasReasonableLength = lines.length >= 6;
  const hasNoLongLine = lines.every((line) => line.length <= 180);

  let score = 0;
  if (hasBulletBalance) score += 34;
  if (hasReasonableLength) score += 33;
  if (hasNoLongLine) score += 33;

  return score;
}

export function scoreATS({ resumeText, jobDescription }: ATSInput): ATSResult {
  const keywords = extractKeywords(jobDescription);
  const coverageData = computeKeywordCoverage(resumeText, keywords);
  const tfIdfSimilarity = computeTfIdfSimilarity(resumeText, jobDescription);
  const sectionScore = computeSectionCompleteness(resumeText);
  const formattingScore = computeFormattingChecks(resumeText);

  const weightedScore =
    coverageData.coverage * 0.4 +
    tfIdfSimilarity * 0.3 +
    sectionScore * 0.2 +
    formattingScore * 0.1;

  const suggestions: string[] = [];
  if (coverageData.coverage < 60) {
    suggestions.push('Add more job-specific keywords naturally in experience bullets.');
  }
  if (tfIdfSimilarity < 60) {
    suggestions.push('Align resume language with role responsibilities and tech stack terms.');
  }
  if (sectionScore < 75) {
    suggestions.push('Ensure resume has clear Experience, Skills, Education, and Projects sections.');
  }
  if (formattingScore < 70) {
    suggestions.push('Use concise bullet points and consistent line length for ATS readability.');
  }

  return {
    score: Math.round(weightedScore),
    keywordCoverage: coverageData.coverage,
    missingKeywords: coverageData.missing.slice(0, 12),
    suggestions,
  };
}

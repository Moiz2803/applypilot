import Fuse from 'fuse.js';
import { scoreVisaFriendliness } from './visaScore';

export type ProbabilityLevel = 'Low' | 'Medium' | 'High';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';
export type SeniorityFit = 'Junior' | 'Mid' | 'Senior';

export interface JobMatchScoreResult {
  matchScore: number;
  successProbability: ProbabilityLevel;
  competitionLevel: CompetitionLevel;
  seniorityFit: SeniorityFit;
  visaFriendliness: ReturnType<typeof scoreVisaFriendliness>;
  missingKeywords: string[];
}

const STOP_WORDS = new Set([
  'with',
  'from',
  'that',
  'this',
  'have',
  'your',
  'will',
  'need',
  'role',
  'team',
  'years',
  'experience',
]);

const JUNIOR_HINTS = ['junior', 'entry level', 'new grad', '0-2 years', '1+ years'];
const MID_HINTS = ['mid', '3+ years', '4+ years', '5+ years', 'intermediate'];
const SENIOR_HINTS = ['senior', 'staff', 'lead', 'principal', 'architect', '7+ years', '8+ years'];

function uniqueWords(text: string): string[] {
  const matches = text.toLowerCase().match(/[a-z0-9+#.-]{3,}/g) ?? [];
  return [...new Set(matches)];
}

function extractKeywords(text: string): string[] {
  return uniqueWords(text)
    .filter((word) => !STOP_WORDS.has(word))
    .slice(0, 40);
}

function getCoverage(resumeText: string, keywords: string[]) {
  const resumeWords = uniqueWords(resumeText);
  const fuse = new Fuse(resumeWords, { threshold: 0.2, includeScore: true });

  const matched = keywords.filter((keyword) => {
    if (resumeText.toLowerCase().includes(keyword)) {
      return true;
    }

    const candidate = fuse.search(keyword, { limit: 1 })[0];
    return Boolean(candidate && (candidate.score ?? 1) < 0.2);
  });

  const coverage = keywords.length === 0 ? 0 : Math.round((matched.length / keywords.length) * 100);
  return {
    coverage,
    missingKeywords: keywords.filter((keyword) => !matched.includes(keyword)).slice(0, 12),
  };
}

function detectYearsHint(text: string): number {
  const matches = [...text.toLowerCase().matchAll(/(\d+)\s*\+?\s*years?/g)];
  if (matches.length === 0) {
    return 2;
  }

  const values = matches.map((match) => Number(match[1])).filter((value) => !Number.isNaN(value));
  return values.length > 0 ? Math.max(...values) : 2;
}

function detectSeniority(text: string): SeniorityFit {
  const lower = text.toLowerCase();
  if (SENIOR_HINTS.some((hint) => lower.includes(hint))) return 'Senior';
  if (MID_HINTS.some((hint) => lower.includes(hint))) return 'Mid';
  if (JUNIOR_HINTS.some((hint) => lower.includes(hint))) return 'Junior';

  const years = detectYearsHint(lower);
  if (years >= 7) return 'Senior';
  if (years >= 3) return 'Mid';
  return 'Junior';
}

function probabilityFromScore(score: number): ProbabilityLevel {
  if (score >= 70) return 'High';
  if (score >= 45) return 'Medium';
  return 'Low';
}

function competitionFromText(jobDescription: string): CompetitionLevel {
  const lower = jobDescription.toLowerCase();
  const strictSignals = ['top talent', 'highly competitive', 'elite', 'fast-paced', 'rockstar', 'must have'];
  const count = strictSignals.filter((signal) => lower.includes(signal)).length;

  if (count >= 3) return 'High';
  if (count >= 1) return 'Medium';
  return 'Low';
}

function overlapScore(resumeText: string, jobDescription: string): number {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescription);
  if (jdKeywords.length === 0) return 0;

  const overlap = jdKeywords.filter((word) => resumeKeywords.includes(word)).length;
  return Math.round((overlap / jdKeywords.length) * 100);
}

export function scoreJobMatch(resumeText: string, jobDescription: string): JobMatchScoreResult {
  const jdKeywords = extractKeywords(jobDescription);
  const coverage = getCoverage(resumeText, jdKeywords);
  const overlap = overlapScore(resumeText, jobDescription);

  const jdSeniority = detectSeniority(jobDescription);
  const resumeSeniority = detectSeniority(resumeText);

  const seniorityFit = jdSeniority;
  const seniorityAlignment = jdSeniority === resumeSeniority ? 100 : 70;

  const yearsNeeded = detectYearsHint(jobDescription);
  const yearsResume = detectYearsHint(resumeText);
  const yearsFit = yearsResume >= yearsNeeded ? 100 : Math.max(40, 100 - (yearsNeeded - yearsResume) * 15);

  const visaFriendliness = scoreVisaFriendliness(jobDescription);
  const visaFactor = visaFriendliness.level === 'High' ? 100 : visaFriendliness.level === 'Medium' ? 70 : 35;

  const weighted =
    coverage.coverage * 0.35 +
    overlap * 0.2 +
    seniorityAlignment * 0.15 +
    yearsFit * 0.15 +
    visaFactor * 0.15;

  const matchScore = Math.max(0, Math.min(100, Math.round(weighted)));

  return {
    matchScore,
    successProbability: probabilityFromScore(matchScore),
    competitionLevel: competitionFromText(jobDescription),
    seniorityFit,
    visaFriendliness,
    missingKeywords: coverage.missingKeywords,
  };
}

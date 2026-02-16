'use client';

import Link from 'next/link';
import { AlertCircle, Gauge, Sparkles, Target } from 'lucide-react';
import { canRunAtsScan, canRunJobAnalysis, getFeatureAccess, rewriteBullets, scoreATS, scoreJobMatch } from '@visa-ats/shared';
import { Badge, Button, Card, ScoreRing, Textarea } from '@visa-ats/ui';
import { useState } from 'react';
import { useAppStore } from '../lib/store';

interface AnalysisResult {
  ats: ReturnType<typeof scoreATS>;
  match: ReturnType<typeof scoreJobMatch>;
  rewrites: ReturnType<typeof rewriteBullets>;
}

function visaTone(level: 'High' | 'Medium' | 'Low') {
  if (level === 'High') return 'success' as const;
  if (level === 'Medium') return 'warning' as const;
  return 'danger' as const;
}

export function AtsChecker() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeOverride, setResumeOverride] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const {
    resumeText,
    tier,
    atsScansThisMonth,
    jobAnalysesThisMonth,
    autofillActionsThisMonth,
    incrementAtsScans,
    incrementJobAnalyses,
    addSkillTags,
    addRecentAnalysis,
  } = useAppStore();

  const run = () => {
    const currentResume = resumeOverride || resumeText;
    if (!jobDescription || !currentResume) {
      setError('Provide both resume text and job description.');
      return;
    }

    const usageState = { tier, atsScansThisMonth, jobAnalysesThisMonth, autofillActionsThisMonth };
    if (!canRunAtsScan(usageState) || !canRunJobAnalysis(usageState)) {
      setError('Free tier reached scan quota. Upgrade for unlimited scans.');
      return;
    }

    const ats = scoreATS({ resumeText: currentResume, jobDescription });
    const match = scoreJobMatch(currentResume, jobDescription);
    const sampleBullets = currentResume
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('-') || line.startsWith('*'))
      .slice(0, 3)
      .map((line) => line.slice(1).trim());

    const rewrites = rewriteBullets(sampleBullets, ats.missingKeywords);

    incrementAtsScans();
    incrementJobAnalyses();
    addRecentAnalysis({
      source: 'web',
      matchScore: match.matchScore,
      missingKeywords: match.missingKeywords,
      role: 'Manual JD analysis',
    });
    setResult({ ats, match, rewrites });
    setError(null);
  };

  const access = getFeatureAccess(tier);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Analyze Job Match" subtitle="Paste JD and compare instantly" className="ap-hover-card">
        <div className="space-y-3">
          <Textarea className="h-40" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste job description here" />
          <Textarea className="h-32" value={resumeOverride} onChange={(e) => setResumeOverride(e.target.value)} placeholder="Optional resume override" />
          <div className="flex gap-2">
            <Button onClick={run}><Sparkles className="mr-2 h-4 w-4" /> Run analysis</Button>
            <Link href="/resume-tailor"><Button variant="ghost">Tailor resume</Button></Link>
          </div>
        </div>
      </Card>

      <Card title="Results" subtitle="Actionable score and keyword insights" className="ap-hover-card">
        {error && <p className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"><AlertCircle className="h-4 w-4" /> {error}</p>}
        {!result && !error && <p className="text-sm text-slate-600">No results yet. Run an analysis.</p>}
        {result && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <ScoreRing value={result.match.matchScore} label="Job Match" size={112} />
                <ScoreRing value={result.ats.score} label="ATS Score" size={96} />
                <div className="flex flex-col justify-center gap-2">
                  <Badge tone="info"><Gauge className="mr-1 h-3 w-3" /> {result.match.successProbability}</Badge>
                  <Badge tone="warning">Competition: {result.match.competitionLevel}</Badge>
                  <Badge tone="default">Seniority: {result.match.seniorityFit}</Badge>
                  <Badge tone={visaTone(result.match.visaFriendliness.level)}>Visa: {result.match.visaFriendliness.level}</Badge>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="mb-2 text-sm font-semibold">What you&apos;re missing</p>
              <div className="flex flex-wrap gap-2">
                {result.match.missingKeywords.map((keyword) => (
                  <button
                    key={keyword}
                    className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                    onClick={() => addSkillTags([keyword])}
                  >
                    <Target className="mr-1 inline h-3 w-3" /> {keyword}
                  </button>
                ))}
                {result.match.missingKeywords.length === 0 && <p className="text-xs text-slate-600">No keyword gaps detected.</p>}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-semibold">Resume bullet suggestions</p>
              {!access.canResumeTailor && <p className="text-xs text-slate-600">Unlock on Pro+ tier.</p>}
              <div className="mt-2 space-y-1 text-xs">
                {result.rewrites.map((entry) => (
                  <p key={entry.original}>
                    {entry.original} {'->'} {access.canResumeTailor ? entry.rewritten : '[Locked]'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

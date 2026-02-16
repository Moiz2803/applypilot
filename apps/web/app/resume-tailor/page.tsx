'use client';

import Link from 'next/link';
import { getFeatureAccess, rewriteBullets, scoreATS, scoreJobMatch } from '@visa-ats/shared';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../lib/store';

export default function ResumeTailorPage() {
  const { resumeText, tier, preferences, addSkillTags } = useAppStore();
  const [jobDescription, setJobDescription] = useState('');
  const access = getFeatureAccess(tier);

  const result = useMemo(() => {
    if (!resumeText || !jobDescription) return null;

    const ats = scoreATS({ resumeText, jobDescription });
    const match = scoreJobMatch(resumeText, jobDescription);
    const bullets = resumeText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('-') || line.startsWith('*'))
      .slice(0, 4)
      .map((line) => line.slice(1).trim());

    const rewrites = rewriteBullets(bullets, match.missingKeywords);

    return {
      ats,
      match,
      rewrites,
      summaryRewrite: `Tailored summary: Highlight ${match.missingKeywords.slice(0, 3).join(', ')} while framing your profile around ${match.seniorityFit.toLowerCase()}-level impact for this role.`,
    };
  }, [resumeText, jobDescription]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Resume Tailoring Engine</h1>
      <p className="text-sm text-slate-700">Paste a job description to generate keyword gaps, skills suggestions, and rewrite guidance.</p>

      <textarea
        className="h-56 w-full rounded border border-slate-300 p-2"
        placeholder="Paste target job description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      {!result && <p className="text-sm text-slate-600">Add job description and ensure resume text exists in your profile.</p>}

      {result && (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Tailoring Output</h2>
            <p className="text-sm">Resume strength score: {result.ats.score}</p>
            <p className="text-sm">Job match score: {result.match.matchScore}</p>
            <p className="mt-2 text-sm font-medium">Missing keywords</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.match.missingKeywords.map((keyword) => (
                <button
                  key={keyword}
                  className="rounded-full border border-slate-300 px-3 py-1 text-xs"
                  onClick={() => addSkillTags([keyword])}
                >
                  + {keyword}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-600">Current profile skills: {preferences.skillTags.join(', ') || 'none'}</p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-semibold">Advanced Tailoring</h2>
            {!access.canResumeTailor && (
              <p className="text-sm text-slate-700">
                Pro+ required for advanced tailoring. <Link href="/pricing" className="text-teal">Upgrade plan</Link>.
              </p>
            )}
            <p className="mt-2 text-sm font-medium">Summary rewrite suggestion</p>
            <p className="text-sm">{access.canResumeTailor ? result.summaryRewrite : '[Locked on current tier]'}</p>
            <p className="mt-2 text-sm font-medium">Bullet rewrites</p>
            <div className="space-y-1 text-xs">
              {result.rewrites.map((entry) => (
                <p key={entry.original}>{entry.original} {'->'} {access.canResumeTailor ? entry.rewritten : '[Locked]'}</p>
              ))}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}

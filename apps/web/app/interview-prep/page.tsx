'use client';

import Link from 'next/link';
import { getFeatureAccess } from '@visa-ats/shared';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../lib/store';

function extractLikelyTopics(jobDescription: string): string[] {
  const candidates = ['system design', 'api design', 'testing', 'cloud', 'typescript', 'react', 'node', 'sql', 'security'];
  const lower = jobDescription.toLowerCase();
  return candidates.filter((topic) => lower.includes(topic)).slice(0, 6);
}

export default function InterviewPrepPage() {
  const { tier, resumeText } = useAppStore();
  const [jobDescription, setJobDescription] = useState('');
  const access = getFeatureAccess(tier);

  const prep = useMemo(() => {
    if (!jobDescription || !resumeText) return null;

    const topics = extractLikelyTopics(jobDescription);
    return {
      topics: topics.length > 0 ? topics : ['system design', 'debugging', 'stakeholder communication'],
      behavioral: [
        'Describe a high-impact project and measurable outcome.',
        'Tell me about a time you resolved cross-functional conflict.',
        'How do you prioritize under tight deadlines?',
      ],
      companyResearch: [
        'Review recent product announcements and roadmap hints.',
        'Map role responsibilities to public engineering challenges.',
        'Identify team structure and hiring signals from job posts.',
      ],
      checklist: [
        'Prepare 3 project stories aligned to JD requirements.',
        'Practice role-specific technical problem solving.',
        'Draft concise questions for interviewer round.',
      ],
    };
  }, [jobDescription, resumeText]);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Interview Prep Generator</h1>
      {!access.canInterviewPrep && (
        <p className="text-sm text-slate-700">
          Interview prep generator is available on Pro+. <Link href="/pricing" className="text-teal">Upgrade plan</Link>.
        </p>
      )}
      <textarea
        className="h-56 w-full rounded border border-slate-300 p-2"
        placeholder="Paste job description"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
      />

      {prep && (
        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Likely Technical Topics</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {prep.topics.map((topic) => (
                <li key={topic}>{access.canInterviewPrep ? topic : '[Locked]'}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Behavioral Questions</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {prep.behavioral.map((item) => (
                <li key={item}>{access.canInterviewPrep ? item : '[Locked]'}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Company Research Bullets</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {prep.companyResearch.map((item) => (
                <li key={item}>{access.canInterviewPrep ? item : '[Locked]'}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="font-semibold">Role Prep Checklist</h2>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {prep.checklist.map((item) => (
                <li key={item}>{access.canInterviewPrep ? item : '[Locked]'}</li>
              ))}
            </ul>
          </article>
        </section>
      )}
    </main>
  );
}

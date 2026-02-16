'use client';

import Link from 'next/link';
import { Activity, BarChart3, BriefcaseBusiness, Clock3, MessageCircle, Sparkles, Target } from 'lucide-react';
import { Badge, Button, Card, Divider, Input, Skeleton } from '@visa-ats/ui';
import { canRunAtsScan, canRunJobAnalysis, getFeatureAccess } from '@visa-ats/shared';
import { useMemo, useState } from 'react';
import { useAppStore } from '../../lib/store';

function profileCompleteness(profile: { fullName: string; email: string; phone: string; location: string; links: { linkedIn: string } }) {
  const checks = [profile.fullName, profile.email, profile.phone, profile.location, profile.links.linkedIn];
  const completed = checks.filter((item) => item.trim().length > 0).length;
  return Math.round((completed / checks.length) * 100);
}

export default function DashboardPage() {
  const {
    profile,
    resumeText,
    jobs,
    tier,
    atsScansThisMonth,
    jobAnalysesThisMonth,
    autofillActionsThisMonth,
    extensionInstalledHint,
    setExtensionInstalledHint,
    addJob,
    recentAnalyses,
  } = useAppStore();
  const [analyzeInput, setAnalyzeInput] = useState('');

  const completion = profileCompleteness(profile);
  const access = getFeatureAccess(tier);
  const usageState = { tier, atsScansThisMonth, jobAnalysesThisMonth, autofillActionsThisMonth };

  const analytics = useMemo(() => {
    const applied = jobs.filter((job) => Boolean(job.appliedDate) || ['applied', 'interview', 'offer', 'rejected'].includes(job.status)).length;
    const interviewed = jobs.filter((job) => Boolean(job.interviewDate) || ['interview', 'offer'].includes(job.status)).length;
    const offered = jobs.filter((job) => Boolean(job.offerDate) || job.status === 'offer').length;
    const responded = jobs.filter((job) => Boolean(job.interviewDate || job.rejectionDate || job.offerDate)).length;
    const matchScoreAvg = recentAnalyses.length > 0
      ? Math.round(recentAnalyses.reduce((sum, analysis) => sum + analysis.matchScore, 0) / recentAnalyses.length)
      : 0;

    return {
      interviewRate: applied > 0 ? Math.round((interviewed / applied) * 100) : 0,
      responseRate: applied > 0 ? Math.round((responded / applied) * 100) : 0,
      weeklyApplications: jobs.filter((job) => job.appliedDate && Date.now() - new Date(job.appliedDate).getTime() <= 7 * 24 * 3600 * 1000).length,
      saved: jobs.filter((job) => job.status === 'saved').length,
      applied,
      interviewed,
      offered,
      matchScoreAvg,
    };
  }, [jobs, recentAnalyses]);

  return (
    <main className="space-y-5">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-lg">
        <div className="absolute -right-8 -top-12 h-52 w-52 rounded-full bg-blue-100 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">ApplyPilot Dashboard</h1>
            <p className="text-sm text-slate-600">One place for high-confidence applications and outcome tracking.</p>
          </div>
          <Badge tone="info">{tier.toUpperCase()}</Badge>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="ap-hover-card border-blue-200 bg-gradient-to-br from-blue-50 to-white" title="Applications">
          <p className="inline-flex items-center gap-2 text-3xl font-black text-blue-700"><BriefcaseBusiness className="h-6 w-6" /> {analytics.applied}</p>
          <p className="mt-1 text-sm text-slate-600">Weekly: {analytics.weeklyApplications}</p>
        </Card>
        <Card className="ap-hover-card border-cyan-200 bg-gradient-to-br from-cyan-50 to-white" title="Interviews">
          <p className="inline-flex items-center gap-2 text-3xl font-black text-cyan-700"><MessageCircle className="h-6 w-6" /> {analytics.interviewed}</p>
          <p className="mt-1 text-sm text-slate-600">Offers: {analytics.offered}</p>
        </Card>
        <Card className="ap-hover-card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white" title="Response rate">
          <p className="inline-flex items-center gap-2 text-3xl font-black text-emerald-700"><Activity className="h-6 w-6" /> {analytics.responseRate}%</p>
          <p className="mt-1 text-sm text-slate-600">Interview rate: {analytics.interviewRate}%</p>
        </Card>
        <Card className="ap-hover-card border-violet-200 bg-gradient-to-br from-violet-50 to-white" title="Match score avg">
          <p className="inline-flex items-center gap-2 text-3xl font-black text-violet-700"><Target className="h-6 w-6" /> {analytics.matchScoreAvg}</p>
          <p className="mt-1 text-sm text-slate-600">Across recent analyses</p>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card title="Profile completion" className="ap-hover-card">
          <p className="text-3xl font-black">{completion}%</p>
          <div className="mt-2 h-2 rounded bg-slate-100">
            <div className="h-2 rounded bg-blue-500" style={{ width: `${completion}%` }} />
          </div>
        </Card>
        <Card title="Resume status" className="ap-hover-card">
          <p className="text-3xl font-black">{resumeText.length > 40 ? 'Ready' : 'Missing'}</p>
          <p className="mt-1 text-sm text-slate-600">Keep resume text updated for stronger matches.</p>
        </Card>
        <Card title="Usage meter" className="ap-hover-card">
          <p className="text-sm">Scans: {atsScansThisMonth} / {Number.isFinite(access.scanLimit) ? access.scanLimit : '8'}</p>
          <p className="text-sm">Autofill: {autofillActionsThisMonth} / {Number.isFinite(access.autofillLimit) ? access.autofillLimit : '8'}</p>
          {!canRunAtsScan(usageState) && <Badge tone="warning" className="mt-2">Scan limit reached</Badge>}
        </Card>
        <Card title="Quick actions" className="ap-hover-card">
          <div className="grid gap-2">
            <Link href="/ats-checker"><Button className="w-full justify-start" variant="secondary"><Sparkles className="mr-2 h-4 w-4" /> Try Analyzer</Button></Link>
            <Link href="/resume-tailor"><Button className="w-full justify-start" variant="ghost">Resume Tailor</Button></Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Analyze a job" subtitle="Paste URL or JD text" className="ap-hover-card">
          <Input placeholder="Paste job URL or job description" value={analyzeInput} onChange={(e) => setAnalyzeInput(e.target.value)} />
          <div className="mt-3 flex gap-2">
            <Link href="/ats-checker"><Button>Open Analyzer</Button></Link>
            <Button
              variant="ghost"
              onClick={() => {
                if (!analyzeInput.trim()) return;
                addJob({
                  company: 'Manual Entry',
                  role: analyzeInput.startsWith('http') ? 'From URL' : 'From JD Paste',
                  status: 'saved',
                  source: 'web',
                  appliedViaExtension: false,
                  jobUrl: analyzeInput.startsWith('http') ? analyzeInput : undefined,
                });
                setAnalyzeInput('');
              }}
            >
              Save lead
            </Button>
          </div>
          {!canRunJobAnalysis(usageState) && <p className="mt-2 text-xs text-amber-700">Free scan limit reached.</p>}
        </Card>

        <Card title="Application funnel" subtitle="Weekly health snapshot" className="ap-hover-card">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-slate-200 p-3"><Clock3 className="mb-1 h-4 w-4 text-slate-500" /> Weekly applications: <strong>{analytics.weeklyApplications}</strong></div>
            <div className="rounded-lg border border-slate-200 p-3"><BarChart3 className="mb-1 h-4 w-4 text-slate-500" /> Interview rate: <strong>{analytics.interviewRate}%</strong></div>
            <div className="rounded-lg border border-slate-200 p-3">Response rate: <strong>{analytics.responseRate}%</strong></div>
            <div className="rounded-lg border border-slate-200 p-3">Offers: <strong>{analytics.offered}</strong></div>
          </div>
          <Divider className="my-3" />
          <p className="text-sm text-slate-600">
            Funnel: Saved {analytics.saved} {'->'} Applied {analytics.applied} {'->'} Interview {analytics.interviewed} {'->'} Offer {analytics.offered}
          </p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Recent analyses" className="ap-hover-card">
          <div className="space-y-2">
            {recentAnalyses.length === 0 && (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            )}
            {recentAnalyses.slice(0, 5).map((analysis) => (
              <article key={analysis.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                <p className="font-semibold">Match score: {analysis.matchScore}</p>
                <p>Missing: {analysis.missingKeywords.slice(0, 4).join(', ') || 'None'}</p>
              </article>
            ))}
          </div>
        </Card>

        <Card title="Extension status" className="ap-hover-card">
          <p className="text-sm text-slate-600">Toolbar Copilot is {extensionInstalledHint ? 'ready' : 'not confirmed'}.</p>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={extensionInstalledHint} onChange={(e) => setExtensionInstalledHint(e.target.checked)} />
            Confirm extension installed
          </label>
          <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
            <BriefcaseBusiness className="mb-1 h-4 w-4" />
            Load from <code>apps/extension/dist</code> in <code>chrome://extensions</code>.
          </div>
        </Card>
      </section>
    </main>
  );
}

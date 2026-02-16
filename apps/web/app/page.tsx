import Link from 'next/link';
import { ArrowRight, Chrome, ShieldCheck, Sparkles, Target } from 'lucide-react';
import { Badge, BrandLogo, Button, Card } from '@visa-ats/ui';

const features = [
  {
    title: 'Match Intelligence',
    description: 'See match score, missing keywords, seniority fit, and visa signals before you apply.',
    icon: Target,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Tailor and Prep',
    description: 'Generate focused resume rewrites and interview prep workflows in minutes.',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-emerald-500',
  },
  {
    title: 'Safe Copilot',
    description: 'Preview-first autofill that never auto-submits and never fills password fields.',
    icon: ShieldCheck,
    gradient: 'from-emerald-500 to-lime-500',
  },
];

export default function HomePage() {
  return (
    <main className="space-y-10">
      <section className="relative overflow-hidden rounded-3xl border border-blue-100 bg-white p-8 shadow-xl md:p-14">
        <div className="absolute -right-10 -top-16 h-72 w-72 rounded-full bg-blue-200/70 blur-3xl" />
        <div className="absolute -left-10 top-20 h-60 w-60 rounded-full bg-cyan-200/60 blur-3xl" />
        <div className="absolute inset-x-20 top-8 h-20 rounded-full bg-white/55 blur-2xl" />
        <div className="relative space-y-6">
          <Badge tone="info">Premium Consumer SaaS</Badge>
          <div className="inline-flex rounded-2xl bg-white/80 p-2 shadow-sm">
            <BrandLogo showTagline className="text-left" />
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl">
            Smarter applications. Faster offers.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            ApplyPilot gives job seekers a high-trust command center with match scoring, ATS analysis, and assistive
            autofill so every application is intentional.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/ats-checker">
              <Button className="ap-gradient-cta inline-flex items-center gap-2 border border-blue-400 px-6 py-3 text-white shadow-lg">
                Try Analyzer <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button variant="ghost" className="inline-flex items-center gap-2 px-6 py-3">
                <Chrome className="h-4 w-4" /> Install Extension
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} title={feature.title} className="ap-hover-card rounded-3xl border-slate-200">
            <div className="space-y-4">
              <div className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 text-white shadow-lg`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Card title="Free" className="ap-hover-card">
          <p className="text-3xl font-black">$0</p>
          <p className="mt-1 text-sm text-slate-600">10 scans/month</p>
        </Card>
        <Card title="Pro" className="ap-hover-card">
          <p className="text-3xl font-black">$19</p>
          <p className="mt-1 text-sm text-slate-600">Unlimited scans + autofill</p>
        </Card>
        <Card title="Pro+" className="ap-hover-card relative border-blue-300 ring-2 ring-blue-200 shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_20px_45px_rgba(37,99,235,0.25)]">
          <Badge tone="success" className="mb-3">Most Popular</Badge>
          <p className="text-3xl font-black">$39</p>
          <p className="mt-1 text-sm text-slate-600">Resume tailoring + interview prep</p>
        </Card>
        <Card title="Elite" className="ap-hover-card">
          <p className="text-3xl font-black">$79</p>
          <p className="mt-1 text-sm text-slate-600">Visa radar + analytics</p>
        </Card>
      </section>
    </main>
  );
}

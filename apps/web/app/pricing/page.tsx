import Link from 'next/link';
import { Check, Crown } from 'lucide-react';
import { Badge, Button, Card } from '@visa-ats/ui';

const tiers = [
  {
    name: 'Free',
    price: '$0',
    desc: 'Get started with core analysis.',
    features: ['10 scans/month', 'ATS + match basics', 'Local job tracking'],
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$19',
    desc: 'Unlimited scans and copilot autofill.',
    features: ['Unlimited scans', 'Autofill copilot', 'Priority UX'],
    highlight: false,
  },
  {
    name: 'Pro+',
    price: '$39',
    desc: 'Tailor resumes and prep interviews.',
    features: ['Resume tailoring', 'Interview prep generator', 'Everything in Pro'],
    highlight: true,
  },
  {
    name: 'Elite',
    price: '$79',
    desc: 'Complete analytics + visa radar.',
    features: ['Visa radar', 'Application analytics', 'Everything in Pro+'],
    highlight: false,
  },
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string; canceled?: string; checkout?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="space-y-6">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Badge tone="info">ApplyPilot Pricing</Badge>
        <h1 className="mt-3 text-4xl font-black tracking-tight">Plans for every application stage.</h1>
        <p className="mt-2 text-slate-600">Transparent tiers with local-first defaults and assistive-only automation.</p>
        {params.checkout === 'mock' && <p className="mt-3 text-sm text-amber-700">Stripe key missing. Mock checkout mode is active.</p>}
        {params.upgraded === '1' && <p className="mt-3 text-sm text-emerald-700">Checkout succeeded in test mode.</p>}
        {params.canceled === '1' && <p className="mt-3 text-sm text-slate-700">Checkout canceled.</p>}
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((tier) => (
          <Card key={tier.name} className={tier.highlight ? 'border-blue-300 ring-2 ring-blue-100 shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_18px_36px_rgba(37,99,235,0.22)]' : ''} title={tier.name} subtitle={tier.desc}>
            {tier.highlight && <Badge tone="success" className="mb-3">Most Popular</Badge>}
            <p className="text-3xl font-black">{tier.price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {tier.features.map((feature) => (
                <li key={feature} className="inline-flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 text-emerald-600" /> {feature}</li>
              ))}
            </ul>
            {tier.name === 'Free' ? (
              <Link href="/dashboard" className="mt-4 block"><Button variant="ghost" className="w-full">Continue Free</Button></Link>
            ) : (
              <form action="/api/stripe/checkout" method="post" className="mt-4">
                <Button className="w-full"><Crown className="mr-2 h-4 w-4" /> Upgrade to {tier.name}</Button>
              </form>
            )}
          </Card>
        ))}
      </section>

      <p className="text-xs text-slate-500">ApplyPilot only provides assistive autofill. It never auto-submits applications and never fills password fields.</p>
    </main>
  );
}

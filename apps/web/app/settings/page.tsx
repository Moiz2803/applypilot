'use client';

import Link from 'next/link';
import { Crown, Sparkles, ShieldCheck } from 'lucide-react';
import { getFeatureAccess } from '@visa-ats/shared';
import { Badge, Button, Card, Input } from '@visa-ats/ui';
import { useAppStore } from '../../lib/store';

export default function SettingsPage() {
  const {
    tier,
    setTier,
    atsScansThisMonth,
    autofillActionsThisMonth,
    profile,
    upsertProfile,
  } = useAppStore();
  const access = getFeatureAccess(tier);

  return (
    <main className="space-y-5">
      <h1 className="text-2xl font-bold">Settings and Billing</h1>
      <section className="grid gap-4 lg:grid-cols-2">
        <Card title="Current plan" subtitle="Test-mode local controls">
          <p className="text-sm">Plan: <strong>{tier.toUpperCase()}</strong></p>
          <p className="text-sm">Scans used: {atsScansThisMonth} / {Number.isFinite(access.scanLimit) ? access.scanLimit : '8'}</p>
          <p className="text-sm">Autofill used: {autofillActionsThisMonth} / {Number.isFinite(access.autofillLimit) ? access.autofillLimit : '8'}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setTier('free')}>Free</Button>
            <Button variant="ghost" onClick={() => setTier('pro')}>Pro</Button>
            <Button variant="ghost" onClick={() => setTier('pro_plus')}>Pro+</Button>
            <Button variant="secondary" onClick={() => setTier('elite')}>Elite</Button>
          </div>
          <form action="/api/stripe/checkout" method="post" className="mt-3">
            <Button type="submit"><Crown className="mr-2 h-4 w-4" /> Upgrade (Stripe test mode)</Button>
          </form>
          <p className="mt-2 text-xs text-slate-500">Stripe key optional. Without keys, checkout falls back to mock mode.</p>
          <Link href="/pricing" className="mt-2 inline-block text-sm text-blue-700 hover:underline">View full pricing</Link>
        </Card>

        <Card title="Feature access" subtitle="What your current tier unlocks">
          <div className="grid gap-2 text-sm">
            <Badge tone={access.canAutofill ? 'success' : 'default'}>Autofill: {access.canAutofill ? 'Enabled' : 'Locked'}</Badge>
            <Badge tone={access.canResumeTailor ? 'success' : 'default'}>Resume tailoring: {access.canResumeTailor ? 'Enabled' : 'Locked'}</Badge>
            <Badge tone={access.canInterviewPrep ? 'success' : 'default'}>Interview prep: {access.canInterviewPrep ? 'Enabled' : 'Locked'}</Badge>
            <Badge tone={access.canVisaRadar ? 'success' : 'default'}>Visa radar: {access.canVisaRadar ? 'Enabled' : 'Locked'}</Badge>
            <Badge tone={access.canAnalytics ? 'success' : 'default'}>Analytics: {access.canAnalytics ? 'Enabled' : 'Locked'}</Badge>
          </div>
          <div className="mt-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-600">
            <ShieldCheck className="mb-1 h-4 w-4" />
            Assistive automation only. No auto-apply behavior.
          </div>
        </Card>
      </section>

      <Card title="Profile details" subtitle="Used for autofill and tailoring">
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Full name" value={profile.fullName} onChange={(e) => upsertProfile({ fullName: e.target.value })} />
          <Input placeholder="Email" value={profile.email} onChange={(e) => upsertProfile({ email: e.target.value })} />
          <Input placeholder="Phone" value={profile.phone} onChange={(e) => upsertProfile({ phone: e.target.value })} />
          <Input placeholder="LinkedIn" value={profile.links.linkedIn} onChange={(e) => upsertProfile({ links: { linkedIn: e.target.value } })} />
        </div>
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-slate-500"><Sparkles className="h-3.5 w-3.5" /> Saved locally in browser storage.</p>
      </Card>
    </main>
  );
}

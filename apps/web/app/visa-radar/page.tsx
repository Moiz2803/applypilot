'use client';

import Link from 'next/link';
import { getFeatureAccess } from '@visa-ats/shared';
import { useAppStore } from '../../lib/store';

const mockCompanies = [
  { company: 'Nimbus Systems', likelihood: 82, explanation: 'Frequent sponsorship mentions and global hiring posts.' },
  { company: 'Atlas Compute', likelihood: 71, explanation: 'Strong international recruiting footprint and visa-positive language.' },
  { company: 'Northbridge HealthTech', likelihood: 65, explanation: 'Mixed signals but recurring OPT/CPT-friendly language.' },
  { company: 'Helio Commerce', likelihood: 58, explanation: 'Occasional sponsorship support by team and role.' },
];

export default function VisaRadarPage() {
  const { tier } = useAppStore();
  const access = getFeatureAccess(tier);

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-bold">Visa Job Radar</h1>
      {!access.canVisaRadar && (
        <p className="text-sm text-slate-700">
          Visa radar is available on Elite. <Link href="/pricing" className="text-teal">Upgrade plan</Link>.
        </p>
      )}

      <div className="grid gap-3">
        {mockCompanies.map((entry) => (
          <article key={entry.company} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-semibold">{entry.company}</p>
            <p className="text-sm">Sponsorship likelihood: {access.canVisaRadar ? `${entry.likelihood}%` : '[Locked]'}</p>
            <p className="text-xs text-slate-600">{access.canVisaRadar ? entry.explanation : 'Unlock explanation on Elite tier.'}</p>
          </article>
        ))}
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Compass, LayoutDashboard, ScanSearch } from 'lucide-react';
import { Badge, BrandLogo } from '@visa-ats/ui';

const items = [
  ['Dashboard', '/dashboard'],
  ['Analyzer', '/ats-checker'],
  ['Tailor', '/resume-tailor'],
  ['Interview Prep', '/interview-prep'],
  ['Pricing', '/pricing'],
  ['Extension', '/onboarding'],
];

export function TopNav() {
  return (
    <nav className="mb-8 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-3">
          <BrandLogo showTagline className="hidden sm:inline-flex" />
          <BrandLogo compact className="sm:hidden" />
        </Link>
        <div className="flex items-center gap-2">
          <Badge tone="info" className="hidden sm:inline-flex">SaaS Preview</Badge>
          <Badge tone="success">Local-first</Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          <LayoutDashboard className="h-4 w-4" /> Dashboard
        </Link>
        <Link href="/ats-checker" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          <ScanSearch className="h-4 w-4" /> Analyzer
        </Link>
        <Link href="/visa-radar" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
          <Compass className="h-4 w-4" /> Visa Radar
        </Link>
        {items.map(([label, href]) => (
          <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

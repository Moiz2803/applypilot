import type { ReactNode } from 'react';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

export interface BrandLogoProps {
  compact?: boolean;
  className?: string;
  markClassName?: string;
  textClassName?: string;
  showTagline?: boolean;
}

export function BrandLogo({
  compact = false,
  className,
  markClassName,
  textClassName,
  showTagline = false,
}: BrandLogoProps) {
  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <svg
        viewBox="0 0 64 64"
        role="img"
        aria-label="ApplyPilot"
        className={cn('h-9 w-9', markClassName)}
      >
        <defs>
          <linearGradient id="ap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#ap-gradient)" />
        <path d="M20 43V22h10.5c6.5 0 11 4.1 11 10.2S37 42.6 30.6 42.6H24V43z" fill="#f8fafc" />
        <path d="M24 36.2h6.1c2.8 0 4.8-1.5 4.8-4s-2-4-4.8-4H24z" fill="#1e3a8a" opacity="0.45" />
        <path d="M44 20l-7.3 24h4.8L49 20z" fill="#bfdbfe" />
      </svg>
      {!compact && (
        <div className={cn('leading-tight', textClassName)}>
          <p className="text-base font-bold tracking-tight text-slate-950">ApplyPilot</p>
          {showTagline && <p className="text-xs text-slate-500">Smarter applications. Faster offers.</p>}
        </div>
      )}
    </div>
  );
}

export function BrandWordmark({ className, children }: { className?: string; children?: ReactNode }) {
  return <span className={cn('font-semibold tracking-tight text-slate-950', className)}>{children ?? 'ApplyPilot'}</span>;
}

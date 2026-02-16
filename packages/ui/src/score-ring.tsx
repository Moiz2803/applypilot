import type { CSSProperties } from 'react';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

function scoreColor(value: number) {
  if (value < 40) return '#ef4444';
  if (value < 70) return '#f59e0b';
  return '#22c55e';
}

export interface ScoreRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  className?: string;
  trackColor?: string;
  showPercent?: boolean;
}

export function ScoreRing({
  value,
  size = 112,
  strokeWidth = 10,
  label,
  sublabel,
  className,
  trackColor = '#e2e8f0',
  showPercent = true,
}: ScoreRingProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (safeValue / 100) * circumference;

  const ringStyle: CSSProperties = {
    strokeDasharray: circumference,
    strokeDashoffset: progress,
    stroke: scoreColor(safeValue),
  };

  return (
    <div className={cn('inline-flex flex-col items-center gap-2', className)}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={ringStyle}
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-xl font-extrabold tracking-tight text-slate-900">{safeValue}{showPercent ? '%' : ''}</p>
          {sublabel && <p className="text-[11px] text-slate-500">{sublabel}</p>}
        </div>
      </div>
      {label && <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">{label}</p>}
    </div>
  );
}

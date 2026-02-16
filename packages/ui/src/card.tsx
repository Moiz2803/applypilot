import type { ReactNode } from 'react';

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(' ');
}

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function Card({ title, subtitle, children, actions, className }: CardProps) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white p-5 shadow-sm', className)}>
      {(title || actions || subtitle) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

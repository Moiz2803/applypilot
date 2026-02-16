export function Divider({ className }: { className?: string }) {
  return <hr className={`border-slate-200 ${className ?? ''}`} />;
}

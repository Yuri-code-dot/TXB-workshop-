import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { icon: ReactNode; label: string; active?: boolean }
export function IconButton({ icon, label, active, className = '', ...props }: Props) {
  return <button aria-label={label} title={label} className={`touch-target rounded-xl border border-white/10 bg-white/5 text-slate-200 active:scale-95 disabled:opacity-40 ${active ? 'bg-sky-400/20 text-sky-200 border-sky-400/40' : ''} ${className}`} {...props}>{icon}</button>;
}

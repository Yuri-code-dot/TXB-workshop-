import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-0 sm:place-items-center sm:p-6" role="dialog" aria-modal="true">
    <section className="safe-bottom w-full max-w-xl rounded-t-3xl border border-white/10 bg-[#111827] p-4 shadow-soft sm:rounded-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <button onClick={onClose} className="touch-target rounded-full bg-white/10 text-slate-200"><X size={18} /></button>
      </div>
      {children}
    </section>
  </div>;
}

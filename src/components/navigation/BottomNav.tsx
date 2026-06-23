import { Bot, Files, Settings, SquareTerminal, Code2 } from 'lucide-react';
import type { BottomPanel } from '../../models/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

const items: Array<{ id: BottomPanel; label: string; icon: typeof Files }> = [
  { id: 'explorer', label: 'Files', icon: Files }, { id: 'editor', label: 'Code', icon: Code2 }, { id: 'terminal', label: 'Term', icon: SquareTerminal }, { id: 'ai', label: 'AI', icon: Bot }, { id: 'settings', label: 'More', icon: Settings }
];

export function BottomNav() {
  const panel = useWorkspaceStore((s) => s.bottomPanel);
  const setPanel = useWorkspaceStore((s) => s.setPanel);
  return <nav className="safe-bottom fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#0b1020]/95 backdrop-blur-xl lg:hidden">
    <div className="mx-auto grid max-w-3xl grid-cols-5 px-2 py-1">
      {items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setPanel(id)} className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] ${panel === id ? 'bg-sky-400/15 text-sky-200' : 'text-slate-400'}`}>
        <Icon size={22} /><span>{label}</span>
      </button>)}
    </div>
  </nav>;
}

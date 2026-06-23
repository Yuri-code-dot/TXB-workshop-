import { useEffect } from 'react';
import { AiPanel } from '../ai/AiPanel';
import { CodeEditor } from '../editor/CodeEditor';
import { ExplorerDrawer } from '../explorer/ExplorerDrawer';
import { FileExplorer } from '../explorer/FileExplorer';
import { BottomNav } from '../navigation/BottomNav';
import { SettingsPanel } from '../settings/SettingsPanel';
import { TerminalPanel } from '../terminal/TerminalPanel';
import { TopBar } from './TopBar';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useSwipeNavigation } from '../../hooks/useSwipeNavigation';

export function AppShell() {
  const init = useWorkspaceStore((s) => s.init);
  const hydrated = useWorkspaceStore((s) => s.hydrated);
  const panel = useWorkspaceStore((s) => s.bottomPanel);
  useSwipeNavigation();
  useEffect(() => { void init(); }, [init]);
  if (!hydrated) return <div className="grid min-h-dvh place-items-center bg-[#0b1020] text-slate-300"><div className="text-center"><div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-3xl bg-sky-400/25"/><p>Loading TXB Workspace…</p></div></div>;
  return <div className="flex h-dvh flex-col overflow-hidden bg-[#0b1020] text-slate-100">
    <TopBar />
    <main className="min-h-0 flex flex-1 overflow-hidded flex-col lg:flex-row">
      <FileExplorer />
      <section className="min-w-0 flex-1">
        <div className="hidden h-full lg:block"><CodeEditor /></div>
        <div className="h-full lg:hidden">{panel === 'explorer' && <FileExplorer drawer />}{panel === 'editor' && <CodeEditor />}{panel === 'terminal' && <TerminalPanel />}{panel === 'ai' && <AiPanel />}{panel === 'settings' && <SettingsPanel />}</div>
      </section>
      <aside className="hidden w-[360px] border-l border-white/10 xl:block"><AiPanel /></aside>
    </main>
    <ExplorerDrawer />
    <BottomNav />
  </div>;
}

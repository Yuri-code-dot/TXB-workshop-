import { useWorkspaceStore } from '../../store/workspaceStore';
import { FileExplorer } from './FileExplorer';

export function ExplorerDrawer() {
  const open = useWorkspaceStore((s) => s.explorerOpen);
  const toggle = useWorkspaceStore((s) => s.toggleExplorer);
  if (!open) return null;
  return <div className="fixed inset-0 z-50 lg:hidden">
    <button aria-label="Close explorer" className="absolute inset-0 bg-black/55" onClick={() => toggle(false)} />
    <div className="safe-top safe-bottom absolute left-0 top-0 h-full w-[88vw] max-w-sm shadow-soft"><FileExplorer drawer /></div>
  </div>;
}

import { X } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export function EditorTabs() {
  const tabs = useWorkspaceStore((s) => s.tabs);
  const active = useWorkspaceStore((s) => s.activeFileId);
  const openFile = useWorkspaceStore((s) => s.openFile);
  const closeTab = useWorkspaceStore((s) => s.closeTab);
  return <div className="thin-scroll flex h-11 shrink-0 gap-1 overflow-x-auto border-b border-white/10 bg-[#0f172a] px-2 py-1">
    {tabs.map((tab) => <button key={tab.fileId} onClick={() => openFile(tab.fileId)} className={`flex max-w-[190px] shrink-0 items-center gap-2 rounded-xl px-3 text-xs ${active === tab.fileId ? 'bg-[#1f2a44] text-white' : 'bg-white/5 text-slate-400'}`}>
      <span className="truncate">{tab.name}{tab.dirty ? ' •' : ''}</span>
      <span onClick={(e) => { e.stopPropagation(); closeTab(tab.fileId); }} className="grid h-7 w-7 place-items-center rounded-lg active:bg-white/10"><X size={14}/></span>
    </button>)}
  </div>;
}

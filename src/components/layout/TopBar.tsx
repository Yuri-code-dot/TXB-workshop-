import { Download, FilePlus2, FolderPlus, Menu, Save, Search } from 'lucide-react';
import { useState } from 'react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { IconButton } from '../common/IconButton';
import { exportJSON, exportZIP } from '../../services/exportService';

export function TopBar() {
  const [menu, setMenu] = useState(false);
  const project = useWorkspaceStore((s) => s.currentProject);
  const files = useWorkspaceStore((s) => s.files);
  const saveActive = useWorkspaceStore((s) => s.saveActive);
  const toggleExplorer = useWorkspaceStore((s) => s.toggleExplorer);
  const createNode = useWorkspaceStore((s) => s.createNode);
  const setSearch = useWorkspaceStore((s) => s.setSearch);
  return <header className="safe-top sticky top-0 z-30 border-b border-white/10 bg-[#0b1020]/95 backdrop-blur-xl">
    <div className="flex h-14 items-center gap-2 px-3">
      <button onClick={() => toggleExplorer()} className="touch-target rounded-xl bg-white/5 text-slate-200 lg:hidden"><Menu size={21} /></button>
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-white">{project?.name ?? 'TXB Workspace'}</p><p className="truncate text-[11px] text-slate-400">Mobile IDE · Offline IndexedDB · PWA</p></div>
      <IconButton label="Save" icon={<Save size={18} />} onClick={saveActive} className="grid place-items-center" />
      <IconButton label="Search" icon={<Search size={18} />} onClick={() => { const q = prompt('Search files'); if (q !== null) setSearch(q); }} className="grid place-items-center" />
      <button onClick={() => setMenu(!menu)} className="touch-target rounded-xl bg-sky-400/15 px-3 text-sm text-sky-100"><Download size={18} /></button>
    </div>
    {menu && <div className="absolute right-2 top-full z-40 w-56 rounded-2xl border border-white/10 bg-[#111827] p-2 shadow-soft">
      <button className="menu-item" onClick={() => { const n = prompt('File name'); if (n) void createNode(null, 'file', n); }}> <FilePlus2 size={16}/> New root file</button>
      <button className="menu-item" onClick={() => { const n = prompt('Folder name'); if (n) void createNode(null, 'folder', n); }}> <FolderPlus size={16}/> New root folder</button>
      <button className="menu-item" onClick={() => project && exportJSON(project, files)}>Export JSON</button>
      <button className="menu-item" onClick={() => project && void exportZIP(project, files)}>Export ZIP</button>
    </div>}
  </header>;
}

import { FilePlus2, FolderPlus, Search, X } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { FileTree } from './FileTree';

export function FileExplorer({ drawer = false }: { drawer?: boolean }) {
  const search = useWorkspaceStore((s) => s.search);
  const setSearch = useWorkspaceStore((s) => s.setSearch);
  const createNode = useWorkspaceStore((s) => s.createNode);
  const toggleExplorer = useWorkspaceStore((s) => s.toggleExplorer);
  return <aside className={`${drawer ? 'h-full' : 'hidden h-full lg:flex'} w-full flex-col border-r border-white/10 bg-[#111827] lg:w-80`}>
    <div className="flex h-14 items-center gap-2 border-b border-white/10 px-3">
      <h2 className="flex-1 text-sm font-semibold uppercase tracking-wide text-slate-300">Explorer</h2>
      <button className="touch-target rounded-xl bg-white/5 text-slate-300" onClick={() => { const n = prompt('File name'); if (n) void createNode(null, 'file', n); }}><FilePlus2 size={18}/></button>
      <button className="touch-target rounded-xl bg-white/5 text-slate-300" onClick={() => { const n = prompt('Folder name'); if (n) void createNode(null, 'folder', n); }}><FolderPlus size={18}/></button>
      {drawer && <button className="touch-target rounded-xl bg-white/5 text-slate-300" onClick={() => toggleExplorer(false)}><X size={18}/></button>}
    </div>
    <div className="p-3"><label className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-slate-400"><Search size={16}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files" className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none" /></label></div>
    <div className="thin-scroll flex-1 overflow-auto px-2 pb-28 lg:pb-4"><FileTree /></div>
  </aside>;
}

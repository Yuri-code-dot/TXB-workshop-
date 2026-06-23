import { ChevronRight, File, Folder, FolderOpen, MoreVertical } from 'lucide-react';
import type { FileNode } from '../../models/workspace';
import { childrenOf } from '../../lib/path';
import { useWorkspaceStore } from '../../store/workspaceStore';

export function FileTree({ parentId = null, depth = 0 }: { parentId?: string | null; depth?: number }) {
  const files = useWorkspaceStore((s) => s.files);
  const search = useWorkspaceStore((s) => s.search.toLowerCase());
  const nodes = childrenOf(files, parentId).filter((node) => !search || node.path.toLowerCase().includes(search) || node.kind === 'folder');
  return <div>{nodes.map((node) => <TreeNode key={node.id} node={node} depth={depth} />)}</div>;
}

function TreeNode({ node, depth }: { node: FileNode; depth: number }) {
  const expanded = useWorkspaceStore((s) => s.expandedFolders[node.id] ?? depth < 1);
  const activeFileId = useWorkspaceStore((s) => s.activeFileId);
  const openFile = useWorkspaceStore((s) => s.openFile);
  const toggleFolder = useWorkspaceStore((s) => s.toggleFolder);
  const createNode = useWorkspaceStore((s) => s.createNode);
  const renameNode = useWorkspaceStore((s) => s.renameNode);
  const deleteNode = useWorkspaceStore((s) => s.deleteNode);
  const moveNode = useWorkspaceStore((s) => s.moveNode);
  const onMore = () => {
    const action = prompt(`${node.path}\nActions: new-file, new-folder, rename, delete`);
    if (action === 'new-file' && node.kind === 'folder') { const n = prompt('File name'); if (n) void createNode(node.id, 'file', n); }
    if (action === 'new-folder' && node.kind === 'folder') { const n = prompt('Folder name'); if (n) void createNode(node.id, 'folder', n); }
    if (action === 'rename') { const n = prompt('New name', node.name); if (n) void renameNode(node.id, n); }
    if (action === 'delete' && confirm(`Delete ${node.name}?`)) void deleteNode(node.id);
  };
  return <div>
    <div draggable onDragStart={(e) => e.dataTransfer.setData('text/file-id', node.id)} onDragOver={(e) => node.kind === 'folder' && e.preventDefault()} onDrop={(e) => { const id = e.dataTransfer.getData('text/file-id'); if (id && node.kind === 'folder') void moveNode(id, node.id); }} className={`group flex min-h-[42px] items-center gap-2 rounded-xl pr-1 text-sm ${activeFileId === node.id ? 'bg-sky-400/15 text-sky-100' : 'text-slate-300 active:bg-white/10'}`} style={{ paddingLeft: 8 + depth * 16 }}>
      <button className="grid h-9 w-7 place-items-center" onClick={() => node.kind === 'folder' ? toggleFolder(node.id) : openFile(node.id)}>{node.kind === 'folder' ? <ChevronRight size={16} className={expanded ? 'rotate-90' : ''} /> : null}</button>
      <button className="flex min-w-0 flex-1 items-center gap-2 py-2 text-left" onClick={() => node.kind === 'folder' ? toggleFolder(node.id) : openFile(node.id)}>{node.kind === 'folder' ? expanded ? <FolderOpen size={18} className="text-sky-300" /> : <Folder size={18} className="text-sky-300" /> : <File size={17} className="text-slate-400" />}<span className="truncate">{node.name}</span></button>
      <button onClick={onMore} className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 active:bg-white/10"><MoreVertical size={16} /></button>
    </div>
    {node.kind === 'folder' && expanded && <FileTree parentId={node.id} depth={depth + 1} />}
  </div>;
}

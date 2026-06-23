import { Download, Upload, Plus, Trash2 } from 'lucide-react';
import { PROJECT_TEMPLATES } from '../../templates/templates';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { exportJSON, exportZIP } from '../../services/exportService';
import { parseWorkspaceJSON } from '../../services/importService';

export function SettingsPanel() {
  const project = useWorkspaceStore((s) => s.currentProject);
  const files = useWorkspaceStore((s) => s.files);
  const projects = useWorkspaceStore((s) => s.projects);
  const createProject = useWorkspaceStore((s) => s.createProject);
  const openProject = useWorkspaceStore((s) => s.openProject);
  const deleteProject = useWorkspaceStore((s) => s.deleteProject);
  const importProject = useWorkspaceStore((s) => s.importProject);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const settings = project?.settings;
  return <section className="thin-scroll h-full overflow-auto bg-[#0b1020] p-4 pb-28 text-slate-200 lg:pb-4">
    <h2 className="mb-4 text-xl font-bold text-white">Workspace</h2>
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="card"><h3 className="card-title">Projects</h3><div className="space-y-2">{projects.map((p) => <div key={p.id} className="flex items-center gap-2 rounded-2xl bg-white/5 p-2"><button className="min-w-0 flex-1 text-left" onClick={() => void openProject(p.id)}><p className="truncate text-sm text-white">{p.name}</p><p className="text-[11px] text-slate-400">{p.template}</p></button><button onClick={() => confirm('Delete project?') && void deleteProject(p.id)}><Trash2 size={16}/></button></div>)}</div></div>
      <div className="card"><h3 className="card-title">New Project</h3><div className="grid grid-cols-2 gap-2">{PROJECT_TEMPLATES.map((t) => <button key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-left active:bg-white/10" onClick={() => { const n = prompt('Project name', t.name); if (n) void createProject(n, t.id); }}><Plus size={16}/><p className="mt-2 text-sm text-white">{t.name}</p><p className="text-[11px] text-slate-400">{t.description}</p></button>)}</div></div>
      <div className="card"><h3 className="card-title">Import / Export</h3><div className="flex flex-wrap gap-2"><button className="action" onClick={() => project && exportJSON(project, files)}><Download size={16}/>JSON</button><button className="action" onClick={() => project && void exportZIP(project, files)}><Download size={16}/>ZIP</button><label className="action"><Upload size={16}/>Import JSON<input hidden type="file" accept=".json,.txb.json,application/json" onChange={(e) => { const file = e.target.files?.[0]; if (file) void parseWorkspaceJSON(file).then(({ project, files }) => importProject(project, files)); }}/></label></div></div>
      <div className="card"><h3 className="card-title">Editor Settings</h3>{settings && <div className="space-y-3 text-sm"><label className="setting"><span>Font size</span><input type="range" min="12" max="22" value={settings.fontSize} onChange={(e) => void updateSettings({ fontSize: Number(e.target.value) })}/></label><label className="setting"><span>Word wrap</span><input type="checkbox" checked={settings.wordWrap} onChange={(e) => void updateSettings({ wordWrap: e.target.checked })}/></label><label className="setting"><span>Minimap</span><input type="checkbox" checked={settings.minimap} onChange={(e) => void updateSettings({ minimap: e.target.checked })}/></label><label className="setting"><span>Auto save</span><input type="checkbox" checked={settings.autoSave} onChange={(e) => void updateSettings({ autoSave: e.target.checked })}/></label></div>}</div>
    </div>
  </section>;
}

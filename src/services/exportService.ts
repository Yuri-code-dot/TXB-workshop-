import JSZip from 'jszip';
import type { FileNode, Project, WorkspaceExport } from '../models/workspace';

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSON(project: Project, files: FileNode[]) {
  const payload: WorkspaceExport = { version: 1, exportedAt: Date.now(), project, files };
  downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${project.name.replace(/\s+/g, '-')}.txb.json`);
}

export async function exportZIP(project: Project, files: FileNode[]) {
  const zip = new JSZip();
  files.filter((file) => file.kind === 'file').forEach((file) => zip.file(file.path, file.content ?? ''));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, `${project.name.replace(/\s+/g, '-')}.zip`);
}

import type { FileNode, Project, WorkspaceExport } from '../models/workspace';
import { createId } from '../lib/id';

export async function parseWorkspaceJSON(file: File): Promise<{ project: Project; files: FileNode[] }> {
  const payload = JSON.parse(await file.text()) as WorkspaceExport;
  const now = Date.now();
  const newProjectId = createId('project');
  const idMap = new Map<string, string>();
  payload.files.forEach((node) => idMap.set(node.id, createId('file')));
  return {
    project: { ...payload.project, id: newProjectId, name: `${payload.project.name} Import`, createdAt: now, updatedAt: now, lastOpenedAt: now },
    files: payload.files.map((node) => ({ ...node, id: idMap.get(node.id)!, projectId: newProjectId, parentId: node.parentId ? idMap.get(node.parentId) ?? null : null, createdAt: now, updatedAt: now }))
  };
}

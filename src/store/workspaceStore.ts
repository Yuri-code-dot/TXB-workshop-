import { create } from 'zustand';
import type { AiIntent, AiMessage } from '../models/ai';
import type { BottomPanel, EditorTab, FileNode, Project, ProjectTemplateId, WorkspaceSettings } from '../models/workspace';
import { buildPaths } from '../lib/path';
import { createId } from '../lib/id';
import { languageFromName } from '../lib/language';
import { instantiateTemplate } from '../templates/templates';
import * as db from '../core/db/indexedDb';
import { runLocalAssistant } from '../core/ai/assistant';

interface WorkspaceState {
  hydrated: boolean;
  projects: Project[];
  currentProject?: Project;
  files: FileNode[];
  tabs: EditorTab[];
  activeFileId?: string;
  bottomPanel: BottomPanel;
  explorerOpen: boolean;
  search: string;
  expandedFolders: Record<string, boolean>;
  aiMessages: AiMessage[];
  terminalSplit: boolean;
  init: () => Promise<void>;
  createProject: (name: string, template: ProjectTemplateId) => Promise<void>;
  importProject: (project: Project, files: FileNode[]) => Promise<void>;
  openProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  setPanel: (panel: BottomPanel) => void;
  toggleExplorer: (open?: boolean) => void;
  createNode: (parentId: string | null, kind: 'file' | 'folder', name: string) => Promise<void>;
  renameNode: (id: string, name: string) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  moveNode: (id: string, parentId: string | null) => Promise<void>;
  openFile: (fileId: string) => void;
  closeTab: (fileId: string) => void;
  updateContent: (fileId: string, content: string) => Promise<void>;
  saveActive: () => Promise<void>;
  setSearch: (search: string) => void;
  toggleFolder: (id: string) => void;
  updateSettings: (settings: Partial<WorkspaceSettings>) => Promise<void>;
  runAi: (intent: AiIntent, prompt: string) => Promise<void>;
  clearAi: () => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  hydrated: false,
  projects: [],
  files: [],
  tabs: [],
  bottomPanel: 'editor',
  explorerOpen: false,
  search: '',
  expandedFolders: {},
  aiMessages: [],
  terminalSplit: false,
  init: async () => {
    let projects = (await db.getProjects()).sort((a, b) => b.lastOpenedAt - a.lastOpenedAt);
    if (!projects.length) {
      const created = instantiateTemplate('TXB Starter', 'txb');
      await db.saveProject(created.project, created.files);
      projects = [created.project];
    }
    set({ projects, hydrated: true });
    await get().openProject(projects[0].id);
  },
  createProject: async (name, template) => {
    const created = instantiateTemplate(name.trim() || 'Untitled Project', template);
    await db.saveProject(created.project, created.files);
    set((state) => ({ projects: [created.project, ...state.projects] }));
    await get().openProject(created.project.id);
  },
  importProject: async (project, files) => {
    await db.saveProject(project, files);
    set((state) => ({ projects: [project, ...state.projects] }));
    await get().openProject(project.id);
  },
  openProject: async (projectId) => {
    const project = await db.getProject(projectId);
    if (!project) return;
    const nowProject = { ...project, lastOpenedAt: Date.now() };
    await db.putProject(nowProject);
    const files = buildPaths(await db.getProjectFiles(projectId));
    const aiMessages = (await db.getAiMessages(projectId)).sort((a, b) => a.createdAt - b.createdAt);
    const firstFile = files.find((f) => f.kind === 'file');
    set({ currentProject: nowProject, files, tabs: firstFile ? [{ fileId: firstFile.id, path: firstFile.path, name: firstFile.name, dirty: false, language: firstFile.language }] : [], activeFileId: firstFile?.id, aiMessages, explorerOpen: false, projects: get().projects.map((p) => p.id === projectId ? nowProject : p).sort((a, b) => b.lastOpenedAt - a.lastOpenedAt) });
  },
  deleteProject: async (projectId) => {
    await db.deleteProject(projectId);
    const projects = get().projects.filter((p) => p.id !== projectId);
    set({ projects });
    if (get().currentProject?.id === projectId) {
      if (projects[0]) await get().openProject(projects[0].id);
      else set({ currentProject: undefined, files: [], tabs: [], activeFileId: undefined });
    }
  },
  setPanel: (panel) => set({ bottomPanel: panel, explorerOpen: panel === 'explorer' ? true : get().explorerOpen }),
  toggleExplorer: (open) => set((state) => ({ explorerOpen: open ?? !state.explorerOpen })),
  createNode: async (parentId, kind, name) => {
    const project = get().currentProject;
    if (!project) return;
    const now = Date.now();
    const node: FileNode = { id: createId('file'), projectId: project.id, parentId, name, kind, content: kind === 'file' ? '' : undefined, language: kind === 'file' ? languageFromName(name) : undefined, path: name, createdAt: now, updatedAt: now, order: get().files.length + 1 };
    const files = buildPaths([...get().files, node]);
    const saved = files.find((f) => f.id === node.id)!;
    await db.putFile(saved);
    set({ files, expandedFolders: parentId ? { ...get().expandedFolders, [parentId]: true } : get().expandedFolders });
    if (kind === 'file') get().openFile(saved.id);
  },
  renameNode: async (id, name) => {
    const files = buildPaths(get().files.map((f) => f.id === id ? { ...f, name, language: f.kind === 'file' ? languageFromName(name) : f.language, updatedAt: Date.now() } : f));
    await Promise.all(files.map((f) => db.putFile(f)));
    set((state) => ({ files, tabs: state.tabs.map((tab) => { const file = files.find((f) => f.id === tab.fileId); return file ? { ...tab, name: file.name, path: file.path, language: file.language } : tab; }) }));
  },
  deleteNode: async (id) => {
    const all = get().files;
    const collect = (nodeId: string): string[] => [nodeId, ...all.filter((f) => f.parentId === nodeId).flatMap((f) => collect(f.id))];
    const ids = new Set(collect(id));
    await Promise.all([...ids].map(db.deleteFileRecord));
    set((state) => ({ files: state.files.filter((f) => !ids.has(f.id)), tabs: state.tabs.filter((t) => !ids.has(t.fileId)), activeFileId: ids.has(state.activeFileId ?? '') ? state.tabs.find((t) => !ids.has(t.fileId))?.fileId : state.activeFileId }));
  },
  moveNode: async (id, parentId) => {
    if (id === parentId) return;
    const files = buildPaths(get().files.map((f) => f.id === id ? { ...f, parentId, updatedAt: Date.now() } : f));
    await Promise.all(files.map((f) => db.putFile(f)));
    set({ files });
  },
  openFile: (fileId) => {
    const file = get().files.find((f) => f.id === fileId && f.kind === 'file');
    if (!file) return;
    set((state) => ({ activeFileId: fileId, bottomPanel: 'editor', explorerOpen: false, tabs: state.tabs.some((t) => t.fileId === fileId) ? state.tabs : [...state.tabs, { fileId, path: file.path, name: file.name, dirty: false, language: file.language }] }));
  },
  closeTab: (fileId) => set((state) => { const tabs = state.tabs.filter((t) => t.fileId !== fileId); return { tabs, activeFileId: state.activeFileId === fileId ? tabs.at(-1)?.fileId : state.activeFileId }; }),
  updateContent: async (fileId, content) => {
    const files = get().files.map((f) => f.id === fileId ? { ...f, content, updatedAt: Date.now() } : f);
    set((state) => ({ files, tabs: state.tabs.map((t) => t.fileId === fileId ? { ...t, dirty: true } : t) }));
    if (get().currentProject?.settings.autoSave) {
      const file = files.find((f) => f.id === fileId);
      if (file) await db.putFile(file);
      set((state) => ({ tabs: state.tabs.map((t) => t.fileId === fileId ? { ...t, dirty: false } : t) }));
    }
  },
  saveActive: async () => {
    const active = get().files.find((f) => f.id === get().activeFileId);
    if (active) await db.putFile(active);
    set((state) => ({ tabs: state.tabs.map((t) => t.fileId === active?.id ? { ...t, dirty: false } : t) }));
  },
  setSearch: (search) => set({ search }),
  toggleFolder: (id) => set((state) => ({ expandedFolders: { ...state.expandedFolders, [id]: !state.expandedFolders[id] } })),
  updateSettings: async (settings) => {
    const project = get().currentProject;
    if (!project) return;
    const updated = { ...project, settings: { ...project.settings, ...settings }, updatedAt: Date.now() };
    await db.putProject(updated);
    set({ currentProject: updated, terminalSplit: updated.settings.terminalSplit });
  },
  runAi: async (intent, prompt) => {
    const state = get();
    const project = state.currentProject;
    if (!project) return;
    const user: AiMessage = { id: createId('msg'), role: 'user', content: prompt || intent, createdAt: Date.now(), intent };
    set({ aiMessages: [...state.aiMessages, user] });
    await db.putAiMessage({ ...user, projectId: project.id });
    const active = state.files.find((f) => f.id === state.activeFileId);
    const response = await runLocalAssistant(intent, prompt, { projectName: project.name, activePath: active?.path, activeCode: active?.content, files: state.files.filter((f) => f.kind === 'file').map((f) => ({ path: f.path, language: f.language, content: f.content?.slice(0, 1000) })) });
    const assistant: AiMessage = { id: createId('msg'), role: 'assistant', content: response, createdAt: Date.now(), intent };
    await db.putAiMessage({ ...assistant, projectId: project.id });
    set((s) => ({ aiMessages: [...s.aiMessages, assistant] }));
  },
  clearAi: async () => { const id = get().currentProject?.id; if (id) await db.clearAiMessages(id); set({ aiMessages: [] }); }
}));

export const selectActiveFile = (state: WorkspaceState) => state.files.find((file) => file.id === state.activeFileId);

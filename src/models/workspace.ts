export type FileNodeKind = 'file' | 'folder';
export type BottomPanel = 'explorer' | 'editor' | 'terminal' | 'ai' | 'settings';
export type ProjectTemplateId = 'html' | 'react' | 'vite' | 'node' | 'python' | 'txb';

export interface FileNode {
  id: string;
  projectId: string;
  parentId: string | null;
  name: string;
  kind: FileNodeKind;
  content?: string;
  language?: string;
  path: string;
  createdAt: number;
  updatedAt: number;
  order: number;
}

export interface Project {
  id: string;
  name: string;
  template: ProjectTemplateId;
  description?: string;
  createdAt: number;
  updatedAt: number;
  lastOpenedAt: number;
  settings: WorkspaceSettings;
}

export interface WorkspaceSettings {
  theme: 'dark' | 'contrast';
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  autoSave: boolean;
  haptics: boolean;
  terminalSplit: boolean;
  compactExplorer: boolean;
  aiProvider: 'local' | 'custom';
  customAiEndpoint?: string;
}

export interface EditorTab {
  fileId: string;
  path: string;
  name: string;
  dirty: boolean;
  language?: string;
}

export interface RecentProject {
  projectId: string;
  name: string;
  openedAt: number;
}

export interface WorkspaceExport {
  version: 1;
  exportedAt: number;
  project: Project;
  files: FileNode[];
}

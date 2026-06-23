import type { FileNode, Project, RecentProject } from '../../models/workspace';
import type { AiMessage } from '../../models/ai';

export const DB_NAME = 'txb-workspace-db';
export const DB_VERSION = 1;

export interface TXBWorkspaceDB {
  projects: Project;
  files: FileNode;
  recentProjects: RecentProject;
  aiMessages: AiMessage & { projectId: string };
  kv: { key: string; value: unknown };
}

export const stores = {
  projects: 'projects',
  files: 'files',
  recentProjects: 'recentProjects',
  aiMessages: 'aiMessages',
  kv: 'kv'
} as const;

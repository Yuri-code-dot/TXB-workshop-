import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AiMessage } from '../../models/ai';
import type { FileNode, Project, RecentProject } from '../../models/workspace';
import { DB_NAME, DB_VERSION } from './schema';

interface TXBDB extends DBSchema {
  projects: { key: string; value: Project; indexes: { 'by-lastOpenedAt': number } };
  files: { key: string; value: FileNode; indexes: { 'by-project': string; 'by-parent': string; 'by-path': [string, string] } };
  recentProjects: { key: string; value: RecentProject; indexes: { 'by-openedAt': number } };
  aiMessages: { key: string; value: AiMessage & { projectId: string }; indexes: { 'by-project': string } };
  kv: { key: string; value: { key: string; value: unknown } };
}

let dbPromise: Promise<IDBPDatabase<TXBDB>> | undefined;

export function db() {
  dbPromise ??= openDB<TXBDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains('projects')) {
        const store = database.createObjectStore('projects', { keyPath: 'id' });
        store.createIndex('by-lastOpenedAt', 'lastOpenedAt');
      }
      if (!database.objectStoreNames.contains('files')) {
        const store = database.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('by-project', 'projectId');
        store.createIndex('by-parent', 'parentId');
        store.createIndex('by-path', ['projectId', 'path'], { unique: true });
      }
      if (!database.objectStoreNames.contains('recentProjects')) {
        const store = database.createObjectStore('recentProjects', { keyPath: 'projectId' });
        store.createIndex('by-openedAt', 'openedAt');
      }
      if (!database.objectStoreNames.contains('aiMessages')) {
        const store = database.createObjectStore('aiMessages', { keyPath: 'id' });
        store.createIndex('by-project', 'projectId');
      }
      if (!database.objectStoreNames.contains('kv')) database.createObjectStore('kv', { keyPath: 'key' });
    }
  });
  return dbPromise;
}

export async function saveProject(project: Project, files?: FileNode[]) {
  const database = await db();
  const tx = database.transaction(['projects', 'files', 'recentProjects'], 'readwrite');
  await tx.objectStore('projects').put(project);
  await tx.objectStore('recentProjects').put({ projectId: project.id, name: project.name, openedAt: project.lastOpenedAt });
  if (files) await Promise.all(files.map((file) => tx.objectStore('files').put(file)));
  await tx.done;
}

export async function getProjects() { return (await db()).getAll('projects'); }
export async function getRecentProjects() { return (await db()).getAllFromIndex('recentProjects', 'by-openedAt'); }
export async function getProject(id: string) { return (await db()).get('projects', id); }
export async function getProjectFiles(projectId: string) { return (await db()).getAllFromIndex('files', 'by-project', projectId); }
export async function putFile(file: FileNode) { return (await db()).put('files', file); }
export async function deleteFileRecord(id: string) { return (await db()).delete('files', id); }
export async function putProject(project: Project) { return (await db()).put('projects', project); }

export async function deleteProject(projectId: string) {
  const database = await db();
  const files = await getProjectFiles(projectId);
  const tx = database.transaction(['projects', 'files', 'recentProjects', 'aiMessages'], 'readwrite');
  await tx.objectStore('projects').delete(projectId);
  await tx.objectStore('recentProjects').delete(projectId);
  await Promise.all(files.map((file) => tx.objectStore('files').delete(file.id)));
  const messages = await tx.objectStore('aiMessages').index('by-project').getAll(projectId);
  await Promise.all(messages.map((message) => tx.objectStore('aiMessages').delete(message.id)));
  await tx.done;
}

export async function getAiMessages(projectId: string) { return (await db()).getAllFromIndex('aiMessages', 'by-project', projectId); }
export async function putAiMessage(message: AiMessage & { projectId: string }) { return (await db()).put('aiMessages', message); }
export async function clearAiMessages(projectId: string) {
  const database = await db();
  const messages = await getAiMessages(projectId);
  const tx = database.transaction('aiMessages', 'readwrite');
  await Promise.all(messages.map((message) => tx.store.delete(message.id)));
  await tx.done;
}

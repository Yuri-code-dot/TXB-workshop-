import type { FileNode } from '../models/workspace';

export const normalizePath = (path: string) => path.replace(/\/+/g, '/').replace(/\/\//g, '/').replace(/^\//, '');

export function buildPaths(nodes: FileNode[]): FileNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const pathFor = (node: FileNode): string => {
    if (!node.parentId) return node.name;
    const parent = byId.get(node.parentId);
    return parent ? `${pathFor(parent)}/${node.name}` : node.name;
  };
  return nodes.map((node) => ({ ...node, path: normalizePath(pathFor(node)) }));
}

export function childrenOf(nodes: FileNode[], parentId: string | null) {
  return nodes.filter((node) => node.parentId === parentId).sort((a, b) => (a.kind === b.kind ? a.order - b.order || a.name.localeCompare(b.name) : a.kind === 'folder' ? -1 : 1));
}

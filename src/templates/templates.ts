import type { FileNode, Project, ProjectTemplateId } from '../models/workspace';
import { createId } from '../lib/id';
import { languageFromName } from '../lib/language';
import { buildPaths } from '../lib/path';

export interface ProjectTemplate { id: ProjectTemplateId; name: string; description: string; files: Array<{ path: string; content: string }> }

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { id: 'html', name: 'HTML Starter', description: 'Single page HTML/CSS/JS app.', files: [
    { path: 'index.html', content: '<!doctype html>\n<html>\n  <head>\n    <meta name="viewport" content="width=device-width, initial-scale=1" />\n    <title>TXB HTML Starter</title>\n    <link rel="stylesheet" href="style.css" />\n  </head>\n  <body>\n    <main>\n      <h1>TXB Workspace</h1>\n      <p>Edit this file on mobile.</p>\n      <button id="run">Run</button>\n    </main>\n    <script src="app.js"></script>\n  </body>\n</html>\n' },
    { path: 'style.css', content: 'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1020; color: white; font-family: system-ui; }\nbutton { padding: 12px 18px; border-radius: 12px; border: 0; background: #38bdf8; }\n' },
    { path: 'app.js', content: 'document.querySelector("#run").addEventListener("click", () => alert("Hello from TXB Workspace"));\n' }
  ] },
  { id: 'react', name: 'React Starter', description: 'React app with component structure.', files: [
    { path: 'package.json', content: '{\n  "scripts": { "dev": "vite", "build": "vite build" },\n  "dependencies": { "@vitejs/plugin-react": "latest", "vite": "latest", "react": "latest", "react-dom": "latest" },\n  "devDependencies": { "typescript": "latest" }\n}\n' },
    { path: 'src/App.tsx', content: 'export default function App() {\n  return <h1>TXB React Starter</h1>;\n}\n' },
    { path: 'src/main.tsx', content: 'import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App";\ncreateRoot(document.getElementById("root")!).render(<App />);\n' },
    { path: 'index.html', content: '<div id="root"></div><script type="module" src="/src/main.tsx"></script>\n' }
  ] },
  { id: 'vite', name: 'Vite Starter', description: 'Vite TypeScript starter.', files: [
    { path: 'package.json', content: '{\n  "type": "module",\n  "scripts": { "dev": "vite", "build": "tsc && vite build" },\n  "devDependencies": { "vite": "latest", "typescript": "latest" }\n}\n' },
    { path: 'src/main.ts', content: 'const app = document.querySelector<HTMLDivElement>("#app")!;\napp.innerHTML = `<h1>TXB Vite Starter</h1>`;\n' },
    { path: 'index.html', content: '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n' }
  ] },
  { id: 'node', name: 'Node Starter', description: 'Node API starter.', files: [
    { path: 'package.json', content: '{\n  "type": "module",\n  "scripts": { "start": "node src/server.js" }\n}\n' },
    { path: 'src/server.js', content: 'import http from "node:http";\nconst server = http.createServer((req, res) => {\n  res.end(JSON.stringify({ ok: true, path: req.url }));\n});\nserver.listen(3000, () => console.log("Server on :3000"));\n' }
  ] },
  { id: 'python', name: 'Python Starter', description: 'Python script starter.', files: [
    { path: 'main.py', content: 'def main():\n    print("Hello from TXB Python Starter")\n\nif __name__ == "__main__":\n    main()\n' },
    { path: 'README.md', content: '# Python Starter\n\nRun with `python main.py`.\n' }
  ] },
  { id: 'txb', name: 'TXB Starter', description: 'TensoraMax/TXB-ready app scaffold.', files: [
    { path: 'txb.config.json', content: '{\n  "name": "txb-app",\n  "modules": ["workspace", "agent-framework", "knowledge-base"],\n  "version": "0.1.0"\n}\n' },
    { path: 'src/app.txb.ts', content: 'export const txbApp = {\n  name: "TXB Starter",\n  actions: ["generate", "analyze", "launch"]\n};\n' },
    { path: 'README.md', content: '# TXB Starter\n\nA mobile-first TXB Workspace project prepared for TensoraMax Studio modules.\n' }
  ] }
];

export const defaultSettings = () => ({ theme: 'dark' as const, fontSize: 14, tabSize: 2, wordWrap: true, minimap: false, autoSave: true, haptics: true, terminalSplit: false, compactExplorer: false, aiProvider: 'local' as const });

export function instantiateTemplate(name: string, templateId: ProjectTemplateId): { project: Project; files: FileNode[] } {
  const now = Date.now();
  const projectId = createId('project');
  const template = PROJECT_TEMPLATES.find((t) => t.id === templateId) ?? PROJECT_TEMPLATES[0];
  const folderByPath = new Map<string, FileNode>();
  const files: FileNode[] = [];
  const ensureFolder = (folderPath: string): FileNode => {
    const cached = folderByPath.get(folderPath);
    if (cached) return cached;
    const parts = folderPath.split('/');
    const folderName = parts.at(-1)!;
    const parentPath = parts.slice(0, -1).join('/');
    const parent = parentPath ? ensureFolder(parentPath) : null;
    const node: FileNode = { id: createId('file'), projectId, parentId: parent?.id ?? null, name: folderName, kind: 'folder', path: folderPath, createdAt: now, updatedAt: now, order: files.length };
    folderByPath.set(folderPath, node);
    files.push(node);
    return node;
  };
  template.files.forEach((entry, index) => {
    const parts = entry.path.split('/');
    const fileName = parts.pop()!;
    const parent = parts.length ? ensureFolder(parts.join('/')) : null;
    files.push({ id: createId('file'), projectId, parentId: parent?.id ?? null, name: fileName, kind: 'file', content: entry.content, language: languageFromName(fileName), path: entry.path, createdAt: now, updatedAt: now, order: index + 100 });
  });
  const project: Project = { id: projectId, name, template: template.id, description: template.description, createdAt: now, updatedAt: now, lastOpenedAt: now, settings: defaultSettings() };
  return { project, files: buildPaths(files) };
}

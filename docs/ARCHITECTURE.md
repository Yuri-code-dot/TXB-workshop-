# TXB Workspace Architecture

## Stack
React, TypeScript, Vite, Monaco Editor, Zustand, IndexedDB, Tailwind CSS, PWA, JSZip.

## Component Architecture
- `AppShell`: responsive application frame.
- `TopBar`: project actions, save, search, exports.
- `BottomNav`: thumb-first mobile navigation.
- `FileExplorer`: creation, search, rename, delete, drag/drop, collapsible folders.
- `CodeEditor`: Monaco editor, tabs, autosave, find, word wrap, minimap toggle.
- `TerminalPanel`: simulated mobile terminal and split mode.
- `AiPanel`: TXB AI assistant with project context.
- `SettingsPanel`: projects, templates, import/export, workspace settings.

## State Management
Zustand store owns hydrated state, projects, files, tabs, active file, UI panel, explorer drawer, expanded folders, AI messages, settings, and mutations. IndexedDB is the persistence boundary.

## IndexedDB Schema
- `projects`: key `id`, index `by-lastOpenedAt`.
- `files`: key `id`, indexes `by-project`, `by-parent`, `by-path`.
- `recentProjects`: key `projectId`, index `by-openedAt`.
- `aiMessages`: key `id`, index `by-project`.
- `kv`: key `key`.

## Mobile UX Strategy
Bottom navigation, slide-out explorer, safe-area support, dynamic viewport height, 44px touch targets, horizontal editor tabs, low-motion defaults, disabled expensive Monaco suggestions on mobile, IndexedDB offline persistence, and PWA installability.

## Future Scaling Plan
Reserved module boundaries for TXB Studio, Dataset Factory, Agent Framework, Model Hub, Knowledge Base, and App Launcher. Add modules as routed panels registered through a workspace module manifest with shared project context, permissions, file APIs, AI context adapters, and persistent module settings.

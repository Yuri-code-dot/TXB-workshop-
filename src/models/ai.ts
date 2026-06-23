export type AiIntent = 'explain' | 'fix' | 'generate' | 'refactor' | 'summarize' | 'chat';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: number;
  intent?: AiIntent;
}

export interface AiProjectContext {
  projectName: string;
  activePath?: string;
  activeCode?: string;
  files: Array<{ path: string; language?: string; content?: string }>;
}

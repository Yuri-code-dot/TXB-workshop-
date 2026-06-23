import type { AiIntent, AiProjectContext } from '../../models/ai';

const labels: Record<AiIntent, string> = {
  explain: 'Code explanation', fix: 'Error fix plan', generate: 'Generated code', refactor: 'Refactor proposal', summarize: 'Project summary', chat: 'TXB AI response'
};

export async function runLocalAssistant(intent: AiIntent, prompt: string, context: AiProjectContext): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 350));
  const active = context.activePath ? `Active file: ${context.activePath}` : 'No active file selected';
  const files = context.files.slice(0, 12).map((file) => `- ${file.path}${file.language ? ` (${file.language})` : ''}`).join('\n');
  const code = context.activeCode?.slice(0, 1600) ?? '';
  if (intent === 'summarize') return `## ${labels[intent]}\n\nProject **${context.projectName}** contains ${context.files.length} files.\n\n${files}\n\nRecommended next step: open the most important source file and ask TXB AI to explain or refactor it.`;
  if (intent === 'generate') return `## ${labels[intent]}\n\nPrompt: ${prompt}\n\n\`\`\`ts\nexport function txbGeneratedFeature() {\n  return { ok: true, source: 'TXB AI', createdAt: new Date().toISOString() };\n}\n\`\`\``;
  if (intent === 'fix') return `## ${labels[intent]}\n\n${active}\n\n1. Check syntax errors and missing imports.\n2. Validate async code and null values.\n3. Add small guard clauses for mobile runtime limits.\n\nContext excerpt:\n\`\`\`\n${code || 'No code available.'}\n\`\`\``;
  if (intent === 'refactor') return `## ${labels[intent]}\n\n${active}\n\n- Split UI, data access, and side effects.\n- Keep touch handlers lightweight.\n- Memoize derived project trees.\n- Move reusable logic to hooks/services.`;
  if (intent === 'explain') return `## ${labels[intent]}\n\n${active}\n\nThis file appears to be **${context.files.find((f) => f.path === context.activePath)?.language ?? 'text'}**. Main contents:\n\n\`\`\`\n${code || 'No code available.'}\n\`\`\``;
  return `## ${labels[intent]}\n\n${active}\n\n${prompt}\n\nI can explain code, fix errors, generate code, refactor files, summarize the project, and use project context from IndexedDB.`;
}

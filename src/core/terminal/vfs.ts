import type { FileNode } from '../../models/workspace';

export interface TerminalResult { output: string; cwd: string }

export function executeCommand(input: string, cwd: string, files: FileNode[]): TerminalResult {
  const [cmd, ...args] = input.trim().split(/\s+/).filter(Boolean);
  if (!cmd) return { output: '', cwd };
  const path = (arg?: string) => normalize(arg ? (arg.startsWith('/') ? arg : `${cwd}/${arg}`) : cwd);
  const list = (dir: string) => files.filter((f) => normalize(`/${f.path}`).split('/').slice(0, -1).join('/') === dir);
  switch (cmd) {
    case 'help': return { cwd, output: 'Commands: help, pwd, ls, cd, cat, tree, echo, clear, date, whoami, txb' };
    case 'pwd': return { cwd, output: cwd };
    case 'ls': return { cwd, output: list(path(args[0])).map((f) => `${f.kind === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n') || '(empty)' };
    case 'cd': {
      const target = args[0] === '..' ? cwd.split('/').slice(0, -1).join('/') || '/' : path(args[0]);
      return { cwd: target, output: '' };
    }
    case 'cat': {
      const target = normalize(args[0]?.startsWith('/') ? args[0] : `${cwd}/${args[0] ?? ''}`).replace(/^\//, '');
      const file = files.find((f) => f.path === target && f.kind === 'file');
      return { cwd, output: file?.content ?? `cat: ${args[0] ?? ''}: No such file` };
    }
    case 'tree': return { cwd, output: files.map((f) => `${'  '.repeat(f.path.split('/').length - 1)}${f.kind === 'folder' ? '📁' : '📄'} ${f.name}`).join('\n') };
    case 'echo': return { cwd, output: args.join(' ') };
    case 'date': return { cwd, output: new Date().toString() };
    case 'whoami': return { cwd, output: 'txb-mobile-developer' };
    case 'txb': return { cwd, output: 'TXB Workspace CLI\nmodules: studio,dataset-factory,agent-framework,model-hub,knowledge-base,app-launcher' };
    case 'clear': return { cwd, output: '__CLEAR__' };
    default: return { cwd, output: `${cmd}: command not found` };
  }
}

function normalize(p: string) { return ('/' + p).replace(/\/+/g, '/').replace(/\/\//g, '/').replace(/\/$/, '') || '/'; }

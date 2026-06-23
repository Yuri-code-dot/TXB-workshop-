import { Copy, SplitSquareHorizontal } from 'lucide-react';
import { useRef, useState } from 'react';
import { executeCommand } from '../../core/terminal/vfs';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface Line { type: 'cmd' | 'out'; text: string }
function TerminalInstance({ name }: { name: string }) {
  const files = useWorkspaceStore((s) => s.files);
  const [cwd, setCwd] = useState('/');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [lines, setLines] = useState<Line[]>([{ type: 'out', text: `TXB Terminal ${name}. Type help.` }]);
  const hIndex = useRef(-1);
  const run = () => {
    const command = input.trim();
    if (!command) return;
    const result = executeCommand(command, cwd, files);
    if (result.output === '__CLEAR__') setLines([]);
    else setLines((prev) => [...prev, { type: 'cmd', text: `${cwd} $ ${command}` }, ...(result.output ? [{ type: 'out' as const, text: result.output }] : [])]);
    setCwd(result.cwd); setHistory((h) => [...h, command]); setInput(''); hIndex.current = -1;
  };
  return <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-black/35 font-mono text-xs">
    <div className="flex h-9 items-center justify-between border-b border-white/10 px-3 text-slate-400"><span>{name}</span><button onClick={() => navigator.clipboard?.writeText(lines.map((l) => l.text).join('\n'))}><Copy size={14}/></button></div>
    <div className="thin-scroll flex-1 overflow-auto p-3 text-slate-200">{lines.map((line, i) => <pre key={i} className={`whitespace-pre-wrap ${line.type === 'cmd' ? 'text-sky-300' : 'text-slate-300'}`}>{line.text}</pre>)}</div>
    <div className="flex items-center gap-2 border-t border-white/10 p-2 text-slate-200"><span className="text-green-300">$</span><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') run(); if (e.key === 'ArrowUp') { const next = history.at(hIndex.current - 1) ?? history.at(-1); if (next) { hIndex.current -= 1; setInput(next); } } }} className="min-w-0 flex-1 bg-transparent outline-none" autoCapitalize="off" autoCorrect="off" /></div>
  </div>;
}
export function TerminalPanel() {
  const split = useWorkspaceStore((s) => s.currentProject?.settings.terminalSplit ?? false);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  return <section className="flex h-full min-h-0 flex-col bg-[#0b1020] p-3 pb-24 lg:pb-3">
    <div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-white">Terminal</h2><button className="toolbar-chip" onClick={() => updateSettings({ terminalSplit: !split })}><SplitSquareHorizontal size={14}/>Split</button></div>
    <div className={`min-h-0 flex-1 gap-3 ${split ? 'grid grid-rows-2 lg:grid-cols-2 lg:grid-rows-1' : 'flex'}`}><TerminalInstance name="main" />{split && <TerminalInstance name="split" />}</div>
  </section>;
}

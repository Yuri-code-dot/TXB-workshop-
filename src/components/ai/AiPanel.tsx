import { Bot, Send, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { AiIntent } from '../../models/ai';
import { useWorkspaceStore } from '../../store/workspaceStore';

const intents: Array<{ id: AiIntent; label: string }> = [
  { id: 'explain', label: 'Explain' }, { id: 'fix', label: 'Fix' }, { id: 'generate', label: 'Generate' }, { id: 'refactor', label: 'Refactor' }, { id: 'summarize', label: 'Summarize' }
];
export function AiPanel() {
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const messages = useWorkspaceStore((s) => s.aiMessages);
  const runAi = useWorkspaceStore((s) => s.runAi);
  const clearAi = useWorkspaceStore((s) => s.clearAi);
  const send = async (intent: AiIntent = 'chat') => { setBusy(true); try { await runAi(intent, prompt); setPrompt(''); } finally { setBusy(false); } };
  return <section className="flex h-full min-h-0 flex-col bg-[#0b1020] pb-24 lg:pb-0">
    <div className="flex h-14 items-center gap-2 border-b border-white/10 px-3"><Bot className="text-sky-300"/><h2 className="flex-1 font-semibold text-white">TXB AI Panel</h2><button onClick={() => void clearAi()} className="touch-target rounded-xl bg-white/5 text-slate-300"><Trash2 size={17}/></button></div>
    <div className="thin-scroll flex-1 overflow-auto p-3 space-y-3">{messages.length === 0 && <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Ask TXB AI to explain code, fix errors, generate code, refactor, summarize files, or chat with project context.</div>}{messages.map((m) => <article key={m.id} className={`rounded-3xl border p-3 text-sm ${m.role === 'user' ? 'ml-8 border-sky-400/30 bg-sky-400/10 text-sky-50' : 'mr-6 border-white/10 bg-white/5 text-slate-200'}`}><pre className="whitespace-pre-wrap font-sans leading-relaxed">{m.content}</pre></article>)}</div>
    <div className="border-t border-white/10 bg-[#111827] p-3"><div className="thin-scroll mb-2 flex gap-2 overflow-x-auto">{intents.map((i) => <button key={i.id} disabled={busy} onClick={() => void send(i.id)} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-200 disabled:opacity-50">{i.label}</button>)}</div><div className="flex gap-2"><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Message TXB AI…" rows={2} className="max-h-28 min-h-[48px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-3 text-sm text-white outline-none"/><button disabled={busy} onClick={() => void send('chat')} className="touch-target rounded-2xl bg-sky-500 text-white disabled:opacity-50"><Send size={18}/></button></div></div>
  </section>;
}

import Editor, { type OnMount } from '@monaco-editor/react';
import { Maximize2, Minimize2, Search, WrapText } from 'lucide-react';
import { useMemo, useRef } from 'react';
import type * as monaco from 'monaco-editor';
import { selectActiveFile, useWorkspaceStore } from '../../store/workspaceStore';
import { EditorTabs } from './EditorTabs';

export function CodeEditor() {
  const file = useWorkspaceStore(selectActiveFile);
  const updateContent = useWorkspaceStore((s) => s.updateContent);
  const settings = useWorkspaceStore((s) => s.currentProject?.settings);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const options = useMemo<monaco.editor.IStandaloneEditorConstructionOptions>(() => ({
    fontSize: settings?.fontSize ?? 14,
    tabSize: settings?.tabSize ?? 2,
    wordWrap: settings?.wordWrap ? 'on' : 'off',
    minimap: { enabled: settings?.minimap ?? false },
    lineNumbersMinChars: 3,
    glyphMargin: false,
    folding: true,
    smoothScrolling: false,
    cursorSmoothCaretAnimation: 'off',
    renderWhitespace: 'selection',
    automaticLayout: true,
    padding: { top: 0, bottom: 90 },
    scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8, alwaysConsumeMouseWheel: false },
    quickSuggestions: false,
    suggestOnTriggerCharacters: false
  }), [settings]);
  const mount: OnMount = (editor) => { editorRef.current = editor; editor.addAction({ id: 'txb-format', label: 'Format Document', keybindings: [], run: () => editor.getAction('editor.action.formatDocument')?.run() }); };
  if (!file) return <div className="grid h-full place-items-center p-6 text-center text-slate-400"><div><p className="text-lg text-white">No file open</p><p>Select a file from Explorer.</p></div></div>;
  return <section className="flex h-full min-h-0 flex-col bg-[#0b1020]">
    <EditorTabs />
    <div className="flex h-10 shrink-0 items-center gap-2 border-b border-white/10 px-2 text-xs text-slate-400">
      <span className="min-w-0 flex-1 truncate">{file.path}</span>
      <button className="toolbar-chip" onClick={() => editorRef.current?.trigger('txb', 'actions.find', null)}><Search size={14}/>Find</button>
      <button className="toolbar-chip" onClick={() => updateSettings({ wordWrap: !settings?.wordWrap })}><WrapText size={14}/>Wrap</button>
      <button className="toolbar-chip" onClick={() => updateSettings({ minimap: !settings?.minimap })}>{settings?.minimap ? <Minimize2 size={14}/> : <Maximize2 size={14}/>}Map</button>
    </div>
    <div className="min-h-0 flex-1 keyboard-aware">
      <Editor height="100%" theme="vs-dark" language={file.language} value={file.content ?? ''} options={options} onMount={mount} onChange={(value) => void updateContent(file.id, value ?? '')} loading={<div className="p-4 text-slate-400">Loading Monaco…</div>} />
    </div>
  </section>;
}

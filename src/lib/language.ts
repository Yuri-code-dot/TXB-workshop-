const map: Record<string, string> = {
  js: 'javascript', jsx: 'javascript', mjs: 'javascript', cjs: 'javascript',
  ts: 'typescript', tsx: 'typescript', html: 'html', css: 'css', scss: 'scss',
  json: 'json', md: 'markdown', py: 'python', txt: 'plaintext', sh: 'shell',
  yml: 'yaml', yaml: 'yaml', xml: 'xml', svg: 'xml'
};

export const languageFromName = (name: string) => map[name.split('.').pop()?.toLowerCase() ?? ''] ?? 'plaintext';

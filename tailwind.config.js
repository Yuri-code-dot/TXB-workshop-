/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        txb: {
          bg: '#0b1020',
          panel: '#111827',
          surface: '#172033',
          line: '#243047',
          accent: '#38bdf8',
          purple: '#8b5cf6',
          green: '#22c55e',
          danger: '#ef4444'
        }
      },
      boxShadow: { soft: '0 14px 40px rgba(0,0,0,.35)' },
      fontFamily: { mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'] }
    }
  },
  plugins: []
};

import { useEffect } from 'react';
import type { BottomPanel } from '../models/workspace';
import { useWorkspaceStore } from '../store/workspaceStore';

const order: BottomPanel[] = ['explorer', 'editor', 'terminal', 'ai', 'settings'];
export function useSwipeNavigation() {
  const panel = useWorkspaceStore((s) => s.bottomPanel);
  const setPanel = useWorkspaceStore((s) => s.setPanel);
  useEffect(() => {
    let x = 0; let y = 0;
    const start = (e: TouchEvent) => { x = e.touches[0].clientX; y = e.touches[0].clientY; };
    const end = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x; const dy = e.changedTouches[0].clientY - y;
      if (Math.abs(dx) < 75 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      const i = order.indexOf(panel); const next = dx < 0 ? order[Math.min(order.length - 1, i + 1)] : order[Math.max(0, i - 1)];
      if (next !== panel) setPanel(next);
    };
    window.addEventListener('touchstart', start, { passive: true }); window.addEventListener('touchend', end, { passive: true });
    return () => { window.removeEventListener('touchstart', start); window.removeEventListener('touchend', end); };
  }, [panel, setPanel]);
}

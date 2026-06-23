export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
export const vibrate = (pattern: number | number[] = 8) => { if ('vibrate' in navigator) navigator.vibrate(pattern); };
export const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;

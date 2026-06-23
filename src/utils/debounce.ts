export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number) {
  let handle: number | undefined;
  return (...args: Parameters<T>) => {
    window.clearTimeout(handle);
    handle = window.setTimeout(() => fn(...args), delay);
  };
}

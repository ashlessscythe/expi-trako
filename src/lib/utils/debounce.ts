type DebouncedFunction<T extends (...args: unknown[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
};

export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
  immediate = false
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout | null = null;

  const debouncedFunction = function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) {
        func(...args);
      }
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) {
      func(...args);
    }
  } as DebouncedFunction<T>;

  debouncedFunction.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debouncedFunction;
}

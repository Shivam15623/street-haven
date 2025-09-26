import { useState, useEffect } from "react";

/**
 * useDebounce hook
 * @param value - the value to debounce
 * @param delay - debounce delay in milliseconds (default 500ms)
 * @returns debounced value
 */
export function useDebounce<T>(value: T, delay: number = 1000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup if value changes before delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

import { useRef, useCallback } from "react";

export const useNotificationReadBuffer = () => {
  const idsRef = useRef<Set<string>>(new Set());

  const add = useCallback((id: string) => {
    idsRef.current.add(id);
  }, []);

  const flush = useCallback(() => {
    const ids = Array.from(idsRef.current);
    idsRef.current.clear();
    return ids;
  }, []);

  return { add, flush };
};

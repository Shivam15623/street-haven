import { useEffect, useRef, useCallback } from "react";
import { useMarkNotificationsAsReadMutation } from "../services/notificationApi";
import { getErrorMessage } from "../utills/utills";
import { showError } from "../utills/toastutills";

export const useDebouncedBulkMarkRead = (delay = 1000) => {
  const [markRead] = useMarkNotificationsAsReadMutation();
  const pendingIds = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addNotificationId = useCallback(
    (id: string) => {
      pendingIds.current.add(id);

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        if (pendingIds.current.size > 0) {
          const ids = Array.from(pendingIds.current);
          pendingIds.current.clear();
          try {
            await markRead(ids).unwrap();
          } catch (err) {
            showError(getErrorMessage(err));
          }
        }
      }, delay);
    },
    [markRead, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { addNotificationId };
};

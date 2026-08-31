// hooks/useReadCursor.ts
import { useRef, useCallback } from "react";
import { useUpdateReadCursorMutation } from "../services/entityApi";


export const useReadCursor = (
  entityType: "ticket" | "task",
  entityId: string,
) => {
  const [updateReadCursor] = useUpdateReadCursorMutation();
  const lastSentRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markSeen = useCallback(
    (commentId: string) => {
      if (!commentId || commentId === lastSentRef.current) return;

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastSentRef.current = commentId;
        updateReadCursor({
          entityType,
          entityId,
          lastSeenCommentId: commentId,
        }).catch(() => {
          // don't showError here — this is a background sync, not
          // something the user needs to react to; just retry next time
          lastSentRef.current = null;
        });
      }, 800); // small debounce so a burst of socket comments = one call
    },
    [entityType, entityId, updateReadCursor],
  );

  return { markSeen };
};

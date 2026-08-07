import { useCallback, useEffect, useRef } from "react";
const SCROLL_THRESHOLD = 40;
export const useInfiniteScroll = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  hasMore: boolean,
  isFetching: boolean,
  onLoadMore: () => void
) => {
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (el.scrollTop <= SCROLL_THRESHOLD && hasMore && !isFetching) {
        prevScrollHeightRef.current = el.scrollHeight;
        onLoadMore();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFetching, onLoadMore, containerRef]);

  const restoreScrollPosition = useCallback(() => {
    const el = containerRef.current;
    if (!el || !prevScrollHeightRef.current) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight - prevScrollHeightRef.current;
      prevScrollHeightRef.current = 0;
    });
  }, [containerRef]);

  return { restoreScrollPosition };
};
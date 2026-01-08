import { useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

interface UseScrollToItemFromUrlProps {
  enabled: boolean;
  itemKey?: string; // default = "item"
  scrollDelay?: number;
}

export function useScrollToItemFromUrl({
  enabled,
  itemKey = "item",
  scrollDelay = 500,
}: UseScrollToItemFromUrlProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const itemId = searchParams.get(itemKey);

  useEffect(() => {
    if (!enabled || !itemId) return;

    const el = document.getElementById(itemId);
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      params.delete(itemKey);

      const newSearch = params.toString();
      navigate(
        newSearch ? `${location.pathname}?${newSearch}` : location.pathname,
        { replace: true }
      );
    }, scrollDelay);

    return () => clearTimeout(timer);
  }, [enabled, itemId, itemKey, location, navigate, scrollDelay]);
}

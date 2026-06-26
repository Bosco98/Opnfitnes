import { useCallback, useEffect, useState } from "react";

/**
 * Minimal hash router for the three tabs. Keeps the active tab in `location.hash`
 * so the PWA is deep-linkable and the device back button works between tabs.
 */
export function useHashTab<T extends string>(
  tabs: readonly T[],
  fallback: T,
): [T, (tab: T) => void] {
  const fromHash = useCallback((): T => {
    const id = location.hash.replace(/^#\/?/, "") as T;
    return tabs.includes(id) ? id : fallback;
  }, [tabs, fallback]);

  const [tab, setTab] = useState<T>(fromHash);

  useEffect(() => {
    const onHash = () => setTab(fromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [fromHash]);

  const navigate = useCallback((next: T) => {
    if (location.hash.replace(/^#\/?/, "") !== next) location.hash = `/${next}`;
    setTab(next);
  }, []);

  return [tab, navigate];
}

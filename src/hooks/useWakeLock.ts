import { useEffect, useRef } from "react";

/**
 * Acquires a screen wake lock while `active` is true.
 * Automatically re-acquires after the page becomes visible again (the browser
 * releases the lock whenever the page is hidden).
 * Silently no-ops on browsers that don't support the Wake Lock API.
 */
export function useWakeLock(active: boolean): void {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      try {
        lockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Permission denied or not supported — ignore silently.
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !cancelled) void acquire();
    };

    void acquire();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      lockRef.current?.release().catch(() => {});
      lockRef.current = null;
    };
  }, [active]);
}

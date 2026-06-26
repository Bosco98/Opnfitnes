import { useCallback, useEffect, useRef, useState } from "react";

export interface Timer {
  remaining: number; // seconds
  total: number;
  running: boolean;
  done: boolean;
  progress: number; // 0..1 elapsed
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: (seconds?: number) => void;
  startFrom: (seconds: number) => void;
  addSeconds: (delta: number) => void;
}

/**
 * Countdown timer driven by wall-clock deltas (robust to tab throttling).
 * `onComplete` fires once when it reaches zero.
 */
export function useTimer(initialSeconds: number, onComplete?: () => void): Timer {
  const [total, setTotal] = useState(initialSeconds);
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const deadlineRef = useRef<number | null>(null);
  const firedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    const tick = () => {
      if (deadlineRef.current == null) return;
      const left = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        if (!firedRef.current) {
          firedRef.current = true;
          onCompleteRef.current?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const start = useCallback(() => {
    if (remaining <= 0) return;
    firedRef.current = false;
    deadlineRef.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    setRunning(false);
    deadlineRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    setRunning((r) => {
      if (r) {
        deadlineRef.current = null;
        return false;
      }
      if (remaining <= 0) return false;
      firedRef.current = false;
      deadlineRef.current = Date.now() + remaining * 1000;
      return true;
    });
  }, [remaining]);

  const reset = useCallback(
    (seconds?: number) => {
      const next = seconds ?? total;
      setTotal(next);
      setRemaining(next);
      setRunning(false);
      deadlineRef.current = null;
      firedRef.current = false;
    },
    [total],
  );

  const startFrom = useCallback((seconds: number) => {
    firedRef.current = false;
    deadlineRef.current = Date.now() + seconds * 1000;
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(true);
  }, []);

  const addSeconds = useCallback((delta: number) => {
    setRemaining((r) => {
      const next = Math.max(0, r + delta);
      if (deadlineRef.current != null)
        deadlineRef.current = Date.now() + next * 1000;
      return next;
    });
    setTotal((t) => Math.max(t, t + delta));
  }, []);

  return {
    remaining,
    total,
    running,
    done: remaining <= 0,
    progress: total > 0 ? 1 - remaining / total : 0,
    start,
    pause,
    toggle,
    reset,
    startFrom,
    addSeconds,
  };
}

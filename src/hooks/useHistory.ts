import { useCallback, useEffect } from "react";
import type { WorkoutConfig, WorkoutLog, WorkoutStatus } from "@/types";
import { HISTORY_RETENTION_DAYS } from "@/lib/constants";
import { historyStore } from "@/lib/stores";
import { withinDays } from "@/lib/date";
import { useStore } from "./useStore";

const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Workout history with rolling 30-day retention enforced on mount. */
export function useHistory() {
  const [history, setHistory] = useStore(historyStore);

  // Prune records older than the retention window once on startup.
  useEffect(() => {
    setHistory((prev) => {
      const kept = prev.filter((l) => withinDays(l.date, HISTORY_RETENTION_DAYS));
      return kept.length === prev.length ? prev : kept;
    });
    // run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const log = useCallback(
    (
      config: WorkoutConfig,
      name: string,
      status: WorkoutStatus,
      customMuscles?: string[],
    ): WorkoutLog => {
      const entry: WorkoutLog = {
        id: uid(),
        date: new Date().toISOString(),
        name,
        muscles: config.muscles,
        ...(customMuscles && customMuscles.length > 0 ? { customMuscles } : {}),
        equipment: config.equipment,
        style: config.style,
        duration: config.duration,
        status,
      };
      setHistory((prev) => [entry, ...prev]);
      return entry;
    },
    [setHistory],
  );

  const setStatus = useCallback(
    (id: string, status: WorkoutStatus) =>
      setHistory((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      ),
    [setHistory],
  );

  const remove = useCallback(
    (id: string) => setHistory((prev) => prev.filter((l) => l.id !== id)),
    [setHistory],
  );

  const clear = useCallback(() => setHistory([]), [setHistory]);

  return { history, log, setStatus, remove, clear };
}

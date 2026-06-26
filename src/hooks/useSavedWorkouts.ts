import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import type { GeneratedWorkout, SavedWorkout, WorkoutConfig } from "@/types";
import { savedWorkoutsStore } from "@/lib/stores";

const uid = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function useSavedWorkouts() {
  const saved = useSyncExternalStore(
    savedWorkoutsStore.subscribe,
    savedWorkoutsStore.read,
  );

  const save = useCallback(
    (workout: GeneratedWorkout, config: WorkoutConfig, name: string): SavedWorkout => {
      const entry: SavedWorkout = {
        id: uid(),
        name: name.trim() || workout.name,
        savedAt: new Date().toISOString(),
        workout,
        config,
      };
      savedWorkoutsStore.write([entry, ...savedWorkoutsStore.read()]);
      return entry;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    savedWorkoutsStore.write(savedWorkoutsStore.read().filter((s) => s.id !== id));
  }, []);

  return { saved, save, remove };
}

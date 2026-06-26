import { useCallback } from "react";
import type { WorkoutConfig } from "@/types";
import { prefsStore } from "@/lib/stores";
import { useStore } from "./useStore";

/** The persisted four-input workout config used to pre-fill the wizard. */
export function usePreferences() {
  const [prefs, setPrefs] = useStore(prefsStore);
  const patch = useCallback(
    (p: Partial<WorkoutConfig>) => setPrefs((prev) => ({ ...prev, ...p })),
    [setPrefs],
  );
  return { prefs, patch, setPrefs };
}

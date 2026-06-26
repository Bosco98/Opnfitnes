import { useCallback } from "react";
import type { AiSettings, UserSettings } from "@/types";
import { aiStore, userStore } from "@/lib/stores";
import { useStore } from "./useStore";

/** AI config slice with a partial patcher. */
export function useAiSettings() {
  const [ai, setAi] = useStore(aiStore);
  const patch = useCallback(
    (p: Partial<AiSettings>) => setAi((prev) => ({ ...prev, ...p })),
    [setAi],
  );
  return { ai, patch, hasKey: ai.apiKey.trim().length > 0 };
}

/** User profile + theme + reminder slice with a partial patcher. */
export function useUserSettings() {
  const [user, setUser] = useStore(userStore);
  const patch = useCallback(
    (p: Partial<UserSettings>) => setUser((prev) => ({ ...prev, ...p })),
    [setUser],
  );
  return { user, patch };
}

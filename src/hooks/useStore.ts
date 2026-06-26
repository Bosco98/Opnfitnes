import { useCallback } from "react";
import { useSyncExternalStore } from "react";
import type { Store } from "@/lib/storage";

export function useStore<T>(
  store: Store<T>,
): [T, (update: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(store.subscribe, store.read, store.read);

  const set = useCallback(
    (update: T | ((prev: T) => T)) => {
      const next =
        typeof update === "function"
          ? (update as (prev: T) => T)(store.read())
          : update;
      store.write(next);
    },
    [store],
  );

  return [value, set];
}

/* localStorage adapter. One typed factory so every persisted slice gets the same
   safe read (parse + validate + fallback) and write. Components never touch
   localStorage directly — they go through a hook that wraps a store. */

export interface Store<T> {
  read(): T;
  write(value: T): void;
  subscribe(listener: () => void): () => void;
}

/**
 * Create a persisted store for one key.
 * @param validate narrows unknown parsed JSON to T, returning fallback on bad shape.
 */
export function createStore<T>(
  key: string,
  fallback: T,
  validate: (raw: unknown) => T,
): Store<T> {
  const listeners = new Set<() => void>();

  // Cached snapshot: read() MUST return a stable reference between renders or
  // useSyncExternalStore loops forever. The cache is invalidated only on write
  // or a cross-tab storage event, then recomputed lazily.
  let cache: T;
  let valid = false;

  const parse = (): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return validate(JSON.parse(raw));
    } catch {
      return fallback;
    }
  };

  const read = (): T => {
    if (!valid) {
      cache = parse();
      valid = true;
    }
    return cache;
  };

  const write = (value: T): void => {
    cache = value;
    valid = true;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or private mode — fail silently, app still works in-memory */
    }
    listeners.forEach((l) => l());
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    // cross-tab sync: invalidate cache so the next read reflects the new value
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) {
        valid = false;
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  return { read, write, subscribe };
}

/* ---- small validation helpers -------------------------------------------- */
export const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

export const bool = (v: unknown, fallback = false): boolean =>
  typeof v === "boolean" ? v : fallback;

export const arr = <T>(v: unknown, guard: (x: unknown) => x is T): T[] =>
  Array.isArray(v) ? v.filter(guard) : [];

export const oneOf = <T extends string | number>(
  v: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(v as T) ? (v as T) : fallback);

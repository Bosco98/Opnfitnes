import { useCallback, useEffect, useState } from "react";
import type { OpenRouterModel } from "@/types";
import { listModels } from "@/lib/openrouter";

interface ModelsState {
  models: OpenRouterModel[];
  loading: boolean;
  error: string | null;
}

/** Lazily loads the OpenRouter model catalog. Refetches when the key changes. */
export function useModels(apiKey: string) {
  const [state, setState] = useState<ModelsState>({
    models: [],
    loading: false,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const models = await listModels(apiKey);
      setState({ models, loading: false, error: null });
    } catch (e) {
      setState({
        models: [],
        loading: false,
        error: e instanceof Error ? e.message : "Failed to load models.",
      });
    }
  }, [apiKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const free = state.models.filter((m) => m.isFree);
  const paid = state.models.filter((m) => !m.isFree);

  return { ...state, free, paid, reload: load };
}

import { useCallback, useRef, useState } from "react";
import type { GeneratedWorkout, SwapTargets, WorkoutConfig } from "@/types";
import { generateWorkoutWithFallback } from "@/lib/openrouter";

interface Attempt {
  modelId: string;
  index: number; // 0-based
  total: number;
}

type GenState =
  | { status: "idle" }
  | { status: "loading"; attempt: Attempt | null }
  | { status: "success"; workout: GeneratedWorkout }
  | { status: "error"; message: string };

/**
 * Wraps generation with cancellable request state. Given an ordered list of
 * candidate models, it tries each until one succeeds (see
 * `generateWorkoutWithFallback`) — so a rate-limited free model auto-falls back
 * to the next free model without the user lifting a finger.
 */
export function useWorkoutGenerator(apiKey: string, modelIds: string[], validateCounts = false) {
  const [state, setState] = useState<GenState>({ status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (config: WorkoutConfig, swap?: SwapTargets, additionalInstructions?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState({ status: "loading", attempt: null });
      try {
        const workout = await generateWorkoutWithFallback(
          config,
          apiKey,
          modelIds,
          controller.signal,
          (modelId, index, total) =>
            setState({ status: "loading", attempt: { modelId, index, total } }),
          swap,
          additionalInstructions,
          validateCounts,
        );
        if (!controller.signal.aborted)
          setState({ status: "success", workout });
      } catch (e) {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Something went wrong.",
        });
      }
    },
    [apiKey, modelIds],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ status: "idle" });
  }, []);

  return { state, generate, reset };
}

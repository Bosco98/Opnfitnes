/* OpenRouter adapter. The only module that talks to the network. Two jobs:
   list models, and generate a structured workout. Everything returns typed,
   validated data or throws a human-readable Error. */

import type {
  GeneratedWorkout,
  OpenRouterModel,
  SwapTargets,
  WorkoutConfig,
} from "@/types";
import {
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  MUSCLE_GROUPS,
  WORKOUT_STYLES,
  labelOf,
} from "./constants";

const BASE = "https://openrouter.ai/api/v1";

/** Generation error that knows whether trying a *different* model could help. */
export class GenerationError extends Error {
  retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "GenerationError";
    this.retryable = retryable;
  }
}

const headers = (apiKey: string): HeadersInit => ({
  Authorization: `Bearer ${apiKey}`,
  "Content-Type": "application/json",
  "HTTP-Referer": location.origin,
  "X-Title": "OpnFitnes",
});

interface RawModel {
  id: string;
  name?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
}

/** Fetch the catalog. Doesn't require a key for listing, but we send it if set. */
export async function listModels(apiKey: string): Promise<OpenRouterModel[]> {
  const res = await fetch(`${BASE}/models`, {
    headers: apiKey ? headers(apiKey) : { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Could not load models (${res.status}).`);
  const json = (await res.json()) as { data?: RawModel[] };
  const data = json.data ?? [];

  return data
    .map((m): OpenRouterModel => {
      const prompt = Number(m.pricing?.prompt ?? "0");
      const completion = Number(m.pricing?.completion ?? "0");
      return {
        id: m.id,
        name: m.name ?? m.id,
        isFree: prompt === 0 && completion === 0,
        contextLength: m.context_length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ---- Generation ---------------------------------------------------------- */

const EXPERIENCE_BRIEF: Record<string, string> = {
  rookie:
    "Complete beginner. Use simple, low-skill movements; lighter volume; longer rest; extra form cues; avoid advanced or high-impact exercises.",
  beginner:
    "Knows the basics. Moderate volume and standard movements; clear cues; sensible progression.",
  advanced:
    "Trains regularly. Higher volume and intensity; advanced variations, supersets/tempo where it fits; concise cues, less hand-holding.",
};

function buildPrompt(
  config: WorkoutConfig,
  swap?: SwapTargets,
  additionalInstructions?: string,
): string {
  const muscles = config.muscles
    .map((m) => labelOf(MUSCLE_GROUPS, m))
    .join(", ");
  
  let equipmentList = config.equipment.map((e) => {
    if (e === "dumbbells" && !config.equipment.includes("bench")) {
      return "Dumbbells with no bench";
    }
    if (e === "bench") {
      return "Dumbbells with bench";
    }
    return labelOf(EQUIPMENT, e);
  });

  if (config.equipment.includes("bench") && config.equipment.includes("dumbbells")) {
    equipmentList = equipmentList.filter((label) => label !== "Dumbbells");
  }

  const equipment = equipmentList.join(", ");

  const style = labelOf(WORKOUT_STYLES, config.style);
  const experience = labelOf(EXPERIENCE_LEVELS, config.experience);

  const lines: string[] = [];
  if (swap?.warmup?.length)
    lines.push(`- Replace these warmup activities with fresh alternatives: ${swap.warmup.map((n) => `"${n}"`).join(", ")}.`);
  if (swap?.exercises?.length)
    lines.push(`- Replace these exercises with fresh alternatives (same muscle groups, same equipment): ${swap.exercises.map((n) => `"${n}"`).join(", ")}.`);
  if (swap?.cooldown?.length)
    lines.push(`- Replace these cooldown activities with fresh alternatives: ${swap.cooldown.map((n) => `"${n}"`).join(", ")}.`);
  if (swap?.note?.trim())
    lines.push(`- Additional user request: ${swap.note.trim()}`);
  const swapClause =
    lines.length > 0
      ? `\nSWAP REQUEST: Keep the overall workout structure. Replace ONLY the items listed below; leave everything else unchanged:\n${lines.join("\n")}\n`
      : "";

  const extraClause =
    additionalInstructions?.trim()
      ? `\nADDITIONAL USER PREFERENCES: ${additionalInstructions.trim()}\n`
      : "";

  const tabataClause =
    config.style === "tabata"
      ? `\nTabata split: choose the best work/rest interval (e.g. 20s work / 10s rest). All exercises share the same split. Include a "tabata" object in your JSON with "workSec" and "restSec" as integers.\n`
      : "";

  const tabataSchema =
    config.style === "tabata"
      ? `  "tabata": { "workSec": number, "restSec": number },\n`
      : "";

  return `You are an expert strength & conditioning coach. Design ONE workout.

Constraints:
- Experience level: ${experience} — ${EXPERIENCE_BRIEF[config.experience]}
- Target muscle groups: ${muscles}
- Available equipment ONLY: ${equipment}
- Style: ${style}
- Total time budget: ${config.duration} minutes (including warmup & cooldown)
${extraClause}${tabataClause}${swapClause}
Rules:
- Match exercise selection, volume, intensity and rest to the experience level above.
- Use ONLY the listed equipment. Never invent machines.
- Fit the time budget realistically for the chosen style.
- Give concise, safe "how to" cues (one short sentence each).
- Pick a punchy, specific workout name (e.g. "30-Minute Upper-Body Dumbbell Blast").
- Include EXACTLY ${config.warmupCount} warmup items, EXACTLY ${config.exerciseCount} exercises, and EXACTLY ${config.cooldownCount} cooldown items. No more, no fewer.

Respond with STRICT JSON ONLY, no markdown, matching exactly:
{
  "name": string,
  "estMinutes": number,
  "warmup": string[],
${tabataSchema}  "exercises": [{ "name": string, "setsReps": string, "howTo": string }],
  "cooldown": string[]
}`;
}

interface ChatResponse {
  choices?: { message?: { content?: string } }[];
  error?: { message?: string };
}

/** Pull the first {...} JSON block out of a possibly-fenced model reply. */
function extractJson(content: string): unknown {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : content;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model returned no JSON.");
  return JSON.parse(candidate.slice(start, end + 1));
}

const strArr = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

function validateWorkout(raw: unknown, fallbackMinutes: number): GeneratedWorkout {
  if (typeof raw !== "object" || raw === null)
    throw new Error("Malformed workout response.");
  const r = raw as Record<string, unknown>;

  const exercises = Array.isArray(r.exercises)
    ? r.exercises
        .map((e) => {
          const ex = (e ?? {}) as Record<string, unknown>;
          return {
            name: typeof ex.name === "string" ? ex.name : "",
            setsReps: typeof ex.setsReps === "string" ? ex.setsReps : "—",
            howTo: typeof ex.howTo === "string" ? ex.howTo : "",
          };
        })
        .filter((e) => e.name)
    : [];

  if (exercises.length === 0)
    throw new Error("The model didn't return any exercises. Try again.");

  const tabataRaw =
    typeof r.tabata === "object" && r.tabata !== null
      ? (r.tabata as Record<string, unknown>)
      : null;
  const tabata =
    tabataRaw &&
    typeof tabataRaw.workSec === "number" &&
    typeof tabataRaw.restSec === "number" &&
    tabataRaw.workSec > 0 &&
    tabataRaw.restSec > 0
      ? { workSec: Math.round(tabataRaw.workSec), restSec: Math.round(tabataRaw.restSec) }
      : undefined;

  return {
    name: typeof r.name === "string" && r.name ? r.name : "Your Workout",
    estMinutes:
      typeof r.estMinutes === "number" ? r.estMinutes : fallbackMinutes,
    warmup: strArr(r.warmup),
    exercises,
    cooldown: strArr(r.cooldown),
    ...(tabata ? { tabata } : {}),
  };
}

export async function generateWorkout(
  config: WorkoutConfig,
  apiKey: string,
  modelId: string,
  signal?: AbortSignal,
  swap?: SwapTargets,
  additionalInstructions?: string,
): Promise<GeneratedWorkout> {
  if (!apiKey) throw new GenerationError("No OpenRouter API key set.", false);

  const res = await fetch(`${BASE}/chat/completions`, {
    method: "POST",
    headers: headers(apiKey),
    signal,
    body: JSON.stringify({
      model: modelId,
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output only valid JSON. No prose, no markdown fences.",
        },
        { role: "user", content: buildPrompt(config, swap, additionalInstructions) },
      ],
    }),
  });

  if (!res.ok) {
    let detail = `${res.status}`;
    try {
      const body = (await res.json()) as ChatResponse;
      if (body.error?.message) detail = body.error.message;
    } catch {
      /* ignore */
    }
    // 401 = bad key: trying another model won't help. Everything else
    // (402 needs-credits, 429 rate-limit, 5xx) is worth retrying elsewhere.
    if (res.status === 401)
      throw new GenerationError("Invalid API key. Check Settings.", false);
    if (res.status === 402)
      throw new GenerationError("This model needs credits.", true);
    if (res.status === 429)
      throw new GenerationError("Model is rate limited.", true);
    throw new GenerationError(`Generation failed: ${detail}`, true);
  }

  const json = (await res.json()) as ChatResponse;
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new GenerationError("Empty response from model.", true);

  // Bad/maltformed model output is model-specific — let the caller try another.
  try {
    return validateWorkout(extractJson(content), config.duration);
  } catch (e) {
    throw new GenerationError(
      e instanceof Error ? e.message : "Unreadable model output.",
      true,
    );
  }
}

/**
 * Try each candidate model in order until one returns a usable workout. Skips
 * retryable failures (rate limits, credits, bad output); stops immediately on a
 * non-retryable error (e.g. invalid key) or when the request is aborted.
 * `onAttempt` reports the model id currently being tried (for UI).
 *
 * When `validateCounts` is true (free models only), the returned workout's
 * warmup / exercise / cooldown lengths are checked against `config`. A mismatch
 * retries the same model up to 2 total attempts before falling through to the
 * next candidate. API/network errors still fall through immediately.
 */
export async function generateWorkoutWithFallback(
  config: WorkoutConfig,
  apiKey: string,
  modelIds: string[],
  signal?: AbortSignal,
  onAttempt?: (modelId: string, index: number, total: number) => void,
  swap?: SwapTargets,
  additionalInstructions?: string,
  validateCounts = false,
): Promise<GeneratedWorkout> {
  const candidates = modelIds.filter(Boolean);
  if (candidates.length === 0)
    throw new GenerationError("No model available to generate with.", false);

  const MAX_PER_MODEL = validateCounts ? 2 : 1;

  let lastError: unknown;
  for (let i = 0; i < candidates.length; i++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    onAttempt?.(candidates[i], i, candidates.length);

    for (let attempt = 0; attempt < MAX_PER_MODEL; attempt++) {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

      let workout: GeneratedWorkout;
      try {
        workout = await generateWorkout(config, apiKey, candidates[i], signal, swap, additionalInstructions);
      } catch (e) {
        if (signal?.aborted || (e instanceof DOMException && e.name === "AbortError"))
          throw e;
        // Non-retryable (bad key) → stop now; retryable → next model.
        if (e instanceof GenerationError && !e.retryable) throw e;
        lastError = e;
        break; // API / network errors: don't retry this model, move on
      }

      if (validateCounts) {
        const warmupOk = workout.warmup.length === config.warmupCount;
        const exercisesOk = workout.exercises.length === config.exerciseCount;
        const cooldownOk = workout.cooldown.length === config.cooldownCount;

        if (!warmupOk || !exercisesOk || !cooldownOk) {
          lastError = new GenerationError(
            `Model returned wrong counts (warmup ${workout.warmup.length}/${config.warmupCount}, exercises ${workout.exercises.length}/${config.exerciseCount}, cooldown ${workout.cooldown.length}/${config.cooldownCount}). Retrying…`,
            true,
          );
          continue; // retry same model
        }
      }

      return workout;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new GenerationError("All models failed. Try again later.", true);
}

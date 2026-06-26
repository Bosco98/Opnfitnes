/* Shared domain types. Keep this the single source of truth for shapes that
   cross module boundaries (storage, LLM, UI). */

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "legs"
  | "core"
  | "cardio"
  | "yoga";

export type Equipment =
  | "bodyweight"
  | "dumbbells"
  | "barbell"
  | "bench"
  | "bands"
  | "pullup-bar"
  | "kettlebell"
  | "none";

export type WorkoutStyle = "traditional" | "tabata" | "circuit" | "hiit";

export type Duration = 15 | 20 | 30 | 45 | 60;

export type ExperienceLevel = "rookie" | "beginner" | "advanced";

export type WarmupCount = 1 | 2 | 3 | 4 | 5;
export type ExerciseCount = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type CooldownCount = 1 | 2 | 3 | 4 | 5;

/** The inputs that drive generation, persisted as preferences. */
export interface WorkoutConfig {
  experience: ExperienceLevel;
  muscles: MuscleGroup[];
  equipment: Equipment[];
  style: WorkoutStyle;
  duration: Duration;
  warmupCount: WarmupCount;
  exerciseCount: ExerciseCount;
  cooldownCount: CooldownCount;
}

/** One exercise row in a generated workout. */
export interface Exercise {
  name: string;
  setsReps: string;
  howTo: string;
  /** Optional per-exercise seconds, used by the timer when present. */
  durationSec?: number;
}

/** Structured workout returned by the LLM. */
export interface GeneratedWorkout {
  name: string;
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
  /** estimated total minutes, mirrors requested duration */
  estMinutes: number;
  /** Only present when style === "tabata". AI-chosen work/rest split. */
  tabata?: { workSec: number; restSec: number };
}

export type WorkoutStatus = "completed" | "skipped";

/** A logged workout in history. */
export interface WorkoutLog {
  id: string;
  /** ISO timestamp */
  date: string;
  name: string;
  muscles: MuscleGroup[];
  /** Free-text activity labels entered in log mode (e.g. "Swimming", "Tennis"). */
  customMuscles?: string[];
  equipment: Equipment[];
  style: WorkoutStyle;
  duration: Duration;
  status: WorkoutStatus;
}

/* ---- Settings ------------------------------------------------------------ */

export interface OpenRouterModel {
  id: string;
  name: string;
  /** true when prompt+completion price is 0 */
  isFree: boolean;
  contextLength?: number;
}

export interface AiSettings {
  apiKey: string;
  selectedModelId: string;
  usePaidModels: boolean;
}

export type ThemePreference = "system" | "light" | "dark";

export interface ReminderSettings {
  enabled: boolean;
  /** "HH:MM" 24h */
  time: string;
}

export interface UserSettings {
  name: string;
  fitnessLevel: ExperienceLevel;
  theme: ThemePreference;
  reminder: ReminderSettings;
  additionalInstructions: string;
  /** User-created custom muscle/activity types, persisted across sessions. */
  customMuscleGroups: string[];
  clockVolume: number;
}

/** A workout saved by the user for later reuse. */
export interface SavedWorkout {
  id: string;
  name: string;
  /** ISO timestamp */
  savedAt: string;
  workout: GeneratedWorkout;
  config: WorkoutConfig;
}

/** Items selected by the user for targeted regeneration. */
export interface SwapTargets {
  warmup?: string[];
  exercises?: string[];
  cooldown?: string[];
  /** Free-text note from the workout result page, appended to the swap prompt. */
  note?: string;
}



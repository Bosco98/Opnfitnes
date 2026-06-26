/* Static catalogs for the four wizard inputs. Single source — the UI maps over
   these, the prompt builder reads labels from them. DRY: add an option here and
   it appears everywhere. */

import type {
  CooldownCount,
  Duration,
  Equipment,
  ExerciseCount,
  ExperienceLevel,
  MuscleGroup,
  WarmupCount,
  WorkoutStyle,
} from "@/types";

export interface Option<T extends string | number> {
  value: T;
  label: string;
  /** lucide-react icon name */
  icon: string;
  hint?: string;
}

export const EXPERIENCE_LEVELS: Option<ExperienceLevel>[] = [
  {
    value: "rookie",
    label: "Rookie",
    icon: "Sparkles",
    hint: "New to working out",
  },
  {
    value: "beginner",
    label: "Beginner",
    icon: "TrendingUp",
    hint: "Know the basics",
  },
  {
    value: "advanced",
    label: "Advanced",
    icon: "Flame",
    hint: "Train regularly",
  },
];

export const MUSCLE_GROUPS: Option<MuscleGroup>[] = [
  { value: "chest", label: "Chest", icon: "Shirt" },
  { value: "back", label: "Back", icon: "Triangle" },
  { value: "shoulders", label: "Shoulders", icon: "MoveVertical" },
  { value: "biceps", label: "Biceps", icon: "Dumbbell" },
  { value: "triceps", label: "Triceps", icon: "Activity" },
  { value: "legs", label: "Legs", icon: "Footprints" },
  { value: "core", label: "Core", icon: "Hexagon" },
  { value: "cardio", label: "Cardio", icon: "HeartPulse" },
  { value: "yoga", label: "Yoga", icon: "Sprout" },
];

export const EQUIPMENT: Option<Equipment>[] = [
  { value: "bodyweight", label: "Bodyweight", icon: "PersonStanding" },
  { value: "dumbbells", label: "Dumbbells", icon: "Dumbbell" },
  { value: "barbell", label: "Barbell", icon: "Minus" },
  { value: "bench", label: "Bench with dumbbells", icon: "RectangleHorizontal" },
  { value: "bands", label: "Resistance Bands", icon: "Spline" },
  { value: "pullup-bar", label: "Pull-up Bar", icon: "GitCommitHorizontal" },
  { value: "kettlebell", label: "Kettlebell", icon: "Bell" },
];

export const WORKOUT_STYLES: Option<WorkoutStyle>[] = [
  {
    value: "traditional",
    label: "Traditional",
    icon: "ListChecks",
    hint: "Sets & reps, steady rest",
  },
  {
    value: "tabata",
    label: "Tabata",
    icon: "Timer",
    hint: "20s on / 10s off",
  },
  {
    value: "circuit",
    label: "Circuit",
    icon: "Repeat",
    hint: "Stations, minimal rest",
  },
  { value: "hiit", label: "HIIT", icon: "Zap", hint: "Max effort intervals" },
];

export const DURATIONS: Duration[] = [15, 20, 30, 45, 60];

export const WARMUP_COUNTS: readonly WarmupCount[] = [1, 2, 3, 4, 5];
export const EXERCISE_COUNTS: readonly ExerciseCount[] = [3, 4, 5, 6, 7, 8, 9, 10];
export const COOLDOWN_COUNTS: readonly CooldownCount[] = [1, 2, 3, 4, 5];

/* Lookup maps for turning stored values back into labels (analytics, logs). */
export const labelOf = <T extends string | number>(
  options: Option<T>[],
  value: T,
): string => options.find((o) => o.value === value)?.label ?? String(value);

export const STORAGE_KEYS = {
  ai: "fp.ai",
  prefs: "fp.prefs",
  user: "fp.user",
  history: "fp.history",
  saved: "fp.saved",
} as const;

export const HISTORY_RETENTION_DAYS = 30;
export const FALLBACK_MODEL_ID = "meta-llama/llama-3.3-70b-instruct:free";

/* The four persisted slices, each a typed Store with strict validation on read.
   This is the contract between localStorage and the rest of the app. */

import type {
  AiSettings,
  CooldownCount,
  Duration,
  Equipment,
  ExerciseCount,
  ExperienceLevel,
  GeneratedWorkout,
  MuscleGroup,
  SavedWorkout,
  UserSettings,
  WarmupCount,
  WorkoutConfig,
  WorkoutLog,
  WorkoutStyle,
} from "@/types";
import {
  COOLDOWN_COUNTS,
  DURATIONS,
  EQUIPMENT,
  EXERCISE_COUNTS,
  EXPERIENCE_LEVELS,
  MUSCLE_GROUPS,
  STORAGE_KEYS,
  WARMUP_COUNTS,
  WORKOUT_STYLES,
} from "./constants";
import { arr, bool, createStore, isObj, oneOf, str } from "./storage";

const MUSCLE_VALUES = MUSCLE_GROUPS.map((m) => m.value);
const EQUIP_VALUES = EQUIPMENT.map((e) => e.value);
const STYLE_VALUES = WORKOUT_STYLES.map((s) => s.value);
const EXP_VALUES = EXPERIENCE_LEVELS.map((e) => e.value);

const isMuscle = (v: unknown): v is MuscleGroup =>
  MUSCLE_VALUES.includes(v as MuscleGroup);
const isEquip = (v: unknown): v is Equipment =>
  EQUIP_VALUES.includes(v as Equipment);

/* ---- AI settings --------------------------------------------------------- */
export const aiStore = createStore<AiSettings>(
  STORAGE_KEYS.ai,
  { apiKey: "", selectedModelId: "", usePaidModels: false },
  (raw): AiSettings => {
    if (!isObj(raw))
      return { apiKey: "", selectedModelId: "", usePaidModels: false };
    return {
      apiKey: str(raw.apiKey),
      selectedModelId: str(raw.selectedModelId),
      usePaidModels: bool(raw.usePaidModels),
    };
  },
);

/* ---- Workout preferences ------------------------------------------------- */
export const DEFAULT_PREFS: WorkoutConfig = {
  experience: "beginner",
  muscles: [],
  equipment: [],
  style: "traditional",
  duration: 30,
  warmupCount: 3,
  exerciseCount: 5,
  cooldownCount: 3,
};

export const prefsStore = createStore<WorkoutConfig>(
  STORAGE_KEYS.prefs,
  DEFAULT_PREFS,
  (raw): WorkoutConfig => {
    if (!isObj(raw)) return DEFAULT_PREFS;
    return {
      experience: oneOf<ExperienceLevel>(raw.experience, EXP_VALUES, "beginner"),
      muscles: arr<MuscleGroup>(raw.muscles, isMuscle),
      equipment: arr<Equipment>(raw.equipment, isEquip),
      style: oneOf<WorkoutStyle>(raw.style, STYLE_VALUES, "traditional"),
      duration: oneOf<Duration>(raw.duration, DURATIONS, 30),
      warmupCount: oneOf<WarmupCount>(raw.warmupCount, WARMUP_COUNTS, 3),
      exerciseCount: oneOf<ExerciseCount>(raw.exerciseCount, EXERCISE_COUNTS, 5),
      cooldownCount: oneOf<CooldownCount>(raw.cooldownCount, COOLDOWN_COUNTS, 3),
    };
  },
);

/* ---- User settings (name, theme, reminder) ------------------------------- */
export const DEFAULT_USER: UserSettings = {
  name: "",
  fitnessLevel: "beginner",
  theme: "light",
  reminder: { enabled: false, time: "18:00" },
  additionalInstructions: "",
  customMuscleGroups: [],
  clockVolume: 0.5,
};

export const userStore = createStore<UserSettings>(
  STORAGE_KEYS.user,
  DEFAULT_USER,
  (raw): UserSettings => {
    if (!isObj(raw)) return DEFAULT_USER;
    const reminder = isObj(raw.reminder) ? raw.reminder : {};
    return {
      name: str(raw.name),
      fitnessLevel: oneOf<ExperienceLevel>(raw.fitnessLevel, EXP_VALUES, "beginner"),
      theme: oneOf(raw.theme, ["system", "light", "dark"] as const, "system"),
      reminder: {
        enabled: bool(reminder.enabled),
        time: /^\d{2}:\d{2}$/.test(str(reminder.time))
          ? str(reminder.time)
          : "18:00",
      },
      additionalInstructions: str(raw.additionalInstructions),
      customMuscleGroups: Array.isArray(raw.customMuscleGroups)
        ? raw.customMuscleGroups.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
        : [],
      clockVolume: typeof raw.clockVolume === "number" ? raw.clockVolume : 0.5,
    };
  },
);

/* ---- History ------------------------------------------------------------- */
function validateLog(raw: unknown): WorkoutLog | null {
  if (!isObj(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.date !== "string") return null;
  const customMuscles = Array.isArray(raw.customMuscles)
    ? raw.customMuscles.filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    : undefined;
  return {
    id: raw.id,
    date: raw.date,
    name: str(raw.name, "Workout"),
    muscles: arr<MuscleGroup>(raw.muscles, isMuscle),
    ...(customMuscles && customMuscles.length > 0 ? { customMuscles } : {}),
    equipment: arr<Equipment>(raw.equipment, isEquip),
    style: oneOf<WorkoutStyle>(raw.style, STYLE_VALUES, "traditional"),
    duration: oneOf<Duration>(raw.duration, DURATIONS, 30),
    status: oneOf(raw.status, ["completed", "skipped"] as const, "completed"),
  };
}

export const historyStore = createStore<WorkoutLog[]>(
  STORAGE_KEYS.history,
  [],
  (raw): WorkoutLog[] =>
    Array.isArray(raw)
      ? raw
          .map(validateLog)
          .filter((l): l is WorkoutLog => l !== null)
      : [],
);

/* ---- Saved workouts ------------------------------------------------------- */
function validateExercise(raw: unknown): GeneratedWorkout["exercises"][number] | null {
  if (!isObj(raw)) return null;
  const name = str(raw.name);
  if (!name) return null;
  return {
    name,
    setsReps: str(raw.setsReps, "—"),
    howTo: str(raw.howTo),
    ...(typeof raw.durationSec === "number" ? { durationSec: raw.durationSec } : {}),
  };
}

function validateGeneratedWorkout(raw: unknown): GeneratedWorkout | null {
  if (!isObj(raw)) return null;
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map(validateExercise).filter((e): e is NonNullable<typeof e> => e !== null)
    : [];
  if (exercises.length === 0) return null;
  const tabataRaw = isObj(raw.tabata) ? raw.tabata : null;
  const tabata =
    tabataRaw &&
    typeof tabataRaw.workSec === "number" &&
    typeof tabataRaw.restSec === "number"
      ? { workSec: Math.round(tabataRaw.workSec), restSec: Math.round(tabataRaw.restSec) }
      : undefined;
  return {
    name: str(raw.name, "Workout"),
    estMinutes: typeof raw.estMinutes === "number" ? raw.estMinutes : 30,
    warmup: arr(raw.warmup, (v): v is string => typeof v === "string"),
    exercises,
    cooldown: arr(raw.cooldown, (v): v is string => typeof v === "string"),
    ...(tabata ? { tabata } : {}),
  };
}

function validateSavedWorkout(raw: unknown): SavedWorkout | null {
  if (!isObj(raw)) return null;
  if (typeof raw.id !== "string" || typeof raw.savedAt !== "string") return null;
  const workout = validateGeneratedWorkout(raw.workout);
  if (!workout) return null;
  // Re-use the prefs store validator logic inline
  const cfg = raw.config;
  if (!isObj(cfg)) return null;
  const config: WorkoutConfig = {
    experience: oneOf<ExperienceLevel>(cfg.experience, EXP_VALUES, "beginner"),
    muscles: arr<MuscleGroup>(cfg.muscles, isMuscle),
    equipment: arr<Equipment>(cfg.equipment, isEquip),
    style: oneOf<WorkoutStyle>(cfg.style, STYLE_VALUES, "traditional"),
    duration: oneOf<Duration>(cfg.duration, DURATIONS, 30),
    warmupCount: oneOf<WarmupCount>(cfg.warmupCount, WARMUP_COUNTS, 3),
    exerciseCount: oneOf<ExerciseCount>(cfg.exerciseCount, EXERCISE_COUNTS, 5),
    cooldownCount: oneOf<CooldownCount>(cfg.cooldownCount, COOLDOWN_COUNTS, 3),
  };
  return {
    id: raw.id,
    name: str(raw.name, workout.name),
    savedAt: raw.savedAt,
    workout,
    config,
  };
}

export const savedWorkoutsStore = createStore<SavedWorkout[]>(
  STORAGE_KEYS.saved,
  [],
  (raw): SavedWorkout[] =>
    Array.isArray(raw)
      ? raw.map(validateSavedWorkout).filter((s): s is SavedWorkout => s !== null)
      : [],
);

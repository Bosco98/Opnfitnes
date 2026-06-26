/* Pure analytics over the rolling 30-day history. No React, no storage — give it
   logs, get metrics. Keeps the dashboard dumb. */

import type {
  Equipment,
  MuscleGroup,
  WorkoutLog,
  WorkoutStyle,
} from "@/types";
import {
  EQUIPMENT,
  MUSCLE_GROUPS,
  WORKOUT_STYLES,
  labelOf,
} from "./constants";
import { dayKey, lastNDays, startOfDay } from "./date";

export interface Headline {
  total: number;
  completed: number;
  skipped: number;
  /** completed / target — can exceed 1.0 when user beats their goal */
  completionRate: number;
  target: number;
  totalMinutes: number;
  topMuscle: string | null;
  topStyle: string | null;
  topEquipment: string | null;
  currentStreak: number;
}

export interface CountSlice<T extends string> {
  key: T;
  label: string;
  value: number;
}

export interface HeatCell {
  day: string; // YYYY-MM-DD
  count: number;
}

export interface WeekBar {
  label: string;
  total: number;
  completed: number;
}

function mostCommon<T extends string>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const i of items) counts.set(i, (counts.get(i) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

const MUSCLE_VALUES = MUSCLE_GROUPS.map((m) => m.value);

export function headline(logs: WorkoutLog[], target = 30): Headline {
  const completed = logs.filter((l) => l.status === "completed");
  const minutes = completed.reduce((sum, l) => sum + l.duration, 0);

  // Combine standard and custom muscles for top-muscle calculation
  const allMuscles = completed.flatMap((l) => [
    ...(l.muscles as string[]),
    ...(l.customMuscles ?? []),
  ]);
  const topMuscleRaw = mostCommon(allMuscles);
  const topMuscle = topMuscleRaw
    ? MUSCLE_VALUES.includes(topMuscleRaw as MuscleGroup)
      ? labelOf(MUSCLE_GROUPS, topMuscleRaw as MuscleGroup)
      : topMuscleRaw // custom labels are already human-readable
    : null;

  const topStyle = mostCommon(completed.map((l) => l.style));
  const topEquipment = mostCommon(completed.flatMap((l) => l.equipment));

  return {
    total: logs.length,
    completed: completed.length,
    skipped: logs.filter((l) => l.status === "skipped").length,
    completionRate: completed.length / target,
    target,
    totalMinutes: minutes,
    topMuscle,
    topStyle: topStyle ? labelOf(WORKOUT_STYLES, topStyle) : null,
    topEquipment: topEquipment ? labelOf(EQUIPMENT, topEquipment) : null,
    currentStreak: streak(completed),
  };
}

/** Consecutive days up to today with at least one completed workout. */
export function streak(completed: WorkoutLog[]): number {
  const days = new Set(completed.map((l) => dayKey(l.date)));
  const order = lastNDays(60).reverse(); // today first
  let count = 0;
  for (let i = 0; i < order.length; i++) {
    if (days.has(order[i])) count++;
    else if (i === 0) continue; // today not done yet doesn't break a streak
    else break;
  }
  return count;
}

/** Per-muscle completed counts — standard groups in catalog order, then custom
    groups discovered in history. Drives the radar chart. */
export function muscleRadar(logs: WorkoutLog[]): CountSlice<string>[] {
  const completed = logs.filter((l) => l.status === "completed");
  const standard: CountSlice<string>[] = MUSCLE_GROUPS.map((m) => ({
    key: m.value,
    label: m.label,
    value: completed.filter((l) => l.muscles.includes(m.value)).length,
  }));

  const customCounts = new Map<string, number>();
  for (const l of completed) {
    for (const m of l.customMuscles ?? []) {
      const norm = m.trim();
      if (norm) customCounts.set(norm, (customCounts.get(norm) ?? 0) + 1);
    }
  }
  const custom: CountSlice<string>[] = [...customCounts.entries()].map(([key, value]) => ({
    key,
    label: key,
    value,
  }));

  return [...standard, ...custom];
}

export function styleSplit(logs: WorkoutLog[]): CountSlice<WorkoutStyle>[] {
  return WORKOUT_STYLES.map((s) => ({
    key: s.value,
    label: s.label,
    value: logs.filter((l) => l.style === s.value).length,
  })).filter((s) => s.value > 0);
}

export function equipmentSplit(logs: WorkoutLog[]): CountSlice<Equipment>[] {
  return EQUIPMENT.map((e) => ({
    key: e.value,
    label: e.label,
    value: logs.filter((l) => l.equipment.includes(e.value)).length,
  }))
    .filter((e) => e.value > 0)
    .sort((a, b) => b.value - a.value);
}

/** 30-day heatmap cells, oldest → newest. */
export function heatmap(logs: WorkoutLog[], days = 30): HeatCell[] {
  const counts = new Map<string, number>();
  for (const l of logs) {
    if (l.status !== "completed") continue;
    const k = dayKey(l.date);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return lastNDays(days).map((day) => ({ day, count: counts.get(day) ?? 0 }));
}

export function weeklyActivity(logs: WorkoutLog[], weeks = 4): WeekBar[] {
  const endOfToday = new Date(startOfDay(new Date()).getTime() + 86_400_000);
  const result: WeekBar[] = [];
  for (let i = 0; i < weeks; i++) {
    const start = new Date(endOfToday.getTime() - (i + 1) * 7 * 86_400_000);
    const end = new Date(endOfToday.getTime() - i * 7 * 86_400_000);
    const inWeek = logs.filter((l) => {
      const t = new Date(l.date).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    
    let label = "";
    if (i === 0) label = "Last 7";
    else if (i === 1) label = "8-14";
    else if (i === 2) label = "15-21";
    else if (i === 3) label = "22-28";
    else label = `${i * 7 + 1}-${(i + 1) * 7}`;

    result.push({
      label,
      total: inWeek.length,
      completed: inWeek.filter((l) => l.status === "completed").length,
    });
  }
  return result;
}

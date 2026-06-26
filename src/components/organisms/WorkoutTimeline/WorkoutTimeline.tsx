import { useMemo } from "react";
import type { WorkoutLog } from "@/types";
import { MUSCLE_GROUPS } from "@/lib/constants";
import { dayKey, shortDate } from "@/lib/date";
import { cn } from "@/lib/cn";
import "./WorkoutTimeline.css";

interface DayGroup {
  key: string;
  logs: WorkoutLog[];
}

function formatDay(key: string): string {
  const todayKey = dayKey(new Date());
  const yesterdayKey = dayKey(new Date(Date.now() - 86_400_000));
  if (key === todayKey) return "Today";
  if (key === yesterdayKey) return "Yesterday";
  return shortDate(new Date(key + "T12:00:00"));
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function muscleLabel(m: string): string {
  return MUSCLE_GROUPS.find((g) => g.value === m)?.label ?? m;
}

export interface WorkoutTimelineProps {
  logs: WorkoutLog[];
}

export function WorkoutTimeline({ logs }: WorkoutTimelineProps) {
  const groups = useMemo<DayGroup[]>(() => {
    const sorted = [...logs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    const map = new Map<string, WorkoutLog[]>();
    for (const l of sorted) {
      const k = dayKey(l.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(l);
    }
    return [...map.entries()].map(([key, dayLogs]) => ({ key, logs: dayLogs }));
  }, [logs]);

  if (groups.length === 0) {
    return <p className="tl__empty">No workouts logged yet.</p>;
  }

  return (
    <div className="tl">
      {groups.map(({ key, logs: dayLogs }) => (
        <div key={key} className="tl__group">
          <div className="tl__day" aria-label={formatDay(key)}>
            {formatDay(key)}
          </div>
          {dayLogs.map((log, i) => (
            <div
              key={log.id}
              className={cn("tl__item", log.status === "skipped" && "tl__item--skipped")}
            >
              <div className="tl__spine" aria-hidden="true">
                <span className="tl__dot" />
                {i < dayLogs.length - 1 && <span className="tl__line" />}
              </div>
              <div className="tl__content">
                <div className="tl__row">
                  <span className="tl__name">{log.name}</span>
                  <span className="tl__dur">{log.duration}m</span>
                </div>
                <span className="tl__time">{formatTime(log.date)}</span>
                {[...log.muscles, ...(log.customMuscles ?? [])].length > 0 && (
                  <div className="tl__chips">
                    {[...log.muscles, ...(log.customMuscles ?? [])].map((m) => (
                      <span key={m} className="tl__chip">
                        {muscleLabel(m)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

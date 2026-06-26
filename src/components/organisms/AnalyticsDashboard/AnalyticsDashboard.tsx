import { useMemo } from "react";
import type { ExperienceLevel, WorkoutLog } from "@/types";
import {
  equipmentSplit,
  headline,
  heatmap,
  muscleRadar,
  styleSplit,
  weeklyActivity,
} from "@/lib/analytics";
import { ProgressRing, Stat } from "@/components/atoms";
import { Section } from "@/components/molecules";
import { Heatmap } from "../Heatmap";
import { RadarChart } from "../RadarChart";
import { BarChart } from "../BarChart";
import { DistributionBars } from "../DistributionBars";
import "./AnalyticsDashboard.css";

const LEVEL_TARGET: Record<ExperienceLevel, number> = {
  rookie: 30,
  beginner: 45,
  advanced: 60,
};

export interface AnalyticsDashboardProps {
  history: WorkoutLog[];
  fitnessLevel: ExperienceLevel;
}

/** Insights over the rolling 30-day dataset. All metrics are pure-computed from
   `history` via the analytics lib — this organism only arranges them. */
export function AnalyticsDashboard({
  history,
  fitnessLevel,
}: AnalyticsDashboardProps) {
  const target = LEVEL_TARGET[fitnessLevel];
  const stats = useMemo(() => headline(history, target), [history, target]);
  const heat = useMemo(() => heatmap(history), [history]);
  const radar = useMemo(() => muscleRadar(history), [history]);
  const weekly = useMemo(() => weeklyActivity(history), [history]);
  const styles = useMemo(() => styleSplit(history), [history]);
  const equipment = useMemo(() => equipmentSplit(history), [history]);

  const completionPct = Math.round(stats.completionRate * 100);
  const ringProgress = Math.min(stats.completionRate, 1);
  const hasRadar = radar.some((r) => r.value > 0);

  return (
    <div className="dash">
      <Section
        title="30-day activity"
        icon="Flame"
        caption="Darker means more workouts that day."
      >
        <Heatmap cells={heat} />
      </Section>

      {/* Headline grid — emphasis drives box size (importance → bigger). */}
      <div className="dash__grid">

        <div className="dash__cell dash__cell--ring">
          <div className="dash__ring-card">
            <ProgressRing
              progress={ringProgress}
              size={92}
              stroke={9}
              color="var(--success)"
            >
              <span className="dash__ring-num num">{completionPct}%</span>
            </ProgressRing>
            <span className="dash__ring-label">last 30</span>
          </div>
        </div>

        <div className="dash__cell">
          <Stat
            value={stats.currentStreak}
            label="Day streak"
            icon="Flame"
            emphasis="md"
            suffix={stats.currentStreak === 1 ? "day" : "days"}
          />
        </div>

        {hasRadar && (
          <div className="dash__cell dash__cell--full">
            <Section
              title="Muscle focus"
              icon="HeartPulse"
              caption="Where your training is going — and what's getting neglected."
            >
              <RadarChart data={radar} maxValue={target} />
            </Section>
          </div>
        )}
        <div className="dash__cell">
          <Stat
            value={stats.totalMinutes}
            label="Minutes trained"
            icon="Clock"
            emphasis="md"
            suffix="min"
          />
        </div>

        <div className="dash__cell dash__cell--sm">
          <Stat value={stats.total} label="Total" emphasis="sm" />
        </div>
        <div className="dash__cell dash__cell--sm">
          <Stat value={stats.skipped} label="Skipped" emphasis="sm" />
        </div>
        <div className="dash__cell dash__cell--full">
          <Section title="Workouts per week" icon="BarChart3">
            <BarChart data={weekly} />
          </Section>
        </div>
        <div className="dash__cell dash__cell--sm">
          <Stat
            value={stats.topStyle ?? "—"}
            label="Top style"
            emphasis="sm"
          />
        </div>
      </div>

      {/* favourite muscle / equipment quick read */}
      {(stats.topMuscle || stats.topEquipment) && (
        <div className="dash__favs">
          {stats.topMuscle && (
            <div className="dash__fav">
              <span className="dash__fav-label">Most trained</span>
              <span className="dash__fav-value">{stats.topMuscle}</span>
            </div>
          )}
          {stats.topEquipment && (
            <div className="dash__fav">
              <span className="dash__fav-label">Go-to gear</span>
              <span className="dash__fav-value">{stats.topEquipment}</span>
            </div>
          )}
        </div>
      )}







      {styles.length > 0 && (
        <Section title="Style split" icon="Zap">
          <DistributionBars data={styles} />
        </Section>
      )}

      {equipment.length > 0 && (
        <Section title="Equipment used" icon="Dumbbell">
          <DistributionBars data={equipment} />
        </Section>
      )}

     </div>
  );
}

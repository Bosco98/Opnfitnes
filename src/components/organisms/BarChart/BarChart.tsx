import type { WeekBar } from "@/lib/analytics";
import "./BarChart.css";

export interface BarChartProps {
  data: WeekBar[];
}

/** Weekly activity columns — completed (accent) stacked under total (track). */
export function BarChart({ data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.total));

  return (
    <div className="barchart" role="img" aria-label="Workouts per week">
      {data.map((d) => (
        <div className="barchart__col" key={d.label}>
          <div className="barchart__track">
            <div
              className="barchart__fill barchart__fill--total"
              style={{ height: `${(d.total / max) * 100}%` }}
            />
            <div
              className="barchart__fill barchart__fill--done"
              style={{ height: `${(d.completed / max) * 100}%` }}
            />
            {d.total > 0 && (
              <span className="barchart__value num">{d.total}</span>
            )}
          </div>
          <span className="barchart__label num">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

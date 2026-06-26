import type { HeatCell } from "@/lib/analytics";
import { shortDate } from "@/lib/date";
import "./Heatmap.css";

export interface HeatmapProps {
  cells: HeatCell[];
}

/** 30-day activity heatmap. Intensity = workouts completed that day.
   Renders sequentially as a 7-column block without weekday alignment. */
export function Heatmap({ cells }: HeatmapProps) {
  if (cells.length === 0) return null;

  const max = Math.max(1, ...cells.map((c) => c.count));
  const level = (count: number): number => {
    if (count === 0) return 0;
    return Math.min(4, Math.ceil((count / max) * 4));
  };

  return (
    <div className="heatmap">
      <div
        className="heatmap__grid"
        role="img"
        aria-label="30-day activity"
      >
        {cells.map((c) => (
          <span
            key={c.day}
            className="heatmap__cell"
            data-level={level(c.count)}
            title={`${shortDate(c.day)}: ${c.count} workout${c.count === 1 ? "" : "s"}`}
          />
        ))}
      </div>
      <div className="heatmap__legend">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className="heatmap__cell" data-level={l} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

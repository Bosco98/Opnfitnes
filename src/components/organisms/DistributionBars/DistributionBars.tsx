import type { CountSlice } from "@/lib/analytics";
import "./DistributionBars.css";

export interface DistributionBarsProps<T extends string> {
  data: CountSlice<T>[];
  /** total to compute percentages against; defaults to sum of values */
  total?: number;
}

const PALETTE = [
  "var(--primary)",
  "var(--accent)",
  "var(--success)",
  "var(--warn)",
  "var(--danger)",
  "oklch(0.65 0.15 280)",
  "oklch(0.7 0.15 320)",
  "oklch(0.75 0.15 40)"
];

/** Single segmented horizontal bar with a legend underneath. */
export function DistributionBars<T extends string>({
  data,
  total,
}: DistributionBarsProps<T>) {
  const sum = total ?? data.reduce((acc, d) => acc + d.value, 0);
  if (sum === 0) return null;

  return (
    <div className="dist">
      <div className="dist__bar">
        {data.map((d, i) => {
          const width = (d.value / sum) * 100;
          return (
            <div
              key={d.key}
              className="dist__segment"
              style={{
                width: `${width}%`,
                background: PALETTE[i % PALETTE.length],
              }}
              title={`${d.label}: ${d.value} (${Math.round(width)}%)`}
            />
          );
        })}
      </div>
      <ul className="dist__legend">
        {data.map((d, i) => {
          const pct = Math.round((d.value / sum) * 100);
          return (
            <li className="dist__legend-item" key={d.key}>
              <span
                className="dist__dot"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="dist__legend-label">{d.label}</span>
              <span className="dist__legend-value num">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

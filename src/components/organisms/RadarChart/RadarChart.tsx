import type { CountSlice } from "@/lib/analytics";
import "./RadarChart.css";

export interface RadarSeries<T extends string> {
  label: string;
  data: CountSlice<T>[];
  color: string; // CSS color or var()
  dashed?: boolean;
}

export interface RadarChartProps<T extends string> {
  data: CountSlice<T>[];
  series?: RadarSeries<T>[];
  size?: number;
  /** When provided, values are normalized against this ceiling instead of the
      data's own maximum. Allows the chart to be relative to a fixed goal. */
  maxValue?: number;
}

/** Spider/radar chart of muscle focus. Supports a single `data` series or
    multiple `series` for head-to-head overlays. Pure SVG, no chart library. */
export function RadarChart<T extends string>({
  data,
  series,
  size = 280,
  maxValue,
}: RadarChartProps<T>) {
  const allSeries: RadarSeries<T>[] = series ?? [
    { label: "You", data, color: "var(--accent)", dashed: false },
  ];

  const center = size / 2;
  const radius = center - 42;
  const n = data.length;
  const globalMax = maxValue ?? Math.max(
    1,
    ...allSeries.flatMap((s) => s.data.map((d) => d.value)),
  );
  const rings = [0.25, 0.5, 0.75, 1];

  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number) => ({
    x: center + Math.cos(angle(i)) * radius * r,
    y: center + Math.sin(angle(i)) * radius * r,
  });

  return (
    <div className="radar">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="radar__svg"
        role="img"
        aria-label="Muscle group focus"
      >
        {/* rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            className="radar__ring"
            points={data.map((_, i) => { const p = point(i, r); return `${p.x},${p.y}`; }).join(" ")}
          />
        ))}
        {/* axes */}
        {data.map((_, i) => {
          const p = point(i, 1);
          return <line key={i} className="radar__axis" x1={center} y1={center} x2={p.x} y2={p.y} />;
        })}
        {/* series polygons */}
        {allSeries.map((s, si) => {
          const pts = s.data.map((d, i) => point(i, d.value / globalMax));
          const polygon = pts.map((p) => `${p.x},${p.y}`).join(" ");
          return (
            <g key={si}>
              <polygon
                className="radar__area"
                points={polygon}
                style={{
                  fill: `color-mix(in oklch, ${s.color} 18%, transparent)`,
                  stroke: s.color,
                  strokeDasharray: s.dashed ? "4 3" : undefined,
                } as React.CSSProperties}
              />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={3} style={{ fill: s.color }} />
              ))}
            </g>
          );
        })}
        {/* labels — from first series */}
        {data.map((d, i) => {
          const p = point(i, 1.16);
          return (
            <text
              key={d.key}
              className="radar__label"
              x={p.x}
              y={p.y}
              textAnchor={Math.abs(p.x - center) < 12 ? "middle" : p.x > center ? "start" : "end"}
              dominantBaseline="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
      {/* legend for multi-series */}
      {allSeries.length > 1 && (
        <div className="radar__legend">
          {allSeries.map((s, i) => (
            <div key={i} className="radar__legend-item">
              <span className="radar__legend-dot" style={{ background: s.color }} />
              <span className="radar__legend-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

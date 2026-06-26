import type { ReactNode } from "react";
import "./ProgressRing.css";

export interface ProgressRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
  /** css color for the progress arc */
  color?: string;
}

/** Circular progress used by the workout timer. Pure SVG, no deps. */
export function ProgressRing({
  progress,
  size = 240,
  stroke = 12,
  color = "var(--accent)",
  children,
}: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg
        className="ring__svg"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
      >
        <circle
          className="ring__track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className="ring__arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          fill="none"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="ring__content">{children}</div>
    </div>
  );
}

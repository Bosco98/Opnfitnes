import { cn } from "@/lib/cn";
import "./Slider.css";

export interface SliderProps<T extends number> {
  stops: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  formatTick?: (value: T) => string;
}

/** Discrete-stop slider. Snaps between the provided stops; keyboard + drag via a
   native range under the hood, styled track + tick labels on top. */
export function Slider<T extends number>({
  stops,
  value,
  onChange,
  ariaLabel,
  formatTick = (v) => String(v),
}: SliderProps<T>) {
  const index = Math.max(0, stops.indexOf(value));
  const pct = stops.length > 1 ? (index / (stops.length - 1)) * 100 : 0;

  return (
    <div className="slider">
      <div className="slider__track-wrap">
        <div className="slider__track">
          <div className="slider__fill" style={{ width: `${pct}%` }} />
        </div>
        <input
          className="slider__input"
          type="range"
          min={0}
          max={stops.length - 1}
          step={1}
          value={index}
          aria-label={ariaLabel}
          aria-valuetext={formatTick(value)}
          onChange={(e) => onChange(stops[Number(e.target.value)])}
        />
        <span
          className="slider__thumb"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
      <div className="slider__ticks">
        {stops.map((s) => (
          <button
            key={s}
            type="button"
            className={cn(
              "slider__tick",
              s === value && "slider__tick--active",
            )}
            onClick={() => onChange(s)}
            tabIndex={-1}
          >
            {formatTick(s)}
          </button>
        ))}
      </div>
    </div>
  );
}

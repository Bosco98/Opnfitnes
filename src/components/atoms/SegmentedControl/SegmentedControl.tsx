import { cn } from "@/lib/cn";
import { Icon, type IconName } from "../Icon";
import "./SegmentedControl.css";

export interface Segment<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

export interface SegmentedControlProps<T extends string> {
  segments: Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  /** show only icons (labels become a11y-only) */
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  segments,
  value,
  onChange,
  ariaLabel,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <div className="seg" role="radiogroup" aria-label={ariaLabel}>
      {segments.map((s) => {
        const active = s.value === value;
        return (
          <button
            key={s.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={compact ? s.label : undefined}
            className={cn("seg__item", active && "seg__item--active")}
            onClick={() => onChange(s.value)}
          >
            {s.icon && <Icon name={s.icon} size={16} />}
            {!compact && <span>{s.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

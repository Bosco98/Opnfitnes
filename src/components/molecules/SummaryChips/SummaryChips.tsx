import type { WorkoutConfig } from "@/types";
import {
  EQUIPMENT,
  EXPERIENCE_LEVELS,
  MUSCLE_GROUPS,
  WORKOUT_STYLES,
  labelOf,
} from "@/lib/constants";
import { Badge } from "@/components/atoms";
import "./SummaryChips.css";

export interface SummaryChipsProps {
  config: WorkoutConfig;
}

/** Compact recap of the chosen config — used on the generating + result screens. */
export function SummaryChips({ config }: SummaryChipsProps) {
  return (
    <div className="summary-chips">
      <Badge tone="accent" icon="Timer">
        {config.duration} min
      </Badge>
      <Badge tone="neutral" icon="TrendingUp">
        {labelOf(EXPERIENCE_LEVELS, config.experience)}
      </Badge>
      <Badge tone="neutral" icon="Zap">
        {labelOf(WORKOUT_STYLES, config.style)}
      </Badge>
      {config.muscles.map((m) => (
        <Badge key={m} tone="neutral">
          {labelOf(MUSCLE_GROUPS, m)}
        </Badge>
      ))}
      {config.equipment.map((e) => (
        <Badge key={e} tone="neutral">
          {labelOf(EQUIPMENT, e)}
        </Badge>
      ))}
    </div>
  );
}

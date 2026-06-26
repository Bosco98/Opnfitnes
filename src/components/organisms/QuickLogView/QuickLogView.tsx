import { useState } from "react";
import type { WorkoutConfig } from "@/types";
import { Button, TextField } from "@/components/atoms";
import { SummaryChips } from "@/components/molecules";
import { MUSCLE_GROUPS, WORKOUT_STYLES, labelOf } from "@/lib/constants";
import "./QuickLogView.css";

export interface QuickLogViewProps {
  config: WorkoutConfig;
  onLog: (name: string) => void;
  onBack: () => void;
}

function buildDefaultName(config: WorkoutConfig): string {
  const style = labelOf(WORKOUT_STYLES, config.style);
  const muscles = config.muscles
    .slice(0, 2)
    .map((m) => labelOf(MUSCLE_GROUPS, m))
    .join(" + ");
  return muscles ? `${muscles} ${style}` : `${config.duration} min ${style}`;
}

/** Quick manual workout log — no generation required. */
export function QuickLogView({ config, onLog, onBack }: QuickLogViewProps) {
  const [name, setName] = useState(() => buildDefaultName(config));

  return (
    <div className="qlog">
      <header className="qlog__header">
        <span className="qlog__eyebrow">Quick log</span>
        <h1 className="qlog__title">Log a workout</h1>
        <p className="qlog__subtitle">Record a workout you already did.</p>
      </header>

      <div className="qlog__section">
        <span className="qlog__label">Workout name</span>
        <TextField
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning run"
          iconLeft="ListChecks"
        />
      </div>

      <div className="qlog__section">
        <span className="qlog__label">Based on your saved preferences</span>
        <div className="qlog__chips">
          <SummaryChips config={config} />
        </div>
      </div>

      <div className="qlog__actions">
        <Button
          variant="primary"
          size="lg"
          iconLeft="CheckCheck"
          fullWidth
          onClick={() => onLog(name.trim() || buildDefaultName(config))}
        >
          Log workout
        </Button>
        <button type="button" className="wizard__back-link" onClick={onBack}>
          ← Cancel
        </button>
      </div>
    </div>
  );
}

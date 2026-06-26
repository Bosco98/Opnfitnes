import type { WorkoutConfig } from "@/types";
import { Button, Icon } from "@/components/atoms";
import { SummaryChips } from "@/components/molecules";
import "./GeneratingView.css";

type Status = "idle" | "loading" | "error";

export interface GenAttempt {
  label: string;
  index: number; // 0-based
  total: number;
}

export interface GeneratingViewProps {
  config: WorkoutConfig;
  status: Status;
  errorMessage?: string;
  modelLabel: string;
  attempt?: GenAttempt | null;
  onGenerate: () => void;
  onBack?: () => void;
}

const LOADING_LINES = [
  "Reading your equipment…",
  "Balancing the muscle split…",
  "Setting sets, reps & rest…",
  "Adding warmup and cooldown…",
];

const STYLE_TIPS: Record<string, string> = {
  traditional: "Rest fully between sets — quality beats quantity.",
  tabata: "Push hard during work phases; the rest is earned.",
  circuit: "Keep transitions fast; your heart rate stays elevated.",
  hiit: "Max effort every interval — go all in.",
};

/** Visual breakdown of the three session phases. */
function WorkoutStructurePreview({ config }: { config: WorkoutConfig }) {
  const tip = STYLE_TIPS[config.style];
  const phases = [
    { icon: "Sun" as const, label: "Warmup", count: config.warmupCount, unit: "items", color: "warn" },
    { icon: "Dumbbell" as const, label: "Exercises", count: config.exerciseCount, unit: "exercises", color: "accent" },
    { icon: "Activity" as const, label: "Cooldown", count: config.cooldownCount, unit: "items", color: "success" },
  ];

  return (
    <div className="genv__structure">
      <div className="genv__structure-phases">
        {phases.map((phase, i) => (
          <div key={phase.label} className="genv__phase">
            {i > 0 && <div className="genv__phase-connector" aria-hidden />}
            <div className={`genv__phase-icon genv__phase-icon--${phase.color}`}>
              <Icon name={phase.icon} size={18} />
            </div>
            <div className="genv__phase-info">
              <span className="genv__phase-label">{phase.label}</span>
              <span className="genv__phase-count num">{phase.count} {phase.unit}</span>
            </div>
          </div>
        ))}
      </div>
      {tip && (
        <div className="genv__tip">
          <Icon name="Sparkles" size={13} />
          <span>{tip}</span>
        </div>
      )}
    </div>
  );
}

/** The pre-result screen: confirm config → generate → loading / error. */
export function GeneratingView({
  config,
  status,
  errorMessage,
  modelLabel,
  attempt,
  onGenerate,
  onBack,
}: GeneratingViewProps) {
  if (status === "loading") {
    // index > 0 means the first model(s) failed and we're rolling to a fallback.
    const onFallback = attempt != null && attempt.index > 0;
    return (
      <div className="genv genv--loading">
        <div className="genv__pulse" aria-hidden>
          <Icon name="Dumbbell" size={30} />
        </div>
        <h2 className="genv__heading">Building your workout</h2>
        {onFallback && (
          <p className="genv__fallback" aria-live="polite">
            <Icon name="RotateCcw" size={13} /> First model was busy — trying{" "}
            <strong>{attempt!.label}</strong> ({attempt!.index + 1}/
            {attempt!.total})
          </p>
        )}
        <ul className="genv__lines" aria-live="polite">
          {LOADING_LINES.map((line, i) => (
            <li
              key={line}
              className="genv__line"
              style={{ animationDelay: `${i * 0.6}s` }}
            >
              <Icon name="Check" size={14} strokeWidth={3} />
              {line}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="genv">
      <div className="genv__recap">
        <h2 className="genv__heading">You&apos;re all set</h2>
        <p className="genv__sub">
          Generating with <strong>{modelLabel}</strong>
        </p>
        <SummaryChips config={config} />
      </div>

      <WorkoutStructurePreview config={config} />

      {status === "error" && (
        <div className="genv__error" role="alert">
          <Icon name="AlertTriangle" size={18} />
          <span>{errorMessage ?? "Generation failed."}</span>
        </div>
      )}

      <div className="genv__actions">
        {onBack && (
          <button className="wizard__back-link" onClick={onBack}>
            ← Adjust selection
          </button>
        )}
        <Button
          variant="accent"
          size="lg"
          iconLeft={status === "error" ? "RotateCcw" : "Wand2"}
          fullWidth
          onClick={onGenerate}
        >
          {status === "error" ? "Try again" : "Generate workout"}
        </Button>
      </div>
    </div>
  );
}

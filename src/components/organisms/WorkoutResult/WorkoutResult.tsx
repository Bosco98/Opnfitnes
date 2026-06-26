import { useState } from "react";
import type { GeneratedWorkout, SwapTargets, WorkoutConfig } from "@/types";
import { Button, Icon, TextArea, TextField } from "@/components/atoms";
import { ExerciseTable, PhaseList, SummaryChips } from "@/components/molecules";
import "./WorkoutResult.css";

export interface WorkoutResultProps {
  workout: GeneratedWorkout;
  config: WorkoutConfig;
  onStart: () => void;
  onSkip: () => void;
  onRegenerate: (swap?: SwapTargets) => void;
  onSaveAndStart?: (name: string) => void;
}

/** The generated workout: name, recap, warmup, table, cooldown, and the call to
   start (which logs it + launches the timer). */
export function WorkoutResult({
  workout,
  config,
  onStart,
  onSkip,
  onRegenerate,
  onSaveAndStart,
}: WorkoutResultProps) {
  const [warmupSel, setWarmupSel] = useState<Set<number>>(new Set());
  const [exerciseSel, setExerciseSel] = useState<Set<number>>(new Set());
  const [cooldownSel, setCooldownSel] = useState<Set<number>>(new Set());
  const [note, setNote] = useState("");
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [saveName, setSaveName] = useState(workout.name);

  const totalSelected = warmupSel.size + exerciseSel.size + cooldownSel.size;

  const handleRegenerate = () => {
    const hasSelections = totalSelected > 0;
    const hasNote = note.trim().length > 0;
    if (hasSelections || hasNote) {
      const swap: SwapTargets = {};
      if (warmupSel.size)
        swap.warmup = [...warmupSel].map((i) => workout.warmup[i]);
      if (exerciseSel.size)
        swap.exercises = [...exerciseSel].map((i) => workout.exercises[i].name);
      if (cooldownSel.size)
        swap.cooldown = [...cooldownSel].map((i) => workout.cooldown[i]);
      if (hasNote) swap.note = note.trim();
      onRegenerate(swap);
    } else {
      onRegenerate();
    }
    setWarmupSel(new Set());
    setExerciseSel(new Set());
    setCooldownSel(new Set());
    setNote("");
  };

  return (
    <div className="result">
      <header className="result__header">
        <div className="result__eyebrow num">
          <Icon name="Sparkles" size={13} /> Your workout
        </div>
        <h1 className="result__name">{workout.name}</h1>
        <div className="result__meta num">
          <span>
            <Icon name="Timer" size={14} /> {workout.estMinutes} min
          </span>
          <span>
            <Icon name="ListChecks" size={14} /> {workout.exercises.length}{" "}
            exercises
          </span>
        </div>
      </header>

      <SummaryChips config={config} />

      <div className="result__swap-bar">
        <p className="result__swap-tip">
          <Icon name="RotateCcw" size={12} /> Tap circles to select items to swap
        </p>
        <span className={`result__swap-hint${totalSelected > 0 ? " result__swap-hint--visible" : ""}`}>
          {totalSelected > 0 ? `${totalSelected} selected` : " "}
        </span>
      </div>

      <PhaseList
        title="Warmup"
        icon="Flame"
        items={workout.warmup}
        tone="warn"
        selectable
        selectedIndices={warmupSel}
        onSelectionChange={setWarmupSel}
      />

      <div className="result__main">
        <h2 className="result__section">
          <Icon name="Dumbbell" size={16} /> Main workout
        </h2>
        <ExerciseTable
          exercises={workout.exercises}
          selectable
          selectedIndices={exerciseSel}
          onSelectionChange={setExerciseSel}
        />
      </div>

      <PhaseList
        title="Cooldown"
        icon="HeartPulse"
        items={workout.cooldown}
        tone="accent"
        selectable
        selectedIndices={cooldownSel}
        onSelectionChange={setCooldownSel}
      />

      <div className="result__note">
        <TextArea
          placeholder="Any notes for the AI? e.g. &quot;no jumping exercises&quot;"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          rows={2}
          aria-label="Additional note for regeneration"
        />
      </div>

      <div className="result__actions">
        {showSavePanel ? (
          <div className="result__save-panel">
            <TextField
              autoFocus
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && saveName.trim()) onSaveAndStart?.(saveName.trim());
                if (e.key === "Escape") setShowSavePanel(false);
              }}
              placeholder="Workout name…"
              aria-label="Name for saved workout"
            />
            <div className="result__save-row">
              <Button
                variant="accent"
                size="sm"
                iconLeft="BookmarkCheck"
                onClick={() => onSaveAndStart?.(saveName.trim() || workout.name)}
                disabled={!saveName.trim()}
              >
                Save and go
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowSavePanel(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button
              variant="accent"
              size="md"
              iconLeft="Play"
              fullWidth
              onClick={onStart}
            >
              {onSaveAndStart ? "Start" : "Start workout"}
            </Button>
            <div className="result__actions-row">
              {onSaveAndStart && (
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft="BookmarkCheck"
                  onClick={() => {
                    setSaveName(workout.name);
                    setShowSavePanel(true);
                  }}
                >
                  Save and go
                </Button>
              )}
              <Button
                variant="secondary"
                size="sm"
                iconLeft={totalSelected > 0 || note.trim() ? "Wand2" : "RotateCcw"}
                onClick={handleRegenerate}
              >
                {totalSelected > 0
                  ? `Swap ${totalSelected}`
                  : note.trim()
                    ? "With note"
                    : "Regenerate"}
              </Button>
              <Button variant="ghost" size="sm" iconLeft="SkipForward" onClick={onSkip}>
                Not now
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

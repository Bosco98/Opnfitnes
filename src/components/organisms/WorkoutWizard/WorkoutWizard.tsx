import { useEffect, useMemo, useRef, useState } from "react";
import type { CooldownCount, Duration, Equipment, ExerciseCount, MuscleGroup, WarmupCount } from "@/types";
import {
  COOLDOWN_COUNTS,
  DURATIONS,
  EQUIPMENT,
  EXERCISE_COUNTS,
  EXPERIENCE_LEVELS,
  FALLBACK_MODEL_ID,
  MUSCLE_GROUPS,
  WARMUP_COUNTS,
  WORKOUT_STYLES,
  labelOf,
} from "@/lib/constants";
import type { Option } from "@/lib/constants";
import { useAiSettings } from "@/hooks/useSettings";
import { useUserSettings } from "@/hooks/useSettings";
import { usePreferences } from "@/hooks/usePreferences";
import { useHistory } from "@/hooks/useHistory";
import { useModels } from "@/hooks/useModels";
import { useSavedWorkouts } from "@/hooks/useSavedWorkouts";
import { useWorkoutGenerator } from "@/hooks/useWorkoutGenerator";
import { Button, Slider, TextField } from "@/components/atoms";
import { SelectableGrid, StepHeader, StepNav } from "@/components/molecules";
import { WorkoutIntro } from "../WorkoutIntro";
import { GeneratingView } from "../GeneratingView";
import { WorkoutResult } from "../WorkoutResult";
import { TimerSession } from "../TimerSession";
import { StandaloneTimer } from "../StandaloneTimer";
import "./WorkoutWizard.css";

type Phase =
  | "intro"
  | "experience"
  | "muscles"
  | "equipment"
  | "style"
  | "duration"
  | "counts"
  | "generate"
  | "result"
  | "session"
  | "timer";

const PICK_STEPS: Phase[] = [
  "experience",
  "muscles",
  "equipment",
  "style",
  "duration",
  "counts",
];
const TOTAL_STEPS = PICK_STEPS.length;

const MUSCLE_VALUES = MUSCLE_GROUPS.map((m) => m.value) as string[];

const EQUIPMENT_NONE: Option<Equipment> = {
  value: "none",
  label: "None",
  icon: "X",
  hint: "No equipment used",
};

function buildLogName(muscles: string[], customMuscles: string[], style: string): string {
  const parts = [...muscles.slice(0, 2), ...customMuscles.slice(0, 1)];
  return parts.length ? `${parts.join(" + ")} · ${style}` : `${style} Workout`;
}

export interface WorkoutWizardProps {
  onGoToSettings: () => void;
  onGoToSaved?: () => void;
}

/** Orchestrates the full workout flow as a phase machine. Owns no presentation
   detail — each phase delegates to a focused organism/molecule. */
export function WorkoutWizard({ onGoToSettings, onGoToSaved }: WorkoutWizardProps) {
  const { ai, hasKey } = useAiSettings();
  const { user, patch: patchUser } = useUserSettings();
  const { prefs, patch } = usePreferences();
  const { history, log, setStatus } = useHistory();
  const { save: saveWorkout } = useSavedWorkouts();
  const { free } = useModels(ai.apiKey);

  // Candidate models, in try-order. Paid mode: just the chosen model. Free mode:
  // the chosen/default model first, then every other free model as fallback, so
  // a rate-limited model auto-rolls to the next one.
  const candidates = useMemo(() => {
    const primary = ai.selectedModelId || FALLBACK_MODEL_ID;
    if (ai.usePaidModels) return [primary];
    return [...new Set([primary, ...free.map((m) => m.id)])];
  }, [ai.selectedModelId, ai.usePaidModels, free]);

  const generator = useWorkoutGenerator(ai.apiKey, candidates, !ai.usePaidModels);

  const [phase, setPhase] = useState<Phase>("intro");
  const [mode, setMode] = useState<"build" | "log">("build");
  const [customMuscleInput, setCustomMuscleInput] = useState("");
  const [selectedCustomMuscles, setSelectedCustomMuscles] = useState<string[]>([]);
  const activeLogId = useRef<string | null>(null);

  const stepIndex = PICK_STEPS.indexOf(phase); // -1 when not a pick step
  const lastWorkout = history[0]?.name;

  const labelFor = (id: string) =>
    (id.split("/").pop() ?? id).replace(":free", " (free)");
  const modelLabel = labelFor(candidates[0] ?? FALLBACK_MODEL_ID);

  /* ---- navigation -------------------------------------------------------- */
  const goPick = (i: number) => setPhase(PICK_STEPS[i]);

  const nextFromPick = () => {
    if (stepIndex < PICK_STEPS.length - 1) {
      goPick(stepIndex + 1);
    } else if (mode === "log") {
      const muscleLabels = prefs.muscles.map((m: MuscleGroup) => labelOf(MUSCLE_GROUPS, m));
      const style = labelOf(WORKOUT_STYLES, prefs.style);
      const name = buildLogName(muscleLabels, selectedCustomMuscles, style);
      log(prefs, name, "completed", selectedCustomMuscles.length > 0 ? selectedCustomMuscles : undefined);
      reset();
    } else {
      setPhase("generate");
    }
  };
  const prevFromPick = () => {
    if (stepIndex > 0) goPick(stepIndex - 1);
    else setPhase("intro");
  };

  const handleEquipmentChange = (equipment: Equipment[]) => {
    if (mode === "log") {
      // "None" is mutually exclusive with everything else
      const wasNone = prefs.equipment.includes("none");
      const selectingNone = equipment.includes("none");
      if (!wasNone && selectingNone) {
        patch({ equipment: ["none"] });
      } else if (wasNone && equipment.length > 1) {
        patch({ equipment: equipment.filter((e) => e !== "none") });
      } else {
        patch({ equipment });
      }
    } else {
      patch({ equipment });
    }
  };

  const handleAddCustomType = () => {
    const name = customMuscleInput.trim();
    if (!name) return;
    if (!user.customMuscleGroups.includes(name)) {
      patchUser({ customMuscleGroups: [...user.customMuscleGroups, name] });
    }
    setSelectedCustomMuscles((prev) => prev.includes(name) ? prev : [...prev, name]);
    setCustomMuscleInput("");
  };

  const handleGenerate = async () => {
    await generator.generate(prefs, undefined, user.additionalInstructions || undefined);
  };

  // When generation succeeds while on the generate screen, advance to result.
  const genStatus = generator.state.status;
  useEffect(() => {
    if (genStatus === "success" && phase === "generate") setPhase("result");
  }, [genStatus, phase]);

  const handleStart = () => {
    if (generator.state.status !== "success") return;
    const entry = log(prefs, generator.state.workout.name, "completed");
    activeLogId.current = entry.id;
    setPhase("session");
  };

  const handleSaveAndStart = (name: string) => {
    if (generator.state.status !== "success") return;
    saveWorkout(generator.state.workout, prefs, name);
    handleStart();
  };

  const handleSkip = () => {
    if (generator.state.status === "success")
      log(prefs, generator.state.workout.name, "skipped");
    reset();
  };

  const handleGiveUp = () => {
    if (activeLogId.current) setStatus(activeLogId.current, "skipped");
    reset();
  };

  const reset = () => {
    generator.reset();
    activeLogId.current = null;
    setMode("build");
    setCustomMuscleInput("");
    setSelectedCustomMuscles([]);
    setPhase("intro");
  };

  /* ---- render ------------------------------------------------------------ */
  if (phase === "timer") {
    return <StandaloneTimer onBack={() => setPhase("intro")} />;
  }

  if (phase === "intro") {
    return (
      <WorkoutIntro
        name={user.name}
        hasKey={hasKey}
        lastWorkoutName={lastWorkout}
        onBegin={() => { setMode("build"); setPhase("experience"); }}
        onLogManually={() => { setMode("log"); setPhase("experience"); }}
        onTimer={() => setPhase("timer")}
        onGoToSettings={onGoToSettings}
        onGoToSaved={onGoToSaved}
      />
    );
  }

  if (phase === "session" && generator.state.status === "success") {
    return (
      <TimerSession
        workout={generator.state.workout}
        durationMin={prefs.duration}
        onFinish={reset}
        onGiveUp={handleGiveUp}
      />
    );
  }

  if (phase === "result" && generator.state.status === "success") {
    return (
      <WorkoutResult
        workout={generator.state.workout}
        config={prefs}
        onStart={handleStart}
        onSkip={handleSkip}
        onSaveAndStart={handleSaveAndStart}
        onRegenerate={(swap) => {
          generator.reset();
          setPhase("generate");
          const hasTargets =
            swap &&
            ((swap.warmup?.length ?? 0) +
              (swap.exercises?.length ?? 0) +
              (swap.cooldown?.length ?? 0)) >
              0;
          if (hasTargets) void generator.generate(prefs, swap, user.additionalInstructions || undefined);
        }}
      />
    );
  }

  if (phase === "generate") {
    const status =
      generator.state.status === "loading"
        ? "loading"
        : generator.state.status === "error"
          ? "error"
          : "idle";
    const attempt =
      generator.state.status === "loading" ? generator.state.attempt : null;
    return (
      <div className="wizard">
        <GeneratingView
          config={prefs}
          status={status}
          errorMessage={
            generator.state.status === "error"
              ? generator.state.message
              : undefined
          }
          modelLabel={modelLabel}
          attempt={
            attempt
              ? {
                  label: labelFor(attempt.modelId),
                  index: attempt.index,
                  total: attempt.total,
                }
              : null
          }
          onGenerate={handleGenerate}
          onBack={status !== "loading" ? () => setPhase("counts") : undefined}
        />
      </div>
    );
  }

  /* pick steps */
  const stepNo = PICK_STEPS.indexOf(phase) + 1;
  const isLastStep = stepIndex === PICK_STEPS.length - 1;
  const equipmentOptions = mode === "log" ? [...EQUIPMENT, EQUIPMENT_NONE] : EQUIPMENT;

  return (
    <div className="wizard">
      {phase === "experience" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Level"
            title="How experienced are you?"
            subtitle="We'll match the difficulty to you."
          />
          <SelectableGrid
            mode="single"
            options={EXPERIENCE_LEVELS}
            value={prefs.experience}
            onChange={(experience) => patch({ experience })}
          />
          <StepNav showPrev onPrev={prevFromPick} onNext={nextFromPick} />
        </>
      )}

      {phase === "muscles" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Target"
            title="What are we training?"
            subtitle={mode === "log" ? "Pick muscle groups or add your own." : "Pick one or more muscle groups."}
          />
          {mode === "log" && (
            <div className="wizard__add-type">
              <TextField
                value={customMuscleInput}
                onChange={(e) => setCustomMuscleInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCustomType(); } }}
                placeholder="Add a type… e.g. Swimming, Tennis"
                iconLeft="Sparkles"
              />
              <Button
                variant="secondary"
                size="sm"
                iconLeft="Plus"
                onClick={handleAddCustomType}
                disabled={!customMuscleInput.trim() || user.customMuscleGroups.includes(customMuscleInput.trim())}
              >
                Add
              </Button>
            </div>
          )}
          {mode === "log" ? (
            <SelectableGrid<string>
              mode="multi"
              options={[
                ...user.customMuscleGroups.map((name): Option<string> => ({
                  value: name,
                  label: name,
                  icon: "Sparkles",
                })),
                ...(MUSCLE_GROUPS as unknown as Option<string>[]),
              ]}
              value={[...selectedCustomMuscles, ...prefs.muscles]}
              onChange={(selected) => {
                patch({ muscles: selected.filter((v) => MUSCLE_VALUES.includes(v)) as MuscleGroup[] });
                setSelectedCustomMuscles(selected.filter((v) => !MUSCLE_VALUES.includes(v)));
              }}
            />
          ) : (
            <SelectableGrid
              mode="multi"
              options={MUSCLE_GROUPS}
              value={prefs.muscles}
              onChange={(muscles) => patch({ muscles })}
            />
          )}
          <StepNav
            showPrev
            onPrev={prevFromPick}
            onNext={nextFromPick}
            nextDisabled={prefs.muscles.length === 0 && selectedCustomMuscles.length === 0}
            hint={prefs.muscles.length === 0 && selectedCustomMuscles.length === 0 ? "Pick at least one muscle group" : undefined}
          />
        </>
      )}

      {phase === "equipment" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Gear"
            title="What do you have?"
            subtitle={mode === "log" ? "Select what you used, or pick None." : "We'll only use what you select."}
          />
          <SelectableGrid
            mode="multi"
            options={equipmentOptions}
            value={prefs.equipment}
            onChange={handleEquipmentChange}
          />
          <StepNav
            onPrev={prevFromPick}
            onNext={nextFromPick}
            nextDisabled={prefs.equipment.length === 0}
            hint={prefs.equipment.length === 0 ? "Pick at least one (try Bodyweight)" : undefined}
          />
        </>
      )}

      {phase === "style" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Format"
            title="Pick a style"
            subtitle="How should the session feel?"
          />
          <SelectableGrid
            mode="single"
            options={WORKOUT_STYLES}
            value={prefs.style}
            onChange={(style) => patch({ style })}
            columns={2}
          />
          <StepNav onPrev={prevFromPick} onNext={nextFromPick} />
        </>
      )}

      {phase === "duration" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Time"
            title="How long do you have?"
            subtitle="Slide to set your time budget."
          />
          <div className="wizard__duration">
            <div className="wizard__duration-value num">
              {prefs.duration}
              <span>min</span>
            </div>
            <Slider<Duration>
              stops={DURATIONS}
              value={prefs.duration}
              onChange={(duration) => patch({ duration })}
              ariaLabel="Workout duration in minutes"
              formatTick={(v) => String(v)}
            />
          </div>
          <StepNav onPrev={prevFromPick} onNext={nextFromPick} />
        </>
      )}

      {phase === "counts" && (
        <>
          <StepHeader
            step={stepNo}
            total={TOTAL_STEPS}
            eyebrow="Volume"
            title="How much?"
            subtitle="Set the number of items in each section."
          />
          <div className="wizard__counts">
            <div className="wizard__count-row">
              <div className="wizard__count-header">
                <span className="wizard__count-name">Warmup</span>
                <span className="wizard__count-val num">{prefs.warmupCount}</span>
              </div>
              <Slider<WarmupCount>
                stops={WARMUP_COUNTS}
                value={prefs.warmupCount}
                onChange={(warmupCount) => patch({ warmupCount })}
                ariaLabel="Number of warmup items"
                formatTick={(v) => String(v)}
              />
            </div>
            <div className="wizard__count-row">
              <div className="wizard__count-header">
                <span className="wizard__count-name">Exercises</span>
                <span className="wizard__count-val num">{prefs.exerciseCount}</span>
              </div>
              <Slider<ExerciseCount>
                stops={EXERCISE_COUNTS}
                value={prefs.exerciseCount}
                onChange={(exerciseCount) => patch({ exerciseCount })}
                ariaLabel="Number of exercises"
                formatTick={(v) => String(v)}
              />
            </div>
            <div className="wizard__count-row">
              <div className="wizard__count-header">
                <span className="wizard__count-name">Cooldown</span>
                <span className="wizard__count-val num">{prefs.cooldownCount}</span>
              </div>
              <Slider<CooldownCount>
                stops={COOLDOWN_COUNTS}
                value={prefs.cooldownCount}
                onChange={(cooldownCount) => patch({ cooldownCount })}
                ariaLabel="Number of cooldown items"
                formatTick={(v) => String(v)}
              />
            </div>
          </div>
          <StepNav
            onPrev={prevFromPick}
            onNext={nextFromPick}
            nextLabel={isLastStep && mode === "log" ? "Log workout" : "Generate"}
          />
        </>
      )}
    </div>
  );
}

import { useCallback, useEffect, useState } from "react";
import type { GeneratedWorkout } from "@/types";
import { Button, Icon, ProgressRing } from "@/components/atoms";
import { formatClock } from "@/lib/date";
import { playCountdownTick, playRestBeep, playWorkBeep } from "@/lib/sounds";
import { useTabataInterval } from "@/hooks/useTabataInterval";
import { useTimer } from "@/hooks/useTimer";
import { useWakeLock } from "@/hooks/useWakeLock";
import "./TimerSession.css";

export interface TimerSessionProps {
  workout: GeneratedWorkout;
  durationMin: number;
  onFinish: () => void;
  onGiveUp: () => void;
  /** When false the timer starts paused (default: true). */
  autoStart?: boolean;
}

/** Live workout timer. Countdown ring + controls + a checkable exercise list. */
export function TimerSession({
  workout,
  durationMin,
  onFinish,
  onGiveUp,
  autoStart = true,
}: TimerSessionProps) {
  const [celebrate, setCelebrate] = useState(false);
  const timer = useTimer(durationMin * 60, () => setCelebrate(true));
  useWakeLock(timer.running);
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const isTabata = !!workout.tabata;
  const [workSec, setWorkSec] = useState(workout.tabata?.workSec ?? 20);
  const [restSec, setRestSec] = useState(workout.tabata?.restSec ?? 10);

  const onPhaseChange = useCallback((incoming: "work" | "rest") => {
    if (incoming === "work") playWorkBeep();
    else playRestBeep();
  }, []);

  const tabata = useTabataInterval(
    workSec,
    restSec,
    isTabata && timer.running,
    onPhaseChange,
    playCountdownTick,
  );

  // Auto-start the countdown on mount (skipped when launched from saved workouts).
  useEffect(() => {
    if (autoStart) timer.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleExercise = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const doneCount = checked.size;
  const totalExercises = workout.exercises.length;

  if (celebrate) {
    return (
      <div className="session session--done">
        <div className="session__burst" aria-hidden>
          <Icon name="Trophy" size={40} />
        </div>
        <h1 className="session__done-title">Workout complete</h1>
        <p className="session__done-sub">
          Nice work. {doneCount > 0 ? `${doneCount}/${totalExercises} logged.` : ""}{" "}
          It&apos;s saved to your history.
        </p>
        <Button
          variant="accent"
          size="lg"
          iconLeft="CheckCheck"
          fullWidth
          onClick={onFinish}
        >
          Done
        </Button>
      </div>
    );
  }

  const ringColor = isTabata
    ? tabata.phase === "work"
      ? "var(--accent)"
      : "var(--warn)"
    : "var(--accent)";

  const ringClass = isTabata
    ? `session__ring session__ring--${tabata.phase}`
    : "session__ring";

  return (
    <div className="session">
      <div className="session__name num">{workout.name}</div>

      {isTabata && (
        <>
          <div className="session__tabata-controls">
            <div className="session__tabata-adjust">
              <span className="session__adjust-label">Work</span>
              <div className="session__adjust-buttons">
                <button
                  type="button"
                  className="session__adjust-btn"
                  onClick={() => setWorkSec(Math.max(5, workSec - 1))}
                  aria-label="Decrease work time"
                >
                  −
                </button>
                <span className="session__adjust-value num">{workSec}</span>
                <button
                  type="button"
                  className="session__adjust-btn"
                  onClick={() => setWorkSec(Math.min(60, workSec + 1))}
                  aria-label="Increase work time"
                >
                  +
                </button>
              </div>
            </div>

            <div className="session__tabata-adjust">
              <span className="session__adjust-label">Rest</span>
              <div className="session__adjust-buttons">
                <button
                  type="button"
                  className="session__adjust-btn"
                  onClick={() => setRestSec(Math.max(1, restSec - 1))}
                  aria-label="Decrease rest time"
                >
                  −
                </button>
                <span className="session__adjust-value num">{restSec}</span>
                <button
                  type="button"
                  className="session__adjust-btn"
                  onClick={() => setRestSec(Math.min(60, restSec + 1))}
                  aria-label="Increase rest time"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={`session__tabata session__tabata--${tabata.phase}`}>
            <span className="session__tabata-label">
              {tabata.phase === "work" ? "Work" : "Rest"}
            </span>
            <span className="session__tabata-countdown num">
              {Math.ceil(tabata.phaseRemaining)}s
            </span>
            <span className="session__tabata-meta">
              {workSec}s / {restSec}s · Round {tabata.round + 1}
            </span>
          </div>


        </>
      )}
      <div className={ringClass}>
        <ProgressRing
          progress={timer.total > 0 ? timer.remaining / timer.total : 1}
          size={252}
          stroke={14}
          color={ringColor}
        >
          <div className="session__clock">
            <span className="session__time num">
              {formatClock(timer.remaining)}
            </span>
            <span className={`session__state${isTabata ? ` session__state--${tabata.phase}` : ""}`}>
              {timer.running
                ? isTabata
                  ? tabata.phase === "work"
                    ? "Work"
                    : "Rest"
                  : "Training"
                : timer.done
                  ? "Time!"
                  : "Paused"}
            </span>
          </div>
        </ProgressRing>
      </div>

      <div className="session__controls">
        <Button
          variant="secondary"
          size="md"
          iconLeft="RotateCcw"
          onClick={() => timer.reset()}
          aria-label="Reset timer"
        />
        <Button
          variant="accent"
          size="lg"
          iconLeft={timer.running ? "Pause" : "Play"}
          onClick={timer.toggle}
        >
          {timer.running ? "Pause" : "Resume"}
        </Button>
        <Button
          variant="secondary"
          size="md"
          onClick={() => timer.addSeconds(60)}
          aria-label="Add one minute"
        >
          +1:00
        </Button>
      </div>

      <div className="session__list">
        <div className="session__list-head">
          <span>Exercises</span>
          <span className="num">
            {doneCount}/{totalExercises}
          </span>
        </div>
        <ul>
          {workout.exercises.map((ex, i) => (
            <li key={`${ex.name}-${i}`}>
              <button
                type="button"
                className={
                  "session__ex" + (checked.has(i) ? " session__ex--done" : "")
                }
                onClick={() => toggleExercise(i)}
                aria-pressed={checked.has(i)}
              >
                <span className="session__ex-check" aria-hidden>
                  {checked.has(i) && (
                    <Icon name="Check" size={13} strokeWidth={3} />
                  )}
                </span>
                <div className="session__ex-main">
                  <span className="session__ex-name">{ex.name}</span>
                  {ex.howTo && <span className="session__ex-how">{ex.howTo}</span>}
                </div>
                <span className="session__ex-sets num">{ex.setsReps}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>


      {workout.warmup.length > 0 && (
        <div className="session__section">
          <div className="session__section-title">Warmup</div>
          <ul className="session__items">
            {workout.warmup.map((item, i) => (
              <li key={`warmup-${i}`} className="session__item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}


      {workout.cooldown.length > 0 && (
        <div className="session__section">
          <div className="session__section-title">Cooldown</div>
          <ul className="session__items">
            {workout.cooldown.map((item, i) => (
              <li key={`cooldown-${i}`} className="session__item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="session__finish">
        <Button variant="primary" iconLeft="CheckCheck" fullWidth onClick={() => setCelebrate(true)}>
          Finish &amp; log
        </Button>
        <Button variant="ghost" onClick={onGiveUp}>
          Give up
        </Button>
      </div>
    </div>
  );
}

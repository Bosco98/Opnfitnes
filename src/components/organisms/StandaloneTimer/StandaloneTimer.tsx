import { useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "@/lib/constants";
import { Button, Icon, ProgressRing } from "@/components/atoms";
import { SelectableGrid } from "@/components/molecules";
import { useTabataInterval } from "@/hooks/useTabataInterval";
import { useTimer } from "@/hooks/useTimer";
import { useWakeLock } from "@/hooks/useWakeLock";
import { playCountdownTick, playRestBeep, playWorkBeep } from "@/lib/sounds";
import { formatClock } from "@/lib/date";
import "./StandaloneTimer.css";

type TimerType = "countdown" | "tabata" | "stopwatch";
type StandalonePhase = "setup" | "running";

const TIMER_OPTIONS: Option<TimerType>[] = [
  { value: "countdown", label: "Countdown", icon: "Hourglass", hint: "Count down from a set time" },
  { value: "tabata",    label: "Tabata",    icon: "Zap",       hint: "Work / rest intervals" },
  { value: "stopwatch", label: "Stopwatch", icon: "Timer",     hint: "Count up with laps" },
];

function formatStopwatch(totalSec: number): string {
  const s = Math.max(0, totalSec);
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  const tenth = Math.floor((s % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${tenth}`;
}

function AdjustRow({
  label,
  value,
  min,
  max,
  unit,
  onDec,
  onInc,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="st__adjust-row">
      <span className="st__adjust-label">{label}</span>
      <div className="st__adjust-controls">
        <button
          type="button"
          className="st__adj-btn"
          onClick={onDec}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="st__adj-val num">
          {value}
          {unit}
        </span>
        <button
          type="button"
          className="st__adj-btn"
          onClick={onInc}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

export interface StandaloneTimerProps {
  onBack: () => void;
}

export function StandaloneTimer({ onBack }: StandaloneTimerProps) {
  const [phase, setPhase] = useState<StandalonePhase>("setup");
  const [timerType, setTimerType] = useState<TimerType>("countdown");
  const [durationMin, setDurationMin] = useState(20);
  const [durationSec, setDurationSec] = useState(0);
  const [workSec, setWorkSec] = useState(20);
  const [restSec, setRestSec] = useState(10);

  const totalDurationSec = durationMin * 60 + durationSec;

  /* ---- Countdown / Tabata timer ------------------------------------------ */
  const countdown = useTimer(totalDurationSec);
  const isRunning = phase === "running";

  const onPhaseChange = useCallback((incoming: "work" | "rest") => {
    if (incoming === "work") playWorkBeep();
    else playRestBeep();
  }, []);

  const tabata = useTabataInterval(
    workSec,
    restSec,
    isRunning && timerType === "tabata" && countdown.running,
    onPhaseChange,
    playCountdownTick,
  );

  /* ---- Stopwatch --------------------------------------------------------- */
  const [elapsed, setElapsed] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const swBaseRef = useRef(0);
  const swStartRef = useRef<number | null>(null);
  const [laps, setLaps] = useState<number[]>([]);

  /* Single wake lock: active whenever any timer is actively ticking */
  useWakeLock(
    isRunning &&
      ((timerType !== "stopwatch" && countdown.running) ||
        (timerType === "stopwatch" && swRunning)),
  );

  useEffect(() => {
    if (!swRunning) return;
    swStartRef.current = Date.now();
    let raf = 0;
    const tick = () => {
      setElapsed(
        swBaseRef.current +
          (Date.now() - (swStartRef.current ?? Date.now())) / 1000,
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (swStartRef.current)
        swBaseRef.current += (Date.now() - swStartRef.current) / 1000;
      swStartRef.current = null;
      cancelAnimationFrame(raf);
    };
  }, [swRunning]);

  /* ---- Actions ----------------------------------------------------------- */
  const handleStart = () => {
    if (timerType === "stopwatch") {
      swBaseRef.current = 0;
      setElapsed(0);
      setLaps([]);
      setSwRunning(true);
    } else {
      countdown.startFrom(totalDurationSec);
    }
    setPhase("running");
  };

  const handleBackToSetup = () => {
    countdown.reset();
    setSwRunning(false);
    swBaseRef.current = 0;
    setElapsed(0);
    setLaps([]);
    setPhase("setup");
  };

  const resetStopwatch = () => {
    setSwRunning(false);
    swBaseRef.current = 0;
    setElapsed(0);
    setLaps([]);
  };

  /* ---- Running: Stopwatch ------------------------------------------------ */
  if (phase === "running" && timerType === "stopwatch") {
    const progress = elapsed > 0 ? (elapsed % 60) / 60 : 0;
    return (
      <div className="st">
        <button
          type="button"
          className="st__back"
          onClick={handleBackToSetup}
          aria-label="Back to setup"
        >
          <Icon name="ChevronLeft" size={16} /> Setup
        </button>

        <div className="st__type-label">Stopwatch</div>

        <div className="st__ring">
          <ProgressRing progress={progress} size={252} stroke={14} color="var(--accent)">
            <div className="st__clock">
              <span className="st__time num">{formatStopwatch(elapsed)}</span>
              <span className="st__state">
                {swRunning ? "Running" : elapsed > 0 ? "Paused" : "Ready"}
              </span>
            </div>
          </ProgressRing>
        </div>

        <div className="st__controls">
          <Button
            variant="secondary"
            size="md"
            iconLeft="RotateCcw"
            onClick={resetStopwatch}
            aria-label="Reset"
          />
          <Button
            variant="accent"
            size="lg"
            iconLeft={swRunning ? "Pause" : "Play"}
            onClick={() => setSwRunning((r) => !r)}
          >
            {swRunning ? "Pause" : elapsed > 0 ? "Resume" : "Start"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            iconLeft="Flag"
            onClick={() => setLaps((prev) => [...prev, elapsed])}
            disabled={!swRunning}
          >
            Lap
          </Button>
        </div>

        {laps.length > 0 && (
          <div className="st__laps">
            <div className="st__laps-head">
              <span>Lap</span>
              <span>Split</span>
              <span>Total</span>
            </div>
            {[...laps].reverse().map((lapTotal, ri) => {
              const i = laps.length - 1 - ri;
              const prev = i > 0 ? laps[i - 1] : 0;
              return (
                <div key={i} className="st__lap-row">
                  <span className="num">#{i + 1}</span>
                  <span className="num">{formatStopwatch(lapTotal - prev)}</span>
                  <span className="num">{formatStopwatch(lapTotal)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  /* ---- Running: Tabata --------------------------------------------------- */
  if (phase === "running" && timerType === "tabata") {
    const ringColor = tabata.phase === "work" ? "var(--accent)" : "var(--warn)";
    return (
      <div className="st">
        <button
          type="button"
          className="st__back"
          onClick={handleBackToSetup}
          aria-label="Back to setup"
        >
          <Icon name="ChevronLeft" size={16} /> Setup
        </button>

        <div className={`st__tabata-badge st__tabata-badge--${tabata.phase}`}>
          <span className="st__tabata-phase">
            {tabata.phase === "work" ? "Work" : "Rest"}
          </span>
          <span className="st__tabata-cd num">
            {Math.ceil(tabata.phaseRemaining)}s
          </span>
          <span className="st__tabata-meta">
            Round {tabata.round + 1} · {workSec}s/{restSec}s
          </span>
        </div>

        <div className={`st__ring st__ring--${tabata.phase}`}>
          <ProgressRing
            progress={countdown.total > 0 ? countdown.remaining / countdown.total : 1}
            size={252}
            stroke={14}
            color={ringColor}
          >
            <div className="st__clock">
              <span className="st__time num">
                {formatClock(countdown.remaining)}
              </span>
              <span className={`st__state st__state--${tabata.phase}`}>
                {countdown.done
                  ? "Done!"
                  : countdown.running
                    ? tabata.phase === "work"
                      ? "Work"
                      : "Rest"
                    : "Paused"}
              </span>
            </div>
          </ProgressRing>
        </div>

        <div className="st__controls">
          <Button
            variant="secondary"
            size="md"
            iconLeft="RotateCcw"
            onClick={() => countdown.startFrom(totalDurationSec)}
            aria-label="Restart"
          />
          <Button
            variant="accent"
            size="lg"
            iconLeft={countdown.running ? "Pause" : "Play"}
            onClick={countdown.toggle}
          >
            {countdown.running ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => countdown.addSeconds(60)}
            aria-label="Add 1 minute"
          >
            +1:00
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Running: Countdown ------------------------------------------------ */
  if (phase === "running") {
    return (
      <div className="st">
        <button
          type="button"
          className="st__back"
          onClick={handleBackToSetup}
          aria-label="Back to setup"
        >
          <Icon name="ChevronLeft" size={16} /> Setup
        </button>

        <div className="st__type-label">
          Countdown · {formatClock(totalDurationSec)}
        </div>

        <div className="st__ring">
          <ProgressRing
            progress={countdown.total > 0 ? countdown.remaining / countdown.total : 1}
            size={252}
            stroke={14}
            color="var(--accent)"
          >
            <div className="st__clock">
              <span className="st__time num">
                {formatClock(countdown.remaining)}
              </span>
              <span className="st__state">
                {countdown.done
                  ? "Done!"
                  : countdown.running
                    ? "Training"
                    : "Paused"}
              </span>
            </div>
          </ProgressRing>
        </div>

        <div className="st__controls">
          <Button
            variant="secondary"
            size="md"
            iconLeft="RotateCcw"
            onClick={() => countdown.startFrom(totalDurationSec)}
            aria-label="Restart"
          />
          <Button
            variant="accent"
            size="lg"
            iconLeft={countdown.running ? "Pause" : "Play"}
            onClick={countdown.toggle}
          >
            {countdown.running ? "Pause" : "Resume"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => countdown.addSeconds(60)}
            aria-label="Add 1 minute"
          >
            +1:00
          </Button>
        </div>
      </div>
    );
  }

  /* ---- Setup screen ------------------------------------------------------ */
  return (
    <div className="st st--setup">
      <div className="st__setup-header">
        <button
          type="button"
          className="st__back"
          onClick={onBack}
          aria-label="Back to home"
        >
          <Icon name="ChevronLeft" size={16} /> Back
        </button>
        <h2 className="st__setup-title">Timers</h2>
      </div>

      <SelectableGrid<TimerType>
        mode="single"
        options={TIMER_OPTIONS}
        value={timerType}
        onChange={setTimerType}
        columns={2}
      />

      {(timerType === "countdown" || timerType === "tabata") && (
        <div className="st__config">
          <p className="st__config-label">Duration</p>
          <div className="st__duration-display num">
            {String(durationMin).padStart(2, "0")}
            <span className="st__duration-sep">:</span>
            {String(durationSec).padStart(2, "0")}
          </div>
          <AdjustRow
            label="Minutes"
            value={durationMin}
            min={0}
            max={99}
            onDec={() => setDurationMin((m) => Math.max(0, m - 1))}
            onInc={() => setDurationMin((m) => Math.min(99, m + 1))}
          />
          <AdjustRow
            label="Seconds"
            value={durationSec}
            min={0}
            max={59}
            onDec={() => setDurationSec((s) => Math.max(0, s - 5))}
            onInc={() => setDurationSec((s) => Math.min(55, s + 5))}
          />
        </div>
      )}

      {timerType === "tabata" && (
        <div className="st__config">
          <p className="st__config-label">Intervals</p>
          <AdjustRow
            label="Work"
            value={workSec}
            min={5}
            max={60}
            unit="s"
            onDec={() => setWorkSec((s) => Math.max(5, s - 5))}
            onInc={() => setWorkSec((s) => Math.min(60, s + 5))}
          />
          <AdjustRow
            label="Rest"
            value={restSec}
            min={5}
            max={60}
            unit="s"
            onDec={() => setRestSec((s) => Math.max(5, s - 5))}
            onInc={() => setRestSec((s) => Math.min(60, s + 5))}
          />
        </div>
      )}

      <div className="st__start">
        <Button
          variant="primary"
          size="lg"
          iconRight="Play"
          fullWidth
          onClick={handleStart}
          disabled={timerType !== "stopwatch" && totalDurationSec === 0}
        >
          Start {TIMER_OPTIONS.find((t) => t.value === timerType)?.label}
        </Button>
      </div>
    </div>
  );
}

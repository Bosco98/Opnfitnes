import { useEffect, useRef, useState } from "react";

export type TabataPhase = "work" | "rest";

export interface TabataState {
  phase: TabataPhase;
  /** Seconds remaining in the current phase. */
  phaseRemaining: number;
  /** Number of completed work+rest pairs. */
  round: number;
}

/**
 * Tracks the current work/rest phase of a Tabata interval independently of the
 * main countdown timer. Pauses and resumes in sync with `running`.
 *
 * `onPhaseChange(incoming)` fires when the phase flips.
 * `onCountdown` fires at 3, 2, and 1 second remaining in the current phase.
 */
export function useTabataInterval(
  workSec: number,
  restSec: number,
  running: boolean,
  onPhaseChange?: (incoming: TabataPhase) => void,
  onCountdown?: () => void,
): TabataState {
  const phaseRef = useRef<TabataPhase>("work");
  const deadlineRef = useRef<number | null>(null);
  // Seconds remaining when the timer last paused (or at start).
  const snapshotRef = useRef(workSec);
  const roundRef = useRef(0);
  // Tracks which countdown beats have already fired in the current phase.
  const firedBeatsRef = useRef<Set<number>>(new Set());

  const onPhaseChangeRef = useRef(onPhaseChange);
  const onCountdownRef = useRef(onCountdown);
  onPhaseChangeRef.current = onPhaseChange;
  onCountdownRef.current = onCountdown;

  const [state, setState] = useState<TabataState>({
    phase: "work",
    phaseRemaining: workSec,
    round: 0,
  });

  useEffect(() => {
    if (!running) {
      // Pause: capture remaining time from the live deadline.
      if (deadlineRef.current != null) {
        snapshotRef.current = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
        deadlineRef.current = null;
      }
      return;
    }

    // Resume: set a new deadline from the captured snapshot.
    deadlineRef.current = Date.now() + snapshotRef.current * 1000;
    firedBeatsRef.current = new Set();

    let raf = 0;
    const tick = () => {
      if (deadlineRef.current == null) return;
      const now = Date.now();
      const left = Math.max(0, (deadlineRef.current - now) / 1000);

      // Fire countdown ticks at 3, 2, 1 seconds remaining.
      for (const beat of [3, 2, 1]) {
        if (left <= beat && !firedBeatsRef.current.has(beat)) {
          firedBeatsRef.current.add(beat);
          onCountdownRef.current?.();
        }
      }

      if (left <= 0) {
        const next: TabataPhase = phaseRef.current === "work" ? "rest" : "work";
        const nextDur = next === "work" ? workSec : restSec;
        phaseRef.current = next;
        snapshotRef.current = nextDur;
        deadlineRef.current = now + nextDur * 1000;
        firedBeatsRef.current = new Set();
        if (next === "rest") roundRef.current++;
        setState({ phase: next, phaseRemaining: nextDur, round: roundRef.current });
        onPhaseChangeRef.current?.(next);
      } else {
        setState((s) => ({ ...s, phase: phaseRef.current, phaseRemaining: left }));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Capture snapshot on cleanup so the next resume picks up correctly.
      if (deadlineRef.current != null) {
        snapshotRef.current = Math.max(0, (deadlineRef.current - Date.now()) / 1000);
        deadlineRef.current = null;
      }
    };
  }, [running, workSec, restSec]);

  return state;
}

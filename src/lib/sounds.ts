/* Web Audio API sound primitives for the Tabata timer.
   AudioContext is created lazily on first use so it satisfies the browser's
   "user gesture required" autoplay policy (the timer starts via a button tap). */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof AudioContext === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  // Safari/iOS may suspend the context between interactions.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

import { userStore } from "./stores";

function tone(
  freq: number,
  durationSec: number,
  gain = 0.9,
  startOffset = 0,
): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const vol = userStore.read().clockVolume;
  if (vol <= 0) return;
  const finalGain = gain * vol;
  try {
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.connect(env);
    env.connect(audioCtx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t0 = audioCtx.currentTime + startOffset;
    env.gain.setValueAtTime(finalGain, t0);
    env.gain.exponentialRampToValueAtTime(0.001, t0 + durationSec);
    osc.start(t0);
    osc.stop(t0 + durationSec + 0.01);
  } catch {
    // AudioContext in a bad state — ignore.
  }
}

/** Two sharp high beeps — signals the start of a WORK interval. */
export function playWorkBeep(): void {
  tone(880, 0.1, 1.0, 0);
  tone(880, 0.1, 1.0, 0.16);
}

/** One lower sustained beep — signals the start of a REST interval. */
export function playRestBeep(): void {
  tone(440, 0.3, 0.75, 0);
}

/** Subtle tick used for the 3-2-1 countdown before a phase change. */
export function playCountdownTick(): void {
  tone(660, 0.06, 0.50, 0);
}

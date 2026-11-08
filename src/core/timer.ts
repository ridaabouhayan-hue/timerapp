/**
 * Timer-kern. Pure functies, geen DOM, geen Tauri, geen klok van zichzelf.
 * De tijd ("now", in ms) wordt altijd van buiten meegegeven, zodat de kern
 * goed te testen is en nooit afdrijft: tijdens het lopen onthouden we de
 * vaste eindtijd, niet een teller die elke seconde omlaag gaat.
 */

export type TimerStatus = "idle" | "running" | "paused";

export interface TimerState {
  readonly status: TimerStatus;
  /** Ingestelde duur in ms (voor de voortgang en voor reset). */
  readonly durationMs: number;
  /** Resterende tijd in ms als de timer niet loopt. */
  readonly remainingMs: number;
  /** Vast eindmoment (epoch ms) als de timer loopt, anders null. */
  readonly endAt: number | null;
}

export type Phase = "normal" | "warning" | "overtime";

export const MINUTE = 60_000;
export const MIN_DURATION = 1_000;
export const MAX_DURATION = 24 * 60 * MINUTE - 1_000;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createTimer(durationMs: number): TimerState {
  const d = clamp(Math.round(durationMs), MIN_DURATION, MAX_DURATION);
  return { status: "idle", durationMs: d, remainingMs: d, endAt: null };
}

/** Resterende tijd. Negatief betekent overtijd. */
export function remaining(s: TimerState, now: number): number {
  return s.status === "running" && s.endAt !== null ? s.endAt - now : s.remainingMs;
}

export function start(s: TimerState, now: number): TimerState {
  if (s.status === "running") return s;
  // Na afloop opnieuw starten begint weer bij de ingestelde duur.
  const left = s.remainingMs > 0 ? s.remainingMs : s.durationMs;
  return { ...s, status: "running", remainingMs: left, endAt: now + left };
}

export function pause(s: TimerState, now: number): TimerState {
  if (s.status !== "running") return s;
  return { ...s, status: "paused", remainingMs: remaining(s, now), endAt: null };
}

export function toggle(s: TimerState, now: number): TimerState {
  return s.status === "running" ? pause(s, now) : start(s, now);
}

export function reset(s: TimerState): TimerState {
  return createTimer(s.durationMs);
}

/** Nieuwe duur kiezen (preset). Stopt de timer. */
export function setDuration(_s: TimerState, durationMs: number): TimerState {
  return createTimer(durationMs);
}

/**
 * Tijd erbij of eraf (bijv. +1 / -1 minuut).
 * - Stilstaand: de duur zelf verandert (zo stel je ook een tijd in).
 * - Lopend of gepauzeerd: alleen de resterende tijd verandert;
 *   de duur groeit mee als de rest groter wordt dan de duur.
 */
export function adjust(s: TimerState, deltaMs: number, now: number): TimerState {
  if (s.status === "idle") return createTimer(s.durationMs + deltaMs);
  const left = Math.max(0, remaining(s, now)) + deltaMs;
  const newLeft = clamp(left, 0, MAX_DURATION);
  const durationMs = Math.max(s.durationMs, newLeft);
  if (s.status === "running") return { ...s, durationMs, remainingMs: newLeft, endAt: now + newLeft };
  return { ...s, durationMs, remainingMs: newLeft };
}

/** Voortgang van 0 (begin) tot 1 (op nul). */
export function progress(s: TimerState, now: number): number {
  return clamp(1 - remaining(s, now) / s.durationMs, 0, 1);
}

export function phase(s: TimerState, now: number, warnMs = MINUTE): Phase {
  const left = remaining(s, now);
  if (left <= 0 && s.status !== "idle") return "overtime";
  if (s.status !== "idle" && left <= warnMs) return "warning";
  return "normal";
}

export function isFinished(s: TimerState, now: number): boolean {
  return s.status === "running" && remaining(s, now) <= 0;
}

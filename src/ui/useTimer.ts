import { useCallback, useEffect, useRef, useState } from "react";
import * as T from "../core/timer";

/** Verbindt de pure timer-kern met React en met de echte klok. */
export function useTimer(initialMs: number, onFinish: () => void) {
  const [state, setState] = useState(() => T.createTimer(initialMs));
  const [now, setNow] = useState(() => Date.now());
  const finishedFor = useRef<number | null>(null);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    if (state.status !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 100);
    return () => window.clearInterval(id);
  }, [state.status]);

  // Eindsignaal precies één keer per afloop.
  useEffect(() => {
    if (T.isFinished(state, now) && finishedFor.current !== state.endAt) {
      finishedFor.current = state.endAt;
      onFinishRef.current();
    }
  }, [state, now]);

  const act = useCallback((fn: (s: T.TimerState, t: number) => T.TimerState) => {
    const t = Date.now();
    setNow(t);
    setState((s) => fn(s, t));
  }, []);

  return {
    state,
    now,
    remaining: T.remaining(state, now),
    progress: T.progress(state, now),
    phase: T.phase(state, now),
    toggle: () => act(T.toggle),
    reset: () => act((s) => T.reset(s)),
    adjust: (ms: number) => act((s, t) => T.adjust(s, ms, t)),
    setDuration: (ms: number) => act((s) => T.setDuration(s, ms)),
  };
}

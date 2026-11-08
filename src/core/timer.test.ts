import { describe, expect, it } from "vitest";
import { adjust, createTimer, MINUTE, pause, phase, progress, remaining, reset, start, toggle, isFinished } from "./timer";
import { formatRemaining, parseDuration } from "./format";

const T0 = 1_000_000;

describe("timer-kern", () => {
  it("telt af op basis van een vaste eindtijd (geen drift)", () => {
    const s = start(createTimer(5 * MINUTE), T0);
    expect(remaining(s, T0 + 60 * MINUTE / 60)).toBe(4 * MINUTE);
    // Na precies 5 minuten is het 0, ook al wordt er maar zelden "getikt".
    expect(remaining(s, T0 + 5 * MINUTE)).toBe(0);
  });

  it("pauzeert en gaat verder met de resterende tijd", () => {
    let s = start(createTimer(10 * MINUTE), T0);
    s = pause(s, T0 + 3 * MINUTE);
    expect(s.status).toBe("paused");
    expect(remaining(s, T0 + 999 * MINUTE)).toBe(7 * MINUTE);
    s = start(s, T0 + 20 * MINUTE);
    expect(remaining(s, T0 + 21 * MINUTE)).toBe(6 * MINUTE);
  });

  it("toggle wisselt tussen lopen en pauze", () => {
    let s = createTimer(MINUTE);
    s = toggle(s, T0);
    expect(s.status).toBe("running");
    s = toggle(s, T0 + 1000);
    expect(s.status).toBe("paused");
  });

  it("gaat door in overtijd en meldt dat de tijd om is", () => {
    const s = start(createTimer(MINUTE), T0);
    expect(isFinished(s, T0 + MINUTE)).toBe(true);
    expect(remaining(s, T0 + MINUTE + 12_000)).toBe(-12_000);
    expect(phase(s, T0 + MINUTE + 1)).toBe("overtime");
  });

  it("geeft een waarschuwing in de laatste minuut", () => {
    const s = start(createTimer(5 * MINUTE), T0);
    expect(phase(s, T0)).toBe("normal");
    expect(phase(s, T0 + 4 * MINUTE + 1)).toBe("warning");
    expect(phase(createTimer(30_000), T0)).toBe("normal");
  });

  it("+1 en -1 minuut in stilstand passen de duur aan", () => {
    let s = createTimer(5 * MINUTE);
    s = adjust(s, MINUTE, T0);
    expect(s.durationMs).toBe(6 * MINUTE);
    s = adjust(s, -10 * MINUTE, T0);
    expect(s.durationMs).toBe(1000);
  });

  it("+1 minuut tijdens het lopen verschuift de eindtijd", () => {
    let s = start(createTimer(MINUTE), T0);
    s = adjust(s, MINUTE, T0 + 30_000);
    expect(remaining(s, T0 + 30_000)).toBe(90_000);
    expect(s.durationMs).toBe(MINUTE * 1.5);
  });

  it("+1 minuut in overtijd begint weer bij 1 minuut", () => {
    let s = start(createTimer(MINUTE), T0);
    s = adjust(s, MINUTE, T0 + 2 * MINUTE);
    expect(remaining(s, T0 + 2 * MINUTE)).toBe(MINUTE);
  });

  it("reset zet terug naar de ingestelde duur", () => {
    let s = start(createTimer(3 * MINUTE), T0);
    s = reset(s);
    expect(s.status).toBe("idle");
    expect(remaining(s, T0)).toBe(3 * MINUTE);
  });

  it("voortgang loopt van 0 naar 1", () => {
    const s = start(createTimer(4 * MINUTE), T0);
    expect(progress(s, T0)).toBe(0);
    expect(progress(s, T0 + MINUTE)).toBeCloseTo(0.25);
    expect(progress(s, T0 + 9 * MINUTE)).toBe(1);
  });
});

describe("format", () => {
  it("rondt aftellen naar boven af", () => {
    expect(formatRemaining(5 * MINUTE)).toBe("05:00");
    expect(formatRemaining(4_200)).toBe("00:05");
    expect(formatRemaining(0)).toBe("00:00");
    expect(formatRemaining(-500)).toBe("00:00");
    expect(formatRemaining(-12_400)).toBe("+00:12");
    expect(formatRemaining(65 * MINUTE)).toBe("1:05:00");
  });

  it("leest invoer van de gebruiker", () => {
    expect(parseDuration("5")).toBe(5 * MINUTE);
    expect(parseDuration("5:30")).toBe(330_000);
    expect(parseDuration("1:05:00")).toBe(65 * MINUTE);
    expect(parseDuration("90s")).toBe(90_000);
    expect(parseDuration("1,5")).toBe(90_000);
    expect(parseDuration("5:75")).toBeNull();
    expect(parseDuration("abc")).toBeNull();
  });
});

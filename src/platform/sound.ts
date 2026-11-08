/**
 * Eindsignaal: een zachte drieklank, gemaakt met Web Audio.
 * Geen geluidsbestanden nodig, dus geen extra downloadgrootte.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext {
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/** Aanroepen bij de eerste klik, zodat het geluid later mag spelen. */
export function unlockAudio(): void {
  try {
    audio();
  } catch {
    /* geen audio beschikbaar */
  }
}

export function playChime(volume = 0.6): void {
  try {
    const ac = audio();
    const t0 = ac.currentTime + 0.02;
    [659.25, 830.61, 987.77].forEach((freq, i) => {
      const at = t0 + i * 0.22;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.35 * volume, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 1.6);
      osc.connect(gain).connect(ac.destination);
      osc.start(at);
      osc.stop(at + 1.7);
    });
  } catch {
    /* geen audio beschikbaar */
  }
}

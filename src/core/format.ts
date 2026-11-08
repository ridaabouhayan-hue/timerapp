/**
 * Tijd als tekst. Aftellen rondt naar boven af (bij 4,2 s zie je 0:05),
 * zodat 00:00 pas verschijnt op het moment dat de tijd echt om is.
 * Overtijd telt omhoog met een plusteken: +00:12.
 */
export function formatRemaining(ms: number): string {
  const over = ms <= -1000;
  const total = over ? Math.floor(-ms / 1000) : Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const body = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  return over ? `+${body}` : body;
}

/**
 * Invoer van de gebruiker naar ms. Accepteert "5" (minuten), "5:30",
 * "1:05:00", "90s", "1,5" (anderhalve minuut). Geeft null bij onzin.
 */
export function parseDuration(input: string): number | null {
  const t = input.trim().toLowerCase().replace(",", ".");
  if (!t) return null;
  const sec = /^(\d+(?:\.\d+)?)\s*s$/.exec(t);
  if (sec) return Math.round(parseFloat(sec[1]) * 1000);
  const min = /^(\d+(?:\.\d+)?)\s*m?$/.exec(t);
  if (min) return Math.round(parseFloat(min[1]) * 60_000);
  const parts = t.split(":");
  if (parts.length < 2 || parts.length > 3 || parts.some((p) => !/^\d{1,2}$/.test(p) && !/^\d+$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.slice(1).some((n) => n > 59)) return null;
  const [h, m, s] = nums.length === 3 ? nums : [0, nums[0], nums[1]];
  return ((h * 60 + m) * 60 + s) * 1000;
}

export function formatClock(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

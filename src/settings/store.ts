/** Voorkeuren onthouden tussen sessies (lokaal op deze pc). */
export interface Settings {
  presetsMin: number[];
  lastDurationMs: number;
  sound: boolean;
  alwaysOnTop: boolean;
}

const KEY = "tijdvak.settings.v1";

export const DEFAULTS: Settings = {
  presetsMin: [1, 3, 5, 10, 15, 20, 30],
  lastDurationMs: 5 * 60_000,
  sound: true,
  alwaysOnTop: false,
};

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(s: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* opslag niet beschikbaar */
  }
}

import { useCallback, useEffect, useRef, useState } from "react";
import { MINUTE } from "../core/timer";
import { formatClock, formatRemaining, parseDuration } from "../core/format";
import { useTimer } from "./useTimer";
import { IconFullscreen, IconPin, IconSound } from "./icons";
import { loadSettings, saveSettings, type Settings } from "../settings/store";
import { playChime, unlockAudio } from "../platform/sound";
import { requestAttention, setAlwaysOnTop, setFullscreen, setWindowTitle } from "../platform/window";

export function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const update = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }));
  useEffect(() => saveSettings(settings), [settings]);

  const soundRef = useRef(settings.sound);
  soundRef.current = settings.sound;
  const onFinish = useCallback(() => {
    if (soundRef.current) playChime();
    void requestAttention();
  }, []);

  const t = useTimer(settings.lastDurationMs, onFinish);
  const { state, remaining, phase } = t;

  const [fullscreen, setFs] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [idle, setIdle] = useState(false);

  // Venstertitel = resterende tijd, zichtbaar in de taakbalk.
  const label = formatRemaining(remaining);
  useEffect(() => {
    void setWindowTitle(state.status === "idle" ? "Tijdvak" : `${label} · Tijdvak`);
  }, [label, state.status]);

  useEffect(() => void setAlwaysOnTop(settings.alwaysOnTop), [settings.alwaysOnTop]);

  const chooseDuration = (ms: number) => {
    t.setDuration(ms);
    update({ lastDurationMs: ms });
  };

  const toggleFullscreen = useCallback(async () => {
    const next = !fullscreen;
    setFs(next);
    await setFullscreen(next);
  }, [fullscreen]);

  // Browser: Esc verlaat fullscreen zonder onze knop.
  useEffect(() => {
    const h = () => { if (!document.fullscreenElement) setFs(false); };
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  // In fullscreen verdwijnt de bediening als de muis even stilstaat.
  useEffect(() => {
    if (!fullscreen) { setIdle(false); return; }
    let id = window.setTimeout(() => setIdle(true), 2500);
    const wake = () => { setIdle(false); window.clearTimeout(id); id = window.setTimeout(() => setIdle(true), 2500); };
    window.addEventListener("mousemove", wake);
    window.addEventListener("keydown", wake);
    return () => { window.clearTimeout(id); window.removeEventListener("mousemove", wake); window.removeEventListener("keydown", wake); };
  }, [fullscreen]);

  const startEdit = () => {
    if (state.status === "running") return;
    setDraft(formatRemaining(state.status === "idle" ? state.durationMs : remaining));
    setEditing(true);
  };
  const commitEdit = () => {
    const ms = parseDuration(draft);
    if (ms && ms > 0) chooseDuration(ms);
    setEditing(false);
  };

  // Sneltoetsen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (editing || e.ctrlKey || e.altKey || e.metaKey || e.target instanceof HTMLInputElement) return;
      unlockAudio();
      switch (e.key) {
        case " ": e.preventDefault(); t.toggle(); break;
        case "r": case "R": t.reset(); break;
        case "+": case "=": t.adjust(MINUTE); break;
        case "-": case "_": t.adjust(-MINUTE); break;
        case "f": case "F": void toggleFullscreen(); break;
        case "Escape": if (fullscreen) void toggleFullscreen(); break;
        case "t": case "T": update({ alwaysOnTop: !settings.alwaysOnTop }); break;
        case "m": case "M": update({ sound: !settings.sound }); break;
        case "Enter": startEdit(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const toggleLabel = state.status === "running" ? "Pauze" : state.status === "paused" && remaining > 0 ? "Verder" : "Start";
  const status =
    phase === "overtime" ? "Tijd is om" :
    state.status === "running" ? `Eindigt om ${formatClock(t.now + remaining)}` :
    state.status === "paused" ? "Gepauzeerd" :
    "Klik op de tijd om hem te wijzigen";
  const activePreset = state.status === "idle" ? state.durationMs : null;

  return (
    <div className="app" data-phase={phase} data-fullscreen={fullscreen} data-idle={idle} onPointerDown={unlockAudio}>
      <div className="toolbar">
        <button className="icon" aria-pressed={settings.alwaysOnTop} onClick={() => update({ alwaysOnTop: !settings.alwaysOnTop })} title="Altijd bovenop (T)">
          <IconPin on={settings.alwaysOnTop} />
        </button>
        <button className="icon" aria-pressed={!settings.sound} onClick={() => update({ sound: !settings.sound })} title={settings.sound ? "Geluid uit (M)" : "Geluid aan (M)"}>
          <IconSound on={settings.sound} />
        </button>
        <button className="icon" onClick={() => void toggleFullscreen()} title={fullscreen ? "Volledig scherm sluiten (Esc)" : "Volledig scherm (F)"}>
          <IconFullscreen on={fullscreen} />
        </button>
      </div>

      <main className="stage">
        {editing ? (
          <input
            className="digits edit"
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onFocus={(e) => e.target.select()}
            onBlur={commitEdit}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Enter") commitEdit(); if (e.key === "Escape") setEditing(false); }}
            aria-label="Tijd invoeren, bijvoorbeeld 7 of 7:30"
          />
        ) : (
          <button
            className="digits"
            onClick={startEdit}
            onWheel={(e) => t.adjust(e.deltaY < 0 ? MINUTE : -MINUTE)}
            aria-label={`Resterende tijd ${label}. Klik om te wijzigen.`}
          >
            {label}
          </button>
        )}
        <p className="status" aria-live="polite">{status}</p>

        <div className="presets" role="group" aria-label="Snelle tijden in minuten">
          {settings.presetsMin.map((m) => (
            <button key={m} className="chip" aria-pressed={activePreset === m * MINUTE} onClick={() => chooseDuration(m * MINUTE)}>
              {m}
            </button>
          ))}
        </div>

        <div className="controls">
          <button className="btn" onClick={() => t.adjust(-MINUTE)} title="1 minuut eraf (-)">-1</button>
          <button className="btn primary" onClick={t.toggle} title="Start of pauze (Spatie)">{toggleLabel}</button>
          <button className="btn" onClick={t.reset} title="Reset (R)">Reset</button>
          <button className="btn" onClick={() => t.adjust(MINUTE)} title="1 minuut erbij (+)">+1</button>
        </div>
      </main>

      <div className="progress" aria-hidden="true"><i style={{ width: `${t.progress * 100}%` }} /></div>
    </div>
  );
}

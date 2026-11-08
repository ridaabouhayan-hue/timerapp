/**
 * Venster-functies. In de Windows-app via Tauri, in een gewone browser
 * (tijdens ontwikkelen) met de Web API's als terugval.
 */
import { getCurrentWindow } from "@tauri-apps/api/window";

export const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export async function setFullscreen(on: boolean): Promise<void> {
  if (isTauri) {
    await getCurrentWindow().setFullscreen(on);
    return;
  }
  try {
    if (on && !document.fullscreenElement) await document.documentElement.requestFullscreen();
    if (!on && document.fullscreenElement) await document.exitFullscreen();
  } catch {
    /* browser weigerde; geen probleem */
  }
}

export async function setAlwaysOnTop(on: boolean): Promise<void> {
  if (isTauri) await getCurrentWindow().setAlwaysOnTop(on);
}

export async function setWindowTitle(title: string): Promise<void> {
  document.title = title;
  if (isTauri) await getCurrentWindow().setTitle(title);
}

/** Laat het taakbalk-icoon oplichten als de tijd om is en het venster niet actief is. */
export async function requestAttention(): Promise<void> {
  if (!isTauri) return;
  const w = getCurrentWindow();
  if (!(await w.isFocused())) await w.requestUserAttention(2 /* Informational */);
}

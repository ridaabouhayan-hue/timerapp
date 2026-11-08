import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Tauri verwacht een vaste poort en geen scherm-wissen tijdens `tauri dev`.
export default defineConfig({
  plugins: [react()],
  clearScreen: false,
  server: { port: 1420, strictPort: true },
  build: { target: "es2021", outDir: "dist" },
});

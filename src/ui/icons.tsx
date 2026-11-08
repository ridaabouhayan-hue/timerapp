const base = { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };

export const IconPin = ({ on }: { on: boolean }) => (
  <svg {...base} fill={on ? "currentColor" : "none"}><path d="M9.5 2.5l4 4-2 1-2.5 2.5.5 3-1 1-6-6 1-1 3 .5L9 5z" /><path d="M5.5 10.5L2.5 13.5" /></svg>
);
export const IconSound = ({ on }: { on: boolean }) => (
  <svg {...base}><path d="M3 6h2l3-2.5v9L5 10H3z" />{on ? <path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6.5 6.5 0 0 1 0 9" /> : <path d="M10.5 6l4 4M14.5 6l-4 4" />}</svg>
);
export const IconFullscreen = ({ on }: { on: boolean }) =>
  on ? <svg {...base}><path d="M6 2.5V6H2.5M10 2.5V6h3.5M6 13.5V10H2.5M10 13.5V10h3.5" /></svg>
     : <svg {...base}><path d="M2.5 6V2.5H6M13.5 6V2.5H10M2.5 10v3.5H6M13.5 10v3.5H10" /></svg>;

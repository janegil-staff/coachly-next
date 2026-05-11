// CSS variable tokens for the Coachly coach dashboard.
// Theme-aware (light/dark) via CSS variables defined in globals.css.
export const A = "var(--accent)";
export const AD = "var(--accent-strong)";
export const AL = "var(--accent-soft)";
export const SU = "var(--card)";
export const BG = "var(--bg)";
export const BO = "var(--card-border)";
export const TX = "var(--text)";
export const MU = "var(--text-muted)";
export const OK = "var(--ok)";
export const WARN = "var(--warn)";
export const DANGER = "var(--danger)";

// Status colors for the goal check-in tier (stalled/drifting/ontrack/strong).
// Lives here rather than constants.js because it maps to theme-driven concepts
// of "good/bad/in-between".
export const GOALS_STATUS_COLORS = {
  stalled: "#EF4444",
  drifting: "#F59E0B",
  ontrack: "#4A7AB5",
  strong: "#22C55E",
};
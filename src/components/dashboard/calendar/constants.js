// Constants reused across the dashboard.

export const TYPE_COLORS = {
  strength: "#4A7AB5",
  cardio: "#F59E0B",
  mobility: "#22C55E",
  recovery: "#9CA3AF",
  other: "#6B7280",
};

// Resolve a workout type to its display color, with a safe fallback for
// unknown types (e.g. legacy data, custom categories).
export const tc = (type) => TYPE_COLORS[type] ?? "#6B7280";

export const BUCKET_COLORS = {
  5: "#22C55E",
  4: "#86EFAC",
  3: "#F59E0B",
  2: "#F97316",
  1: "#EF4444",
};

// Keys for the five wellness components (used by WellnessIndex bars)
export const COMPONENT_KEYS = [
  "consistency",
  "soreness",
  "moodEnergy",
  "recovery",
  "engagement",
];
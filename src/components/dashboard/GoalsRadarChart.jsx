"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

// Status colors stay hardcoded — they're semantic brand colors that should
// look the same in both modes (red = stalled, green = strong, etc.).
const GOALS_STATUS_COLORS = {
  stalled: "#EF4444",
  drifting: "#F59E0B",
  ontrack: "#4A7AB5",
  strong: "#22C55E",
};

// Light/dark palettes for chart chrome (axes, grid, default accent).
// Hardcoded hex strings instead of CSS variables because Recharts passes
// these directly into SVG attributes, which don't always resolve var() —
// rendering to actual hex at runtime is bulletproof.
const COLORS = {
  light: {
    A:    "#4A7AB5",
    TX:   "#1A2C3D",
    MU:   "#7A9AB8",
    grid: "#D0DCEA",
  },
  dark: {
    A:    "#6B95D1",
    TX:   "#E8EEF7",
    MU:   "#8DA3C0",
    grid: "rgba(255,255,255,0.12)",
  },
};

// Short labels for the radar axes — the full question text is too long
// to fit around the perimeter. The full text stays in the answer list
// below the chart.
const SHORT_LABELS = [
  { qKey: "goalsAxis1", fallback: "Clarity" },
  { qKey: "goalsAxis2", fallback: "Progress" },
  { qKey: "goalsAxis3", fallback: "Motivation" },
  { qKey: "goalsAxis4", fallback: "Obstacles" },
  { qKey: "goalsAxis5", fallback: "Support" },
];

export default function GoalsRadarChart({ answers, status, t }) {
  const { theme } = useTheme();
  const { A, TX, MU, grid } = COLORS[theme] ?? COLORS.light;

  if (!Array.isArray(answers) || answers.length === 0) return null;

  const data = SHORT_LABELS.map((axis, i) => ({
    subject: t[axis.qKey] ?? axis.fallback,
    value: typeof answers[i] === "number" ? answers[i] : 0,
    fullMark: 5,
  }));

  // Status color overrides the default accent if a status is set.
  const color = GOALS_STATUS_COLORS[status] ?? A;

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={data}
          margin={{ top: 16, right: 36, bottom: 16, left: 36 }}
        >
          <PolarGrid stroke={grid} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 11, fill: TX, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 5]}
            tickCount={6}
            tick={{ fontSize: 9, fill: MU }}
          />
          <Radar
            name={t.score ?? "Score"}
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
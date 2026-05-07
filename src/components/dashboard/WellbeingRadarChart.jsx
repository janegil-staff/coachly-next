"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

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

/**
 * 5-axis radar showing the average of the 5 wellbeing metrics over the
 * supplied logs. Soreness is INVERTED (6 - value) so all axes share the
 * convention "higher = better".
 */
export default function WellbeingRadarChart({ logs, t }) {
  const { theme } = useTheme();
  const { A, TX, MU, grid } = COLORS[theme] ?? COLORS.light;

  const safeLogs = Array.isArray(logs) ? logs : [];

  const avgOf = (key) => {
    const v = safeLogs.map((l) => l[key]).filter((x) => typeof x === "number");
    if (!v.length) return null;
    return v.reduce((a, b) => a + b, 0) / v.length;
  };

  const eff = avgOf("effort");
  const moo = avgOf("mood");
  const ene = avgOf("energy");
  const slp = avgOf("sleepQuality");
  const sor = avgOf("soreness");

  const data = [
    { subject: t.effort   ?? "Effort",   value: +(eff ?? 0).toFixed(1),                            fullMark: 5 },
    { subject: t.mood     ?? "Mood",     value: +(moo ?? 0).toFixed(1),                            fullMark: 5 },
    { subject: t.energy   ?? "Energy",   value: +(ene ?? 0).toFixed(1),                            fullMark: 5 },
    { subject: t.sleep    ?? "Sleep",    value: +(slp ?? 0).toFixed(1),                            fullMark: 5 },
    { subject: t.recovery ?? "Recovery", value: sor != null ? +(6 - sor).toFixed(1) : 0,           fullMark: 5 },
  ];

  const hasAnyData = [eff, moo, ene, slp, sor].some((v) => v != null);
  if (!hasAnyData) {
    return (
      <div
        className="text-center py-12 text-xs italic"
        style={{ color: MU }}
      >
        {t.noData ?? "No data"}
      </div>
    );
  }

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
            name={t.average ?? "Average"}
            dataKey="value"
            stroke={A}
            fill={A}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
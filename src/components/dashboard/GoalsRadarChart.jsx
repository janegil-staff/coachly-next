"use client";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const A = "#4A7AB5";
const MU = "#7A9AB8";
const TX = "#1A2C3D";

const GOALS_STATUS_COLORS = {
  stalled: "#EF4444",
  drifting: "#F59E0B",
  ontrack: "#4A7AB5",
  strong: "#22C55E",
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
  if (!Array.isArray(answers) || answers.length === 0) return null;

  const data = SHORT_LABELS.map((axis, i) => ({
    subject: t[axis.qKey] ?? axis.fallback,
    value: typeof answers[i] === "number" ? answers[i] : 0,
    fullMark: 5,
  }));

  const color = GOALS_STATUS_COLORS[status] ?? A;

  return (
    <div style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 16, right: 36, bottom: 16, left: 36 }}>
          <PolarGrid stroke="#D0DCEA" />
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
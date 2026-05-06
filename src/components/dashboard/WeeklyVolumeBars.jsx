"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const A = "#4A7AB5";
const MU = "#7A9AB8";

function pad(n) { return String(n).padStart(2, "0"); }

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = x.getDate() - (day === 0 ? 6 : day - 1);
  x.setDate(diff);
  return x;
}

function logTotalMinutes(log) {
  if (!log) return 0;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length) return cd.reduce((s, c) => s + (Number(c?.durationMinutes) || 0), 0);
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  return ws.reduce((s, w) => s + (Number(w?.durationMinutes) || 0), 0);
}

/**
 * Bars showing total training minutes per week for the last N weeks.
 * Builds a fixed N-week grid so empty weeks still show on the x-axis.
 */
export default function WeeklyVolumeBars({ logs, weeks = 12, t }) {
  const safeLogs = Array.isArray(logs) ? logs : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const firstWeek = startOfWeek(new Date(today.getTime() - (weeks - 1) * 7 * 86400000));

  const buckets = new Map();
  for (let i = 0; i < weeks; i++) {
    const ws = new Date(firstWeek);
    ws.setDate(ws.getDate() + i * 7);
    const key = `${pad(ws.getMonth() + 1)}/${pad(ws.getDate())}`;
    buckets.set(key, { week: key, minutes: 0 });
  }

  safeLogs.forEach((l) => {
    if (l?.isRestDay) return;
    const ws = startOfWeek(new Date(l.date));
    const key = `${pad(ws.getMonth() + 1)}/${pad(ws.getDate())}`;
    if (buckets.has(key)) {
      buckets.get(key).minutes += logTotalMinutes(l);
    }
  });

  const data = Array.from(buckets.values());
  const hasAnyData = data.some((d) => d.minutes > 0);

  if (!hasAnyData) {
    return (
      <div className="text-center py-12 text-xs italic" style={{ color: MU }}>
        {t.noData ?? "No data"}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
          <XAxis dataKey="week" stroke={MU} fontSize={10} tickLine={false} axisLine={false} />
          <YAxis stroke={MU} fontSize={10} tickLine={false} axisLine={false} />
          <Tooltip
            formatter={(value) => [`${value} ${t.minutes ?? "min"}`, t.minutes ?? "Minutes"]}
          />
          <Bar dataKey="minutes" fill={A} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const MU = "#7A9AB8";
const TX = "#1A2C3D";

const CAT_COLORS = {
  strength: "#7986CB",
  cardio: "#EF5350",
  mobility: "#66BB6A",
  recovery: "#26A69A",
  other: "#BDBDBD",
};

const ALL_CATEGORIES = ["strength", "cardio", "mobility", "recovery", "other"];

function categoryLabel(name, t) {
  const key = "category" + name.charAt(0).toUpperCase() + name.slice(1);
  return t[key] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

function logCategoryMinutes(log) {
  const out = {};
  if (!log) return out;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length) {
    cd.forEach((c) => {
      const k = (c.type || "other").toLowerCase();
      out[k] = (out[k] || 0) + (Number(c?.durationMinutes) || 0);
    });
    return out;
  }
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  ws.forEach((w) => {
    const k = (w.type || w.category || "other").toLowerCase();
    out[k] = (out[k] || 0) + (Number(w?.durationMinutes) || 0);
  });
  return out;
}

/**
 * Category mix donut with always-on 5-category legend.
 * Greys out categories with 0 minutes so the legend stays consistent
 * across reports.
 */
export default function CategoryMixDonut({ logs, t }) {
  const safeLogs = Array.isArray(logs) ? logs : [];

  const totals = {};
  safeLogs.forEach((l) => {
    if (l?.isRestDay) return;
    const perCat = logCategoryMinutes(l);
    Object.entries(perCat).forEach(([cat, mins]) => {
      totals[cat] = (totals[cat] || 0) + mins;
    });
  });

  const chartData = ALL_CATEGORIES.map((name) => ({
    name,
    value: totals[name] || 0,
  })).filter((x) => x.value > 0);

  const grandTotal = chartData.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex flex-col items-stretch w-full">
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={
                chartData.length > 0 ? chartData : [{ name: "empty", value: 1 }]
              }
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={80}
              startAngle={90}
              endAngle={-270}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              labelLine={false}
              isAnimationActive={false}
            >
              {(chartData.length > 0 ? chartData : [{ name: "empty" }]).map(
                (entry, i) => (
                  <Cell
                    key={`${entry.name}-${i}`}
                    fill={
                      entry.name === "empty"
                        ? "#E8EEF5"
                        : (CAT_COLORS[entry.name] ?? CAT_COLORS.other)
                    }
                  />
                ),
              )}
            </Pie>
            {chartData.length > 0 && (
              <Tooltip
                formatter={(value, name) => [
                  `${value} ${t.minutes ?? "min"}`,
                  categoryLabel(name, t),
                ]}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Always-on 5-category legend */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4px 12px",
          padding: "8px 4px 0",
          fontSize: 11,
        }}
      >
        {ALL_CATEGORIES.map((name) => {
          const minutes = totals[name] || 0;
          const pct =
            grandTotal > 0 ? Math.round((minutes / grandTotal) * 100) : 0;
          const isEmpty = minutes === 0;
          return (
            <div
              key={name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                opacity: isEmpty ? 0.4 : 1,
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  flexShrink: 0,
                  background: CAT_COLORS[name],
                }}
              />
              <span style={{ color: TX, fontWeight: 600, flex: 1 }}>
                {categoryLabel(name, t)}
              </span>
              <span style={{ color: MU, fontVariantNumeric: "tabular-nums" }}>
                {minutes}m · {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

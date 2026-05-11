"use client";
// Side card: shows current-month averages with month-over-month deltas.
// Mirrors recover's MonthlyTrendsCard. Five metrics: consistency rate,
// mood, energy, soreness, sleep quality.
import { useMemo } from "react";
import { BO, MU, SU, TX } from "./theme";
import { isConsistencyDay } from "./helpers";

const METRIC_DEFS = [
  { key: "consistency", labelKey: "compConsistency", labelFb: "Consistency", scale: 100, unit: "%", color: "#4A7AB5", higherIsBetter: true },
  { key: "mood",        labelKey: "mood",            labelFb: "Mood",        scale: 5,  unit: "/5", color: "#4A7AB5", higherIsBetter: true },
  { key: "energy",      labelKey: "energy",          labelFb: "Energy",      scale: 5,  unit: "/5", color: "#22C55E", higherIsBetter: true },
  { key: "soreness",    labelKey: "soreness",        labelFb: "Soreness",    scale: 5,  unit: "/5", color: "#EF4444", higherIsBetter: false },
  { key: "sleep",       labelKey: "sleep",           labelFb: "Sleep",       scale: 5,  unit: "/5", color: "#A855F7", higherIsBetter: true },
];

function avg(arr, key) {
  const v = arr.map((l) => l[key]).filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function consistencyRate(arr) {
  if (arr.length === 0) return null;
  return (arr.filter(isConsistencyDay).length / arr.length) * 100;
}

function metricValue(arr, key) {
  if (key === "consistency") return consistencyRate(arr);
  if (key === "sleep") return avg(arr, "sleepQuality");
  return avg(arr, key);
}

export default function MonthlyTrendsCard({ data, t, month }) {
  const logs = data?.logs ?? [];

  const { now, prev } = useMemo(() => {
    const { y, m } = month;
    const monthPrefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    const prevDate = new Date(y, m - 1, 15);
    const prevPrefix = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    return {
      now: logs.filter((l) => String(l.date ?? "").startsWith(monthPrefix)),
      prev: logs.filter((l) => String(l.date ?? "").startsWith(prevPrefix)),
    };
  }, [logs, month]);

  if (now.length === 0) {
    return (
      <div
        style={{
          background: SU,
          borderRadius: 12,
          border: `1px solid ${BO}`,
          padding: "14px 16px",
          boxShadow: "var(--shadow-card)",
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          {t.monthlyTrends ?? "Monthly averages"}
        </div>
        <div style={{ fontSize: 11, color: MU, fontStyle: "italic" }}>
          {t.noneThisMonth ?? "none this month"}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: "14px 16px",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 10,
        }}
      >
        {t.monthlyTrends ?? "Monthly averages"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {METRIC_DEFS.map((def) => {
          const nowVal = metricValue(now, def.key);
          const prevVal = metricValue(prev, def.key);
          if (nowVal == null) return null;

          const delta = prevVal != null ? nowVal - prevVal : null;
          const isFlat = delta == null || Math.abs(delta) < (def.scale === 100 ? 2 : 0.2);
          const isGood = delta != null && (def.higherIsBetter ? delta > 0 : delta < 0);
          const deltaColor = isFlat ? MU : isGood ? "#16A34A" : "#DC2626";
          const arrow = isFlat ? "→" : delta > 0 ? "↑" : "↓";

          const pct = (nowVal / def.scale) * 100;
          const decimals = def.scale === 100 ? 0 : 1;

          return (
            <div key={def.key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 3,
                  gap: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: TX,
                    fontWeight: 600,
                  }}
                >
                  {t[def.labelKey] ?? def.labelFb}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 6,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: def.color,
                    }}
                  >
                    {nowVal.toFixed(decimals)}
                    <span style={{ fontSize: 9, color: MU, fontWeight: 500 }}>
                      {def.unit}
                    </span>
                  </span>
                  {delta != null && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: deltaColor,
                      }}
                    >
                      {arrow}{" "}
                      {Math.abs(delta).toFixed(decimals)}
                      {def.scale === 100 ? "%" : ""}
                    </span>
                  )}
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "var(--bg)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    background: def.color,
                    borderRadius: 2,
                    transition: "width .4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {prev.length === 0 && (
        <div
          style={{
            marginTop: 10,
            fontSize: 9,
            color: MU,
            fontStyle: "italic",
          }}
        >
          {t.noPrevMonth ?? "No data for previous month — deltas unavailable"}
        </div>
      )}
    </div>
  );
}

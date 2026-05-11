"use client";
// Self-contextualizing workout-streak line. Sits below the wellness index
// and tells the coach where today's streak sits in the client's lifetime
// distribution — saving them from mentally computing whether "12 days" is
// good or middling for THIS client.
import { BO, MU, SU } from "./theme";
import { isConsistencyDay } from "./helpers";

// Walk the full log list (ascending by date) and return every consistency
// streak length. A streak ends at any non-consistency day (logged but did
// nothing and not a rest day).
function computeStreaks(logs) {
  if (!logs || logs.length === 0)
    return { all: [], current: 0, best: 0, avg: 0 };

  const sortedAsc = [...logs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  const all = [];
  let run = 0;
  sortedAsc.forEach((l) => {
    if (isConsistencyDay(l)) {
      run++;
    } else if (run > 0) {
      all.push(run);
      run = 0;
    }
  });
  let current = 0;
  if (run > 0) {
    all.push(run);
    current = run;
  }

  const best = all.reduce((m, n) => Math.max(m, n), 0);
  const avg = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 0;

  return { all, current, best, avg };
}

function colorFor(days) {
  if (days >= 30) return "#16A34A";
  if (days >= 14) return "#22C55E";
  if (days >= 7) return "#7AABDB";
  if (days >= 3) return "#FBBF24";
  return "#FB923C";
}

export default function StreakComparison({ data, t }) {
  const logs = data?.logs ?? [];
  if (logs.length === 0) return null;

  const { current, best, avg, all } = computeStreaks(logs);

  if (all.length === 0 && current === 0) return null;

  const items = [
    {
      label: t.currentStreak ?? "Current streak",
      value: current,
      color: current > 0 ? colorFor(current) : MU,
    },
    {
      label: t.lifetimeBest ?? "Lifetime best",
      value: best,
      color: colorFor(best),
    },
    {
      label: t.avgStreak ?? "Average streak",
      value: Math.round(avg),
      color: colorFor(Math.round(avg)),
    },
  ];

  let contextLine = null;
  if (current > 0 && best > 0) {
    if (current === best) {
      contextLine = t.streakContextNewBest ?? "New personal best";
    } else if (current >= best * 0.9) {
      contextLine = t.streakContextNearBest ?? "Approaching personal best";
    } else if (current > avg) {
      contextLine = t.streakContextAboveAvg ?? "Above average";
    } else if (Math.abs(current - avg) < 0.5) {
      contextLine = t.streakContextAverage ?? "At average";
    } else {
      contextLine = t.streakContextBuildingUp ?? "Building up";
    }
  }

  return (
    <div
      style={{
        background: SU,
        border: `1px solid ${BO}`,
        borderRadius: 10,
        padding: "8px 14px",
        marginBottom: 16,
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 14,
        fontSize: 11,
        color: MU,
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "baseline", gap: 4 }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            {item.label}:
          </span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: item.color,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {item.value}
          </span>
          <span style={{ fontSize: 10, color: MU, fontWeight: 500 }}>
            {item.value === 1
              ? (t.daySingular ?? "day")
              : (t.daysPlural ?? "days")}
          </span>
        </div>
      ))}

      {contextLine && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: 10,
            fontWeight: 600,
            color: colorFor(current),
            fontStyle: "italic",
          }}
        >
          {contextLine}
        </span>
      )}
    </div>
  );
}

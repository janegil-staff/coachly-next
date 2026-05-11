"use client";
// Top ribbon: current logging streak, last training day, best/worst day by
// mood, total log count. Read-only summary derived from the full ascending-
// sorted log list.
//
// Ported from recover's PeriodRibbon, with adapted semantics:
//   "Current streak" still = days logged in a row (any log type)
//   "Last use"        → "Last training" (most recent workout day)
//   Best/worst day    = highest/lowest mood (unchanged)
import { useMemo } from "react";
import { BO, MU, SU, TX } from "../calendar/theme";

function shortDate(d) {
  const dt = new Date(d);
  return `${String(dt.getMonth() + 1).padStart(2, "0")}/${String(dt.getDate()).padStart(2, "0")}`;
}

export default function PeriodRibbon({ logs, t }) {
  const stats = useMemo(() => {
    if (!logs?.length) return null;
    const sortedAsc = [...logs].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );

    // Current streak: consecutive calendar days with any log, counted
    // backwards from the most recent. Same logic as eventDetection.
    let current = 0;
    let prev = null;
    for (let i = sortedAsc.length - 1; i >= 0; i--) {
      const ds = sortedAsc[i].date ?? sortedAsc[i].createdAt;
      if (!ds) continue;
      if (prev === null) {
        current = 1;
        prev = ds;
        continue;
      }
      const gap = Math.round(
        (new Date(prev) - new Date(ds)) / 86400000,
      );
      if (gap === 1) {
        current++;
        prev = ds;
      } else {
        break;
      }
    }

    // Last training: most recent log with workouts and not rest
    const lastTraining = [...sortedAsc].reverse().find(
      (l) => !l.isRestDay && (l.workouts ?? []).length > 0,
    );

    // Best & worst day by mood
    const withMood = sortedAsc.filter((l) => typeof l.mood === "number");
    const best = withMood.reduce(
      (b, l) => (!b || l.mood > b.mood ? l : b),
      null,
    );
    const worst = withMood.reduce(
      (w, l) => (!w || l.mood < w.mood ? l : w),
      null,
    );

    return { current, lastTraining, best, worst, total: logs.length };
  }, [logs]);

  if (!stats) return null;

  const items = [
    {
      label: t.streakNow ?? "Current streak",
      value:
        stats.current > 0
          ? `${stats.current} ${t.daysPlural ?? "days"}`
          : "—",
      color:
        stats.current >= 7 ? "#16A34A" : stats.current > 0 ? "#7AABDB" : MU,
    },
    {
      label: t.lastTraining ?? "Last training",
      value: stats.lastTraining
        ? shortDate(stats.lastTraining.date ?? stats.lastTraining.createdAt)
        : (t.never ?? "Never"),
      color: stats.lastTraining ? "#16A34A" : "#DC2626",
    },
    {
      label: t.bestDay ?? "Best day",
      value: stats.best
        ? shortDate(stats.best.date ?? stats.best.createdAt)
        : "—",
      color: "#16A34A",
    },
    {
      label: t.worstDay ?? "Worst day",
      value: stats.worst
        ? shortDate(stats.worst.date ?? stats.worst.createdAt)
        : "—",
      color: "#DC2626",
    },
    {
      label: t.totalLogs ?? "Total logs",
      value: String(stats.total),
      color: TX,
    },
  ];

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: "12px 16px",
        marginBottom: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((item, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: 9,
                color: MU,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              {item.label}
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: item.color,
                lineHeight: 1.1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

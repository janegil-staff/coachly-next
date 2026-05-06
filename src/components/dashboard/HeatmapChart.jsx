"use client";
import { useMemo } from "react";

const A = "#4A7AB5";
const MU = "#7A9AB8";
const TX = "#1A2C3D";

const GAP = 3;
const MIN_CELL = 8;
const MAX_CELL = 16;

function pad(n) { return String(n).padStart(2, "0"); }
function dateKey(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfWeek(d) {
  const x = startOfDay(d);
  const dow = x.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + offset);
  return x;
}

function colorFor(score) {
  if (score == null) return "#E5E7EB";
  if (score >= 80) return A;
  if (score >= 60) return A + "BB";
  if (score >= 40) return A + "88";
  if (score >= 20) return A + "55";
  return A + "33";
}

/**
 * GitHub-style intensity heatmap. Rows = weekdays (Mon-Sun), columns = weeks.
 * Computes cell size to fit the available width.
 */
export default function HeatmapChart({ logs, scores, weeks = 26, t }) {
  const data = useMemo(() => {
    const today = startOfDay(new Date());
    const start = new Date(today);
    start.setDate(start.getDate() - (weeks * 7 - 1));
    const aligned = startOfWeek(start);

    const logsByDate = {};
    (logs || []).forEach((l) => {
      if (l?.date) logsByDate[l.date] = l;
    });

    const scoresByDate = {};
    (scores || []).forEach((s) => {
      if (s?.date && typeof s.compositeScore === "number") {
        scoresByDate[s.date] = s.compositeScore;
      }
    });

    const cells = [];
    const totalDays = Math.round((today - aligned) / 86400000) + 1;
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(aligned);
      d.setDate(d.getDate() + i);
      const key = dateKey(d);
      const log = logsByDate[key];
      const score = scoresByDate[key] ?? null;
      cells.push({
        date: key,
        score,
        isRest: !!log?.isRestDay,
        hasLog: !!log,
        dow: (d.getDay() + 6) % 7, // Mon=0..Sun=6
        week: Math.floor(i / 7),
      });
    }

    return { cells, weeks: Math.ceil(totalDays / 7) };
  }, [logs, scores, weeks]);

  const hasAnyData = data.cells.some((c) => c.hasLog || c.score != null);
  if (!hasAnyData) {
    return (
      <div className="text-center py-12 text-xs italic" style={{ color: MU }}>
        {t.noData ?? "No data"}
      </div>
    );
  }

  // Approximate available width: card padding ~32px, container padding.
  // The card content area on a 5xl page is roughly 360-440px depending
  // on column layout. Cap at sensible cell sizes.
  const approxWidth = 420;
  const computedCell = Math.floor((approxWidth - (data.weeks - 1) * GAP) / data.weeks);
  const CELL = Math.max(MIN_CELL, Math.min(MAX_CELL, computedCell));

  const width = data.weeks * CELL + (data.weeks - 1) * GAP;
  const height = 7 * CELL + 6 * GAP;

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ maxWidth: "100%" }}
      >
        {data.cells.map((c) => (
          <rect
            key={c.date}
            x={c.week * (CELL + GAP)}
            y={c.dow * (CELL + GAP)}
            width={CELL}
            height={CELL}
            rx={2}
            fill={c.isRest ? "#9CA3AF44" : colorFor(c.score)}
          >
            <title>{`${c.date}${c.score != null ? ` · ${Math.round(c.score)}/100` : ""}`}</title>
          </rect>
        ))}
      </svg>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        marginTop: 10,
        fontSize: 10,
        fontWeight: 600,
        color: MU,
      }}>
        <span>{t.less ?? "Less"}</span>
        {[null, 25, 50, 75, 90].map((s, i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: colorFor(s),
            }}
          />
        ))}
        <span>{t.more ?? "More"}</span>
      </div>
    </div>
  );
}
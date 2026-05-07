"use client";

import { useState, useMemo } from "react";
const A = "var(--accent)",
  AD = "var(--accent-strong)",
  BG = "var(--bg)";
const SU = "var(--card)",
  BO = "var(--card-border)",
  TX = "var(--text)",
  MU = "var(--text-muted)";
const BUCKET_COLORS = {
  5: "#22C55E",
  4: "#86EFAC",
  3: "#F59E0B",
  2: "#F97316",
  1: "#EF4444",
};

function bucketOf(score) {
  if (score == null) return null;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

const TYPE_COLORS = {
  strength: "#4A7AB5",
  cardio: "#F59E0B",
  mobility: "#22C55E",
  recovery: "#9CA3AF",
  other: "#6B7280",
};

function totalMinutes(log) {
  if (!log) return 0;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length) return cd.reduce((s, c) => s + (c.durationMinutes || 0), 0);
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  return ws.reduce((s, w) => s + (w.durationMinutes || 0), 0);
}

// Build the chips for the expanded body. Prefer categoryDurations
// (authoritative since the schema migration); fall back to grouping
// workouts by type if categoryDurations is empty/missing.
function buildChips(log) {
  const catDurs = Array.isArray(log.categoryDurations)
    ? log.categoryDurations
    : [];
  if (catDurs.length > 0) {
    return catDurs.map((c) => ({
      type: c.type,
      minutes: c.durationMinutes || 0,
    }));
  }
  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  if (workouts.length === 0) return [];
  const byType = workouts.reduce((acc, w) => {
    const k = w.type || "other";
    acc[k] = (acc[k] || 0) + (w.durationMinutes || 0);
    return acc;
  }, {});
  return Object.entries(byType).map(([type, minutes]) => ({ type, minutes }));
}

function categoryLabel(type, t) {
  if (!type) return "—";
  const key = "category" + type.charAt(0).toUpperCase() + type.slice(1);
  return t[key] ?? type;
}

function HistoryRow({ log, score, t, includeNotes }) {
  const [open, setOpen] = useState(false);

  const bucket = bucketOf(score?.compositeScore);
  const minutes = totalMinutes(log);
  const dotColor = bucket ? BUCKET_COLORS[bucket] : "#D1D5DB";
  const chips = buildChips(log);

  // One-line summary — comma-separated category names from the chips
  // (matches what's actually shown when expanded, and isn't duplicated
  // when the same type appears in multiple workouts).
  const typeLabel = log.isRestDay
    ? (t.restDay ?? "Rest day")
    : chips.length === 0
      ? "—"
      : chips.map((c) => categoryLabel(c.type, t)).join(" · ");

  return (
    <div
      className="rounded-xl border shadow-sm transition-all overflow-hidden"
      style={{ background: SU, borderColor: BO }}
    >
      {/* One-line header (always visible, clickable) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:hover-bg-soft transition-colors"
      >
        {/* Score dot */}
        <div
          className="w-2 h-8 rounded-full flex-shrink-0"
          style={{ background: dotColor }}
        />

        {/* Date */}
        <div
          className="font-bold text-sm w-24 flex-shrink-0"
          style={{ color: TX }}
        >
          {log.date}
        </div>

        {/* Type summary */}
        <div className="flex-1 text-xs truncate" style={{ color: MU }}>
          {typeLabel}
        </div>

        {/* Minutes badge */}
        {!log.isRestDay && minutes > 0 && (
          <div className="text-xs font-bold flex-shrink-0" style={{ color: A }}>
            {minutes}m
          </div>
        )}

        {/* Composite score */}
        {score && (
          <div
            className="text-sm font-black flex-shrink-0"
            style={{ color: AD }}
          >
            {bucketOf(score.compositeScore) ?? "—"}
            <span className="text-[10px] font-bold" style={{ color: MU }}>
              /5
            </span>
          </div>
        )}

        {/* Caret */}
        <div
          className="text-xs flex-shrink-0 transition-transform"
          style={{
            color: MU,
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ›
        </div>
      </button>

      {/* Expanded body */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t" style={{ borderColor: BO }}>
          {/* Workouts — uses categoryDurations as authoritative source */}
          {!log.isRestDay && chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 mb-3">
              {chips.map((c, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: (TYPE_COLORS[c.type] ?? "#6B7280") + "22",
                    color: TYPE_COLORS[c.type] ?? "#6B7280",
                  }}
                >
                  {categoryLabel(c.type, t)}
                  {c.minutes > 0 && ` · ${c.minutes}m`}
                </span>
              ))}
            </div>
          )}

          {/* 5 ratings */}
          <div className="flex gap-3 text-xs mt-3" style={{ color: MU }}>
            {[
              {
                label: t.effort ?? "Effort",
                val: log.effort,
                color: "#F59E0B",
              },
              { label: t.mood ?? "Mood", val: log.mood, color: "#4A7AB5" },
              {
                label: t.energy ?? "Energy",
                val: log.energy,
                color: "#22C55E",
              },
              {
                label: t.sleep ?? "Sleep",
                val: log.sleepQuality,
                color: "#A855F7",
              },
              {
                label: t.soreness ?? "Soreness",
                val: log.soreness,
                color: "#EF4444",
              },
            ].map((m) => (
              <div key={m.label} className="flex-1 text-center">
                <div
                  className="font-bold text-sm"
                  style={{ color: m.val != null ? m.color : MU }}
                >
                  {m.val != null ? m.val : "—"}
                </div>
                <div className="text-[9px] uppercase tracking-wider mt-0.5">
                  {m.label}
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          {includeNotes && log.note && (
            <div
              className="mt-3 px-3 py-2 rounded-lg text-sm italic"
              style={{
                background: BG,
                color: TX,
                borderLeft: "3px solid " + A,
              }}
            >
              "{log.note}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryTab({ logs, scores, t, includeNotes }) {
  const scoreByDate = useMemo(() => {
    const m = {};
    (scores || []).forEach((s) => {
      if (s.date) m[s.date] = s;
    });
    return m;
  }, [scores]);

  const sorted = useMemo(
    () => [...(logs || [])].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [logs],
  );

  if (!sorted.length) {
    return (
      <div className="text-center py-16" style={{ color: MU }}>
        {t.noLogs ?? "No logs in this share window."}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-2">
      {sorted.map((log) => (
        <HistoryRow
          key={log.date}
          log={log}
          score={scoreByDate[log.date]}
          t={t}
          includeNotes={includeNotes}
        />
      ))}
    </div>
  );
}

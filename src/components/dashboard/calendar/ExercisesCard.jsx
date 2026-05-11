"use client";
// Exercises card body — body content for the "Exercises" collapsible
// in the right column of the calendar tab.
//
// Data sources (both optional, but card is most useful with both):
//   • exercises[]  — the user's full saved library from report.exercises
//                    (each = { _id, slug, name, category, isCustom, ... })
//   • logs[]       — for frequency counts and last-used dates from
//                    log.workouts[]
//
// Behavior:
//   1. Build a unified set of exercise entries keyed by (slug || _id || name).
//   2. For each entry, count how many times it appears in logs[] and
//      remember the most recent date.
//   3. Within each category, render TWO subsections:
//        • "Logged"  → entries with count > 0, sorted by count desc
//        • "Library" → entries with count == 0 (saved but unused)
//   4. Click any entry to drill in: shows every date it was logged
//      (or "never logged" for Library entries).
//
// If report.exercises is empty/undefined, the card gracefully degrades
// to logs-only mode (no Library subsection).
import { useMemo, useState } from "react";
import { getCatalogItemName } from "@/lib/exerciseCatalog";
import { A, AL, AD, BG, BO, MU, TX } from "./theme";
import { tc } from "./constants";

const CATEGORY_ORDER = ["strength", "cardio", "mobility", "recovery", "other"];

// Stable per-exercise key. For saved-library items we prefer slug, then
// _id. For log entries we use the same keys (with `exerciseId` mapped
// to the saved `_id`), falling back to a lowercased name for legacy
// type-only entries.
function libraryKey(ex) {
  if (ex.slug) return `slug:${ex.slug}`;
  return `id:${ex._id}`;
}
function workoutKey(w) {
  if (w.exerciseSlug) return `slug:${w.exerciseSlug}`;
  if (w.exerciseId) return `id:${w.exerciseId}`;
  if (w.name) return `name:${String(w.name).toLowerCase().trim()}`;
  return null;
}

function fmtShort(dateStr) {
  try {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return dateStr;
  }
}

function resolveName(entry, t) {
  if (entry.slug) {
    const catName = getCatalogItemName(entry.slug, t);
    if (catName) return catName;
  }
  return entry.displayName || entry.slug || "—";
}

export default function ExercisesCard({ logs, exercises, t }) {
  const [expandedKey, setExpandedKey] = useState(null);

  const { byCategory, unnamedCounts } = useMemo(() => {
    const map = new Map();
    const unnamed = { strength: 0, cardio: 0, mobility: 0, recovery: 0, other: 0 };

    // Step 1: seed the map from the saved library (if present).
    for (const ex of exercises ?? []) {
      const key = libraryKey(ex);
      map.set(key, {
        key,
        category: ex.category || "other",
        slug: ex.slug ?? null,
        exerciseId: ex._id ? String(ex._id) : null,
        displayName: ex.name || null,
        isCustom: !!ex.isCustom,
        inLibrary: true,
        count: 0,
        dates: [],
      });
    }

    // Step 2: walk logs[].workouts to build counts and dates.
    for (const log of logs ?? []) {
      const ws = Array.isArray(log.workouts) ? log.workouts : [];
      for (const w of ws) {
        const category = w.type || "other";
        const key = workoutKey(w);
        if (!key) {
          if (unnamed[category] != null) unnamed[category] += 1;
          else unnamed[category] = 1;
          continue;
        }

        let entry = map.get(key);
        if (!entry) {
          // Not in saved library — synthesized from log data alone.
          entry = {
            key,
            category,
            slug: w.exerciseSlug ?? null,
            exerciseId: w.exerciseId ?? null,
            displayName: w.name ?? null,
            isCustom: !!w.exerciseId && !w.exerciseSlug,
            inLibrary: false,
            count: 0,
            dates: [],
          };
          map.set(key, entry);
        }
        entry.count += 1;
        entry.dates.push(log.date);
        if (w.name) entry.displayName = w.name;
      }
    }

    // Sort dates within each entry: newest first
    for (const entry of map.values()) {
      entry.dates.sort((a, b) => String(b).localeCompare(String(a)));
    }

    // Group by category
    const grouped = {};
    for (const entry of map.values()) {
      const cat = entry.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(entry);
    }
    // Within each category, sort by count desc (logged ones first),
    // then by name asc.
    for (const cat in grouped) {
      grouped[cat].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return String(a.displayName ?? "").localeCompare(
          String(b.displayName ?? ""),
        );
      });
    }

    return { byCategory: grouped, unnamedCounts: unnamed };
  }, [logs, exercises]);

  const categoryLabel = (type) => {
    const k = "category" + type.charAt(0).toUpperCase() + type.slice(1);
    return t[k] ?? type;
  };

  const totalNamed = Object.values(byCategory).reduce(
    (s, arr) => s + arr.length,
    0,
  );

  if (totalNamed === 0) {
    return (
      <div className="pt-2 text-xs italic" style={{ color: MU }}>
        {t.exercisesEmpty ?? "No exercises yet"}
      </div>
    );
  }

  const renderEntry = (entry) => {
    const isExpanded = expandedKey === entry.key;
    const lastDate = entry.dates[0];
    const name = resolveName(entry, t);
    const neverLogged = entry.count === 0;

    return (
      <div key={entry.key}>
        <button
          onClick={() =>
            setExpandedKey((prev) => (prev === entry.key ? null : entry.key))
          }
          className="w-full text-left rounded-lg px-2.5 py-1.5 flex items-center justify-between gap-2"
          style={{
            background: isExpanded ? AL : BG,
            border: `1px solid ${isExpanded ? AD : BO}`,
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: neverLogged ? 0.75 : 1,
            transition: "background .15s ease, border-color .15s ease",
          }}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span
              className="text-[11px] font-semibold truncate"
              style={{ color: TX }}
            >
              {name}
            </span>
            {entry.isCustom && (
              <span
                className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{ background: AD, color: "#fff", flexShrink: 0 }}
                title={t.customExerciseTooltip ?? "Created by client"}
              >
                {t.customExerciseLabel ?? "custom"}
              </span>
            )}
          </div>
          <div
            className="flex items-center gap-1.5 text-[10px] font-semibold flex-shrink-0"
            style={{ color: MU, fontVariantNumeric: "tabular-nums" }}
          >
            <span style={{ color: neverLogged ? MU : AD, fontWeight: 700 }}>
              {entry.count}×
            </span>
            <span>·</span>
            <span>
              {neverLogged ? t.neverLogged ?? "never" : fmtShort(lastDate)}
            </span>
            <span
              style={{
                color: MU,
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform .15s ease",
                display: "inline-block",
              }}
            >
              ▸
            </span>
          </div>
        </button>

        {isExpanded && (
          <div
            className="ml-3 mt-1 mb-2 pl-3 py-1 flex flex-wrap gap-1"
            style={{ borderLeft: `2px solid ${tc(entry.category)}` }}
          >
            {neverLogged ? (
              <span className="text-[10px] italic" style={{ color: MU }}>
                {t.notYetLoggedLong ?? "Saved in library, never logged yet"}
              </span>
            ) : (
              entry.dates.map((d) => (
                <span
                  key={d}
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{
                    background: BG,
                    color: TX,
                    border: `1px solid ${BO}`,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {fmtShort(d)}
                </span>
              ))
            )}
          </div>
        )}
      </div>
    );
  };


return (
    <div className="pt-2 flex flex-col gap-3">
      {CATEGORY_ORDER.filter(
        (cat) =>
          (byCategory[cat] && byCategory[cat].length) || unnamedCounts[cat] > 0,
      ).map((cat) => {
        const entries = byCategory[cat] ?? [];
        const logged = entries.filter((e) => e.count > 0);
        const library = entries.filter((e) => e.count === 0);
        const unnamed = unnamedCounts[cat] || 0;

        return (
          <div key={cat}>
            {/* Category header */}
            <div
              className="flex items-center gap-2 mb-1.5 pb-1 border-b"
              style={{ borderColor: BO + "60" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: tc(cat),
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: TX }}
              >
                {categoryLabel(cat)}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: MU }}
              >
                · {entries.length}
                {entries.length === 1
                  ? ` ${t.exerciseSingular ?? "exercise"}`
                  : ` ${t.exercisesPlural ?? "exercises"}`}
              </span>
            </div>

            {/* Logged subsection (only show header if Library also exists) */}
            {logged.length > 0 && (
              <>
                {library.length > 0 && (
                  <div
                    className="text-[9px] font-bold tracking-wider uppercase mt-1 mb-1"
                    style={{ color: AD }}
                  >
                    {t.subsectionLogged ?? "Logged"}
                  </div>
                )}
                <div className="flex flex-col gap-1">
                  {logged.map(renderEntry)}
                </div>
              </>
            )}

            {/* Library subsection — saved but never logged */}
            {library.length > 0 && (
              <>
                <div
                  className="text-[9px] font-bold tracking-wider uppercase mt-2 mb-1"
                  style={{ color: MU }}
                >
                  {t.subsectionLibrary ?? "Library"}
                </div>
                <div className="flex flex-col gap-1">
                  {library.map(renderEntry)}
                </div>
              </>
            )}

            {/* Unnamed-entry footer */}
            {unnamed > 0 && (
              <div
                className="text-[10px] italic px-2.5 py-1 mt-1"
                style={{ color: MU }}
              >
                + {unnamed}{" "}
                {unnamed === 1
                  ? t.unnamedEntrySingular ?? "unnamed entry"
                  : t.unnamedEntryPlural ?? "unnamed entries"}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
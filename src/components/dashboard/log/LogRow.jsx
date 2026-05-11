"use client";
// Single day card in the log list.
//
// Three visual states:
//   • Collapsed (default) — date, mood/soreness dots, badge row, optional
//     note preview
//   • Milestone — gold banner across the top, gold border, gold accents
//   • Expanded — adds a detail block with full event labels, workouts list,
//     and metric stats
//
// Expanded state opens automatically when a TimelineScrubber jump targets
// this date.
import { useState, useEffect } from "react";
import { AD, AL, BG, BO, MU, SU, TX } from "../calendar/theme";
import { fmtDate, totalMinutes } from "../calendar/helpers";
import { tc } from "../calendar/constants";
import { MOOD_COLORS } from "./constants";
import { getCatalogItemName } from "@/lib/exerciseCatalog";

// Hardcoded — stays this blue regardless of theme, for visual consistency
// with the calendar's note SVG and chip colors.
const FOCUS_BLUE = "#4a7ab5";

// Milestone styling tokens — gold, used only when this card is a milestone
const GOLD = "#d4a017";
const GOLD_SOFT = "rgba(212, 160, 23, 0.08)";
const GOLD_BORDER = "rgba(212, 160, 23, 0.45)";

function ScoreDot({ val }) {
  if (val == null) return <span style={{ fontSize: 11, color: MU }}>—</span>;
  const idx = Math.max(0, Math.min(4, val - 1));
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: MOOD_COLORS[idx],
        }}
      />
      <span style={{ fontSize: 12, fontWeight: 700, color: AD }}>{val}</span>
    </div>
  );
}

// Inline detail block shown when card is expanded. Renders workouts grouped
// by category, then the 5 score chips (effort/mood/energy/sleep/soreness),
// then optional weight/waist/water/steps/stress.
function DetailBlock({ log, t }) {
  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  const categoryDurations = Array.isArray(log.categoryDurations)
    ? log.categoryDurations
    : [];

  // Group workouts by category
  const grouped = workouts.reduce((acc, w) => {
    const key = w.type || w.category || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(w);
    return acc;
  }, {});

  const categoryLabel = (type) => {
    if (!type) return "—";
    const k = "category" + type.charAt(0).toUpperCase() + type.slice(1);
    return t[k] ?? type;
  };

  const mins = totalMinutes(log);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Summary line */}
      <div
        style={{
          display: "flex",
          gap: 12,
          fontSize: 11,
          color: MU,
          fontWeight: 600,
        }}
      >
        {log.isRestDay ? (
          <span style={{ color: "#F97316", fontWeight: 700 }}>
            🛌 {t.restDay ?? "Rest day"}
          </span>
        ) : (
          <>
            <span>
              <strong style={{ color: TX }}>{workouts.length}</strong>{" "}
              {workouts.length === 1
                ? t.workoutSingular ?? "workout"
                : t.workouts ?? "workouts"}
            </span>
            {mins > 0 && (
              <span>
                <strong style={{ color: TX }}>{mins}</strong>{" "}
                {t.minutes ?? "min"}
              </span>
            )}
          </>
        )}
      </div>

      {/* Workouts grouped by category */}
      {!log.isRestDay && workouts.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {Object.entries(grouped).map(([cat, items]) => {
            const catDur =
              categoryDurations.find((c) => c.type === cat)?.durationMinutes ||
              0;
            return (
              <div
                key={cat}
                style={{
                  background: BG,
                  borderRadius: 8,
                  border: `1px solid ${BO}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "5px 10px",
                    background: tc(cat) + "11",
                    borderBottom: `1px solid ${BO}`,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: tc(cat),
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        color: TX,
                      }}
                    >
                      {categoryLabel(cat)}
                    </span>
                    <span
                      style={{ fontSize: 10, color: MU, fontWeight: 600 }}
                    >
                      · {items.length}
                    </span>
                  </div>
                  {catDur > 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: tc(cat),
                      }}
                    >
                      {catDur} {t.minutes ?? "min"}
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {items.map((w, i) => {
                    const setsReps =
                      w.sets && w.reps ? `${w.sets} × ${w.reps}` : null;
                    const weightStr = w.weight
                      ? `@ ${w.weight} ${t.kg ?? "kg"}`
                      : null;
                    const durStr = w.durationMinutes
                      ? `${w.durationMinutes} ${t.minutes ?? "min"}`
                      : null;
                    const detail = [setsReps, weightStr, durStr]
                      .filter(Boolean)
                      .join(" · ");
                    return (
                      <div
                        key={i}
                        style={{
                          padding: "4px 10px",
                          borderTop:
                            i === 0 ? "none" : `1px solid ${BO + "60"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: TX,
                          }}
                        >
                          {w.exerciseSlug
                            ? getCatalogItemName(w.exerciseSlug, t)
                            : w.exerciseName ||
                              w.name ||
                              categoryLabel(cat)}
                        </span>
                        {detail && (
                          <span
                            style={{ fontSize: 10, color: MU, fontWeight: 500 }}
                          >
                            {detail}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5 score chips */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 4,
        }}
      >
        {[
          { label: t.effort ?? "Effort", val: log.effort, icon: "⚡" },
          { label: t.mood ?? "Mood", val: log.mood, icon: "😊" },
          { label: t.energy ?? "Energy", val: log.energy, icon: "🔋" },
          { label: t.sleep ?? "Sleep", val: log.sleepQuality, icon: "💤" },
          { label: t.soreness ?? "Soreness", val: log.soreness, icon: "🔥" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: BG,
              border: `1px solid ${BO}`,
              borderRadius: 6,
              padding: "4px 2px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 11 }}>{s.icon}</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: s.val != null ? AD : MU,
                lineHeight: 1.1,
              }}
            >
              {s.val != null ? s.val : "—"}
            </div>
            <div
              style={{
                fontSize: 8,
                color: MU,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Optional extra stats */}
      {(log.weightKg != null ||
        log.waistCm != null ||
        log.waterGlasses != null ||
        log.steps != null ||
        log.stress != null) && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 11,
            color: MU,
          }}
        >
          {log.weightKg != null && (
            <span>
              <strong style={{ color: TX }}>{log.weightKg}</strong>{" "}
              {t.kg ?? "kg"}
            </span>
          )}
          {log.waistCm != null && (
            <span>
              <strong style={{ color: TX }}>{log.waistCm}</strong>{" "}
              {t.cm ?? "cm"}
            </span>
          )}
          {log.waterGlasses != null && (
            <span>💧 {log.waterGlasses}</span>
          )}
          {log.steps != null && <span>🚶 {log.steps}</span>}
          {log.stress != null && (
            <span>
              {t.stress ?? "Stress"} {log.stress}/5
            </span>
          )}
        </div>
      )}

      {/* Note (already shown in collapsed state, repeated here for clarity) */}
      {log.note?.trim() && (
        <div
          style={{
            background: AL,
            borderLeft: `3px solid ${FOCUS_BLUE}`,
            borderRadius: 6,
            padding: "8px 10px",
            fontSize: 12,
            fontStyle: "italic",
            color: TX,
            lineHeight: 1.4,
          }}
        >
          "{log.note.trim()}"
        </div>
      )}
    </div>
  );
}

export default function LogRow({ log, events, t, focusDate, includeNotes }) {
  const [open, setOpen] = useState(false);
  const ds = fmtDate(log.date ?? log.createdAt);

  const isFocused = focusDate === ds;
  useEffect(() => {
    if (isFocused) setOpen(true);
  }, [isFocused]);

  const milestoneEvent = events.find((e) => e.key === "milestone");
  const isMilestone = !!milestoneEvent;

  const moodIdx =
    log.mood != null ? Math.max(0, Math.min(4, log.mood - 1)) : null;
  const isRest = !!log.isRestDay;
  const stripeColor = isRest
    ? "#F97316"
    : moodIdx != null
      ? MOOD_COLORS[moodIdx]
      : "#94A3B8";

  // Build workout-type chips for the collapsed header (max 3)
  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  const typesShown = [];
  const seen = new Set();
  for (const w of workouts) {
    const tp = w.type || "other";
    if (seen.has(tp)) continue;
    seen.add(tp);
    typesShown.push(tp);
    if (typesShown.length >= 3) break;
  }
  const moreTypes = Math.max(0, new Set(workouts.map((w) => w.type || "other")).size - typesShown.length);

  const categoryLabel = (type) => {
    const k = "category" + type.charAt(0).toUpperCase() + type.slice(1);
    return t[k] ?? type;
  };

  return (
    <div
      data-date={ds}
      style={{
        background: isMilestone
          ? `linear-gradient(135deg, ${GOLD_SOFT}, transparent)`
          : SU,
        borderRadius: isMilestone ? 12 : 10,
        border: isMilestone
          ? `2px solid ${GOLD_BORDER}`
          : `1px solid ${isFocused ? FOCUS_BLUE : BO}`,
        overflow: "hidden",
        boxShadow: isMilestone
          ? "0 4px 14px rgba(212, 160, 23, 0.18), var(--shadow-card)"
          : "var(--shadow-card)",
        scrollMarginTop: 80,
        transition: "border-color .15s",
        position: "relative",
      }}
    >
      {/* Milestone banner */}
      {isMilestone && (
        <div
          style={{
            background: `linear-gradient(90deg, ${GOLD}, #e8b528)`,
            color: "#fff",
            padding: "5px 14px",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 1.2,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ fontSize: 12 }}>🎯</span>
          <span>{milestoneEvent.label}</span>
        </div>
      )}

      {/* Collapsed header */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: isMilestone ? "12px 14px" : "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        {/* Vertical color stripe */}
        <div
          style={{
            width: isMilestone ? 5 : 4,
            alignSelf: "stretch",
            borderRadius: 2,
            background: isMilestone ? GOLD : stripeColor,
            flexShrink: 0,
          }}
        />

        {/* Date */}
        <div
          style={{
            fontSize: isMilestone ? 13 : 12,
            fontWeight: isMilestone ? 800 : 700,
            color: isMilestone ? GOLD : AD,
            minWidth: isMilestone ? 100 : 90,
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {isMilestone && <span style={{ fontSize: 13 }}>★</span>}
          {ds}
        </div>

        {/* Mood + soreness dots */}
        <div style={{ display: "flex", gap: 14, flexShrink: 0 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.mood ?? "MOOD").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={log.mood} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: MU, fontWeight: 600 }}>
              {(t.soreness ?? "SORE").slice(0, 4).toUpperCase()}
            </div>
            <ScoreDot val={log.soreness} />
          </div>
        </div>

        {/* Badge strip — type chips + event icons (skip milestone, in banner) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            minWidth: 0,
          }}
        >
          {isRest && (
            <span
              style={{
                fontSize: 9,
                color: "#F97316",
                fontWeight: 700,
                background: "#F9731622",
                border: "1px solid #F9731644",
                borderRadius: 10,
                padding: "2px 7px",
              }}
            >
              🛌 {t.restDay ?? "Rest"}
            </span>
          )}
          {!isRest &&
            typesShown.map((tp) => (
              <span
                key={tp}
                style={{
                  fontSize: 9,
                  color: tc(tp),
                  fontWeight: 700,
                  textTransform: "capitalize",
                  background: tc(tp) + "18",
                  borderRadius: 10,
                  padding: "2px 7px",
                }}
              >
                {categoryLabel(tp)}
              </span>
            ))}
          {!isRest && moreTypes > 0 && (
            <span style={{ fontSize: 9, color: MU }}>+{moreTypes}</span>
          )}
          {events
            .filter((e) => e.key !== "milestone")
            .map((e) => (
              <span
                key={e.key}
                title={e.label}
                style={{
                  fontSize: 10,
                  background: e.color + "18",
                  border: `1px solid ${e.color}44`,
                  color: e.color,
                  borderRadius: 10,
                  padding: "1px 6px",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <span>{e.icon}</span>
              </span>
            ))}
        </div>

        <span style={{ fontSize: 10, color: MU, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Inline note preview when collapsed */}
      {!open && includeNotes && log.note?.trim() && (
        <div
          style={{
            padding: "0 14px 10px 32px",
            fontSize: 11,
            color: MU,
            fontStyle: "italic",
            lineHeight: 1.4,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          "{log.note.trim()}"
        </div>
      )}

      {/* Expanded body */}
      {open && (
        <div
          style={{
            padding: "0 14px 14px 14px",
            borderTop: `1px solid ${BG}`,
            marginTop: 4,
            paddingTop: 12,
          }}
        >
          {/* Full event labels (including milestone) */}
          {events.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginBottom: 12,
              }}
            >
              {events.map((e) => (
                <span
                  key={e.key}
                  style={{
                    fontSize: 10,
                    background: e.color + "18",
                    border: `1px solid ${e.color}44`,
                    color: e.color,
                    borderRadius: 12,
                    padding: "2px 9px",
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span>{e.icon}</span>
                  <span>{e.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Inline detail (no shared component used) */}
          <DetailBlock log={log} t={t} />
        </div>
      )}
    </div>
  );
}

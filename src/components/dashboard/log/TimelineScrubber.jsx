"use client";
// Day-strip showing every log as a colored bar — click to jump to that
// day's expanded card. Milestones get a 🎯 above; streak breaks get a ⚠
// below. Color: orange = rest, green/blue/yellow shades = training day
// (mood-tinted), grey = no mood data.
import { useMemo } from "react";
import { BO, MU, SU } from "../calendar/theme";
import { fmtDate } from "../calendar/helpers";
import { MOOD_COLORS } from "./constants";

const REST_COLOR = "#F97316"; // orange — visually distinct from training tints
const NO_DATA_COLOR = "#94A3B8";

export default function TimelineScrubber({ logs, ctx, onJump, t }) {
  const days = useMemo(() => {
    const sortedAsc = [...(logs ?? [])].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );
    return sortedAsc.map((log) => {
      const ds = fmtDate(log.date ?? log.createdAt);
      const isRest = !!log.isRestDay;
      const moodIdx =
        typeof log.mood === "number"
          ? Math.max(0, Math.min(4, log.mood - 1))
          : null;
      const color = isRest
        ? REST_COLOR
        : moodIdx != null
          ? MOOD_COLORS[moodIdx]
          : NO_DATA_COLOR;
      return {
        ds,
        color,
        hasMilestone: !!ctx.milestones[ds],
        hasStreakBreak: !!ctx.streakBreaks[ds],
        hasNote: !!log.note?.trim(),
      };
    });
  }, [logs, ctx]);

  if (days.length === 0) return null;

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: "12px 14px",
        marginBottom: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          fontSize: 9,
          color: MU,
          fontWeight: 700,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {t.timeline ?? "Timeline"}
      </div>
      <div style={{ display: "flex", gap: 1, overflow: "hidden" }}>
        {days.map((d) => (
          <button
            key={d.ds}
            onClick={() => onJump?.(d.ds)}
            title={`${d.ds}${d.hasMilestone ? " · 🎯" : ""}${d.hasStreakBreak ? " · ⚠" : ""}${d.hasNote ? " · 💬" : ""}`}
            style={{
              flex: 1,
              minWidth: 4,
              maxWidth: 12,
              height: 24,
              background: d.color,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              position: "relative",
              padding: 0,
            }}
          >
            {d.hasMilestone && (
              <span
                style={{
                  position: "absolute",
                  top: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 9,
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                🎯
              </span>
            )}
            {d.hasStreakBreak && (
              <span
                style={{
                  position: "absolute",
                  bottom: -10,
                  left: "50%",
                  transform: "translateX(-50%)",
                  fontSize: 9,
                  lineHeight: 1,
                  pointerEvents: "none",
                }}
              >
                ⚠
              </span>
            )}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 8,
          fontSize: 9,
          color: MU,
          flexWrap: "wrap",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: "#22C55E",
              borderRadius: 2,
            }}
          />
          {t.trainingShort ?? "Training"}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <span
            style={{
              width: 8,
              height: 8,
              background: REST_COLOR,
              borderRadius: 2,
            }}
          />
          {t.restShort ?? "Rest"}
        </span>
        <span>🎯 {t.milestone ?? "Milestone"}</span>
        <span>⚠ {t.streakBroken ?? "Streak broken"}</span>
      </div>
    </div>
  );
}

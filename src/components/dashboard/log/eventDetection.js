// Pure logic for the Coachly log page. No React — easy to test in isolation.
//
// Ported from recover's eventDetection.js, with semantic shifts for fitness:
//   • "Sober streak"           → "Logging streak" (consecutive days with ANY
//                                  log entry — workout OR rest day)
//   • "Relapse"                → "Streak broken" (gap of 2+ unlogged days
//                                  after a 7+ day logging streak)
//   • "Cravings" event         → "High soreness" (soreness ≥ 4)
//   • "Side effects" event     → "High effort" (effort ≥ 4)
//   • "Substances"             → workouts[] (presence determines training day)

import { fmtDate } from "../calendar/helpers";

// Milestone thresholds in days. Same as recover — these feel right across
// any "consistency" framing.
const MILESTONE_TARGETS = [7, 14, 30, 60, 90, 180, 365];

// Walk all log records (ascending date order) once, pre-computing:
//   • milestones[date]  = streak length achieved on that day (e.g. 7, 30…)
//   • streakBreaks[date] = length of streak that ended just before that day
//                          (only recorded for streaks ≥ 7 days)
//
// A "logging streak" = consecutive calendar days with ANY log entry.
// Both workout days and rest days count. The only way to break a streak
// is to miss days (no log at all).
//
// Per-record event computation later becomes a cheap lookup.
export function buildContext(allLogsAsc) {
  const milestones = {};
  const streakBreaks = {};

  let streak = 0;
  let prevDate = null;
  const milestonesHit = new Set();

  for (const log of allLogsAsc) {
    const ds = fmtDate(log.date ?? log.createdAt);
    if (!ds) continue;

    // Calendar gap from previous log (in days)
    let gap = 1;
    if (prevDate) {
      const a = new Date(prevDate);
      const b = new Date(ds);
      gap = Math.round((b - a) / 86400000);
    }

    if (gap === 1 || prevDate === null) {
      // Streak continues (or starts)
      streak++;
    } else if (gap > 1) {
      // Gap >= 2 days → streak broken
      if (streak >= 7) {
        streakBreaks[ds] = streak;
      }
      streak = 1;
      milestonesHit.clear();
    }

    // Did we just hit a milestone target?
    for (const target of MILESTONE_TARGETS) {
      if (streak === target && !milestonesHit.has(target)) {
        milestonesHit.add(target);
        milestones[ds] = target;
      }
    }

    prevDate = ds;
  }

  return { milestones, streakBreaks };
}

// Compute the array of event badges for a single log record.
// `recCtx` = { milestoneOn, milestoneLength, streakBreakOn, streakBreakAfter }
// already extracted from the global context for this specific date.
//
// Tagged props on the returned array:
//   ._isTraining  — true if this is a workout day (has workouts, not rest)
//   ._isRest      — true if isRestDay flag is set
export function computeEvents(log, recCtx, t) {
  const events = [];
  const ds = fmtDate(log.date ?? log.createdAt);

  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  const isRest = !!log.isRestDay;
  const isTraining = !isRest && workouts.length > 0;

  // Milestone (e.g. 30-day logging streak)
  if (recCtx.milestoneOn === ds) {
    events.push({
      key: "milestone",
      icon: "🎯",
      color: "#16A34A",
      label: `${recCtx.milestoneLength}-${t.daySingular ?? "day"} ${t.milestone ?? "milestone"}`,
    });
  }

  // Streak break (formerly "relapse")
  if (recCtx.streakBreakOn === ds) {
    events.push({
      key: "streakBreak",
      icon: "⚠",
      color: "#DC2626",
      label: `${t.streakBroken ?? "Streak broken"} (${recCtx.streakBreakAfter}d)`,
    });
  }

  // High soreness (formerly "high cravings")
  if (typeof log.soreness === "number" && log.soreness >= 4) {
    events.push({
      key: "highSoreness",
      icon: "🔥",
      color: "#FB923C",
      label: t.highSoreness ?? "High soreness",
    });
  }

  // High effort (formerly "side effects")
  if (typeof log.effort === "number" && log.effort >= 4) {
    events.push({
      key: "highEffort",
      icon: "⚡",
      color: "#7C3AED",
      label: t.highEffort ?? "High effort",
    });
  }

  // Has a note
  if (log.note?.trim()) {
    events.push({
      key: "note",
      icon: "💬",
      color: "#4a7ab5",
      label: t.note ?? "Note",
    });
  }

  // Tag training/rest status on the array itself for downstream filtering
  events._isTraining = isTraining;
  events._isRest = isRest;

  return events;
}

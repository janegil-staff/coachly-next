// Pure wellness score for the Coachly coach dashboard.
// No React — easy to unit-test independently.
//
// Inputs:
//   data = {
//     logs: [{date, workouts, isRestDay, mood, energy, soreness, ...}],
//     latestPss10?: {date, ...},   // optional — stress questionnaire
//     latestPsqi?: {date, ...},    // optional — sleep quality questionnaire
//   }
//   month = {y, m}
//   t = translation map (only needed for `latestVsTypical` labels)
//
// Output: { scoreNow, scorePrev, change, components, weakest,
//           daysSinceLog, latestVsTypical, latestInMonth }

import { isConsistencyDay } from "./helpers";

// ── Component score functions ──────────────────────────────────────────────

function consistencyScore(logs) {
  if (logs.length === 0) return null;
  const days = logs.filter(isConsistencyDay).length;
  const pct = (days / logs.length) * 100;
  // Streak bonus — up to +10 for a sustained workout-or-planned-rest streak
  // (caps at 14 days). Mirrors recover's sobriety streak bonus.
  let streak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    if (isConsistencyDay(logs[i])) streak++;
    else break;
  }
  const streakBonus = Math.min(streak / 14, 1) * 10;
  return Math.min(100, pct + streakBonus);
}

function sorenessScore(logs) {
  const vals = logs.map((l) => l.soreness).filter((v) => v != null);
  if (vals.length === 0) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  // Soreness 1 = best, 5 = worst → invert so high values produce low scores
  return Math.max(0, Math.min(100, ((5 - avg) / 4) * 100));
}

function moodEnergyScore(logs) {
  const moods = logs.map((l) => l.mood).filter((v) => v != null);
  const energies = logs.map((l) => l.energy).filter((v) => v != null);
  if (moods.length === 0 && energies.length === 0) return null;
  const moodAvg = moods.length
    ? moods.reduce((a, b) => a + b, 0) / moods.length
    : null;
  const energyAvg = energies.length
    ? energies.reduce((a, b) => a + b, 0) / energies.length
    : null;
  const combined = [moodAvg, energyAvg].filter((v) => v != null);
  const avg = combined.reduce((a, b) => a + b, 0) / combined.length;
  // Mood & energy are 1 = worst, 5 = best. Map directly.
  return Math.max(0, Math.min(100, ((avg - 1) / 4) * 100));
}

// Recovery score = combination of PSQI (sleep) and PSS-10 (stress).
// PSQI: 0-21, lower is better (good sleep = 0-5, problem ≥ 5)
// PSS-10: 0-40, lower is better
// Each scaled to 0-100 (higher = better recovery) and averaged.
function recoveryScore(data, windowEnd) {
  const psqi = data.latestPsqi;
  const pss10 = data.latestPss10;
  const cutoff = new Date(windowEnd);
  cutoff.setDate(cutoff.getDate() - 90);
  const isRecent = (q) => {
    if (!q || !q.date) return false;
    const d = new Date(q.date);
    return d >= cutoff && d <= windowEnd;
  };

  const psqiScore = isRecent(psqi) ? sumNumbers(psqi) : null;
  const pss10Score = isRecent(pss10) ? sumNumbers(pss10) : null;

  if (psqiScore == null && pss10Score == null) return null;
  const parts = [];
  if (psqiScore != null) parts.push(((21 - psqiScore) / 21) * 100);
  if (pss10Score != null) parts.push(((40 - pss10Score) / 40) * 100);
  return Math.max(
    0,
    Math.min(100, parts.reduce((a, b) => a + b, 0) / parts.length),
  );
}

function sumNumbers(obj) {
  return Object.values(obj).reduce(
    (a, b) => (typeof b === "number" ? a + b : a),
    0,
  );
}

function engagementScore(logs, windowDays) {
  // Same pattern as recover: caller passes elapsed-days for the in-progress
  // month so a fully-logged current month doesn't score as if half the
  // days were missing.
  if (windowDays <= 0) return null;
  const pct = (logs.length / windowDays) * 100;
  return Math.max(0, Math.min(100, pct));
}

// ── Main entry ─────────────────────────────────────────────────────────────

export function calculateWellness(data, month, t) {
  const allLogs = data?.logs ?? [];
  if (allLogs.length === 0) return null;

  const sorted = [...allLogs].sort((a, b) =>
    String(a.date ?? a.createdAt).localeCompare(String(b.date ?? b.createdAt)),
  );

  const { y, m } = month;
  const monthStart = new Date(y, m, 1);
  const monthEnd = new Date(y, m + 1, 0, 23, 59, 59);
  const prevStart = new Date(y, m - 1, 1);
  const prevEnd = new Date(y, m, 0, 23, 59, 59);

  // Partial-month engagement: elapsed-days for current month, full length otherwise
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === y && today.getMonth() === m;
  const monthDays = isCurrentMonth ? today.getDate() : monthEnd.getDate();
  const prevDays = prevEnd.getDate();

  const inWindow = (r, from, to) => {
    const d = new Date(r.date ?? r.createdAt);
    return d >= from && d <= to;
  };

  const logsNow = sorted.filter((r) => inWindow(r, monthStart, monthEnd));
  const logsPrev = sorted.filter((r) => inWindow(r, prevStart, prevEnd));

  // Component scores with weights — sum to 1.0
  const components = {
    consistency: {
      weight: 0.3,
      now: consistencyScore(logsNow),
      prev: consistencyScore(logsPrev),
    },
    recovery: {
      weight: 0.25,
      now: recoveryScore(data, monthEnd),
      prev: recoveryScore(data, prevEnd),
    },
    moodEnergy: {
      weight: 0.2,
      now: moodEnergyScore(logsNow),
      prev: moodEnergyScore(logsPrev),
    },
    soreness: {
      weight: 0.15,
      now: sorenessScore(logsNow),
      prev: sorenessScore(logsPrev),
    },
    engagement: {
      weight: 0.1,
      now: engagementScore(logsNow, monthDays),
      prev: engagementScore(logsPrev, prevDays),
    },
  };

  // Weighted average over present (non-null) components
  function weightedAvg(getter) {
    const present = Object.entries(components).filter(
      ([, c]) => getter(c) != null,
    );
    if (present.length === 0) return null;
    const totalWeight = present.reduce((s, [, c]) => s + c.weight, 0);
    const weighted = present.reduce((s, [, c]) => s + getter(c) * c.weight, 0);
    return weighted / totalWeight;
  }

  const scoreNow = weightedAvg((c) => c.now);
  const scorePrev = weightedAvg((c) => c.prev);
  const change =
    scoreNow != null && scorePrev != null ? scoreNow - scorePrev : null;
  const presentComponents = Object.entries(components)
    .filter(([, c]) => c.now != null)
    .sort(([, a], [, b]) => a.now - b.now);
  const weakest = presentComponents[0] ?? null;

  // Last-log info
  const latestInMonth = logsNow.length ? logsNow[logsNow.length - 1] : null;
  const latestEver = sorted.length ? sorted[sorted.length - 1] : null;
  const latest = latestInMonth ?? latestEver;

  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const latestDate = latest ? new Date(latest.date ?? latest.createdAt) : null;
  if (latestDate) latestDate.setHours(0, 0, 0, 0);
  const daysSinceLog = latestDate
    ? Math.max(0, Math.round((todayMidnight - latestDate) / 86400000))
    : null;

  // Latest log vs typical (compared to baseline = all OTHER logs)
  const baseline = sorted.filter((r) => r !== latest);
  const avg = (key) => {
    const v = baseline.map((r) => r[key]).filter((x) => x != null);
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const latestVsTypical =
    latest && baseline.length > 0
      ? [
          {
            key: "mood",
            label: t.mood ?? "Mood",
            today: latest.mood,
            avg: avg("mood"),
            higherIsBetter: true,
            scale: 5,
          },
          {
            key: "energy",
            label: t.energy ?? "Energy",
            today: latest.energy,
            avg: avg("energy"),
            higherIsBetter: true,
            scale: 5,
          },
          {
            key: "soreness",
            label: t.soreness ?? "Soreness",
            today: latest.soreness,
            avg: avg("soreness"),
            higherIsBetter: false,
            scale: 5,
          },
        ].filter((m) => m.today != null && m.avg != null)
      : [];

  return {
    scoreNow,
    scorePrev,
    change,
    components,
    weakest,
    daysSinceLog,
    latestVsTypical,
    latestInMonth,
  };
}

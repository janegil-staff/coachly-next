// Small pure utilities used across the dashboard.

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

export function daysInMonth(y, m) {
  return new Date(y, m + 1, 0).getDate();
}

export function firstDow(y, m) {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

// Total session minutes for a log. Prefers categoryDurations (authoritative
// post schema-migration), falls back to per-workout duration.
export function totalMinutes(log) {
  if (!log) return 0;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length) return cd.reduce((s, c) => s + (c.durationMinutes || 0), 0);
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  return ws.reduce((s, w) => s + (w.durationMinutes || 0), 0);
}

// "Consistency day" — did the client show up in a way that counts toward
// their training plan?
//   • Workout day  (workouts.length > 0)         → ✓ consistent
//   • Planned rest (isRestDay === true)          → ✓ consistent
//   • Logged-but-nothing-happened                → ✗ not consistent
//   • No log at all                              → not even counted (no record)
export function isConsistencyDay(log) {
  if (!log) return false;
  if (log.isRestDay) return true;
  return Array.isArray(log.workouts) && log.workouts.length > 0;
}

// 0-100 score → 1-5 bucket
export function bucketOf(score) {
  if (score == null) return null;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

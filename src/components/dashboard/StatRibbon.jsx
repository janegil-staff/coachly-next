"use client";

// Stat ribbon — six compact cards summarising the share window stats.
// Sits below the calendar grid, above MonthlySummary or alongside it.
// Reads from data.stats (server-aggregated), data.scores (for trend), and
// data.latestGoals (for the goals tile).

const A   = "#4A7AB5";
const AD  = "#2D4A6E";
const SU  = "#FFFFFF";
const BO  = "#D0DCEA";
const TX  = "#1A2C3D";
const MU  = "#7A9AB8";
const OK  = "#22C55E";
const WARN = "#F59E0B";
const DANGER = "#EF4444";

const GOALS_STATUS_COLORS = {
  stalled:  DANGER,
  drifting: WARN,
  ontrack:  A,
  strong:   OK,
};

// Small card primitive used by every tile.
function Tile({ label, value, sub, accentColor, children }) {
  return (
    <div
      className="rounded-2xl border shadow-sm p-3 flex flex-col justify-between"
      style={{ background: SU, borderColor: BO, minHeight: 96 }}
    >
      <div
        className="text-[9px] font-bold tracking-widest uppercase"
        style={{ color: MU }}
      >
        {label}
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span
          className="text-2xl font-black leading-none"
          style={{ color: accentColor ?? AD }}
        >
          {value}
        </span>
        {children}
      </div>

      {sub && (
        <div className="text-[10px] mt-1" style={{ color: MU }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function trendDelta(scores) {
  if (!Array.isArray(scores) || scores.length < 2) return null;
  // Scores are date-ordered ascending in the payload, but be defensive.
  const sorted = [...scores].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "")
  );
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  if (last?.compositeScore == null || prev?.compositeScore == null) return null;
  return last.compositeScore - prev.compositeScore;
}

function categoryLabel(name, t) {
  if (!name) return "—";
  const key = "category" + name.charAt(0).toUpperCase() + name.slice(1);
  return t[key] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

export default function StatRibbon({ data, t }) {
  if (!data) return null;

  const stats = data.stats ?? {};
  const scores = Array.isArray(data.scores) ? data.scores : [];
  const goals = data.latestGoals ?? null;

  // ── Tile 1: Composite score (latest + trend arrow) ──────────────────
  const sortedScores = [...scores].sort((a, b) =>
    (a.date ?? "").localeCompare(b.date ?? "")
  );
  const latestComposite = sortedScores.length
    ? sortedScores[sortedScores.length - 1].compositeScore
    : null;
  const delta = trendDelta(scores);
  const deltaArrow =
    delta == null ? null
    : delta > 0  ? `↗ +${delta}`
    : delta < 0  ? `↘ ${delta}`
    :              `→ ±0`;
  const deltaColor =
    delta == null || delta === 0 ? MU
    : delta > 0  ? OK
    :              DANGER;

  // ── Tile 2: Streak (latest streakDay) ───────────────────────────────
  const latestStreak = sortedScores.length
    ? sortedScores[sortedScores.length - 1].streakDay ?? 0
    : 0;
  const streakSub = latestStreak >= 7
    ? (t.streakStrong ?? "🔥 On fire")
    : latestStreak >= 3
    ? (t.streakBuilding ?? "Building")
    : (t.streakStarting ?? "Just starting");

  // ── Tile 3 + 4: Sessions / Hours from stats.* ───────────────────────
  const sessionsLogged = stats.sessionsLogged ?? 0;
  const totalHours = ((stats.totalMinutes ?? 0) / 60).toFixed(1);

  // Window subtitle e.g. "Feb 5 – May 6" if windowStart/End are present
  const windowSub = (() => {
    if (!stats.windowStart || !stats.windowEnd) return null;
    const fmt = (s) => {
      const d = new Date(s);
      return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    };
    return `${fmt(stats.windowStart)} – ${fmt(stats.windowEnd)}`;
  })();

  // ── Tile 5: Top workout type + percentage ───────────────────────────
  const top = stats.topWorkoutType ?? null;
  const topPct = (() => {
    if (!top || !stats.totalWorkouts) return null;
    // Count occurrences across all logs to compute percentage.
    let count = 0;
    (data.logs ?? []).forEach((l) => {
      (l.workouts ?? []).forEach((w) => {
        if ((w.type || "").toLowerCase() === top.toLowerCase()) count++;
      });
    });
    if (!count) return null;
    return Math.round((count / stats.totalWorkouts) * 100);
  })();

  // ── Tile 6: Goals (latest avg + status pill) ────────────────────────
  const goalsAvg = goals?.scores?.avg ?? null;
  const goalsStatus = goals?.scores?.status ?? null;
  const goalsColor = GOALS_STATUS_COLORS[goalsStatus] ?? A;
  const goalsStatusLabel = goalsStatus
    ? (t["goalsStatus_" + goalsStatus] ?? goalsStatus)
    : null;

  return (
    <div
      className="grid gap-3 mt-4"
      style={{
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      }}
    >
      {/* Composite */}
      <Tile
        label={t.composite ?? "Composite"}
        value={latestComposite != null ? latestComposite : "—"}
        sub={deltaArrow ? <span style={{ color: deltaColor, fontWeight: 700 }}>{deltaArrow}</span> : null}
      >
        {latestComposite != null && (
          <span className="text-xs font-bold" style={{ color: MU }}>
            /100
          </span>
        )}
      </Tile>

      {/* Streak */}
      <Tile
        label={t.streak ?? "Streak"}
        value={latestStreak}
        sub={streakSub}
      >
        <span className="text-xs font-bold" style={{ color: MU }}>
          {latestStreak === 1 ? (t.day ?? "day") : (t.days ?? "days")}
        </span>
      </Tile>

      {/* Sessions */}
      <Tile
        label={t.sessions ?? "Sessions"}
        value={sessionsLogged}
        sub={windowSub}
      />

      {/* Hours */}
      <Tile
        label={t.totalHours ?? "Total hours"}
        value={totalHours}
        sub={windowSub}
      >
        <span className="text-xs font-bold" style={{ color: MU }}>
          h
        </span>
      </Tile>

      {/* Top workout type */}
      <Tile
        label={t.topType ?? "Top type"}
        value={top ? categoryLabel(top, t) : "—"}
        sub={topPct != null ? `${topPct}% ${t.ofWorkouts ?? "of workouts"}` : null}
        accentColor={A}
      />

      {/* Goals */}
      <Tile
        label={t.goalsTitle ?? "Goals"}
        value={goalsAvg != null ? goalsAvg : "—"}
        accentColor={goalsColor}
        sub={
          goalsStatusLabel ? (
            <span
              className="px-1.5 py-0.5 rounded text-[9px] font-bold"
              style={{ background: goalsColor + "22", color: goalsColor }}
            >
              {goalsStatusLabel.toUpperCase()}
            </span>
          ) : null
        }
      >
        {goalsAvg != null && (
          <span className="text-xs font-bold" style={{ color: MU }}>
            /5
          </span>
        )}
      </Tile>
    </div>
  );
}
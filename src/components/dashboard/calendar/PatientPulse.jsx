"use client";
// Coach-facing "pulse" — a short clinical summary card.
//   • Tier headline ("Improving" / "Stable" / "Worsening")
//   • 3-5 colored delta chips (consistency, soreness, mood, etc.)
//   • Talking points the coach can raise with the client
//
// Compares last 30 days vs prior 30 days.
import { BO, MU, SU, TX } from "./theme";
import { isConsistencyDay } from "./helpers";

const TIER_COLORS = {
  improving: "#16A34A",
  stable: "#7AABDB",
  worsening: "#FB923C",
  critical: "#DC2626",
};

function avg(arr, key) {
  const v = arr.map((r) => r[key]).filter((x) => x != null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
}

function consistencyRate(arr) {
  if (arr.length === 0) return null;
  return (arr.filter(isConsistencyDay).length / arr.length) * 100;
}

function pickTier(deltas) {
  // Count green/red signals
  let net = 0;
  deltas.forEach((d) => {
    if (d.direction === "up") net++;
    if (d.direction === "down") net--;
  });
  if (net >= 2) return "improving";
  if (net <= -2) return "worsening";
  if (deltas.some((d) => d.direction === "down" && Math.abs(d.delta) > 25))
    return "critical";
  return "stable";
}

function buildDelta(label, now, prev, higherIsBetter, formatter) {
  if (now == null || prev == null) return null;
  const delta = now - prev;
  const goodDirection = higherIsBetter ? delta > 0 : delta < 0;
  const isFlat = Math.abs(delta) < (higherIsBetter ? 0.2 : 0.2);
  return {
    label,
    delta,
    direction: isFlat ? "flat" : goodDirection ? "up" : "down",
    color: isFlat ? MU : goodDirection ? "#16A34A" : "#DC2626",
    text: formatter ? formatter(now, delta) : `${now.toFixed(1)}`,
    arrow: isFlat ? "→" : delta > 0 ? "↑" : "↓",
  };
}

export default function PatientPulse({ data, t }) {
  const logs = data?.logs ?? [];
  if (logs.length < 5) return null;

  const today = new Date();
  const cutoff30 = new Date(today);
  cutoff30.setDate(today.getDate() - 30);
  const cutoff60 = new Date(today);
  cutoff60.setDate(today.getDate() - 60);

  const inWindow = (r, from, to) => {
    const d = new Date(r.date ?? r.createdAt);
    return d >= from && d <= to;
  };

  const recent = logs.filter((l) => inWindow(l, cutoff30, today));
  const prior = logs.filter((l) => inWindow(l, cutoff60, cutoff30));

  if (recent.length < 3 || prior.length < 3) return null;

  const deltas = [
    buildDelta(
      t.compConsistency ?? "Consistency",
      consistencyRate(recent),
      consistencyRate(prior),
      true,
      (now, delta) => `${Math.round(now)}% (${delta >= 0 ? "+" : ""}${Math.round(delta)}%)`,
    ),
    buildDelta(
      t.mood ?? "Mood",
      avg(recent, "mood"),
      avg(prior, "mood"),
      true,
      (now, delta) => `${now.toFixed(1)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`,
    ),
    buildDelta(
      t.energy ?? "Energy",
      avg(recent, "energy"),
      avg(prior, "energy"),
      true,
      (now, delta) => `${now.toFixed(1)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`,
    ),
    buildDelta(
      t.soreness ?? "Soreness",
      avg(recent, "soreness"),
      avg(prior, "soreness"),
      false, // lower soreness is better
      (now, delta) => `${now.toFixed(1)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`,
    ),
    buildDelta(
      t.sleep ?? "Sleep",
      avg(recent, "sleepQuality"),
      avg(prior, "sleepQuality"),
      true,
      (now, delta) => `${now.toFixed(1)} (${delta >= 0 ? "+" : ""}${delta.toFixed(1)})`,
    ),
  ].filter(Boolean);

  if (deltas.length === 0) return null;

  const tier = pickTier(deltas);
  const tierColor = TIER_COLORS[tier];
  const tierLabel =
    tier === "improving"
      ? (t.pulseImproving ?? "Client improving")
      : tier === "worsening"
        ? (t.pulseWorsening ?? "Client worsening")
        : tier === "critical"
          ? (t.pulseCritical ?? "Needs attention")
          : (t.pulseStable ?? "Client stable");

  // Talking points
  const talkingPoints = [];

  // Stale log check
  const sortedDesc = [...logs].sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );
  const latest = sortedDesc[0];
  if (latest) {
    const latestDate = new Date(latest.date);
    const daysSince = Math.round((today - latestDate) / 86400000);
    if (daysSince > 3) {
      talkingPoints.push(
        `${t.pulseStaleLog ?? "Hasn't logged in"} ${daysSince} ${t.daysPlural ?? "days"} — ${t.pulseCheckIn ?? "consider check-in"}`,
      );
    }
  }

  // Big consistency drop
  const consistencyDelta = deltas.find((d) =>
    d.label.toLowerCase().includes((t.compConsistency ?? "consistency").toLowerCase()),
  );
  if (consistencyDelta && consistencyDelta.delta < -20) {
    talkingPoints.push(
      t.pulseConsistencyDrop ?? "Significant drop in consistency — likely needs support",
    );
  }

  // Sustained high soreness
  const recentSoreness = recent.map((l) => l.soreness).filter((v) => v != null);
  if (
    recentSoreness.length >= 5 &&
    recentSoreness.filter((v) => v >= 4).length / recentSoreness.length >= 0.5
  ) {
    talkingPoints.push(
      t.pulseHighSoreness ?? "Elevated soreness sustained — review intensity/recovery",
    );
  }

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: "14px 16px",
        marginBottom: 16,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 10,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {t.patientPulse ?? "Client pulse"}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: tierColor,
          }}
        >
          {tierLabel}
        </div>
      </div>

      {/* Delta chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          marginBottom: talkingPoints.length > 0 ? 12 : 0,
        }}
      >
        {deltas.map((d) => (
          <div
            key={d.label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 8px",
              borderRadius: 6,
              background: "var(--bg)",
              border: `1px solid ${BO}`,
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            <span style={{ color: MU, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {d.label}
            </span>
            <span style={{ color: d.color, fontVariantNumeric: "tabular-nums" }}>
              {d.arrow} {d.text}
            </span>
          </div>
        ))}
      </div>

      {/* Talking points */}
      {talkingPoints.length > 0 && (
        <div
          style={{
            borderTop: `1px solid var(--bg)`,
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
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
            {t.talkingPoints ?? "Talking points"}
          </div>
          {talkingPoints.map((p, i) => (
            <div
              key={i}
              style={{
                fontSize: 11,
                color: TX,
                display: "flex",
                gap: 6,
                alignItems: "flex-start",
              }}
            >
              <span style={{ color: tierColor, flexShrink: 0 }}>•</span>
              <span>{p}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

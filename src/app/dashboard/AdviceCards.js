// src/components/AdviceCards.js
//
// Coach view of advice tips. Shows all tips the client has marked relevant
// for themselves, with a viewed indicator on tips they've already opened
// in the mobile app.
//
// Reads from:
//   relevantAdvice  — array of advice IDs the client said are relevant
//   viewedAdvice    — array of advice IDs the client has already opened
//
// Translations from t.advice_<id>_title and t.advice_<id>_body take
// priority. If a key is missing, falls back to the built-in English
// content below — so the dashboard always shows real text, never raw
// IDs like "t1".
//
// Click a headline to expand its body. Click again to collapse.

"use client";

import { useState, useMemo } from "react";

const A = "var(--accent)",
  AD = "var(--accent-strong)",
  BG = "var(--bg)",
  SU = "var(--card)",
  BO = "var(--card-border)",
  TX = "var(--text)",
  MU = "var(--text-muted)",
  OK = "var(--ok)";
  
const CATEGORY_META = {
  training: { color: "#4A7AB5", icon: "🏋" },
  recovery: { color: "#22C55E", icon: "🌿" },
  nutrition: { color: "#F59E0B", icon: "🍎" },
  sleep: { color: "#A855F7", icon: "🌙" },
  mindset: { color: "#06B6D4", icon: "💡" },
  motivation: { color: "#EF4444", icon: "🔥" },
};

// Mirror of mobile's ADVICE_KEYS — must stay in sync.
// `title` and `body` are English fallbacks shown when translations are missing.
const ADVICE_LIBRARY = [
  // ── Training ───────────────────────────────────────────────────
  {
    id: "t1",
    category: "training",
    title: "Progressive overload is the key",
    body:
      "Muscles adapt to stress. Small, steady increases in weight, reps, or " +
      "time-under-tension drive real progress. Add a little each week — your " +
      "body will follow.",
  },
  {
    id: "t2",
    category: "training",
    title: "Master the basics first",
    body:
      "Squat, hinge, push, pull, carry. Most progress comes from doing a few " +
      "fundamental movements very well. Drill clean technique before chasing " +
      "fancier variations.",
  },
  {
    id: "t3",
    category: "training",
    title: "Train with a clear plan",
    body:
      "Random workouts give random results. A simple plan with target sets, " +
      "reps, and progression beats motivation-driven sessions over the long " +
      "run.",
  },

  // ── Recovery ───────────────────────────────────────────────────
  {
    id: "r1",
    category: "recovery",
    title: "Recovery is when you grow",
    body:
      "Training is the stimulus, recovery is the adaptation. Schedule at " +
      "least one full rest day per week, and treat it as part of the program " +
      "— not a missed workout.",
  },
  {
    id: "r2",
    category: "recovery",
    title: "Listen to your body",
    body:
      "Persistent soreness, low energy, or poor mood across several days is " +
      "feedback. Pull back the intensity for a few sessions before pushing " +
      "again.",
  },
  {
    id: "r3",
    category: "recovery",
    title: "Move on rest days",
    body:
      "Light walking, easy mobility, or gentle stretching helps recovery " +
      "more than complete inactivity. Keep blood flowing without adding " +
      "training stress.",
  },

  // ── Nutrition ──────────────────────────────────────────────────
  {
    id: "n1",
    category: "nutrition",
    title: "Protein supports adaptation",
    body:
      "Aim for a protein source at every meal. Roughly 1.6–2.0 g per kg of " +
      "body weight per day supports recovery and muscle building during " +
      "structured training.",
  },
  {
    id: "n2",
    category: "nutrition",
    title: "Eat enough to train",
    body:
      "Under-fueling causes low energy, poor sleep, and stalled progress. If " +
      "performance and recovery are slipping, food intake is often the first " +
      "thing to check.",
  },
  {
    id: "n3",
    category: "nutrition",
    title: "Hydrate consistently",
    body:
      "Dehydration drops performance before you feel thirsty. Sip water " +
      "throughout the day, not just around workouts. Pale yellow urine is a " +
      "good rough check.",
  },

  // ── Sleep ──────────────────────────────────────────────────────
  {
    id: "s1",
    category: "sleep",
    title: "Sleep is the strongest recovery tool",
    body:
      "Most adults need 7–9 hours. Hormones that drive recovery, mood, and " +
      "appetite all depend on it. Protect bedtime like you would a training " +
      "session.",
  },
  {
    id: "s2",
    category: "sleep",
    title: "Build a wind-down routine",
    body:
      "Dim lights an hour before bed, put screens away, keep the room cool. " +
      "A consistent routine signals the body it's time to switch off and " +
      "improves sleep quality over time.",
  },
  {
    id: "s3",
    category: "sleep",
    title: "Same time every day",
    body:
      "A regular sleep and wake time — even on weekends — stabilises your " +
      "body clock and makes both falling asleep and waking up easier.",
  },

  // ── Mindset ────────────────────────────────────────────────────
  {
    id: "m1",
    category: "mindset",
    title: "Show up on the hard days",
    body:
      "The sessions you do when you don't feel like it matter most. " +
      "Consistency over months beats intensity over weeks. Aim for " +
      "good-enough, not perfect.",
  },
  {
    id: "m2",
    category: "mindset",
    title: "Track what matters",
    body:
      "What gets measured gets managed. A simple log of sessions, sleep, " +
      "and mood reveals patterns and gives your coach real context to work " +
      "with.",
  },
  {
    id: "m3",
    category: "mindset",
    title: "Set process goals, not just outcomes",
    body:
      "Outcomes (lose 5 kg, run a 5k) are the direction. Process goals (3 " +
      "sessions per week, 7 hours sleep) are what you actually control. " +
      "Focus there.",
  },

  // ── Motivation ─────────────────────────────────────────────────
  {
    id: "v1",
    category: "motivation",
    title: "Make it easy to start",
    body:
      "Lower the activation cost. Lay out gym clothes the night before, " +
      "block the time on the calendar, keep equipment visible. Decision " +
      "fatigue kills consistency.",
  },
  {
    id: "v2",
    category: "motivation",
    title: "Don't break the chain",
    body:
      "Streaks build identity. After two missed sessions, the third one " +
      "becomes much easier to skip. If you slip, restart the same day or " +
      "the next — never wait for Monday.",
  },
  {
    id: "v3",
    category: "motivation",
    title: "Find your why",
    body:
      "Surface motivation fades. A clear, personal reason — health for " +
      "your kids, energy at work, feeling good in your body — is what " +
      "carries you through the dips.",
  },
];

const ADVICE_BY_ID = Object.fromEntries(ADVICE_LIBRARY.map((a) => [a.id, a]));

export default function AdviceCards({ relevantAdvice, viewedAdvice, t }) {
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Show all relevant tips with a viewed flag — matches mobile behavior.
  const items = useMemo(() => {
    const relevant = Array.isArray(relevantAdvice) ? relevantAdvice : [];
    const viewed = new Set(Array.isArray(viewedAdvice) ? viewedAdvice : []);
    return relevant
      .map((id) => {
        const meta = ADVICE_BY_ID[id];
        if (!meta) return null;
        return {
          id,
          category: meta.category,
          title: t["advice_" + id + "_title"] ?? meta.title,
          body: t["advice_" + id + "_body"] ?? meta.body,
          viewed: viewed.has(id),
        };
      })
      .filter(Boolean);
  }, [relevantAdvice, viewedAdvice, t]);

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl border shadow-sm p-4"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="text-[10px] font-bold tracking-widest uppercase mb-2"
          style={{ color: A }}
        >
          {t.adviceTitle ?? "Relevant tips"}
        </div>
        <div className="text-xs" style={{ color: MU }}>
          {t.adviceEmpty ?? "No tips marked relevant yet."}
        </div>
      </div>
    );
  }

  const viewedCount = items.filter((i) => i.viewed).length;

  return (
    <div
      className="rounded-2xl border shadow-sm p-4"
      style={{ background: SU, borderColor: BO }}
    >
      <div
        className="text-[10px] font-bold tracking-widest uppercase mb-1"
        style={{ color: A }}
      >
        {t.adviceTitle ?? "Relevant tips"}
      </div>
      <div className="text-[11px] mb-3" style={{ color: MU }}>
        {(t.adviceSubtitle ?? "{viewed} of {total} viewed")
          .replace("{viewed}", viewedCount)
          .replace("{total}", items.length)}
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const meta = CATEGORY_META[item.category] ?? CATEGORY_META.training;
          const isOpen = expanded.has(item.id);

          return (
            <div
              key={item.id}
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: BO }}
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left"
                style={{ background: "transparent" }}
              >
                <span className="flex-shrink-0 text-sm">{meta.icon}</span>
                <span
                  className="flex-1 text-xs font-bold"
                  style={{ color: meta.color }}
                >
                  {item.title}
                </span>
                {item.viewed && (
                  <span
                    className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded"
                    style={{
                      color: OK,
                      background: OK + "18",
                      letterSpacing: "0.05em",
                    }}
                    title={t.adviceRelevant ?? "Marked relevant by client"}
                  >
                    ✓ {t.adviceRelevantShort ?? "RELEVANT"}
                  </span>
                )}
                <span
                  className="flex-shrink-0 text-[10px] transition-transform"
                  style={{
                    color: MU,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {isOpen && item.body ? (
                <div
                  className="px-3 pb-3 pt-1 text-xs leading-relaxed border-t"
                  style={{ color: TX, borderColor: BO + "80" }}
                >
                  {item.body}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

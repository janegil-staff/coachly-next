"use client";

// src/components/dashboard/QuestionnaireCard.jsx
//
// Coach dashboard card for the three new questionnaires (PSS-10, PSQI, IPAQ).
// Visual style matches GoalsCard: rounded outer card with title in uppercase
// tracking-wide, score on the left, status chip on the right, "Read more →"
// button at the bottom that opens a detail modal showing all answers.

import { useState } from "react";

const A  = "#4A7AB5";
const AD = "#2D4A6E";
const SU = "#FFFFFF";
const BO = "#D0DCEA";
const TX = "#1A2C3D";
const MU = "#7A9AB8";
const BG = "#EEF2F7";

// ── Type-specific config ────────────────────────────────────────────────
const TYPES = {
  pss10: {
    titleKey: "pss10_title",
    fallbackTitle: "Stress check-in",
    scoreLabelKey: "pss10_score",
    fallbackScoreLabel: "Score",
    max: 40,
    colors: {
      pss10_resultLow:      "#22C55E",
      pss10_resultModerate: "#F59E0B",
      pss10_resultHigh:     "#EF4444",
    },
    questions: [
      ["pss10_q1",  "How often have you been upset because of something that happened unexpectedly?"],
      ["pss10_q2",  "How often have you felt that you were unable to control the important things in your life?"],
      ["pss10_q3",  "How often have you felt nervous and stressed?"],
      ["pss10_q4",  "How often have you felt confident about your ability to handle your personal problems?"],
      ["pss10_q5",  "How often have you felt that things were going your way?"],
      ["pss10_q6",  "How often have you found that you could not cope with all the things that you had to do?"],
      ["pss10_q7",  "How often have you been able to control irritations in your life?"],
      ["pss10_q8",  "How often have you felt that you were on top of things?"],
      ["pss10_q9",  "How often have you been angered because of things that were outside of your control?"],
      ["pss10_q10", "How often have you felt difficulties were piling up so high that you could not overcome them?"],
    ],
    optionsKeyPrefix: "pss10_opt", // pss10_opt0 ... pss10_opt4
    optionRange: [0, 1, 2, 3, 4],
  },
  psqi: {
    titleKey: "psqi_title",
    fallbackTitle: "Sleep quality",
    scoreLabelKey: "psqi_score",
    fallbackScoreLabel: "Score",
    max: 21,
    colors: {
      psqi_resultGood: "#22C55E",
      psqi_resultPoor: "#EF4444",
    },
    // PSQI is too complex for inline question rendering — show a simpler summary
    questions: null,
  },
  ipaq: {
    titleKey: "ipaq_title",
    fallbackTitle: "Activity check-in",
    scoreLabelKey: "ipaq_metMinutes",
    fallbackScoreLabel: "MET-minutes/week",
    max: null,
    colors: {
      ipaq_resultLow:      "#EF4444",
      ipaq_resultModerate: "#F59E0B",
      ipaq_resultHigh:     "#22C55E",
    },
    // IPAQ has 7 numeric inputs — show as a list in the detail modal
    questions: [
      ["ipaq_q1", "On how many days did you do vigorous physical activities?"],
      ["ipaq_q2", "How much time did you usually spend doing vigorous activities on one of those days?"],
      ["ipaq_q3", "On how many days did you do moderate physical activities?"],
      ["ipaq_q4", "How much time did you usually spend doing moderate activities on one of those days?"],
      ["ipaq_q5", "On how many days did you walk for at least 10 minutes at a time?"],
      ["ipaq_q6", "How much time did you usually spend walking on one of those days?"],
      ["ipaq_q7", "How much time did you usually spend sitting on a weekday?"],
    ],
  },
};

// ── Detail modal ────────────────────────────────────────────────────────
function DetailModal({ type, data, t, onClose }) {
  if (!data) return null;
  const config = TYPES[type];
  const scores = data.scores || {};
  const answers = data.answers || {};
  const color = config.colors[scores.key] ?? A;
  const title = t[config.titleKey] ?? config.fallbackTitle;
  const resultLabel = t[scores.key] ?? scores.key;

  // PSQI — simplified summary view since the data is too rich for inline rendering
  const psqiSummary = type === "psqi" && answers
    ? [
        { label: t.psqi_q1 ?? "Bedtime",          val: answers.q1 },
        { label: t.psqi_q2 ?? "Time to fall asleep (min)", val: answers.q2 },
        { label: t.psqi_q3 ?? "Wake time",        val: answers.q3 },
        { label: t.psqi_q4 ?? "Hours of sleep",   val: answers.q4 },
        { label: t.psqi_q6 ?? "Overall quality",  val: answers.q6 != null ? (t[`psqi_quality${answers.q6}`] ?? answers.q6) : "—" },
      ]
    : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,30,50,0.6)", backdropFilter: "blur(5px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border"
        style={{ background: SU, borderColor: BO }}
      >
        {/* Gradient header */}
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 text-white z-10"
          style={{ background: `linear-gradient(135deg, ${A}, ${AD})` }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {title}
            </div>
            <div className="text-lg font-bold">{data.date ?? "—"}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            ×
          </button>
        </div>

        {/* Score + status row */}
        <div className="p-5 flex flex-col gap-4">
          <div
            className="rounded-xl p-4 border flex items-center justify-between"
            style={{ background: color + "15", borderColor: color + "55" }}
          >
            <div>
              <div
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: MU }}
              >
                {t[config.scoreLabelKey] ?? config.fallbackScoreLabel}
              </div>
              <div className="text-3xl font-black leading-none mt-1" style={{ color }}>
                {scores.score ?? "—"}
                {config.max != null && (
                  <span className="text-sm font-bold ml-1" style={{ color: MU }}>
                    /{config.max}
                  </span>
                )}
              </div>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: color, color: "#fff" }}
            >
              {resultLabel}
            </div>
          </div>

          {/* Answers section */}
          {config.questions && (
            <div>
              <div
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: MU }}
              >
                {t.answers ?? "Answers"}
              </div>
              <div className="flex flex-col gap-2">
                {config.questions.map(([qKey, fallback], i) => {
                  // Try multiple lookup strategies for the answer
                  // PSS-10 sends { q1: 0-4, q2: 0-4 } but earlier versions used numeric keys
                  const raw = answers[`q${i + 1}`] ?? answers[i + 1] ?? answers[i];
                  let displayVal = raw ?? "—";

                  // For PSS-10 — show option label instead of raw number
                  if (type === "pss10" && raw != null) {
                    displayVal = t[`pss10_opt${raw}`] ?? raw;
                  }

                  return (
                    <div
                      key={qKey}
                      className="rounded-xl px-4 py-3 border"
                      style={{ background: BG, borderColor: BO }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className="text-xs font-semibold flex-1"
                          style={{ color: TX }}
                        >
                          {t[qKey] ?? fallback}
                        </span>
                        <span className="text-sm font-black" style={{ color: A }}>
                          {displayVal}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PSQI — show simplified summary instead of question list */}
          {psqiSummary && (
            <div>
              <div
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: MU }}
              >
                {t.summary ?? "Summary"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {psqiSummary.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-xl px-3 py-2 border"
                    style={{ background: BG, borderColor: BO }}
                  >
                    <div
                      className="text-[9px] font-bold tracking-wider uppercase"
                      style={{ color: MU }}
                    >
                      {row.label}
                    </div>
                    <div className="text-base font-black mt-0.5" style={{ color: AD }}>
                      {row.val ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main card component ────────────────────────────────────────────────
export default function QuestionnaireCard({ type, latest, t }) {
  const [open, setOpen] = useState(false);
  const config = TYPES[type];
  if (!config) return null;

  const title = t[config.titleKey] ?? config.fallbackTitle;

  // Empty state — no submission yet
  if (!latest || !latest.scores) {
    return (
      <div
        className="rounded-2xl border shadow-sm p-4"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: A }}
        >
          {title}
        </div>
        <div className="text-xs mt-2" style={{ color: MU }}>
          {t.noDataYet ?? "Not completed"}
        </div>
      </div>
    );
  }

  const { score, key } = latest.scores;
  const color = config.colors[key] ?? A;
  const resultLabel = t[key] ?? key;

  return (
    <>
      <div
        className="rounded-2xl border shadow-sm p-4"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: A }}
        >
          {title}
        </div>

        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="text-2xl font-black" style={{ color }}>
              {score ?? "—"}
              {config.max != null && (
                <span className="text-xs font-bold ml-1" style={{ color: MU }}>
                  /{config.max}
                </span>
              )}
            </div>
            <div
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color }}
            >
              {resultLabel}
            </div>
          </div>
          <div className="text-right text-[10px]" style={{ color: MU }}>
            {latest.date}
          </div>
        </div>

        <button
          onClick={() => setOpen(true)}
          className="mt-3 text-[11px] font-bold uppercase tracking-wider"
          style={{ color: A }}
        >
          {t.readMore ?? "Read more"} →
        </button>
      </div>

      {open && (
        <DetailModal
          type={type}
          data={latest}
          t={t}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
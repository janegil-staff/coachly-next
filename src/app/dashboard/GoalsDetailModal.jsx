"use client";
// Full-screen modal that opens when the coach clicks "Read more" inside
// the Goal Check-in collapsible. Shows:
//   • Header with date
//   • Score pill (avg/5) and colored status badge
//   • Radar chart of the 5 goal-related answers
//   • Compact answer list (full question text + per-answer score circle)
import GoalsRadarChart from "@/components/dashboard/GoalsRadarChart";
import {
  A,
  AD,
  BG,
  BO,
  DANGER,
  MU,
  OK,
  SU,
  TX,
  WARN,
} from "@/components/dashboard/calendar/theme";
import { GOALS_STATUS_COLORS } from "@/components/dashboard/calendar/theme";

const GOALS_QUESTIONS = [
  { qKey: "goalsQ1", fallback: "Goals are clear and specific" },
  { qKey: "goalsQ2", fallback: "Making real progress" },
  { qKey: "goalsQ3", fallback: "Feeling motivated" },
  {
    qKey: "goalsQ4",
    fallback: "Things outside my control are getting in the way",
  },
  { qKey: "goalsQ5", fallback: "Have the support I need" },
];

export default function GoalsDetailModal({ data, onClose, t }) {
  if (!data) return null;
  const s = data.scores || {};
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const statusKey = "goalsStatus_" + (s.status ?? "ontrack");
  const color = GOALS_STATUS_COLORS[s.status] ?? A;

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
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 text-white z-10"
          style={{ background: `linear-gradient(135deg, ${A}, ${AD})` }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {t.goalsTitle ?? "Goal Check-in"}
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

        <div className="p-5 flex flex-col gap-4">
          {/* Score summary pill */}
          <div
            className="rounded-xl p-4 border flex items-center justify-between"
            style={{ background: color + "15", borderColor: color + "55" }}
          >
            <div>
              <div
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: MU }}
              >
                {t.score ?? "Score"}
              </div>
              <div
                className="text-3xl font-black leading-none mt-1"
                style={{ color }}
              >
                {s.avg ?? "—"}
                <span className="text-sm font-bold ml-1" style={{ color: MU }}>
                  /5
                </span>
              </div>
            </div>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: color, color: "#fff" }}
            >
              {t[statusKey] ?? s.status ?? "—"}
            </div>
          </div>

          {/* Radar visualization */}
          <div
            className="rounded-xl border"
            style={{ background: SU, borderColor: BO }}
          >
            <GoalsRadarChart answers={answers} status={s.status} t={t} />
          </div>

          {/* Compact answer list — full question text + small score pip */}
          <div>
            <div
              className="text-[10px] font-bold tracking-widest uppercase mb-2"
              style={{ color: MU }}
            >
              {t.answers ?? "Answers"}
            </div>
            <div className="flex flex-col gap-1.5">
              {GOALS_QUESTIONS.map((q, i) => {
                const val = answers[i] ?? 0;
                const scoreColor =
                  val >= 4
                    ? OK
                    : val >= 3
                      ? "#4A7AB5"
                      : val >= 2
                        ? WARN
                        : DANGER;
                return (
                  <div
                    key={q.qKey}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "6px 10px",
                      background: BG,
                      borderRadius: 8,
                    }}
                  >
                    <span
                      style={{
                        flex: 1,
                        fontSize: 11,
                        color: TX,
                        fontWeight: 500,
                      }}
                    >
                      {t[q.qKey] ?? q.fallback}
                    </span>
                    <span
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: scoreColor,
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {val || "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
// Day-detail modal triggered by clicking a calendar day cell with a log.
// Shows the score + total minutes header, optional rest-day badge,
// workouts grouped by category, the 5-icon stat strip (effort/mood/
// energy/sleep/soreness), additional metric stats (weight, waist, meals,
// water, steps, stress, sleep hours), and the note if includeNotes is on.
import { getCatalogItemName } from "@/lib/exerciseCatalog";
import {
  A,
  AD,
  AL,
  BG,
  BO,
  DANGER,
  MU,
  OK,
  SU,
  TX,
  WARN,
} from "@/components/dashboard/calendar/theme";
import { BUCKET_COLORS, tc } from "@/components/dashboard/calendar/constants";
import { bucketOf } from "@/components/dashboard/calendar/helpers";

function Stats({ items }) {
  const visible = items.filter(
    (it) => it.val !== null && it.val !== undefined && it.val !== "",
  );
  if (visible.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-2">
      {visible.map((it) => (
        <div
          key={it.label}
          className="rounded-xl px-3 py-2 border"
          style={{ background: BG, borderColor: BO }}
        >
          <div
            className="text-[9px] font-bold tracking-wider uppercase"
            style={{ color: MU }}
          >
            {it.label}
          </div>
          <div className="text-base font-black mt-0.5" style={{ color: AD }}>
            {it.val}
            {it.unit ? (
              <span className="text-xs font-bold ml-0.5" style={{ color: MU }}>
                {it.unit}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DayModal({
  date,
  log,
  score,
  onClose,
  t,
  includeNotes,
}) {
  if (!log) return null;
  const bucket = bucketOf(score?.compositeScore);

  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  const categoryDurations = Array.isArray(log.categoryDurations)
    ? log.categoryDurations
    : [];
  const totalMinutes =
    categoryDurations.reduce((s, c) => s + (c.durationMinutes || 0), 0) ||
    workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);

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
              {t.dailyLog ?? "Daily log"}
            </div>
            <div className="text-lg font-bold">{date}</div>
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
          {score && (
            <div className="flex items-stretch gap-3">
              <div
                className="flex-1 rounded-xl px-4 py-3 text-center border"
                style={{
                  background: bucket ? BUCKET_COLORS[bucket] + "22" : BG,
                  borderColor: BO,
                }}
              >
                <div
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: MU }}
                >
                  {t.score ?? "Score"}
                </div>
                <div
                  className="text-3xl font-black leading-none mt-1"
                  style={{ color: AD }}
                >
                  {bucket != null ? bucket : "—"}
                  <span className="text-sm font-bold" style={{ color: MU }}>
                    /5
                  </span>
                </div>
                {score.compositeScore != null && (
                  <div
                    className="text-[10px] font-semibold mt-1"
                    style={{ color: MU }}
                  >
                    {Math.round(score.compositeScore)}/100
                  </div>
                )}
              </div>
              <div
                className="flex-1 rounded-xl px-4 py-3 text-center border"
                style={{ background: BG, borderColor: BO }}
              >
                <div
                  className="text-[10px] font-bold tracking-wider uppercase"
                  style={{ color: MU }}
                >
                  {t.totalMinutes ?? "Minutes"}
                </div>
                <div
                  className="text-3xl font-black leading-none mt-1"
                  style={{ color: AD }}
                >
                  {totalMinutes}
                  <span className="text-sm font-bold" style={{ color: MU }}>
                    {" "}
                    min
                  </span>
                </div>
              </div>
            </div>
          )}

          {log.isRestDay && (
            <div
              className="rounded-xl px-4 py-3 text-center font-bold"
              style={{ background: AL, color: AD }}
            >
              🛌 {t.restDay ?? "Rest day"}
            </div>
          )}

          {!log.isRestDay && workouts.length > 0 && (
            <div>
              <div
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: MU }}
              >
                {t.workouts ?? "Workouts"}
              </div>
              <div className="flex flex-col gap-3">
                {Object.entries(grouped).map(([cat, items]) => {
                  const catDur =
                    categoryDurations.find((c) => c.type === cat)
                      ?.durationMinutes || 0;
                  return (
                    <div
                      key={cat}
                      className="rounded-xl border overflow-hidden"
                      style={{ background: BG, borderColor: BO }}
                    >
                      <div
                        className="flex items-center justify-between px-4 py-2 border-b"
                        style={{ borderColor: BO, background: tc(cat) + "11" }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: tc(cat) }}
                          />
                          <span
                            className="text-sm font-bold capitalize"
                            style={{ color: TX }}
                          >
                            {categoryLabel(cat)}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{ color: MU }}
                          >
                            · {items.length}
                          </span>
                        </div>
                        {catDur > 0 && (
                          <span
                            className="text-xs font-bold"
                            style={{ color: tc(cat) }}
                          >
                            {catDur} min
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col">
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
                              className="px-4 py-2 flex flex-col gap-0.5 border-t first:border-t-0"
                              style={{ borderColor: BO + "60" }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: TX }}
                                >
                                  {w.exerciseSlug
                                    ? getCatalogItemName(w.exerciseSlug, t)
                                    : w.exerciseName ||
                                      w.name ||
                                      categoryLabel(cat)}
                                </span>
                                {detail && (
                                  <span
                                    className="text-xs font-medium"
                                    style={{ color: MU }}
                                  >
                                    {detail}
                                  </span>
                                )}
                              </div>
                              {w.note && (
                                <span
                                  className="text-xs italic"
                                  style={{ color: MU }}
                                >
                                  "{w.note}"
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
            </div>
          )}

          <div className="grid grid-cols-5 gap-2">
            {[
              { label: t.effort ?? "Effort", val: log.effort, icon: "⚡" },
              { label: t.mood ?? "Mood", val: log.mood, icon: "😊" },
              { label: t.energy ?? "Energy", val: log.energy, icon: "🔋" },
              { label: t.sleep ?? "Sleep", val: log.sleepQuality, icon: "💤" },
              { label: t.soreness ?? "Soreness", val: log.soreness, icon: "🔥" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-2 text-center border"
                style={{ background: BG, borderColor: BO }}
              >
                <div className="text-sm">{s.icon}</div>
                <div
                  className="text-lg font-black leading-none mt-1"
                  style={{ color: s.val != null ? AD : MU }}
                >
                  {s.val != null ? s.val : "—"}
                </div>
                <div
                  className="text-[8px] font-bold tracking-wider uppercase mt-1"
                  style={{ color: MU }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <Stats
            items={[
              { label: t.stress ?? "Stress", val: log.stress, unit: "/5" },
              {
                label: t.sleepHours ?? "Sleep hours",
                val: log.sleepHours,
                unit: "h",
              },
            ]}
          />

          <Stats
            items={[
              { label: t.weight ?? "Weight", val: log.weightKg, unit: "kg" },
              { label: t.waist ?? "Waist", val: log.waistCm, unit: "cm" },
            ]}
          />

          <Stats
            items={[
              {
                label: t.meals ?? "Meals on plan",
                val: log.mealsOnPlan,
                unit: null,
              },
              { label: t.water ?? "Water", val: log.waterGlasses, unit: "×" },
              { label: t.steps ?? "Steps", val: log.steps, unit: null },
            ]}
          />

          {includeNotes && log.note && (
            <div>
              <div
                className="text-[10px] font-bold tracking-widest uppercase mb-2"
                style={{ color: MU }}
              >
                {t.note ?? "Note"}
              </div>
              <div
                className="rounded-xl px-4 py-3 text-sm italic leading-relaxed border-l-4"
                style={{ background: AL, color: TX, borderLeftColor: A }}
              >
                "{log.note}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

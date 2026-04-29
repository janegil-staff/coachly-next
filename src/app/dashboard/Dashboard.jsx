'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getTranslations } from '@/src/lib/translations';
import HistoryTab from './HistoryTab';
import GraphsTab from './GraphsTab';

const A = '#4A7AB5', AD = '#2D4A6E', AL = '#DDE8F4', BG = '#EEF2F7';
const SU = '#FFFFFF', BO = '#D0DCEA', TX = '#1A2C3D', MU = '#7A9AB8';

const BUCKET_COLORS = { 5:'#22C55E', 4:'#86EFAC', 3:'#F59E0B', 2:'#F97316', 1:'#EF4444' };
function bucketOf(score) {
  if (score == null) return null;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

const TYPE_COLORS = {
  strength: '#4A7AB5', cardio: '#F59E0B', mobility: '#22C55E',
  recovery: '#9CA3AF', other: '#6B7280',
};
const tc = (type) => TYPE_COLORS[type] ?? '#6B7280';

function pad(n) { return String(n).padStart(2, '0'); }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function firstDow(y, m) { return (new Date(y, m, 1).getDay() + 6) % 7; }
function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

// ── Top header bar ───────────────────────────────────────────────────────
function HeaderBar({ tab, setTab, profile, onPdf, onSignOut, t, pdfBusy }) {
  const Tab = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition-colors"
        style={{
          color: active ? A : MU,
          borderColor: active ? A : 'transparent',
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <header
      className="sticky top-0 z-20 border-b"
      style={{ background: SU, borderColor: BO }}
    >
      <div className="px-6 pt-3 pb-0 flex items-center justify-between">
        {/* Left: logo + name */}
        <div className="flex items-center gap-2">
          <img src="/coachly-logo.png" alt="Coachly" className="w-8 h-8 rounded-lg object-contain" />
          <div>
            <div className="font-bold leading-tight" style={{ color: TX }}>
              Coachly
            </div>
            <div className="text-[10px]" style={{ color: MU }}>
              {t.coachView ?? 'Coach view'}
            </div>
          </div>
        </div>

        {/* Right: profile chips + PDF + Sign out */}
        <div className="flex items-center gap-2">
          {profile?.age != null && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: AL, color: AD }}>
              {profile.age}y
            </span>
          )}
          {profile?.gender && profile.gender !== 'undefined' && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: AL, color: AD }}>
              {profile.gender}
            </span>
          )}
          {profile?.heightCm != null && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: AL, color: AD }}>
              {profile.heightCm}cm
            </span>
          )}
          {profile?.weightKg != null && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: AL, color: AD }}>
              {profile.weightKg}kg
            </span>
          )}
          <button
            onClick={onPdf}
            disabled={pdfBusy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: AD, color: '#fff' }}
          >
            <span>↓</span> {pdfBusy ? '…' : 'PDF'}
          </button>
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: BO, color: TX }}
          >
            {t.signOut ?? 'Sign out'}
          </button>
        </div>
      </div>

      {/* Tabs row */}
      <div className="px-6 flex gap-1">
        <Tab id="calendar" label={t.calendar ?? 'Calendar'} icon="📅" />
        <Tab id="history" label={t.history ?? 'History'} icon="📋" />
        <Tab id="graphs" label={t.graphs ?? 'Graphs'} icon="📈" />
      </div>
    </header>
  );
}

// ── Day modal ────────────────────────────────────────────────────────────
function DayModal({ date, log, score, onClose, t, includeNotes }) {
  // DayModal v2 — expanded
  if (!log) return null;
  const bucket = bucketOf(score?.compositeScore);

  // Workouts grouped by category, then by name within category.
  // Falls back to legacy shape (just type+name) when sets/reps/weight aren't present.
  const workouts = Array.isArray(log.workouts) ? log.workouts : [];
  const categoryDurations = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  const totalMinutes = categoryDurations.reduce((s, c) => s + (c.durationMinutes || 0), 0)
                    || workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0);

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

  // Helper: tiny pill row of "label · value" pairs, only renders pairs with a value
  const Stats = ({ items }) => {
    const visible = items.filter((it) => it.val !== null && it.val !== undefined && it.val !== "");
    if (visible.length === 0) return null;
    return (
      <div className="grid grid-cols-2 gap-2">
        {visible.map((it) => (
          <div key={it.label} className="rounded-xl px-3 py-2 border" style={{ background: BG, borderColor: BO }}>
            <div className="text-[9px] font-bold tracking-wider uppercase" style={{ color: MU }}>{it.label}</div>
            <div className="text-base font-black mt-0.5" style={{ color: AD }}>
              {it.val}{it.unit ? <span className="text-xs font-bold ml-0.5" style={{ color: MU }}>{it.unit}</span> : null}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(5px)' }}
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
              {t.dailyLog ?? 'Daily log'}
            </div>
            <div className="text-lg font-bold">{date}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-xl" style={{ background: 'rgba(255,255,255,0.2)' }}>×</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* ── Score + total minutes ─────────────────────────────── */}
          {score && (
            <div className="flex items-stretch gap-3">
              <div className="flex-1 rounded-xl px-4 py-3 text-center border" style={{ background: bucket ? BUCKET_COLORS[bucket] + '22' : BG, borderColor: BO }}>
                <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: MU }}>{t.score ?? 'Score'}</div>
                <div className="text-3xl font-black leading-none mt-1" style={{ color: AD }}>
                  {/* // score display: bucket + raw */}
                  {bucket != null ? bucket : '—'}
                  <span className="text-sm font-bold" style={{ color: MU }}>/5</span>
                </div>
                {score.compositeScore != null && (
                  <div className="text-[10px] font-semibold mt-1" style={{ color: MU }}>
                    {Math.round(score.compositeScore)}/100
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-xl px-4 py-3 text-center border" style={{ background: BG, borderColor: BO }}>
                <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: MU }}>{t.totalMinutes ?? 'Minutes'}</div>
                <div className="text-3xl font-black leading-none mt-1" style={{ color: AD }}>
                  {totalMinutes}
                  <span className="text-sm font-bold" style={{ color: MU }}> min</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Rest day badge ────────────────────────────────────── */}
          {log.isRestDay && (
            <div className="rounded-xl px-4 py-3 text-center font-bold" style={{ background: AL, color: AD }}>
              🛌 {t.restDay ?? 'Rest day'}
            </div>
          )}

          {/* ── Workouts grouped by category ──────────────────────── */}
          {!log.isRestDay && workouts.length > 0 && (
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: MU }}>{t.workouts ?? 'Workouts'}</div>
              <div className="flex flex-col gap-3">
                {Object.entries(grouped).map(([cat, items]) => {
                  const catDur = categoryDurations.find((c) => c.type === cat)?.durationMinutes || 0;
                  return (
                    <div key={cat} className="rounded-xl border overflow-hidden" style={{ background: BG, borderColor: BO }}>
                      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: BO, background: tc(cat) + '11' }}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: tc(cat) }} />
                          <span className="text-sm font-bold capitalize" style={{ color: TX }}>{categoryLabel(cat)}</span>
                          <span className="text-xs font-semibold" style={{ color: MU }}>· {items.length}</span>
                        </div>
                        {catDur > 0 && (
                          <span className="text-xs font-bold" style={{ color: tc(cat) }}>{catDur} min</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        {items.map((w, i) => {
                          const setsReps = (w.sets && w.reps) ? `${w.sets} × ${w.reps}` : null;
                          const weightStr = w.weight ? `@ ${w.weight} ${t.kg ?? 'kg'}` : null;
                          const durStr = w.durationMinutes ? `${w.durationMinutes} ${t.minutes ?? 'min'}` : null;
                          const detail = [setsReps, weightStr, durStr].filter(Boolean).join(' · ');
                          return (
                            <div key={i} className="px-4 py-2 flex flex-col gap-0.5 border-t first:border-t-0" style={{ borderColor: BO + '60' }}>
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold" style={{ color: TX }}>
                                  {w.exerciseName || w.name || categoryLabel(cat)}
                                </span>
                                {detail && <span className="text-xs font-medium" style={{ color: MU }}>{detail}</span>}
                              </div>
                              {w.note && (
                                <span className="text-xs italic" style={{ color: MU }}>"{w.note}"</span>
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

          {/* ── Wellbeing 5-stat strip (existing pattern) ─────────── */}
          <div className="grid grid-cols-5 gap-2">
            {[
              { label: t.effort   ?? 'Effort',   val: log.effort,       icon: '⚡', color: '#F59E0B' },
              { label: t.mood     ?? 'Mood',     val: log.mood,         icon: '😊', color: '#4A7AB5' },
              { label: t.energy   ?? 'Energy',   val: log.energy,       icon: '🔋', color: '#22C55E' },
              { label: t.sleep    ?? 'Sleep',    val: log.sleepQuality, icon: '💤', color: '#A855F7' },
              { label: t.soreness ?? 'Soreness', val: log.soreness,     icon: '🔥', color: '#EF4444' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl p-2 text-center border" style={{ background: BG, borderColor: BO }}>
                <div className="text-sm">{s.icon}</div>
                <div className="text-lg font-black leading-none mt-1" style={{ color: s.val != null ? AD : MU }}>
                  {s.val != null ? s.val : '—'}
                </div>
                <div className="text-[8px] font-bold tracking-wider uppercase mt-1" style={{ color: MU }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Stress + sleep hours (rendered together) ─────────── */}
          <Stats items={[
            { label: t.stress     ?? 'Stress',      val: log.stress,     unit: '/5' },
            { label: t.sleepHours ?? 'Sleep hours', val: log.sleepHours, unit: 'h'  },
          ]} />

          {/* ── Body ──────────────────────────────────────────────── */}
          <Stats items={[
            { label: t.weight ?? 'Weight', val: log.weightKg, unit: 'kg' },
            { label: t.waist  ?? 'Waist',  val: log.waistCm,  unit: 'cm' },
          ]} />

          {/* ── Nutrition ─────────────────────────────────────────── */}
          <Stats items={[
            { label: t.meals ?? 'Meals on plan', val: log.mealsOnPlan,  unit: null },
            { label: t.water ?? 'Water',         val: log.waterGlasses, unit: '×'  },
            { label: t.steps ?? 'Steps',         val: log.steps,        unit: null },
          ]} />

          {/* ── Note (existing) ──────────────────────────────────── */}
          {includeNotes && log.note && (
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: MU }}>{t.note ?? 'Note'}</div>
              <div className="rounded-xl px-4 py-3 text-sm italic leading-relaxed border-l-4" style={{ background: AL, color: TX, borderLeftColor: A }}>
                "{log.note}"
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Hooper detail modal ──────────────────────────────────────────────────
const HOOPER_QUESTIONS = [
  { qKey: 'hooperQSleep',    lowKey: 'hooperScale1',         highKey: 'hooperScale7',         fallback: 'Sleep quality' },
  { qKey: 'hooperQFatigue',  lowKey: 'hooperScaleFatigue1',  highKey: 'hooperScaleFatigue7',  fallback: 'Fatigue' },
  { qKey: 'hooperQStress',   lowKey: 'hooperScaleStress1',   highKey: 'hooperScaleStress7',   fallback: 'Stress' },
  { qKey: 'hooperQSoreness', lowKey: 'hooperScaleSoreness1', highKey: 'hooperScaleSoreness7', fallback: 'Muscle soreness' },
];

const HOOPER_STATUS_COLORS = {
  fresh: '#22C55E',
  normal: '#4A7AB5',
  strained: '#F59E0B',
  overreaching: '#EF4444',
};

function HooperDetailModal({ data, onClose, t }) {
  if (!data) return null;
  const s = data.scores || {};
  const answers = Array.isArray(data.answers) ? data.answers : [];
  const statusKey = 'hooperStatus_' + (s.status ?? 'normal');
  const color = HOOPER_STATUS_COLORS[s.status] ?? A;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(5px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${A}, ${AD})` }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {t.hooperTitle ?? 'Daily check-in'} (Hooper)
            </div>
            <div className="text-lg font-bold">{data.date ?? '—'}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Total + status */}
          <div className="rounded-xl p-4 border flex items-center justify-between" style={{ background: color + '15', borderColor: color + '55' }}>
            <div>
              <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: MU }}>
                {t.score ?? 'Score'}
              </div>
              <div className="text-3xl font-black leading-none mt-1" style={{ color }}>
                {s.total ?? '—'}
                <span className="text-sm font-bold ml-1" style={{ color: MU }}>/28</span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: color, color: '#fff' }}>
              {t[statusKey] ?? s.status ?? '—'}
            </div>
          </div>

          {/* Per-question answers */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: MU }}>
              {t.answers ?? 'Answers'}
            </div>
            <div className="flex flex-col gap-2">
              {HOOPER_QUESTIONS.map((q, i) => {
                const val = answers[i];
                return (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3 border"
                    style={{ background: BG, borderColor: BO }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <span className="text-xs font-semibold" style={{ color: TX }}>
                        {t[q.qKey] ?? q.fallback}
                      </span>
                      <span className="text-lg font-black" style={{ color: A }}>
                        {val ?? '—'}
                        <span className="text-[10px] font-bold ml-0.5" style={{ color: MU }}>/7</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]" style={{ color: MU }}>
                      <span>1 · {t[q.lowKey] ?? 'Low'}</span>
                      <span>{t[q.highKey] ?? 'High'} · 7</span>
                    </div>
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

// ── RESTQ detail modal ───────────────────────────────────────────────────
function RestqDetailModal({ data, onClose, t }) {
  if (!data) return null;
  const s = data.scores || {};
  const answers = Array.isArray(data.answers) ? data.answers : [];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,30,50,0.6)', backdropFilter: 'blur(5px)' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="sticky top-0 flex items-center justify-between px-5 py-4 text-white"
          style={{ background: `linear-gradient(135deg, ${A}, ${AD})` }}
        >
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase opacity-70">
              {t.restqTitle ?? 'Recovery-Stress'} (RESTQ)
            </div>
            <div className="text-lg font-bold">{data.date ?? '—'}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xl"
            style={{ background: 'rgba(255,255,255,0.2)' }}
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Stress / Recovery / Balance summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl px-3 py-3 text-center border" style={{ background: '#EF444415', borderColor: '#EF444455' }}>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>
                {t.restqStress ?? 'Stress'}
              </div>
              <div className="text-2xl font-black leading-none mt-1" style={{ color: '#EF4444' }}>
                {s.stress ?? '—'}
              </div>
            </div>
            <div className="rounded-xl px-3 py-3 text-center border" style={{ background: '#22C55E15', borderColor: '#22C55E55' }}>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>
                {t.restqRecovery ?? 'Recovery'}
              </div>
              <div className="text-2xl font-black leading-none mt-1" style={{ color: '#22C55E' }}>
                {s.recovery ?? '—'}
              </div>
            </div>
            <div className="rounded-xl px-3 py-3 text-center border" style={{ background: A + '15', borderColor: A + '55' }}>
              <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>
                {t.restqBalance ?? 'Balance'}
              </div>
              <div className="text-2xl font-black leading-none mt-1" style={{ color: A }}>
                {s.balance != null ? (s.balance >= 0 ? '+' : '') + s.balance : '—'}
              </div>
            </div>
          </div>

          {/* Per-item answers */}
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: MU }}>
              {t.answers ?? 'Answers'}
            </div>
            <div className="flex flex-col gap-1.5">
              {answers.map((val, i) => {
                const itemKey = 'restq_item_' + (i + 1);
                return (
                  <div
                    key={i}
                    className="rounded-lg px-3 py-2 border flex items-center gap-3"
                    style={{ background: BG, borderColor: BO }}
                  >
                    <span className="text-[10px] font-bold flex-shrink-0 w-6 text-center" style={{ color: A }}>
                      {i + 1}.
                    </span>
                    <span className="text-xs flex-1" style={{ color: TX }}>
                      {t[itemKey] ?? 'Item ' + (i + 1)}
                    </span>
                    <span className="text-sm font-black flex-shrink-0" style={{ color: A }}>
                      {val ?? '—'}
                      <span className="text-[9px] font-bold ml-0.5" style={{ color: MU }}>/6</span>
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

// ── Hooper / RESTQ side cards ────────────────────────────────────────────
function HooperCard({ data, t, onReadMore }) {
  if (!data) return <div className="text-xs" style={{ color: MU }}>{t.noHooper ?? 'Not completed'}</div>;
  const s = data.scores || {};
  const statusKey = 'hooperStatus_' + (s.status ?? 'normal');
  const color = HOOPER_STATUS_COLORS[s.status] ?? A;
  return (
    <>
      <div className="flex items-center justify-between mt-2">
        <div>
          <div className="text-2xl font-black" style={{ color }}>
            {s.total ?? '—'}
            <span className="text-xs font-bold ml-1" style={{ color: MU }}>/28</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>
            {t[statusKey] ?? s.status}
          </div>
        </div>
        <div className="text-right text-[10px]" style={{ color: MU }}>{data.date}</div>
      </div>
      <button
        onClick={onReadMore}
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: A }}
      >
        {t.readMore ?? 'Read more'} →
      </button>
    </>
  );
}

function RestqCard({ data, t, onReadMore }) {
  if (!data) return <div className="text-xs" style={{ color: MU }}>{t.noRestq ?? 'Not completed'}</div>;
  const s = data.scores || {};
  return (
    <>
      <div className="mt-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-xl font-black" style={{ color: '#EF4444' }}>{s.stress ?? '—'}</div>
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: MU }}>{t.restqStress ?? 'Stress'}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black" style={{ color: '#22C55E' }}>{s.recovery ?? '—'}</div>
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: MU }}>{t.restqRecovery ?? 'Recovery'}</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-black" style={{ color: A }}>
              {s.balance != null ? (s.balance >= 0 ? '+' : '') + s.balance : '—'}
            </div>
            <div className="text-[9px] uppercase tracking-wider font-bold" style={{ color: MU }}>{t.restqBalance ?? 'Balance'}</div>
          </div>
        </div>
        <div className="text-right text-[10px] mt-2" style={{ color: MU }}>{data.date}</div>
      </div>
      <button
        onClick={onReadMore}
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: A }}
      >
        {t.readMore ?? 'Read more'} →
      </button>
    </>
  );
}

// ── Calendar tab content (was the main dashboard view) ──────────────────
function CalendarTab({ logs, scores, latestHooper, latestRestq, t, includeNotes }) {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [modalDate, setModalDate] = useState(null);
  const [hooperOpen, setHooperOpen] = useState(false);
  const [restqOpen, setRestqOpen] = useState(false);

  const logByDate = useMemo(() => {
    const m = {};
    (logs || []).forEach((l) => { if (l.date) m[l.date] = l; });
    return m;
  }, [logs]);

  const scoreByDate = useMemo(() => {
    const m = {};
    (scores || []).forEach((s) => { if (s.date) m[s.date] = s; });
    return m;
  }, [scores]);

  const monthPrefix = `${month.y}-${pad(month.m + 1)}`;
  const monthLogs = useMemo(
    () => (logs || []).filter((l) => l.date?.startsWith(monthPrefix)),
    [logs, monthPrefix]
  );

  const monthAvgs = useMemo(() => {
    const avg = (key, nonRest = false) => {
      const arr = monthLogs
        .filter((l) => (nonRest ? !l.isRestDay : true))
        .map((l) => l[key])
        .filter((v) => typeof v === 'number');
      return arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length) : null;
    };
    const totalMinutes = monthLogs.reduce(
      (s, l) => s + ((l.workouts || []).reduce((a, w) => a + (w.durationMinutes || 0), 0)),
      0
    );
    return {
      effort: avg('effort', true),
      mood: avg('mood'),
      energy: avg('energy'),
      sleep: avg('sleepQuality'),
      soreness: avg('soreness'),
      totalMinutes,
      sessions: monthLogs.filter((l) => !l.isRestDay && (l.workouts || []).length > 0).length,
      restDays: monthLogs.filter((l) => l.isRestDay).length,
    };
  }, [monthLogs]);

  const months = t.months ?? ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const weekdays = t.weekdays ?? ['M','T','W','T','F','S','S'];

  const { y, m } = month;
  const days = daysInMonth(y, m);
  const firstDay = firstDow(y, m);
  const todayStr = fmtDate(new Date());

  const AVG_ROWS = [
    { key: 'effort', label: t.effort ?? 'Effort', max: 5, color: '#F59E0B', icon: '⚡' },
    { key: 'mood', label: t.mood ?? 'Mood', max: 5, color: '#4A7AB5', icon: '😊' },
    { key: 'energy', label: t.energy ?? 'Energy', max: 5, color: '#22C55E', icon: '🔋' },
    { key: 'sleep', label: t.sleep ?? 'Sleep', max: 5, color: '#A855F7', icon: '💤' },
    { key: 'soreness', label: t.soreness ?? 'Soreness', max: 5, color: '#EF4444', icon: '🔥' },
  ];

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* LEFT: Calendar */}
      <div className="rounded-2xl border shadow-sm overflow-hidden" style={{ background: SU, borderColor: BO }}>
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button
            onClick={() => setMonth((p) => { const d = new Date(p.y, p.m - 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
            className="w-7 h-7 rounded-md border flex items-center justify-center"
            style={{ borderColor: BO, color: MU }}
          >‹</button>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: A }}>
            {months[m]} {y}
          </span>
          <button
            onClick={() => setMonth((p) => { const d = new Date(p.y, p.m + 1); return { y: d.getFullYear(), m: d.getMonth() }; })}
            className="w-7 h-7 rounded-md border flex items-center justify-center"
            style={{ borderColor: BO, color: MU }}
          >›</button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 px-3">
          {weekdays.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-bold pb-1" style={{ color: MU }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
          {Array.from({ length: firstDay }).map((_, i) => <div key={'e' + i} />)}
          {Array.from({ length: days }).map((_, i) => {
            const day = i + 1;
            const ds = `${y}-${pad(m + 1)}-${pad(day)}`;
            const log = logByDate[ds];
            const score = scoreByDate[ds];
            const bucket = bucketOf(score?.compositeScore);
            const isToday = ds === todayStr;
            const hasNote = includeNotes && !!log?.note?.trim();
            const hasWorkouts = (log?.workouts || []).length > 0;

            return (
              <div
                key={day}
                onClick={() => log && setModalDate(ds)}
                className="relative rounded-md py-1 text-center"
                style={{
                  minHeight: 32,
                  background: bucket ? BUCKET_COLORS[bucket] : 'transparent',
                  color: log ? '#fff' : MU,
                  border: isToday ? `2px solid ${A}` : `1px solid ${log ? 'transparent' : BO}`,
                  cursor: log ? 'pointer' : 'default',
                }}
              >
                <div className="text-[10px] font-bold leading-tight">{day}</div>
                {log?.isRestDay && <span className="absolute -top-1 -right-1 text-xs">🛌</span>}
                {hasWorkouts && (
                  <div className="text-[9px] font-bold opacity-90">
                    {(log.workouts || []).reduce((s, w) => s + (w.durationMinutes || 0), 0)}m
                  </div>
                )}
                {hasNote && <span className="absolute -bottom-1 -right-1 text-[8px]">💬</span>}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-2 flex flex-wrap gap-2 border-t" style={{ borderColor: BO }}>
          {[[5, t.great ?? 'Great'], [4, t.good ?? 'Good'], [3, t.ok ?? 'OK'], [2, t.poor ?? 'Poor'], [1, t.bad ?? 'Bad']].map(([b, lbl]) => (
            <div key={b} className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: TX }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: BUCKET_COLORS[b] }} />
              {lbl}
            </div>
          ))}
        </div>

        <div className="px-4 py-3 border-t grid grid-cols-3 text-center" style={{ borderColor: BO }}>
          <div>
            <div className="text-lg font-black" style={{ color: A }}>{monthAvgs.sessions}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>{t.sessions ?? 'Sessions'}</div>
          </div>
          <div>
            <div className="text-lg font-black" style={{ color: A }}>{monthAvgs.totalMinutes}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>{t.totalMinutes ?? 'Minutes'}</div>
          </div>
          <div>
            <div className="text-lg font-black" style={{ color: A }}>{monthAvgs.restDays}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider" style={{ color: MU }}>{t.restDays ?? 'Rest days'}</div>
          </div>
        </div>
      </div>

      {/* RIGHT: averages + questionnaires */}
      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border shadow-sm p-4" style={{ background: SU, borderColor: BO }}>
          <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: A }}>
            {t.monthlyAverages ?? 'Monthly averages'} — {months[m]}
          </div>
          <div className="flex flex-col gap-3">
            {AVG_ROWS.map((r) => {
              const v = monthAvgs[r.key];
              const pct = v != null ? (v / r.max) * 100 : 0;
              return (
                <div key={r.key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{r.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: TX }}>{r.label}</span>
                    </div>
                    <span className="text-sm font-black" style={{ color: v != null ? r.color : MU }}>
                      {v != null ? v.toFixed(1) : '—'}
                      <span className="text-[10px] font-semibold ml-0.5" style={{ color: MU }}>/{r.max}</span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BG }}>
                    <div className="h-full rounded-full transition-all" style={{ width: pct + '%', background: r.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border shadow-sm p-4" style={{ background: SU, borderColor: BO }}>
          <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: A }}>
            {t.hooperTitle ?? 'Daily check-in'} (Hooper)
          </div>
          <HooperCard
            data={latestHooper}
            t={t}
            onReadMore={() => latestHooper && setHooperOpen(true)}
          />
        </div>

        <div className="rounded-2xl border shadow-sm p-4" style={{ background: SU, borderColor: BO }}>
          <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: A }}>
            {t.restqTitle ?? 'Recovery-Stress'} (RESTQ)
          </div>
          <RestqCard
            data={latestRestq}
            t={t}
            onReadMore={() => latestRestq && setRestqOpen(true)}
          />
        </div>
      </div>

      {modalDate && (
        <DayModal
          date={modalDate}
          log={logByDate[modalDate]}
          score={scoreByDate[modalDate]}
          onClose={() => setModalDate(null)}
          t={t}
          includeNotes={includeNotes}
        />
      )}

      {hooperOpen && (
        <HooperDetailModal
          data={latestHooper}
          onClose={() => setHooperOpen(false)}
          t={t}
        />
      )}

      {restqOpen && (
        <RestqDetailModal
          data={latestRestq}
          onClose={() => setRestqOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

// ── Main Dashboard with tabs ─────────────────────────────────────────────
export default function Dashboard({ report, lang, code }) {
  const router = useRouter();
  const t = useMemo(() => getTranslations(lang), [lang]);
  const [tab, setTab] = useState('calendar');
  const [pdfBusy, setPdfBusy] = useState(false);

  const { client, stats, logs, scores, latestHooper, latestRestq, includeNotes } = report;
  const profile = client?.profile ?? {};

  const handlePdf = async () => {
    if (!code) return alert('No code in session');
    setPdfBusy(true);
    try {
      const url = '/api/pdf?code=' + encodeURIComponent(code) + '&lang=' + lang;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) {
          alert('PDF generation is not yet implemented. Coming soon.');
        } else {
          alert('PDF error: ' + res.status);
        }
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'coachly-report-' + code + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      alert('PDF error: ' + e.message);
    } finally {
      setPdfBusy(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem('coachlyReport');
    sessionStorage.removeItem('coachlyLang');
    sessionStorage.removeItem('coachlyCode');
    router.push('/');
  };

  return (
    <main className="min-h-screen" style={{ background: BG }}>
      <HeaderBar
        tab={tab}
        setTab={setTab}
        profile={profile}
        onPdf={handlePdf}
        onSignOut={handleSignOut}
        t={t}
        pdfBusy={pdfBusy}
      />

      <div className="px-4 py-6">
        {tab === 'calendar' && (
          <CalendarTab
            logs={logs}
            scores={scores}
            latestHooper={latestHooper}
            latestRestq={latestRestq}
            t={t}
            includeNotes={includeNotes}
          />
        )}
        {tab === 'history' && (
          <HistoryTab logs={logs} scores={scores} t={t} includeNotes={includeNotes} />
        )}
        {tab === 'graphs' && (
          <GraphsTab logs={logs} scores={scores} t={t} />
        )}
      </div>
    </main>
  );
}
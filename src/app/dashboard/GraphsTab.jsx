'use client';

import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar,
} from 'recharts';

function bucketOf(score) {
  if (score == null) return null;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

// Total daily training minutes for a single log entry.
// Coachly stores duration in two shapes depending on when the log was created:
//   - New shape: log.categoryDurations = [{ type: "strength", durationMinutes: 45 }, ...]
//   - Legacy shape: log.workouts = [{ type, durationMinutes, name }]
// We prefer the new shape if present and fall back to the legacy one.
function totalMinutes(log) {
  if (!log) return 0;

  if (Array.isArray(log.categoryDurations) && log.categoryDurations.length) {
    return log.categoryDurations.reduce(
      (sum, c) => sum + (Number(c?.durationMinutes) || 0),
      0,
    );
  }

  if (Array.isArray(log.workouts) && log.workouts.length) {
    return log.workouts.reduce(
      (sum, w) => sum + (Number(w?.durationMinutes) || 0),
      0,
    );
  }

  return 0;
}

const A = '#4A7AB5', SU = '#FFFFFF', BO = '#D0DCEA', TX = '#1A2C3D', MU = '#7A9AB8';

const RANGES = [
  { key: '7d',  days: 7,    labelKey: 'rangeLast7Days',  fallback: 'Last 7 days'  },
  { key: '30d', days: 30,   labelKey: 'rangeLast30Days', fallback: 'Last 30 days' },
  { key: '90d', days: 90,   labelKey: 'rangeLast90Days', fallback: 'Last 90 days' },
  { key: 'all', days: null, labelKey: 'rangeAllTime',    fallback: 'All time'     },
];

export default function GraphsTab({ logs, scores, t }) {
  const [range, setRange] = useState('30d');

  const sortedLogs = useMemo(
    () => [...(logs || [])].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [logs]
  );

  const sortedScores = useMemo(
    () => [...(scores || [])].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [scores]
  );

  const cutoffStr = useMemo(() => {
    const r = RANGES.find((x) => x.key === range);
    if (!r || r.days == null) return null;
    const d = new Date();
    d.setDate(d.getDate() - r.days);
    return d.toISOString().slice(0, 10);
  }, [range]);

  const filteredLogs = useMemo(
    () => (cutoffStr ? sortedLogs.filter((l) => l.date >= cutoffStr) : sortedLogs),
    [sortedLogs, cutoffStr]
  );

  const filteredScores = useMemo(
    () => (cutoffStr ? sortedScores.filter((s) => s.date >= cutoffStr) : sortedScores),
    [sortedScores, cutoffStr]
  );

  const scoreData = filteredScores.map((s) => ({
    date: s.date.slice(5),
    score: bucketOf(s.compositeScore),
  }));

  // Now uses totalMinutes() helper which reads both shapes.
  const minutesData = filteredLogs.map((l) => ({
    date: l.date.slice(5),
    minutes: totalMinutes(l),
  }));

  const moodEnergyData = filteredLogs.map((l) => ({
    date: l.date.slice(5),
    mood: l.mood ?? null,
    energy: l.energy ?? null,
  }));

  const sleepSorenessData = filteredLogs.map((l) => ({
    date: l.date.slice(5),
    sleep: l.sleepQuality ?? null,
    soreness: l.soreness ?? null,
  }));

  const weightData = filteredLogs
    .filter((l) => l.weightKg != null && !Number.isNaN(Number(l.weightKg)))
    .map((l) => ({
      date: l.date.slice(5),
      weight: Number(l.weightKg),
    }));

  const weightStats = useMemo(() => {
    if (!weightData.length) return null;
    const values = weightData.map((w) => w.weight);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const last = values[values.length - 1];
    const delta = last - first;
    return { min, max, first, last, delta, count: values.length };
  }, [weightData]);

  const Card = ({ title, children, fullWidth = false, headerExtra = null }) => (
    <div
      className={
        'rounded-2xl border shadow-sm p-4 ' +
        (fullWidth ? 'md:col-span-2' : '')
      }
      style={{ background: SU, borderColor: BO }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: A }}
        >
          {title}
        </div>
        {headerExtra}
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </div>
  );

  const RangeFilter = () => (
    <div
      className="max-w-5xl mx-auto mb-4 rounded-2xl border shadow-sm p-2 flex flex-wrap gap-2"
      style={{ background: SU, borderColor: BO }}
    >
      {RANGES.map((r) => {
        const isActive = range === r.key;
        const baseLabel = t?.[r.labelKey] ?? r.fallback;
        const label =
          r.key === 'all'
            ? `${baseLabel} (${sortedLogs.length} ${t?.entries ?? 'entries'})`
            : baseLabel;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors"
            style={
              isActive
                ? { background: A, color: '#fff', borderColor: A }
                : { background: 'transparent', color: TX, border: `1px solid ${BO}` }
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );

  if (!sortedLogs.length) {
    return (
      <div className="text-center py-16" style={{ color: MU }}>
        {t.noLogs ?? 'No data to graph.'}
      </div>
    );
  }

  const filteredEmpty = !filteredLogs.length && !filteredScores.length;

  const weightDeltaLabel = (() => {
    if (!weightStats) return null;
    const sign = weightStats.delta > 0 ? '+' : weightStats.delta < 0 ? '−' : '±';
    const abs = Math.abs(weightStats.delta).toFixed(1);
    return `${sign}${abs} ${t?.kg ?? 'kg'}`;
  })();

  return (
    <>
      <RangeFilter />

      {filteredEmpty ? (
        <div className="text-center py-16" style={{ color: MU }}>
          {t.noLogsInRange ?? 'No data in this range.'}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title={t.compositeScore ?? 'Composite score'}>
            <LineChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke={MU} fontSize={10} />
              <YAxis domain={[0, 5]} stroke={MU} fontSize={10} ticks={[0, 1, 2, 3, 4, 5]} />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke={A} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </Card>

          <Card title={t.dailyMinutes ?? 'Daily minutes'}>
            <BarChart data={minutesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke={MU} fontSize={10} />
              <YAxis stroke={MU} fontSize={10} />
              <Tooltip />
              <Bar dataKey="minutes" fill="#4A7AB5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </Card>

          <Card title={(t.mood ?? 'Mood') + ' & ' + (t.energy ?? 'Energy')}>
            <LineChart data={moodEnergyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke={MU} fontSize={10} />
              <YAxis domain={[0, 5]} stroke={MU} fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="mood" stroke="#4A7AB5" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="energy" stroke="#22C55E" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </Card>

          <Card title={(t.sleep ?? 'Sleep') + ' & ' + (t.soreness ?? 'Soreness')}>
            <LineChart data={sleepSorenessData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke={MU} fontSize={10} />
              <YAxis domain={[0, 5]} stroke={MU} fontSize={10} />
              <Tooltip />
              <Line type="monotone" dataKey="sleep" stroke="#A855F7" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="soreness" stroke="#EF4444" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </Card>

          {weightData.length > 0 && (
            <Card
              title={t.weight ?? 'Weight'}
              fullWidth
              headerExtra={
                weightDeltaLabel ? (
                  <span
                    className="text-xs font-bold tracking-wide"
                    style={{
                      color:
                        weightStats.delta > 0
                          ? '#EF4444'
                          : weightStats.delta < 0
                          ? '#22C55E'
                          : MU,
                    }}
                  >
                    {weightDeltaLabel}
                  </span>
                ) : null
              }
            >
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke={MU} fontSize={10} />
                <YAxis
                  stroke={MU}
                  fontSize={10}
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v).toFixed(1)} ${t?.kg ?? 'kg'}`, t?.weight ?? 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
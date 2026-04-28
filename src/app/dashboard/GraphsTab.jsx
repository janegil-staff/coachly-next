'use client';

import { useMemo } from 'react';
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

const A = '#4A7AB5', SU = '#FFFFFF', BO = '#D0DCEA', TX = '#1A2C3D', MU = '#7A9AB8';

export default function GraphsTab({ logs, scores, t }) {
  const sortedLogs = useMemo(
    () => [...(logs || [])].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [logs]
  );

  const sortedScores = useMemo(
    () => [...(scores || [])].sort((a, b) => (a.date < b.date ? -1 : 1)),
    [scores]
  );

  // Composite score over time
  const scoreData = sortedScores.map((s) => ({
    date: s.date.slice(5),  // MM-DD
    score: bucketOf(s.compositeScore),
  }));

  // Daily minutes
  const minutesData = sortedLogs.map((l) => ({
    date: l.date.slice(5),
    minutes: (l.workouts || []).reduce((sum, w) => sum + (w.durationMinutes || 0), 0),
  }));

  // Mood + Energy over time
  const moodEnergyData = sortedLogs.map((l) => ({
    date: l.date.slice(5),
    mood: l.mood ?? null,
    energy: l.energy ?? null,
  }));

  // Sleep quality + soreness
  const sleepSorenessData = sortedLogs.map((l) => ({
    date: l.date.slice(5),
    sleep: l.sleep ?? null,
    soreness: l.soreness ?? null,
  }));

  const Card = ({ title, children }) => (
    <div className="rounded-2xl border shadow-sm p-4" style={{ background: SU, borderColor: BO }}>
      <div className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: A }}>
        {title}
      </div>
      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );

  if (!sortedLogs.length) {
    return (
      <div className="text-center py-16" style={{ color: MU }}>
        {t.noLogs ?? 'No data to graph.'}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title={t.compositeScore ?? 'Composite score'}>
        <LineChart data={scoreData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="date" stroke={MU} fontSize={10} />
          <YAxis domain={[0, 5]} stroke={MU} fontSize={10} ticks={[0,1,2,3,4,5]} />
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
    </div>
  );
}

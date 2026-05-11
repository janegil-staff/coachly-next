"use client";
// Orchestration component for the calendar tab. Composes:
//   • Top snapshot row (WellnessIndex, StreakComparison)
//   • Two-column grid: CalendarGrid (left) + CalendarSidebar (right)
//   • Two-column trends row: YearInPixels + WellnessSparkline
//   • DayModal and GoalsDetailModal (rendered conditionally on click)
import { useState, useMemo } from "react";

import WellnessIndex from "@/components/dashboard/calendar/WellnessIndex";
import WellnessSparkline from "@/components/dashboard/calendar/WellnessSparkline";
import StreakComparison from "@/components/dashboard/calendar/StreakComparison";
import YearInPixels from "@/components/dashboard/calendar/YearInPixels";
import CalendarGrid from "@/components/dashboard/calendar/CalendarGrid";
import CalendarSidebar from "@/components/dashboard/calendar/CalendarSidebar";
import { pad } from "@/components/dashboard/calendar/helpers";

import DayModal from "./DayModal";
import GoalsDetailModal from "./GoalsDetailModal";

export default function CalendarTab({
  profile,
  logs,
  scores,
  stats,
  latestHooper,
  latestRestq,
  latestGoals,
  latestPss10,
  latestPsqi,
  latestIpaq,
  exercises,
  t,
  lang,
  includeNotes,
}) {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() };
  });
  const [modalDate, setModalDate] = useState(null);
  const [goalsOpen, setGoalsOpen] = useState(false);

  const data = useMemo(
    () => ({ logs, scores, latestPss10, latestPsqi }),
    [logs, scores, latestPss10, latestPsqi],
  );

  const logByDate = useMemo(() => {
    const m = {};
    (logs || []).forEach((l) => {
      if (l.date) m[l.date] = l;
    });
    return m;
  }, [logs]);

  const scoreByDate = useMemo(() => {
    const m = {};
    (scores || []).forEach((s) => {
      if (s.date) m[s.date] = s;
    });
    return m;
  }, [scores]);

  const monthPrefix = `${month.y}-${pad(month.m + 1)}`;
  const monthLogs = useMemo(
    () => (logs || []).filter((l) => l.date?.startsWith(monthPrefix)),
    [logs, monthPrefix],
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Snapshot row */}
      <WellnessIndex data={data} t={t} month={month} />
      <StreakComparison data={data} t={t} />

      {/* Calendar + sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CalendarGrid
          month={month}
          setMonth={setMonth}
          monthLogs={monthLogs}
          logByDate={logByDate}
          scoreByDate={scoreByDate}
          includeNotes={includeNotes}
          onDayClick={setModalDate}
          t={t}
        />

        <CalendarSidebar
          data={data}
          profile={profile}
          month={month}
          monthLogs={monthLogs}
          latestGoals={latestGoals}
          latestPss10={latestPss10}
          latestPsqi={latestPsqi}
          latestIpaq={latestIpaq}
          exercises={exercises}
          onOpenGoals={() => latestGoals && setGoalsOpen(true)}
          t={t}
          lang={lang}
        />
      </div>

      {/* Year-in-pixels + Trajectory */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        style={{ marginTop: 16 }}
      >
        <YearInPixels
          data={data}
          t={t}
          currentMonth={month}
          onMonthJump={setMonth}
        />
        <WellnessSparkline data={data} t={t} currentMonth={month} />
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

      {goalsOpen && (
        <GoalsDetailModal
          data={latestGoals}
          onClose={() => setGoalsOpen(false)}
          t={t}
        />
      )}
    </div>
  );
}

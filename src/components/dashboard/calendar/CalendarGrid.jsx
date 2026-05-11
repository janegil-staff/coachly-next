"use client";
// Left-column calendar tile. Renders:
//   • Header: prev/next month navigation + current month/year label
//   • 7-column day grid with score-bucket coloring, corner indicators
//     (⚡ high effort, 🛌 rest day, 🔥 high soreness, 💬 note bubble)
//   • Icon legend (what each corner indicator means)
//   • Footer: sessions / total minutes / rest days for the visible month
//
// Click any day with a log → calls onDayClick(dateStr).
import { useMemo } from "react";
import { A, BO, BG, MU, SU, TX } from "./theme";
import { BUCKET_COLORS } from "./constants";
import {
  pad,
  daysInMonth,
  firstDow,
  fmtDate,
  totalMinutes,
  bucketOf,
} from "./helpers";
import NoteIcon from "./NoteIcon";

export default function CalendarGrid({
  month,
  setMonth,
  monthLogs,
  logByDate,
  scoreByDate,
  includeNotes,
  onDayClick,
  t,
}) {
  const monthSessions = useMemo(
    () =>
      monthLogs.filter((l) => !l.isRestDay && (l.workouts || []).length > 0)
        .length,
    [monthLogs],
  );
  const monthTotalMins = useMemo(
    () => monthLogs.reduce((s, l) => s + totalMinutes(l), 0),
    [monthLogs],
  );
  const monthRestDays = useMemo(
    () => monthLogs.filter((l) => l.isRestDay).length,
    [monthLogs],
  );

  const months = t.months ?? [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const weekdays = t.weekdays ?? ["M", "T", "W", "T", "F", "S", "S"];

  const { y, m } = month;
  const days = daysInMonth(y, m);
  const firstDay = firstDow(y, m);
  const todayStr = fmtDate(new Date());

  const legendItems = [
    { key: "highEffort",   icon: <span className="text-base">⚡</span>, label: t.legendHighEffort   ?? "High effort" },
    { key: "restDay",      icon: <span className="text-base">🛌</span>, label: t.legendRestDay      ?? "Rest day" },
    { key: "highSoreness", icon: <span className="text-base">🔥</span>, label: t.legendHighSoreness ?? "High soreness" },
    { key: "note",         icon: <NoteIcon size={14} />,               label: t.legendNote         ?? "Has a note" },
  ];

  return (
    <div
      className="rounded-2xl border shadow-sm overflow-hidden"
      style={{ background: SU, borderColor: BO }}
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={() =>
            setMonth((p) => {
              const d = new Date(p.y, p.m - 1);
              return { y: d.getFullYear(), m: d.getMonth() };
            })
          }
          className="w-7 h-7 rounded-md border flex items-center justify-center"
          style={{ borderColor: BO, color: MU }}
        >
          ‹
        </button>
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: A }}
        >
          {months[m]} {y}
        </span>
        <button
          onClick={() =>
            setMonth((p) => {
              const d = new Date(p.y, p.m + 1);
              return { y: d.getFullYear(), m: d.getMonth() };
            })
          }
          className="w-7 h-7 rounded-md border flex items-center justify-center"
          style={{ borderColor: BO, color: MU }}
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-0.5 px-3">
        {weekdays.map((d, i) => (
          <div
            key={i}
            className="text-center text-[9px] font-bold pb-1"
            style={{ color: MU }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={"e" + i} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const day = i + 1;
          const ds = `${y}-${pad(m + 1)}-${pad(day)}`;
          const log = logByDate[ds];
          const score = scoreByDate[ds];
          const bucket = bucketOf(score?.compositeScore);
          const isToday = ds === todayStr;
          const hasNote = includeNotes && !!log?.note?.trim();
          const minutes = totalMinutes(log);
          const hasWorkouts = minutes > 0;

          return (
            <div
              key={day}
              onClick={() => log && onDayClick(ds)}
              className="relative rounded-md py-1 text-center"
              style={{
                minHeight: 32,
                background: bucket ? BUCKET_COLORS[bucket] : "transparent",
                color: log ? "#fff" : MU,
                border: isToday
                  ? `2px solid ${A}`
                  : `1px solid ${log ? "transparent" : BO}`,
                cursor: log ? "pointer" : "default",
              }}
            >
              <div className="text-[10px] font-bold leading-tight">{day}</div>
              {log?.isRestDay && (
                <span className="absolute -top-2 -right-2 text-lg">🛌</span>
              )}
              {log?.effort > 4 && (
                <span className="absolute -top-2 -left-2 text-lg">⚡</span>
              )}
              {hasWorkouts && (
                <div className="text-[9px] font-bold opacity-90">
                  {minutes}m
                </div>
              )}
              {hasNote && (
                <div
                  className="absolute -bottom-2 -right-2"
                  style={{ zIndex: 10 }}
                >
                  <NoteIcon size={18} />
                </div>
              )}
              {log?.soreness >= 4 && (
                <span
                  className="absolute -bottom-2 -left-2 text-lg"
                  style={{ zIndex: 10 }}
                >
                  🔥
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Icon legend */}
      <div
        className="px-4 py-2 flex flex-wrap gap-x-4 gap-y-1.5 border-t"
        style={{ borderColor: BO }}
      >
        {legendItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-1.5 text-[10px] font-semibold"
            style={{ color: TX }}
          >
            <span className="inline-flex items-center justify-center w-4 h-4">
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Sessions / minutes / rest days footer */}
      <div
        className="px-4 py-3 border-t grid grid-cols-3 text-center"
        style={{ borderColor: BO }}
      >
        <div>
          <div className="text-lg font-black" style={{ color: A }}>
            {monthSessions}
          </div>
          <div
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: MU }}
          >
            {t.sessions ?? "Sessions"}
          </div>
        </div>
        <div>
          <div className="text-lg font-black" style={{ color: A }}>
            {monthTotalMins}
          </div>
          <div
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: MU }}
          >
            {t.totalMinutes ?? "Minutes"}
          </div>
        </div>
        <div>
          <div className="text-lg font-black" style={{ color: A }}>
            {monthRestDays}
          </div>
          <div
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: MU }}
          >
            {t.restDays ?? "Rest days"}
          </div>
        </div>
      </div>
    </div>
  );
}

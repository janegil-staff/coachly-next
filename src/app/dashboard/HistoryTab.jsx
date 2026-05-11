"use client";
// HistoryTab — full replacement of the previous version.
// Ported from recover's log/page.jsx, with semantics adapted for fitness.
//
// Layout (top to bottom):
//   • PeriodRibbon       — summary stats (streak, last training, etc.)
//   • TimelineScrubber   — horizontal day-strip with milestone/break markers
//   • FilterChips        — filter row with per-category counts
//   • Search input       — by note text or exercise name/slug
//   • Day cards          — LogRow per day, sorted newest first
import { useState, useMemo } from "react";

import { BO, MU, SU, TX } from "@/components/dashboard/calendar/theme";
import { fmtDate } from "@/components/dashboard/calendar/helpers";
import {
  buildContext,
  computeEvents,
} from "@/components/dashboard/log/eventDetection";
import PeriodRibbon from "@/components/dashboard/log/PeriodRibbon";
import TimelineScrubber from "@/components/dashboard/log/TimelineScrubber";
import FilterChips from "@/components/dashboard/log/FilterChips";
import LogRow from "@/components/dashboard/log/LogRow";

export default function HistoryTab({ logs, scores, t, includeNotes }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [focusDate, setFocusDate] = useState(null);

  // Build context (milestones, streak breaks) from ascending-sorted full list
  const ctx = useMemo(() => {
    if (!logs?.length) return { milestones: {}, streakBreaks: {} };
    const sortedAsc = [...logs].sort((a, b) =>
      String(a.date ?? a.createdAt).localeCompare(
        String(b.date ?? b.createdAt),
      ),
    );
    return buildContext(sortedAsc);
  }, [logs]);

  // Logs sorted descending for display
  const allLogs = useMemo(() => {
    if (!logs?.length) return [];
    return [...logs].sort((a, b) =>
      String(b.date ?? b.createdAt).localeCompare(
        String(a.date ?? a.createdAt),
      ),
    );
  }, [logs]);

  // Compute events for every log once, then filter
  const logsWithEvents = useMemo(() => {
    return allLogs.map((log) => {
      const ds = fmtDate(log.date ?? log.createdAt);
      const recCtx = {
        milestoneOn: ctx.milestones[ds] ? ds : null,
        milestoneLength: ctx.milestones[ds],
        streakBreakOn: ctx.streakBreaks[ds] ? ds : null,
        streakBreakAfter: ctx.streakBreaks[ds],
      };
      return { log, events: computeEvents(log, recCtx, t) };
    });
  }, [allLogs, ctx, t]);

  // Filter chip counts (over the full list)
  const counts = useMemo(() => {
    const c = {
      all: logsWithEvents.length,
      trainingDays: 0,
      restDays: 0,
      highSoreness: 0,
      highEffort: 0,
      notes: 0,
      milestones: 0,
    };
    logsWithEvents.forEach(({ log, events }) => {
      if (events._isTraining) c.trainingDays++;
      if (events._isRest) c.restDays++;
      if (typeof log.soreness === "number" && log.soreness >= 4)
        c.highSoreness++;
      if (typeof log.effort === "number" && log.effort >= 4) c.highEffort++;
      if (log.note?.trim()) c.notes++;
      if (events.some((e) => e.key === "milestone")) c.milestones++;
    });
    return c;
  }, [logsWithEvents]);

  // Apply filter + search
  const filtered = useMemo(() => {
    let arr = logsWithEvents;
    if (activeFilter !== "all") {
      arr = arr.filter(({ log, events }) => {
        if (activeFilter === "trainingDays") return events._isTraining;
        if (activeFilter === "restDays") return events._isRest;
        if (activeFilter === "highSoreness")
          return typeof log.soreness === "number" && log.soreness >= 4;
        if (activeFilter === "highEffort")
          return typeof log.effort === "number" && log.effort >= 4;
        if (activeFilter === "notes") return !!log.note?.trim();
        if (activeFilter === "milestones")
          return events.some((e) => e.key === "milestone");
        return true;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter(({ log }) => {
        if ((log.note ?? "").toLowerCase().includes(q)) return true;
        const ws = Array.isArray(log.workouts) ? log.workouts : [];
        return ws.some((w) => {
          if ((w.name ?? "").toLowerCase().includes(q)) return true;
          if ((w.exerciseSlug ?? "").toLowerCase().includes(q)) return true;
          if ((w.type ?? "").toLowerCase().includes(q)) return true;
          return false;
        });
      });
    }
    return arr;
  }, [logsWithEvents, activeFilter, search]);

  const handleJump = (ds) => {
    setFocusDate(ds);
    setActiveFilter("all");
    setSearch("");
    setTimeout(() => {
      const el = document.querySelector(`[data-date="${ds}"]`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  if (!logs?.length) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: MU }}>
        {t.noLogs ?? "No logs to display."}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        maxWidth: 880,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <PeriodRibbon logs={allLogs} t={t} />
      <TimelineScrubber
        logs={allLogs}
        ctx={ctx}
        onJump={handleJump}
        t={t}
      />
      <FilterChips
        activeFilter={activeFilter}
        setFilter={setActiveFilter}
        counts={counts}
        t={t}
      />

      {/* Search */}
      <div style={{ marginBottom: 10 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`🔍 ${t.searchLogs ?? "Search notes or exercises"}…`}
          style={{
            width: "100%",
            background: SU,
            border: `1px solid ${BO}`,
            borderRadius: 8,
            padding: "9px 13px",
            fontSize: 13,
            color: TX,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
      </div>

      {/* Day cards */}
      {filtered.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {filtered.map(({ log, events }, i) => (
            <LogRow
              key={fmtDate(log.date ?? log.createdAt) + i}
              log={log}
              events={events}
              t={t}
              focusDate={focusDate}
              includeNotes={includeNotes}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            background: SU,
            borderRadius: 12,
            border: `1px solid ${BO}`,
            padding: 40,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: 13, color: MU }}>
            {t.noMatchingLogs ?? "No logs match the current filter."}
          </div>
        </div>
      )}
    </div>
  );
}
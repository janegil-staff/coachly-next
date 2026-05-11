"use client";
// Compact year-at-a-glance heatmap. 7 rows (weekdays) × 52-53 columns
// (weeks of the year). Cell color reflects daily score bucket, or grey
// if no log that day. Hover for date+bucket; click jumps to month.
import { useMemo } from "react";
import { BO, MU, SU } from "./theme";
import { BUCKET_COLORS } from "./constants";
import { fmtDate, pad } from "./helpers";

function bucketOf(score) {
  if (score == null) return null;
  if (score >= 80) return 5;
  if (score >= 60) return 4;
  if (score >= 40) return 3;
  if (score >= 20) return 2;
  return 1;
}

export default function YearInPixels({ data, t, currentMonth, onMonthJump }) {
  const scoreMap = useMemo(() => {
    const m = {};
    (data?.scores ?? []).forEach((s) => {
      if (s.date) m[s.date] = s;
    });
    return m;
  }, [data]);

  // Build the 12-month grid for the year of currentMonth
  const year = currentMonth?.y ?? new Date().getFullYear();
  const months = useMemo(() => {
    const monthsT = t.monthsShort ?? [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const out = [];
    for (let m = 0; m < 12; m++) {
      const days = new Date(year, m + 1, 0).getDate();
      const cells = [];
      for (let d = 1; d <= days; d++) {
        const ds = `${year}-${pad(m + 1)}-${pad(d)}`;
        const score = scoreMap[ds]?.compositeScore;
        cells.push({ ds, day: d, score, bucket: bucketOf(score) });
      }
      out.push({ m, name: monthsT[m], cells });
    }
    return out;
  }, [year, scoreMap, t]);

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        padding: 12,
        boxShadow: "var(--shadow-card)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "var(--accent)",
            letterSpacing: 1.2,
            textTransform: "uppercase",
          }}
        >
          {t.yearAtAGlance ?? "Year at a glance"}
        </div>
        <div style={{ fontSize: 10, color: MU, fontWeight: 600 }}>{year}</div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          flex: 1,
        }}
      >
        {months.map((month) => (
          <div
            key={month.m}
            style={{
              flex: "1 0 0",
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
            }}
            onClick={() => onMonthJump && onMonthJump({ y: year, m: month.m })}
            title={`${month.name} ${year}`}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 1,
                aspectRatio: "1 / 1",
              }}
            >
              {month.cells.map((c) => (
                <div
                  key={c.day}
                  style={{
                    aspectRatio: "1 / 1",
                    background: c.bucket
                      ? BUCKET_COLORS[c.bucket]
                      : "var(--bg)",
                    border: `1px solid ${BO}`,
                    borderRadius: 2,
                  }}
                  title={
                    c.score != null
                      ? `${c.ds}: ${Math.round(c.score)}/100`
                      : `${c.ds}: ${t.noLog ?? "no log"}`
                  }
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 8,
                color: MU,
                textAlign: "center",
                marginTop: 4,
                fontWeight: 600,
              }}
            >
              {month.name}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 9,
          color: MU,
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        {t.clickToJump ?? "Click any month to jump"}
      </div>
    </div>
  );
}
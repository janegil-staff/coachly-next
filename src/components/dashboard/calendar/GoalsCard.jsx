"use client";
// Small body content for the Goal Check-in nested collapsible.
// The wrapping CollapsibleCard provides the title; this only renders the
// score, status pill, and "Read more" link that opens GoalsDetailModal.
import { A, MU } from "./theme";
import { GOALS_STATUS_COLORS } from "./theme";

export default function GoalsCard({ data, t, onReadMore }) {
  if (!data) {
    return (
      <div className="text-xs pt-2" style={{ color: MU }}>
        {t.goalsNever ?? "Not completed"}
      </div>
    );
  }
  const s = data.scores || {};
  const statusKey = "goalsStatus_" + (s.status ?? "ontrack");
  const color = GOALS_STATUS_COLORS[s.status] ?? A;

  return (
    <>
      <div className="flex items-center justify-between pt-2">
        <div>
          <div className="text-2xl font-black" style={{ color }}>
            {s.avg ?? "—"}
            <span className="text-xs font-bold ml-1" style={{ color: MU }}>
              /5
            </span>
          </div>
          <div
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color }}
          >
            {t[statusKey] ?? s.status}
          </div>
        </div>
        <div className="text-right text-[10px]" style={{ color: MU }}>
          {data.date}
        </div>
      </div>
      <button
        onClick={onReadMore}
        className="mt-3 text-[11px] font-bold uppercase tracking-wider"
        style={{ color: A }}
      >
        {t.readMore ?? "Read more"} →
      </button>
    </>
  );
}

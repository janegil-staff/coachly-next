"use client";
// Generic collapsible card shell with chevron + title (+ optional badge /
// right-slot). Used for the right-column sidebar items, including nested
// items inside the Questionnaires card.
//
// Props:
//   title       — string, shown in the header
//   defaultOpen — boolean (default false)
//   badge       — small numeric badge to right of title (e.g. count)
//   rightSlot   — arbitrary element on the far right of the header
//                 (e.g. a date or a count of items)
//   noPadding   — skip the default inner padding (caller will provide own)
//   nested      — render as a lighter, less prominent shell (used when
//                 placing one CollapsibleCard inside another)
import { useState } from "react";
import { A, AL, AD, BG, BO, MU, SU, TX } from "./theme";

export default function CollapsibleCard({
  title,
  defaultOpen = false,
  badge = null,
  rightSlot = null,
  noPadding = false,
  nested = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const titleSize = nested ? "text-[9px]" : "text-[10px]";

  return (
    <div
      className={
        nested
          ? "rounded-xl border overflow-hidden"
          : "rounded-2xl border shadow-sm overflow-hidden"
      }
      style={{
        background: nested ? BG : SU,
        borderColor: BO,
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between ${
          nested ? "px-3 py-2" : "px-4 py-3"
        }`}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold"
            style={{ color: MU, width: 8, display: "inline-block" }}
          >
            {open ? "▾" : "▸"}
          </span>
          <span
            className={`${titleSize} font-bold tracking-widest uppercase`}
            style={{ color: nested ? TX : A }}
          >
            {title}
          </span>
          {badge != null && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: AL,
                color: AD,
                minWidth: 18,
                textAlign: "center",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        {rightSlot}
      </button>
      {open && (
        <div
          className={noPadding ? "" : nested ? "px-3 pb-3" : "px-4 pb-4"}
          style={{ borderTop: `1px solid ${nested ? BO : BG}` }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

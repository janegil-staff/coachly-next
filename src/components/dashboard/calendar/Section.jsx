"use client";
// Small primitives reused across the dashboard.
//   • Section: collapsible labeled container with consistent styling
//   • Pill: compact rounded badge
import { useState } from "react";
import { A, BO, MU, SU, TX } from "./theme";

export function Section({
  title,
  children,
  defaultOpen = true,
  collapsible = false,
  right = null,
  noPadding = false,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        background: SU,
        borderRadius: 12,
        border: `1px solid ${BO}`,
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      {title && (
        <div
          onClick={collapsible ? () => setOpen((o) => !o) : undefined}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 14px",
            borderBottom: open ? `1px solid var(--bg)` : "none",
            cursor: collapsible ? "pointer" : "default",
            userSelect: collapsible ? "none" : "auto",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: A,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {collapsible && (
              <span style={{ fontSize: 9, color: MU }}>
                {open ? "▾" : "▸"}
              </span>
            )}
            {title}
          </div>
          {right}
        </div>
      )}
      {open && (
        <div style={{ padding: noPadding ? 0 : 14 }}>{children}</div>
      )}
    </div>
  );
}

export function Pill({ children, color, bg }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        color: color ?? TX,
        background: bg ?? "var(--bg)",
        border: `1px solid ${BO}`,
        letterSpacing: 0.3,
      }}
    >
      {children}
    </span>
  );
}

"use client";
// Sticky top header for the dashboard. Renders:
//   • Coachly logo + "Coach view" tagline
//   • Profile pills (age, gender, height, weight) when present
//   • Theme toggle, PDF button, sign-out
//   • Tab bar (Calendar / History / Graphs)
import ThemeToggle from "@/components/ThemeToggle";
import {
  A,
  AD,
  AL,
  BO,
  MU,
  SU,
  TX,
} from "@/components/dashboard/calendar/theme";

export default function HeaderBar({
  tab,
  setTab,
  profile,
  onPdf,
  onSignOut,
  t,
  pdfBusy,
}) {
  const Tab = ({ id, label, icon }) => {
    const active = tab === id;
    return (
      <button
        onClick={() => setTab(id)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 transition-colors"
        style={{
          color: active ? A : MU,
          borderColor: active ? A : "transparent",
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
        <div className="flex items-center gap-2">
          <img
            src="/coachly-logo.png"
            alt="Coachly"
            className="w-8 h-8 rounded-lg object-contain"
          />
          <div>
            <div className="font-bold leading-tight" style={{ color: TX }}>
              Coachly
            </div>
            <div className="text-[10px]" style={{ color: MU }}>
              {t.coachView ?? "Coach view"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profile?.age != null && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: AL, color: AD }}
            >
              {profile.age}y
            </span>
          )}
          {profile?.gender && profile.gender !== "undefined" && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: AL, color: AD }}
            >
              {profile.gender}
            </span>
          )}
          {profile?.heightCm != null && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: AL, color: AD }}
            >
              {profile.heightCm}cm
            </span>
          )}
          {profile?.weightKg != null && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: AL, color: AD }}
            >
              {profile.weightKg}kg
            </span>
          )}
          <ThemeToggle />
          <button
            onClick={onPdf}
            disabled={pdfBusy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
            style={{ background: AD, color: "#fff" }}
          >
            <span>↓</span> {pdfBusy ? "…" : "PDF"}
          </button>
          <button
            onClick={onSignOut}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: BO, color: TX }}
          >
            {t.signOut ?? "Sign out"}
          </button>
        </div>
      </div>

      <div className="px-6 flex gap-1">
        <Tab id="calendar" label={t.calendar ?? "Calendar"} icon="📅" />
        <Tab id="history" label={t.history ?? "History"} icon="📋" />
        <Tab id="graphs" label={t.graphs ?? "Graphs"} icon="📈" />
      </div>
    </header>
  );
}

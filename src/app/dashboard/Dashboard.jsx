"use client";
// Slim orchestrator for the coach dashboard. Pure top-level glue:
//   • Resolves translations from the `lang` prop
//   • Manages the active tab (calendar / history / graphs)
//   • Manages the PDF export modal open/closed state
//   • Renders HeaderBar + the active tab + the PDF modal
//
// All real UI lives in the tab components.
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { getTranslations } from "@/lib/translations";
import HistoryTab from "./HistoryTab";
import GraphsTab from "./GraphsTab";
import PdfExportModal from "./PdfExportModal";

import HeaderBar from "./HeaderBar";
import CalendarTab from "./CalendarTab";

export default function Dashboard({ report, lang, code }) {
  const router = useRouter();
  const t = useMemo(() => getTranslations(lang), [lang]);
  const [tab, setTab] = useState("calendar");
  const [showPdfModal, setShowPdfModal] = useState(false);

  const {
    client,
    stats,
    logs,
    scores,
    latestGoals,
    exercises,
    includeNotes,
  } = report;
  const profile = client?.profile ?? {};

  const handleSignOut = () => {
    sessionStorage.removeItem("coachlyReport");
    sessionStorage.removeItem("coachlyLang");
    sessionStorage.removeItem("coachlyCode");
    router.push("/");
  };

  return (
    <main className="min-h-screen">
      <HeaderBar
        tab={tab}
        setTab={setTab}
        profile={profile}
        onPdf={() => setShowPdfModal(true)}
        onSignOut={handleSignOut}
        t={t}
        pdfBusy={false}
      />

      <div className="px-4 py-6">
        {tab === "calendar" && (
          <CalendarTab
            logs={report.logs}
            profile={profile}
            scores={report.scores}
            stats={report.stats}
            latestHooper={report.latestHooper}
            latestRestq={report.latestRestq}
            latestGoals={report.latestGoals}
            latestPss10={report.latestPss10}
            latestPsqi={report.latestPsqi}
            latestIpaq={report.latestIpaq}
            exercises={report.exercises}
            t={t}
            lang={lang}
            includeNotes={includeNotes}
          />
        )}
        {tab === "history" && (
          <HistoryTab
            logs={logs}
            scores={scores}
            t={t}
            includeNotes={includeNotes}
          />
        )}
        {tab === "graphs" && (
          <GraphsTab
            logs={logs}
            scores={scores}
            latestGoals={report.latestGoals}
            t={t}
          />
        )}
      </div>

      {showPdfModal && (
        <PdfExportModal
          data={report}
          t={t}
          onClose={() => setShowPdfModal(false)}
        />
      )}
    </main>
  );
}
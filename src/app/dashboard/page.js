"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dashboard from "./Dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [lang, setLang] = useState("en");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("coachlyReport");
      const storedLang = sessionStorage.getItem("coachlyLang") ?? "en";
      const storedCode = sessionStorage.getItem("coachlyCode") ?? "";
      if (!raw) {
        setError("no-data");
        return;
      }
      setReport(JSON.parse(raw));
      setLang(storedLang);
      setCode(storedCode);
    } catch (e) {
      setError(e?.message ?? "load-failed");
    }
  }, []);

  if (error === "no-data") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-3xl font-bold text-brand-darker mb-3">
          No report data
        </h1>
        <p className="text-slate-600 mb-6">
          Please enter your share code on the home page first.
        </p>
        <button
          onClick={() => router.push("/")}
          className="inline-block px-6 py-3 rounded-xl bg-brand text-white text-sm font-bold tracking-widest shadow-md hover:bg-brand-darker"
        >
          ← Back
        </button>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20 text-center text-slate-500">
        Loading…
      </main>
    );
  }

  return <Dashboard report={report} lang={lang} code={code} />;
}
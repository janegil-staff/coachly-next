"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LANGUAGES, getTranslations } from "@/src/lib/translations";

export default function HomePage() {
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const t = useMemo(() => getTranslations(lang), [lang]);

  const submit = async (e) => {
    e.preventDefault();
    const clean = code.replace(/\D/g, "").slice(0, 6);
    if (clean.length !== 6) {
      setError(t.invalidCodeFormat ?? "Enter a 6-digit code.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const json = await res.json();
      if (!json.valid) {
        setError(json.message ?? "Invalid or expired code.");
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem("coachlyReport", JSON.stringify(json.report));
      sessionStorage.setItem("coachlyLang", lang);
      sessionStorage.setItem("coachlyCode", clean);
      router.push("/dashboard");
    } catch (err) {
      setError(err?.message ?? "Network error.");
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-10 items-start">
        <div className="flex flex-col gap-10">
          {/* CHANGE 1: header gets order-1 on mobile, resets on desktop */}
          <div className="max-w-2xl order-1 lg:order-none">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-brand flex items-center justify-center shadow-md">
                <Image
                  src="/coachly-logo.png"
                  alt="Coachly"
                  width={128}
                  height={128}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-brand-darker leading-tight">
                  Your Coachly
                </h1>
                <p className="mt-1 text-brand-light tracking-wider text-xs font-semibold">
                  {t.heroTagline}
                </p>
              </div>
            </div>
            <p className="mt-5 text-slate-700 leading-relaxed">{t.heroDesc}</p>
          </div>

          {/* CHANGE 2: phones get order-3 on mobile so they appear last */}
          <div className="flex justify-center lg:justify-start items-end gap-3 sm:gap-5 order-3 lg:order-none">
            <div className="hidden sm:block w-[130px] sm:w-[150px] lg:w-[170px] drop-shadow-2xl">
              <Image
                src="/screenshots/login.png"
                alt="Coachly login"
                width={440}
                height={950}
                className="w-full h-auto rounded-[1.8rem] border-[5px] border-slate-900 bg-slate-900"
                priority
              />
            </div>
            <div className="w-[160px] sm:w-[180px] lg:w-[200px] -mb-4 drop-shadow-2xl">
              <Image
                src="/screenshots/home.png"
                alt="Coachly home"
                width={440}
                height={950}
                className="w-full h-auto rounded-[1.8rem] border-[5px] border-slate-900 bg-slate-900"
                priority
              />
            </div>
            <div className="hidden sm:block w-[130px] sm:w-[150px] lg:w-[170px] drop-shadow-2xl">
              <Image
                src="/screenshots/diary.png"
                alt="Coachly diary"
                width={440}
                height={950}
                className="w-full h-auto rounded-[1.8rem] border-[5px] border-slate-900 bg-slate-900"
              />
            </div>
          </div>

          {/* CHANGE 3: NEW — input form rendered INSIDE the left column on mobile only.
              On desktop (lg+) this is hidden and the original right-column form below shows. */}
          <div className="order-2 lg:hidden flex flex-col gap-3 w-full max-w-md mx-auto">
            <InputCard
              t={t}
              lang={lang}
              setLang={setLang}
              code={code}
              setCode={setCode}
              error={error}
              setError={setError}
              submitting={submitting}
              submit={submit}
            />
          </div>
        </div>

        {/* Original right-column form — hidden on mobile, shown lg+ */}
        <div className="hidden lg:flex flex-col gap-3 w-full max-w-md mx-auto lg:mx-0">
          <InputCard
            t={t}
            lang={lang}
            setLang={setLang}
            code={code}
            setCode={setCode}
            error={error}
            setError={setError}
            submitting={submitting}
            submit={submit}
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <p className="text-slate-500 text-sm text-center max-w-md">
          {t.appStoreAvailable}
          <br />
          {t.appStoreDownload}
        </p>
        <div className="flex gap-3">
          <button className="px-5 py-3 rounded-xl bg-brand-darker text-white text-sm font-semibold shadow-md">
            {t.appStore}
          </button>
          <button className="px-5 py-3 rounded-xl bg-brand-darker text-white text-sm font-semibold shadow-md">
            ▶ {t.googlePlay}
          </button>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={
                "text-2xl transition-transform " +
                (lang === l.code ? "scale-125" : "opacity-60 hover:opacity-100")
              }
              aria-label={l.label}
            >
              {l.flag}
            </button>
          ))}
        </div>
        <footer className="mt-12 text-center text-xs text-slate-500">
          <p>
            {t.copyright} ·{" "}
            <a
              href={"mailto:" + t.contact}
              className="text-brand hover:underline"
            >
              {t.contact}
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
function InputCard({
  t,
  lang,
  setLang,
  code,
  setCode,
  error,
  setError,
  submitting,
  submit,
}) {
  return (
    <>
      <div className="relative">
        <select
          aria-label={t.chooseLanguage}
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="w-full appearance-none px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-white text-base font-medium shadow-sm hover:border-brand-lighter focus:outline-none focus:ring-2 focus:ring-brand-lighter"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.flag + "  " + l.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          ▼
        </span>
      </div>

      <form
        onSubmit={submit}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      >
        <div className="relative w-full aspect-[3/2] bg-slate-50 overflow-hidden">
          <Image
            src="/illustrations/card-hero.png"
            alt="Coaches"
            fill
            sizes="(max-width: 768px) 100vw, 440px"
            className="object-cover"
            priority
          />
        </div>
        <div className="p-7">
          <h2 className="text-center text-sm font-bold tracking-widest text-brand mb-5">
            {t.importDataTitle}
          </h2>
          <label className="block text-xs font-semibold tracking-wider text-slate-600 mb-2">
            {t.codeLabel}
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={6}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder={t.codePlaceholder}
            disabled={submitting}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-1xl tracking-[0.5em] text-center font-bold text-brand-darker focus:outline-none focus:ring-2 focus:ring-brand-lighter disabled:opacity-60"
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: "#4a7ab5" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d4a6e")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#4a7ab5")
            }
            className="mt-5 w-full py-4 rounded-xl text-white text-sm font-black tracking-widest shadow-lg transition-colors disabled:opacity-60"
          >
            {submitting ? "..." : t.startBtn}
          </button>
        </div>
      </form>
    </>
  );
}

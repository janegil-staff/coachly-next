"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getTranslations, LANGUAGES } from "@/lib/translations";

// ─── Store URLs ──────────────────────────────────────────────────────────
// Update these once your apps are live in their stores.
//
// To find the App Store URL once Coachly is approved:
//   App Store Connect → Coachly → top of page shows the URL
//   OR on iPhone: search Coachly → Share → Copy Link
//
// To find the Play Store URL once Coachly is approved:
//   Play Console → Coachly → package name (e.g. com.qup.coachly)
//   OR on Android: search Coachly → Share → Copy Link
//
// Format reference:
//   App Store:  https://apps.apple.com/app/coachly/id1234567890
//   Play Store: https://play.google.com/store/apps/details?id=com.qup.coachly
const APP_STORE_URL = "https://apps.apple.com/app/coachly/id6766060889";

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.qup.coachly";

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

        {/* Store buttons — visible, working anchors with logos */}
        <div className="flex gap-3 flex-wrap justify-center">
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
            style={{ backgroundColor: "#2d4a6e" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1a2c3d")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d4a6e")
            }
            aria-label={t.appStore ?? "App Store"}
          >
            {/* Apple logo */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            {t.appStore ?? "App Store"}
          </a>

          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-md transition-colors flex items-center gap-2"
            style={{ backgroundColor: "#2d4a6e" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#1a2c3d")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#2d4a6e")
            }
            aria-label={t.googlePlay ?? "Google Play"}
          >
            {/* Google Play logo (4-color triangle) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M3.609 1.814 13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z"
                fill="#34a853"
              />
              <path
                d="m13.792 12 3.064-3.064 4.493 2.557a1 1 0 0 1 0 1.014l-4.493 2.557L13.792 12z"
                fill="#fbbc04"
              />
              <path
                d="m16.856 8.936-3.064 3.064L3.61 1.814a.996.996 0 0 1 .998-.014l12.248 7.136z"
                fill="#ea4335"
              />
              <path
                d="m13.792 12 3.064 3.064L4.608 22.2a.996.996 0 0 1-.998-.014L13.792 12z"
                fill="#4285f4"
              />
            </svg>
            {t.googlePlay ?? "Google Play"}
          </a>
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
            
             <a href={"mailto:" + t.contact}
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
// src/app/dashboard/PdfExportModal.jsx
"use client";
import { useState, useCallback, useMemo } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const A = "#4a7ab5",
  AD = "#2d4a6e",
  BO = "#d0dcea",
  MU = "#7a9ab8";
const SU = "#ffffff",
  BG = "#eef2f7";

// Category palette — must match the dashboard's category coloring
const CAT_COLORS = {
  strength: "#7986cb",
  cardio: "#ef5350",
  mobility: "#66bb6a",
  recovery: "#26a69a",
  other: "#bdbdbd",
};

// Display order for the category legend — always shown in this order
// regardless of whether the client has logged minutes in each.
const ALL_CATEGORIES = ["strength", "cardio", "mobility", "recovery", "other"];

// Status colors for the goals radar — match the modal version
const GOALS_STATUS_COLORS = {
  stalled: "#EF4444",
  drifting: "#F59E0B",
  ontrack: "#4A7AB5",
  strong: "#22C55E",
};

// Short labels for the goals radar axes — full question text doesn't fit
const GOALS_AXIS_KEYS = [
  { qKey: "goalsAxis1", fallback: "Clarity" },
  { qKey: "goalsAxis2", fallback: "Progress" },
  { qKey: "goalsAxis3", fallback: "Motivation" },
  { qKey: "goalsAxis4", fallback: "Obstacles" },
  { qKey: "goalsAxis5", fallback: "Support" },
];

// Period preset definitions. Order is the order they appear as buttons.
// `months` is the rolling-window size in months; null means "all time".
const PERIOD_PRESETS = [
  { key: "1", months: 1, labelKey: "lastMonth", fallback: "Last month" },
  { key: "3", months: 3, labelKey: "last3Months", fallback: "Last 3 months" },
  { key: "6", months: 6, labelKey: "last6Months", fallback: "Last 6 months" },
  {
    key: "12",
    months: 12,
    labelKey: "last12Months",
    fallback: "Last 12 months",
  },
  { key: "all", months: null, labelKey: "allTime", fallback: "All time" },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function pad(n) {
  return String(n).padStart(2, "0");
}
function fmtDate(d) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}
function shortDate(d) {
  const dt = new Date(d);
  return `${pad(dt.getMonth() + 1)}/${pad(dt.getDate())}`;
}
function avgOf(arr, field) {
  const v = arr.map((x) => x[field]).filter((x) => typeof x === "number");
  return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null;
}

// Total minutes for a log. Prefer categoryDurations (authoritative
// post-schema-migration); fall back to workouts[].durationMinutes.
function logTotalMinutes(log) {
  if (!log) return 0;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length)
    return cd.reduce((s, c) => s + (Number(c?.durationMinutes) || 0), 0);
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  return ws.reduce((s, w) => s + (Number(w?.durationMinutes) || 0), 0);
}

// Per-category minutes for a log, returned as { type: minutes }.
function logCategoryMinutes(log) {
  const out = {};
  if (!log) return out;
  const cd = Array.isArray(log.categoryDurations) ? log.categoryDurations : [];
  if (cd.length) {
    cd.forEach((c) => {
      const k = (c.type || "other").toLowerCase();
      out[k] = (out[k] || 0) + (Number(c?.durationMinutes) || 0);
    });
    return out;
  }
  const ws = Array.isArray(log.workouts) ? log.workouts : [];
  ws.forEach((w) => {
    const k = (w.type || w.category || "other").toLowerCase();
    out[k] = (out[k] || 0) + (Number(w?.durationMinutes) || 0);
  });
  return out;
}

function categoryLabel(name, t) {
  const key = "category" + name.charAt(0).toUpperCase() + name.slice(1);
  return t[key] ?? name.charAt(0).toUpperCase() + name.slice(1);
}

function startOfWeek(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = x.getDate() - (day === 0 ? 6 : day - 1);
  x.setDate(diff);
  return x;
}

// Compute the cutoff date for a "last N months" rolling window.
// Returns a Date that's exactly N × 30 days before now.
// Rolling-window semantics: simple and predictable. Coaches scanning
// a "last 3 months" report don't expect calendar-month boundaries.
function rollingCutoff(months) {
  if (months == null) return null;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - months * 30);
  cutoff.setHours(0, 0, 0, 0);
  return cutoff;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
async function captureElement(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    const canvas = await window.html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png");
  } catch (e) {
    console.warn("capture failed", id, e);
    return null;
  }
}

// ── PDF generator ──────────────────────────────────────────────────────────
async function generatePDF({ data, t, periodLabel, logs }) {
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js",
  );
  await loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  );
  await new Promise((r) => setTimeout(r, 800));

  const [
    trendsImg,
    radarImg,
    categoryImg,
    volumeImg,
    scoresImg,
    restqImg,
    goalsImg,
  ] = await Promise.all([
    captureElement("pdf-chart-trends"),
    captureElement("pdf-chart-radar"),
    captureElement("pdf-chart-category"),
    captureElement("pdf-chart-volume"),
    captureElement("pdf-chart-scores"),
    captureElement("pdf-chart-restq"),
    captureElement("pdf-chart-goals"),
  ]);

  const JsPDF = window.jspdf.jsPDF;
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210,
    ML = 14,
    MR = 14,
    CW = W - ML - MR;
  let y = 0;

  const NAVY = [45, 74, 110],
    GRAY = [122, 154, 184],
    LGRAY = [245, 247, 250];
  const DARK = [26, 44, 61],
    WHITE = [255, 255, 255];

  function checkPage(need = 10) {
    if (y + need > 272) {
      doc.addPage();
      y = 16;
    }
  }

  function sectionHeader(text) {
    checkPage(10);
    y += 4;
    doc.setDrawColor(200, 212, 226);
    doc.setLineWidth(0.3);
    doc.line(ML, y, W - MR, y);
    y += 4;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(), ML, y);
    y += 5;
    doc.setTextColor(...DARK);
  }

  function colHeader(text, x, atY) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...GRAY);
    doc.text(text.toUpperCase(), x, atY);
    doc.setTextColor(...DARK);
  }

  function row(label, value, shade = false) {
    checkPage(7);
    if (shade) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, y, CW, 6, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(String(label), ML + 2, y + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(value ?? "—"), ML + 60, y + 4);
    y += 6;
  }

  function addChart(imgData, label, h = 55) {
    if (!imgData) return;
    checkPage(h + 6);
    if (label) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GRAY);
      doc.text(label, ML, y + 3);
      y += 5;
    }
    doc.addImage(imgData, "PNG", ML, y, CW, h);
    y += h + 3;
  }

  function addChartPair(img1, img2, h = 62) {
    if (!img1 && !img2) return;
    checkPage(h + 6);
    const half = (CW - 4) / 2;
    if (img1) doc.addImage(img1, "PNG", ML, y, half, h);
    if (img2) doc.addImage(img2, "PNG", ML + half + 4, y, half, h);
    y += h + 3;
  }

  const allLogs = data.logs ?? [];
  const client = data.client ?? {};
  const profile = client.profile ?? {};

  // ── Header ────────────────────────────────────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, W, 22, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Coachly", ML, 11);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(t.clientReport ?? "Client Report", ML, 17);
  doc.text(periodLabel, W - MR, 11, { align: "right" });
  doc.text(new Date().toLocaleDateString(), W - MR, 17, { align: "right" });
  y = 28;

  // ── Patient + Body Metrics side by side ───────────────────────────────
  const heightCm = profile.heightCm;
  const weightKg = profile.weightKg;
  const bmi =
    weightKg && heightCm ? (weightKg / (heightCm / 100) ** 2).toFixed(1) : null;

  checkPage(10);
  y += 4;
  doc.setDrawColor(200, 212, 226);
  doc.setLineWidth(0.3);
  doc.line(ML, y, W - MR, y);
  y += 4;
  const halfCW = (CW - 8) / 2;
  const rightX = ML + halfCW + 8;
  colHeader(t.client ?? "Client", ML, y);
  colHeader(t.bodyMetrics ?? "Body Metrics", rightX, y);
  y += 5;
  const startY = y;

  const memberSinceStr = client.memberSince
    ? new Date(client.memberSince).toLocaleDateString()
    : "—";

  const patRows = [
    [t.email ?? "Email", client.email ?? "—"],
    [t.age ?? "Age", profile.age ?? "—"],
    [t.gender ?? "Gender", profile.gender ?? "—"],
    [t.memberSince ?? "Member since", memberSinceStr],
  ];
  let ly = startY;
  patRows.forEach(([l, v], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, ly, halfCW, 5, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(l, ML + 2, ly + 3.5);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(v).slice(0, 32), ML + 32, ly + 3.5);
    ly += 5;
  });

  let ry = startY;
  const wRows = [
    [t.height ?? "Height", heightCm ? `${heightCm} cm` : "—"],
    [t.weight ?? "Weight", weightKg ? `${weightKg} ${t.kg ?? "kg"}` : "—"],
    [t.bmi ?? "BMI", bmi ?? "—"],
    [t.activityLevel ?? "Activity", profile.activityLevel ?? "—"],
  ];
  wRows.forEach(([l, v], i) => {
    if (i % 2 === 1) {
      doc.setFillColor(...LGRAY);
      doc.rect(rightX, ry, halfCW, 5, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(l, rightX + 2, ry + 3.5);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(v), rightX + 32, ry + 3.5);
    ry += 5;
  });

  y = Math.max(ly, ry) + 3;

  // ── Period stats + Goals radar side by side ───────────────────────────
  const totalMin = logs.reduce((a, l) => a + logTotalMinutes(l), 0);
  const restCount = logs.filter((l) => l.isRestDay).length;
  const sessionsCount = logs.reduce((a, l) => a + (l.workouts || []).length, 0);

  sectionHeader(periodLabel);

  const periodRows = [
    [t.daysLogged ?? "Days logged", logs.length],
    [t.sessionsLogged ?? "Sessions", sessionsCount],
    [t.totalHours ?? "Total hours", (totalMin / 60).toFixed(1)],
    [t.restDays ?? "Rest days", restCount],
    [t.avgEffort ?? "Avg effort", avgOf(logs, "effort")],
    [t.avgMood ?? "Avg mood", avgOf(logs, "mood")],
    [t.avgEnergy ?? "Avg energy", avgOf(logs, "energy")],
    [t.avgSleep ?? "Avg sleep", avgOf(logs, "sleepQuality")],
    [t.avgSoreness ?? "Avg soreness", avgOf(logs, "soreness")],
    [t.totalRecords ?? "Total records (all time)", allLogs.length],
  ];

  const hasGoalsRadar = !!goalsImg;
  const leftColW = hasGoalsRadar ? CW * 0.55 : CW;
  const rightColX = ML + leftColW + 4;
  const rightColW = CW - leftColW - 4;

  const rowsHeight = periodRows.length * 6;
  const radarHeight = 62;
  const blockHeight = Math.max(rowsHeight, hasGoalsRadar ? radarHeight : 0);

  checkPage(blockHeight + 4);
  const blockStartY = y;

  // Left column — stat rows
  periodRows.forEach(([label, value], i) => {
    const ry2 = blockStartY + i * 6;
    if (i % 2 === 0) {
      doc.setFillColor(...LGRAY);
      doc.rect(ML, ry2, leftColW, 6, "F");
    }
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY);
    doc.text(String(label), ML + 2, ry2 + 4);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(String(value ?? "—"), ML + leftColW - 16, ry2 + 4);
  });

  // Right column — goals radar
  if (hasGoalsRadar) {
    const radarY = blockStartY + Math.max(0, (rowsHeight - radarHeight) / 2);
    doc.addImage(goalsImg, "PNG", rightColX, radarY, rightColW, radarHeight);
  }

  y = blockStartY + blockHeight + 3;

  // ── Wellbeing trends line chart ───────────────────────────────────────
  if (trendsImg) {
    sectionHeader(t.wellbeingTrends ?? "Wellbeing Trends");
    addChart(trendsImg, null, 55);
  }

  // ── Relevant advice ───────────────────────────────────────────────────
  const relevantAdvice = Array.isArray(profile.relevantAdvice)
    ? profile.relevantAdvice
    : [];

  if (relevantAdvice.length > 0) {
    sectionHeader(t.relevantAdvice ?? "Relevant Tips");

    relevantAdvice.forEach((id) => {
      const title = t["advice_" + id + "_title"];
      const body = t["advice_" + id + "_body"];
      if (!title) return;

      const bodyLines = body ? doc.splitTextToSize(body, CW - 8) : [];
      const tipHeight = 5 + bodyLines.length * 4 + 3;

      checkPage(tipHeight);

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text("•", ML + 2, y + 4);
      doc.text(String(title), ML + 7, y + 4);
      y += 5;

      if (bodyLines.length > 0) {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DARK);
        bodyLines.forEach((line) => {
          doc.text(line, ML + 7, y + 3);
          y += 4;
        });
      }

      y += 3;
    });

    y += 1;
  }

  // ── Wellbeing radar + Category donut side by side ─────────────────────
  if (radarImg || categoryImg) {
    checkPage(80);
    sectionHeader(t.balanceAndCategory ?? "Balance & Category Mix");
    addChartPair(radarImg, categoryImg, 75);
  }

  // ── Weekly volume bar chart ───────────────────────────────────────────
  if (volumeImg) {
    sectionHeader(t.weeklyVolume ?? "Weekly Volume");
    addChart(volumeImg, null, 55);
  }

  // ── Composite score timeline ──────────────────────────────────────────
  if (scoresImg && (data.scores ?? []).length > 0) {
    sectionHeader(t.compositeScore ?? "Composite Score Trend");
    addChart(scoresImg, null, 50);
  }

  // ── Recovery state: Hooper + RestQ ────────────────────────────────────
  if (data.latestHooper || data.latestRestq) {
    sectionHeader(t.recoveryState ?? "Recovery State");

    if (data.latestHooper?.scores) {
      const h = data.latestHooper.scores;
      const dateStr = data.latestHooper.date
        ? new Date(data.latestHooper.date).toLocaleDateString()
        : "—";
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(`${t.hooperScore ?? "Hooper"} (${dateStr})`, ML, y + 4);
      y += 7;
      [
        [t.stress ?? "Stress", h.stress],
        [t.sleep ?? "Sleep", h.sleep],
        [t.fatigue ?? "Fatigue", h.fatigue],
        [t.soreness ?? "Soreness", h.soreness],
        [t.total ?? "Total", `${h.total} (${h.status})`],
      ].forEach(([l, v], i) => row(l, v, i % 2 === 1));
      y += 2;
    }

    if (data.latestRestq?.scores) {
      const r = data.latestRestq.scores;
      const dateStr = data.latestRestq.date
        ? new Date(data.latestRestq.date).toLocaleDateString()
        : "—";
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(`${t.restqScore ?? "RestQ"} (${dateStr})`, ML, y + 4);
      y += 7;
      [
        [t.restqStress ?? "Stress", r.stress],
        [t.restqRecovery ?? "Recovery", r.recovery],
        [t.restqBalance ?? "Balance", r.balance],
      ].forEach(([l, v], i) => row(l, v, i % 2 === 1));
      y += 2;

      if (restqImg) addChart(restqImg, null, 65);
    }
  }

  // ── Full log records ──────────────────────────────────────────────────
  doc.addPage();
  y = 16;

  const sorted = [...logs].sort((a, b) =>
    (b.date ?? b.createdAt).localeCompare(a.date ?? a.createdAt),
  );
  sectionHeader(t.history ?? "Log Records");
  if (sorted.length === 0) {
    doc.setFontSize(9);
    doc.setTextColor(...GRAY);
    doc.text(t.noData ?? "No records", ML + 2, y + 4);
    y += 7;
  } else {
    checkPage(8);
    doc.setDrawColor(200, 212, 226);
    doc.setLineWidth(0.3);
    doc.line(ML, y, W - MR, y);
    y += 1;
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    const cols = [
      { x: ML + 1, label: t.date ?? "Date" },
      { x: ML + 22, label: (t.effort ?? "Eff").slice(0, 4) },
      { x: ML + 32, label: (t.mood ?? "Mood").slice(0, 4) },
      { x: ML + 42, label: (t.energy ?? "Ener").slice(0, 4) },
      { x: ML + 54, label: (t.sleep ?? "Slp").slice(0, 4) },
      { x: ML + 64, label: (t.soreness ?? "Sore").slice(0, 4) },
      { x: ML + 76, label: (t.minutes ?? "Min").slice(0, 4) },
      { x: ML + 90, label: t.workouts ?? "Workouts" },
      { x: ML + 140, label: t.note ?? "Note" },
    ];
    cols.forEach((c) => doc.text(c.label.slice(0, 10), c.x, y + 3));
    y += 5;

    sorted.forEach((r, i) => {
      checkPage(6);
      if (i % 2 === 0) {
        doc.setFillColor(...LGRAY);
        doc.rect(ML, y, CW, 5.5, "F");
      }
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(fmtDate(r.date ?? r.createdAt), cols[0].x, y + 4);
      doc.text(r.isRestDay ? "—" : String(r.effort ?? "-"), cols[1].x, y + 4);
      doc.text(String(r.mood ?? "-"), cols[2].x, y + 4);
      doc.text(String(r.energy ?? "-"), cols[3].x, y + 4);
      doc.text(String(r.sleepQuality ?? "-"), cols[4].x, y + 4);
      doc.text(String(r.soreness ?? "-"), cols[5].x, y + 4);
      const mins = logTotalMinutes(r);
      doc.text(String(mins || "-"), cols[6].x, y + 4);
      const wText = (r.workouts || [])
        .map((w) => w.name || w.type)
        .filter(Boolean)
        .join(", ")
        .slice(0, 38);
      doc.text(
        r.isRestDay ? (t.restDay ?? "Rest") : wText || "—",
        cols[7].x,
        y + 4,
      );
      doc.text((r.note ?? "").slice(0, 28), cols[8].x, y + 4);
      y += 5.5;
    });
  }

  // ── Footer ────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(...GRAY);
    doc.text(`QUP DA · Coachly · ${new Date().toLocaleDateString()}`, ML, 290);
    doc.text(`${p} / ${pageCount}`, W - MR, 290, { align: "right" });
  }

  const periodSlug = periodLabel.replace(/\s/g, "_");
  const emailSlug = (client.email ?? "client").replace(/[^a-z0-9]/gi, "_");
  doc.save(`coachly_${emailSlug}_${periodSlug}.pdf`);
}

// ── Off-screen charts ──────────────────────────────────────────────────────
function OffscreenCharts({ data, logs, t }) {
  const trendsData = [...logs]
    .sort((a, b) =>
      (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt),
    )
    .map((l) => ({
      date: shortDate(l.date ?? l.createdAt),
      effort: l.isRestDay ? null : l.effort,
      mood: l.mood,
      energy: l.energy,
      sleep: l.sleepQuality,
    }));

  const avg = (key) => {
    const v = logs.map((l) => l[key]).filter((x) => typeof x === "number");
    return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
  };
  const avgEffort = avg("effort"),
    avgMood = avg("mood");
  const avgEnergy = avg("energy"),
    avgSleep = avg("sleepQuality");
  const avgSoreness = avg("soreness");
  const radarData = [
    {
      subject: t.effort ?? "Effort",
      value: +(avgEffort ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.mood ?? "Mood",
      value: +(avgMood ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.energy ?? "Energy",
      value: +(avgEnergy ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.sleep ?? "Sleep",
      value: +(avgSleep ?? 0).toFixed(1),
      fullMark: 5,
    },
    {
      subject: t.recovery ?? "Recovery",
      value: avgSoreness != null ? +(6 - avgSoreness).toFixed(1) : 5,
      fullMark: 5,
    },
  ];

  const catTotals = {};
  logs.forEach((l) => {
    if (l.isRestDay) return;
    const perCat = logCategoryMinutes(l);
    Object.entries(perCat).forEach(([cat, mins]) => {
      catTotals[cat] = (catTotals[cat] ?? 0) + mins;
    });
  });
  const categoryData = ALL_CATEGORIES.map((name) => ({
    name,
    value: catTotals[name] || 0,
  })).filter((x) => x.value > 0);
  const categoryTotal = categoryData.reduce((s, c) => s + c.value, 0);

  const weekBuckets = {};
  logs.forEach((l) => {
    if (l.isRestDay) return;
    const ws = startOfWeek(new Date(l.date ?? l.createdAt));
    const key = `${pad(ws.getMonth() + 1)}/${pad(ws.getDate())}`;
    if (!weekBuckets[key]) weekBuckets[key] = { week: key, minutes: 0 };
    weekBuckets[key].minutes += logTotalMinutes(l);
  });
  const volumeData = Object.values(weekBuckets);

  const scoresData = (data.scores ?? [])
    .slice()
    .sort((a, b) =>
      (a.date ?? a.createdAt).localeCompare(b.date ?? b.createdAt),
    )
    .map((s) => ({
      date: shortDate(s.date ?? s.createdAt),
      composite: s.compositeScore ?? null,
      wellbeing: s.wellbeingScore ?? null,
      workout: s.workoutScore ?? null,
      sleep: s.sleepScore ?? null,
    }));

  const subs = data.latestRestq?.scores?.subscales ?? null;
  const restqData = subs
    ? Object.entries(subs).map(([key, val]) => ({
        subject: key
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (c) => c.toUpperCase()),
        value: typeof val === "number" ? +val.toFixed(2) : 0,
        fullMark: 6,
      }))
    : [];

  const goalsAnswers = Array.isArray(data.latestGoals?.answers)
    ? data.latestGoals.answers
    : [];
  const goalsStatus = data.latestGoals?.scores?.status;
  const goalsAvg = data.latestGoals?.scores?.avg;
  const goalsData =
    goalsAnswers.length === 5
      ? GOALS_AXIS_KEYS.map((axis, i) => ({
          subject: t[axis.qKey] ?? axis.fallback,
          value: i === 3 ? 6 - (goalsAnswers[i] || 0) : goalsAnswers[i] || 0,
          fullMark: 5,
        }))
      : [];
  const goalsColor = GOALS_STATUS_COLORS[goalsStatus] ?? "#4a7ab5";

  const wrap = {
    position: "fixed",
    left: "-9999px",
    top: "0px",
    zIndex: -1,
    background: "#fff",
  };

  return (
    <div style={wrap}>
      {/* Wellbeing trends */}
      <div
        id="pdf-chart-trends"
        style={{
          width: Math.max(520, trendsData.length * 22),
          height: 220,
          background: "#fff",
          padding: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendsData}
            margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e0e8f0"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: "#7a9ab8" }}
              tickLine={false}
              axisLine={false}
              interval={Math.max(0, Math.ceil(trendsData.length / 12) - 1)}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fontSize: 10, fill: "#7a9ab8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
            <ReferenceLine y={3} stroke="#d0dcea" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="effort"
              name={t.effort ?? "Effort"}
              stroke="#4a7ab5"
              strokeWidth={2}
              dot={{ r: 3, fill: "#4a7ab5", strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="mood"
              name={t.mood ?? "Mood"}
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="energy"
              name={t.energy ?? "Energy"}
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="sleep"
              name={t.sleep ?? "Sleep"}
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Wellbeing radar */}
      <div
        id="pdf-chart-radar"
        style={{ width: 320, height: 280, background: "#fff", padding: "8px" }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2d4a6e",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {t.wellbeingBalance ?? "Wellbeing Balance"}
        </div>
        <ResponsiveContainer width="100%" height="90%">
          <RadarChart
            data={radarData}
            margin={{ top: 16, right: 44, bottom: 16, left: 44 }}
          >
            <PolarGrid stroke="#d0dcea" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 11, fill: "#2d4a6e", fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tickCount={6}
              tick={{ fontSize: 8, fill: "#7a9ab8" }}
            />
            <Radar
              name={t.average ?? "Average"}
              dataKey="value"
              stroke="#4a7ab5"
              fill="#4a7ab5"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Goals radar */}
      {goalsData.length > 0 && (
        <div
          id="pdf-chart-goals"
          style={{
            width: 320,
            height: 280,
            background: "#fff",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#2d4a6e",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t.goalsTitle ?? "Goal Check-in"}
            {goalsAvg != null && (
              <span style={{ marginLeft: 6, color: goalsColor }}>
                · {goalsAvg}/5
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart
              data={goalsData}
              margin={{ top: 16, right: 36, bottom: 16, left: 36 }}
            >
              <PolarGrid stroke="#d0dcea" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 10, fill: "#2d4a6e", fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 5]}
                tickCount={6}
                tick={{ fontSize: 8, fill: "#7a9ab8" }}
              />
              <Radar
                name={t.score ?? "Score"}
                dataKey="value"
                stroke={goalsColor}
                fill={goalsColor}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Category donut */}
      <div
        id="pdf-chart-category"
        style={{ width: 320, height: 320, background: "#fff", padding: "8px" }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "#2d4a6e",
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {t.categoryMix ?? "Category Mix"}
        </div>

        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={
                  categoryData.length > 0
                    ? categoryData
                    : [{ name: "empty", value: 1 }]
                }
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={75}
                startAngle={90}
                endAngle={-270}
                paddingAngle={categoryData.length > 1 ? 2 : 0}
                labelLine={false}
                isAnimationActive={false}
              >
                {(categoryData.length > 0
                  ? categoryData
                  : [{ name: "empty" }]
                ).map((entry, i) => (
                  <Cell
                    key={`${entry.name}-${i}`}
                    fill={
                      entry.name === "empty"
                        ? "#e8eef5"
                        : (CAT_COLORS[entry.name] ?? CAT_COLORS.other)
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "3px 12px",
            padding: "4px 12px 0",
            fontSize: 9,
          }}
        >
          {ALL_CATEGORIES.map((name) => {
            const minutes = catTotals[name] || 0;
            const pct =
              categoryTotal > 0
                ? Math.round((minutes / categoryTotal) * 100)
                : 0;
            const isEmpty = minutes === 0;
            return (
              <div
                key={name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: isEmpty ? 0.4 : 1,
                }}
              >
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    flexShrink: 0,
                    background: CAT_COLORS[name],
                  }}
                />
                <span style={{ color: "#2d4a6e", fontWeight: 600, flex: 1 }}>
                  {categoryLabel(name, t)}
                </span>
                <span style={{ color: "#7a9ab8" }}>
                  {minutes}m · {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly volume bars */}
      {volumeData.length > 0 && (
        <div
          id="pdf-chart-volume"
          style={{
            width: Math.max(520, volumeData.length * 40),
            height: 220,
            background: "#fff",
            padding: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={volumeData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Bar
                dataKey="minutes"
                name={t.minutes ?? "Minutes"}
                fill="#4a7ab5"
                radius={[3, 3, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Composite score timeline */}
      {scoresData.length > 0 && (
        <div
          id="pdf-chart-scores"
          style={{
            width: Math.max(520, scoresData.length * 22),
            height: 200,
            background: "#fff",
            padding: "8px",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={scoresData}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e0e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
                interval={Math.max(0, Math.ceil(scoresData.length / 12) - 1)}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#7a9ab8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
              <Line
                type="monotone"
                dataKey="composite"
                name={t.composite ?? "Composite"}
                stroke="#2d4a6e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#2d4a6e", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="wellbeing"
                name={t.wellbeing ?? "Wellbeing"}
                stroke="#10b981"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="workout"
                name={t.workout ?? "Workout"}
                stroke="#4a7ab5"
                strokeWidth={1.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="sleep"
                name={t.sleep ?? "Sleep"}
                stroke="#8b5cf6"
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RestQ subscales radar */}
      {restqData.length > 0 && (
        <div
          id="pdf-chart-restq"
          style={{
            width: 480,
            height: 360,
            background: "#fff",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#2d4a6e",
              textAlign: "center",
              marginBottom: 4,
            }}
          >
            {t.restqSubscales ?? "RestQ Subscales"}
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <RadarChart
              data={restqData}
              margin={{ top: 24, right: 60, bottom: 24, left: 60 }}
            >
              <PolarGrid stroke="#d0dcea" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 9, fill: "#2d4a6e", fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 6]}
                tickCount={4}
                tick={{ fontSize: 8, fill: "#7a9ab8" }}
              />
              <Radar
                name={t.score ?? "Score"}
                dataKey="value"
                stroke="#4a7ab5"
                fill="#4a7ab5"
                fillOpacity={0.25}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
export default function PdfExportModal({ data, t: tProp, onClose }) {
  const t = tProp ?? {};
  const [period, setPeriod] = useState("3"); // default to "Last 3 months" — common review window
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("");
  const [error, setError] = useState("");
  const [showCharts, setShowCharts] = useState(false);

  // Compute filtered logs and the period label from the current selection.
  // Both feed into generatePDF and the off-screen charts.
  const { logs, periodLabel } = useMemo(() => {
    const allLogs = data.logs ?? [];
    const preset = PERIOD_PRESETS.find((p) => p.key === period);
    const monthsBack = preset?.months ?? null;
    const cutoff = rollingCutoff(monthsBack);

    const filtered = cutoff
      ? allLogs.filter((l) => {
          const d = new Date(l.date ?? l.createdAt);
          return d >= cutoff;
        })
      : allLogs;

    const label = preset
      ? (t[preset.labelKey] ?? preset.fallback)
      : (t.allTime ?? "All time");

    return { logs: filtered, periodLabel: label };
  }, [data.logs, period, t]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    setStep(t.renderingCharts ?? "Rendering charts…");
    setShowCharts(true);
    try {
      await new Promise((r) => setTimeout(r, 900));
      setStep(t.capturingDiagrams ?? "Capturing diagrams…");
      await generatePDF({ data, t, periodLabel, logs });
      setShowCharts(false);
      onClose();
    } catch (e) {
      console.error(e);
      setError(t.pdfFailed ?? "Failed to generate PDF. Please try again.");
      setShowCharts(false);
      setStep("");
    } finally {
      setLoading(false);
    }
  }, [data, t, periodLabel, logs, onClose]);

  return (
    <>
      {showCharts && <OffscreenCharts data={data} logs={logs} t={t} />}

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,30,50,0.55)",
          backdropFilter: "blur(4px)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 16,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: SU,
            borderRadius: 18,
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 24px 60px rgba(45,74,110,0.25)",
            border: `1px solid ${BO}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg,${A},${AD})`,
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Coachly
              </div>
              <div
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 700,
                  marginTop: 2,
                }}
              >
                ⬇ {t.exportPdfReport ?? "Export PDF Report"}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: 8,
                width: 30,
                height: 30,
                cursor: "pointer",
                color: "#fff",
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "inherit",
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              padding: 20,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {/* Period preset buttons */}
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: MU,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  marginBottom: 8,
                }}
              >
                {t.pickPeriod ?? "Period"}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                {PERIOD_PRESETS.map((p) => {
                  const isActive = period === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPeriod(p.key)}
                      style={{
                        flex: "1 1 auto",
                        minWidth: "calc(33% - 6px)",
                        padding: "8px 10px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "inherit",
                        transition: "all .15s",
                        border: `1px solid ${isActive ? A : BO}`,
                        background: isActive ? A : "transparent",
                        color: isActive ? "#fff" : AD,
                      }}
                    >
                      {t[p.labelKey] ?? p.fallback}
                    </button>
                  );
                })}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: MU,
                  marginTop: 6,
                  fontStyle: "italic",
                }}
              >
                {logs.length} {t.entries ?? "entries"}{" "}
                {t.inRange ?? "in this range"}
              </div>
            </div>

            <div
              style={{
                background: BG,
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: 11,
                color: MU,
                lineHeight: 1.9,
              }}
            >
              ✓ {t.client ?? "Client"} · ✓ {t.bodyMetrics ?? "Body metrics"}
              <br />✓ 🎯 {t.goalsTitle ?? "Goal check-in"} radar
              <br />✓ 📈 {t.wellbeingTrends ?? "Wellbeing trends"} (
              {t.effort ?? "Effort"}, {t.mood ?? "Mood"}, {t.energy ?? "Energy"}
              , {t.sleep ?? "Sleep"})<br />✓ 💡{" "}
              {t.relevantAdvice ?? "Relevant tips"}
              <br />✓ 🕸 {t.wellbeingBalance ?? "Wellbeing radar"}
              <br />✓ 🥧 {t.categoryMix ?? "Category mix"} donut
              <br />✓ 📊 {t.weeklyVolume ?? "Weekly volume"} bars
              <br />✓ 📈 {t.compositeScore ?? "Composite score"} timeline
              <br />✓ 🕸 {t.restqSubscales ?? "RestQ subscales"} radar
              <br />✓ {t.recoveryState ?? "Recovery state"} (Hooper + RestQ)
              <br />✓ {t.history ?? "Full log"}
            </div>

            {step && (
              <div
                style={{
                  fontSize: 12,
                  color: A,
                  fontWeight: 600,
                  textAlign: "center",
                }}
              >
                {step}
              </div>
            )}
            {error && (
              <div
                style={{
                  fontSize: 12,
                  color: "#e53e3e",
                  background: "#fff5f5",
                  borderRadius: 8,
                  padding: "8px 12px",
                }}
              >
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || logs.length === 0}
              style={{
                background:
                  logs.length === 0
                    ? "#ccc"
                    : `linear-gradient(135deg,${A},${AD})`,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "13px",
                fontSize: 13,
                fontWeight: 700,
                cursor:
                  loading || logs.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: loading ? 0.7 : 1,
                transition: "opacity .15s",
              }}
            >
              {loading
                ? `⏳ ${step || (t.generating ?? "Generating…")}`
                : `⬇ ${t.downloadPdf ?? "Download PDF"}`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

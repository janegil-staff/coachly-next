#!/usr/bin/env node
/**
 * patchTotalMinutes.cjs
 *
 * Two changes in one script:
 *
 * 1. Adds `hourShort` and `minuteShort` translation keys to all 12 languages
 *    in src/lib/translations.js (idempotent — skips if already present).
 *
 * 2. Replaces the raw {monthAvgs.totalMinutes} render in Dashboard.jsx
 *    with a formatted "9h 50m" string using fmtDuration().
 *
 * Idempotent. Creates a timestamped backup of any file it modifies.
 *
 * Usage:
 *   cd ~/Projects/coachly/couchly-next
 *   node scripts/patchTotalMinutes.cjs
 */

const fs   = require("fs");
const path = require("path");

// ─── DATA ───────────────────────────────────────────────────────────
// hourShort and minuteShort per language (h/m equivalents).
// Where languages have an established short form, use it; otherwise default.
const UNIT_KEYS = {
  en: { hourShort: "h",   minuteShort: "m"   },
  no: { hourShort: "t",   minuteShort: "min" },
  nl: { hourShort: "u",   minuteShort: "min" },
  fr: { hourShort: "h",   minuteShort: "min" },
  de: { hourShort: "Std", minuteShort: "Min" },
  it: { hourShort: "h",   minuteShort: "min" },
  sv: { hourShort: "tim", minuteShort: "min" },
  da: { hourShort: "t",   minuteShort: "min" },
  fi: { hourShort: "h",   minuteShort: "min" },
  es: { hourShort: "h",   minuteShort: "min" },
  pl: { hourShort: "g",   minuteShort: "min" },
  pt: { hourShort: "h",   minuteShort: "min" },
};

// ─── HELPERS ────────────────────────────────────────────────────────
function backup(file) {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const bak = file + ".backup-" + ts;
  fs.copyFileSync(file, bak);
  return bak;
}

function findLangBlock(src, lang) {
  const patterns = [
    new RegExp("(^|\\n)(\\s*)\"" + lang + "\"\\s*:\\s*\\{"),
    new RegExp("(^|\\n)(\\s*)" + lang + "\\s*:\\s*\\{"),
  ];
  let m = null;
  for (const pat of patterns) { m = src.match(pat); if (m) break; }
  if (!m) return null;

  const openIdx = src.indexOf("{", m.index);
  let depth = 0, inStr = null, escape = false;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (escape) { escape = false; continue; }
    if (ch === "\\") { escape = true; continue; }
    if (inStr) { if (ch === inStr) inStr = null; continue; }
    if (ch === '"' || ch === "'" || ch === "`") { inStr = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { start: openIdx, end: i };
    }
  }
  return null;
}

function hasKey(blockText, key) {
  const re = new RegExp("(^|\\n)\\s*\"?" + key + "\"?\\s*:");
  return re.test(blockText);
}

function insertKeys(src, lang, keys) {
  const block = findLangBlock(src, lang);
  if (!block) return { src, added: 0, skipped: 0, missing: true };

  const blockText = src.slice(block.start, block.end + 1);

  let innerIndent = "    ";
  const indentMatch = blockText.match(/\n(\s+)"?\w+"?\s*:/);
  if (indentMatch) innerIndent = indentMatch[1];

  let added = 0, skipped = 0;
  const lines = [];
  for (const [key, value] of Object.entries(keys)) {
    if (hasKey(blockText, key)) { skipped++; continue; }
    lines.push(innerIndent + '"' + key + '": ' + JSON.stringify(value) + ",");
    added++;
  }

  if (added === 0) return { src, added: 0, skipped, missing: false };

  const before = src.slice(0, block.end);
  const after  = src.slice(block.end);

  const trimmed = before.replace(/\s*$/, "");
  const lastChar = trimmed[trimmed.length - 1];
  const needsComma = lastChar !== "," && lastChar !== "{";
  const sep = needsComma ? "," : "";

  const closingIndentMatch = before.match(/\n(\s*)$/);
  const closingIndent = closingIndentMatch ? closingIndentMatch[1] : "  ";

  const newSrc = trimmed + sep + "\n" + lines.join("\n") + "\n" + closingIndent + after;
  return { src: newSrc, added, skipped, missing: false };
}

// ─── PHASE 1: translations ──────────────────────────────────────────
function patchTranslations() {
  const target = path.resolve(process.cwd(), "src/lib/translations.js");
  if (!fs.existsSync(target)) {
    console.error("✗ Could not find src/lib/translations.js");
    process.exit(1);
  }
  console.log("Phase 1 — translations");
  console.log("Target: " + target);

  const original = fs.readFileSync(target, "utf8");
  let src = original;
  let totalAdded = 0;

  for (const [lang, keys] of Object.entries(UNIT_KEYS)) {
    const { src: newSrc, added, skipped, missing } = insertKeys(src, lang, keys);
    if (missing) {
      console.log("  " + lang + ": ⚠ language block not found");
      continue;
    }
    src = newSrc;
    totalAdded += added;
    console.log("  " + lang + ": +" + added + " added, " + skipped + " already present");
  }

  if (totalAdded === 0) {
    console.log("✓ No translation changes needed.\n");
    return;
  }

  const bak = backup(target);
  fs.writeFileSync(target, src, "utf8");
  console.log("✓ translations.js updated. Total keys added: " + totalAdded);
  console.log("  Backup: " + bak + "\n");
}

// ─── PHASE 2: Dashboard.jsx ─────────────────────────────────────────
function patchDashboard() {
  const target = path.resolve(process.cwd(), "src/app/dashboard/Dashboard.jsx");
  if (!fs.existsSync(target)) {
    console.error("✗ Could not find src/app/dashboard/Dashboard.jsx");
    process.exit(1);
  }
  console.log("Phase 2 — Dashboard.jsx");
  console.log("Target: " + target);

  let src = fs.readFileSync(target, "utf8");
  const original = src;

  // 2a. Add fmtDuration helper just before "function CalendarTab(" if not there yet.
  const helperMarker = "function fmtDuration(";
  if (!src.includes(helperMarker)) {
    const helper = `
// Format a raw minute count as "9h 50m" using translation unit keys.
// Single-letter units stick to the number ("9h"); multi-letter units get
// a space ("9 Std", "9 tim") for readability.
function fmtDuration(mins, t) {
  const total = Math.max(0, Math.round(Number(mins) || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const hUnit = (t && t.hourShort)   || "h";
  const mUnit = (t && t.minuteShort) || "m";
  const hSep = hUnit.length > 1 ? " " : "";
  const mSep = mUnit.length > 1 ? " " : "";
  return h + hSep + hUnit + " " + m + mSep + mUnit;
}

`;
    const calTabIdx = src.indexOf("function CalendarTab(");
    if (calTabIdx === -1) {
      console.log("  ⚠ Could not locate function CalendarTab( — skipping helper insert");
    } else {
      src = src.slice(0, calTabIdx) + helper + src.slice(calTabIdx);
      console.log("  ✓ Added fmtDuration() helper above CalendarTab");
    }
  } else {
    console.log("  ✓ fmtDuration() helper already present");
  }

  // 2b. Replace the totalMinutes render with formatted output.
  // Looking for the line:    {monthAvgs.totalMinutes}
  const oldRender = "{monthAvgs.totalMinutes}";
  const newRender = "{fmtDuration(monthAvgs.totalMinutes, t)}";
  if (src.includes(oldRender)) {
    src = src.split(oldRender).join(newRender);
    console.log("  ✓ Replaced {monthAvgs.totalMinutes} → {fmtDuration(...)}");
  } else if (src.includes(newRender)) {
    console.log("  ✓ totalMinutes already formatted");
  } else {
    console.log("  ⚠ Could not find {monthAvgs.totalMinutes} — manual edit needed");
  }

  // 2c. Update the label below the value — preferably to t.totalDuration ?? "Duration".
  // Optional improvement; only patch if the literal pattern exists.
  const oldLabel = '{t.totalMinutes ?? "Minutes"}';
  const newLabel = '{t.totalDuration ?? t.totalMinutes ?? "Duration"}';
  if (src.includes(oldLabel)) {
    src = src.split(oldLabel).join(newLabel);
    console.log("  ✓ Label fallback chain updated (t.totalDuration → t.totalMinutes)");
  }

  if (src === original) {
    console.log("✓ No Dashboard.jsx changes needed.\n");
    return;
  }

  const bak = backup(target);
  fs.writeFileSync(target, src, "utf8");
  console.log("✓ Dashboard.jsx updated.");
  console.log("  Backup: " + bak + "\n");
}

// ─── MAIN ───────────────────────────────────────────────────────────
patchTranslations();
patchDashboard();
console.log("Done.");

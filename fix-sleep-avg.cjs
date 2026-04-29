// fix-sleep-avg.cjs
// One-line fix for src/app/dashboard/Dashboard.jsx in the couchly-next project.
//
// The bug: monthAvgs computes the sleep average from log.sleep (which doesn't
// exist on the data model). The actual field is log.sleepQuality. The render
// then reads monthAvgs.sleep — which is undefined — and shows "—/5".
//
// The fix: change the field name passed to the avg() helper for the sleep
// entry, while keeping the public key 'sleep' so the existing render and
// translation key (t.sleep) keep working.
//
// Run from the couchly-next root:
//   node fix-sleep-avg.cjs
//
// Idempotent — running it twice does nothing the second time.

const fs = require("fs");
const path = require("path");

const FILE = path.join("src", "app", "dashboard", "Dashboard.jsx");
if (!fs.existsSync(FILE)) {
  console.error("✗ Cannot find " + FILE + " — run this from the couchly-next root.");
  process.exit(1);
}

let src = fs.readFileSync(FILE, "utf8");
const before = src;

// We try a few common shapes the avg call might take, in case the helper
// signature differs slightly. Each pattern matches:
//   1. avg('sleep')
//   2. avg("sleep")
//   3. sleep: avg('sleep')
//   4. sleep: avg("sleep")
//   5. l => l.sleep                                  (inline reduce on logs)
//   6. (l) => l.sleep
//   7. monthLogs.map(l => l.sleep)
// and rewrites only the field reference. The display key stays 'sleep'.

const patterns = [
  // sleep: avg('sleep')   → sleep: avg('sleepQuality')
  { re: /(\bsleep\s*:\s*avg\s*\(\s*['"])sleep(['"]\s*\))/g, sub: "$1sleepQuality$2" },

  // l.sleep   →   l.sleepQuality
  // but ONLY when not already followed by Quality, and only on identifiers
  // that look like a log/record (l, log, r, rec, record). Avoids matching
  // unrelated 'something.sleep' that we don't own.
  { re: /\b(l|log|r|rec|record)\.sleep\b(?!Quality)/g, sub: "$1.sleepQuality" },
];

let totalReplaced = 0;
for (const { re, sub } of patterns) {
  const matches = src.match(re);
  if (matches) {
    src = src.replace(re, sub);
    totalReplaced += matches.length;
    console.log("  matched " + matches.length + "× " + re);
  }
}

if (src === before) {
  console.log("");
  console.log("⚠ No changes made. Either this script already ran, or the");
  console.log("  monthAvgs builder uses a shape I didn't anticipate.");
  console.log("");
  console.log("  Paste lines 525–555 of " + FILE + " and we'll write a");
  console.log("  targeted patch.");
  process.exit(0);
}

// Safety: keep a backup the first time we write.
const backup = FILE + ".bak-sleepfix";
if (!fs.existsSync(backup)) {
  fs.writeFileSync(backup, before, "utf8");
  console.log("  saved backup to " + backup);
}

fs.writeFileSync(FILE, src, "utf8");
console.log("");
console.log("✓ Patched " + FILE + " — " + totalReplaced + " replacement(s).");
console.log("  Hard-refresh the dashboard (Cmd+Shift+R) to see the sleep");
console.log("  average populate.");

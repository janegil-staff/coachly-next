#!/usr/bin/env python3
"""
build_advice_cards.py

Reads the MOBILE translations.js file and writes a fully self-contained
AdviceCards.js with every advice translation embedded. Does not require
the file to be valid JSON — uses regex line-scanning, so it tolerates
trailing commas, comments, single quotes, etc.

Usage:
    python3 build_advice_cards.py \\
        /Users/janegil-staff/Projects/coachly/coachly-mobile/src/lib/translations.js \\
        ./AdviceCards.js
"""

import json
import re
import sys
from pathlib import Path


LANGS = ["en", "no", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"]

# Lines we want: keys starting with advice_, adviceCat_, or the two UI labels.
ADVICE_KEY_RX = re.compile(
    r'^\s*["\']('
    r'advice_[a-z0-9]+_(?:title|body)'
    r'|adviceCat_[a-z]+'
    r'|adviceRelevant'
    r'|adviceEmpty'
    r')["\']\s*:\s*'
)

# Lines that mark the start of a language block: "en": {  /  'en': {
LANG_HEADER_RX = re.compile(
    r'^\s*["\']?(' + "|".join(LANGS) + r')["\']?\s*:\s*\{\s*$'
)


def parse_value_starting_at(lines, start_idx):
    """
    Try to parse a "key": "value" pair starting at lines[start_idx].
    Handles values that may continue across multiple lines via JS string
    concatenation (`"foo" + "bar"`) — though most translations.js files
    keep each value on a single line.

    Returns (value, lines_consumed) or (None, 1).
    """
    line = lines[start_idx]
    # First, see if value finishes on this same line.
    # Pattern: "key": "..."[opt comma]
    m = re.match(r'^\s*["\'][^"\']+["\']\s*:\s*(.+?)\s*$', line)
    if not m:
        return None, 1

    raw = m.group(1).rstrip(",").rstrip()

    # Single-line case: starts and ends with matching quote, no concat.
    if (raw.startswith('"') and raw.endswith('"') and not raw.endswith('+')
            and raw.count('"') >= 2):
        try:
            return json.loads(raw), 1
        except json.JSONDecodeError:
            return raw[1:-1], 1
    if (raw.startswith("'") and raw.endswith("'") and not raw.endswith('+')
            and raw.count("'") >= 2):
        body = raw[1:-1].replace('\\\'', "'").replace('"', '\\"')
        try:
            return json.loads('"' + body + '"'), 1
        except json.JSONDecodeError:
            return raw[1:-1], 1

    # Multi-line concatenation case: collect pieces until we stop seeing `+`.
    pieces = []
    consumed = 1
    cur = raw
    while True:
        # Strip trailing + from current piece
        ends_with_plus = cur.rstrip().endswith("+")
        chunk = cur.rstrip()
        if ends_with_plus:
            chunk = chunk[:-1].rstrip()
        # Extract first quoted string from chunk
        sm = re.match(r'^\s*"((?:[^"\\]|\\.)*)"\s*$', chunk)
        sm2 = re.match(r"^\s*'((?:[^'\\]|\\.)*)'\s*$", chunk)
        if sm:
            pieces.append(json.loads('"' + sm.group(1) + '"'))
        elif sm2:
            body = sm2.group(1).replace('\\\'', "'").replace('"', '\\"')
            pieces.append(json.loads('"' + body + '"'))
        else:
            break
        if not ends_with_plus:
            break
        # Move to next line
        if start_idx + consumed >= len(lines):
            break
        cur = lines[start_idx + consumed].rstrip().rstrip(",")
        consumed += 1

    if pieces:
        return "".join(pieces), consumed
    return None, 1


def extract_advice_translations(text):
    """
    Walk the file line by line, tracking which language section we're in,
    and collect advice keys for each language.
    """
    out = {lang: {} for lang in LANGS}
    current_lang = None
    brace_depth_in_lang = 0  # track nested braces inside language block

    lines = text.splitlines()
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Detect entry into a language block (only when not already inside one).
        if current_lang is None:
            m = LANG_HEADER_RX.match(line)
            if m:
                current_lang = m.group(1)
                brace_depth_in_lang = 1
                i += 1
                continue
            i += 1
            continue

        # Track braces to detect end of current language block reliably.
        # Open braces inside the block (e.g. nested objects) don't end it.
        opens = line.count("{")
        closes = line.count("}")
        new_depth = brace_depth_in_lang + opens - closes
        if new_depth <= 0:
            current_lang = None
            brace_depth_in_lang = 0
            i += 1
            continue
        brace_depth_in_lang = new_depth

        # Is this line an advice key?
        m = ADVICE_KEY_RX.match(line)
        if m:
            key = m.group(1)
            value, consumed = parse_value_starting_at(lines, i)
            if value is not None:
                out[current_lang][key] = value
            i += consumed
            continue

        i += 1

    return out


# ──────────────────────────────────────────────────────────────────────
# JS template
# ──────────────────────────────────────────────────────────────────────

JS_TEMPLATE = '''// src/components/AdviceCards.js
//
// Renders the advice items the user has marked as "relevant for me" in
// the mobile app. Reads from report.client.profile.relevantAdvice (an
// array of advice IDs like ["t1", "r1", "r2"]).
//
// All titles, bodies, and labels for all 12 languages are EMBEDDED in
// this file — it does not depend on the coach web's translations.js.
// This keeps the dashboard advices identical to what the user sees on
// mobile, regardless of any translation-port scripts.
//
// Click a headline to expand its body. Click again to collapse.

"use client";

import { useState } from "react";

const A = "#4A7AB5",
  BO = "#D0DCEA",
  TX = "#1A2C3D",
  SU = "#FFFFFF",
  MU = "#7A9AB8";

const CATEGORY_META = {
  training:   { color: "#4A7AB5", icon: "🏋" },
  recovery:   { color: "#22C55E", icon: "🌿" },
  nutrition:  { color: "#F59E0B", icon: "🍎" },
  sleep:      { color: "#A855F7", icon: "🌙" },
  mindset:    { color: "#06B6D4", icon: "💡" },
  motivation: { color: "#EF4444", icon: "🔥" },
};

const ADVICE_KEYS = [
  { id: "t1", category: "training" },   { id: "t2", category: "training" },   { id: "t3", category: "training" },
  { id: "r1", category: "recovery" },   { id: "r2", category: "recovery" },   { id: "r3", category: "recovery" },
  { id: "n1", category: "nutrition" },  { id: "n2", category: "nutrition" },  { id: "n3", category: "nutrition" },
  { id: "s1", category: "sleep" },      { id: "s2", category: "sleep" },      { id: "s3", category: "sleep" },
  { id: "m1", category: "mindset" },    { id: "m2", category: "mindset" },    { id: "m3", category: "mindset" },
  { id: "v1", category: "motivation" }, { id: "v2", category: "motivation" }, { id: "v3", category: "motivation" },
];

const ADVICE_BY_ID = Object.fromEntries(ADVICE_KEYS.map((a) => [a.id, a]));

// All translations embedded — extracted from mobile's translations.js.
const STRINGS = __STRINGS_BLOCK__;

function pickLang(lang) {
  if (lang && STRINGS[lang] && Object.keys(STRINGS[lang]).length > 0) {
    return STRINGS[lang];
  }
  return STRINGS.en;
}

export default function AdviceCards({ relevantAdvice, lang }) {
  const s = pickLang(lang);
  const fallback = STRINGS.en;
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const items = (Array.isArray(relevantAdvice) ? relevantAdvice : [])
    .map((id) => {
      const meta = ADVICE_BY_ID[id];
      if (!meta) return null;
      const titleKey = "advice_" + id + "_title";
      const bodyKey = "advice_" + id + "_body";
      return {
        id,
        category: meta.category,
        title: s[titleKey] || fallback[titleKey] || id,
        body:  s[bodyKey]  || fallback[bodyKey]  || "",
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    return (
      <div
        className="rounded-2xl border shadow-sm p-4"
        style={{ background: SU, borderColor: BO }}
      >
        <div
          className="text-[10px] font-bold tracking-widest uppercase mb-2"
          style={{ color: A }}
        >
          {s.adviceRelevant || fallback.adviceRelevant || "Relevant for me"}
        </div>
        <div className="text-xs" style={{ color: MU }}>
          {s.adviceEmpty || fallback.adviceEmpty || "No tips marked as relevant."}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border shadow-sm p-4"
      style={{ background: SU, borderColor: BO }}
    >
      <div
        className="text-[10px] font-bold tracking-widest uppercase mb-3"
        style={{ color: A }}
      >
        {s.adviceRelevant || fallback.adviceRelevant || "Relevant for me"}
      </div>

      <div className="flex flex-col gap-1.5">
        {items.map((item) => {
          const meta = CATEGORY_META[item.category] || CATEGORY_META.training;
          const isOpen = expanded.has(item.id);

          return (
            <div
              key={item.id}
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: BO }}
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left"
                style={{ background: "transparent" }}
              >
                <span className="flex-shrink-0 text-sm">{meta.icon}</span>
                <span
                  className="flex-1 text-xs font-bold"
                  style={{ color: meta.color }}
                >
                  {item.title}
                </span>
                <span
                  className="flex-shrink-0 text-[10px] transition-transform"
                  style={{
                    color: MU,
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  ▼
                </span>
              </button>

              {isOpen && item.body ? (
                <div
                  className="px-3 pb-3 pt-1 text-xs leading-relaxed border-t"
                  style={{ color: TX, borderColor: BO + "80" }}
                >
                  {item.body}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
'''


def js_str(value):
    return json.dumps(value, ensure_ascii=False)


def build_strings_block(advice_by_lang):
    lines = ["{"]
    for lang in LANGS:
        block = advice_by_lang.get(lang, {})
        lines.append(f"  {lang}: {{")
        sort_order = []
        for k in ("adviceRelevant", "adviceEmpty"):
            if k in block:
                sort_order.append(k)
        for cat in ("training", "recovery", "nutrition", "sleep", "mindset", "motivation"):
            k = f"adviceCat_{cat}"
            if k in block:
                sort_order.append(k)
        for advice_id in (
            "t1", "t2", "t3", "r1", "r2", "r3",
            "n1", "n2", "n3", "s1", "s2", "s3",
            "m1", "m2", "m3", "v1", "v2", "v3",
        ):
            for suffix in ("title", "body"):
                k = f"advice_{advice_id}_{suffix}"
                if k in block:
                    sort_order.append(k)
        for k in sort_order:
            v = block[k]
            lines.append(f"    {js_str(k)}: {js_str(v)},")
        lines.append("  },")
    lines.append("}")
    return "\n".join(lines)


def main():
    if len(sys.argv) != 3:
        print("Usage: python3 build_advice_cards.py <mobile_translations.js> <output_path>")
        sys.exit(1)

    mobile_path = Path(sys.argv[1])
    out_path = Path(sys.argv[2])

    text = mobile_path.read_text(encoding="utf-8")
    advice_by_lang = extract_advice_translations(text)

    print("Extracted advice keys per language:")
    total = 0
    for lang in LANGS:
        n = len(advice_by_lang.get(lang, {}))
        total += n
        flag = " ✓" if n >= 30 else (" ! incomplete (will fall back to en)" if n > 0 else " ! missing (will fall back to en)")
        print(f"  {lang}: {n} keys{flag}")
    print(f"  total: {total} keys extracted")

    if advice_by_lang.get("en", {}):
        # Show one extracted value as a sanity check
        en = advice_by_lang["en"]
        sample_key = "advice_t1_title"
        if sample_key in en:
            print(f"\nSanity check: en[{sample_key}] = {en[sample_key]!r}")

    strings_block = build_strings_block(advice_by_lang)
    js = JS_TEMPLATE.replace("__STRINGS_BLOCK__", strings_block)

    out_path.write_text(js, encoding="utf-8")
    print(f"\nWrote {out_path} ({len(js):,} bytes)")


if __name__ == "__main__":
    main()

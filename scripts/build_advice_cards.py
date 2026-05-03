#!/usr/bin/env python3
"""
build_advice_cards.py

Reads the MOBILE translations.js file, extracts all advice_* / adviceCat_* /
adviceRelevant / adviceEmpty keys for every language, and writes a fully
self-contained AdviceCards.js file with every translation embedded.

The resulting component does NOT depend on the coach web's translations.js —
it has every string for every language baked in. The coach dashboard just
needs to pass the current `lang` prop and the `relevantAdvice` array.

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

KEY_PATTERNS = [
    re.compile(r"^advice_[a-z0-9]+_(title|body)$"),
    re.compile(r"^adviceCat_[a-z]+$"),
]
EXTRA_KEYS = {"adviceRelevant", "adviceEmpty"}


def parse_strings_object(text):
    """Find and parse a `const strings = { ... };` object."""
    m = re.search(r"const\s+strings\s*=\s*", text)
    if not m:
        raise SystemExit("Could not find `const strings = ...` in file.")
    start = text.index("{", m.end())
    depth = 0
    in_str = False
    str_char = ""
    escape = False
    end = None
    for i in range(start, len(text)):
        c = text[i]
        if in_str:
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == str_char:
                in_str = False
        else:
            if c in ('"', "'"):
                in_str = True
                str_char = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
    if end is None:
        raise SystemExit("Could not find end of strings object.")
    return json.loads(text[start:end])


def is_advice_key(key):
    if key in EXTRA_KEYS:
        return True
    return any(p.match(key) for p in KEY_PATTERNS)


def extract_advice(strings):
    """Return { lang: { key: value, ... } } limited to advice keys."""
    out = {}
    for lang in LANGS:
        block = strings.get(lang)
        if not isinstance(block, dict):
            print(f"  ! warning: language '{lang}' missing in mobile translations")
            out[lang] = {}
            continue
        out[lang] = {k: v for k, v in block.items() if is_advice_key(k)}
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

// Mirror of mobile's ADVICE_KEYS — keep in sync.
const ADVICE_KEYS = [
  { id: "t1", category: "training" },   { id: "t2", category: "training" },   { id: "t3", category: "training" },
  { id: "r1", category: "recovery" },   { id: "r2", category: "recovery" },   { id: "r3", category: "recovery" },
  { id: "n1", category: "nutrition" },  { id: "n2", category: "nutrition" },  { id: "n3", category: "nutrition" },
  { id: "s1", category: "sleep" },      { id: "s2", category: "sleep" },      { id: "s3", category: "sleep" },
  { id: "m1", category: "mindset" },    { id: "m2", category: "mindset" },    { id: "m3", category: "mindset" },
  { id: "v1", category: "motivation" }, { id: "v2", category: "motivation" }, { id: "v3", category: "motivation" },
];

const ADVICE_BY_ID = Object.fromEntries(ADVICE_KEYS.map((a) => [a.id, a]));

// ──────────────────────────────────────────────────────────────────────
// All translations embedded — copied from mobile's translations.js.
// One block per supported language.
// ──────────────────────────────────────────────────────────────────────
const STRINGS = __STRINGS_BLOCK__;

function pickLang(lang) {
  if (lang && STRINGS[lang]) return STRINGS[lang];
  return STRINGS.en;
}

export default function AdviceCards({ relevantAdvice, lang }) {
  const s = pickLang(lang);
  const [expanded, setExpanded] = useState(new Set());

  const toggle = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Resolve IDs → items. Skip any unknown IDs.
  const items = (Array.isArray(relevantAdvice) ? relevantAdvice : [])
    .map((id) => {
      const meta = ADVICE_BY_ID[id];
      if (!meta) return null;
      return {
        id,
        category: meta.category,
        title: s["advice_" + id + "_title"] || id,
        body:  s["advice_" + id + "_body"]  || "",
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
          {s.adviceRelevant || "Relevant for me"}
        </div>
        <div className="text-xs" style={{ color: MU }}>
          {s.adviceEmpty || "No tips marked as relevant."}
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
        {s.adviceRelevant || "Relevant for me"}
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
    """Render a Python string as a JS string literal."""
    return json.dumps(value, ensure_ascii=False)


def build_strings_block(advice_by_lang):
    lines = ["{"]
    for lang in LANGS:
        block = advice_by_lang.get(lang, {})
        lines.append(f"  {lang}: {{")
        # Order keys deterministically: ui labels, categories, then advices.
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
    strings = parse_strings_object(text)

    advice_by_lang = extract_advice(strings)

    # Sanity-check counts.
    print("Extracted advice keys per language:")
    for lang in LANGS:
        n = len(advice_by_lang.get(lang, {}))
        flag = " ✓" if n >= 30 else " ! incomplete"
        print(f"  {lang}: {n} keys{flag}")

    strings_block = build_strings_block(advice_by_lang)
    js = JS_TEMPLATE.replace("__STRINGS_BLOCK__", strings_block)

    out_path.write_text(js, encoding="utf-8")
    print(f"\nWrote {out_path} ({len(js):,} bytes)")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
patch_coachly_legend_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds the 4 calendar icon-legend translation keys to all 12 languages in
couchly-next/src/lib/translations.js. Idempotent — running it twice is a
no-op; if some keys exist already in a given language, only the missing
ones get added.

Keys:
  legendHighEffort   — ⚡  high effort day (effort > 4)
  legendRestDay      — 🛌  planned rest day
  legendHighSoreness — 🔥  high soreness (>= 4)
  legendNote         — 💬  day has a note attached

Run from couchly-next/ project root:
    python3 path/to/patch_coachly_legend_translations.py
"""
import re
import sys
from pathlib import Path

PATH = Path("src/lib/translations.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    print("   Run this script from the couchly-next/ project root.")
    sys.exit(1)

LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"]

KEYS = {
    "legendHighEffort": {
        "no": "Høy innsats",
        "en": "High effort",
        "nl": "Hoge inspanning",
        "fr": "Effort élevé",
        "de": "Hohe Anstrengung",
        "it": "Sforzo elevato",
        "sv": "Hög ansträngning",
        "da": "Høj indsats",
        "fi": "Korkea ponnistus",
        "es": "Esfuerzo alto",
        "pl": "Duży wysiłek",
        "pt": "Esforço elevado",
    },
    "legendRestDay": {
        "no": "Hviledag",
        "en": "Rest day",
        "nl": "Rustdag",
        "fr": "Jour de repos",
        "de": "Ruhetag",
        "it": "Giorno di riposo",
        "sv": "Vilodag",
        "da": "Hviledag",
        "fi": "Lepopäivä",
        "es": "Día de descanso",
        "pl": "Dzień odpoczynku",
        "pt": "Dia de descanso",
    },
    "legendHighSoreness": {
        "no": "Høy stølhet",
        "en": "High soreness",
        "nl": "Veel spierpijn",
        "fr": "Courbatures élevées",
        "de": "Starker Muskelkater",
        "it": "DOMS elevati",
        "sv": "Hög träningsvärk",
        "da": "Høj muskelømhed",
        "fi": "Korkea lihaskipu",
        "es": "Agujetas altas",
        "pl": "Wysoki zakwas",
        "pt": "Dor muscular elevada",
    },
    "legendNote": {
        "no": "Har notat",
        "en": "Has a note",
        "nl": "Heeft notitie",
        "fr": "A une note",
        "de": "Hat Notiz",
        "it": "Ha una nota",
        "sv": "Har anteckning",
        "da": "Har note",
        "fi": "Sisältää muistiinpanon",
        "es": "Tiene nota",
        "pl": "Ma notatkę",
        "pt": "Tem nota",
    },
}


def main():
    src = PATH.read_text(encoding="utf-8")
    lines = src.splitlines(keepends=True)

    LANG_HEADER_RE = re.compile(r'^(\s*)["\']?(\w{2})["\']?\s*:\s*\{\s*$')

    # Find language blocks: walk braces to locate matching close
    blocks = []
    i = 0
    while i < len(lines):
        m = LANG_HEADER_RE.match(lines[i])
        if m and m.group(2) in LANGS:
            lang = m.group(2)
            indent = m.group(1)
            depth = 0
            j = i
            found_end = None
            in_string = False
            string_char = None
            escape_next = False
            while j < len(lines):
                for ch in lines[j]:
                    if escape_next:
                        escape_next = False
                        continue
                    if ch == "\\":
                        escape_next = True
                        continue
                    if in_string:
                        if ch == string_char:
                            in_string = False
                        continue
                    if ch in ('"', "'", "`"):
                        in_string = True
                        string_char = ch
                        continue
                    if ch == "{":
                        depth += 1
                    elif ch == "}":
                        depth -= 1
                        if depth == 0:
                            found_end = j
                            break
                if found_end is not None:
                    break
                j += 1
            if found_end is not None:
                blocks.append((lang, i, found_end, indent))
                i = found_end + 1
                continue
        i += 1

    if not blocks:
        print(f"❌ Couldn't find any language blocks in {PATH}")
        sys.exit(1)

    detected_langs = {b[0] for b in blocks}
    missing_langs = set(LANGS) - detected_langs
    if missing_langs:
        print(f"⚠ Missing language blocks: {sorted(missing_langs)}")

    inserted_per_lang = {lang: 0 for lang in LANGS}
    output_lines = []
    cursor = 0
    blocks.sort(key=lambda b: b[1])

    for lang, start, end, indent in blocks:
        # Emit everything up to but not including the closing brace
        for k in range(cursor, end):
            output_lines.append(lines[k])

        # Determine which keys already exist
        block_text = "".join(lines[start:end + 1])
        existing = set()
        for key in KEYS:
            pattern = rf'(?<![A-Za-z0-9_])["\']?{re.escape(key)}["\']?\s*:'
            if re.search(pattern, block_text):
                existing.add(key)

        inner_indent = indent + "  "
        missing = [k for k in KEYS if k not in existing]
        for key in missing:
            value = KEYS[key].get(lang)
            if value is None:
                continue
            value_escaped = value.replace("\\", "\\\\").replace("'", "\\'")
            output_lines.append(f"{inner_indent}'{key}': '{value_escaped}',\n")
            inserted_per_lang[lang] += 1

        output_lines.append(lines[end])
        cursor = end + 1

    for k in range(cursor, len(lines)):
        output_lines.append(lines[k])

    total = sum(inserted_per_lang.values())
    if total == 0:
        print("✓ All legend keys already present in every language — nothing to do.")
        return

    PATH.write_text("".join(output_lines), encoding="utf-8")

    print("✓ Legend translation keys patched.")
    print(f"  File: {PATH}")
    print()
    for lang in LANGS:
        count = inserted_per_lang[lang]
        if lang not in detected_langs:
            print(f"    {lang}: (block not found — skipped)")
        elif count > 0:
            print(f"    {lang}: +{count} key(s)")
        else:
            print(f"    {lang}: (already complete)")


if __name__ == "__main__":
    main()

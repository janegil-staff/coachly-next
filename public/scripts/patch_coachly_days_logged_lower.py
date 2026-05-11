#!/usr/bin/env python3
"""
patch_coachly_days_logged_lower.py
─────────────────────────────────────────────────────────────────────────────
Adds the `daysLoggedLower` translation key to all 12 languages in
couchly-next/src/lib/translations.js.

This is the lowercased inline variant used in mid-sentence contexts like
"12 days logged" — distinct from the existing `daysLogged` which is the
capitalized stat label ("Days logged").

Idempotent. Run from couchly-next/ project root:
    python3 path/to/patch_coachly_days_logged_lower.py
"""
import re
import sys
from pathlib import Path

PATH = Path("src/lib/translations.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    sys.exit(1)

LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"]

KEYS = {
    "daysLoggedLower": {
        "no": "dager logget",
        "en": "days logged",
        "nl": "dagen gelogd",
        "fr": "jours enregistrés",
        "de": "Tage protokolliert",
        "it": "giorni registrati",
        "sv": "dagar loggade",
        "da": "dage logget",
        "fi": "päivää kirjattu",
        "es": "días registrados",
        "pl": "dni zalogowanych",
        "pt": "dias registados",
    },
}


def main():
    src = PATH.read_text(encoding="utf-8")
    lines = src.splitlines(keepends=True)

    LANG_HEADER_RE = re.compile(r'^(\s*)["\']?(\w{2})["\']?\s*:\s*\{\s*$')

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

    detected = {b[0] for b in blocks}
    missing = set(LANGS) - detected
    if missing:
        print(f"⚠ Missing language blocks: {sorted(missing)}")

    inserted = {lang: 0 for lang in LANGS}
    out = []
    cursor = 0
    blocks.sort(key=lambda b: b[1])

    for lang, start, end, indent in blocks:
        for k in range(cursor, end):
            out.append(lines[k])

        block_text = "".join(lines[start:end + 1])
        existing_keys = set()
        for key in KEYS:
            pattern = rf'(?<![A-Za-z0-9_])["\']?{re.escape(key)}["\']?\s*:'
            if re.search(pattern, block_text):
                existing_keys.add(key)

        inner_indent = indent + "  "
        for key in KEYS:
            if key in existing_keys:
                continue
            value = KEYS[key].get(lang)
            if value is None:
                continue
            value_escaped = value.replace("\\", "\\\\").replace("'", "\\'")
            out.append(f"{inner_indent}'{key}': '{value_escaped}',\n")
            inserted[lang] += 1

        out.append(lines[end])
        cursor = end + 1

    for k in range(cursor, len(lines)):
        out.append(lines[k])

    total = sum(inserted.values())
    if total == 0:
        print("✓ daysLoggedLower already present in every language — nothing to do.")
        return

    PATH.write_text("".join(out), encoding="utf-8")

    print("✓ daysLoggedLower patched.")
    print(f"  File: {PATH}")
    print()
    for lang in LANGS:
        count = inserted[lang]
        if lang not in detected:
            print(f"    {lang}: (block not found — skipped)")
        elif count > 0:
            print(f"    {lang}: +{count} key(s)")
        else:
            print(f"    {lang}: (already complete)")


if __name__ == "__main__":
    main()

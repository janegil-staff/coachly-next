#!/usr/bin/env python3
"""Add goalsAxis1-5 to src/lib/translations.js for all 12 languages."""
import json
import re
from pathlib import Path

TRANSLATIONS_FILE = Path("src/lib/translations.js")

VALUES = {
    "en": {"goalsAxis1": "Clarity",     "goalsAxis2": "Progress",     "goalsAxis3": "Motivation",  "goalsAxis4": "Obstacles",   "goalsAxis5": "Support"},
    "no": {"goalsAxis1": "Klarhet",     "goalsAxis2": "Fremgang",     "goalsAxis3": "Motivasjon",  "goalsAxis4": "Hindringer",  "goalsAxis5": "Støtte"},
    "nl": {"goalsAxis1": "Helderheid",  "goalsAxis2": "Voortgang",    "goalsAxis3": "Motivatie",   "goalsAxis4": "Obstakels",   "goalsAxis5": "Steun"},
    "fr": {"goalsAxis1": "Clarté",      "goalsAxis2": "Progrès",      "goalsAxis3": "Motivation",  "goalsAxis4": "Obstacles",   "goalsAxis5": "Soutien"},
    "de": {"goalsAxis1": "Klarheit",    "goalsAxis2": "Fortschritt",  "goalsAxis3": "Motivation",  "goalsAxis4": "Hindernisse", "goalsAxis5": "Unterstützung"},
    "it": {"goalsAxis1": "Chiarezza",   "goalsAxis2": "Progresso",    "goalsAxis3": "Motivazione", "goalsAxis4": "Ostacoli",    "goalsAxis5": "Supporto"},
    "sv": {"goalsAxis1": "Tydlighet",   "goalsAxis2": "Framsteg",     "goalsAxis3": "Motivation",  "goalsAxis4": "Hinder",      "goalsAxis5": "Stöd"},
    "da": {"goalsAxis1": "Klarhed",     "goalsAxis2": "Fremgang",     "goalsAxis3": "Motivation",  "goalsAxis4": "Hindringer",  "goalsAxis5": "Støtte"},
    "fi": {"goalsAxis1": "Selkeys",     "goalsAxis2": "Edistyminen",  "goalsAxis3": "Motivaatio",  "goalsAxis4": "Esteet",      "goalsAxis5": "Tuki"},
    "es": {"goalsAxis1": "Claridad",    "goalsAxis2": "Progreso",     "goalsAxis3": "Motivación",  "goalsAxis4": "Obstáculos",  "goalsAxis5": "Apoyo"},
    "pl": {"goalsAxis1": "Jasność",     "goalsAxis2": "Postęp",       "goalsAxis3": "Motywacja",   "goalsAxis4": "Przeszkody",  "goalsAxis5": "Wsparcie"},
    "pt": {"goalsAxis1": "Clareza",     "goalsAxis2": "Progresso",    "goalsAxis3": "Motivação",   "goalsAxis4": "Obstáculos",  "goalsAxis5": "Apoio"},
}


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def patch_language_block(content: str, lang: str, entries: dict) -> str:
    open_pattern = re.compile(rf'"{lang}":\s*\{{')
    open_match = open_pattern.search(content)
    if not open_match:
        print(f"  ⚠️  Could not find opening for '{lang}'")
        return content

    start = open_match.end()
    depth = 1
    i = start
    in_string = False
    string_char = None
    while i < len(content) and depth > 0:
        c = content[i]
        if in_string:
            if c == "\\":
                i += 2
                continue
            if c == string_char:
                in_string = False
        else:
            if c == '"' or c == "'":
                in_string = True
                string_char = c
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    break
        i += 1

    if depth != 0:
        return content

    block_start = open_match.end()
    block_end = i
    block = content[block_start:block_end]

    for key, value in entries.items():
        line = f'    "{key}": {js_string(value)},'
        key_pattern = re.compile(
            rf'^\s*"{re.escape(key)}":\s*.*?,?\s*$',
            re.MULTILINE,
        )
        if key_pattern.search(block):
            block = key_pattern.sub(line, block, count=1)
        else:
            if block.endswith("\n"):
                block = block + line + "\n  "
            else:
                block = block.rstrip() + "\n" + line + "\n  "

    return content[:block_start] + block + content[block_end:]


def main() -> None:
    if not TRANSLATIONS_FILE.exists():
        raise SystemExit(f"❌ {TRANSLATIONS_FILE} not found")

    content = TRANSLATIONS_FILE.read_text(encoding="utf-8")
    for lang, entries in VALUES.items():
        print(f"Patching '{lang}'…")
        content = patch_language_block(content, lang, entries)

    TRANSLATIONS_FILE.write_text(content, encoding="utf-8")
    print(f"✅ Patched 5 axis keys × {len(VALUES)} languages")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""Add stat ribbon labels to src/lib/translations.js for all 12 languages."""
import json
import re
from pathlib import Path

TRANSLATIONS_FILE = Path("src/lib/translations.js")

VALUES = {
    "en": {
        "composite":      "Composite",
        "streak":         "Streak",
        "sessions":       "Sessions",
        "topType":        "Top type",
        "ofWorkouts":     "of workouts",
        "day":            "day",
        "days":           "days",
        "streakStrong":   "🔥 On fire",
        "streakBuilding": "Building",
        "streakStarting": "Just starting",
    },
    "no": {
        "composite":      "Sammensatt",
        "streak":         "Strekk",
        "sessions":       "Økter",
        "topType":        "Mest brukt",
        "ofWorkouts":     "av øktene",
        "day":            "dag",
        "days":           "dager",
        "streakStrong":   "🔥 På topp",
        "streakBuilding": "Bygger opp",
        "streakStarting": "Akkurat startet",
    },
    "nl": {
        "composite":      "Totaalscore",
        "streak":         "Reeks",
        "sessions":       "Sessies",
        "topType":        "Meest gedaan",
        "ofWorkouts":     "van trainingen",
        "day":            "dag",
        "days":           "dagen",
        "streakStrong":   "🔥 In vorm",
        "streakBuilding": "Opbouwen",
        "streakStarting": "Net begonnen",
    },
    "fr": {
        "composite":      "Composite",
        "streak":         "Série",
        "sessions":       "Séances",
        "topType":        "Type principal",
        "ofWorkouts":     "des séances",
        "day":            "jour",
        "days":           "jours",
        "streakStrong":   "🔥 En feu",
        "streakBuilding": "En progression",
        "streakStarting": "Juste commencé",
    },
    "de": {
        "composite":      "Gesamtwert",
        "streak":         "Serie",
        "sessions":       "Einheiten",
        "topType":        "Top-Typ",
        "ofWorkouts":     "der Einheiten",
        "day":            "Tag",
        "days":           "Tage",
        "streakStrong":   "🔥 Im Flow",
        "streakBuilding": "Aufbauend",
        "streakStarting": "Frisch gestartet",
    },
    "it": {
        "composite":      "Composito",
        "streak":         "Serie",
        "sessions":       "Sessioni",
        "topType":        "Tipo principale",
        "ofWorkouts":     "delle sessioni",
        "day":            "giorno",
        "days":           "giorni",
        "streakStrong":   "🔥 In forma",
        "streakBuilding": "In crescita",
        "streakStarting": "Appena iniziato",
    },
    "sv": {
        "composite":      "Totalpoäng",
        "streak":         "Streak",
        "sessions":       "Pass",
        "topType":        "Vanligast",
        "ofWorkouts":     "av passen",
        "day":            "dag",
        "days":           "dagar",
        "streakStrong":   "🔥 På topp",
        "streakBuilding": "Bygger upp",
        "streakStarting": "Precis börjat",
    },
    "da": {
        "composite":      "Samlet score",
        "streak":         "Stime",
        "sessions":       "Træninger",
        "topType":        "Mest brugte",
        "ofWorkouts":     "af træninger",
        "day":            "dag",
        "days":           "dage",
        "streakStrong":   "🔥 På toppen",
        "streakBuilding": "Bygger op",
        "streakStarting": "Lige startet",
    },
    "fi": {
        "composite":      "Kokonaispisteet",
        "streak":         "Putki",
        "sessions":       "Treenit",
        "topType":        "Yleisin",
        "ofWorkouts":     "treeneistä",
        "day":            "päivä",
        "days":           "päivää",
        "streakStrong":   "🔥 Tulessa",
        "streakBuilding": "Kasvaa",
        "streakStarting": "Vasta alkanut",
    },
    "es": {
        "composite":      "Compuesto",
        "streak":         "Racha",
        "sessions":       "Sesiones",
        "topType":        "Tipo principal",
        "ofWorkouts":     "de los entrenamientos",
        "day":            "día",
        "days":           "días",
        "streakStrong":   "🔥 En racha",
        "streakBuilding": "Construyendo",
        "streakStarting": "Recién empezando",
    },
    "pl": {
        "composite":      "Wynik łączny",
        "streak":         "Seria",
        "sessions":       "Sesje",
        "topType":        "Najczęstszy typ",
        "ofWorkouts":     "treningów",
        "day":            "dzień",
        "days":           "dni",
        "streakStrong":   "🔥 W ogniu",
        "streakBuilding": "Buduje się",
        "streakStarting": "Świeży start",
    },
    "pt": {
        "composite":      "Composto",
        "streak":         "Sequência",
        "sessions":       "Sessões",
        "topType":        "Tipo principal",
        "ofWorkouts":     "dos treinos",
        "day":            "dia",
        "days":           "dias",
        "streakStrong":   "🔥 Em chamas",
        "streakBuilding": "Construindo",
        "streakStarting": "Começou agora",
    },
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
    print(f"✅ Patched 10 keys × {len(VALUES)} languages = {10 * len(VALUES)} entries")


if __name__ == "__main__":
    main()
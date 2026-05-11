#!/usr/bin/env python3
"""
patch_coachly_exercises_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds translation keys for the new "Exercises" sidebar card to all 12
languages in couchly-next/src/lib/translations.js. Idempotent — only
the missing keys are inserted per language.

Keys added:
  • exercises               — collapsible card title
  • exercisesEmpty          — empty-state message
  • exerciseSingular        — "exercise" (after "1")
  • exercisesPlural         — "exercises" (after numbers > 1)
  • customExerciseLabel     — pill text for client-created exercises
  • customExerciseTooltip   — pill hover text
  • unnamedEntrySingular    — footer "+ 1 unnamed entry"
  • unnamedEntryPlural      — footer "+ N unnamed entries"

Run from couchly-next/ project root:
    python3 path/to/patch_coachly_exercises_translations.py
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
    "exercises": {
        "no": "Øvelser",       "en": "Exercises",   "nl": "Oefeningen",
        "fr": "Exercices",     "de": "Übungen",     "it": "Esercizi",
        "sv": "Övningar",      "da": "Øvelser",     "fi": "Harjoitukset",
        "es": "Ejercicios",    "pl": "Ćwiczenia",   "pt": "Exercícios",
    },
    "exercisesEmpty": {
        "no": "Ingen navngitte øvelser logget enda",
        "en": "No named exercises logged yet",
        "nl": "Nog geen benoemde oefeningen gelogd",
        "fr": "Aucun exercice nommé enregistré",
        "de": "Noch keine benannten Übungen protokolliert",
        "it": "Nessun esercizio denominato registrato",
        "sv": "Inga namngivna övningar loggade än",
        "da": "Ingen navngivne øvelser logget endnu",
        "fi": "Ei nimettyjä harjoituksia kirjattu",
        "es": "Sin ejercicios con nombre registrados",
        "pl": "Brak nazwanych ćwiczeń",
        "pt": "Nenhum exercício nomeado registado",
    },
    "exerciseSingular": {
        "no": "øvelse",     "en": "exercise",   "nl": "oefening",
        "fr": "exercice",   "de": "Übung",      "it": "esercizio",
        "sv": "övning",     "da": "øvelse",     "fi": "harjoitus",
        "es": "ejercicio",  "pl": "ćwiczenie",  "pt": "exercício",
    },
    "exercisesPlural": {
        "no": "øvelser",    "en": "exercises",  "nl": "oefeningen",
        "fr": "exercices",  "de": "Übungen",    "it": "esercizi",
        "sv": "övningar",   "da": "øvelser",    "fi": "harjoitusta",
        "es": "ejercicios", "pl": "ćwiczeń",    "pt": "exercícios",
    },
    "customExerciseLabel": {
        "no": "egen",       "en": "custom",     "nl": "eigen",
        "fr": "perso",      "de": "eigene",     "it": "person.",
        "sv": "egen",       "da": "egen",       "fi": "oma",
        "es": "propio",     "pl": "własne",     "pt": "próprio",
    },
    "customExerciseTooltip": {
        "no": "Laget av klienten",
        "en": "Created by client",
        "nl": "Aangemaakt door cliënt",
        "fr": "Créé par le client",
        "de": "Vom Klienten erstellt",
        "it": "Creato dal cliente",
        "sv": "Skapad av klienten",
        "da": "Oprettet af klienten",
        "fi": "Asiakkaan luoma",
        "es": "Creado por el cliente",
        "pl": "Utworzone przez klienta",
        "pt": "Criado pelo cliente",
    },
    "unnamedEntrySingular": {
        "no": "navnløs oppføring",
        "en": "unnamed entry",
        "nl": "naamloze invoer",
        "fr": "entrée sans nom",
        "de": "unbenannter Eintrag",
        "it": "voce senza nome",
        "sv": "namnlös post",
        "da": "unavngiven post",
        "fi": "nimetön merkintä",
        "es": "entrada sin nombre",
        "pl": "wpis bez nazwy",
        "pt": "entrada sem nome",
    },
    "unnamedEntryPlural": {
        "no": "navnløse oppføringer",
        "en": "unnamed entries",
        "nl": "naamloze invoeren",
        "fr": "entrées sans nom",
        "de": "unbenannte Einträge",
        "it": "voci senza nome",
        "sv": "namnlösa poster",
        "da": "unavngivne poster",
        "fi": "nimetöntä merkintää",
        "es": "entradas sin nombre",
        "pl": "wpisów bez nazwy",
        "pt": "entradas sem nome",
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

        inner_indent = indent + "  "

        for key in KEYS:
            pattern = rf'(?<![A-Za-z0-9_])["\']?{re.escape(key)}["\']?\s*:'
            if re.search(pattern, block_text):
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
        print("✓ All exercise keys already present in every language — nothing to do.")
        return

    PATH.write_text("".join(out), encoding="utf-8")

    print("✓ Exercise translation keys patched.")
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

#!/usr/bin/env python3
"""
patch_coachly_history_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds translation keys for the new HistoryTab (ported from recover) to all
12 languages in couchly-next/src/lib/translations.js.

Keys added:
  • PeriodRibbon         — streakNow, lastTraining, bestDay, worstDay,
                            totalLogs, daysPlural, never
  • TimelineScrubber     — timeline, trainingShort, restShort, milestone,
                            streakBroken
  • FilterChips          — filterAll, filterTrainingDays, filterRestDays,
                            filterHighSoreness, filterHighEffort,
                            filterNotes, filterMilestones
  • LogRow / events      — highSoreness, highEffort, daySingular,
                            workoutSingular, restDay, cm
  • HistoryTab           — searchLogs, noLogs, noMatchingLogs

Run from couchly-next/ project root:
    python3 path/to/patch_coachly_history_translations.py
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
    # ── PeriodRibbon ──────────────────────────────────────────────
    "streakNow": {
        "no": "Nåværende serie", "en": "Current streak",
        "nl": "Huidige reeks", "fr": "Série actuelle",
        "de": "Aktuelle Serie", "it": "Serie attuale",
        "sv": "Nuvarande svit", "da": "Nuværende serie",
        "fi": "Nykyinen putki", "es": "Racha actual",
        "pl": "Bieżąca seria", "pt": "Sequência atual",
    },
    "lastTraining": {
        "no": "Siste trening", "en": "Last training",
        "nl": "Laatste training", "fr": "Dernier entraînement",
        "de": "Letztes Training", "it": "Ultimo allenamento",
        "sv": "Senaste träning", "da": "Sidste træning",
        "fi": "Viimeisin treeni", "es": "Último entrenamiento",
        "pl": "Ostatni trening", "pt": "Último treino",
    },
    "bestDay": {
        "no": "Beste dag", "en": "Best day", "nl": "Beste dag",
        "fr": "Meilleur jour", "de": "Bester Tag", "it": "Miglior giorno",
        "sv": "Bästa dag", "da": "Bedste dag", "fi": "Paras päivä",
        "es": "Mejor día", "pl": "Najlepszy dzień", "pt": "Melhor dia",
    },
    "worstDay": {
        "no": "Verste dag", "en": "Worst day", "nl": "Slechtste dag",
        "fr": "Pire jour", "de": "Schlechtester Tag", "it": "Peggior giorno",
        "sv": "Sämsta dag", "da": "Værste dag", "fi": "Huonoin päivä",
        "es": "Peor día", "pl": "Najgorszy dzień", "pt": "Pior dia",
    },
    "totalLogs": {
        "no": "Totalt logger", "en": "Total logs", "nl": "Totaal logs",
        "fr": "Total entrées", "de": "Einträge gesamt", "it": "Voci totali",
        "sv": "Loggar totalt", "da": "Logger i alt", "fi": "Merkintöjä yhteensä",
        "es": "Registros totales", "pl": "Łącznie wpisów", "pt": "Registos totais",
    },
    "daysPlural": {
        "no": "dager", "en": "days", "nl": "dagen", "fr": "jours",
        "de": "Tage", "it": "giorni", "sv": "dagar", "da": "dage",
        "fi": "päivää", "es": "días", "pl": "dni", "pt": "dias",
    },
    "never": {
        "no": "Aldri", "en": "Never", "nl": "Nooit", "fr": "Jamais",
        "de": "Nie", "it": "Mai", "sv": "Aldrig", "da": "Aldrig",
        "fi": "Ei koskaan", "es": "Nunca", "pl": "Nigdy", "pt": "Nunca",
    },

    # ── TimelineScrubber ──────────────────────────────────────────
    "timeline": {
        "no": "Tidslinje", "en": "Timeline", "nl": "Tijdlijn",
        "fr": "Chronologie", "de": "Zeitleiste", "it": "Cronologia",
        "sv": "Tidslinje", "da": "Tidslinje", "fi": "Aikajana",
        "es": "Cronología", "pl": "Oś czasu", "pt": "Linha do tempo",
    },
    "trainingShort": {
        "no": "Trening", "en": "Training", "nl": "Training",
        "fr": "Entrainem.", "de": "Training", "it": "Allenam.",
        "sv": "Träning", "da": "Træning", "fi": "Treeni",
        "es": "Entren.", "pl": "Trening", "pt": "Treino",
    },
    "restShort": {
        "no": "Hvile", "en": "Rest", "nl": "Rust", "fr": "Repos",
        "de": "Ruhe", "it": "Riposo", "sv": "Vila", "da": "Hvile",
        "fi": "Lepo", "es": "Descanso", "pl": "Odp.", "pt": "Descanso",
    },
    "milestone": {
        "no": "Milepæl", "en": "Milestone", "nl": "Mijlpaal",
        "fr": "Jalon", "de": "Meilenstein", "it": "Traguardo",
        "sv": "Milstolpe", "da": "Milepæl", "fi": "Virstanpylväs",
        "es": "Hito", "pl": "Kamień milowy", "pt": "Marco",
    },
    "streakBroken": {
        "no": "Serie brutt", "en": "Streak broken",
        "nl": "Reeks gebroken", "fr": "Série rompue",
        "de": "Serie unterbrochen", "it": "Serie interrotta",
        "sv": "Svit bruten", "da": "Serie brudt",
        "fi": "Putki katkesi", "es": "Racha rota",
        "pl": "Seria przerwana", "pt": "Sequência quebrada",
    },

    # ── FilterChips ───────────────────────────────────────────────
    "filterAll": {
        "no": "Alle", "en": "All", "nl": "Alles", "fr": "Tout",
        "de": "Alle", "it": "Tutti", "sv": "Alla", "da": "Alle",
        "fi": "Kaikki", "es": "Todos", "pl": "Wszystkie", "pt": "Todos",
    },
    "filterTrainingDays": {
        "no": "Treningsdager", "en": "Training days",
        "nl": "Trainingsdagen", "fr": "Jours d'entraînement",
        "de": "Trainingstage", "it": "Giorni di allenamento",
        "sv": "Träningsdagar", "da": "Træningsdage",
        "fi": "Treenipäivät", "es": "Días de entrenamiento",
        "pl": "Dni treningu", "pt": "Dias de treino",
    },
    "filterRestDays": {
        "no": "Hviledager", "en": "Rest days", "nl": "Rustdagen",
        "fr": "Jours de repos", "de": "Ruhetage", "it": "Giorni di riposo",
        "sv": "Vilodagar", "da": "Hviledage", "fi": "Lepopäivät",
        "es": "Días de descanso", "pl": "Dni odpoczynku", "pt": "Dias de descanso",
    },
    "filterHighSoreness": {
        "no": "Stølhet ≥4", "en": "Soreness ≥4", "nl": "Spierpijn ≥4",
        "fr": "Courbat. ≥4", "de": "Muskelkater ≥4", "it": "DOMS ≥4",
        "sv": "Träningsv. ≥4", "da": "Ømhed ≥4", "fi": "Lihaskipu ≥4",
        "es": "Agujetas ≥4", "pl": "Zakwasy ≥4", "pt": "Dor muscular ≥4",
    },
    "filterHighEffort": {
        "no": "Innsats ≥4", "en": "Effort ≥4", "nl": "Inspanning ≥4",
        "fr": "Effort ≥4", "de": "Anstrengung ≥4", "it": "Sforzo ≥4",
        "sv": "Ansträngn. ≥4", "da": "Indsats ≥4", "fi": "Ponnistus ≥4",
        "es": "Esfuerzo ≥4", "pl": "Wysiłek ≥4", "pt": "Esforço ≥4",
    },
    "filterNotes": {
        "no": "Med notater", "en": "With notes", "nl": "Met notities",
        "fr": "Avec notes", "de": "Mit Notizen", "it": "Con note",
        "sv": "Med anteckn.", "da": "Med noter", "fi": "Muistiinpanoilla",
        "es": "Con notas", "pl": "Z notatkami", "pt": "Com notas",
    },
    "filterMilestones": {
        "no": "Milepæler", "en": "Milestones", "nl": "Mijlpalen",
        "fr": "Jalons", "de": "Meilensteine", "it": "Traguardi",
        "sv": "Milstolpar", "da": "Milepæle", "fi": "Virstanpylväät",
        "es": "Hitos", "pl": "Kamienie milowe", "pt": "Marcos",
    },

    # ── LogRow / events ───────────────────────────────────────────
    "highSoreness": {
        "no": "Høy stølhet", "en": "High soreness",
        "nl": "Hoge spierpijn", "fr": "Courbatures élevées",
        "de": "Starker Muskelkater", "it": "DOMS elevati",
        "sv": "Hög träningsvärk", "da": "Høj ømhed",
        "fi": "Korkea lihaskipu", "es": "Agujetas altas",
        "pl": "Wysokie zakwasy", "pt": "Dor muscular alta",
    },
    "highEffort": {
        "no": "Høy innsats", "en": "High effort",
        "nl": "Hoge inspanning", "fr": "Effort élevé",
        "de": "Hohe Anstrengung", "it": "Sforzo elevato",
        "sv": "Hög ansträngning", "da": "Høj indsats",
        "fi": "Kova ponnistus", "es": "Alto esfuerzo",
        "pl": "Wysoki wysiłek", "pt": "Esforço alto",
    },
    "daySingular": {
        "no": "dag", "en": "day", "nl": "dag", "fr": "jour",
        "de": "Tag", "it": "giorno", "sv": "dag", "da": "dag",
        "fi": "päivän", "es": "día", "pl": "dzień", "pt": "dia",
    },
    "workoutSingular": {
        "no": "trening", "en": "workout", "nl": "training",
        "fr": "entraînement", "de": "Training", "it": "allenamento",
        "sv": "träning", "da": "træning", "fi": "treeni",
        "es": "entrenamiento", "pl": "trening", "pt": "treino",
    },
    "cm": {
        "no": "cm", "en": "cm", "nl": "cm", "fr": "cm",
        "de": "cm", "it": "cm", "sv": "cm", "da": "cm",
        "fi": "cm", "es": "cm", "pl": "cm", "pt": "cm",
    },

    # ── HistoryTab ────────────────────────────────────────────────
    "searchLogs": {
        "no": "Søk i notater eller øvelser",
        "en": "Search notes or exercises",
        "nl": "Zoeken in notities of oefeningen",
        "fr": "Rechercher notes ou exercices",
        "de": "Notizen oder Übungen durchsuchen",
        "it": "Cerca note o esercizi",
        "sv": "Sök i anteckningar eller övningar",
        "da": "Søg i noter eller øvelser",
        "fi": "Etsi muistiinpanoista tai harjoituksista",
        "es": "Buscar notas o ejercicios",
        "pl": "Szukaj notatek lub ćwiczeń",
        "pt": "Pesquisar notas ou exercícios",
    },
    "noLogs": {
        "no": "Ingen logger å vise.",
        "en": "No logs to display.",
        "nl": "Geen logs om weer te geven.",
        "fr": "Aucune entrée à afficher.",
        "de": "Keine Einträge anzuzeigen.",
        "it": "Nessuna voce da mostrare.",
        "sv": "Inga loggar att visa.",
        "da": "Ingen logger at vise.",
        "fi": "Ei merkintöjä näytettäväksi.",
        "es": "No hay registros para mostrar.",
        "pl": "Brak wpisów do wyświetlenia.",
        "pt": "Nenhum registo para mostrar.",
    },
    "noMatchingLogs": {
        "no": "Ingen logger samsvarer med filteret.",
        "en": "No logs match the current filter.",
        "nl": "Geen logs voldoen aan het huidige filter.",
        "fr": "Aucune entrée ne correspond au filtre.",
        "de": "Keine Einträge entsprechen dem Filter.",
        "it": "Nessuna voce corrisponde al filtro.",
        "sv": "Inga loggar matchar filtret.",
        "da": "Ingen logger matcher filteret.",
        "fi": "Ei merkintöjä, jotka vastaavat suodatinta.",
        "es": "Ningún registro coincide con el filtro.",
        "pl": "Żaden wpis nie pasuje do filtra.",
        "pt": "Nenhum registo corresponde ao filtro.",
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
        print("✓ All history keys already present in every language — nothing to do.")
        return

    PATH.write_text("".join(out), encoding="utf-8")

    print("✓ History translation keys patched.")
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
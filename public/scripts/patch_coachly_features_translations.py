#!/usr/bin/env python3
"""
patch_coachly_features_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds translation keys for the 5 new dashboard features to all 12 languages
in couchly-next/src/lib/translations.js. Idempotent — per-language, only
the missing keys are inserted.

Features covered:
  • NotesLog                — notesLog, notesEmpty
  • AlertsInbox             — alertsInbox, alertsEmpty, alertLowMood,
                              alertLowEnergy, alertPoorSleep,
                              alertHighSoreness, alertPainNote,
                              alertGapDays
  • WorkoutTypeChart        — workoutTypeDistribution,
                              noWorkoutsThisMonth, minutes
                              (uses existing categoryStrength/Cardio/
                               Mobility/Recovery keys)
  • BodyComposition         — bodyComposition, notEnoughWeightData,
                              entries, sinceStart, kg
  • DayOfWeekPatterns       — dayOfWeekPatterns, weekdaysShort,
                              noDataForMetric, noData
                              (uses existing mood/energy/effort/
                               soreness/sleep keys)

Run from couchly-next/ project root:
    python3 path/to/patch_coachly_features_translations.py
"""
import re
import sys
from pathlib import Path

PATH = Path("src/lib/translations.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    sys.exit(1)

LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"]

# Most string values are simple. Two special cases:
#   • weekdaysShort is an ARRAY of 7 strings, not a single string.
#   • Multi-word strings need single-quote escaping (handled below).
KEYS = {
    # NotesLog
    "notesLog": {
        "no": "Notater", "en": "Notes log", "nl": "Notitieoverzicht",
        "fr": "Journal de notes", "de": "Notizen", "it": "Registro note",
        "sv": "Anteckningar", "da": "Noter", "fi": "Muistiinpanot",
        "es": "Registro de notas", "pl": "Dziennik notatek", "pt": "Registo de notas",
    },
    "notesEmpty": {
        "no": "Ingen notater denne måneden",
        "en": "No notes this month",
        "nl": "Geen notities deze maand",
        "fr": "Aucune note ce mois-ci",
        "de": "Keine Notizen diesen Monat",
        "it": "Nessuna nota questo mese",
        "sv": "Inga anteckningar denna månad",
        "da": "Ingen noter denne måned",
        "fi": "Ei muistiinpanoja tässä kuussa",
        "es": "Sin notas este mes",
        "pl": "Brak notatek w tym miesiącu",
        "pt": "Sem notas este mês",
    },

    # AlertsInbox
    "alertsInbox": {
        "no": "Varsler", "en": "Alerts", "nl": "Waarschuwingen",
        "fr": "Alertes", "de": "Warnungen", "it": "Avvisi",
        "sv": "Varningar", "da": "Advarsler", "fi": "Hälytykset",
        "es": "Alertas", "pl": "Alerty", "pt": "Alertas",
    },
    "alertsEmpty": {
        "no": "Ingen varsler denne måneden",
        "en": "No alerts this month",
        "nl": "Geen waarschuwingen deze maand",
        "fr": "Aucune alerte ce mois-ci",
        "de": "Keine Warnungen diesen Monat",
        "it": "Nessun avviso questo mese",
        "sv": "Inga varningar denna månad",
        "da": "Ingen advarsler denne måned",
        "fi": "Ei hälytyksiä tässä kuussa",
        "es": "Sin alertas este mes",
        "pl": "Brak alertów w tym miesiącu",
        "pt": "Sem alertas este mês",
    },
    "alertLowMood": {
        "no": "Veldig lavt humør", "en": "Very low mood",
        "nl": "Zeer lage stemming", "fr": "Humeur très basse",
        "de": "Sehr schlechte Stimmung", "it": "Umore molto basso",
        "sv": "Mycket lågt humör", "da": "Meget lavt humør",
        "fi": "Erittäin matala mieliala", "es": "Ánimo muy bajo",
        "pl": "Bardzo niski nastrój", "pt": "Humor muito baixo",
    },
    "alertLowEnergy": {
        "no": "Veldig lav energi", "en": "Very low energy",
        "nl": "Zeer lage energie", "fr": "Énergie très basse",
        "de": "Sehr niedrige Energie", "it": "Energia molto bassa",
        "sv": "Mycket låg energi", "da": "Meget lav energi",
        "fi": "Erittäin matala energia", "es": "Energía muy baja",
        "pl": "Bardzo niska energia", "pt": "Energia muito baixa",
    },
    "alertPoorSleep": {
        "no": "Veldig dårlig søvn", "en": "Very poor sleep",
        "nl": "Zeer slechte slaap", "fr": "Très mauvais sommeil",
        "de": "Sehr schlechter Schlaf", "it": "Sonno molto scarso",
        "sv": "Mycket dålig sömn", "da": "Meget dårlig søvn",
        "fi": "Erittäin huono uni", "es": "Sueño muy malo",
        "pl": "Bardzo zły sen", "pt": "Sono muito mau",
    },
    "alertHighSoreness": {
        "no": "Ekstrem stølhet", "en": "Extreme soreness",
        "nl": "Extreme spierpijn", "fr": "Courbatures extrêmes",
        "de": "Extremer Muskelkater", "it": "DOMS estremi",
        "sv": "Extrem träningsvärk", "da": "Ekstrem muskelømhed",
        "fi": "Erittäin korkea lihaskipu", "es": "Agujetas extremas",
        "pl": "Ekstremalny zakwas", "pt": "Dor muscular extrema",
    },
    "alertPainNote": {
        "no": "Notat nevner smerte eller skade",
        "en": "Note mentions pain or injury",
        "nl": "Notitie noemt pijn of blessure",
        "fr": "Note mentionne douleur ou blessure",
        "de": "Notiz erwähnt Schmerz oder Verletzung",
        "it": "La nota menziona dolore o infortunio",
        "sv": "Anteckning nämner smärta eller skada",
        "da": "Note nævner smerte eller skade",
        "fi": "Muistiinpano mainitsee kivun tai vamman",
        "es": "Nota menciona dolor o lesión",
        "pl": "Notatka wspomina ból lub kontuzję",
        "pt": "Nota menciona dor ou lesão",
    },
    "alertGapDays": {
        "no": "dager uten logg",
        "en": "days no log",
        "nl": "dagen geen log",
        "fr": "jours sans enregistrement",
        "de": "Tage ohne Eintrag",
        "it": "giorni senza registro",
        "sv": "dagar utan logg",
        "da": "dage uden log",
        "fi": "päivää ilman merkintää",
        "es": "días sin registro",
        "pl": "dni bez wpisu",
        "pt": "dias sem registo",
    },

    # WorkoutTypeChart
    "workoutTypeDistribution": {
        "no": "Treningstyper", "en": "Workout type distribution",
        "nl": "Trainingstype-verdeling", "fr": "Répartition des types d'entraînement",
        "de": "Trainingsarten-Verteilung", "it": "Distribuzione tipi di allenamento",
        "sv": "Träningstypsfördelning", "da": "Træningstypefordeling",
        "fi": "Treenityyppien jakauma", "es": "Distribución por tipo de entrenamiento",
        "pl": "Rozkład typów treningu", "pt": "Distribuição de tipos de treino",
    },
    "noWorkoutsThisMonth": {
        "no": "Ingen treninger denne måneden",
        "en": "No workouts logged this month",
        "nl": "Geen trainingen deze maand",
        "fr": "Aucun entraînement ce mois-ci",
        "de": "Keine Trainings diesen Monat",
        "it": "Nessun allenamento questo mese",
        "sv": "Inga träningar denna månad",
        "da": "Ingen træninger denne måned",
        "fi": "Ei treenejä tässä kuussa",
        "es": "Sin entrenamientos este mes",
        "pl": "Brak treningów w tym miesiącu",
        "pt": "Sem treinos este mês",
    },
    "minutes": {
        "no": "min", "en": "min", "nl": "min", "fr": "min",
        "de": "Min", "it": "min", "sv": "min", "da": "min",
        "fi": "min", "es": "min", "pl": "min", "pt": "min",
    },

    # BodyComposition
    "bodyComposition": {
        "no": "Kroppssammensetning", "en": "Body composition",
        "nl": "Lichaamssamenstelling", "fr": "Composition corporelle",
        "de": "Körperzusammensetzung", "it": "Composizione corporea",
        "sv": "Kroppssammansättning", "da": "Kropssammensætning",
        "fi": "Kehonkoostumus", "es": "Composición corporal",
        "pl": "Skład ciała", "pt": "Composição corporal",
    },
    "notEnoughWeightData": {
        "no": "Ikke nok vektdata enda",
        "en": "Not enough weight data yet",
        "nl": "Nog niet genoeg gewichtgegevens",
        "fr": "Pas encore assez de données de poids",
        "de": "Noch nicht genug Gewichtsdaten",
        "it": "Non abbastanza dati di peso ancora",
        "sv": "Inte tillräckligt med viktdata än",
        "da": "Ikke nok vægtdata endnu",
        "fi": "Ei riittävästi painotietoja vielä",
        "es": "Aún no hay suficientes datos de peso",
        "pl": "Za mało danych o wadze",
        "pt": "Ainda não há dados de peso suficientes",
    },
    "entries": {
        "no": "oppføringer", "en": "entries", "nl": "items",
        "fr": "entrées", "de": "Einträge", "it": "voci",
        "sv": "poster", "da": "poster", "fi": "merkintää",
        "es": "entradas", "pl": "wpisów", "pt": "entradas",
    },
    "sinceStart": {
        "no": "siden start", "en": "since start", "nl": "sinds begin",
        "fr": "depuis le début", "de": "seit Beginn", "it": "dall'inizio",
        "sv": "sedan start", "da": "siden start", "fi": "alusta",
        "es": "desde el inicio", "pl": "od początku", "pt": "desde o início",
    },

    # DayOfWeekPatterns
    "dayOfWeekPatterns": {
        "no": "Ukedagmønstre", "en": "Day-of-week patterns",
        "nl": "Weekdagpatronen", "fr": "Modèles par jour de la semaine",
        "de": "Wochentagsmuster", "it": "Pattern per giorno della settimana",
        "sv": "Veckodagsmönster", "da": "Ugedagsmønstre",
        "fi": "Viikonpäivien kaavat", "es": "Patrones por día de la semana",
        "pl": "Wzorce dni tygodnia", "pt": "Padrões por dia da semana",
    },
    "noDataForMetric": {
        "no": "Ingen data for denne metrikken",
        "en": "No data for this metric",
        "nl": "Geen gegevens voor deze metriek",
        "fr": "Aucune donnée pour cette mesure",
        "de": "Keine Daten für diese Metrik",
        "it": "Nessun dato per questa metrica",
        "sv": "Inga data för detta mått",
        "da": "Ingen data for denne metrik",
        "fi": "Ei tietoja tälle mittarille",
        "es": "Sin datos para esta métrica",
        "pl": "Brak danych dla tej metryki",
        "pt": "Sem dados para esta métrica",
    },
    "noData": {
        "no": "ingen data", "en": "no data", "nl": "geen gegevens",
        "fr": "aucune donnée", "de": "keine Daten", "it": "nessun dato",
        "sv": "inga data", "da": "ingen data", "fi": "ei tietoja",
        "es": "sin datos", "pl": "brak danych", "pt": "sem dados",
    },
}

# weekdaysShort is an array literal, handled separately.
WEEKDAYS_SHORT = {
    "no": ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
    "en": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    "nl": ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],
    "fr": ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    "de": ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
    "it": ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
    "sv": ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"],
    "da": ["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"],
    "fi": ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
    "es": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
    "pl": ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"],
    "pt": ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
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

        # 1. Regular string keys
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

        # 2. weekdaysShort array
        wkd_pattern = r'(?<![A-Za-z0-9_])["\']?weekdaysShort["\']?\s*:'
        if not re.search(wkd_pattern, block_text):
            arr = WEEKDAYS_SHORT.get(lang)
            if arr is not None:
                arr_literal = "[" + ", ".join(
                    f"'{w.replace(chr(92), chr(92)+chr(92)).replace(chr(39), chr(92)+chr(39))}'"
                    for w in arr
                ) + "]"
                out.append(f"{inner_indent}'weekdaysShort': {arr_literal},\n")
                inserted[lang] += 1

        out.append(lines[end])
        cursor = end + 1

    for k in range(cursor, len(lines)):
        out.append(lines[k])

    total = sum(inserted.values())
    if total == 0:
        print("✓ All feature keys already present in every language — nothing to do.")
        return

    PATH.write_text("".join(out), encoding="utf-8")

    print("✓ Feature translation keys patched.")
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

#!/usr/bin/env python3
"""
patch_coachly_dashboard_translations.py
─────────────────────────────────────────────────────────────────────────────
Adds all the new translation keys for the Coachly coach dashboard snapshot
to src/lib/translations.js — all 12 languages, idempotent.

Run from couchly-next/ project root:
    python3 path/to/patch_coachly_dashboard_translations.py

Idempotent — running it twice does nothing the second time. Per-language
idempotency: if some keys exist already in a language block, only the
missing ones are added.

Auto-detects the language blocks (no, en, nl, fr, de, it, sv, da, fi, es,
pl, pt) using the `<lang>: {` header pattern. Inserts each key on its own
line at the BOTTOM of each language block (just before the closing `},`).
"""
import re
import sys
from pathlib import Path

# Path inside the couchly-next project
PATH = Path("src/lib/translations.js")

if not PATH.exists():
    print(f"❌ Not found: {PATH}")
    print("   Run this script from the couchly-next/ project root.")
    sys.exit(1)

LANGS = ["no", "en", "nl", "fr", "de", "it", "sv", "da", "fi", "es", "pl", "pt"]

# ── All new keys × 12 languages ────────────────────────────────────────────
# Order here drives the order of insertion. Keep related keys grouped.

KEYS = {
    # ── Wellness tier labels (WellnessIndex) ────────────────────────────
    "tierPeakForm": {
        "no": "I toppform", "en": "Peak form", "nl": "Topvorm", "fr": "Au top",
        "de": "Bestform", "it": "Massima forma", "sv": "Toppform",
        "da": "Topform", "fi": "Huippukunnossa", "es": "En plena forma",
        "pl": "Szczytowa forma", "pt": "Em plena forma",
    },
    "tierOnTrack": {
        "no": "I rute", "en": "On track", "nl": "Op schema", "fr": "Sur la bonne voie",
        "de": "Auf Kurs", "it": "In linea", "sv": "På rätt spår",
        "da": "På sporet", "fi": "Aikataulussa", "es": "En camino",
        "pl": "Na dobrej drodze", "pt": "No caminho certo",
    },
    "tierPlateauing": {
        "no": "Stagnerer", "en": "Plateauing", "nl": "Stagnerend", "fr": "Stagnation",
        "de": "Stagnierend", "it": "In stallo", "sv": "Stagnerar",
        "da": "Stagnerer", "fi": "Pysähtynyt", "es": "Estancado",
        "pl": "Plateau", "pt": "Estagnando",
    },
    "tierStruggling": {
        "no": "Sliter", "en": "Struggling", "nl": "Worstelt", "fr": "En difficulté",
        "de": "Hat Mühe", "it": "In difficoltà", "sv": "Kämpar",
        "da": "Kæmper", "fi": "Kamppailee", "es": "Con dificultades",
        "pl": "Ma trudności", "pt": "Com dificuldades",
    },
    "tierBurnoutRisk": {
        "no": "Utbrenthetsrisiko", "en": "Burnout risk", "nl": "Burn-outrisico",
        "fr": "Risque d'épuisement", "de": "Burnout-Risiko", "it": "Rischio burnout",
        "sv": "Utbrändhetsrisk", "da": "Udbrændthedsrisiko",
        "fi": "Loppuunpalamisriski", "es": "Riesgo de agotamiento",
        "pl": "Ryzyko wypalenia", "pt": "Risco de esgotamento",
    },

    # ── WellnessIndex card ──────────────────────────────────────────────
    "wellnessIndex": {
        "no": "Velværeindeks", "en": "Wellness index", "nl": "Welzijnsindex",
        "fr": "Indice de bien-être", "de": "Wellness-Index", "it": "Indice di benessere",
        "sv": "Välmåendeindex", "da": "Velværeindeks", "fi": "Hyvinvointi-indeksi",
        "es": "Índice de bienestar", "pl": "Indeks dobrostanu", "pt": "Índice de bem-estar",
    },
    "vsPrevMonth": {
        "no": "mot forrige måned", "en": "vs. previous month",
        "nl": "vs. vorige maand", "fr": "vs. mois précédent",
        "de": "vs. Vormonat", "it": "vs. mese precedente",
        "sv": "mot föregående månad", "da": "mod forrige måned",
        "fi": "vs. edellinen kuukausi", "es": "vs. mes anterior",
        "pl": "vs. poprzedni miesiąc", "pt": "vs. mês anterior",
    },
    "improving": {
        "no": "forbedrer seg", "en": "improving", "nl": "verbeterend",
        "fr": "en amélioration", "de": "verbessert sich", "it": "in miglioramento",
        "sv": "förbättras", "da": "forbedres", "fi": "paranee",
        "es": "mejorando", "pl": "poprawia się", "pt": "melhorando",
    },
    "declining": {
        "no": "forverres", "en": "declining", "nl": "verslechterend",
        "fr": "en déclin", "de": "verschlechtert sich", "it": "in calo",
        "sv": "försämras", "da": "forværres", "fi": "heikkenee",
        "es": "empeorando", "pl": "pogarsza się", "pt": "piorando",
    },
    "stable": {
        "no": "stabil", "en": "stable", "nl": "stabiel", "fr": "stable",
        "de": "stabil", "it": "stabile", "sv": "stabil", "da": "stabil",
        "fi": "vakaa", "es": "estable", "pl": "stabilny", "pt": "estável",
    },
    "attentionNeeded": {
        "no": "Følg med", "en": "Watch", "nl": "Let op", "fr": "À surveiller",
        "de": "Beobachten", "it": "Da osservare", "sv": "Bevaka",
        "da": "Hold øje", "fi": "Tarkkaile", "es": "Vigilar",
        "pl": "Obserwuj", "pt": "Atenção",
    },
    "lastLog": {
        "no": "Sist logget", "en": "Last log", "nl": "Laatste log",
        "fr": "Dernière entrée", "de": "Letzter Eintrag", "it": "Ultimo log",
        "sv": "Senast loggad", "da": "Senest logget", "fi": "Viimeisin merkintä",
        "es": "Último registro", "pl": "Ostatni wpis", "pt": "Último registo",
    },
    "logToday": {
        "no": "Logget i dag", "en": "Logged today", "nl": "Vandaag gelogd",
        "fr": "Enregistré aujourd'hui", "de": "Heute eingetragen",
        "it": "Registrato oggi", "sv": "Loggad idag", "da": "Logget i dag",
        "fi": "Kirjattu tänään", "es": "Registrado hoy", "pl": "Zalogowano dziś",
        "pt": "Registado hoje",
    },
    "logYesterday": {
        "no": "Logget i går", "en": "Logged yesterday", "nl": "Gisteren gelogd",
        "fr": "Enregistré hier", "de": "Gestern eingetragen",
        "it": "Registrato ieri", "sv": "Loggad igår", "da": "Logget i går",
        "fi": "Kirjattu eilen", "es": "Registrado ayer", "pl": "Zalogowano wczoraj",
        "pt": "Registado ontem",
    },
    "daysAgo": {
        "no": "dager siden", "en": "days ago", "nl": "dagen geleden",
        "fr": "jours", "de": "Tage her", "it": "giorni fa",
        "sv": "dagar sedan", "da": "dage siden", "fi": "päivää sitten",
        "es": "días atrás", "pl": "dni temu", "pt": "dias atrás",
    },
    "showDetail": {
        "no": "Vis siste logg vs typisk", "en": "Show latest log vs typical",
        "nl": "Toon laatste log vs. typisch",
        "fr": "Afficher dernière entrée vs. typique",
        "de": "Letzter Eintrag vs. typisch", "it": "Mostra ultimo log vs. tipico",
        "sv": "Visa senaste log vs. typisk", "da": "Vis seneste log vs. typisk",
        "fi": "Näytä viimeisin vs. tyypillinen", "es": "Mostrar último vs. típico",
        "pl": "Pokaż ostatni vs. typowy", "pt": "Mostrar último vs. típico",
    },
    "hideDetail": {
        "no": "Skjul detaljer", "en": "Hide latest log detail",
        "nl": "Verberg details", "fr": "Masquer les détails",
        "de": "Details ausblenden", "it": "Nascondi dettagli",
        "sv": "Dölj detaljer", "da": "Skjul detaljer",
        "fi": "Piilota tiedot", "es": "Ocultar detalles",
        "pl": "Ukryj szczegóły", "pt": "Ocultar detalhes",
    },
    "atBaseline": {
        "no": "på snitt", "en": "at baseline", "nl": "op gemiddelde",
        "fr": "à la base", "de": "im Durchschnitt", "it": "alla media",
        "sv": "på snitt", "da": "på gennemsnit", "fi": "keskiarvossa",
        "es": "en la media", "pl": "na średniej", "pt": "na média",
    },
    "aboveAverage": {
        "no": "over snitt", "en": "above average", "nl": "boven gemiddeld",
        "fr": "au-dessus de la moyenne", "de": "über dem Durchschnitt",
        "it": "sopra la media", "sv": "över snitt", "da": "over gennemsnit",
        "fi": "keskiarvon yläpuolella", "es": "sobre la media",
        "pl": "powyżej średniej", "pt": "acima da média",
    },
    "belowAverage": {
        "no": "under snitt", "en": "below average", "nl": "onder gemiddeld",
        "fr": "en dessous de la moyenne", "de": "unter dem Durchschnitt",
        "it": "sotto la media", "sv": "under snitt", "da": "under gennemsnit",
        "fi": "keskiarvon alapuolella", "es": "bajo la media",
        "pl": "poniżej średniej", "pt": "abaixo da média",
    },
    "avg": {
        "no": "snitt", "en": "avg", "nl": "gem.", "fr": "moy.",
        "de": "Ø", "it": "media", "sv": "snitt", "da": "gns.",
        "fi": "ka", "es": "med.", "pl": "śr.", "pt": "méd.",
    },

    # ── Component bar labels ───────────────────────────────────────────
    "compConsistency": {
        "no": "Konsistens", "en": "Consistency", "nl": "Consistentie",
        "fr": "Régularité", "de": "Konsistenz", "it": "Costanza",
        "sv": "Konsekvens", "da": "Konsistens", "fi": "Johdonmukaisuus",
        "es": "Constancia", "pl": "Konsekwencja", "pt": "Consistência",
    },
    "compLowSoreness": {
        "no": "Lav stølhet", "en": "Low soreness", "nl": "Weinig spierpijn",
        "fr": "Faible courbature", "de": "Geringer Muskelkater",
        "it": "Bassi DOMS", "sv": "Låg träningsvärk", "da": "Lav muskelømhed",
        "fi": "Vähäinen lihaskipu", "es": "Pocas agujetas",
        "pl": "Niski zakwas", "pt": "Pouca dor muscular",
    },
    "compMoodEnergy": {
        "no": "Humør/energi", "en": "Mood/Energy", "nl": "Stemming/energie",
        "fr": "Humeur/énergie", "de": "Stimmung/Energie", "it": "Umore/energia",
        "sv": "Humör/energi", "da": "Humør/energi", "fi": "Mieliala/energia",
        "es": "Ánimo/energía", "pl": "Nastrój/energia", "pt": "Humor/energia",
    },
    "compRecovery": {
        "no": "Restitusjon", "en": "Recovery", "nl": "Herstel",
        "fr": "Récupération", "de": "Erholung", "it": "Recupero",
        "sv": "Återhämtning", "da": "Restitution", "fi": "Palautuminen",
        "es": "Recuperación", "pl": "Regeneracja", "pt": "Recuperação",
    },
    "compEngagement": {
        "no": "Engasjement", "en": "Engagement", "nl": "Betrokkenheid",
        "fr": "Engagement", "de": "Engagement", "it": "Coinvolgimento",
        "sv": "Engagemang", "da": "Engagement", "fi": "Sitoutuminen",
        "es": "Compromiso", "pl": "Zaangażowanie", "pt": "Envolvimento",
    },

    # ── Trajectory sparkline ───────────────────────────────────────────
    "trajectory": {
        "no": "Trend", "en": "Trajectory", "nl": "Verloop",
        "fr": "Trajectoire", "de": "Verlauf", "it": "Andamento",
        "sv": "Trend", "da": "Forløb", "fi": "Suunta",
        "es": "Trayectoria", "pl": "Trend", "pt": "Trajetória",
    },
    "sixMo": {
        "no": "6 mnd", "en": "6mo", "nl": "6 mnd", "fr": "6 mois",
        "de": "6 Mon.", "it": "6 mesi", "sv": "6 mån", "da": "6 mdr",
        "fi": "6 kk", "es": "6 meses", "pl": "6 mies.", "pt": "6 meses",
    },
    "inProgress": {
        "no": "pågående", "en": "in progress", "nl": "lopend",
        "fr": "en cours", "de": "läuft", "it": "in corso",
        "sv": "pågående", "da": "i gang", "fi": "käynnissä",
        "es": "en curso", "pl": "w trakcie", "pt": "em andamento",
    },

    # ── YearInPixels ───────────────────────────────────────────────────
    "yearAtAGlance": {
        "no": "Året i pixler", "en": "Year at a glance",
        "nl": "Jaaroverzicht", "fr": "Année en un coup d'œil",
        "de": "Jahr auf einen Blick", "it": "Anno in sintesi",
        "sv": "Året i en överblick", "da": "Året i overblik",
        "fi": "Vuosi yhdellä silmäyksellä", "es": "Año de un vistazo",
        "pl": "Rok w pigułce", "pt": "Ano em resumo",
    },
    "clickToJump": {
        "no": "Klikk en måned for å hoppe dit", "en": "Click any month to jump",
        "nl": "Klik op een maand om te springen",
        "fr": "Cliquez sur un mois pour y aller",
        "de": "Klick einen Monat zum Springen an",
        "it": "Clicca un mese per saltare",
        "sv": "Klicka på en månad för att hoppa dit",
        "da": "Klik på en måned for at hoppe dertil",
        "fi": "Napsauta kuukautta siirtyäksesi siihen",
        "es": "Haz clic en un mes para saltar",
        "pl": "Kliknij miesiąc, aby przejść",
        "pt": "Clique num mês para saltar",
    },
    "noLog": {
        "no": "ingen logg", "en": "no log", "nl": "geen log",
        "fr": "aucun journal", "de": "kein Eintrag", "it": "nessun log",
        "sv": "ingen logg", "da": "ingen log", "fi": "ei merkintää",
        "es": "sin registro", "pl": "brak wpisu", "pt": "sem registo",
    },

    # ── StreakComparison ───────────────────────────────────────────────
    "currentStreak": {
        "no": "Nåværende rekke", "en": "Current streak", "nl": "Huidige reeks",
        "fr": "Série actuelle", "de": "Aktuelle Serie", "it": "Serie attuale",
        "sv": "Nuvarande svit", "da": "Nuværende stime", "fi": "Nykyinen putki",
        "es": "Racha actual", "pl": "Obecna seria", "pt": "Sequência atual",
    },
    "lifetimeBest": {
        "no": "Beste noensinne", "en": "Lifetime best", "nl": "Allertijden beste",
        "fr": "Meilleur de tous les temps", "de": "Allzeit-Bestleistung",
        "it": "Miglior di sempre", "sv": "Bästa någonsin",
        "da": "Bedste nogensinde", "fi": "Kaikkien aikojen paras",
        "es": "Mejor de todos los tiempos", "pl": "Najlepszy wynik",
        "pt": "Melhor de sempre",
    },
    "avgStreak": {
        "no": "Snittrekke", "en": "Average streak", "nl": "Gem. reeks",
        "fr": "Série moyenne", "de": "Durchschnittliche Serie",
        "it": "Serie media", "sv": "Snittsvit", "da": "Gns. stime",
        "fi": "Keskim. putki", "es": "Racha media", "pl": "Średnia seria",
        "pt": "Sequência média",
    },
    "daySingular": {
        "no": "dag", "en": "day", "nl": "dag", "fr": "jour",
        "de": "Tag", "it": "giorno", "sv": "dag", "da": "dag",
        "fi": "päivä", "es": "día", "pl": "dzień", "pt": "dia",
    },
    "daysPlural": {
        "no": "dager", "en": "days", "nl": "dagen", "fr": "jours",
        "de": "Tage", "it": "giorni", "sv": "dagar", "da": "dage",
        "fi": "päivää", "es": "días", "pl": "dni", "pt": "dias",
    },
    "streakContextNewBest": {
        "no": "Ny personlig rekord", "en": "New personal best",
        "nl": "Nieuw persoonlijk record", "fr": "Nouveau record personnel",
        "de": "Neue Bestleistung", "it": "Nuovo record personale",
        "sv": "Nytt personligt rekord", "da": "Ny personlig rekord",
        "fi": "Uusi henkilökohtainen ennätys", "es": "Nuevo récord personal",
        "pl": "Nowy rekord życiowy", "pt": "Novo recorde pessoal",
    },
    "streakContextNearBest": {
        "no": "Nærmer seg personlig rekord", "en": "Approaching personal best",
        "nl": "Nadert persoonlijk record", "fr": "Approche du record personnel",
        "de": "Nähert sich der Bestleistung", "it": "Si avvicina al record personale",
        "sv": "Närmar sig personligt rekord", "da": "Nærmer sig personlig rekord",
        "fi": "Lähestyy henkilökohtaista ennätystä",
        "es": "Acercándose al récord personal",
        "pl": "Zbliża się do rekordu", "pt": "Aproximando-se do recorde pessoal",
    },
    "streakContextAboveAvg": {
        "no": "Over snitt", "en": "Above average", "nl": "Boven gemiddeld",
        "fr": "Au-dessus de la moyenne", "de": "Über dem Durchschnitt",
        "it": "Sopra la media", "sv": "Över snitt", "da": "Over gennemsnit",
        "fi": "Yli keskiarvon", "es": "Sobre la media",
        "pl": "Powyżej średniej", "pt": "Acima da média",
    },
    "streakContextAverage": {
        "no": "På snitt", "en": "At average", "nl": "Op gemiddelde",
        "fr": "Dans la moyenne", "de": "Im Durchschnitt", "it": "Nella media",
        "sv": "På snitt", "da": "På gennemsnit", "fi": "Keskitasolla",
        "es": "En la media", "pl": "Na średniej", "pt": "Na média",
    },
    "streakContextBuildingUp": {
        "no": "Bygger opp", "en": "Building up", "nl": "Bouwt op",
        "fr": "En construction", "de": "Im Aufbau", "it": "In costruzione",
        "sv": "Bygger upp", "da": "Bygger op", "fi": "Rakentaa",
        "es": "Construyendo", "pl": "Buduje", "pt": "A construir",
    },

    # ── PatientPulse ───────────────────────────────────────────────────
    "patientPulse": {
        "no": "Klientpuls", "en": "Client pulse", "nl": "Cliëntpols",
        "fr": "Pouls du client", "de": "Klienten-Puls", "it": "Polso del cliente",
        "sv": "Klientpuls", "da": "Klientpuls", "fi": "Asiakkaan tila",
        "es": "Pulso del cliente", "pl": "Puls klienta", "pt": "Pulso do cliente",
    },
    "pulseImproving": {
        "no": "Klient forbedrer seg", "en": "Client improving",
        "nl": "Cliënt verbetert", "fr": "Client en amélioration",
        "de": "Klient verbessert sich", "it": "Cliente in miglioramento",
        "sv": "Klient förbättras", "da": "Klient forbedres",
        "fi": "Asiakas paranee", "es": "Cliente mejorando",
        "pl": "Klient się poprawia", "pt": "Cliente a melhorar",
    },
    "pulseStable": {
        "no": "Klient stabil", "en": "Client stable", "nl": "Cliënt stabiel",
        "fr": "Client stable", "de": "Klient stabil", "it": "Cliente stabile",
        "sv": "Klient stabil", "da": "Klient stabil", "fi": "Asiakas vakaa",
        "es": "Cliente estable", "pl": "Klient stabilny", "pt": "Cliente estável",
    },
    "pulseWorsening": {
        "no": "Klient forverres", "en": "Client worsening",
        "nl": "Cliënt verslechtert", "fr": "Client en déclin",
        "de": "Klient verschlechtert sich", "it": "Cliente in peggioramento",
        "sv": "Klient försämras", "da": "Klient forværres",
        "fi": "Asiakas heikkenee", "es": "Cliente empeorando",
        "pl": "Klient pogarsza się", "pt": "Cliente a piorar",
    },
    "pulseCritical": {
        "no": "Trenger oppfølging", "en": "Needs attention",
        "nl": "Aandacht nodig", "fr": "Nécessite une attention",
        "de": "Braucht Aufmerksamkeit", "it": "Necessita attenzione",
        "sv": "Behöver uppmärksamhet", "da": "Kræver opmærksomhed",
        "fi": "Vaatii huomiota", "es": "Requiere atención",
        "pl": "Wymaga uwagi", "pt": "Requer atenção",
    },
    "talkingPoints": {
        "no": "Samtalepunkter", "en": "Talking points",
        "nl": "Gespreksonderwerpen", "fr": "Points de discussion",
        "de": "Gesprächspunkte", "it": "Punti di discussione",
        "sv": "Diskussionspunkter", "da": "Talepunkter",
        "fi": "Keskustelunaiheet", "es": "Puntos a tratar",
        "pl": "Tematy rozmowy", "pt": "Pontos a abordar",
    },
    "pulseStaleLog": {
        "no": "Har ikke logget på", "en": "Hasn't logged in",
        "nl": "Heeft niet gelogd in", "fr": "N'a pas enregistré depuis",
        "de": "Hat seit", "it": "Non ha registrato da",
        "sv": "Har inte loggat på", "da": "Har ikke logget i",
        "fi": "Ei ole kirjannut", "es": "No ha registrado en",
        "pl": "Nie zalogował się od", "pt": "Não regista há",
    },
    "pulseCheckIn": {
        "no": "vurder å ta kontakt", "en": "consider check-in",
        "nl": "overweeg contact", "fr": "envisager un suivi",
        "de": "Kontaktaufnahme erwägen", "it": "valutare un check-in",
        "sv": "överväg avstämning", "da": "overvej opfølgning",
        "fi": "harkitse yhteydenottoa", "es": "considera contactar",
        "pl": "rozważ kontakt", "pt": "considere contacto",
    },
    "pulseConsistencyDrop": {
        "no": "Betydelig fall i konsistens — trolig støttebehov",
        "en": "Significant drop in consistency — likely needs support",
        "nl": "Aanzienlijke daling in consistentie — heeft waarschijnlijk steun nodig",
        "fr": "Baisse importante de la régularité — soutien probablement nécessaire",
        "de": "Deutlicher Rückgang der Konsistenz — wahrscheinlich Unterstützung nötig",
        "it": "Calo significativo della costanza — probabilmente serve supporto",
        "sv": "Betydande nedgång i konsekvens — behöver troligen stöd",
        "da": "Betydeligt fald i konsistens — har sandsynligvis brug for støtte",
        "fi": "Merkittävä lasku johdonmukaisuudessa — todennäköisesti tarvitsee tukea",
        "es": "Caída significativa en constancia — probablemente necesita apoyo",
        "pl": "Znaczący spadek konsekwencji — prawdopodobnie wymaga wsparcia",
        "pt": "Queda significativa na consistência — provavelmente precisa de apoio",
    },
    "pulseHighSoreness": {
        "no": "Vedvarende høy stølhet — vurder intensitet/restitusjon",
        "en": "Elevated soreness sustained — review intensity/recovery",
        "nl": "Aanhoudende verhoogde spierpijn — herzie intensiteit/herstel",
        "fr": "Courbatures élevées persistantes — revoir intensité/récupération",
        "de": "Anhaltend erhöhter Muskelkater — Intensität/Erholung prüfen",
        "it": "DOMS elevati persistenti — rivedere intensità/recupero",
        "sv": "Ihållande hög träningsvärk — se över intensitet/återhämtning",
        "da": "Vedvarende høj muskelømhed — gennemgå intensitet/restitution",
        "fi": "Jatkuvasti korkea lihaskipu — tarkista intensiteetti/palautuminen",
        "es": "Agujetas elevadas sostenidas — revisar intensidad/recuperación",
        "pl": "Utrzymujący się wysoki zakwas — przejrzyj intensywność/regenerację",
        "pt": "Dor muscular elevada sustentada — rever intensidade/recuperação",
    },

    # ── MonthlyTrendsCard ──────────────────────────────────────────────
    "monthlyTrends": {
        "no": "Månedlige snitt", "en": "Monthly averages",
        "nl": "Maandelijkse gemiddelden", "fr": "Moyennes mensuelles",
        "de": "Monatliche Durchschnitte", "it": "Medie mensili",
        "sv": "Månadsgenomsnitt", "da": "Månedlige gennemsnit",
        "fi": "Kuukausikeskiarvot", "es": "Promedios mensuales",
        "pl": "Średnie miesięczne", "pt": "Médias mensais",
    },
    "noneThisMonth": {
        "no": "ingen denne måneden", "en": "none this month",
        "nl": "geen deze maand", "fr": "aucun ce mois",
        "de": "keine in diesem Monat", "it": "nessuno questo mese",
        "sv": "inga denna månad", "da": "ingen denne måned",
        "fi": "ei tässä kuussa", "es": "ninguno este mes",
        "pl": "brak w tym miesiącu", "pt": "nenhum este mês",
    },
    "noPrevMonth": {
        "no": "Ingen data fra forrige måned — kan ikke vise endring",
        "en": "No data for previous month — deltas unavailable",
        "nl": "Geen gegevens van vorige maand — geen verschillen",
        "fr": "Aucune donnée pour le mois précédent — écarts indisponibles",
        "de": "Keine Daten vom Vormonat — keine Veränderungen verfügbar",
        "it": "Nessun dato per il mese precedente — variazioni non disponibili",
        "sv": "Inga data för föregående månad — inga skillnader",
        "da": "Ingen data for forrige måned — ingen forskelle",
        "fi": "Ei tietoja edelliseltä kuukaudelta — muutoksia ei saatavilla",
        "es": "Sin datos del mes anterior — cambios no disponibles",
        "pl": "Brak danych z poprzedniego miesiąca — różnice niedostępne",
        "pt": "Sem dados do mês anterior — diferenças indisponíveis",
    },

    # ── Right column collapsibles ──────────────────────────────────────
    "relevantTips": {
        "no": "Relevante tips", "en": "Relevant tips", "nl": "Relevante tips",
        "fr": "Conseils pertinents", "de": "Relevante Tipps",
        "it": "Suggerimenti pertinenti", "sv": "Relevanta tips",
        "da": "Relevante tips", "fi": "Olennaiset vinkit",
        "es": "Consejos relevantes", "pl": "Trafne porady", "pt": "Dicas relevantes",
    },
    "monthlyAverages": {
        "no": "Månedlige snitt", "en": "Monthly averages",
        "nl": "Maandelijkse gemiddelden", "fr": "Moyennes mensuelles",
        "de": "Monatliche Durchschnitte", "it": "Medie mensili",
        "sv": "Månadsgenomsnitt", "da": "Månedlige gennemsnit",
        "fi": "Kuukausikeskiarvot", "es": "Promedios mensuales",
        "pl": "Średnie miesięczne", "pt": "Médias mensais",
    },
    "questionnaires": {
        "no": "Spørreskjemaer", "en": "Questionnaires",
        "nl": "Vragenlijsten", "fr": "Questionnaires",
        "de": "Fragebögen", "it": "Questionari",
        "sv": "Frågeformulär", "da": "Spørgeskemaer",
        "fi": "Kyselyt", "es": "Cuestionarios",
        "pl": "Kwestionariusze", "pt": "Questionários",
    },
}


# ── Patch logic ────────────────────────────────────────────────────────────

def main():
    src = PATH.read_text(encoding="utf-8")

    # Strategy: locate each language block by header `<lang>: {` and find
    # its matching closing `},`. Within each block, check which keys already
    # exist; insert the missing ones just before the closing brace.

    # Walk the file character by character to find balanced { } scope of each
    # language block — handles nested objects gracefully.
    lines = src.splitlines(keepends=True)

    # Detect language block ranges. Header regex matches lines like:
    #     no: {
    #     "no": {
    LANG_HEADER_RE = re.compile(r'^(\s*)["\']?(\w{2})["\']?\s*:\s*\{\s*$')

    blocks = []  # list of (lang, start_line_idx, end_line_idx, indent)

    i = 0
    while i < len(lines):
        m = LANG_HEADER_RE.match(lines[i])
        if m and m.group(2) in LANGS:
            lang = m.group(2)
            indent = m.group(1)
            # Find matching closing brace by counting braces
            depth = 0
            j = i
            found_end = None
            in_string = False
            string_char = None
            escape_next = False
            while j < len(lines):
                line = lines[j]
                for ch in line:
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
                    else:
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
        print("   Expected patterns like  `no: {` or `\"no\": {`")
        sys.exit(1)

    print(f"📂 Detected {len(blocks)} language block(s):")
    detected_langs = set()
    for lang, s, e, _ in blocks:
        print(f"     {lang}: lines {s + 1}–{e + 1}")
        detected_langs.add(lang)

    missing_langs = set(LANGS) - detected_langs
    if missing_langs:
        print(f"⚠ Missing language blocks: {sorted(missing_langs)}")
        print("   These languages will NOT be patched. Add them manually or check the file.")

    # Build per-block existing-key sets
    inserted_per_lang = {lang: 0 for lang in LANGS}
    output_lines = []
    cursor = 0

    # Sort blocks by start line so we process in file order
    blocks.sort(key=lambda b: b[1])

    for lang, start, end, indent in blocks:
        # Emit lines before this block (including the block start through
        # the line just before its closing brace).
        for k in range(cursor, end):
            output_lines.append(lines[k])

        # Examine block contents to know which keys already exist
        block_text = "".join(lines[start:end + 1])
        existing = set()
        for key in KEYS:
            # Match either bare or quoted form, followed by colon
            pattern = rf'(?<![A-Za-z0-9_])["\']?{re.escape(key)}["\']?\s*:'
            if re.search(pattern, block_text):
                existing.add(key)

        # Determine indent for inserted lines (one level deeper than block header)
        inner_indent = indent + "  "

        # Insert missing keys just before the closing line
        missing = [k for k in KEYS if k not in existing]
        for key in missing:
            value = KEYS[key].get(lang)
            if value is None:
                continue
            value_escaped = value.replace("\\", "\\\\").replace("'", "\\'")
            new_line = f"{inner_indent}'{key}': '{value_escaped}',\n"
            output_lines.append(new_line)
            inserted_per_lang[lang] += 1

        # Emit the closing-brace line itself
        output_lines.append(lines[end])
        cursor = end + 1

    # Emit anything after the last block
    for k in range(cursor, len(lines)):
        output_lines.append(lines[k])

    total_inserted = sum(inserted_per_lang.values())
    if total_inserted == 0:
        print("✓ All keys already present in every language — nothing to do.")
        return

    PATH.write_text("".join(output_lines), encoding="utf-8")

    print()
    print("✓ Translation keys patched.")
    print(f"  File: {PATH}")
    print()
    print("  Inserted per language:")
    for lang in LANGS:
        count = inserted_per_lang[lang]
        if lang not in detected_langs:
            print(f"    {lang}: (block not found — skipped)")
        elif count > 0:
            print(f"    {lang}: +{count} key(s)")
        else:
            print(f"    {lang}: (already complete)")
    print()
    print(f"  Total keys defined in script:  {len(KEYS)}")
    print(f"  Total insertions across langs: {total_inserted}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
add_dashboard_advice_translations.py

Adds advice-card translation keys to coachly-next/lib/translations.js
across all 12 languages.

Usage:
    python3 add_dashboard_advice_translations.py path/to/lib/translations.js
"""

import json
import re
import sys
from pathlib import Path

# ──────────────────────────────────────────────────────────────────────────
# Translations
# ──────────────────────────────────────────────────────────────────────────

TRANSLATIONS = {
    # Header / empty
    "advTitle": {
        "en": "Insights", "no": "Innsikt",
        "nl": "Inzichten", "fr": "Aperçus", "de": "Einblicke",
        "it": "Approfondimenti", "sv": "Insikter", "da": "Indsigt",
        "fi": "Havainnot", "es": "Ideas", "pl": "Wnioski",
        "pt": "Análise",
    },
    "advEmpty": {
        "en": "Not enough data yet for tailored insights.",
        "no": "Ikke nok data ennå for skreddersydd innsikt.",
        "nl": "Nog niet genoeg gegevens voor gerichte inzichten.",
        "fr": "Pas encore assez de données pour des analyses personnalisées.",
        "de": "Noch nicht genug Daten für maßgeschneiderte Einblicke.",
        "it": "Dati ancora insufficienti per analisi personalizzate.",
        "sv": "Inte tillräckligt med data för skräddarsydda insikter ännu.",
        "da": "Endnu ikke nok data til skræddersyet indsigt.",
        "fi": "Ei vielä riittävästi tietoa räätälöityihin havaintoihin.",
        "es": "Aún no hay suficientes datos para ideas personalizadas.",
        "pl": "Za mało danych do spersonalizowanych wniosków.",
        "pt": "Ainda não há dados suficientes para análises personalizadas.",
    },

    # ── Sleep low ──────────────────────────────────────────────────
    "adv_sleepLow_title": {
        "en": "Sleep is trending low", "no": "Søvnen er lav",
        "nl": "Slaap is aan de lage kant", "fr": "Le sommeil est en baisse",
        "de": "Schlaf tendiert niedrig", "it": "Il sonno è basso",
        "sv": "Sömnen trendar lågt", "da": "Søvnen er lav",
        "fi": "Uni on vähäistä", "es": "El sueño está bajo",
        "pl": "Sen jest słaby", "pt": "Sono em baixa",
    },
    "adv_sleepLow_body": {
        "en": "Average sleep quality over the last 14 days is {value}/5. Recovery and adaptation depend on this — worth a conversation.",
        "no": "Snittet for søvnkvalitet siste 14 dager er {value}/5. Restitusjon og tilpasning avhenger av dette — verdt en samtale.",
        "nl": "Gemiddelde slaapkwaliteit over de laatste 14 dagen is {value}/5. Herstel en aanpassing hangen hier sterk vanaf — bespreek het.",
        "fr": "La qualité moyenne du sommeil sur les 14 derniers jours est de {value}/5. La récupération en dépend — à discuter.",
        "de": "Die durchschnittliche Schlafqualität der letzten 14 Tage liegt bei {value}/5. Erholung und Anpassung hängen davon ab — sprich darüber.",
        "it": "La qualità media del sonno negli ultimi 14 giorni è {value}/5. Recupero e adattamento dipendono da questo — vale la pena parlarne.",
        "sv": "Genomsnittlig sömnkvalitet de senaste 14 dagarna är {value}/5. Återhämtning beror på detta — värt ett samtal.",
        "da": "Gennemsnitlig søvnkvalitet de sidste 14 dage er {value}/5. Restitution afhænger af dette — værd at tale om.",
        "fi": "Unen laadun keskiarvo viimeiset 14 päivää on {value}/5. Palautuminen riippuu tästä — keskusteltava.",
        "es": "La calidad media del sueño en los últimos 14 días es {value}/5. La recuperación depende de esto — vale la pena hablar.",
        "pl": "Średnia jakość snu w ciągu ostatnich 14 dni to {value}/5. Regeneracja zależy od tego — warto porozmawiać.",
        "pt": "A qualidade média do sono nos últimos 14 dias é {value}/5. A recuperação depende disto — vale a pena conversar.",
    },

    # ── Sleep good ─────────────────────────────────────────────────
    "adv_sleepGood_title": {
        "en": "Sleep is solid", "no": "Søvnen er solid",
        "nl": "Slaap is solide", "fr": "Le sommeil est solide",
        "de": "Schlaf ist solide", "it": "Il sonno è solido",
        "sv": "Sömnen är stabil", "da": "Søvnen er solid",
        "fi": "Uni on hyvällä tasolla", "es": "El sueño está bien",
        "pl": "Sen jest dobry", "pt": "Sono está bom",
    },
    "adv_sleepGood_body": {
        "en": "Average sleep quality is {value}/5 over the last 14 days. Solid foundation for adaptation.",
        "no": "Snittet for søvnkvalitet er {value}/5 siste 14 dager. Solid grunnlag for tilpasning.",
        "nl": "Gemiddelde slaapkwaliteit is {value}/5 over 14 dagen. Goede basis voor aanpassing.",
        "fr": "Qualité moyenne du sommeil de {value}/5 sur 14 jours. Base solide pour l'adaptation.",
        "de": "Durchschnittliche Schlafqualität von {value}/5 über 14 Tage. Solide Basis für Anpassung.",
        "it": "Qualità media del sonno {value}/5 negli ultimi 14 giorni. Base solida per l'adattamento.",
        "sv": "Genomsnittlig sömnkvalitet {value}/5 på 14 dagar. Stabil grund för anpassning.",
        "da": "Gennemsnitlig søvnkvalitet {value}/5 over 14 dage. Solidt grundlag for tilpasning.",
        "fi": "Unen laadun keskiarvo {value}/5 viimeiset 14 päivää. Vakaa pohja sopeutumiselle.",
        "es": "Calidad media del sueño {value}/5 en 14 días. Base sólida para adaptación.",
        "pl": "Średnia jakość snu {value}/5 przez 14 dni. Solidna baza do adaptacji.",
        "pt": "Qualidade média do sono {value}/5 em 14 dias. Base sólida para adaptação.",
    },

    # ── High soreness ──────────────────────────────────────────────
    "adv_highSoreness_title": {
        "en": "High soreness on many days",
        "no": "Mye stølhet i flere dager",
        "nl": "Veel spierpijn op meerdere dagen",
        "fr": "Courbatures élevées sur plusieurs jours",
        "de": "Hoher Muskelkater an vielen Tagen",
        "it": "Dolori muscolari forti in molti giorni",
        "sv": "Mycket träningsvärk många dagar",
        "da": "Meget ømhed mange dage",
        "fi": "Kovaa lihaskipua usean päivän ajan",
        "es": "Agujetas altas en varios días",
        "pl": "Silny ból mięśni przez wiele dni",
        "pt": "Dores musculares fortes em vários dias",
    },
    "adv_highSoreness_body": {
        "en": "Soreness was rated 4+ on {value} of the last 14 days. Consider lighter load or longer recovery between sessions.",
        "no": "Stølhet ble vurdert til 4+ {value} av de siste 14 dagene. Vurder lettere belastning eller lengre restitusjon mellom økter.",
        "nl": "Spierpijn was 4+ op {value} van de laatste 14 dagen. Overweeg minder belasting of langere hersteltijd.",
        "fr": "Courbatures notées 4+ sur {value} des 14 derniers jours. Envisage moins de charge ou plus de récupération.",
        "de": "Muskelkater bei 4+ an {value} der letzten 14 Tage. Erwäge weniger Last oder mehr Erholung zwischen Einheiten.",
        "it": "Dolori muscolari 4+ in {value} degli ultimi 14 giorni. Valuta carichi più leggeri o più recupero.",
        "sv": "Träningsvärk 4+ under {value} av de senaste 14 dagarna. Överväg lägre belastning eller längre återhämtning.",
        "da": "Ømhed på 4+ på {value} af de sidste 14 dage. Overvej lavere belastning eller mere restitution.",
        "fi": "Lihaskipu 4+ {value} päivänä viimeisestä 14:stä. Harkitse kevyempää kuormaa tai pidempää palautumista.",
        "es": "Dolor muscular 4+ en {value} de los últimos 14 días. Considera menos carga o más recuperación.",
        "pl": "Ból mięśni 4+ w {value} z ostatnich 14 dni. Rozważ mniejsze obciążenie lub dłuższą regenerację.",
        "pt": "Dor muscular 4+ em {value} dos últimos 14 dias. Considera menos carga ou mais recuperação.",
    },

    # ── Low mood ───────────────────────────────────────────────────
    "adv_lowMood_title": {
        "en": "Mood trending low", "no": "Humøret er lavt",
        "nl": "Stemming is laag", "fr": "Humeur en baisse",
        "de": "Stimmung tendiert niedrig", "it": "Umore basso",
        "sv": "Humöret trendar lågt", "da": "Humøret er lavt",
        "fi": "Mieliala on matala", "es": "El ánimo está bajo",
        "pl": "Nastrój jest słaby", "pt": "Humor em baixa",
    },
    "adv_lowMood_body": {
        "en": "Average mood {value}/5 over 14 days. Could indicate accumulated stress or burnout risk — worth checking in.",
        "no": "Snitthumør {value}/5 over 14 dager. Kan indikere akkumulert stress eller utbrenthetsrisiko — verdt å sjekke.",
        "nl": "Gemiddelde stemming {value}/5 over 14 dagen. Kan wijzen op opgebouwde stress of burn-outrisico.",
        "fr": "Humeur moyenne {value}/5 sur 14 jours. Possible stress accumulé ou risque de burnout — à vérifier.",
        "de": "Durchschnittsstimmung {value}/5 über 14 Tage. Kann auf Stress oder Burnout-Risiko hinweisen.",
        "it": "Umore medio {value}/5 in 14 giorni. Possibile stress accumulato o rischio burnout — da verificare.",
        "sv": "Humörsnitt {value}/5 på 14 dagar. Kan tyda på samlad stress eller utbrändhetsrisk.",
        "da": "Humørgennemsnit {value}/5 på 14 dage. Kan tyde på stress eller udbrændthedsrisiko.",
        "fi": "Mielialan keskiarvo {value}/5 14 päivän ajalta. Voi viitata kuormitukseen — kannattaa selvittää.",
        "es": "Ánimo medio {value}/5 en 14 días. Puede indicar estrés acumulado o riesgo de burnout.",
        "pl": "Średni nastrój {value}/5 przez 14 dni. Może wskazywać na stres lub ryzyko wypalenia.",
        "pt": "Humor médio {value}/5 em 14 dias. Pode indicar stress acumulado ou risco de burnout.",
    },

    # ── Low energy ─────────────────────────────────────────────────
    "adv_lowEnergy_title": {
        "en": "Energy is low", "no": "Energien er lav",
        "nl": "Energie is laag", "fr": "Énergie basse",
        "de": "Energie ist niedrig", "it": "Energia bassa",
        "sv": "Energin är låg", "da": "Energien er lav",
        "fi": "Energia on matala", "es": "La energía está baja",
        "pl": "Energia jest niska", "pt": "Energia em baixa",
    },
    "adv_lowEnergy_body": {
        "en": "Average energy {value}/5 over 14 days. Often a sign of under-recovery, poor sleep, or under-fueling.",
        "no": "Snittenergi {value}/5 over 14 dager. Ofte tegn på dårlig restitusjon, søvn eller for lite mat.",
        "nl": "Gemiddelde energie {value}/5 over 14 dagen. Vaak een teken van slechte recovery, slaap of voeding.",
        "fr": "Énergie moyenne {value}/5 sur 14 jours. Souvent signe de récupération, sommeil ou nutrition insuffisants.",
        "de": "Durchschnittliche Energie {value}/5 über 14 Tage. Oft ein Zeichen für mangelnde Erholung oder Ernährung.",
        "it": "Energia media {value}/5 in 14 giorni. Spesso indice di scarso recupero, sonno o alimentazione.",
        "sv": "Genomsnittlig energi {value}/5 på 14 dagar. Ofta tecken på dålig återhämtning, sömn eller näring.",
        "da": "Gennemsnitlig energi {value}/5 på 14 dage. Ofte tegn på dårlig restitution, søvn eller kost.",
        "fi": "Energian keskiarvo {value}/5 14 päivän ajalta. Usein merkki huonosta palautumisesta tai ravinnosta.",
        "es": "Energía media {value}/5 en 14 días. Suele indicar mala recuperación, sueño o alimentación.",
        "pl": "Średnia energia {value}/5 przez 14 dni. Często oznaka słabej regeneracji, snu lub odżywiania.",
        "pt": "Energia média {value}/5 em 14 dias. Sinal frequente de fraca recuperação, sono ou alimentação.",
    },

    # ── Low volume ─────────────────────────────────────────────────
    "adv_lowVolume_title": {
        "en": "Low training volume this month",
        "no": "Lavt treningsvolum denne måneden",
        "nl": "Laag trainingsvolume deze maand",
        "fr": "Faible volume d'entraînement ce mois-ci",
        "de": "Geringes Trainingsvolumen diesen Monat",
        "it": "Basso volume di allenamento questo mese",
        "sv": "Låg träningsvolym denna månad",
        "da": "Lav træningsmængde denne måned",
        "fi": "Vähän harjoittelua tässä kuussa",
        "es": "Volumen de entrenamiento bajo este mes",
        "pl": "Niska objętość treningu w tym miesiącu",
        "pt": "Pouco volume de treino este mês",
    },
    "adv_lowVolume_body": {
        "en": "Only {value} sessions logged in the last 30 days. Adherence may be slipping — worth understanding why.",
        "no": "Bare {value} økter de siste 30 dagene. Disiplinen kan være svekket — verdt å forstå hvorfor.",
        "nl": "Slechts {value} sessies in 30 dagen. Discipline kan afnemen — vraag waarom.",
        "fr": "Seulement {value} séances en 30 jours. L'adhérence peut faiblir — comprends pourquoi.",
        "de": "Nur {value} Einheiten in 30 Tagen. Compliance könnte sinken — Ursache klären.",
        "it": "Solo {value} sessioni in 30 giorni. L'aderenza potrebbe calare — capire il perché.",
        "sv": "Bara {value} pass på 30 dagar. Följsamheten kan svikta — förstå varför.",
        "da": "Kun {value} sessioner på 30 dage. Disciplinen kan falde — find ud af hvorfor.",
        "fi": "Vain {value} harjoitusta 30 päivässä. Sitoutuminen saattaa horjua — selvitä syy.",
        "es": "Solo {value} sesiones en 30 días. La adherencia puede estar bajando — averigua por qué.",
        "pl": "Tylko {value} sesji w 30 dni. Regularność może spadać — zbadaj dlaczego.",
        "pt": "Apenas {value} sessões em 30 dias. A adesão pode estar a cair — perceber porquê.",
    },

    # ── High volume ────────────────────────────────────────────────
    "adv_highVolume_title": {
        "en": "Heavy volume this month", "no": "Mye trening denne måneden",
        "nl": "Veel volume deze maand", "fr": "Volume élevé ce mois-ci",
        "de": "Hohes Volumen diesen Monat", "it": "Volume elevato questo mese",
        "sv": "Hög volym denna månad", "da": "Stor mængde denne måned",
        "fi": "Paljon harjoittelua tässä kuussa",
        "es": "Volumen alto este mes",
        "pl": "Duża objętość w tym miesiącu",
        "pt": "Volume elevado este mês",
    },
    "adv_highVolume_body": {
        "en": "About {value} hours of training in 30 days. Make sure recovery is keeping pace.",
        "no": "Omtrent {value} timer trening på 30 dager. Sørg for at restitusjonen henger med.",
        "nl": "Ongeveer {value} uur training in 30 dagen. Zorg dat herstel meekomt.",
        "fr": "Environ {value} heures d'entraînement en 30 jours. Vérifie que la récupération suit.",
        "de": "Etwa {value} Stunden Training in 30 Tagen. Achte darauf, dass die Erholung mithält.",
        "it": "Circa {value} ore di allenamento in 30 giorni. Assicurati che il recupero stia al passo.",
        "sv": "Cirka {value} timmars träning på 30 dagar. Se till att återhämtningen hänger med.",
        "da": "Omkring {value} timers træning på 30 dage. Sørg for at restitution følger med.",
        "fi": "Noin {value} tuntia harjoittelua 30 päivässä. Varmista palautumisen riittävyys.",
        "es": "Cerca de {value} horas en 30 días. Asegúrate de que la recuperación va al ritmo.",
        "pl": "Około {value} godzin treningu w 30 dni. Upewnij się, że regeneracja nadąża.",
        "pt": "Cerca de {value} horas de treino em 30 dias. Garante que a recuperação acompanha.",
    },

    # ── No rest ────────────────────────────────────────────────────
    "adv_noRest_title": {
        "en": "No rest days in two weeks",
        "no": "Ingen hviledager på to uker",
        "nl": "Geen rustdagen in twee weken",
        "fr": "Aucun jour de repos sur deux semaines",
        "de": "Keine Ruhetage in zwei Wochen",
        "it": "Nessun giorno di riposo in due settimane",
        "sv": "Inga vilodagar på två veckor",
        "da": "Ingen hviledage i to uger",
        "fi": "Ei lepopäiviä kahteen viikkoon",
        "es": "Sin días de descanso en dos semanas",
        "pl": "Brak dni odpoczynku przez dwa tygodnie",
        "pt": "Sem dias de descanso em duas semanas",
    },
    "adv_noRest_body": {
        "en": "Rest is part of training. Schedule at least one full rest day per week.",
        "no": "Hvile er en del av treningen. Planlegg minst én full hviledag i uka.",
        "nl": "Rust hoort bij training. Plan minstens één volle rustdag per week.",
        "fr": "Le repos fait partie de l'entraînement. Planifie au moins un jour de repos complet par semaine.",
        "de": "Erholung ist Teil des Trainings. Plane mindestens einen vollen Ruhetag pro Woche.",
        "it": "Il riposo è parte dell'allenamento. Pianifica almeno un giorno di riposo completo a settimana.",
        "sv": "Vila är en del av träningen. Schemalägg minst en hel vilodag per vecka.",
        "da": "Hvile er en del af træningen. Planlæg mindst én hel hviledag om ugen.",
        "fi": "Lepo on osa harjoittelua. Suunnittele vähintään yksi täysi lepopäivä viikossa.",
        "es": "El descanso es parte del entrenamiento. Planifica al menos un día de descanso completo a la semana.",
        "pl": "Odpoczynek to część treningu. Zaplanuj przynajmniej jeden pełny dzień odpoczynku w tygodniu.",
        "pt": "O descanso faz parte do treino. Planeia pelo menos um dia de descanso completo por semana.",
    },

    # ── High effort ────────────────────────────────────────────────
    "adv_highEffort_title": {
        "en": "Many high-effort sessions",
        "no": "Mange økter med høy innsats",
        "nl": "Veel sessies met hoge inspanning",
        "fr": "Beaucoup de séances très intenses",
        "de": "Viele intensive Einheiten",
        "it": "Molte sessioni ad alta intensità",
        "sv": "Många högintensiva pass",
        "da": "Mange træninger med høj indsats",
        "fi": "Useita rankkoja harjoituksia",
        "es": "Muchas sesiones de alta intensidad",
        "pl": "Wiele intensywnych sesji",
        "pt": "Muitas sessões de alta intensidade",
    },
    "adv_highEffort_body": {
        "en": "Effort was rated 4+ on {value} of the last 14 days. Easy days matter as much as hard ones.",
        "no": "Innsats vurdert til 4+ på {value} av de siste 14 dagene. Lette dager teller like mye som harde.",
        "nl": "Inspanning was 4+ op {value} van 14 dagen. Rustige dagen tellen net zo veel als zware.",
        "fr": "Effort noté 4+ sur {value} des 14 derniers jours. Les jours faciles comptent autant que les difficiles.",
        "de": "Anstrengung 4+ an {value} der letzten 14 Tage. Lockere Tage zählen genauso wie harte.",
        "it": "Sforzo 4+ in {value} degli ultimi 14 giorni. I giorni facili contano quanto quelli duri.",
        "sv": "Ansträngning 4+ under {value} av 14 dagar. Lätta dagar är lika viktiga som hårda.",
        "da": "Indsats 4+ på {value} af 14 dage. Lette dage er lige så vigtige som hårde.",
        "fi": "Rasitus 4+ {value} päivänä viimeisestä 14:stä. Helpot päivät ovat yhtä tärkeitä kuin kovat.",
        "es": "Esfuerzo 4+ en {value} de 14 días. Los días suaves importan tanto como los duros.",
        "pl": "Wysiłek 4+ w {value} z 14 dni. Lekkie dni są równie ważne jak ciężkie.",
        "pt": "Esforço 4+ em {value} de 14 dias. Os dias fáceis contam tanto como os difíceis.",
    },

    # ── High stress ────────────────────────────────────────────────
    "adv_highStress_title": {
        "en": "Stress is elevated", "no": "Stress er forhøyet",
        "nl": "Stress is verhoogd", "fr": "Stress élevé",
        "de": "Stress ist erhöht", "it": "Stress elevato",
        "sv": "Förhöjd stress", "da": "Stress er forhøjet",
        "fi": "Stressi on koholla", "es": "Estrés elevado",
        "pl": "Podwyższony stres", "pt": "Stress elevado",
    },
    "adv_highStress_body": {
        "en": "Average stress {value}/5. Training tolerance drops when life stress is high — adjust expectations.",
        "no": "Snittstress {value}/5. Treningstoleranse synker når livsstress er høyt — juster forventninger.",
        "nl": "Gemiddelde stress {value}/5. Trainingstolerantie daalt bij hoge stress — pas verwachtingen aan.",
        "fr": "Stress moyen {value}/5. La tolérance à l'entraînement chute quand le stress monte — adapte les attentes.",
        "de": "Durchschnittsstress {value}/5. Trainingstoleranz sinkt bei hohem Lebensstress — Erwartungen anpassen.",
        "it": "Stress medio {value}/5. La tolleranza all'allenamento cala con stress elevato — adatta le aspettative.",
        "sv": "Genomsnittlig stress {value}/5. Träningstolerans sjunker vid hög stress — justera förväntningar.",
        "da": "Gennemsnitsstress {value}/5. Træningstolerance falder ved høj stress — juster forventninger.",
        "fi": "Stressin keskiarvo {value}/5. Kuormituksen sieto laskee stressin kasvaessa — säädä odotuksia.",
        "es": "Estrés medio {value}/5. La tolerancia al entrenamiento cae con estrés alto — ajusta expectativas.",
        "pl": "Średni stres {value}/5. Tolerancja treningu spada przy wysokim stresie — dostosuj oczekiwania.",
        "pt": "Stress médio {value}/5. A tolerância ao treino cai com stress elevado — ajusta as expectativas.",
    },

    # ── Goals stalled ──────────────────────────────────────────────
    "adv_goalsStalled_title": {
        "en": "Goals are stalled", "no": "Målene står stille",
        "nl": "Doelen staan stil", "fr": "Objectifs au point mort",
        "de": "Ziele stagnieren", "it": "Obiettivi fermi",
        "sv": "Mål står stilla", "da": "Mål er gået i stå",
        "fi": "Tavoitteet ovat jumissa", "es": "Las metas están estancadas",
        "pl": "Cele utknęły", "pt": "Metas estagnadas",
    },
    "adv_goalsStalled_body": {
        "en": "Latest goal check-in shows things have stalled. Time to revisit and reset goals.",
        "no": "Siste målsjekk viser at det står stille. På tide å revurdere og sette nye mål.",
        "nl": "Laatste doelen-check toont stilstand. Tijd om doelen te herzien.",
        "fr": "Dernier bilan : objectifs à l'arrêt. C'est le moment de les revoir.",
        "de": "Letzte Ziel-Überprüfung zeigt Stillstand. Zeit, Ziele neu zu setzen.",
        "it": "L'ultima verifica mostra obiettivi fermi. È ora di rivederli.",
        "sv": "Senaste målavstämningen visar stillastående. Dags att se över mål.",
        "da": "Seneste måltjek viser stilstand. Tid til at genoverveje mål.",
        "fi": "Viimeisin tavoitearvio näyttää pysähdyksen. Aika tarkastella tavoitteita.",
        "es": "El último check-in muestra estancamiento. Hora de revisar metas.",
        "pl": "Ostatnie sprawdzenie celów pokazuje zastój. Czas je przemyśleć.",
        "pt": "A última revisão mostra estagnação. Hora de rever as metas.",
    },

    # ── Goals drifting ─────────────────────────────────────────────
    "adv_goalsDrifting_title": {
        "en": "Goals are drifting", "no": "Målene er på avveie",
        "nl": "Doelen drijven af", "fr": "Objectifs à la dérive",
        "de": "Ziele driften ab", "it": "Obiettivi alla deriva",
        "sv": "Mål driver iväg", "da": "Mål er på afveje",
        "fi": "Tavoitteet ajelehtivat", "es": "Las metas están a la deriva",
        "pl": "Cele dryfują", "pt": "Metas à deriva",
    },
    "adv_goalsDrifting_body": {
        "en": "Goal-setting clarity is fading. A short goal-setting conversation could help.",
        "no": "Tydeligheten i målsettingen forsvinner. En kort målsettingssamtale kan hjelpe.",
        "nl": "Doelhelderheid neemt af. Een kort gesprek over doelen kan helpen.",
        "fr": "La clarté des objectifs s'estompe. Une courte conversation sur les objectifs aiderait.",
        "de": "Zielklarheit lässt nach. Ein kurzes Zielgespräch könnte helfen.",
        "it": "La chiarezza degli obiettivi sta svanendo. Una breve conversazione sugli obiettivi aiuterebbe.",
        "sv": "Målklarhet börjar falna. Ett kort målsättningssamtal kan hjälpa.",
        "da": "Målklarhed forsvinder. En kort samtale om mål kan hjælpe.",
        "fi": "Tavoitteiden selkeys hiipuu. Lyhyt keskustelu tavoitteista voisi auttaa.",
        "es": "La claridad de las metas se desvanece. Una breve charla podría ayudar.",
        "pl": "Klarowność celów słabnie. Pomoże krótka rozmowa o celach.",
        "pt": "A clareza das metas está a desaparecer. Uma breve conversa sobre metas pode ajudar.",
    },

    # ── Goals strong ───────────────────────────────────────────────
    "adv_goalsStrong_title": {
        "en": "Strong goal progress", "no": "Sterk fremgang på mål",
        "nl": "Sterke doelvoortgang", "fr": "Forte progression vers les objectifs",
        "de": "Starker Zielfortschritt", "it": "Forti progressi sugli obiettivi",
        "sv": "Stark målprogression", "da": "Stor fremgang på mål",
        "fi": "Vahva eteneminen tavoitteissa", "es": "Buen avance hacia las metas",
        "pl": "Silne postępy w celach", "pt": "Bom progresso nas metas",
    },
    "adv_goalsStrong_body": {
        "en": "Latest goal check-in is strong. Acknowledge the progress and consider raising the bar.",
        "no": "Siste målsjekk er sterk. Anerkjenn fremgangen og vurder å sikte høyere.",
        "nl": "Laatste doelen-check is sterk. Vier de voortgang en overweeg om de lat hoger te leggen.",
        "fr": "Dernier bilan d'objectifs solide. Reconnaître les progrès et viser plus haut.",
        "de": "Letzte Ziel-Überprüfung ist stark. Würdige den Fortschritt und ziehe in Erwägung, die Latte höher zu legen.",
        "it": "L'ultima verifica è forte. Riconosci i progressi e considera di alzare l'asticella.",
        "sv": "Senaste målavstämningen är stark. Erkänn framsteget och överväg att höja ribban.",
        "da": "Seneste måltjek er stærkt. Anerkend fremgangen og overvej at hæve barren.",
        "fi": "Viimeisin tavoitearvio on vahva. Tunnusta edistys ja harkitse riman nostamista.",
        "es": "El último check-in es fuerte. Reconoce el avance y considera subir el listón.",
        "pl": "Ostatnie sprawdzenie celów jest silne. Doceń postępy i rozważ podniesienie poprzeczki.",
        "pt": "A última revisão é forte. Reconhece o progresso e considera subir a fasquia.",
    },

    # ── No goals ───────────────────────────────────────────────────
    "adv_noGoals_title": {
        "en": "No goal check-in yet", "no": "Ingen målsjekk ennå",
        "nl": "Nog geen doelen-check", "fr": "Pas encore de bilan d'objectifs",
        "de": "Noch keine Ziel-Überprüfung", "it": "Nessuna verifica obiettivi ancora",
        "sv": "Ingen målavstämning ännu", "da": "Endnu intet måltjek",
        "fi": "Ei vielä tavoitearviota", "es": "Aún sin check-in de metas",
        "pl": "Brak sprawdzenia celów", "pt": "Ainda sem revisão de metas",
    },
    "adv_noGoals_body": {
        "en": "A monthly goal check-in helps track motivation and direction. Worth introducing.",
        "no": "En månedlig målsjekk hjelper å følge motivasjon og retning. Verdt å innføre.",
        "nl": "Een maandelijkse doelen-check helpt motivatie en richting te volgen. De moeite waard.",
        "fr": "Un bilan mensuel d'objectifs aide à suivre motivation et direction. À introduire.",
        "de": "Eine monatliche Ziel-Überprüfung hilft, Motivation und Richtung zu verfolgen. Lohnt sich.",
        "it": "Una verifica mensile aiuta a seguire motivazione e direzione. Vale la pena introdurla.",
        "sv": "En månadsvis målavstämning hjälper att följa motivation och riktning.",
        "da": "Et månedligt måltjek hjælper med at følge motivation og retning.",
        "fi": "Kuukausittainen tavoitearvio auttaa seuraamaan motivaatiota ja suuntaa.",
        "es": "Un check-in mensual ayuda a seguir motivación y dirección.",
        "pl": "Comiesięczne sprawdzenie celów pomaga śledzić motywację i kierunek.",
        "pt": "Uma revisão mensal ajuda a acompanhar motivação e direção.",
    },

    # ── Score strong ───────────────────────────────────────────────
    "adv_scoreStrong_title": {
        "en": "Consistency is paying off", "no": "Jevnheten gir resultater",
        "nl": "Consistentie werpt vruchten af", "fr": "La régularité paie",
        "de": "Konstanz zahlt sich aus", "it": "La costanza sta dando frutti",
        "sv": "Kontinuiteten lönar sig", "da": "Kontinuiteten betaler sig",
        "fi": "Johdonmukaisuus tuottaa tulosta", "es": "La constancia da resultado",
        "pl": "Regularność się opłaca", "pt": "A consistência está a compensar",
    },
    "adv_scoreStrong_body": {
        "en": "Composite score averages {value}/100 over the last 14 days. Keep this rhythm.",
        "no": "Samlet score er i snitt {value}/100 siste 14 dager. Hold rytmen.",
        "nl": "Totaalscore gemiddeld {value}/100 over 14 dagen. Houd dit ritme aan.",
        "fr": "Score global moyen {value}/100 sur 14 jours. Garde ce rythme.",
        "de": "Durchschnittlicher Gesamtwert {value}/100 über 14 Tage. Halte diesen Rhythmus.",
        "it": "Punteggio complessivo medio {value}/100 in 14 giorni. Mantieni questo ritmo.",
        "sv": "Sammanlagd poäng i snitt {value}/100 på 14 dagar. Behåll rytmen.",
        "da": "Samlet score gennemsnitligt {value}/100 på 14 dage. Hold rytmen.",
        "fi": "Kokonaispisteet keskimäärin {value}/100 14 päivän ajalta. Pidä rytmi.",
        "es": "Puntuación global media {value}/100 en 14 días. Mantén el ritmo.",
        "pl": "Średni wynik łączny {value}/100 przez 14 dni. Trzymaj ten rytm.",
        "pt": "Pontuação global média {value}/100 em 14 dias. Mantém este ritmo.",
    },

    # ── Score low ──────────────────────────────────────────────────
    "adv_scoreLow_title": {
        "en": "Composite score is low", "no": "Samlet score er lav",
        "nl": "Totaalscore is laag", "fr": "Score global bas",
        "de": "Gesamtwert ist niedrig", "it": "Punteggio complessivo basso",
        "sv": "Sammanlagd poäng är låg", "da": "Samlet score er lav",
        "fi": "Kokonaispisteet ovat matalat", "es": "Puntuación global baja",
        "pl": "Wynik łączny jest niski", "pt": "Pontuação global baixa",
    },
    "adv_scoreLow_body": {
        "en": "Composite averages {value}/100 over 14 days. Multiple wellbeing markers are below baseline.",
        "no": "Samlet score er {value}/100 i snitt over 14 dager. Flere velværemarkører er under normalen.",
        "nl": "Totaalscore gemiddeld {value}/100 over 14 dagen. Meerdere welzijnsindicatoren onder normaal.",
        "fr": "Score global moyen {value}/100 sur 14 jours. Plusieurs indicateurs de bien-être sont sous la normale.",
        "de": "Durchschnitt {value}/100 über 14 Tage. Mehrere Wohlbefindenswerte unter dem Normalbereich.",
        "it": "Punteggio medio {value}/100 in 14 giorni. Più indicatori di benessere sotto il livello base.",
        "sv": "Snitt {value}/100 på 14 dagar. Flera välmåendemått under baslinjen.",
        "da": "Gennemsnit {value}/100 på 14 dage. Flere velværemarkører under basislinjen.",
        "fi": "Keskiarvo {value}/100 14 päivän ajalta. Useat hyvinvointimittarit lähtötasoa alempana.",
        "es": "Media {value}/100 en 14 días. Varios indicadores de bienestar bajo lo habitual.",
        "pl": "Średnia {value}/100 przez 14 dni. Kilka wskaźników samopoczucia poniżej normy.",
        "pt": "Média {value}/100 em 14 dias. Vários indicadores de bem-estar abaixo do normal.",
    },
}


# ──────────────────────────────────────────────────────────────────────────
# File handling
# ──────────────────────────────────────────────────────────────────────────

def parse_strings_object(text):
    """Find and parse the `const strings = { ... };` object."""
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
    return start, end, json.loads(text[start:end])


def write_file(path, original_text, new_strings, span):
    """Replace the strings object span with the new JSON, keep file structure."""
    start, end = span
    body = json.dumps(new_strings, ensure_ascii=False, indent=2)
    new_text = original_text[:start] + body + original_text[end:]
    path.write_text(new_text, encoding="utf-8")


def main():
    if len(sys.argv) != 2:
        print("Usage: python3 add_dashboard_advice_translations.py path/to/lib/translations.js")
        sys.exit(1)

    path = Path(sys.argv[1])
    text = path.read_text(encoding="utf-8")
    start, end, strings = parse_strings_object(text)

    added = 0
    skipped = 0
    for key, lang_map in TRANSLATIONS.items():
        for lang, value in lang_map.items():
            block = strings.get(lang)
            if block is None:
                continue
            if key in block:
                skipped += 1
            else:
                block[key] = value
                added += 1

    write_file(path, text, strings, (start, end))
    print(f"Added   {added} translation entries.")
    print(f"Skipped {skipped} (already existed).")
    print(f"Wrote   {path}")


if __name__ == "__main__":
    main()

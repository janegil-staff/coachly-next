// scripts/replaceTermsTranslations.cjs
//
// Replaces the `termsSections` array in src/lib/translations.js
// with proper terms text for all 12 languages.
// Creates a timestamped backup before writing.
//
// Run: node scripts/replaceTermsTranslations.cjs

const fs = require("fs");
const path = require("path");

const TARGET_FILE = path.join(__dirname, "../src/lib/translations.js");

const TERMS = {
  en: [
    { title: "1. Acceptance of Terms", body: "By creating an account or using Coachly, you confirm that you are at least 16 years old (or have parental consent) and that you accept these Terms in full. Coachly is operated by Qup DA. If you do not agree to these Terms, do not use the app. We may update these Terms from time to time, and continued use of the app after changes means you accept the updated Terms." },
    { title: "2. Your Account", body: "You are responsible for keeping your login credentials and PIN code confidential. All activity that occurs under your account is your responsibility. You agree to provide accurate information when registering and to keep it up to date. You may delete your account at any time from within the app." },
    { title: "3. Acceptable Use", body: "You agree not to misuse the app, including by attempting to access it through unauthorized means, interfering with its operation, reverse-engineering it, or using it for any unlawful purpose. We reserve the right to suspend or terminate accounts that violate these rules." },
    { title: "4. Health & Fitness Disclaimer", body: "Coachly is a tracking and lifestyle support tool. It is not a medical device and does not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare or fitness professional before starting a new exercise program or making decisions about your health, training, nutrition, or treatment. Do not rely on Coachly as a substitute for professional medical care. We are not liable for injury, illness, or other harm resulting from use of the app." },
    { title: "5. Your Data and Privacy", body: "We process the data you enter into the app in order to provide its features, including training logs, ratings, and any health-related information you choose to record. Your data is stored securely and handled in line with applicable privacy laws including the GDPR. For details on what we collect, how we use it, and your rights, please see our Privacy Policy." },
    { title: "6. Coaching Relationships", body: "If you connect with a coach through Coachly, selected data from your account is shared with them so they can support your training. You control what is shared and you can revoke a coach's access at any time from within the app." },
    { title: "7. Intellectual Property", body: "All content in Coachly — including the app itself, its design, text, graphics, and code — is owned by Qup DA or its licensors and protected by copyright and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without prior written permission." },
    { title: "8. Limitation of Liability", body: "Coachly is provided as is and as available, without warranties of any kind. To the fullest extent permitted by law, Qup DA shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the app, including health outcomes, data loss, or service interruption. You use the app at your own risk." },
    { title: "9. Changes to These Terms", body: "We may revise these Terms at any time. When we do, we will update the date at the top of this page. Significant changes may also be communicated through the app. Your continued use after changes means you accept the revised Terms." },
    { title: "10. Contact", body: "If you have questions about these Terms or about Coachly, please contact us at jan.egi.staff@qupda.com." }
  ],

  no: [
    { title: "1. Aksept av vilkårene", body: "Ved å opprette en konto eller bruke Coachly bekrefter du at du er minst 16 år (eller har samtykke fra foreldre) og at du godtar disse vilkårene i sin helhet. Coachly drives av Qup DA. Hvis du ikke godtar disse vilkårene, må du ikke bruke appen. Vi kan oppdatere vilkårene fra tid til annen, og fortsatt bruk etter endringer betyr at du godtar de oppdaterte vilkårene." },
    { title: "2. Din konto", body: "Du er ansvarlig for å holde innloggingsinformasjonen og PIN-koden din konfidensiell. All aktivitet som skjer på kontoen din er ditt ansvar. Du må oppgi riktige opplysninger ved registrering og holde dem oppdatert. Du kan slette kontoen din når som helst fra inne i appen." },
    { title: "3. Akseptabel bruk", body: "Du forplikter deg til ikke å misbruke appen, inkludert å forsøke å få tilgang til den på uautoriserte måter, forstyrre driften, omvendt utvikle den, eller bruke den til ulovlige formål. Vi forbeholder oss retten til å suspendere eller avslutte kontoer som bryter disse reglene." },
    { title: "4. Helse- og treningsfraskrivelse", body: "Coachly er et verktøy for sporing og livsstilsstøtte. Det er ikke et medisinsk utstyr og gir ikke medisinske råd, diagnose eller behandling. Konsulter alltid kvalifisert helsepersonell eller treningsfagperson før du starter et nytt treningsprogram eller tar beslutninger om helse, trening, kosthold eller behandling. Coachly er ikke en erstatning for profesjonell medisinsk hjelp. Vi er ikke ansvarlige for skade, sykdom eller annen skade som følger av bruk av appen." },
    { title: "5. Dine data og personvern", body: "Vi behandler dataene du legger inn i appen for å levere funksjonene dens, inkludert treningslogger, vurderinger og eventuell helseinformasjon du velger å registrere. Dataene dine lagres trygt og behandles i tråd med gjeldende personvernlovgivning, inkludert GDPR. Se personvernerklæringen for detaljer om hva vi samler inn, hvordan vi bruker det, og dine rettigheter." },
    { title: "6. Treningsrelasjoner", body: "Hvis du kobler deg til en trener gjennom Coachly, deles utvalgte data fra kontoen din med vedkommende slik at treneren kan støtte treningen din. Du bestemmer hva som deles, og du kan tilbakekalle en treners tilgang når som helst fra inne i appen." },
    { title: "7. Immaterielle rettigheter", body: "Alt innhold i Coachly — inkludert selve appen, design, tekst, grafikk og kode — eies av Qup DA eller deres lisensgivere og er beskyttet av opphavsrett og andre immaterialrettigheter. Du kan ikke kopiere, endre, distribuere eller lage avledede verk uten skriftlig forhåndssamtykke." },
    { title: "8. Ansvarsbegrensning", body: "Coachly leveres som det er og som tilgjengelig, uten garantier av noe slag. I den grad loven tillater, er Qup DA ikke ansvarlig for indirekte, tilfeldige, spesielle eller følgeskader som oppstår fra din bruk av appen, inkludert helseutfall, tap av data eller avbrudd i tjenesten. Du bruker appen på eget ansvar." },
    { title: "9. Endringer i disse vilkårene", body: "Vi kan oppdatere disse vilkårene når som helst. Når vi gjør det, oppdaterer vi datoen øverst på denne siden. Betydelige endringer kan også varsles via appen. Fortsatt bruk etter endringer betyr at du godtar de reviderte vilkårene." },
    { title: "10. Kontakt", body: "Hvis du har spørsmål om disse vilkårene eller om Coachly, kan du kontakte oss på jan.egi.staff@qupda.com." }
  ],

  sv: [
    { title: "1. Godkännande av villkoren", body: "Genom att skapa ett konto eller använda Coachly bekräftar du att du är minst 16 år (eller har vårdnadshavares samtycke) och att du accepterar dessa villkor i sin helhet. Coachly drivs av Qup DA. Om du inte godkänner dessa villkor ska du inte använda appen. Vi kan uppdatera villkoren då och då, och fortsatt användning efter ändringar innebär att du godkänner de uppdaterade villkoren." },
    { title: "2. Ditt konto", body: "Du ansvarar för att hålla dina inloggningsuppgifter och PIN-kod konfidentiella. All aktivitet på ditt konto är ditt ansvar. Du måste lämna korrekt information vid registrering och hålla den uppdaterad. Du kan när som helst radera ditt konto från appen." },
    { title: "3. Acceptabel användning", body: "Du förbinder dig att inte missbruka appen, inklusive att försöka få åtkomst till den på obehöriga sätt, störa driften, baklängesutveckla den eller använda den för olagliga ändamål. Vi förbehåller oss rätten att stänga av eller avsluta konton som bryter mot dessa regler." },
    { title: "4. Hälso- och träningsfriskrivning", body: "Coachly är ett verktyg för spårning och livsstilsstöd. Det är inte en medicinteknisk produkt och ger inte medicinsk rådgivning, diagnos eller behandling. Rådfråga alltid kvalificerad sjukvårdspersonal eller träningsfackman innan du påbörjar ett nytt träningsprogram eller tar beslut om din hälsa, träning, kost eller behandling. Coachly är inte en ersättning för professionell vård. Vi ansvarar inte för skada, sjukdom eller annan skada till följd av användning av appen." },
    { title: "5. Dina data och integritet", body: "Vi behandlar de uppgifter du anger i appen för att tillhandahålla dess funktioner, inklusive träningsloggar, betyg och annan hälsorelaterad information du väljer att registrera. Dina data lagras säkert och hanteras i enlighet med tillämplig integritetslagstiftning, inklusive GDPR. För detaljer om vad vi samlar in, hur vi använder det och dina rättigheter, se vår integritetspolicy." },
    { title: "6. Coachrelationer", body: "Om du ansluter till en coach genom Coachly delas utvalda data från ditt konto med dem så att de kan stödja din träning. Du bestämmer vad som delas och du kan när som helst återkalla en coachs åtkomst från appen." },
    { title: "7. Immateriella rättigheter", body: "Allt innehåll i Coachly — inklusive själva appen, dess design, text, grafik och kod — ägs av Qup DA eller dess licensgivare och skyddas av upphovsrätt och andra immaterialrättsliga lagar. Du får inte kopiera, ändra, distribuera eller skapa härledda verk utan föregående skriftligt tillstånd." },
    { title: "8. Ansvarsbegränsning", body: "Coachly tillhandahålls i befintligt skick och som tillgängligt, utan några som helst garantier. I den utsträckning lagen tillåter ansvarar inte Qup DA för indirekta, tillfälliga, särskilda eller följdskador som uppstår vid användningen av appen, inklusive hälsoutfall, dataförlust eller tjänsteavbrott. Du använder appen på egen risk." },
    { title: "9. Ändringar i dessa villkor", body: "Vi kan när som helst revidera dessa villkor. När vi gör det uppdaterar vi datumet längst upp på denna sida. Betydande ändringar kan också meddelas via appen. Fortsatt användning efter ändringar betyder att du accepterar de reviderade villkoren." },
    { title: "10. Kontakt", body: "Om du har frågor om dessa villkor eller om Coachly, kontakta oss på jan.egi.staff@qupda.com." }
  ],

  da: [
    { title: "1. Accept af vilkårene", body: "Ved at oprette en konto eller bruge Coachly bekræfter du, at du er mindst 16 år (eller har forældres samtykke), og at du accepterer disse vilkår i deres helhed. Coachly drives af Qup DA. Hvis du ikke accepterer disse vilkår, må du ikke bruge appen. Vi kan opdatere vilkårene fra tid til anden, og fortsat brug efter ændringer betyder, at du accepterer de opdaterede vilkår." },
    { title: "2. Din konto", body: "Du er ansvarlig for at holde dine loginoplysninger og PIN-kode fortrolige. Al aktivitet, der finder sted på din konto, er dit ansvar. Du skal angive korrekte oplysninger ved registrering og holde dem opdaterede. Du kan slette din konto når som helst fra inde i appen." },
    { title: "3. Acceptabel brug", body: "Du forpligter dig til ikke at misbruge appen, herunder forsøge at få adgang via uautoriserede midler, forstyrre dens drift, reverse-engineering eller bruge den til ulovlige formål. Vi forbeholder os retten til at suspendere eller lukke konti, der overtræder disse regler." },
    { title: "4. Sundheds- og fitness-fraskrivelse", body: "Coachly er et tracking- og livsstilsværktøj. Det er ikke medicinsk udstyr og giver ikke medicinsk rådgivning, diagnose eller behandling. Konsulter altid kvalificeret sundhedspersonale eller fitnessfagperson, inden du starter et nyt træningsprogram eller træffer beslutninger om dit helbred, træning, kost eller behandling. Coachly er ikke en erstatning for professionel lægehjælp. Vi er ikke ansvarlige for skade, sygdom eller anden skade som følge af brug af appen." },
    { title: "5. Dine data og privatliv", body: "Vi behandler de data, du indtaster i appen, for at levere dens funktioner, herunder træningslogs, vurderinger og enhver sundhedsrelateret information, du vælger at registrere. Dine data opbevares sikkert og håndteres i overensstemmelse med gældende databeskyttelseslovgivning, herunder GDPR. Se vores privatlivspolitik for detaljer om, hvad vi indsamler, hvordan vi bruger det, og dine rettigheder." },
    { title: "6. Coachrelationer", body: "Hvis du forbinder dig med en coach via Coachly, deles udvalgte data fra din konto med dem, så de kan støtte din træning. Du bestemmer, hvad der deles, og du kan tilbagekalde en coachs adgang når som helst inde i appen." },
    { title: "7. Immaterielle rettigheder", body: "Alt indhold i Coachly — herunder selve appen, dens design, tekst, grafik og kode — ejes af Qup DA eller dets licensgivere og er beskyttet af ophavsret og andre immaterielle rettigheder. Du må ikke kopiere, ændre, distribuere eller skabe afledte værker uden forudgående skriftlig tilladelse." },
    { title: "8. Ansvarsbegrænsning", body: "Coachly leveres som den er og som tilgængelig, uden garantier af nogen art. I det omfang loven tillader det, er Qup DA ikke ansvarlig for indirekte, tilfældige, særlige eller følgeskader, der opstår ved din brug af appen, herunder sundhedsmæssige resultater, datatab eller tjenesteafbrydelser. Du bruger appen på eget ansvar." },
    { title: "9. Ændringer af disse vilkår", body: "Vi kan til enhver tid revidere disse vilkår. Når vi gør det, opdaterer vi datoen øverst på denne side. Væsentlige ændringer kan også blive kommunikeret via appen. Fortsat brug efter ændringer betyder, at du accepterer de reviderede vilkår." },
    { title: "10. Kontakt", body: "Hvis du har spørgsmål om disse vilkår eller om Coachly, bedes du kontakte os på jan.egi.staff@qupda.com." }
  ],

  fi: [
    { title: "1. Ehtojen hyväksyminen", body: "Luomalla tilin tai käyttämällä Coachlyä vahvistat olevasi vähintään 16-vuotias (tai sinulla on huoltajan suostumus) ja hyväksyväsi nämä ehdot kokonaisuudessaan. Coachlyä ylläpitää Qup DA. Jos et hyväksy näitä ehtoja, älä käytä sovellusta. Voimme päivittää ehtoja ajoittain, ja sovelluksen jatkuva käyttö muutosten jälkeen tarkoittaa päivitettyjen ehtojen hyväksymistä." },
    { title: "2. Tilisi", body: "Olet vastuussa kirjautumistietojesi ja PIN-koodisi luottamuksellisuudesta. Kaikki tililläsi tapahtuva toiminta on vastuullasi. Sinun on annettava rekisteröityessäsi paikkansa pitäviä tietoja ja pidettävä ne ajan tasalla. Voit poistaa tilisi milloin tahansa sovelluksesta." },
    { title: "3. Sallittu käyttö", body: "Sitoudut olemaan käyttämättä sovellusta väärin, mukaan lukien yritykset päästä siihen luvattomilla tavoilla, häiritä sen toimintaa, takaisinmallintaa sitä tai käyttää sitä laittomiin tarkoituksiin. Pidätämme oikeuden keskeyttää tai sulkea tilejä, jotka rikkovat näitä sääntöjä." },
    { title: "4. Terveys- ja kuntoiluvastuuvapauslauseke", body: "Coachly on seuranta- ja elämäntapatyökalu. Se ei ole lääkinnällinen laite eikä se anna lääketieteellistä neuvontaa, diagnoosia tai hoitoa. Kysy aina pätevältä terveydenhuollon ammattilaiselta tai kuntoiluammattilaiselta neuvoa ennen uuden harjoitusohjelman aloittamista tai terveyttäsi, harjoitteluasi, ravintoasi tai hoitoasi koskevien päätösten tekemistä. Coachly ei korvaa ammattimaista lääkärinhoitoa. Emme ole vastuussa sovelluksen käytöstä aiheutuvasta vammasta, sairaudesta tai muusta haitasta." },
    { title: "5. Tietosi ja yksityisyys", body: "Käsittelemme sovellukseen syöttämiäsi tietoja sen ominaisuuksien tarjoamiseksi, mukaan lukien harjoituslokit, arviot ja terveystiedot, jotka valitset tallennettavaksi. Tietosi tallennetaan turvallisesti ja niitä käsitellään sovellettavan tietosuojalainsäädännön, kuten GDPR:n, mukaisesti. Lisätietoja siitä, mitä keräämme, miten käytämme sitä ja mitkä ovat oikeutesi, on tietosuojakäytännössämme." },
    { title: "6. Valmennussuhteet", body: "Jos yhdistät valmentajaan Coachlyn kautta, valitut tiedot tililtäsi jaetaan hänen kanssaan, jotta hän voi tukea harjoitteluasi. Päätät mitä jaetaan ja voit peruuttaa valmentajan käyttöoikeuden milloin tahansa sovelluksesta." },
    { title: "7. Immateriaalioikeudet", body: "Kaikki Coachlyn sisältö — mukaan lukien itse sovellus, sen ulkoasu, tekstit, grafiikka ja koodi — on Qup DA:n tai sen lisenssinantajien omaisuutta, ja se on tekijänoikeuslain ja muiden immateriaalioikeuslakien suojaamaa. Et saa kopioida, muokata, jakaa tai luoda johdannaisteoksia ilman ennakkoon annettua kirjallista lupaa." },
    { title: "8. Vastuunrajoitus", body: "Coachly toimitetaan sellaisena kuin se on ja sellaisena kuin se on saatavilla, ilman minkäänlaisia takuita. Lain sallimassa enimmäismäärässä Qup DA ei ole vastuussa epäsuorista, satunnaisista, erityisistä tai välillisistä vahingoista, jotka aiheutuvat sovelluksen käytöstä, mukaan lukien terveysvaikutukset, tietojen menetys tai palvelukatkokset. Käytät sovellusta omalla vastuullasi." },
    { title: "9. Muutokset näihin ehtoihin", body: "Voimme tarkistaa näitä ehtoja milloin tahansa. Kun teemme niin, päivitämme tämän sivun yläosassa olevan päivämäärän. Merkittävistä muutoksista voidaan ilmoittaa myös sovelluksen kautta. Jatkamalla sovelluksen käyttöä muutosten jälkeen hyväksyt muutetut ehdot." },
    { title: "10. Yhteystiedot", body: "Jos sinulla on kysyttävää näistä ehdoista tai Coachlystä, ota yhteyttä osoitteeseen jan.egi.staff@qupda.com." }
  ],

  de: [
    { title: "1. Annahme der Bedingungen", body: "Indem Sie ein Konto erstellen oder Coachly nutzen, bestätigen Sie, dass Sie mindestens 16 Jahre alt sind (oder die Einwilligung Ihrer Eltern besitzen) und diese Bedingungen vollständig akzeptieren. Coachly wird von Qup DA betrieben. Wenn Sie diesen Bedingungen nicht zustimmen, nutzen Sie die App nicht. Wir können diese Bedingungen gelegentlich aktualisieren; die fortgesetzte Nutzung nach Änderungen gilt als Annahme der aktualisierten Bedingungen." },
    { title: "2. Ihr Konto", body: "Sie sind verantwortlich für die Vertraulichkeit Ihrer Anmeldedaten und Ihrer PIN. Sämtliche Aktivitäten unter Ihrem Konto liegen in Ihrer Verantwortung. Sie verpflichten sich, bei der Registrierung korrekte Angaben zu machen und diese aktuell zu halten. Sie können Ihr Konto jederzeit aus der App heraus löschen." },
    { title: "3. Akzeptable Nutzung", body: "Sie verpflichten sich, die App nicht zu missbrauchen, insbesondere keine unbefugten Zugriffe vorzunehmen, den Betrieb zu stören, sie zurückzuentwickeln oder die App für rechtswidrige Zwecke zu nutzen. Wir behalten uns das Recht vor, Konten zu sperren oder zu löschen, die gegen diese Regeln verstoßen." },
    { title: "4. Gesundheits- und Fitness-Haftungsausschluss", body: "Coachly ist ein Tracking- und Lifestyle-Tool. Es ist kein Medizinprodukt und bietet keine medizinische Beratung, Diagnose oder Behandlung. Konsultieren Sie stets qualifiziertes medizinisches Fachpersonal oder eine Fitnessfachperson, bevor Sie ein neues Trainingsprogramm beginnen oder Entscheidungen über Ihre Gesundheit, Ihr Training, Ihre Ernährung oder Ihre Behandlung treffen. Coachly ist kein Ersatz für professionelle medizinische Versorgung. Wir haften nicht für Verletzungen, Krankheiten oder andere Schäden, die durch die Nutzung der App entstehen." },
    { title: "5. Ihre Daten und Datenschutz", body: "Wir verarbeiten die in die App eingegebenen Daten, um deren Funktionen bereitzustellen, einschließlich Trainingsprotokollen, Bewertungen und gesundheitsbezogenen Informationen, die Sie aufzeichnen. Ihre Daten werden sicher gespeichert und gemäß den geltenden Datenschutzgesetzen, einschließlich der DSGVO, verarbeitet. Einzelheiten dazu, was wir erheben, wie wir es verwenden und welche Rechte Sie haben, finden Sie in unserer Datenschutzerklärung." },
    { title: "6. Coaching-Beziehungen", body: "Wenn Sie sich über Coachly mit einem Coach verbinden, werden ausgewählte Daten Ihres Kontos mit ihm geteilt, damit er Ihr Training unterstützen kann. Sie bestimmen, was geteilt wird, und können den Zugriff eines Coaches jederzeit aus der App heraus widerrufen." },
    { title: "7. Geistiges Eigentum", body: "Sämtliche Inhalte in Coachly — einschließlich der App selbst, ihres Designs, der Texte, Grafiken und des Codes — gehören Qup DA oder ihren Lizenzgebern und sind durch Urheberrecht und andere Schutzrechte geschützt. Ohne vorherige schriftliche Genehmigung dürfen Sie diese Inhalte nicht kopieren, verändern, verbreiten oder daraus abgeleitete Werke erstellen." },
    { title: "8. Haftungsbeschränkung", body: "Coachly wird wie besehen und nach Verfügbarkeit bereitgestellt, ohne jegliche Gewährleistung. Soweit gesetzlich zulässig, haftet Qup DA nicht für indirekte, zufällige, besondere oder Folgeschäden, die aus Ihrer Nutzung der App entstehen, einschließlich gesundheitlicher Folgen, Datenverluste oder Dienstunterbrechungen. Die Nutzung erfolgt auf eigenes Risiko." },
    { title: "9. Änderungen dieser Bedingungen", body: "Wir können diese Bedingungen jederzeit überarbeiten. In diesem Fall aktualisieren wir das Datum oben auf dieser Seite. Wesentliche Änderungen können auch über die App mitgeteilt werden. Die weitere Nutzung nach Änderungen bedeutet, dass Sie die geänderten Bedingungen akzeptieren." },
    { title: "10. Kontakt", body: "Wenn Sie Fragen zu diesen Bedingungen oder zu Coachly haben, kontaktieren Sie uns bitte unter jan.egi.staff@qupda.com." }
  ],

  nl: [
    { title: "1. Aanvaarding van de voorwaarden", body: "Door een account aan te maken of Coachly te gebruiken, bevestigt u dat u minstens 16 jaar oud bent (of toestemming hebt van uw ouders) en dat u deze voorwaarden volledig accepteert. Coachly wordt beheerd door Qup DA. Als u niet akkoord gaat met deze voorwaarden, gebruik de app dan niet. We kunnen deze voorwaarden van tijd tot tijd bijwerken; voortgezet gebruik na wijzigingen geldt als aanvaarding van de bijgewerkte voorwaarden." },
    { title: "2. Uw account", body: "U bent verantwoordelijk voor de vertrouwelijkheid van uw inloggegevens en pincode. Alle activiteit op uw account valt onder uw verantwoordelijkheid. U dient bij registratie nauwkeurige informatie te verstrekken en deze actueel te houden. U kunt uw account op elk moment vanuit de app verwijderen." },
    { title: "3. Aanvaardbaar gebruik", body: "U stemt ermee in de app niet te misbruiken, waaronder ongeautoriseerde toegang, verstoring van de werking, reverse-engineering of gebruik voor onrechtmatige doeleinden. We behouden ons het recht voor om accounts die deze regels schenden te schorsen of te beëindigen." },
    { title: "4. Disclaimer gezondheid en fitness", body: "Coachly is een tracking- en lifestyle-tool. Het is geen medisch apparaat en biedt geen medisch advies, diagnose of behandeling. Raadpleeg altijd gekwalificeerde gezondheidsprofessionals of fitnessdeskundigen voordat u een nieuw trainingsprogramma begint of beslissingen neemt over uw gezondheid, training, voeding of behandeling. Coachly is geen vervanging voor professionele medische zorg. Wij zijn niet aansprakelijk voor letsel, ziekte of andere schade als gevolg van gebruik van de app." },
    { title: "5. Uw gegevens en privacy", body: "We verwerken de gegevens die u in de app invoert om de functies te leveren, inclusief trainingslogboeken, beoordelingen en alle gezondheidsgerelateerde informatie die u kiest om vast te leggen. Uw gegevens worden veilig opgeslagen en verwerkt conform de toepasselijke privacywetgeving, waaronder de AVG. Zie onze privacyverklaring voor details over wat we verzamelen, hoe we het gebruiken en uw rechten." },
    { title: "6. Coachrelaties", body: "Als u via Coachly verbinding maakt met een coach, worden geselecteerde gegevens van uw account met hen gedeeld zodat zij uw training kunnen ondersteunen. U bepaalt wat wordt gedeeld en u kunt de toegang van een coach op elk moment vanuit de app intrekken." },
    { title: "7. Intellectueel eigendom", body: "Alle inhoud in Coachly — inclusief de app zelf, het ontwerp, teksten, afbeeldingen en code — is eigendom van Qup DA of haar licentiegevers en wordt beschermd door auteursrecht en andere intellectuele eigendomsrechten. Zonder voorafgaande schriftelijke toestemming mag u deze inhoud niet kopiëren, wijzigen, verspreiden of afgeleide werken creëren." },
    { title: "8. Aansprakelijkheidsbeperking", body: "Coachly wordt geleverd in de huidige staat en zoals beschikbaar, zonder enige garantie. Voor zover wettelijk toegestaan is Qup DA niet aansprakelijk voor indirecte, incidentele, bijzondere of gevolgschade die voortvloeit uit het gebruik van de app, inclusief gezondheidsuitkomsten, dataverlies of serviceonderbrekingen. U gebruikt de app op eigen risico." },
    { title: "9. Wijzigingen in deze voorwaarden", body: "We kunnen deze voorwaarden op elk moment herzien. Wanneer we dat doen, wordt de datum bovenaan deze pagina aangepast. Aanzienlijke wijzigingen kunnen ook via de app worden gecommuniceerd. Voortgezet gebruik na wijzigingen betekent dat u akkoord gaat met de herziene voorwaarden." },
    { title: "10. Contact", body: "Als u vragen hebt over deze voorwaarden of over Coachly, neem dan contact met ons op via jan.egi.staff@qupda.com." }
  ],

  fr: [
    { title: "1. Acceptation des conditions", body: "En créant un compte ou en utilisant Coachly, vous confirmez avoir au moins 16 ans (ou disposer du consentement parental) et accepter ces conditions dans leur intégralité. Coachly est exploité par Qup DA. Si vous n'acceptez pas ces conditions, n'utilisez pas l'application. Nous pouvons mettre à jour ces conditions de temps à autre ; toute utilisation continue après modification vaut acceptation des conditions mises à jour." },
    { title: "2. Votre compte", body: "Vous êtes responsable de la confidentialité de vos identifiants et de votre code PIN. Toutes les activités effectuées depuis votre compte relèvent de votre responsabilité. Vous vous engagez à fournir des informations exactes lors de l'inscription et à les maintenir à jour. Vous pouvez supprimer votre compte à tout moment depuis l'application." },
    { title: "3. Utilisation acceptable", body: "Vous vous engagez à ne pas utiliser l'application de manière abusive, notamment en tentant d'y accéder par des moyens non autorisés, en perturbant son fonctionnement, en l'analysant par rétro-ingénierie ou en l'utilisant à des fins illégales. Nous nous réservons le droit de suspendre ou de résilier les comptes qui enfreignent ces règles." },
    { title: "4. Avertissement santé et fitness", body: "Coachly est un outil de suivi et d'aide au mode de vie. Il ne s'agit pas d'un dispositif médical et il ne fournit ni conseils médicaux, ni diagnostic, ni traitement. Consultez toujours un professionnel de santé qualifié ou un professionnel du fitness avant de commencer un nouveau programme d'exercice ou de prendre des décisions concernant votre santé, votre entraînement, votre alimentation ou votre traitement. Coachly ne remplace pas les soins médicaux professionnels. Nous ne sommes pas responsables des blessures, maladies ou autres dommages résultant de l'utilisation de l'application." },
    { title: "5. Vos données et confidentialité", body: "Nous traitons les données que vous saisissez dans l'application pour fournir ses fonctionnalités, y compris les journaux d'entraînement, les évaluations et toute information de santé que vous choisissez d'enregistrer. Vos données sont stockées en toute sécurité et traitées conformément aux lois applicables sur la protection des données, y compris le RGPD. Consultez notre politique de confidentialité pour en savoir plus." },
    { title: "6. Relations de coaching", body: "Si vous vous connectez avec un coach via Coachly, certaines données de votre compte sont partagées avec lui afin qu'il puisse soutenir votre entraînement. Vous décidez de ce qui est partagé et vous pouvez révoquer l'accès d'un coach à tout moment depuis l'application." },
    { title: "7. Propriété intellectuelle", body: "Tout le contenu de Coachly — y compris l'application elle-même, son design, ses textes, ses graphismes et son code — est la propriété de Qup DA ou de ses concédants de licence et est protégé par le droit d'auteur et d'autres droits de propriété intellectuelle. Vous ne pouvez pas copier, modifier, distribuer ou créer des œuvres dérivées sans autorisation écrite préalable." },
    { title: "8. Limitation de responsabilité", body: "Coachly est fourni en l'état et selon disponibilité, sans aucune garantie. Dans toute la mesure permise par la loi, Qup DA ne saurait être tenu responsable des dommages indirects, accessoires, spéciaux ou consécutifs résultant de votre utilisation de l'application, y compris les conséquences sur la santé, la perte de données ou l'interruption de service. Vous utilisez l'application à vos propres risques." },
    { title: "9. Modifications des présentes conditions", body: "Nous pouvons réviser ces conditions à tout moment. Le cas échéant, nous mettrons à jour la date en haut de cette page. Les modifications importantes peuvent également être communiquées via l'application. La poursuite de l'utilisation après modification vaut acceptation des conditions révisées." },
    { title: "10. Contact", body: "Si vous avez des questions concernant ces conditions ou concernant Coachly, veuillez nous contacter à jan.egi.staff@qupda.com." }
  ],

  it: [
    { title: "1. Accettazione dei termini", body: "Creando un account o utilizzando Coachly, confermi di avere almeno 16 anni (o di avere il consenso dei genitori) e di accettare integralmente questi termini. Coachly è gestito da Qup DA. Se non accetti questi termini, non utilizzare l'app. Possiamo aggiornare i termini di tanto in tanto; l'uso continuato dopo le modifiche costituisce accettazione dei termini aggiornati." },
    { title: "2. Il tuo account", body: "Sei responsabile della riservatezza delle tue credenziali di accesso e del codice PIN. Tutte le attività svolte tramite il tuo account sono sotto la tua responsabilità. Devi fornire informazioni accurate al momento della registrazione e mantenerle aggiornate. Puoi eliminare il tuo account in qualsiasi momento dall'app." },
    { title: "3. Uso accettabile", body: "Ti impegni a non usare l'app in modo improprio, inclusi tentativi di accesso non autorizzato, interferenze con il suo funzionamento, reverse engineering o utilizzo per scopi illegali. Ci riserviamo il diritto di sospendere o chiudere gli account che violano queste regole." },
    { title: "4. Esclusione di responsabilità sulla salute e il fitness", body: "Coachly è uno strumento di tracciamento e supporto allo stile di vita. Non è un dispositivo medico e non fornisce consigli medici, diagnosi o trattamenti. Consulta sempre un professionista sanitario qualificato o un professionista del fitness prima di iniziare un nuovo programma di esercizi o di prendere decisioni sulla tua salute, allenamento, alimentazione o trattamento. Coachly non sostituisce le cure mediche professionali. Non siamo responsabili per lesioni, malattie o altri danni derivanti dall'uso dell'app." },
    { title: "5. I tuoi dati e la privacy", body: "Elaboriamo i dati che inserisci nell'app per fornirne le funzionalità, inclusi registri di allenamento, valutazioni e qualsiasi informazione sanitaria che decidi di registrare. I tuoi dati vengono archiviati in modo sicuro e trattati in conformità alle leggi applicabili in materia di protezione dei dati, incluso il GDPR. Consulta la nostra informativa sulla privacy per i dettagli." },
    { title: "6. Rapporti di coaching", body: "Se ti connetti con un coach tramite Coachly, dati selezionati dal tuo account vengono condivisi con lui in modo che possa supportare il tuo allenamento. Decidi tu cosa condividere e puoi revocare l'accesso di un coach in qualsiasi momento dall'app." },
    { title: "7. Proprietà intellettuale", body: "Tutti i contenuti di Coachly — inclusa l'app stessa, il design, i testi, la grafica e il codice — sono di proprietà di Qup DA o dei suoi licenzianti e sono protetti dalle leggi sul copyright e da altri diritti di proprietà intellettuale. Non puoi copiare, modificare, distribuire o creare opere derivate senza previa autorizzazione scritta." },
    { title: "8. Limitazione di responsabilità", body: "Coachly è fornito così com'è e secondo disponibilità, senza alcuna garanzia. Nei limiti consentiti dalla legge, Qup DA non sarà responsabile per danni indiretti, incidentali, speciali o consequenziali derivanti dall'uso dell'app, inclusi esiti sulla salute, perdita di dati o interruzione del servizio. Utilizzi l'app a tuo rischio." },
    { title: "9. Modifiche a questi termini", body: "Possiamo modificare questi termini in qualsiasi momento. Quando lo facciamo, aggiorneremo la data in cima a questa pagina. Modifiche significative possono essere comunicate anche tramite l'app. L'uso continuato dopo le modifiche significa che accetti i termini aggiornati." },
    { title: "10. Contatti", body: "Per domande su questi termini o su Coachly, contattaci all'indirizzo jan.egi.staff@qupda.com." }
  ],

  es: [
    { title: "1. Aceptación de los términos", body: "Al crear una cuenta o usar Coachly, confirmas que tienes al menos 16 años (o cuentas con consentimiento parental) y que aceptas estos términos en su totalidad. Coachly es operado por Qup DA. Si no estás de acuerdo con estos términos, no uses la app. Podemos actualizar los términos periódicamente; el uso continuado tras los cambios constituye aceptación de los términos actualizados." },
    { title: "2. Tu cuenta", body: "Eres responsable de la confidencialidad de tus credenciales de acceso y de tu código PIN. Toda la actividad realizada en tu cuenta es tu responsabilidad. Debes proporcionar información precisa al registrarte y mantenerla actualizada. Puedes eliminar tu cuenta en cualquier momento desde la app." },
    { title: "3. Uso aceptable", body: "Te comprometes a no hacer un uso indebido de la app, incluyendo intentos de acceso no autorizado, interferir en su funcionamiento, ingeniería inversa o utilizarla con fines ilegales. Nos reservamos el derecho a suspender o cerrar cuentas que infrinjan estas reglas." },
    { title: "4. Aviso sobre salud y fitness", body: "Coachly es una herramienta de seguimiento y apoyo al estilo de vida. No es un dispositivo médico y no proporciona consejos médicos, diagnósticos ni tratamientos. Consulta siempre con un profesional sanitario cualificado o un profesional del fitness antes de iniciar un nuevo programa de ejercicios o tomar decisiones sobre tu salud, entrenamiento, nutrición o tratamiento. Coachly no sustituye la atención médica profesional. No somos responsables de lesiones, enfermedades u otros daños derivados del uso de la aplicación." },
    { title: "5. Tus datos y privacidad", body: "Procesamos los datos que introduces en la app para ofrecer sus funciones, incluidos registros de entrenamiento, valoraciones y cualquier información de salud que elijas registrar. Tus datos se almacenan de forma segura y se tratan conforme a las leyes de protección de datos aplicables, incluido el RGPD. Consulta nuestra política de privacidad para más detalles." },
    { title: "6. Relaciones de coaching", body: "Si te conectas con un coach a través de Coachly, se comparten datos seleccionados de tu cuenta con él para que pueda apoyar tu entrenamiento. Tú decides qué compartir y puedes revocar el acceso de un coach en cualquier momento desde la app." },
    { title: "7. Propiedad intelectual", body: "Todo el contenido de Coachly — incluida la propia app, su diseño, textos, gráficos y código — es propiedad de Qup DA o de sus licenciantes y está protegido por derechos de autor y otros derechos de propiedad intelectual. No puedes copiar, modificar, distribuir ni crear obras derivadas sin permiso previo por escrito." },
    { title: "8. Limitación de responsabilidad", body: "Coachly se proporciona tal cual y según disponibilidad, sin garantías de ningún tipo. En la medida permitida por la ley, Qup DA no será responsable de daños indirectos, incidentales, especiales o consecuentes derivados del uso de la app, incluidos resultados de salud, pérdida de datos o interrupción del servicio. Usas la app bajo tu propio riesgo." },
    { title: "9. Cambios en estos términos", body: "Podemos revisar estos términos en cualquier momento. Cuando lo hagamos, actualizaremos la fecha en la parte superior de esta página. Los cambios significativos pueden comunicarse también a través de la app. El uso continuado tras los cambios significa que aceptas los términos revisados." },
    { title: "10. Contacto", body: "Si tienes preguntas sobre estos términos o sobre Coachly, contáctanos en jan.egi.staff@qupda.com." }
  ],

  pl: [
    { title: "1. Akceptacja regulaminu", body: "Tworząc konto lub korzystając z Coachly, potwierdzasz, że masz co najmniej 16 lat (lub posiadasz zgodę rodziców) i że w pełni akceptujesz ten regulamin. Coachly jest obsługiwane przez Qup DA. Jeśli nie wyrażasz zgody, nie korzystaj z aplikacji. Regulamin może być aktualizowany; dalsze korzystanie z aplikacji po zmianach oznacza akceptację zaktualizowanego regulaminu." },
    { title: "2. Twoje konto", body: "Jesteś odpowiedzialny(-a) za zachowanie poufności swoich danych logowania i kodu PIN. Wszystkie działania na Twoim koncie są Twoją odpowiedzialnością. Podczas rejestracji zobowiązujesz się podać prawdziwe dane i utrzymywać je w aktualnym stanie. Konto możesz usunąć w dowolnym momencie z poziomu aplikacji." },
    { title: "3. Dopuszczalne użytkowanie", body: "Zobowiązujesz się nie nadużywać aplikacji, w tym nie próbować uzyskać do niej nieautoryzowanego dostępu, nie zakłócać jej działania, nie poddawać jej inżynierii wstecznej ani nie wykorzystywać do celów niezgodnych z prawem. Zastrzegamy sobie prawo do zawieszania lub zamykania kont, które naruszają te zasady." },
    { title: "4. Zastrzeżenie dotyczące zdrowia i fitnessu", body: "Coachly to narzędzie do śledzenia i wspierania stylu życia. Nie jest urządzeniem medycznym i nie udziela porad medycznych, nie stawia diagnoz ani nie leczy. Przed rozpoczęciem nowego programu ćwiczeń lub podjęciem decyzji dotyczących zdrowia, treningu, odżywiania lub leczenia zawsze skonsultuj się z wykwalifikowanym pracownikiem służby zdrowia lub specjalistą fitness. Coachly nie zastępuje profesjonalnej opieki medycznej. Nie ponosimy odpowiedzialności za obrażenia, choroby lub inne szkody wynikające z korzystania z aplikacji." },
    { title: "5. Twoje dane i prywatność", body: "Przetwarzamy dane wprowadzane do aplikacji, aby umożliwić działanie jej funkcji, w tym dzienniki treningowe, oceny i wszelkie informacje zdrowotne, które zdecydujesz się zarejestrować. Twoje dane są bezpiecznie przechowywane i przetwarzane zgodnie z obowiązującymi przepisami o ochronie danych, w tym z RODO. Szczegóły znajdują się w naszej polityce prywatności." },
    { title: "6. Relacje coachingowe", body: "Jeśli połączysz się z trenerem za pośrednictwem Coachly, wybrane dane z Twojego konta są udostępniane jemu, aby mógł wspierać Twój trening. Decydujesz, co zostanie udostępnione, i możesz cofnąć dostęp trenera w dowolnym momencie z poziomu aplikacji." },
    { title: "7. Własność intelektualna", body: "Wszystkie treści w Coachly — w tym sama aplikacja, jej projekt, teksty, grafika i kod — są własnością Qup DA lub jej licencjodawców i są chronione prawami autorskimi oraz innymi prawami własności intelektualnej. Nie możesz ich kopiować, modyfikować, rozpowszechniać ani tworzyć utworów zależnych bez uprzedniej pisemnej zgody." },
    { title: "8. Ograniczenie odpowiedzialności", body: "Coachly jest dostarczane w stanie, w jakim jest, oraz zgodnie z dostępnością, bez jakichkolwiek gwarancji. W maksymalnym zakresie dozwolonym przez prawo Qup DA nie ponosi odpowiedzialności za szkody pośrednie, przypadkowe, szczególne ani następcze wynikające z korzystania z aplikacji, w tym za skutki zdrowotne, utratę danych lub przerwy w usłudze. Korzystasz z aplikacji na własne ryzyko." },
    { title: "9. Zmiany regulaminu", body: "Regulamin możemy w każdej chwili zmienić. Gdy to zrobimy, zaktualizujemy datę na górze tej strony. Istotne zmiany mogą być również komunikowane przez aplikację. Dalsze korzystanie po zmianach oznacza akceptację zmienionego regulaminu." },
    { title: "10. Kontakt", body: "Jeśli masz pytania dotyczące regulaminu lub aplikacji Coachly, skontaktuj się z nami pod adresem jan.egi.staff@qupda.com." }
  ],

  pt: [
    { title: "1. Aceitação dos termos", body: "Ao criar uma conta ou usar o Coachly, confirmas ter pelo menos 16 anos (ou ter consentimento dos pais) e aceitar estes termos integralmente. O Coachly é operado pela Qup DA. Se não concordares com estes termos, não utilizes a aplicação. Podemos atualizar os termos de tempos a tempos; o uso continuado após as alterações constitui aceitação dos termos atualizados." },
    { title: "2. A tua conta", body: "És responsável por manter a confidencialidade das tuas credenciais de acesso e do código PIN. Toda a atividade realizada na tua conta é da tua responsabilidade. Concordas em fornecer informações precisas no registo e mantê-las atualizadas. Podes excluir a tua conta a qualquer momento dentro da aplicação." },
    { title: "3. Uso aceitável", body: "Concordas em não usar a aplicação de forma indevida, incluindo tentativas de acesso não autorizado, interferência no seu funcionamento, engenharia reversa ou uso para fins ilegais. Reservamo-nos o direito de suspender ou encerrar contas que violem estas regras." },
    { title: "4. Aviso sobre saúde e fitness", body: "O Coachly é uma ferramenta de monitorização e apoio ao estilo de vida. Não é um dispositivo médico e não fornece aconselhamento médico, diagnóstico ou tratamento. Consulta sempre um profissional de saúde qualificado ou um profissional de fitness antes de iniciar um novo programa de exercícios ou tomar decisões sobre a tua saúde, treino, nutrição ou tratamento. O Coachly não substitui o atendimento médico profissional. Não somos responsáveis por lesões, doenças ou outros danos resultantes do uso da aplicação." },
    { title: "5. Os teus dados e privacidade", body: "Processamos os dados que insere na aplicação para fornecer as suas funcionalidades, incluindo registos de treino, avaliações e quaisquer informações de saúde que escolhas registar. Os teus dados são armazenados em segurança e tratados em conformidade com as leis de proteção de dados aplicáveis, incluindo o RGPD. Consulta a nossa política de privacidade para detalhes." },
    { title: "6. Relações de coaching", body: "Se te conectares com um treinador através do Coachly, dados selecionados da tua conta são partilhados com ele para que possa apoiar o teu treino. Tu decides o que é partilhado e podes revogar o acesso de um treinador a qualquer momento dentro da aplicação." },
    { title: "7. Propriedade intelectual", body: "Todo o conteúdo do Coachly — incluindo a própria aplicação, o seu design, textos, gráficos e código — é propriedade da Qup DA ou dos seus licenciantes e é protegido por direitos de autor e outras leis de propriedade intelectual. Não podes copiar, modificar, distribuir ou criar obras derivadas sem autorização prévia por escrito." },
    { title: "8. Limitação de responsabilidade", body: "O Coachly é fornecido tal como está e conforme disponível, sem garantias de qualquer tipo. Na máxima extensão permitida por lei, a Qup DA não será responsável por danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso da aplicação, incluindo resultados de saúde, perda de dados ou interrupção do serviço. Usas a aplicação por tua própria conta e risco." },
    { title: "9. Alterações nestes termos", body: "Podemos rever estes termos a qualquer momento. Quando o fizermos, atualizaremos a data no topo desta página. Mudanças significativas também podem ser comunicadas pela aplicação. O uso continuado após as alterações significa que aceitas os termos revistos." },
    { title: "10. Contacto", body: "Se tiveres dúvidas sobre estes termos ou sobre o Coachly, contacta-nos em jan.egi.staff@qupda.com." }
  ]
};

// ── Replace logic ──

function replaceTermsSections() {
  if (!fs.existsSync(TARGET_FILE)) {
    console.error(`Target not found: ${TARGET_FILE}`);
    process.exit(1);
  }

  const original = fs.readFileSync(TARGET_FILE, "utf8");
  const backupPath = `${TARGET_FILE}.backup.${Date.now()}.js`;
  fs.writeFileSync(backupPath, original);
  console.log(`Backup written: ${backupPath}`);

  let updated = original;
  let totalReplaced = 0;

  for (const [lang, sections] of Object.entries(TERMS)) {
    // Find the language block start
    const langStartRe = new RegExp(`^\\s*"${lang}"\\s*:\\s*\\{`, "m");
    const langStartMatch = langStartRe.exec(updated);
    if (!langStartMatch) {
      console.warn(`  ⚠ Language "${lang}" not found, skipping`);
      continue;
    }
    const langStart = langStartMatch.index;

    // Find end of language block by matching braces
    let depth = 0;
    let i = langStart;
    while (i < updated.length) {
      const ch = updated[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) break;
      }
      i++;
    }
    const langEnd = i;

    // Within this language block, find "termsSections": [
    const block = updated.slice(langStart, langEnd);
    const tsKeyRe = /"termsSections"\s*:\s*\[/;
    const tsKeyMatch = tsKeyRe.exec(block);
    if (!tsKeyMatch) {
      console.warn(`  ⚠ "${lang}": termsSections not found, skipping`);
      continue;
    }
    const tsArrayStart = langStart + tsKeyMatch.index + tsKeyMatch[0].length - 1; // index of '['

    // Find matching ']' for this array (handles nested objects with their own braces, but no nested arrays in our case)
    let arrDepth = 0;
    let j = tsArrayStart;
    while (j < updated.length) {
      const ch = updated[j];
      if (ch === "[") arrDepth++;
      else if (ch === "]") {
        arrDepth--;
        if (arrDepth === 0) break;
      }
      j++;
    }
    const tsArrayEnd = j; // index of ']'

    // Build new array content
    const indent = "      ";
    const newArrayBody = sections
      .map((s) => {
        const titleEsc = s.title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        const bodyEsc = s.body.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
        return `${indent}{\n${indent}  "title": "${titleEsc}",\n${indent}  "body": "${bodyEsc}"\n${indent}}`;
      })
      .join(",\n");

    const newArrayLiteral = `[\n${newArrayBody}\n    ]`;

    // Replace the [ ... ] in updated
    updated =
      updated.slice(0, tsArrayStart) +
      newArrayLiteral +
      updated.slice(tsArrayEnd + 1);

    console.log(`  ${lang}: replaced (${sections.length} sections)`);
    totalReplaced++;
  }

  fs.writeFileSync(TARGET_FILE, updated);
  console.log(`\nDone. Replaced termsSections in ${totalReplaced} languages.`);
}

replaceTermsSections();

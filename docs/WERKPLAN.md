# Werkplan Timer App (werktitel: Tijdvak)

Een eigen timer voor Windows. Voor lessen, werkvormen, vergaderingen en workshops.
Openen, tijd kiezen, starten. Klein venster, mini-widget of volledig scherm.
Kern van het product: **customization**. Jouw stijl, jouw functies.

---

## 1. Onderzoek: wat bestaat er al?

| Soort | Voorbeelden | Sterk | Zwak |
|---|---|---|---|
| Ingebouwd | Windows Klok-app (timer) | Altijd aanwezig, simpel | Nauwelijks aan te passen, klein, geen projectorstand |
| Klaslokaal (browser) | Classroomscreen, online fullscreen timers | Groot beeld, visueel | Browser nodig, advertenties of abonnement, geen echte desktop-functies |
| Klaslokaal (desktop) | Kleine portable timers met pin-functie | Altijd bovenop, sneltoetsen | Saai uiterlijk, weinig thema's |
| Visuele timers | Verdwijnende taartpunt (rood vlak dat krimpt) | Kinderen en NT2-leerders zien tijd zonder cijfers | Vaak los apparaat of betaalde app |
| Presentatie | Floating overlay timers, presenter timers | Zichtbaar boven dia's | Geen lesgerichte functies |
| Productiviteit | Pomodoro-apps | Cycli en statistiek | Niet gemaakt voor een groep die kijkt |

**Wat mensen vaak vragen (feedbackborden, fora, reviews):**
- Altijd bovenop (always on top), ook boven fullscreen programma's.
- Verplaatsbaar en schaalbaar mini-venster, transparante stand.
- Visuele weergave zonder cijfers (taartpunt die verdwijnt), voor mensen met "tijdblindheid".
- Timer alleen zichtbaar voor de presentator, niet voor het publiek.
- Grotere, beter leesbare cijfers ("timer hard to see").
- Waarschuwing vóór het einde, niet alleen aan het einde.

## 2. Functies

### 2a. Standaard (moet erin, versie 1)
- Aftellen (countdown) en optellen (stopwatch).
- Snelle presets: 1, 3, 5, 10, 15, 20, 30 minuten + eigen presets.
- Start, pauze, reset, +1 min en -1 min tijdens het lopen.
- Geluid aan het einde (kiesbaar, volume), ook stil-stand.
- Sneltoetsen: Spatie (start/pauze), R (reset), F (fullscreen), M (mini), +/-.
- Venster, mini-widget, fullscreen.
- Instellingen worden onthouden.

### 2b. Modern (2026-niveau)
- **Mica/Acrylic** uiterlijk van Windows 11, licht en donker volgen het systeem.
- **Mini-widget** altijd bovenop, transparant, door te klikken (click-through).
- **Fasewaarschuwing**: kleur verandert bij bijv. 2 min en 30 sec (groen, oranje, rood).
- **Globale sneltoetsen**: timer bedienen terwijl PowerPoint actief is.
- **Meerdere schermen**: kies op welk scherm fullscreen komt (beamer).
- **Taakbalk-voortgang** en Windows-meldingen.
- **Drift-vrije timing**: rekent met een vaste eindtijd, niet met "tellen", dus altijd exact.

### 2c. Nog weinig gezien of vaak gevraagd (onderscheidend)
- **Programma/agenda-stand**: een rij blokken ("Uitleg 10, Groepswerk 15, Bespreken 5") die automatisch doorloopt. Ideaal voor workshops en vergaderingen.
- **Groepjes-stand**: meerdere timers naast elkaar (groep 1 t/m 6, of spreker A/B).
- **Presentator + publiek**: op laptop extra info (volgende blok, notities), op beamer alleen de grote timer.
- **Taak-tekst op het scherm**: "Lees tekst 3 en beantwoord vraag 1 t/m 4." Groot onder de timer. Sterk voor NT2: instructie blijft zichtbaar.
- **Pictogrammen bij werkvormen**: stil werken, fluisteren, in tweetallen, groepjes (iconen + kleur).
- **Geluidsniveau-indicator** (optioneel, microfoon): laat zien of de klas te luid is.
- **Visuele timers zonder cijfers**: taartpunt, zandloper, stoplicht, voortgangsbalk.
- **Thema-bouwer**: kleuren, lettertype, achtergrondafbeelding, grootte van de cijfers, eigen geluid. Thema's exporteren en delen met collega's (bestand).
- **Eind-actie kiezen**: geluid, scherm knippert, volgend blok starten, of tekst tonen ("Pennen neer!").
- **Overtijd**: na nul doortellen in het rood (+0:45), handig bij vergaderingen.

## 3. Standen (schermmodi)

| Stand | Wat | Wanneer |
|---|---|---|
| Venster | Normaal programma met presets en bediening | Klaarzetten |
| Mini | Klein, altijd bovenop, verplaatsbaar | Tijdens eigen werk of dia's |
| Overlay | Transparant, click-through, boven alles | Over een presentatie heen |
| Fullscreen | Groot op de beamer, bediening verdwijnt | Klaslokaal, workshop |
| Programma | Agenda met blokken, loopt door | Workshops, vergaderingen |
| Groepjes | Meerdere timers tegelijk | Groepswerk, debat |
| Presentator | Twee schermen: jij ziet meer dan het publiek | Presentaties |
| Instellingen | Thema-bouwer en voorkeuren | Aanpassen |
| Klaar | Eind-scherm met actie en overtijd | Na nul |

## 4. Architectuur (Software Framework analyse)

**Situatie:** greenfield, MVP, 1 ontwikkelaar, Windows-only, offline, geen gevoelige data.

**Gekozen frameworks:**
1. **Modular monolith** (primair): één app, strak verdeeld in modules. Geen servers, geen microservices.
2. **Hexagonal light** (alleen de kern): de timer-logica is pure code zonder Windows of UI. Daardoor goed te testen.
3. **Twelve-factor light + CI/CD basics**: instellingen in een bestand, automatische build van de installer via GitHub Actions.

**Bewust NIET:** volledige DDD, event sourcing, microservices, poort/adapter-lagen overal. Overkill voor deze fase.

**Techniek-keuze: Tauri 2 + TypeScript + React (Vite)**
- Installer van ca. 5 tot 15 MB (Electron: 80 tot 200 MB).
- Gebruikt WebView2, die standaard in Windows 11 zit.
- Ondersteunt altijd-bovenop, transparant en zonder rand.
- Risico: transparante vensters en schaduwen op Windows vroeg testen. Terugvaloptie: Electron (zelfde frontend-code blijft bruikbaar).

**Modules:**
```
src/
  core/        timer-motor (state machine, drift-vrij), programma's, groepjes   -> pure TS, unit tests
  themes/      thema-model, standaard thema's, import/export
  ui/          weergaven: venster, mini, fullscreen, overlay, presentator
  settings/    opslag van voorkeuren en presets (adapter)
  platform/    Tauri: vensters, sneltoetsen, schermen, meldingen, geluid (adapter)
src-tauri/     Rust-kant (vensterbeheer, globale sneltoetsen, tray)
```
Regel: `core` importeert nooit `ui` of `platform`.

## 5. Planning (fases)

| Fase | Inhoud | Resultaat |
|---|---|---|
| 0. Fundament (week 1) | Repo, Tauri 2 project, CI-build, lint/tests | Lege app installeert op Windows |
| 1. Kern (week 2) | Timer-motor + tests, venster-stand, presets, sneltoetsen, geluid | Bruikbare timer |
| 2. Standen (week 3) | Fullscreen, mini, overlay, meerdere schermen | Inzetbaar in de les |
| 3. Customization (week 4-5) | Thema-bouwer, 6 tot 8 standaard thema's, visuele timers, export | Eigen stijl |
| 4. Onderscheidend (week 6-7) | Programma-stand, groepjes, taak-tekst, werkvorm-iconen | Workshop-klaar |
| 5. Afwerking (week 8) | Presentator-stand, installer, auto-update, logo, website-pagina | Versie 1.0 |

## 6. Meetbaar doel
- Van openen tot lopende timer: **binnen 3 seconden / 2 klikken**.
- Afwijking na 60 minuten: **minder dan 100 ms**.
- Installer: **kleiner dan 15 MB**.

## 7. Open vragen voor Rida
1. Naam: Tijdvak (werktitel), of liever Lesklok, Zandvak, Tempo, Eigen naam?
2. Welke 3 ontwerpen spreken je het meest aan? Die worden de standaard thema's.
3. Welk logo-concept?
4. Wil je de geluidsniveau-indicator (microfoon) in versie 1 of later?
5. Gratis voor collega's delen, of later verkopen (Microsoft Store)?

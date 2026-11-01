# Entscheidungslog

Format je Eintrag (höchstens 5 Zeilen): **Entscheidung**, Grund, verantwortliche Rolle, Einwände.
Rollen: **Leitung** (Produkt, Priorisierung), **Design** (UX, UI, Writing, Motion, Barrierefreiheit), **Technik** (Frontend, Mobile, Backend, Daten, Performance, Release), **Sicherheit & QA** (Tests, Security, DSGVO, Stores, Support, Markt).
Personas, Interviews und Usability-Tests sind durchgehend **simuliert**.

## Phase 0/1 – Ist-Analyse und Discovery

**E-01 Organisation mit genau vier Subagenten**
- Entscheidung: Vier dauerhafte Prüf-Teams (Leitung, Design, Technik, Sicherheit & QA), über alle Phasen fortgeführt. Der Hauptagent orchestriert, schreibt die Mockups und führt dieses Log.
- Grund: Auftrag verlangt genau vier Subagenten; Fortführung statt Neustart spart Kontext und hält Blickwinkel konstant.
- Rolle: Leitung. Einwände: Technik – Mockups von einer Hand sind konsistenter, aber ohne unabhängige Umsetzung; aufgelöst durch getrennte Prüfung in Phase 4/5.

**E-02 Kein `npx playwright install chromium`**
- Entscheidung: Das vorinstallierte Chromium der Arbeitsumgebung nutzen (`/opt/pw-browsers`), keine Neuinstallation.
- Grund: Die Umgebung verbietet eine zweite Playwright-Installation, weil sie den Browser sonst nicht findet; laut Auftrag gilt bei Widerspruch die Umgebung/das Repo. Kein WebKit.
- Rolle: Technik. Einwände: keine.

**E-03 Notion gelesen, nichts übernommen außer dem Feature-Abgleich**
- Entscheidung: Seite und Datenbank waren erreichbar (nur lesend). Zwei Einträge; die Umfragen-Idee ist bereits PROJ-14. Keine Inhalte mit Personenbezug übernommen.
- Grund: Öffentliches Repo; Notion-Stand ist älter als das Repo.
- Rolle: Sicherheit & QA. Einwände: keine.

**E-04 Logo als vektorisiertes SVG**
- Entscheidung: `public/logo-wordmark.png` per Potrace-Port in ein SVG (2,2 KB) übertragen, Form unverändert, Farbe über `currentColor` (Waldgrün hell, Creme dunkel). Original bleibt unangetastet.
- Grund: Vorgabe „SVG statt Rastergrafik“, Dark Mode ohne Invertier-Filter, 95 % weniger Daten als das PNG.
- Rolle: Design. Einwände: Technik – Tracing glättet Kanten minimal; visuell geprüft, Abweichung nicht sichtbar.

**E-05 Schriften für B und C**
- Entscheidung: A nutzt Hanken Grotesk + Source Serif 4 aus `src/fonts/`. B nutzt Nunito (gerundet, verspielt). C nutzt Bricolage Grotesque für Display und Hanken Grotesk für UI. Bezug über npm `@fontsource-variable/*` 5.3.0, Latin-Subset, Lizenz SIL OFL 1.1 (`src/fonts/LICENSE-*.txt`).
- Grund: Klare Unterscheidbarkeit der Richtungen bei kleinen Dateien (39–41 KB je Schrift). GitHub-Raw war über den Proxy gesperrt.
- Rolle: Design. Einwände: Sicherheit & QA – Lizenz muss im Mockup genannt werden; umgesetzt im Info-Panel jedes Mockups.

**E-06 Gemeinsamer Kern, drei Renderer, Build zu je einer Datei**
- Entscheidung: `src/core.js` (Demodaten, Zustände, Router, Steuerung, Interaktionslogik) plus je Variante eigenes CSS und eigene Screens; `src/build.mjs` bettet alles inline in `mockup-a/b/c.html`.
- Grund: Demodaten und Schalter müssen in allen drei Mockups identisch sein; Fehler im Kern werden einmal behoben.
- Rolle: Technik. Einwände: Design – Gefahr, dass sich die Varianten zu ähnlich anfühlen; Gegenmaßnahme: Layout, Navigation und Komponenten je Variante eigenständig.

**E-07 Mobile/Desktop-Schalter über Container Queries**
- Entscheidung: Die App liegt in einem Rahmen; „Mobil“ begrenzt ihn auf 390 px, „Desktop“ gibt die volle Breite frei. Layout, Sheets (Drawer vs. Dialog) und Navigation reagieren auf die Rahmenbreite (ab 768 px Desktop-Layout, wie `md` in der App).
- Grund: Kein horizontales Scrollen bei 375 px; Schalter wirkt ab Tablet-Breite. Bei schmalem Fenster weist der Schalter darauf hin, dass Desktop mindestens 768 px braucht.
- Rolle: Technik. Einwände: Design – auf 375 px ist die Desktop-Ansicht nicht direkt sichtbar; akzeptiert, Screenshots bei 1440 px decken sie ab.

**E-08 Personas in einer gemeinsamen fiktiven Gruppe**
- Entscheidung: Vier simulierte Personas (Organisatorin, stiller Mitläufer mit Screenreader, Spontane, Elternteil mit Rot-Grün-Sehschwäche) in einer fiktiven Gruppe.
- Grund: Gruppenmomente und stille Mitglieder werden testbar.
- Rolle: Design. Einwände: Leitung – weniger Vielfalt bei Gruppentypen; akzeptiert.

**E-09 Keine öffentliche Liste „hat noch nicht reagiert“**
- Entscheidung: Fehlende Stimmen und Zusagen nur als Summe („4 von 6“), nie als Namensliste.
- Grund: Kein Bloßstellen, kein sozialer Druck als Dark Pattern.
- Rolle: Design. Einwände: Leitung – Organisator:innen brauchen Überblick; gelöst über Zähler ohne Namen.

## Phase 2 – Definition

**E-10 Korrektur der Ist-Analyse: Vorschlagslimit existiert nicht mehr**
- Entscheidung: Schwäche 6 in `Discovery.md` korrigiert; aus „Vorschlagslimit lockern“ wird BL-09 „Schnell-Vorschlag“ (nur Titel Pflicht).
- Grund: Limit seit 2026-06-23 entfernt (PROJ-4, „Post-Deployment Fixes“), am Spec bestätigt.
- Rolle: Leitung (Befund von Leitung und Technik unabhängig). Einwände: Design prüft, ob die vorbelegte Schwelle „Mehrheit“ verständlich ist.

**E-11 Terminabstimmung und vereinfachte Rollen nur in Variante C**
- Entscheidung: BL-04 (Terminoptionen) und BL-08 (Admin + Mitglied) nur in C; A und B behalten die heutige Terminfindung und drei Rollen.
- Grund: PROJ-7 und PROJ-3 haben das bewusst anders entschieden; Änderung nur über `/refine` mit Freigabe.
- Rolle: Leitung. Einwände: Technik – Rollen-Migration riskant (siehe E-12).

**E-12 Rollen zuerst nur in der UI vereinfachen**
- Entscheidung: Für C wird „Mitglied“ in der Oberfläche auf `editor` abgebildet; DB-Rollen bleiben vorerst.
- Grund: Alte Store-Builds und fünf Migrationen mit RLS hängen an `editor`/`observer`.
- Rolle: Technik. Einwände: Leitung – Altlast bleibt; im Backlog als Folgeschritt.

**E-13 Terminabstimmung als Umfrage-Typ**
- Entscheidung: BL-04 als `kind='date'` auf den Umfragen aus PROJ-14 statt neuer Tabellen.
- Grund: Spart 3–4 Personentage; Realtime und RLS vorhanden.
- Rolle: Technik. Einwände: Leitung – PROJ-7 schließt Doodle-Stil bisher aus; nur mit `/refine`.

**E-14 Reihenfolge und Pflichtpakete im Backlog**
- Entscheidung: BL-02 (Erinnerungs-Infrastruktur) vor BL-16/BL-20; BL-19 (KPI-Zeitstempel) und BL-12 (Barrierefreiheit) unabhängig vom Score.
- Grund: Abhängigkeiten; ohne BL-19 keine Nullmessung.
- Rolle: Leitung. Einwände: Sicherheit & QA bestätigt Datenschutzhinweis und Mindestgröße der Auswertung.

**E-15 Kein Web-Push und kein Offline-Lesecache in den Mockups**
- Entscheidung: Offline-Zustand zeigt den im Arbeitsspeicher geladenen Stand mit Hinweis und erklärt gesperrte Schreibaktionen; kein persistenter Cache, kein Web-Push.
- Grund: PROJ-10/12 schließen Web-Push aus; iOS-Web-Push nur für installierte Web-Apps; Lesecache ohne Datenbasis nicht begründbar.
- Rolle: Leitung, Technik. Einwände: Design – Desktop-Nutzer bleiben ohne Push; E-Mail-Opt-in als Ersatz.

**E-16 Erinnerungen nur tagesgenau**
- Entscheidung: Der Erinnerungs-Vorschlag nennt Tage („einen Tag vorher“), keine Uhrzeiten.
- Grund: `start_date`/`end_date` sind reine Datumswerte; Uhrzeiten bräuchten eine Schema-Erweiterung.
- Rolle: Technik. Einwände: keine.

**E-17 Kontrastlücken des Styleguides werden in allen Varianten korrigiert**
- Entscheidung: `ink-3` nicht für Fließtext (nur Platzhalter/Deko), Fokusring Gold mit dunkler Innenkante (≥ 3:1), Gold-Text nur auf Gold-Tint oder groß, Status-Punkte immer mit Text.
- Grund: Nachgerechnet: `ink-3` auf Creme 3,4:1, Gold-Ring auf Creme 2,2:1, Gold-Text auf Weiß 3,0:1 (Design). WCAG 2.2 AA ist Teil der Definition of Done.
- Rolle: Design. Einwände: A soll den Styleguide strikt einhalten – Barrierefreiheit hat Vorrang; der Styleguide selbst bleibt unverändert, die Korrektur steht im Backlog (BL-12).

## Phase 3 – Design-Sprint

**E-18 Statusbegriffe**
- Entscheidung: A „Zu planen · In Planung · Termin steht · Abgeschlossen“; B und C „… · Termin steht · Erlebt“.
- Grund: „Termin steht“ beseitigt die Verwechslung mit „Abgeschlossen“ (BL-14); „Erlebt“ wird bewusst als Variable getestet.
- Rolle: Leitung. Einwände: Sicherheit & QA – Tests nur eingeschränkt vergleichbar; im Prüfbericht genannt.

**E-19 Pflichtergänzungen für alle drei Richtungen**
- Entscheidung: Impuls nach dem Termin (BL-20), Gruppenvorschau beim Link-Beitritt (BL-15, Vorschlag), Konto löschen, Daten exportieren, Melden.
- Grund: RICE-Rang 4 bzw. Ergänzung zu BL-01; Apple 5.1.1(v), Google Play Account-Deletion, Apple 1.2 (UGC), DSGVO Art. 15/17/20.
- Rolle: Leitung, Sicherheit & QA. Einwände: Design – mehr Einträge im Profil; gebündelt unter „Konto & Datenschutz“.

**E-20 Stapel-Abstimmung in B nur unter Bedingungen**
- Entscheidung: „Später“ ist neutral, „Bin dafür“ zurücknehmbar, Stapel endet mit „Alles gesehen“, Einstieg über „Deine Stimme fehlt“, Liste bleibt Standard, Buttons statt Pflicht-Wischen.
- Grund: Hebt die Abstimmungsbeteiligung (K2) ohne Druck oder Endlos-Feed.
- Rolle: Leitung. Einwände: Design – Wischen erinnert an Dating-Apps; daher keine Wertung nach links.

**E-21 C ohne Board, mit Fluss**
- Entscheidung: Fluss-Stufen 1:1 die Status plus „Ideen“, keine eigene Stufe „Abstimmung“; Zähler und Statuswechsel-Buttons je Stufe; Desktop zeigt alle Stufen einklappbar.
- Grund: Prüft die neue IA (BL-18) ohne Datenmodell-Änderung.
- Rolle: Leitung. Einwände: Technik – keine.

**E-22 Namenskonflikt „Erinnerungen“**
- Entscheidung: Archiv heißt „Album“ (C-Navigation), Reminder heißen in C „Vorab-Hinweise“, in A/B „Termin-Erinnerungen“.
- Grund: Drei Teams fanden die Kollision unabhängig; Verwechslung zwischen Fotoarchiv und Benachrichtigung.
- Rolle: Design. Einwände: keine.

**E-23 Gastgeber:in in C nur per Zuweisung oder bei freier Aktivität**
- Entscheidung: Übernahme ist eine ausdrückliche Aktion mit Verlaufseintrag; Rechte wie heute die Initiator-Rechte; mindestens ein Admin bleibt erzwungen.
- Grund: Sonst könnte jedes Mitglied fremde Planungsrechte an sich ziehen. Braucht `activities.host_id` (Technik).
- Rolle: Sicherheit & QA. Einwände: Leitung – mehr Reibung beim Übernehmen; akzeptiert.

**E-24 Gamification-Leitplanken (B, gilt sinngemäß für alle)**
- Entscheidung: Kein Countdown, kein Scheitern-Zustand, keine Push für Ziele, Badges nur im eigenen Profil, Feiern ≤ 1 s, ≤ 3 Blitze/s, ohne Ton, bei reduzierter Bewegung Überblenden.
- Grund: WCAG 2.3.1 und 2.3.3, Momentum-Prinzip aus PROJ-15 (kein Verfall), keine Dark Patterns.
- Rolle: Sicherheit & QA, Design. Einwände: Design – B wirkt weniger „laut“; akzeptiert.

**E-25 Marken „Vorschlag“ und „Neu“**
- Entscheidung: „Vorschlag“ (gestrichelt) für Teilen-Link/Deep Link und Erinnerungen, wie im Auftrag gefordert; „Neu“ für sichtbare Funktionen ohne heutiges Datenmodell (Aufgabe übernehmen, Zusage, Reaktionen, Ziele, Terminabstimmung).
- Grund: Technik fand, dass z. B. „Übernehmen“ und Fälligkeiten im Schema fehlen; ehrliche Kennzeichnung statt stiller Versprechen.
- Rolle: Leitung. Einwände: Design – Marken kosten Ruhe im Layout; klein und nur einmal je Abschnitt.

**E-26 Offline ohne Warteschlangen-Versprechen**
- Entscheidung: Offline sind Schreibaktionen gesperrt und erklären sich („geht wieder, sobald die Verbindung zurück ist“); keine Aussage „wird später gesendet“.
- Grund: Eine Offline-Warteschlange gibt es nicht und widerspricht dem heutigen Stack ohne Sync-Schicht (Backlog BL-17).
- Rolle: Technik. Einwände: Design – weniger komfortabel; ehrlicher.

**E-27 Einladungs-Link mit eigenem Token**
- Entscheidung: Vorschlag: persönlicher Link mit 128-Bit-Token im URL-Fragment, 7 Tage gültig, widerrufbar, Vorschau ohne Mitgliedernamen; Code bleibt Fallback. Demo-Codes zehnstellig wie im Repo (seit 2026-10-30).
- Grund: Nicht erratbar, nicht in Server-Logs, datensparsam.
- Rolle: Sicherheit & QA. Einwände: Technik – Fragment plus Universal Links muss nativ getestet werden (Backlog BL-01).

## Phase 4 – Umsetzung und Prüfung (Technik, Sicherheit & QA)

**E-28 Rechte in A und B an das Ist angeglichen**
- Entscheidung: Status verschieben, Abschließen und Termin festlegen dürfen Admin und Initiator:in; Umfragen und Aufgaben alle Mitglieder inkl. Beobachter:innen; Vorschlagen alle außer Beobachter:innen.
- Grund: Sicherheit & QA fand Abweichungen vom Ist (PROJ-5 Entscheidung 2026-06-22, PROJ-14 Entscheidung 2026-07-11); am Spec bestätigt. Hinweistexte nennen jetzt die tatsächlich Berechtigten.
- Rolle: Sicherheit & QA. Einwände: keine.

**E-29 Melden, Ausblenden, Blockieren an allen Nutzerinhalten**
- Entscheidung: ⋯-Menü an Aktivität/Vorschlag, Umfrage, Foto, Kommentar und Mitglied; „Für mich ausblenden“ ist eine eigene Aktion ohne Benachrichtigung; Admins sehen „Inhalt entfernen“.
- Grund: Apple Guideline 1.2 (UGC), Google-Play-UGC-Richtlinie; vorher nur bei Kommentaren und mit irreführendem Toast.
- Rolle: Sicherheit & QA. Einwände: Design – mehr Menüs; als kleines ⋯ ohne Text gelöst.

**E-30 Fokus nie verdeckt, Hintergrund bei Dialogen gesperrt**
- Entscheidung: Fokussierte Elemente werden über Tab-Bar, Plus-Button und feste Leisten gescrollt; bei offenem Dialog ist der Hintergrund `inert`; Alertdialoge erhalten den Fokus sofort.
- Grund: WCAG 2.4.11 (an fünf Stellen verletzt), 2.4.3; in der App liefern Radix/`responsive-modal` die Sperre, die Scroll-Regel gehört ins Backlog.
- Rolle: Sicherheit & QA, Technik. Einwände: keine.

**E-31 Erinnerungen standardmäßig aus**
- Entscheidung: Alle Erinnerungs-Schalter starten ausgeschaltet.
- Grund: Opt-in für E-Mail und Erinnerungen (Anforderungen P7, DSGVO Art. 25).
- Rolle: Sicherheit & QA. Einwände: Leitung – weniger Wirkung auf K1; akzeptiert.

**E-32 Einladungs-Vorschau ohne Mitgliederzahl, mit QR-Code**
- Entscheidung: Die Link-Vorschau zeigt nur den Gruppennamen; der Teilen-Vorschlag enthält einen QR-Code-Platzhalter.
- Grund: Datensparsamkeit vor dem Beitritt; QR für Treffen vor Ort (Anforderungen P4).
- Rolle: Sicherheit & QA. Einwände: Design – Zahl wäre einladender; Datensparsamkeit hat Vorrang.

**E-33 Konto löschen mit Frist, rechtliche Links im Profil**
- Entscheidung: Löschdialog nennt „innerhalb von 30 Tagen, inkl. Fotos und Kommentarbilder“ (Frist ist Annahme); Datenschutz, Impressum und Nutzungsbedingungen im Profil.
- Grund: Apple 5.1.1(i) und 5.1.1(v).
- Rolle: Sicherheit & QA. Einwände: Leitung – 30 Tage rechtlich prüfen; im Backlog vermerkt.

**E-34 „Zurück“ bleibt im Mockup**
- Entscheidung: Eigener Verlauf statt `history.back()`.
- Grund: Beim Öffnen per `file://` konnte „Zurück“ die Datei verlassen (Testlauf brach ab).
- Rolle: Technik. Einwände: keine.

**E-35 Breitenanimationen bleiben im Mockup, Regel für die App**
- Entscheidung: Fortschrittsbalken animieren im Mockup über `width`; in der App über `transform: scaleX()`. Skeleton-Schimmer läuft höchstens dreimal.
- Grund: Im Mockup ohne Wirkung (Neuaufbau je Klick), Aufwand ohne Nutzen; für die App als Umsetzungshinweis im Backlog.
- Rolle: Technik. Einwände: keine (niedrig).

**E-36 Eigener Prüf-Runner statt `@playwright/test`**
- Entscheidung: `tests/dod.cjs` mit `tests/dod.config.json` nutzt die vorinstallierte Playwright-Bibliothek; `playwright.config.ts` bleibt unverändert.
- Grund: `@playwright/test` ist nicht installiert (`node_modules` fehlt), eine Installation hätte Browser nachgeladen (E-02).
- Rolle: Technik. Einwände: Sicherheit & QA – kein Testbericht im Playwright-Format; Ergebnisse stehen in `tests/results.json` und `Pruefbericht.md`.

## Phase 5 – Qualitätssicherung

Korrekturrunden: **2 von höchstens 3** genutzt. Runde 1: Befunde aus Technik- und QA-Review sowie aus dem ersten automatischen Lauf. Runde 2: Befunde aus den simulierten Usability-Tests.

**E-37 Kritischer Fehler: Inhalt ließ sich nicht scrollen (behoben)**
- Entscheidung: `.app{grid-template-rows:minmax(0,1fr)}` und `.col{min-height:0}` in allen drei Mockups; der Prüf-Runner testet jetzt vertikales Scrollen per Mausrad (`verticalScroll`).
- Grund: Design fand in den simulierten Tests, dass alles unterhalb des ersten Bildschirms nur per Tastatur erreichbar war. Die ersten automatischen Läufe prüften nur horizontales Scrollen – Lücke im Runner, jetzt geschlossen.
- Rolle: Design (Befund), Technik (Fix und Test). Einwände: keine.

**E-38 Rückgängig beim Abhaken, Fokus nach Feiern**
- Entscheidung: Toast mit „Rückgängig“ (6 s), erledigte Zeile bleibt bis zum Screenwechsel; nach dem Schließen einer Feier springt der Fokus auf die Überschrift, wenn das auslösende Element fehlt.
- Grund: Fehlbedienung ohne Ausweg (WCAG 3.3.4 sinngemäß), Fokusverlust auf `body` (2.4.3).
- Rolle: Design. Einwände: keine.

**E-39 „Beste Zeiträume“ in der Terminfindung**
- Entscheidung: Über dem Kalender stehen die drei besten Wochenenden mit Text und Zahl („4 von 4 mit Kalender frei“); Mitglieder ohne Kalender sind ausdrücklich nicht eingerechnet.
- Grund: Tobias (simuliert) musste 30 Felder absuchen; Farbe allein reicht nicht.
- Rolle: Design. Einwände: Technik – Berechnung gehört in `get-group-availability` (Backlog).

**E-40 B-Start: Aufgaben vor Spielmechanik**
- Entscheidung: „Deine Missionen“ und „Als Nächstes“ stehen oben, Lagerfeuer kompakt, Saison-Ziel darunter.
- Grund: Die eigene Aufgabe lag bei ca. 1.430 px; Nutzwert vor Spaß (Entscheidungsprinzip).
- Rolle: Leitung. Einwände: Design – weniger Bühne fürs Lagerfeuer; akzeptiert.

**E-41 Klickziele und Formular**
- Entscheidung: Abhak-Checkbox 44 px; optionales Link-Feld im Vorschlag; in C führt „Idee teilen“ in den Fluss.
- Grund: Zielgröße nach Styleguide (≥ 44 px); PROJ-4 kennt das Link-Feld; Nutzer:in soll die eigene Idee sehen.
- Rolle: Design. Einwände: keine.

**E-42 Korrekturrunde 3 (letzte): kleine Restpunkte aus dem Nachtest**
- Entscheidung: „Rückgängig“-Toast hält 10 s und pausiert bei Fokus oder Maus; Memory Card im Detail mit Zitat und „Karte teilen“; gespeicherter Link im Detail sichtbar; C sagt „Idee“ statt „Vorschlag“ und zeigt bei Gleichstand in der Terminabstimmung einen Hinweis.
- Grund: Nachtest von Design (simuliert), T6 nur teilweise erfüllt; WCAG 2.2.1 (Zeitbegrenzung).
- Rolle: Design, Leitung. Einwände: keine. Damit sind alle drei erlaubten Korrekturrunden genutzt.

## Offene Mängel (nach drei Korrekturrunden)

| Nr. | Mangel | Varianten | Schwere | Warum offen / Folge |
|---|---|---|---|---|
| M-1 | „Rückgängig“ im Toast ist per Tastatur erst nach 8–14 Tabs erreichbar (Timer pausiert inzwischen bei Fokus) | A, B, C | mittel | In der App: Toast-Aktion per Tastenkürzel oder Fokus auf den Toast setzen (sonner unterstützt Aktionen) – Backlog BL-12 |
| M-2 | Eigene Aufgabe liegt in A/C knapp unter der Tab-Bar; in B steht „Als Nächstes“ erst bei ca. 1.040 px | A, B, C | niedrig | Reihenfolge der Startseite in `/write-spec` zu BL-05 festlegen |
| M-3 | Schrift wächst nicht mit der Systemschrift (px statt rem) | A, B, C | mittel | Mockup-Technik; die App nutzt Tailwind (rem). Prüfpunkt für die Umsetzung (WCAG 1.4.4) |
| M-4 | „Anstehend“ in C bietet nur „Zusagen“, nicht „Vielleicht/Kann nicht“ | C | niedrig | Zusage-Sheet in der Umsetzung |
| M-5 | Wischen im Stimmen-Stapel nicht umgesetzt, nur Buttons | B | niedrig | Bewusst: Buttons sind die barrierefreie Pflicht-Alternative (E-20) |
| M-6 | Fortschrittsbalken animieren `width`, Skeleton `background-position` | A, B, C | niedrig | E-35; Regel für die App im Backlog |
| M-7 | Kontrast-Messung ist heuristisch: Verläufe nur über ihre Farbstopps, Pseudo-Elemente nicht gemessen | A, B, C | niedrig | Texte auf Verläufen liegen deshalb auf eigenen, messbaren Flächen; Rest manuell in Screenshots gesichtet |
| M-8 | Nur Chromium geprüft (kein WebKit/Safari, kein Firefox), kein echter Screenreader | A, B, C | mittel | Umgebung (E-02); Screenreader-Nutzung nur simuliert (Persona Jonas) |
| M-9 | Rechtliche Annahmen: Löschfrist 30 Tage, Mindestalter 16 | A, B, C | mittel | Rechtlich prüfen vor Umsetzung (BL-21) |
| M-10 | Desktop-Schalter wirkt erst ab 768 px Fensterbreite | A, B, C | niedrig | E-07; Hinweis-Toast statt horizontalem Scrollen |

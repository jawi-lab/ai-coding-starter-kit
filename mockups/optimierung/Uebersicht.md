# Übersicht und Empfehlung

Stand: 2026-11-01. Verantwortlich: Leitung. Grundlage: [`Definition.md`](Definition.md), [`Richtungen.md`](Richtungen.md), [`Backlog.md`](Backlog.md), [`Usability-Tests.md`](Usability-Tests.md), [`Entscheidungslog.md`](Entscheidungslog.md) (bis E-41).

> **Was simuliert ist:** Personas, Interviews, Zitate und Usability-Tests sind **simuliert**. Niemand aus der Zielgruppe war beteiligt. Gemessen sind nur Klicks, Tab-Schritte, Positionen, Größen, Fokus, Dateigrößen und Kontraste aus automatisierten Durchläufen im Browser. Reach, Impact, Confidence, Zielwerte und Aufwände sind **Annahmen** bzw. Schätzungen. Vor einer Umsetzung braucht es echte Tests mit Menschen.

## 1. Die drei Varianten

**A – Evolution („Mellon, aufgeräumt“):** A ist die heutige App mit geschlossenen Lücken, streng nach `STYLEGUIDE.md`. Navigation, Board und Rollen bleiben, dazu kommen „Was steht an“ auf Start, Zusage, „Termin steht“ als Status, Schnell-Vorschlag und „Beste Zeiträume“ über dem Kalender. Teilen-Link und Erinnerungen sind als **Vorschlag** markiert. Abweichungen vom Styleguide gibt es nur bei Kontrast und Fokus.

**B – Spielerisch („Lagerfeuer“):** Planen wird zum gemeinsamen Spiel, ohne dass jemand etwas verliert. Dazu gehören ein Saison-Ziel der Gruppe, Momentum als Flamme, Aufgaben als „Missionen“, Reaktionen und kurze Feiern. Die Stapel-Abstimmung („Bin dafür / Später“) ist ein zusätzlicher Einstieg über „Deine Stimme fehlt“, Standard bleibt die Liste. Schrift ist Nunito, mit mehr Honig- und Blush-Flächen; Grün bleibt die einzige Aktionsfarbe.

**C – Mutig („Anstehend“):** C hat eine neue Informationsarchitektur: „Anstehend · Gruppe · Album“, Plus zum Erstellen, Profil über den Avatar. Ein Fluss nach Lebensphase ersetzt das Board, auf dem Desktop gibt es drei Spalten und abschaltbare Tastenkürzel. Neu sind außerdem eine optionale Terminabstimmung („Passt / Passt vielleicht / Passt nicht“) und ein Rollenmodell aus Admin, Mitglied und Gastgeber:in. Gestaltet ist C flach, ohne Glas und Blur, mit Bricolage Grotesque als Display-Schrift.

## 2. Vergleich

Skala 1–5, **5 ist immer am besten**: hoher Nutzerwert, viel Spaß, **geringer** Aufwand, hohe Nachhaltigkeit, **geringes** Risiko.

| Kriterium | A Evolution | B Spielerisch | C Mutig |
|---|---|---|---|
| **Nutzerwert** | **4**: Nach Runde 2 schaffen alle Personas die Kernaufgaben; T1 braucht 4 Klicks dank „Beste Zeiträume“. Mitglieder ohne Kalender werden nicht eingerechnet. | **3**: Mira (simuliert) mag den Stapel. Zusage und „Als Nächstes“ stehen auf Start aber spät (y ≈ 1041). | **5**: Für 3 von 4 Personas am besten. T1 in 3 bzw. 2 Klicks, kürzeste Tab-Wege (8 mobil / 12 Desktop), große Antwort-Buttons mit Symbol und Zahl. |
| **Spaßfaktor** | **3**: Memory Card und Momentum wie heute. | **5**: Feiern, Saison-Ziel und Sticker, innerhalb der Leitplanken aus E-24. | **3**: Story-Karte im Vollbild, sonst sachlich. |
| **Aufwand im Stack** | **4**: 10–12 PT plus 8–10 PT für Teilen-Link und Erinnerungen, also 18–22 PT. | **3**: 20–24 PT. | **1**: 28–35 PT. Dazu Rollen-Migration mit Übergangsphase für alte Store-Builds und neue Routen. |
| **Nachhaltigkeit** | **4**: Bleibt im bestehenden Design-System, keine zweite Schriftwelt. Größte Datei (355 KB), 2 Familien / 147 KB, Glas und Blur kosten auf schwachen Android-Geräten Leistung. | **4**: Kleinste Datei (226 KB) und Schrift (1 Familie / 39 KB). Aber ein zweites Typo- und Farbsystem muss parallel gepflegt werden. | **3**: 292 KB, 2 Familien / 89 KB, ohne Glas und Blur am sparsamsten im Rendering. Aber neue IA: alle Routen, Tests und Specs neu. |
| **Risiko** | **4**: Bekannte Muster. Offen sind Kontrast in Liquid Glass und die Aufgabe knapp unter der Tab-Bar. | **3**: Gamification darf nicht nerven; die Startseite war zuerst überladen (E-40). | **2**: Alle müssen umlernen. Das Rollenmodell ändert RLS, und PROJ-7 sowie PROJ-3 werden umgestoßen. |
| **Summe (ungewichtet)** | **19** | **18** | **14** |

- Für alle Varianten kommt Paket 0 „Store & Recht“ dazu (ca. 18 PT). Es entscheidet also nicht zwischen ihnen.
- Annahme: Die 8–10 PT für Teilen-Link und Erinnerungen fallen in B und C ebenso an. Die Schätzung von Technik weist das dort nicht getrennt aus.
- Die Dateigrößen der Mockups enthalten den Demo-Code und sagen über die App nur bedingt etwas aus.

## 3. Ergebnisse der simulierten Usability-Tests

Personas: Lena (Organisatorin), Jonas (Screenreader und Tastatur), Mira (spontan), Tobias (Elternteil, Farbsehschwäche). Stand nach dem Nachtest in Runde 2.

| Aufgabe | A | B | C | Kommentar |
|---|---|---|---|---|
| T1 Termin finden | ja (4 Klicks) | ja (4) | ja (3 bzw. 2) | C zeigt Summen je Option, bei Gleichstand aber keine Marke. |
| T2 Aufgaben verteilen | ja | ja | ja | „1 von 7 erledigt“ ist sofort sichtbar. |
| T3 Beitritt per Code, nur Tastatur | ja | ja | ja | Fehler und Erfolg werden angesagt. |
| T4 Abstimmen, nur Tastatur | ja* | ja* | ja* | *Fokusverlust nach der Feier behoben (H-1); die Aufgabe selbst lief nicht erneut. |
| T5 Vorschlag mit Link | teilweise | teilweise | teilweise | Das Link-Feld ist da, der Link wird aber nicht angezeigt. |
| T6 Erinnerung teilen | teilweise | teilweise | teilweise | Offen: Memory Card ohne „Teilen“, im Detail fehlt das Zitat (M-3). |
| T7 Verfügbarkeit, Farbsehschwäche | teilweise* | teilweise* | ja | *„Beste Zeiträume“ behebt den Befund; T7 lief nicht erneut. |
| T8 Abhaken, einhändig | ja | ja | ja | 44-px-Ziel und „Rückgängig“ vorhanden. In A und C liegt die Aufgabe knapp unter der Tab-Bar. |

**Fazit Design (simuliert):** C löst die Kernaufgaben am schnellsten, A ist das risikoärmste Fundament, B hat die besten Erfolgsmomente.

**Behoben in Runde 2:**
- Scrollen (K-1)
- Fokusverlust (H-1)
- „Rückgängig“ (H-2)
- „Beste Zeiträume“
- Reihenfolge der Startseite in B
- 44-px-Ziele
- Link-Feld

**Noch offen:**
- „Rückgängig“ ist per Tastatur in 6 s nicht erreichbar (WCAG 2.2.1).
- Teilen der Memory Card (M-3).
- Der Link aus dem Vorschlag wird nicht angezeigt.
- Schriftgrößen in px statt rem (M-4).
- In C: keine Marke bei Gleichstand; Zusage auf „Anstehend“ nur als „Zusagen“; Meldung „Vorschlag“ statt „Idee“.

## 4. Empfehlung der Leitung

**Wir bauen auf A und übernehmen die drei stärksten Bausteine aus C und B. Die neue Navigation von C bauen wir jetzt nicht.**

**Begründung nach Entscheidungsprinzip:**
1. **Nutzerwert:** C gewinnt im Test. Der Vorsprung kommt aber vor allem von zwei Bausteinen, nicht von der neuen Navigation: der Terminabstimmung mit Summen und den großen Antwort-Buttons. Beide passen in A. Mit „Beste Zeiträume“ hat A den Abstand bei T1 schon auf einen Klick verkürzt.
2. **Einfachheit:** A muss niemand umlernen, und Rollen sowie Board bleiben verständlich. Die Rollenvereinfachung aus C (BL-08) bringt wenig (RICE 4,0) bei hohem Migrationsrisiko.
3. **Nachhaltigkeit:** A bleibt in einem Design-System und einer Codebasis-Struktur. B und C brächten zweite Schrift- und Farbwelten bzw. neue Routen, die dauerhaft gepflegt werden müssten.
4. **Aufwand:** A kostet 18–22 PT statt 28–45 PT (Annahme) und lässt Kapazität für Paket 0.

**Übernahmen in A:**

| Woher | Baustein | Backlog | Bedingung |
|---|---|---|---|
| C | Terminabstimmung als **optionaler** Schritt neben „Beste Zeiträume“; Admin bzw. Initiator:in legt weiter direkt fest | BL-04 | `/refine PROJ-7` mit Freigabe, da die Entscheidung „kein Doodle-Style“ fällt. Marke „Meiste Zusagen“ und Hinweis bei Gleichstand nachrüsten. |
| C | Große Antwort-Buttons mit Symbol, Text und Zahl für Verfügbarkeit und Zusage (≥ 44 px, nie nur Farbe) | BL-03, BL-12 | Zusage überall mit drei Antworten, auch auf Start |
| C | Start beantwortet zuerst „Was muss ich tun?“: Aufgaben, fehlende Stimme, Zusage über dem ersten Bildschirm | BL-05 | Aufgabe nicht unter der Tab-Bar |
| B | Stapel-Abstimmung als Einstieg über „Deine Stimme fehlt“, Liste bleibt Standard | BL-16 (UI-Teil) | Leitplanken aus E-20 |
| B | Reaktionen auf Kommentare | BL-10 | Fester Emoji-Satz, keine Zähler je Person |

**Nicht übernommen:**
- Neue IA und Fluss (BL-18) sowie das neue Rollenmodell (BL-08). Erst prüfen, wenn echte Tests zeigen, dass A ohne sie scheitert.
- Saison-Ziel (BL-11), weil die Wirkung unsicher ist.
- Nunito und Bricolage Grotesque.
- „Erlebt“: A bleibt bei „Abgeschlossen“ (E-18), weil der Test dazu nichts ergab.

**Reihenfolge der Backlog-Pakete:**
1. **Paket 0 „Store & Recht“:** BL-21, BL-23, BL-24, BL-22, BL-25, BL-26 (ca. 18 PT). Kommt vor jeder weiteren Store-Einreichung.
2. **Paket 1 „Einladen“:** BL-01, BL-15, BL-19 (Nullmessung der KPIs).
3. **Paket 2 „Verbindlich“:** BL-03, BL-27, BL-02, BL-20, BL-16. Erinnerungen sind standardmäßig aus (E-31).
4. **Paket 3 „Überblick“:** BL-05, BL-14, BL-06, BL-07, BL-09, mit den Start-Regeln aus C.
5. **Paket 4 „Mitreden“** (früher „Nach Test“): BL-04 aus C, Stapel-Einstieg aus B, BL-10.
6. BL-12 (Barrierefreiheit) und die Umsetzungshinweise aus `Backlog.md` laufen in jedem Paket mit.

**Ergänzungen für das Backlog**, noch nicht eingetragen:
- Die Berechnung „Beste Zeiträume“ gehört in die Edge Function `get-group-availability` (E-39).
- BL-15 zeigt laut E-32 nur den Gruppennamen, keine Mitgliederzahl.
- Die offenen Testmängel (M-3, Link-Anzeige, Rückgängig per Tastatur, rem) gehören in die Specs der betroffenen Features.

**Nächster Schritt im Repo-Workflow:** Es gilt Human-in-the-Loop: Jeder Schritt startet erst nach Freigabe der Nutzer:in.
1. `/write-spec` für „Konto löschen & Daten exportieren“ (nächste freie ID PROJ-19 laut `features/INDEX.md`), danach `/write-spec` für „Melden, Ausblenden, Blockieren“.
2. Kleine Pflichten über `/refine`: `/refine PROJ-2` für die rechtlichen Links bei der Registrierung, `/refine PROJ-8` für Profil-Links und den Kalender-Scope. Die Security-Header (BL-25) laufen als `chore` mit `/deploy`-Checkliste.
3. Danach `/write-spec` für Teilen-Link + Deep Link, Zusage/RSVP und Termin-Erinnerungen, sowie `/refine PROJ-5` für die Status-Begriffe und `/refine PROJ-7` für Terminabstimmung und „Beste Zeiträume“.

## 5. Retrospektive

**Was gut lief**
- **Gemeinsamer Kern (E-06):** Ein Fix im Kern wirkte in allen drei Mockups. Beide Korrekturrunden kosteten deshalb wenig, und es blieben 2 von 3 Runden genutzt.
- **Eine kurze Review-Runde hat gereicht:** Drei Teams fanden unabhängig die Namenskollision „Erinnerungen“ (E-22); Konflikte wurden mit Rolle und Einwand entschieden.
- **Pflichten früh erkannt:** Sicherheit & QA hat Store-Blocker (Konto löschen, Melden, rechtliche Links) vor der Umsetzung belegt. Sie stehen jetzt vor allen Features.
- **Ehrliche Marken:** „Vorschlag“ und „Neu“ (E-25) zeigen, was es im Datenmodell noch nicht gibt. Das hat Lücken wie „Aufgabe übernehmen“ sichtbar gemacht.
- **Barrierefreiheit gemessen statt behauptet:** Kontraste nachgerechnet, Tastatur-Durchläufe, Reflow bei 320 px.

**Was nicht gut lief**
- **Scroll-Fehler zu spät gefunden:** Der kritische Fehler K-1 (kein Scrollen per Touch oder Maus) fiel erst in den simulierten Usability-Tests auf. Der Prüf-Runner testete nur horizontales Scrollen, und die Tastatur-Prüfung verdeckte den Fehler, weil der Browser dem Fokus nachscrollt.
- **Rechte-Abweichungen erst im QA-Review:** Die Mockups setzten Rechte nach Gefühl um. Erst Sicherheit & QA verglich sie mit PROJ-5 und PROJ-14 (E-28).
- **Veraltete Ist-Fakten in Discovery:** Das Vorschlagslimit war längst entfernt, und der Code hat seit 2026-10-30 zehn statt sechs Zeichen. Die „Post-Deployment“- und „Security-Fixes“-Abschnitte der Specs wurden zu spät gelesen.
- **Aufwand zu früh geschätzt:** Die Leitung schätzte vor Technik, deshalb waren große Korrekturen nötig (BL-04 von 8 auf 4,5 PT, BL-01 von 4 auf 5,5 PT).
- **Dokumente laufen auseinander:** Entscheidungen im Log (z. B. E-32, E-26) erreichten Backlog und Anforderungen nicht automatisch.

**Was wir beim nächsten Mal anders machen**
1. **Smoke-Test mit echter Eingabe** (Mausrad, Touch, Tastatur) vor der ersten Review. Erst wenn er grün ist, starten die Tests nach der Definition of Done.
2. **Rechte-Matrix aus den Specs als Eingangsartefakt in Phase 2**, die Design und Technik verbindlich übernehmen.
3. **Ist-Fakten immer gegen Code, Migrationen und die letzten Spec-Abschnitte prüfen**, nicht nur gegen „Decisions“ und „Out of Scope“.
4. **Technik schätzt den Aufwand, bevor die Leitung den RICE-Wert setzt.**
5. **Entscheidungen verlinken:** Jede Log-Entscheidung nennt die betroffenen Dateien, und wer sie trifft, pflegt sie dort nach.
6. **Früher testen:** ein grober Klick-Prototyp direkt nach Phase 3, nicht erst nach der vollständigen Umsetzung.

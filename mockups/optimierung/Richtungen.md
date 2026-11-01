# Phase 3 – Design-Sprint: drei Richtungen

Grundlage: `Discovery.md`, `Personas.md` (simuliert), `Definition.md`, `Backlog.md`, `Anforderungen.md`, `Anforderungen-Technik.md`.
Fest in allen Richtungen: Name **Mellon** und das Logo (Wortmarke, als SVG nachgezeichnet, Form unverändert).
Gemeinsam in allen Richtungen: dieselben Demodaten (Gruppe „Feierabend-Crew“, 6 Personen, Aktivitäten in jedem Status), Deutsch mit „du“, Light und Dark Mode, Drawer auf Mobile und Dialog auf Desktop, Safe Areas, keine Ranglisten, keine verfallenden Streaks, kein Tracking.

## Pflicht für alle drei (aus Insights 1–5 und Anforderungen)

| Punkt | Umsetzung |
|---|---|
| „Was steht an“ | Persönlicher nächster Schritt ganz oben (BL-05) |
| Einladen | Beitritt per Code bleibt; Teilen-Link und Deep Link als sichtbar markierter **Vorschlag** (BL-01) |
| Erinnerungen | Nur als markierter **Vorschlag** in den Benachrichtigungs-Einstellungen und im Detail (BL-02) |
| Zusage | „Bin dabei / Vielleicht / Kann nicht“ (BL-03), Summen ohne Namensliste der Fehlenden |
| Offline | Globaler Hinweis, Inhalte bleiben lesbar, Schreibaktionen erklären sich (BL-07) |
| Farbe nie allein | Verfügbarkeit und Status immer mit Symbol oder Text und Zahl |
| Ziehgesten | Jede Geste hat eine Button-Alternative (WCAG 2.5.7) |
| Fokus | Sichtbarer Ring mit mind. 3:1, nicht von Tab-Bar oder Plus verdeckt (2.4.11) |
| Kontrast | Text ≥ 4,5:1, große Schrift und UI-Elemente ≥ 3:1, in Light und Dark gemessen |

## A – Evolution: „Mellon, aufgeräumt“

- **Leitidee:** Die heutige App, nur die Lücken geschlossen. Wer Mellon kennt, findet sich sofort zurecht.
- **Navigation:** wie heute. Mobil schwebende Glas-Tab-Bar (Start · Vorschläge · Board · Termine · Profil), Desktop Sidebar 248 px. Glocke oben rechts.
- **Start:** „Was steht an“ (nächster Termin, deine offenen Aufgaben, fehlende Stimmen und Zusagen), darunter Gruppen mit Momentum.
- **Vorschläge:** Karten mit Cover, Serif-Titel, Gold-Kategorie, Fortschritt „3/4“, Herz-Vote mit Feder-Animation. Schnell-Vorschlag (BL-09): nur der Titel ist Pflicht, Schwelle vorbelegt mit Mehrheit.
- **Detail:** Zusage, Termin mit Kalender-Export, Verantwortlichkeiten zum Abhaken und Übernehmen, Umfrage, Kommentare.
- **Board:** Mobil Status-Leiste mit Zählern über allen Spalten (BL-06), Desktop vier Spalten; „Weiter“-Buttons statt nur Menü.
- **Termine:** Liste der Termine plus Terminfindung wie heute (Admin oder Initiator wählt), Verfügbarkeit mit Symbol und Zahl.
- **Status-Begriffe:** „Planung abgeschlossen“ wird „Termin steht“, damit es nicht mit „Abgeschlossen“ verwechselt wird (BL-14).
- **Erfolgsmoment:** Memory Card wird aufgedeckt, Momentum-Level steigt (PROJ-15/17 wie heute).
- **Rollen:** Admin, Redakteur, Beobachter wie heute, per Schalter.
- **Styleguide:** strikt. Einzige Abweichungen sind Barrierefreiheits-Korrekturen (Fokusring mit dunkler Innenkante, `ink-3` nicht für Fließtext), siehe Entscheidungslog.

## B – Spielerisch: „Lagerfeuer“

- **Leitidee:** Planen fühlt sich an wie ein gemeinsames Spiel. Die Gruppe sammelt zusammen, niemand verliert etwas.
- **Navigation:** fünf Ziele wie A, aber Start heißt „Lagerfeuer“: Gruppen-Ziel der Saison (BL-11, kollektiv, ohne Strafe bei Verfehlen), „Was steht an“, Momentum als wachsende Flamme.
- **Vorschläge:** Umschalter „Stapel“ und „Liste“. Im Stapel entscheidest du Karte für Karte: „Bin dafür“ oder „Später“ (Wischen optional, Buttons immer da). Schwelle erreicht: Konfetti und Karte fliegt aufs Board.
- **Detail:** Zusagen als Sticker-Reihe, Aufgaben als „Missionen“ mit Häkchen-Burst, Reaktionen auf Kommentare (BL-10), Umfrage mit animierten Balken.
- **Board:** „Spielfeld“ mit vier Stationen, Karten mit Fortschrittsring.
- **Erfolgsmoment:** Memory Card dreht sich um, Level-Up mit Konfetti, Badge-Pins im Profil, Vorschau auf das Jahres-Wrapped.
- **Rollen:** wie A.
- **Abweichungen vom Styleguide (begründet):** Nunito statt Hanken/Source Serif (gerundet, freundlich, eine Familie spart 100 KB); mehr Farbflächen in Honig und Blush; Gold zusätzlich als Feier-Farbe; größere Radien. Grün bleibt die einzige Aktionsfarbe.

## C – Mutig: „Anstehend“

- **Leitidee:** Nicht die Gruppe steht im Mittelpunkt, sondern was als Nächstes passiert. Die App beantwortet zuerst „Was muss ich tun?“, dann „Was plant ihr?“.
- **Navigation:** drei Ziele plus Erstellen: **Anstehend** (gruppenübergreifend: diese Woche, deine Stimme fehlt, deine Aufgaben, Termine abstimmen), **Gruppe** (ein Fluss statt Board: Ideen → Abstimmung → Planung → Termin steht → Erinnerungen), **Erinnerungen** (Album über alle Gruppen). Profil über den Avatar. Zentraler Plus-Button für Idee, Umfrage, Terminabstimmung. Desktop: drei Spalten (Navigation, Fluss, Detail daneben statt Dialog) und Tastenkürzel.
- **Termine:** Terminabstimmung mit Optionen (BL-04). Gastgeber:in schlägt 2–3 Zeiträume vor, alle antworten Ja/Vielleicht/Nein; Kalender-Verfügbarkeit dient nur als Hinweis.
- **Rechtemodell (BL-08):** Admin und Mitglied, dazu Gastgeber:in je Aktivität (wer vorschlägt oder übernimmt). Beobachter und Redakteur entfallen. Schalter: Mitglied · Gastgeber:in · Admin.
- **Erfolgsmoment:** „Erinnerung entsteht“ als Story-Karte im Vollbild, Level-Up der Gruppe.
- **Abweichungen vom Styleguide (begründet):** Bricolage Grotesque als Display-Schrift statt Source Serif (markanter, kompakter), Hanken bleibt für UI; dunkles Waldgrün (`surface-ink`) als große Fläche; flache Karten mit Linien statt Glas und Schatten (weniger Rechenlast, ruhiger); Navigation anders als in Abschnitt 5.

## Vergleich vor der Umsetzung

| | A Evolution | B Spielerisch | C Mutig |
|---|---|---|---|
| Neue Konzepte | wenige | Gruppen-Ziel, Stapel-Abstimmung, Reaktionen | neue IA, Terminabstimmung, neues Rechtemodell |
| Risiko | gering | mittel (Gamification darf nicht nerven) | hoch (Umlernen, Migration) |
| Aufwand im Stack | M | M–L | L |

## Ergebnis der Review-Runde 1 (alle vier Teams)

Eine Runde genügte; alle Einwände wurden aufgelöst oder als Pflichtänderung übernommen (Details im Entscheidungslog E-18 bis E-27).

**Für alle drei ergänzt**
- Impuls nach dem Termin (BL-20): „Wie war’s?“ mit Abschließen und Fotos, sobald ein Termin vorbei ist.
- Gruppenvorschau beim Link-Beitritt (BL-15), wie der Link selbst als **Vorschlag** markiert.
- Profil: „Konto & Datenschutz“ mit Daten exportieren und Konto löschen (Store-Pflicht); „Melden“ an Kommentaren.
- Fehlende Zusagen, Absagen und fehlende Stimmen nur als Zahl, nie als Namensliste.
- Feiern: höchstens 1 s, einmalig, ohne Ton, nie blockierend; bei „Bewegung reduzieren“ nur Überblenden.
- Wer etwas nicht darf, sieht einen kurzen Grund statt eines stumm fehlenden Buttons.
- Funktionen ohne Datenmodell (Aufgabe übernehmen, Zusage, Reaktionen, Gruppen-Ziel, Terminabstimmung) tragen eine kleine Marke „Neu“; Teilen-Link und Erinnerungen tragen „Vorschlag“.

**A:** Status „Zu planen · In Planung · Termin steht · Abgeschlossen“. Schwelle im Schnell-Vorschlag mit Satz erklärt („Mehrheit: 4 von 6 Stimmen“). „Weiter“-Buttons mit Ziel („Weiter: Termin finden“) auch mobil. In der Terminfindung kann jede Person eigene „Kann nicht“-Tage markieren. Gold-Kategorie als Goldfläche mit dunklem Text.

**B:** Status mit „Erlebt“. Stapel nur als Einstieg über „Deine Stimme fehlt bei X“, Standard bleibt die Liste; „Später“ ist neutral, kein Auto-Weiterblättern, endet mit „Alles gesehen“. Saison-Ziel ohne Countdown und ohne Scheitern-Zustand. Badge-Pins nur im eigenen Profil. Nutzerinhalte heben sich in Nunito über Gewicht und Größe ab.

**C:** Navigation „Anstehend · Gruppe · Album“; Erinnerungen vor Terminen heißen „Vorab-Hinweise“. Fluss-Stufen bilden genau die Status ab: Ideen → Zu planen → In Planung → Termin steht → Erlebt, je mit Zähler und Buttons. Terminabstimmung optional, Antworten „Passt / Passt vielleicht / Passt nicht“, getrennt von der Zusage; Admin kann weiter direkt festlegen. Gastgeber:in nur bei freier Aktivität oder per Zuweisung durch Admin. Tastenkürzel abschaltbar, Fokus springt auf die Detail-Überschrift, „Erstellen“ steht als Text am Plus.

**Aufwand (Technik):** A 10–12 PT (+ 8–10 PT für Teilen-Link und Erinnerungen), B 20–24 PT, C 28–35 PT.

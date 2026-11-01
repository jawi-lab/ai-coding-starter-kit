# Prüfbericht – Definition of Done

Stand: 2026-11-01, letzter vollständiger Lauf 01:39 UTC. Werkzeug: `tests/dod.cjs` mit `tests/dod.config.json`, Chromium 153 (vorinstalliert, headless). Rohdaten: [`tests/results.json`](tests/results.json). Aufruf aus dem Repo-Root:

```bash
NODE_PATH=$(npm root -g) node mockups/optimierung/tests/dod.cjs          # alle drei, mit Screenshots
NODE_PATH=$(npm root -g) node mockups/optimierung/tests/dod.cjs a --no-shots
```

Nach jedem Lauf waren alle Browser-Prozesse beendet (geprüft mit `ps`).

## Ergebnis auf einen Blick

| DoD-Punkt | A Evolution | B Spielerisch | C Mutig |
|---|---|---|---|
| 1 Öffnet per `file://` ohne Server | bestanden | bestanden | bestanden |
| 2 Keine Konsolenfehler, keine externen Anfragen | bestanden | bestanden | bestanden |
| 3 Pflicht-Screens per Klick erreichbar, kein Klickziel ins Leere | bestanden | bestanden | bestanden |
| 4 375 / 768 / 1440 px ohne horizontales Scrollen | bestanden | bestanden | bestanden |
| 4b Vertikales Scrollen funktioniert (ergänzt nach E-37) | bestanden | bestanden | bestanden |
| 5 Kontrast AA Light + Dark, Tastatur, Fokusring | bestanden | bestanden | bestanden |
| 6 Dateigröße ≤ 1 MB | bestanden | bestanden | bestanden |

Bestanden heißt: Die automatische Prüfung meldet keinen Fehler, und die Screenshots wurden zusätzlich angesehen (Kontaktbögen aller 244 Bilder). Grenzen der Messung stehen am Ende und als offene Mängel M-1 bis M-10 im Entscheidungslog.

## 1. Öffnen per `file://`

Jede Datei wird direkt als `file:///…/mockup-x.html` geladen. Geprüft: `location.protocol === 'file:'` und gerenderte App (mehr als 10 Elemente in `#app`). Routing läuft über den Hash (`#/route?param=…`), daher kein Server nötig.

## 2. Konsole und Netzwerk

| | A | B | C |
|---|---|---|---|
| Konsolenfehler und -warnungen über den gesamten Lauf | 0 | 0 | 0 |
| Anfragen außer `file:` und `data:` | 0 | 0 | 0 |

Zusätzlich verbietet eine Content-Security-Policy im `<meta>`-Tag jede Verbindung (`default-src 'none'; connect-src 'none'`); Schriften und Logo sind eingebettet.

## 3. Erreichbarkeit und tote Klickziele

Methode: Breitensuche ab dem Onboarding über alle Links in der App, über Inhalte geöffneter Dialoge (z. B. „Erstellen“ in C) und über Aktionen, die einen Erfolgsmoment auslösen. Danach wurde jedes Klickziel jeder Route einzeln angeklickt (Seite vorher frisch geladen) und geprüft, ob sich Route, Inhalt, Fokus oder eine Meldung ändert. Zusätzlich: Jede `data-action` existiert im Kern oder in der Variante, jeder Button hat eine Aktion oder ist ein Absende-Button – in allen fünf Zuständen.

| | A | B | C |
|---|---|---|---|
| Pflicht-Screens laut Auftrag (Routen) | 16 von 16 erreicht | 17 von 17 erreicht | 16 von 16 erreicht |
| Einzeln angeklickte Klickziele | 342 | 359 | 334 |
| Klickziele ohne Wirkung oder mit Fehler | 0 | 0 | 0 |
| Unbekannte Aktionen, Buttons ohne Aktion (alle Zustände) | 0 | 0 | 0 |

Zuordnung der Pflicht-Screens: siehe `required` in `tests/dod.config.json` (in C ersetzt der „Fluss“ das Kanban-Board, „Anstehend“ die Gruppenübersicht).

## 4. Breiten und Scrollen

Je Breite (375, 768, 1440 px), Route und Farbmodus: `scrollWidth` von Dokument und Scrollbereich sowie alle Elemente, die über den App-Rahmen hinausragen.

| | A | B | C |
|---|---|---|---|
| Geprüfte Kombinationen (Breite × Route × Modus) | 96 | 102 | 96 |
| Horizontaler Überlauf | 0 | 0 | 0 |
| Seiten mit vertikalem Inhalt, per Mausrad gescrollt | 20 | 21 | 23 |
| Scrollbereich ragt aus dem Rahmen / scrollt nicht | 0 | 0 | 0 |

Hinweis: Die Prüfung auf vertikales Scrollen kam erst nach den simulierten Usability-Tests dazu (E-37). Bis dahin war der Inhalt unterhalb des ersten Bildschirms nicht per Maus oder Touch erreichbar; der Fehler ist behoben.

## 5. Kontrast, Tastatur, Fokus

### Kontrast (WCAG 2.2 AA)

Gemessen wurde jedes sichtbare Textelement gegen seinen tatsächlichen Hintergrund (Farben der Vorfahren zusammengesetzt, bei Verläufen jeder Farbstopp, Deckkraft eingerechnet). Grenzwert 4,5:1, große Schrift (≥ 24 px oder ≥ 18,66 px fett) 3:1. Geprüft bei 375 und 1440 px, alle Routen, für Vorschläge/Fluss und Aktivitäts-Detail zusätzlich in den Zuständen Leer, Laden, Fehler und Offline. Ausgenommen: reine Screenreader-Texte, `aria-hidden`, deaktivierte Elemente.

| | A | B | C |
|---|---|---|---|
| Gemessene Textelemente Light | 1.706 | 1.763 | 1.671 |
| Niedrigster Wert Light | **5,45:1** | **5,71:1** | **5,04:1** |
| Gemessene Textelemente Dark | 1.706 | 1.763 | 1.671 |
| Niedrigster Wert Dark | **5,13:1** | **5,02:1** | **5,13:1** |
| Unterschreitungen | 0 | 0 | 0 |

Im Lauf vorher behobene Kontrastfehler: unsichtbares Einwilligungs-Label (Klassenkollision, 1:1), Text auf Memory Cards und Story-Karte (1,8:1, jetzt eigene dunkle Fläche), Saison-Ziel in B Dark (1,0:1), Offline-Button in C (1,15:1), „Konto löschen“ in A (4,27:1).

### Fokusring (Nicht-Text, 3:1)

| | A | B | C |
|---|---|---|---|
| Gold-Ring allein auf Hintergrund, Light | 2,15:1 | 2,07:1 | 2,76:1 |
| Dunkle Innenkante auf Hintergrund, Light | 15,64:1 | 15,13:1 | 16,12:1 |
| Gold-Ring allein auf Hintergrund, Dark | 9,15:1 | 10,19:1 | 9,06:1 |
| Helle Innenkante auf Hintergrund, Dark | 16,12:1 | 16,66:1 | 16,17:1 |

Der Gold-Ring des Styleguides erreicht im Light-Modus allein nicht 3:1. Deshalb tragen alle drei Varianten eine 2 px breite Innenkante in Textfarbe (E-17); der Ring als Ganzes ist damit deutlich sichtbar.

### Tastatur

| | A | B | C |
|---|---|---|---|
| Tab-Stopps in der App mit sichtbarem Fokus (von 30 Tabs ab Steuerleiste) | 28 / 28 | 28 / 28 | 28 / 28 |
| Enter auf dem Abstimmungs-Button stimmt ab | ja | ja | ja |
| Fokus springt beim Öffnen in den Dialog | ja | ja | ja |
| Fokusfalle hält Tab im Dialog (12 Tabs) | ja | ja | ja |
| Esc schließt den Dialog | ja | ja | ja |

Zusätzlich umgesetzt und in den Usability-Nachtests (simuliert) geprüft: Fokus wird nie von Tab-Bar oder Plus-Button verdeckt (WCAG 2.4.11), Hintergrund hinter Dialogen ist `inert`, Fokus kehrt nach dem Schließen zurück oder landet auf der Überschrift, Tastenkürzel in C sind abschaltbar (2.1.4), „Bewegung reduzieren“ schaltet Konfetti, Kartendrehung und Schimmer ab.

## 6. Dateigröße

| Datei | Bytes | KB | davon Schriften (Base64) | Grenze 1 MB |
|---|---|---|---|---|
| `mockup-a.html` | 363.037 | 354,5 | Hanken Grotesk + Source Serif 4, ca. 196 KB | eingehalten |
| `mockup-b.html` | 231.059 | 225,6 | Nunito, ca. 52 KB | eingehalten |
| `mockup-c.html` | 299.090 | 292,1 | Bricolage Grotesque + Hanken Grotesk, ca. 119 KB | eingehalten |

Keine Rastergrafik: Logo als SVG (2,2 KB), Cover als CSS-Verläufe, Icons als Inline-SVG.

## Screenshots

`screenshots/a`, `screenshots/b`, `screenshots/c`: alle Pflicht-Screens bei 375 und 1440 px, jeweils Light und Dark (A 64, B 68, C 64 Bilder), dazu je 16 Zustandsbilder (Leer, Laden, Fehler, Offline für zwei Screens, 375 px, Light und Dark). Insgesamt 244 JPEG-Dateien, 9,1 MB. Alle wurden als Kontaktbogen angesehen; Befunde daraus (abgeschnittene Inhalte, unsichtbarer Button-Text, Silbentrennung im Album, überlappender Plus-Button) sind behoben oder als Mangel geführt.

## Grenzen der Prüfung

- Nur Chromium. Kein WebKit (laut Repo-Regel nicht herunterladen) und kein Firefox. Safari-Verhalten (z. B. `backdrop-filter`, `inert`) ist ungeprüft (M-8).
- Kein echter Screenreader. Die Nutzung durch die Persona Jonas ist simuliert.
- Die Kontrastmessung sieht keine Pseudo-Elemente. Texte auf Verläufen liegen deshalb auf eigenen Flächen, die die Messung erfasst (M-7).
- Schriftvergrößerung über die Systemeinstellung ist nicht geprüft; die Mockups nutzen px (M-3).
- „Kein Klickziel ins Leere“ wurde als „jedes Klickziel verändert Route, Inhalt, Fokus oder zeigt eine Meldung“ geprüft. Viele Aktionen sind Demo-Meldungen (z. B. Kalenderdatei, Fotoauswahl); sie sind als „Demo“ bzw. „Vorschlag“ beschriftet.

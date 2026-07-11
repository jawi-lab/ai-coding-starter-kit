# PROJ-14: Umfragen in Aktivitäten (sichtbar, Mehrfachauswahl)

## Status: Planned
**Created:** 2026-07-11
**Last Updated:** 2026-07-11

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Datenbank, RLS, Realtime
- PROJ-2 (Authentifizierung & User Accounts) — eingeloggter Nutzer
- PROJ-3 (Gruppe & Mitglieder-Management) — Rollen (admin / editor / observer), Mitgliederliste für Avatare
- PROJ-4 (Aktivitäts-Vorschläge & Voting) — `activities`-Tabelle, Status-Modell
- PROJ-6 (Aktivitäts-Detail) — Detail-Sheet als Zugangspunkt (Umfragen sind eine eigene Sektion darin)
- PROJ-12 (Benachrichtigungen & Einstellungen) — Trigger-System für den neuen Typ `umfrage_erstellt`

## User Stories
- Als Gruppenmitglied möchte ich innerhalb einer Aktivität eine Umfrage mit einer Frage und mehreren Antwortoptionen starten, damit die Gruppe offene Detailfragen der Planung demokratisch klären kann (z. B. „Welches Restaurant?", „Wer bringt was mit?").
- Als Gruppenmitglied möchte ich bei einer Umfrage beliebig viele Antwortoptionen ankreuzen und meine Auswahl jederzeit ändern, damit ich flexibel mitentscheiden kann.
- Als Gruppenmitglied möchte ich in Echtzeit sehen, wie die Gruppe abstimmt und wer für welche Option gestimmt hat, damit ich den Stand der Meinungsbildung transparent erkenne.
- Als Ersteller oder Admin möchte ich eine Umfrage wieder löschen können, damit versehentliche oder erledigte Umfragen die Aktivität nicht zumüllen.
- Als Gruppenmitglied möchte ich benachrichtigt werden, wenn jemand in einer meiner Aktivitäten eine neue Umfrage startet, damit ich nichts Wichtiges verpasse.

## Out of Scope
- **Anonyme Umfragen** — Umfragen sind bewusst nicht anonym; jede/r sieht, wer wie gestimmt hat.
- **Von Mitgliedern ergänzte Antwortoptionen** — nur der Ersteller legt die Optionen fest; niemand kann nachträglich Optionen hinzufügen.
- **Bearbeiten einer bestehenden Umfrage** (Frage oder Optionen ändern) — bewusst ausgeschlossen; bei Fehlern wird gelöscht und neu erstellt.
- **Schließen / Deadline / Auto-Close** — Umfragen bleiben offen bis zum Löschen; keine Zeitsteuerung.
- **Einfachauswahl-Modus (nur eine Option)** — es gibt ausschließlich Mehrfachauswahl.
- **Terminfindung mit Datum/Uhrzeit** — separates Feature, PROJ-7 (Terminfindung & Kalender-Export).
- **Umfragen auf Vorschlägen im Status `vorschlag`** — dort läuft das Vorschlags-Voting (PROJ-4); Umfragen gibt es erst ab `zu_planen`.
- **Kommentare / Diskussion an einzelnen Optionen** — Diskussion läuft über die bestehende Kommentar-Sektion (PROJ-6).
- **Push/E-Mail-Kanal-Logik** — Zustellung und User-Einstellungen liegen bei PROJ-12; PROJ-14 löst nur den Trigger aus.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Umfrage erstellen
- [ ] Angenommen die Aktivität hat Status `zu_planen`, `in_planung` oder `planung_abgeschlossen`, wenn ein Gruppenmitglied die Umfragen-Sektion im Aktivitäts-Detail öffnet, dann sieht es einen Button „Umfrage starten".
- [ ] Angenommen der Nutzer tippt „Umfrage starten", dann öffnet sich ein Formular mit einem Frage-Feld (Pflicht, 1–255 Zeichen) und mindestens 2 Options-Feldern (je max. 100 Zeichen), mit der Möglichkeit weitere Optionen bis maximal 12 hinzuzufügen.
- [ ] Angenommen der Nutzer schickt das Formular mit leerer Frage ab, dann wird eine Validierungsfehlermeldung am Frage-Feld angezeigt.
- [ ] Angenommen der Nutzer hat weniger als 2 ausgefüllte Optionen, wenn er speichert, dann wird eine Validierungsfehlermeldung angezeigt („Mindestens 2 Antwortoptionen nötig") und leere Options-Felder werden ignoriert.
- [ ] Angenommen der Nutzer gibt zwei identische Optionstexte ein, wenn er speichert, dann wird eine Validierungsfehlermeldung angezeigt („Optionen dürfen sich nicht wiederholen").
- [ ] Angenommen alle Pflichtangaben sind gültig, wenn der Nutzer „Speichern" tippt, dann wird die Umfrage angelegt und erscheint sofort oben in der Umfragen-Sektion.
- [ ] Angenommen der Aktivitätsstatus ist `vorschlag`, dann ist die Umfragen-Sektion nicht sichtbar.

### Abstimmen
- [ ] Angenommen eine offene Umfrage existiert und der Nutzer ist Gruppenmitglied (inkl. Beobachter), wenn er auf eine Option tippt, dann wird seine Stimme gespeichert und die Option als ausgewählt markiert (optimistic update).
- [ ] Angenommen der Nutzer hat eine Option bereits gewählt, wenn er erneut darauf tippt, dann wird seine Stimme für diese Option entfernt.
- [ ] Angenommen der Nutzer wählt mehrere Optionen, dann werden alle gewählten Optionen gleichzeitig als seine Stimmen gespeichert (Mehrfachauswahl, keine Obergrenze pro Person).
- [ ] Angenommen der Nutzer hat abgestimmt, dann kann er seine Auswahl jederzeit ändern, solange die Umfrage nicht gelöscht wurde.
- [ ] Angenommen ein anderes Mitglied stimmt ab, während der Nutzer die Aktivität geöffnet hat, dann aktualisieren sich Balken, Stimmenzahl und Avatare in Echtzeit ohne Reload (Supabase Realtime).

### Ergebnisse anzeigen
- [ ] Angenommen der Nutzer öffnet die Umfrage, dann zeigt jede Option einen Fortschrittsbalken (Anteil), die absolute Stimmenzahl und die Avatare der Abstimmenden.
- [ ] Angenommen eine Option hat mehr als 5 Stimmen, dann werden die ersten Avatare angezeigt und die übrigen als „+N" zusammengefasst.
- [ ] Angenommen der Nutzer betrachtet die Umfrage, dann zeigt die Kopfzeile die Frage, den Ersteller-Namen und die Beteiligung („X von Y Mitgliedern haben abgestimmt").
- [ ] Angenommen der Nutzer hat für eine Option gestimmt, dann ist diese Option für ihn visuell als „ausgewählt" hervorgehoben.
- [ ] Angenommen die Umfrage ist nicht anonym, dann ist für jede Stimme sichtbar, welches Mitglied sie abgegeben hat.

### Umfrage löschen
- [ ] Angenommen der Nutzer ist Ersteller der Umfrage oder Admin, dann sieht er ein Löschen-Icon an der Umfrage; andere Mitglieder sehen es nicht.
- [ ] Angenommen er tippt auf Löschen, dann erscheint ein Bestätigungsdialog mit dem Hinweis, dass alle Stimmen entfernt werden.
- [ ] Angenommen er bestätigt, dann wird die Umfrage inkl. aller Optionen und Stimmen entfernt und verschwindet für alle Mitglieder in Echtzeit.

### Status-Verhalten
- [ ] Angenommen die Aktivität hat Status `abgeschlossen`, dann sind alle Umfragen nur lesbar — kein Abstimmen, kein Erstellen, kein Löschen.

### Benachrichtigung
- [ ] Angenommen ein Mitglied erstellt eine Umfrage, dann erhalten alle anderen Mitglieder der Aktivität eine Benachrichtigung („[Name] hat eine Umfrage in [Aktivität] gestartet: [Frage]") über das PROJ-12-Trigger-System (Typ `umfrage_erstellt`).
- [ ] Angenommen ein Mitglied gibt eine einzelne Stimme ab, dann wird keine Benachrichtigung ausgelöst.

### Leerzustand
- [ ] Angenommen die Aktivität hat noch keine Umfragen und Status ≥ `zu_planen`, dann wird der Leerzustand „Noch keine Umfragen – starte die erste!" mit einem Erstell-Button angezeigt.

### Fehlerverhalten
- [ ] Angenommen die API ist beim Erstellen einer Umfrage nicht erreichbar, dann erscheint eine Toast-Fehlermeldung und die Eingaben bleiben erhalten.
- [ ] Angenommen der Abstimm-Request schlägt fehl, dann wird die Auswahl auf den vorherigen Stand zurückgesetzt (Rollback) und ein Toast-Hinweis erscheint.
- [ ] Angenommen die Umfrage wurde von jemandem gelöscht, während der Nutzer gerade abstimmt, dann erscheint ein Toast „Diese Umfrage wurde gelöscht" und die Umfrage verschwindet aus der Ansicht.

## Edge Cases
- **Mitglied verlässt die Gruppe:** Seine abgegebenen Stimmen bleiben zählend erhalten; der Avatar wird als „Ehemaliges Mitglied" dargestellt (analog Kommentare PROJ-6). Beim harten Account-Löschen verschwindet die Stimme (FK-Cascade).
- **Umfrage wird gelöscht, während jemand abstimmt:** Abstimm-Request läuft ins Leere → Toast „Diese Umfrage wurde gelöscht"; Realtime entfernt die Umfrage aus der Ansicht.
- **Gleichzeitige Stimmabgabe zweier Nutzer:** Kein Konflikt — jede Stimme ist ein eigener Datensatz; DB-Unique-Constraint `(option_id, user_id)` verhindert Doppelstimmen auf dieselbe Option.
- **Nutzer wählt 0 Optionen ab:** Erlaubt — der Nutzer darf keine Option gewählt haben; er zählt dann nicht in die Beteiligungszahl.
- **Doppelte Optionstexte beim Erstellen:** Werden bereits im Formular abgewiesen (Validierung).
- **Sehr lange Optionstexte:** Auf max. 100 Zeichen begrenzt; Anzeige mit Umbruch (kein Abschneiden, da für das Verständnis relevant).
- **Sehr lange Frage:** Auf 255 Zeichen begrenzt (Validierung im Formular und DB-CHECK).
- **Viele Umfragen in einer Aktivität:** Kein hartes Limit; neueste oben, Sektion scrollt mit; keine Collapse-Mechanik im MVP.
- **Beobachter:** Darf Umfragen erstellen, abstimmen und löschen (nur eigene) — wie jedes Mitglied; das Rollenkonzept beschränkt Beobachter nur beim Vorschlags-Erstellen (PROJ-4), nicht hier.

## Technical Requirements
- Supabase Realtime auf den Umfrage-Tabellen (gefiltert nach `activity_id`) für Live-Stimmen und Live-Neuanlage/-Löschung, konsistent mit `activity_comments` (PROJ-6).
- Vote-Uniqueness: DB-Constraint (unique per `option_id` + `user_id`).
- RLS auf allen neuen Tabellen: nur Gruppenmitglieder der zugehörigen Aktivität dürfen lesen/schreiben; Löschen nur Ersteller oder Admin.
- Neuer Benachrichtigungs-Typ `umfrage_erstellt` im PROJ-12-Trigger-System (an alle Aktivitäts-Mitglieder außer Ersteller).
- Optimistic Update beim Abstimmen mit Rollback bei Fehler (wie PROJ-4-Voting).
- Frage 1–255 Zeichen, Optionstext 1–100 Zeichen, 2–12 Optionen (DB-CHECK + Formular-Validierung).

## Open Questions
_Alle offenen Fragen im Spec-Interview geklärt._

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Umfragen als eigene Sektion im Aktivitäts-Detail (PROJ-6), nicht als eigener Screen | Umfragen sind Teil der Detailplanung einer Aktivität; konsistent mit Kommentaren/Verantwortlichkeiten; kein Kontextwechsel auf Mobile | 2026-07-11 |
| Jedes Gruppenmitglied (inkl. Beobachter) darf Umfragen erstellen, abstimmen und eigene löschen | Demokratisches Grundprinzip der App; Beobachter-Beschränkung gilt nur für Vorschläge (PROJ-4), nicht für Detailplanung | 2026-07-11 |
| Verfügbar ab Status `zu_planen`, nicht bei `vorschlag` | Bei `vorschlag` läuft das Existenz-Voting (PROJ-4); Detailfragen ergeben erst Sinn, wenn die Aktivität feststeht | 2026-07-11 |
| Immer Mehrfachauswahl, kein Single-Modus | Reduziert Konfiguration beim Erstellen; deckt beide Anwendungsfälle ab (bei Einzelentscheidung wählt man eben nur eine Option) | 2026-07-11 |
| Umfragen sind nicht anonym | Transparenz in kleinen Freundesgruppen ist gewünscht; man will sehen, wer schon abgestimmt hat und für was | 2026-07-11 |
| Stimme jederzeit änderbar, Umfrage selbst aber nicht editierbar | Stimmen-Toggle ist Standard-UX; Umfrage-Bearbeitung würde bereits abgegebene Stimmen inkonsistent machen — bei Fehlern: löschen + neu | 2026-07-11 |
| Keine von Mitgliedern ergänzten Optionen | Verhindert unübersichtliche Options-Flut; der Ersteller definiert einen klaren Entscheidungsrahmen | 2026-07-11 |
| Kein Schließen / keine Deadline — Umfrage bleibt offen bis Löschen | Schlankestes MVP; „Schließen" war zusätzlicher Zustand ohne klaren Mehrwert für kleine Gruppen | 2026-07-11 |
| Löschen nur durch Ersteller oder Admin, mit Bestätigung | Schutz vor versehentlichem/böswilligem Löschen fremder Umfragen | 2026-07-11 |
| Frage max. 255 Zeichen, max. 12 Optionen (je max. 100 Zeichen) | Hält Umfragen kompakt und mobil gut darstellbar; 12 Optionen decken realistische Planungsfragen ab | 2026-07-11 |
| Avatare der Abstimmenden an jeder Option | Sichtbarkeit „wer hat wie gestimmt" ist Kern der nicht-anonymen Umfrage; stärker als reine Zahlen | 2026-07-11 |
| 0 gewählte Optionen erlaubt | Ein Mitglied darf die Umfrage sehen, ohne sich festzulegen; erzwungene Auswahl wäre bevormundend | 2026-07-11 |
| Benachrichtigung nur bei neuer Umfrage, nicht pro Stimme | Neue Umfrage ist relevant; jede Einzelstimme wäre Benachrichtigungs-Spam | 2026-07-11 |
| Neueste Umfrage oben, alle aufgeklappt, kein Limit pro Aktivität | Einfachste Darstellung; Missbrauch in kleiner Freundesgruppe unrealistisch | 2026-07-11 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

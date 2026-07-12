# PROJ-14: Umfragen in Aktivitäten (sichtbar, Mehrfachauswahl)

## Status: Deployed
**Created:** 2026-07-11
**Last Updated:** 2026-07-12 (Deployed nach qt-voting-app.vercel.app; QA bestanden + alle 3 Low-Punkte behoben)

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
| Drei neue Tabellen: `activity_polls`, `activity_poll_options`, `activity_poll_votes` (statt Optionen als JSON-Array in einer Zeile) | Jede Stimme ist ein eigener Datensatz → sauberer Unique-Constraint gegen Doppelstimmen, atomares Toggle, feingranulares Realtime und einfache Avatar-Joins. JSON-Optionen würden Zähl-/Stimm-Logik in den Client verlagern | 2026-07-11 |
| Server-Datenbank (Supabase), kein localStorage | Umfragen sind geteilte Gruppendaten mit Live-Sync über mehrere Geräte — genau der Fall, für den localStorage ungeeignet ist | 2026-07-11 |
| Unique-Constraint `(option_id, user_id)` auf `activity_poll_votes` | DB-seitige Garantie gegen Doppelstimmen bei gleichzeitigem Tippen; Client muss keine Race-Conditions behandeln | 2026-07-11 |
| Toggle-Stimme = eine Zeile einfügen / löschen (kein „Update") | Mehrfachauswahl ohne Obergrenze; eine Stimme pro (Option, Nutzer) ist entweder vorhanden oder nicht — Insert/Delete bildet das direkt ab | 2026-07-11 |
| Realtime-Kanal pro Aktivität auf allen drei Tabellen, gefiltert nach `activity_id` | Konsistent mit `activity_comments` (PROJ-6); Options-/Votes-Tabellen tragen `activity_id` denormalisiert mit, damit der Realtime-Filter ohne Join greift | 2026-07-11 |
| Benachrichtigung `umfrage_erstellt` über bestehende `proj10_dispatch_push`-Pipeline (DB-Trigger `after insert` auf `activity_polls` → `send-push` Edge Function) | Nutzt das vorhandene Fan-out (In-App + Push + E-Mail) statt eines Parallelwegs; nur ein neuer Trigger + ein neuer Case in der Edge Function nötig | 2026-07-11 |
| Neuer Event-Wert `umfrage_erstellt` in DB-CHECK (`notifications`), `NOTIFICATION_EVENTS`, `EVENT_META` ergänzen | Der Typ muss überall dort registriert sein, wo Events aufgezählt werden, sonst greifen CHECK-Constraint bzw. Präferenz-Matrix nicht | 2026-07-11 |
| RLS: Lesen/Abstimmen für alle Mitglieder der Gruppe der Aktivität; Löschen nur Ersteller **oder** Gruppen-Admin | Spiegelt das Rollenmodell aus PROJ-3/PROJ-6; Mitgliedschaft wird über die Aktivität → Gruppe aufgelöst | 2026-07-11 |
| Status-Gate (`vorschlag` unsichtbar, `abgeschlossen` read-only) primär im Client, Schreibrechte zusätzlich per RLS abgesichert | UI blendet passend aus; RLS verhindert, dass ein manipulierter Client in gesperrten Status schreibt | 2026-07-11 |
| Ergebnis-Aggregation (Balken-Anteil, Beteiligung, Avatar-Stack „+N") im Client aus den geladenen Vote-Zeilen berechnet | Datenmengen sind klein (≤12 Optionen, kleine Gruppe); erspart DB-Views/RPCs und hält die Realtime-Aktualisierung trivial | 2026-07-11 |
| Optimistic Toggle mit Rollback im `useActivityPolls`-Hook | Gleiches UX-Muster wie PROJ-4-Voting (`useVote`); sofortiges Feedback, Zurücksetzen bei API-Fehler | 2026-07-11 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> Nicht-technische Zusammenfassung: Umfragen sind eine neue Sektion **innerhalb** des bestehenden Aktivitäts-Detail-Sheets (PROJ-6). Es kommt kein neuer Screen dazu. Die Daten liegen in der gemeinsamen Datenbank (Supabase), damit alle in der Gruppe live dasselbe sehen. Für die „Neue Umfrage"-Benachrichtigung nutzen wir exakt die Maschinerie, die schon Vorschläge, Termine und Erwähnungen verschickt.

### A) Component Structure (Visual Tree)

```
Aktivitäts-Detail-Sheet (bestehend, PROJ-6)
+-- ... Kopf, Kommentare, Verantwortlichkeiten (bestehend)
+-- Umfragen-Sektion (NEU)          ← nur sichtbar ab Status "zu_planen"
    +-- Sektions-Kopf ("Umfragen") + Button "Umfrage starten"
    +-- Leerzustand "Noch keine Umfragen – starte die erste!"   (wenn keine da)
    +-- Umfrage-Formular (Sheet/Dialog)   ← beim Erstellen
    |   +-- Frage-Feld (Pflicht, 1–255 Zeichen)
    |   +-- Options-Felder (2–12, je max. 100 Zeichen, dynamisch +/–)
    |   +-- "Speichern" / "Abbrechen"
    +-- Umfrage-Liste (neueste oben)
        +-- Umfrage-Karte
            +-- Kopf: Frage · Ersteller · "X von Y haben abgestimmt" · Löschen-Icon*
            +-- Options-Zeile (pro Option)
            |   +-- Fortschrittsbalken (Anteil)
            |   +-- Options-Text + Stimmenzahl
            |   +-- Avatar-Stack der Abstimmenden ("+N" ab >5)
            |   +-- (antippbar → Stimme an/aus, ausgewählt hervorgehoben)
            +-- Lösch-Bestätigungsdialog
                (*Löschen-Icon nur für Ersteller oder Admin)
```

**Neue Komponenten** (alle unter `src/components/groups/`): `PollSection`, `CreatePollSheet`, `PollCard`, `PollOptionRow`, `DeletePollDialog`.
**Wiederverwendete shadcn/ui-Bausteine:** `progress` (Balken), `avatar` (Abstimmende), `button`, `input`, `form`, `sheet`, `alert-dialog` (Löschen bestätigen), Toaster (`sonner`) für Fehlermeldungen. Keine davon wird neu gebaut.
**Neuer Hook:** `useActivityPolls(activityId)` — lädt Umfragen inkl. Optionen, Stimmen und Abstimmenden-Profilen, hört live mit (Realtime) und stellt `createPoll`, `deletePoll`, `toggleVote` bereit. Analog zu `useActivityComments`.

### B) Data Model (Klartext)

Drei zusammenhängende Tabellen:

```
Eine Umfrage (activity_polls):
- Eindeutige ID
- Gehört zu einer Aktivität
- Erstellt von (Mitglied)
- Frage (1–255 Zeichen)
- Erstellt-Zeitstempel

Eine Antwortoption (activity_poll_options):
- Eindeutige ID
- Gehört zu einer Umfrage (und trägt die Aktivitäts-ID mit — für Live-Filter)
- Options-Text (1–100 Zeichen)
- Reihenfolge (Position, so wie eingegeben)

Eine Stimme (activity_poll_votes):
- Eindeutige ID
- Gehört zu einer Option (und trägt die Aktivitäts-ID mit)
- Von welchem Mitglied
- Zeitstempel
- Regel: Ein Mitglied kann pro Option nur EINE Stimme haben
  (verhindert Doppelstimmen technisch)
```

**Wo gespeichert:** Gemeinsame Datenbank (Supabase), nicht im Browser — damit die Gruppe geräteübergreifend live dasselbe sieht.
**Aufräumen:** Wird eine Umfrage gelöscht, verschwinden automatisch ihre Optionen und Stimmen. Verlässt ein Mitglied die Gruppe, bleiben seine Stimmen zählend erhalten (Avatar = „Ehemaliges Mitglied"); erst beim endgültigen Konto-Löschen fällt die Stimme weg.

### C) Tech Decisions (für PM begründet)

1. **Datenbank statt Browser-Speicher** — Umfragen sind geteilte Gruppendaten mit Echtzeit-Abstimmung. Das ist genau der Fall, für den Supabase da ist; localStorage wäre pro Gerät isoliert und damit unbrauchbar.
2. **Jede Stimme als eigene Zeile** (statt Optionen mit eingebautem Zähler) — so garantiert die Datenbank selbst, dass niemand doppelt für dieselbe Option stimmt, auch wenn zwei Leute gleichzeitig tippen. Zählen und Prozente rechnet die App aus den kleinen Datenmengen live aus.
3. **Live-Aktualisierung** wie bei den Kommentaren — dieselbe bewährte Technik (Supabase Realtime, gefiltert pro Aktivität). Balken, Zahlen und Avatare springen bei allen ohne Neuladen um.
4. **Benachrichtigung über das bestehende System** — „Neue Umfrage" hängt sich an die schon laufende Benachrichtigungs-Pipeline (die auch neue Vorschläge, Termine und Erwähnungen verschickt: In-App-Glocke, Push, optional E-Mail). Wir fügen nur einen neuen Typ `umfrage_erstellt` hinzu; einzelne Stimmen lösen bewusst keine Benachrichtigung aus.
5. **Sicherheit per Row Level Security** — Nur Mitglieder der jeweiligen Gruppe können eine Umfrage sehen und abstimmen; löschen darf nur der Ersteller oder ein Admin. Diese Regeln liegen in der Datenbank, nicht nur im UI — ein manipulierter Client kommt nicht vorbei.
6. **Status-Regeln** — Die Sektion erscheint erst ab „zu_planen" und wird bei „abgeschlossen" schreibgeschützt. Das UI blendet entsprechend aus; die Datenbank sichert die Schreibsperre zusätzlich ab.

### D) Dependencies (Pakete)

**Keine neuen npm-Pakete.** Alles ist vorhanden:
- `progress`, `avatar` — bereits als shadcn/ui-Komponenten installiert (`src/components/ui/`).
- Realtime, Auth, DB — über den bestehenden Supabase-Client.
- `react-hook-form` + `zod` — bereits im Projekt für die Formular-Validierung.

Backend-Artefakte (kein Paket, aber neu anzulegen im `/backend`-Schritt): eine Migration für die drei Tabellen + RLS, ein DB-Trigger auf `activity_polls`, und eine Erweiterung der `send-push` Edge Function um den Fall `umfrage_erstellt`.

## Frontend Implementation (/frontend, 2026-07-12)

### Neue Dateien
- `src/hooks/useActivityPolls.ts` — lädt Umfragen inkl. Optionen, Stimmen und Abstimmenden-Profilen (Nested-Select), abonniert Supabase Realtime auf allen drei Tabellen (gefiltert nach `activity_id`) und stellt `createPoll`, `deletePoll`, `toggleVote` (optimistic mit Rollback) sowie ein `pending`-Set bereit. Analog zu `useActivityComments` / `useVote`.
- `src/components/groups/PollSection.tsx` — Sektions-Container: Kopf + „Umfrage starten", Loading-/Leerzustand, Umfrage-Liste, hostet Create-Sheet und Lösch-Dialog. Blendet sich bei Status `vorschlag` komplett aus; bei `abgeschlossen` oder `readOnly` (Archiv) nur lesbar.
- `src/components/groups/PollCard.tsx` — eine Umfrage: Kopf (Frage · Ersteller · „X von Y … abgestimmt" · Löschen-Icon nur für Ersteller/Admin), Options-Liste.
- `src/components/groups/PollOptionRow.tsx` — Option mit Auswahl-Indikator, Anteil-Balken (`progress`), Stimmenzahl, Avatar-Stack (`+N` ab 5) und Toggle-Verhalten; im Read-only-Modus als `div` statt `button`.
- `src/components/groups/CreatePollSheet.tsx` — Formular (ResponsiveModal): Frage (1–255) + 2–12 Options-Felder (je max. 100), dynamisch +/–. Validiert leere Frage, <2 gefüllte Optionen und doppelte Optionstexte (case-insensitive); leere Felder werden ignoriert. Eingaben bleiben bei API-Fehler erhalten (Toast).
- `src/components/groups/DeletePollDialog.tsx` — Bestätigungsdialog (AlertDialog) mit Hinweis auf Entfernen aller Stimmen.

### Geänderte Dateien
- `src/lib/activity-types.ts` — Typen `ActivityPoll`, `ActivityPollOption`, `ActivityPollVote`, `PollProfile`, `CreatePollInput` + Konstanten (`POLL_QUESTION_MAX=255`, `POLL_OPTION_MAX=100`, `POLL_MIN_OPTIONS=2`, `POLL_MAX_OPTIONS=12`, `POLL_AVATAR_LIMIT=5`).
- `src/components/groups/ActivityDetailSheet.tsx` — `PollSection` als neue Sektion zwischen Verantwortlichkeiten und Fotos (Mobile-Einspalter + Desktop-rechte-Spalte) eingehängt; erhält `currentUserId`, `isAdmin`, `memberCount`, `status`, `readOnly`.
- `src/lib/database.types.ts` — **Bridge-Definitionen** für `activity_polls`, `activity_poll_options`, `activity_poll_votes` hinzugefügt, damit der typisierte Supabase-Client kompiliert. **→ `/backend` muss diese Datei nach der Migration via `supabase gen types` regenerieren.**

### Erwartetes Backend-Kontrakt (für /backend)
Die Frontend-Queries setzen folgende Struktur voraus:
- Tabellen `activity_polls` (id, activity_id, created_by, question, created_at), `activity_poll_options` (id, poll_id, activity_id, option_text, position), `activity_poll_votes` (id, option_id, activity_id, user_id, created_at) — Options/Votes tragen `activity_id` denormalisiert für den Realtime-Filter.
- FK-Namen exakt: `activity_polls_created_by_fkey`, `activity_poll_votes_user_id_fkey` (für die `!fk`-Joins auf `profiles`).
- Unique-Constraint `(option_id, user_id)` auf `activity_poll_votes`; Cascade-Delete Umfrage → Optionen → Stimmen.
- Realtime auf allen drei Tabellen aktivieren; RLS (lesen/schreiben nur Gruppenmitglieder, löschen nur Ersteller/Admin); DB-Trigger `after insert` auf `activity_polls` → Benachrichtigung `umfrage_erstellt`.

### Offene Punkte / Hinweise
- „Ehemaliges Mitglied": aktuell nur bei fehlendem Profil (Account gelöscht) als Fallback-Label; das reine Verlassen der Gruppe (Profil existiert weiter) zeigt weiterhin den echten Namen. Ggf. in QA/Backend präzisieren.
- Der Anteil-Balken zeigt den Anteil an der **Gesamtstimmenzahl der Umfrage** (Summe aller Optionsstimmen).
- „Diese Umfrage wurde gelöscht"-Fall: Realtime entfernt die Umfrage aus der Ansicht; ein fehlgeschlagener Vote löst aktuell einen generischen Toast aus.

## Backend Implementation (/backend, 2026-07-12)

### Migration `supabase/migrations/20260712_proj14_activity_polls.sql` (applied to prod)
- **Drei Tabellen** `activity_polls` (id, activity_id→activities, created_by→profiles, question CHECK 1–255, created_at), `activity_poll_options` (id, poll_id→activity_polls, activity_id→activities, option_text CHECK 1–100, position) und `activity_poll_votes` (id, option_id→activity_poll_options, activity_id→activities, user_id→profiles, created_at) mit **`unique(option_id, user_id)`** gegen Doppelstimmen. Alle FKs `on delete cascade` → Umfrage löschen entfernt Optionen + Stimmen; Account-Löschung entfernt die Stimme. FK-Namen exakt wie vom Frontend erwartet: `activity_polls_created_by_fkey`, `activity_poll_votes_user_id_fkey`.
- **Denormalisiertes `activity_id`** auf Options + Votes → Realtime-Filter `activity_id=eq.…` ohne Join (konsistent mit PROJ-6).
- **Indizes:** `(activity_id, created_at desc)` + `created_by` auf polls; `poll_id`/`activity_id` auf options; `option_id`/`activity_id`/`user_id` auf votes.
- **RLS** (SECURITY-DEFINER-Helper `is_activity_group_member(aid)` und `is_activity_polls_writable(aid)`, spiegeln `is_group_member`/`is_group_admin` aus PROJ-3):
  - SELECT auf allen drei Tabellen: nur Gruppenmitglieder der Aktivität.
  - INSERT poll/option/vote: nur Mitglieder **und** Aktivitätsstatus ∉ {`vorschlag`,`abgeschlossen`} (Server-seitige Absicherung des UI-Status-Gates); poll/vote zusätzlich self-authored; option nur durch den Poll-Ersteller.
  - DELETE poll: Ersteller **oder** Gruppen-Admin (ohne Status-Gate → Aufräumen auch bei `abgeschlossen`). DELETE vote: nur eigene Stimme. Kein UPDATE (Umfragen + Stimmen sind unveränderlich; Toggle = insert/delete).
  - **Funktional verifiziert** per JWT-Impersonation: Mitglied read+write = true, Nicht-Mitglied read+write = false.
- **Realtime:** alle drei Tabellen zur `supabase_realtime`-Publication hinzugefügt.
- **Benachrichtigung `umfrage_erstellt`:** neuer Wert im CHECK von `notifications` **und** `notification_preferences`; DB-Trigger `trg_push_poll_insert` (`after insert on activity_polls`) ruft die bestehende `proj10_dispatch_push()`-Pipeline auf.

### Edge Function `send-push` (v10 deployed) + Client-Konstanten
- `logic.ts`: `PushEvent`/`MessageContext`/`EventDescriptor` um `umfrage_erstellt` bzw. `pollQuestion` erweitert; `classifyEvent` klassifiziert `activity_polls`-INSERT (Empfänger = alle Aktivitäts-Mitglieder außer Ersteller via Default-Fan-out); `buildMessage` liefert „Neue Umfrage" / „[Name] hat eine Umfrage in „[Aktivität]" gestartet: [Frage]"; Deep-Link-Tab `planung`. `index.ts` reicht `pollQuestion` an `buildMessage`. Unit-Tests (`logic.test.ts`) für classify + message ergänzt.
- `src/lib/notification-types.ts`: `NOTIFICATION_EVENTS` + `EVENT_META` um `umfrage_erstellt` („Umfragen") erweitert → Präferenz-Matrix zeigt den Schalter automatisch. Test angepasst.
- `src/components/notifications/NotificationItem.tsx`: Icon `BarChart3` für den neuen Typ.
- `src/lib/database.types.ts`: via `supabase gen types` regeneriert (die Frontend-Bridge-Defs sind jetzt die echten Tabellen); Hand-Narrowing `profiles.status: 'pending' | 'active'` wieder eingesetzt (gen types emittiert `string`).

### Verifikation
- `tsc --noEmit` sauber; `npm run build` (Static Export) grün; `npm test` 279 grün (die 2 roten `CreateGroupForm`-Tests bestehen unverändert auch auf HEAD, ohne Bezug zu diesem Feature).
- **Manuelle Setup-Notiz:** keine — der Webhook nutzt das bestehende `push_webhook_secret` (Vault) + `send-push`-Secrets aus PROJ-10/12; kein neuer Env-Wert nötig.

## QA Test Results

**Tested:** 2026-07-12
**App URL:** http://localhost:3000 (static export)
**Tester:** QA Engineer (AI)
**Method:** Code review against every AC + RLS/security audit + automated tests (Vitest 296, Playwright chromium). Live 2-client Realtime and the push fan-out were verified by code review + unit tests (send-push `logic.test.ts`) and by consistency with the deployed PROJ-6/PROJ-12 patterns, not a live multi-device session.

### Acceptance Criteria Status

#### Umfrage erstellen
- [x] „Umfrage starten"-Button ab Status `zu_planen`/`in_planung`/`planung_abgeschlossen` (PollSection gates on `status !== 'vorschlag'`; ActivityDetailSheet double-gates)
- [x] Formular: Frage (1–255) + ≥2 Options-Felder (je max. 100), dynamisch bis 12 — `CreatePollSheet.test.tsx` (render + cap)
- [x] Leere Frage → Validierungsfehler am Frage-Feld — unit test
- [x] <2 gefüllte Optionen → „Mindestens 2 Antwortoptionen nötig", leere Felder ignoriert — unit test
- [x] Doppelte Optionstexte (case-insensitive) → „Optionen dürfen sich nicht wiederholen" — unit test
- [x] Gültig → Umfrage erscheint oben in der Sektion (`order created_at desc`) — unit test (submit) + E2E AC-CREATE-3
- [x] Status `vorschlag` → Sektion unsichtbar

#### Abstimmen
- [x] Tippen auf Option speichert Stimme + optimistic markiert (toggleVote insert, aria-pressed) — E2E AC-VOTE-1
- [x] Erneutes Tippen entfernt die Stimme (toggleVote delete)
- [x] Mehrfachauswahl ohne Obergrenze (je Option eine Vote-Zeile; unique(option_id,user_id))
- [x] Auswahl jederzeit änderbar (kein Close/Deadline)
- [~] Live-Aktualisierung bei fremder Stimme — **by design**: Realtime auf allen 3 Tabellen (activity_id-Filter), identisch zum deployten PROJ-6-Kommentar-Muster; nicht live 2-Client getestet

#### Ergebnisse anzeigen
- [x] Pro Option: Fortschrittsbalken (Anteil an Gesamtstimmen), absolute Zahl, Avatare — `PollCard.test.tsx`
- [x] >5 Stimmen → erste 5 Avatare + „+N" — unit test (7 → +2)
- [x] Kopfzeile: Frage · Ersteller · „X von Y … abgestimmt" (Sing./Plural) — unit test
- [x] Eigene gewählte Option visuell hervorgehoben (aria-pressed + border-primary) — unit test
- [x] Nicht anonym: jede Stimme trägt Avatar/Name des Mitglieds

#### Umfrage löschen
- [x] Löschen-Icon nur für Ersteller **oder** Admin; andere sehen es nicht — unit test (3 Rollen)
- [x] Bestätigungsdialog mit Hinweis „… alle Optionen und Stimmen unwiderruflich entfernt"
- [x] Bestätigen → Umfrage + Optionen + Stimmen entfernt (Cascade), verschwindet für alle (Realtime)

#### Status-Verhalten
- [x] `abgeschlossen`/Archiv → nur lesbar: kein Erstellen/Abstimmen/Löschen (UI `canInteract=false`, Optionen als `div`) — unit test (read-only) + RLS `is_activity_polls_writable` blockt Schreiben serverseitig

#### Benachrichtigung
- [x] Neue Umfrage → `umfrage_erstellt` an alle Aktivitäts-Mitglieder außer Ersteller — `logic.test.ts` (classify INSERT, resolveRecipients excludes actor, buildMessage)
- [x] Einzelne Stimme → keine Benachrichtigung (Trigger nur auf `activity_polls` INSERT, nicht auf votes)

#### Leerzustand
- [x] Keine Umfragen + Status ≥ `zu_planen` → „Noch keine Umfragen – starte die erste!" + Erstell-Button

#### Fehlerverhalten
- [x] Erstellen fehlgeschlagen → Toast + Eingaben bleiben erhalten — unit test (API rejects)
- [x] Abstimm-Request fehlgeschlagen → Rollback auf Snapshot + Toast (useActivityPolls throw → PollSection catch)
- [~] „Diese Umfrage wurde gelöscht" während Abstimmen → siehe **BUG-14-1** (Umfrage verschwindet korrekt via Realtime, aber Toast-Text ist generisch)

### Edge Cases Status
- [~] Mitglied verlässt Gruppe → Stimme bleibt, Avatar „Ehemaliges Mitglied" — siehe **BUG-14-2** (Label greift aktuell nur bei gelöschtem Account)
- [x] Umfrage gelöscht während Abstimmen → Realtime entfernt sie (Toast-Text: BUG-14-1)
- [x] Gleichzeitige Stimmabgabe → je eigener Datensatz, unique(option_id,user_id) verhindert Doppelstimmen
- [x] 0 gewählte Optionen erlaubt → Nutzer zählt nicht in Beteiligung
- [x] Doppelte Optionstexte beim Erstellen → im Formular abgewiesen
- [x] Lange Options-/Frage-Texte → `maxLength` + `break-words`, DB-CHECK
- [x] Beobachter darf erstellen/abstimmen/eigene löschen → keine Rollenbeschränkung im Client, RLS = jedes Gruppenmitglied

### Security Audit Results
- [x] Authentifizierung: Sektion nur hinter Login (E2E-Guard: `/groups/view` → `/login`)
- [x] Autorisierung (SELECT): nur Gruppenmitglieder der Aktivität (`is_activity_group_member`), per JWT-Impersonation verifiziert (Backend)
- [x] Autorisierung (INSERT): self-authored + writable-Status serverseitig erzwungen (RLS), UI-Status-Gate zusätzlich abgesichert
- [x] Autorisierung (DELETE): Poll nur Ersteller/Admin; Vote nur eigene
- [x] Kein UPDATE-Pfad (Umfragen/Stimmen unveränderlich) — Manipulation ausgeschlossen
- [x] Input: Frage/Options über DB-CHECK begrenzt; Supabase parametrisiert (kein SQLi); React escapet Text (kein XSS)
- [~] **Defense-in-depth (SEC-14-1, Low):** Die `activity_poll_votes`-INSERT-Policy prüft nur das client-gelieferte denormalisierte `activity_id` (writable + self-authored), nicht dass `option_id` wirklich zu einer Umfrage dieser Aktivität gehört. Ein manipulierter Client könnte eine Vote-Zeile mit fremdem `option_id` + eigener writable `activity_id` einfügen. **Ausnutzbarer Impact: keiner** — die symmetrische SELECT-Policy blendet solch eine Vote-Zeile für alle aus, keine sichtbare Zählmanipulation möglich, und `user_id = auth.uid()` verhindert Stimmen im fremden Namen. Empfehlung: Konsistenz-Check (`option_id` gehört zu `activity_id`) in der INSERT-Policy ergänzen.

### Bugs Found

#### BUG-14-1: Falscher Toast-Text beim Abstimmen auf gelöschte Umfrage
- **Severity:** Low
- **Steps to Reproduce:**
  1. Nutzer A hat die Aktivität offen, Nutzer B löscht eine Umfrage
  2. Nutzer A tippt auf eine Option dieser Umfrage
  3. Erwartet (AC): Toast „Diese Umfrage wurde gelöscht"
  4. Tatsächlich: generischer Toast „Deine Stimme konnte nicht gespeichert werden." — die Umfrage verschwindet aber korrekt via Realtime
- **Priority:** Nice to have (vom Frontend als bekannte Einschränkung dokumentiert)

#### BUG-14-2: „Ehemaliges Mitglied" nur bei gelöschtem Account, nicht beim Verlassen der Gruppe
- **Severity:** Low
- **Steps to Reproduce:**
  1. Mitglied stimmt in einer Umfrage ab und verlässt danach die Gruppe (Profil existiert weiter)
  2. Erwartet (Edge Case): Avatar/Name als „Ehemaliges Mitglied"
  3. Tatsächlich: echter Name/Avatar wird weiter angezeigt (Fallback greift nur bei fehlendem Profil = Account-Löschung)
- **Priority:** Fix in next sprint (vom Frontend als offener Punkt vermerkt; erfordert Join gegen aktuelle `group_members`)

### Automated Tests Added
- `src/components/groups/CreatePollSheet.test.tsx` — 7 Tests: Formular-Validierung (leere Frage, <2 Optionen, Duplikate, Trim/Ignore leerer Felder, 12er-Cap, API-Fehler bewahrt Eingaben)
- `src/components/groups/PollCard.test.tsx` — 8 Tests: Beteiligung (Sing./Plural), Auswahl-Hervorhebung, „+N"-Overflow, Löschen-Icon-Sichtbarkeit (Ersteller/Admin/Fremd), Read-only
- `tests/PROJ-14-umfragen-in-aktivitaeten.spec.ts` — E2E: 1 Regression-Guard (unauth → Login, läuft immer) + 4 authentifizierte Flows (Entry-Point, Validierung, Erstellen erscheint oben, Vote-Toggle), self-skip ohne `TEST_USER_*`

**Test-Läufe:** Vitest 294/296 grün (die 2 roten `CreateGroupForm`-Tests sind vorbestehend auf HEAD, ohne PROJ-14-Bezug). Playwright chromium: Regression-Guard grün, 8 auth-Tests self-skip (keine lokalen Credentials). `npm run build` (Static Export) grün. Der Mobile-Safari/WebKit-E2E-Lauf scheitert nur an fehlendem WebKit-Binary auf dieser Maschine (`npx playwright install webkit`) — kein Code-Defekt.

### Summary
- **Acceptance Criteria:** 26/26 funktional erfüllt (2 als „by design" verifiziert: Live-Realtime; 1 mit Text-Abweichung: BUG-14-1)
- **Bugs Found:** 2 Low (BUG-14-1 Toast-Text, BUG-14-2 „Ehemaliges Mitglied") + 1 Low Defense-in-depth-Hinweis (SEC-14-1)
- **Security:** Pass (RLS deckt SELECT/INSERT/DELETE korrekt ab; ein Low-Härtungshinweis ohne ausnutzbaren Impact)
- **Production Ready:** YES (keine Critical/High/Medium Bugs)
- **Recommendation:** Deploy freigegeben. Die 3 Low-Punkte als optionale Follow-ups einplanen (kein Deployment-Blocker).

### Bug Fixes Applied (2026-07-12, nach QA-Review)
Alle 3 Low-Punkte auf Nutzerwunsch direkt behoben:
- **BUG-14-1 behoben:** `useActivityPolls.toggleVote` reicht den Postgres-Fehlercode mit; `PollSection.handleToggleVote` zeigt bei `23503` (FK-Verletzung ⇒ Option/Umfrage gelöscht) den Toast „Diese Umfrage wurde gelöscht." statt der generischen Meldung.
- **BUG-14-2 behoben:** `memberIds` (Set der aktuellen Gruppenmitglieder) wird von `ActivityDetailSheet` durch `PollSection → PollCard → PollOptionRow` gereicht. Abstimmende **und** Ersteller, die kein aktuelles Mitglied mehr sind (Gruppe verlassen oder Account gelöscht), werden als „Ehemaliges Mitglied" dargestellt. 2 neue Unit-Tests in `PollCard.test.tsx`.
- **SEC-14-1 behoben:** Migration `20260712_proj14_vote_option_activity_guard.sql` auf Prod (`fogldssdmqgeffpuhvxd`) angewendet — die INSERT-Policy „Group members can cast votes" verlangt nun zusätzlich, dass `option_id` zu einer Option der angegebenen `activity_id` gehört (`EXISTS`-Check). Policy per `pg_policies` verifiziert; `get_advisors` zeigt keine neuen Security-Findings.

**Re-Verifikation:** `tsc --noEmit` sauber, Vitest 296/298 grün (2 rote `CreateGroupForm`-Tests vorbestehend), `npm run build` grün.

## Deployment

**Deployed:** 2026-07-12
**Production URL:** https://qt-voting-app.vercel.app
**Git Tag:** v1.14.0-PROJ-14
**Method:** `git push origin main` → Vercel Auto-Deploy (Projekt `qt-voting-app`)

### Deployed Artifacts
- **Frontend (Vercel):** `PollSection`, `PollCard`, `PollOptionRow`, `CreatePollSheet`, `DeletePollDialog`, Hook `useActivityPolls`, Einbindung in `ActivityDetailSheet`, Typen + `notification-types` (Umfragen-Schalter), `NotificationItem`-Icon.
- **Datenbank (Supabase Prod `fogldssdmqgeffpuhvxd`):** Migration `20260712_proj14_activity_polls.sql` (3 Tabellen + RLS + Realtime + `umfrage_erstellt`-Trigger) sowie QA-Härtung `20260712_proj14_vote_option_activity_guard.sql` — beide angewendet.
- **Edge Function:** `send-push` v10 (bereits im /backend-Schritt deployt) — Fall `umfrage_erstellt`.

### Pre-Deploy-Checks
- `npm run build` (Static Export) grün; `tsc --noEmit` sauber; Vitest 296/298 (2 rote `CreateGroupForm`-Tests vorbestehend, ohne PROJ-14-Bezug).
- `npm run lint` projektweit defekt (`next lint` in Next 16 entfernt) — kein Deploy-Blocker; Typsicherheit über den Build-TS-Check abgedeckt.
- Keine neuen Env-Variablen; kein committetes Secret.

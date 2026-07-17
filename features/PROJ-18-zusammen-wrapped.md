# PROJ-18: ZUSAMMEN Wrapped (Gamification)

## Status: Deployed
**Created:** 2026-07-13
**Last Updated:** 2026-07-17

## Dependencies
- Requires: PROJ-4 (Aktivitäts-Vorschläge & Voting) — `activities` + `votes` als Datenquelle (Vorschläge, Votes, Initiator:innen)
- Requires: PROJ-5 (Kanban-Board) — Status `abgeschlossen` als Zählbasis
- Requires: PROJ-15 (Gruppen-Momentum) — Momentum-Level & Meilensteine für die Momentum-Slide
- Optional (später per `/refine`): PROJ-16 (Rollen-Badges) und PROJ-17 (Memory Cards) — zusätzliche Slides, sobald diese Features live sind. **Wrapped ist bewusst NICHT mehr davon blockiert.**

## Übersicht
ZUSAMMEN Wrapped ist der jährliche, teilbare Story-Rückblick einer Gruppe im Spotify-Wrapped-Stil — das Abschluss-Feature des Gamification-Dachkonzepts „Momentum". Ab dem 1. Dezember bekommt jede ausreichend aktive Gruppe (≥ 3 abgeschlossene Aktivitäten im Jahr) einen Vollbild-Story-Rückblick über ihr gemeinsames Jahr: große Zahlen, Highlights, Momentum-Fortschritt und warme Personen-Shout-outs — kollektiv statt kompetitiv. Einzelne Slides lassen sich als Story-Bild (9:16) über das native Share-Sheet teilen. Vergangene Jahrgänge bleiben dauerhaft abrufbar.

## User Stories
- Als Gruppenmitglied möchte ich ab Dezember einen Story-Rückblick über unser Gruppenjahr ansehen, damit wir gemeinsam feiern können, was wir erlebt haben.
- Als Gruppenmitglied möchte ich einzelne Wrapped-Slides als Bild teilen (WhatsApp, Instagram, …), damit ich unsere Highlights mit anderen teilen und die Gruppe stolz präsentieren kann.
- Als Ideengeber:in des Jahres möchte ich im Wrapped positiv gewürdigt werden, damit sich mein Beitrag zur Gruppe gesehen anfühlt — ohne Rangliste oder Vergleich mit anderen.
- Als Gruppenmitglied möchte ich vergangene Wrapped-Jahrgänge jederzeit wieder öffnen können, damit unsere Rückblicke als Erinnerung erhalten bleiben.
- Als Mitglied einer wenig aktiven Gruppe möchte ich kein „leeres" Wrapped mit traurigen Zahlen sehen, damit der Rückblick immer ein positives Erlebnis bleibt.

## Slide-Dramaturgie (9 Slides)

| # | Slide | Inhalt | Datenquelle |
|---|-------|--------|-------------|
| 1 | Intro | „Euer {Jahr}, {Gruppenname}" — Auftakt | `groups` |
| 2 | Große Zahl | Anzahl abgeschlossener Aktivitäten im Jahr | `activities` (Status `abgeschlossen`, Jahresregel s.u.) |
| 3 | Aktivster Monat | Monat mit den meisten abgeschlossenen Aktivitäten | `activities` |
| 4 | Top-Aktivität | Aktivität des Jahres mit den meisten Votes (Name + Vote-Zahl) | `activities.current_votes` |
| 5 | Abstimmungen | „Ihr habt {X}-mal abgestimmt" — demokratische Bilanz | `votes` im Jahr |
| 6 | Momentum | Aktuelles Gruppen-Level + im Jahr erreichte Meilensteine | `group_momentum` (PROJ-15) |
| 7 | Shout-out 1 | 💡 Ideengeber:in des Jahres (meiste Vorschläge eingebracht) | `activities.initiator_id` |
| 8 | Shout-out 2 | 🗳️ Fleißigste:r Abstimmer:in des Jahres | `votes.user_id` |
| 9 | Outro | Kernzahlen-Zusammenfassung + Teilen-CTA + „Auf ein neues Jahr!" | Aggregation |

**Slide-Skip-Regel:** Slides, deren Daten fehlen oder keine sinnvolle Aussage ergeben (z.B. keine Votes im Jahr, kein eindeutiger Shout-out), werden einzeln still übersprungen — die restliche Dramaturgie bleibt erhalten. Intro, Slide 2 und Outro erscheinen immer (durch die Mindestschwelle garantiert sinnvoll).

**Jahresregel:** Eine Aktivität zählt zu dem Jahr, in dem sie **stattfand** (`start_date`). Hat sie kein Startdatum, greift ein Fallback-Datum (Abschluss-Zeitpunkt, sofern erfasst; sonst `created_at` — Detail klärt `/architecture`).

## Out of Scope
- Badge-Slide („Eure Rollen des Jahres") — kommt per `/refine`, sobald PROJ-16 deployed ist
- Memory-Card-/Foto-Slides — kommt per `/refine`, sobald PROJ-17 deployed ist
- Persönliches, gruppenübergreifendes Wrapped („Dein Jahr") — bewusst verworfen, Wrapped ist kollektiv pro Gruppe
- Öffentlicher Share-Link / öffentliche Wrapped-Webseite — nur Bild-Export, keine öffentlich abrufbaren Gruppendaten
- Push-/E-Mail-Benachrichtigung „Euer Wrapped ist da" — später über PROJ-12 (In-App-Notification optional dort)
- Video-/animierter Export — geteilt wird ein statisches Bild pro Slide
- Ranglisten oder Zahlen-Vergleiche zwischen Mitgliedern (z.B. „Anna 12 vs. Ben 3 Ideen") — nur positive Einzel-Würdigung
- Motivations-Wrapped für Gruppen unter der Mindestschwelle („2027 wird euer Jahr!") — verworfen, unter 3 Aktivitäten erscheint schlicht nichts
- Rollierender 12-Monats-Rückblick oder Gruppen-Jubiläums-Wrapped — verworfen zugunsten des Kalenderjahr-Modells
- Konfigurierbarkeit (Zeitraum, Slide-Auswahl, Schwellen) durch Nutzer:innen
- Snapshot/Einfrieren der Zahlen — Wrapped wird immer live aus den Daten des jeweiligen Kalenderjahres berechnet

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Verfügbarkeit & Einstieg

- [ ] Angenommen eine Gruppe hat im laufenden Kalenderjahr mindestens 3 abgeschlossene Aktivitäten, wenn ein Mitglied die Gruppe am oder nach dem 1. Dezember öffnet, dann sieht es im Vorschläge-Tab einen Wrapped-Teaser-Banner.
- [ ] Angenommen eine Gruppe hat im laufenden Kalenderjahr weniger als 3 abgeschlossene Aktivitäten, wenn ein Mitglied die Gruppe im Dezember öffnet, dann erscheint kein Wrapped-Banner und kein Wrapped für dieses Jahr.
- [ ] Angenommen es ist vor dem 1. Dezember, wenn ein Mitglied die Gruppe öffnet, dann erscheint kein Wrapped-Banner für das laufende Jahr — unabhängig von der Aktivitätszahl.
- [ ] Angenommen ein Mitglied hat eine beliebige Rolle (Admin, Redakteur oder Beobachter), wenn das Wrapped verfügbar ist, dann kann es das Wrapped gleichermaßen ansehen (kollektiv, rollenunabhängig).
- [ ] Angenommen für eine Gruppe existieren Wrappeds aus vergangenen Jahren, wenn ein Mitglied den festen Wrapped-Einstiegspunkt der Gruppe öffnet, dann sieht es eine Liste aller verfügbaren Jahrgänge und kann jeden erneut ansehen.

### Story-Viewer

- [ ] Angenommen das Wrapped ist verfügbar, wenn ein Mitglied auf den Teaser-Banner tippt, dann öffnet sich der Vollbild-Story-Viewer bei Slide 1 mit sichtbaren Fortschritts-Indikatoren.
- [ ] Angenommen der Story-Viewer ist geöffnet, wenn das Mitglied auf die rechte Bildschirmhälfte tippt, dann erscheint die nächste Slide; bei Tipp auf die linke Hälfte die vorherige.
- [ ] Angenommen der Story-Viewer ist geöffnet, wenn das Mitglied den Schließen-Button tippt, dann schließt sich das Wrapped und die Gruppe ist wieder sichtbar.
- [ ] Angenommen eine Slide hat keine sinnvollen Daten (z.B. keine Votes im Jahr), wenn das Wrapped abgespielt wird, dann wird genau diese Slide übersprungen, ohne die übrige Reihenfolge zu verändern.
- [ ] Angenommen im Dezember kommen nach dem ersten Ansehen weitere abgeschlossene Aktivitäten hinzu, wenn das Wrapped erneut geöffnet wird, dann zeigen die Slides die aktualisierten Zahlen (Live-Berechnung bis Jahresende).

### Inhalte & Zählregeln

- [ ] Angenommen eine Aktivität hat den Status `abgeschlossen` und ihr Startdatum liegt im Wrapped-Jahr, dann zählt sie in Slide 2 mit; abgeschlossene Aktivitäten mit Startdatum in einem anderen Jahr zählen dort nicht mit.
- [ ] Angenommen mehrere Aktivitäten haben die höchste Vote-Zahl (Gleichstand), wenn die Top-Aktivität-Slide berechnet wird, dann wird die früher stattgefundene Aktivität gezeigt.
- [ ] Angenommen die Gruppe hat im Wrapped-Jahr einen oder mehrere Momentum-Meilensteine (5/10/25) erreicht, dann nennt die Momentum-Slide das aktuelle Level und die in diesem Jahr erreichten Meilensteine.
- [ ] Angenommen eine Person hat im Wrapped-Jahr die meisten Vorschläge eingebracht und ist noch Gruppenmitglied, dann zeigt die Shout-out-Slide ihren Namen, Avatar und ihre eigene Zahl — ohne Zahlen oder Platzierungen anderer Mitglieder.
- [ ] Angenommen beim Shout-out besteht Gleichstand zwischen bis zu 3 Personen, dann werden alle Gleichplatzierten gemeinsam gewürdigt; bei mehr als 3 Gleichplatzierten entfällt die Slide.
- [ ] Angenommen die Person mit den meisten Vorschlägen hat die Gruppe inzwischen verlassen, dann wird die nächstplatzierte aktuelle Person gewürdigt; gibt es keine, entfällt die Slide.

### Teilen

- [ ] Angenommen der Story-Viewer zeigt eine Slide, wenn das Mitglied auf den Teilen-Button tippt, dann wird die Slide als Bild im Story-Format (9:16, inkl. dezentem App-Branding) über das native Share-Sheet geteilt.
- [ ] Angenommen die App läuft im Browser ohne Share-Funktion, wenn das Mitglied auf Teilen tippt, dann wird das Slide-Bild stattdessen als Download angeboten.

### Sicherheit

- [ ] Angenommen ein Nutzer ist kein Mitglied der Gruppe, wenn er versucht, Wrapped-Daten dieser Gruppe abzurufen, dann erhält er keine Daten (RLS auf allen Quelltabellen).

## Edge Cases
- **Gruppe knapp unter der Schwelle (2 abgeschlossene):** Kein Banner, kein Wrapped — kommt im Dezember die 3. Aktivität dazu, erscheint der Banner ab dann (Live-Berechnung).
- **Aktivität ohne Startdatum:** Fällt über die Fallback-Regel in ein Jahr (Abschluss-Zeitpunkt bzw. `created_at`); erscheint nie doppelt und nie in keinem Jahr.
- **Aktivität wird nach dem Ansehen gelöscht:** Zahlen ändern sich beim nächsten Öffnen (Live-Berechnung); fällt die Gruppe dadurch unter 3, verschwindet das Wrapped dieses Jahrgangs wieder. Akzeptiert — Wahrheit vor Konservierung, konsistent mit PROJ-15 (Live-Count).
- **Shout-out-Kandidat:in hat die Gruppe verlassen:** Nur aktuelle Mitglieder werden gewürdigt; nächstplatzierte Person rückt nach, sonst entfällt die Slide.
- **Gleichstand beim aktivsten Monat:** Der frühere Monat wird gezeigt.
- **Gruppe erst im November gegründet:** Bekommt bei ≥ 3 abgeschlossenen Aktivitäten trotzdem ein Wrapped — kein Mindestalter der Gruppe.
- **Neues Mitglied tritt im Dezember bei:** Sieht das Wrapped des gesamten Gruppenjahres (kollektiver Rückblick, kein persönlicher Filter).
- **Jahreswechsel während der Nutzung:** Ab 1. Januar ist das Vorjahres-Wrapped nur noch über den Archiv-Einstieg erreichbar; der Teaser-Banner erscheint erst wieder am 1. Dezember des neuen Jahres.
- **Sehr lange Aktivitätsnamen / lange Nutzernamen auf Slides:** Werden abgeschnitten/umbrochen dargestellt, ohne das Slide-Layout zu sprengen (Detail: `/frontend`).

## Technical Requirements
- Static-Export-kompatibel: kein SSR, keine Server Actions; Aggregation client-seitig via Supabase JS Client über bestehende, RLS-geschützte Tabellen (`activities`, `votes`, `groups`, `group_members`, `group_momentum`).
- Bild-Export der Slides client-seitig (Umsetzung → `/architecture`); Teilen via nativem Share-Sheet (Capacitor) mit Browser-Fallback (Download).
- Performance: Wrapped-Berechnung für eine typische Gruppe (< 100 Aktivitäten/Jahr) ohne spürbare Wartezeit; einfacher Lade-Zustand beim Öffnen ist ok.
- Kein neues Backend zwingend erforderlich; falls `/architecture` eine Hilfsstruktur einführt (z.B. `completed_at`-Erfassung), gilt: Zahlen dürfen client-seitig nicht manipulierbar sein (nur Lesen).

## Open Questions
- [x] ~~`activities` hat kein `completed_at`-Feld~~ — Entschieden (2026-07-14): neues Feld `completed_at` per DB-Trigger ab sofort; Bestand fällt auf `created_at` zurück. Siehe Technical Decisions.
- [x] ~~Finaler Feature-Name~~ — Entschieden (2026-07-14): **„Mellon Rückblick"**. Interne Bezeichner bleiben neutral `wrapped`.
- [x] ~~Zeitzonen-Handling der Jahresgrenze~~ — Bestätigt (2026-07-14): lokale Gerätezeit. Siehe Technical Decisions.
- [ ] Genauer Wortlaut und visuelles Design der Slides (STYLEGUIDE: Archivo, Terracotta/Navy/Gold) → `/frontend`.
- [ ] Badge- und Memory-Card-Slides nach Deployment von PROJ-16/17 per `/refine` ergänzen (Dramaturgie-Position dann festlegen).

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Wrapped baut nur auf vorhandenen Daten auf (Aktivitäten, Votes, Momentum) — nicht mehr blockiert durch PROJ-16/17 | Unabhängig baubar; Badge-/Memory-Slides kommen später per `/refine` | 2026-07-14 |
| Kalenderjahr-Modell, verfügbar ab 1. Dezember, Jahrgänge dauerhaft archiviert | Klarer Event-Charakter wie Spotify Wrapped; Rückblicke bleiben als Erinnerung erhalten (App-Kern „Idee → Erinnerung") | 2026-07-14 |
| Wrapped pro Gruppe, nicht pro Nutzer | Kollektiv > kompetitiv — konsistent mit Momentum-Konzept und App-DNA „ZUSAMMEN"/Mellon | 2026-07-14 |
| Positive Personen-Shout-outs ohne Zahlen-Vergleiche und ohne Rangliste | Spotify-Wrapped-Charme, bleibt aber warm; „keine Ranglisten"-Grundsatz des Momentum-Konzepts bleibt gewahrt | 2026-07-14 |
| Teilen als Slide-Bild (9:16) via natives Share-Sheet, kein öffentlicher Link | Kein Privacy-Risiko (Gruppendaten verlassen App nur als bewusst geteiltes Bild); geringerer Aufwand | 2026-07-14 |
| Einstieg: saisonaler Teaser-Banner (ab 1.12.) + dauerhafter Archiv-Zugang | Banner schafft den Event-Moment, Archiv bewahrt Rückblicke — passt zum Erinnerungs-Fokus | 2026-07-14 |
| Volle Dramaturgie mit 9 Slides | Kompletter Spannungsbogen inkl. beider Shout-outs und Momentum | 2026-07-14 |
| Mindestschwelle: 3 abgeschlossene Aktivitäten im Jahr | Rückblick mit 1–2 Einträgen wirkt traurig statt feierlich; deckt sich mit PRD-Erfolgsmetrik „aktive Gruppe" | 2026-07-14 |
| Jahreszuordnung nach Datum der Aktivität (`start_date`), nicht nach Abschluss-Zeitpunkt | Entspricht der Erinnerung („was haben wir 2026 erlebt"); Januar-Aufräumen verzerrt keine Jahrgänge | 2026-07-14 |
| Live-Berechnung statt Snapshot; Slides ohne Daten werden einzeln übersprungen | Einfachstes Modell, konsistent mit PROJ-15-Live-Count; Wrapped bleibt bis 31.12. aktuell | 2026-07-14 |
| Shout-outs nur für aktuelle Mitglieder; Gleichstand ehrt bis zu 3 gemeinsam | Keine Geister-Ehrungen; gemeinsames Würdigen statt Tie-Breaker-Willkür | 2026-07-14 |
| Geteilte Bilder tragen dezentes App-Branding | Organischer Marketing-Effekt des Teilens ohne öffentlichen Link | 2026-07-14 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Frontend-Feature mit Live-Berechnung im Client, keine Edge Function, kein Snapshot | Datenmenge winzig (< 100 Aktivitäten/Jahr); RLS deckt Sicherheits-AC ab; konsistent mit Static-Export-Vorgabe | 2026-07-14 |
| Neues Feld `activities.completed_at`, gesetzt per DB-Trigger beim Wechsel auf „abgeschlossen" | Fälschungssicher (Client kann nicht schreiben), gleiche Bauart wie PROJ-15-Momentum; präzise Jahreszuordnung für alle künftigen Abschlüsse | 2026-07-14 |
| Jahreszuordnung: `start_date` → `completed_at` → `created_at` | Jede Aktivität landet in genau einem Jahr; Alt-Daten ohne Startdatum akzeptiert unscharf via `created_at` | 2026-07-14 |
| Meilensteine „im Jahr erreicht" werden aus den jahreszugeordneten Abschlüssen hergeleitet, keine Meilenstein-Historie-Tabelle | Rückblick-Genauigkeit reicht; spart Tabelle, Trigger und Migrationspflege | 2026-07-14 |
| Bild-Export via `html-to-image` (DOM → PNG, 9:16) aus einer unsichtbaren Share-Bühne | Ein Design für Anzeige und Export statt doppelter Canvas-Pflege; klein, rein clientseitig | 2026-07-14 |
| Teilen nach dem erprobten Muster von PROJ-7/9: Capacitor Share + Cache-Datei nativ, Web-Share/Download im Browser | Keine neuen Plugins; bewährter Pfad inkl. Abbruch-Handling | 2026-07-14 |
| Zeitzonen-Regel: lokale Gerätezeit für 1.12.-Freischaltung und Jahresgrenze | Zielgruppe in einer Zeitzone; Serverzeit-Logik wäre Aufwand ohne Nutzen | 2026-07-14 |
| Skip-Logik im Datensammler-Hook (`useGroupWrapped`), Viewer erhält nur anzeigbare Slides | Story-Steuerung bleibt frei von Sonderfällen; Zählregeln isoliert testbar | 2026-07-14 |
| Feature-Name „Mellon Rückblick"; interne Bezeichner neutral `wrapped` | App heißt Mellon; deutsch & eigenständig statt Spotify-Anklang (User-Entscheidung) | 2026-07-14 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Erstellt:** 2026-07-14 · **Feature-Name (beschlossen):** „Mellon Rückblick"

### Grundsatzentscheidung: Frontend-Feature mit einer Mini-Migration

Der Rückblick ist fast vollständig ein **Frontend-Feature**: Alle Zahlen werden beim Öffnen live im Browser/App aus den bestehenden, RLS-geschützten Tabellen berechnet. Es gibt **keine neuen Tabellen, keine Edge Function, keinen Snapshot-Speicher**. Die einzige Backend-Änderung ist ein neues Feld `completed_at` an Aktivitäten (Details unten).

Warum das trägt: Eine typische Gruppe hat < 100 Aktivitäten pro Jahr — diese Datenmenge lädt und verrechnet ein Telefon in Sekundenbruchteilen. Ein Server-Baustein würde nur Komplexität hinzufügen, ohne etwas zu verbessern.

### A) Komponenten-Struktur

```
Gruppe — Vorschläge-Tab
+-- Rückblick-Teaser-Banner (saisonal: 1.12.–31.12., nur bei ≥ 3 Abschlüssen)

Gruppen-Detail-Sheet (bestehend)
+-- Eintrag „Rückblicke" (fester Einstieg, ganzjährig)
    +-- Jahrgangs-Liste (alle Jahre mit verfügbarem Rückblick)

Story-Viewer (Vollbild-Overlay, öffnet bei Slide 1)
+-- Fortschritts-Indikatoren (oben, ein Segment pro Slide)
+-- Schließen-Button / Teilen-Button
+-- Tipp-Zonen (rechte Hälfte = weiter, linke = zurück)
+-- Slide-Bühne (rendert je nach Slide-Typ 1–9)
    +-- Intro / Große Zahl / Aktivster Monat / Top-Aktivität /
        Abstimmungen / Momentum / Shout-out 1 / Shout-out 2 / Outro

Share-Bild-Bühne (unsichtbar)
+-- Slide im Story-Format 9:16 inkl. Mellon-Branding
    (wird nur zum Bild-Export gerendert, nie angezeigt)
```

Dazu ein „Datensammler"-Baustein (Hook `useGroupWrapped`, analog zu `useGroupMomentum`): lädt die Jahresdaten der Gruppe, wendet die Zähl- und Skip-Regeln an und liefert dem Viewer eine fertige Slide-Liste. Slides ohne sinnvolle Daten tauchen in dieser Liste gar nicht erst auf — der Viewer muss nichts überspringen.

### B) Datenmodell (Klartext)

**Neu: ein Feld, keine Tabelle.** Aktivitäten bekommen ein Feld `completed_at` (Abschluss-Zeitpunkt). Es wird **automatisch von der Datenbank** gesetzt, sobald eine Aktivität auf „abgeschlossen" wechselt — Clients können es weder setzen noch ändern (gleiche fälschungssichere Bauart wie der Momentum-Zähler aus PROJ-15). Bestandsdaten behalten ein leeres Feld.

**Jahreszuordnung (Fallback-Kette):** Startdatum der Aktivität → sonst Abschluss-Zeitpunkt (`completed_at`) → sonst Erstelldatum (`created_at`). Jede Aktivität landet so in genau einem Jahr.

**Gelesen wird ausschließlich Bestehendes** (alles RLS-geschützt, nur für Gruppenmitglieder sichtbar):
- `activities` — Abschlüsse, Namen, Votes-Zahl, Initiator:in, Datumsfelder
- `activity_votes` — Abstimmungs-Bilanz und fleißigste:r Abstimmer:in (je Wrapped-Jahr)
- `group_members` + `profiles` — Shout-outs nur für aktuelle Mitglieder (Name, Avatar)
- `group_momentum` — aktuelles Level für die Momentum-Slide
- `groups` — Gruppenname für Intro

**Meilensteine „im Jahr erreicht":** Es gibt keine Meilenstein-Historie in der Datenbank. Der Rückblick leitet sie her: Anzahl Abschlüsse aller Vorjahre vs. Anzahl bis Jahresende — jede Schwelle (5/10/25), die dazwischen überschritten wurde, gilt als „in diesem Jahr erreicht". Das ist für einen Rückblick präzise genug und braucht keinen neuen Speicher.

**Verfügbarkeits-Logik:** Rein clientseitige Datumsprüfung (ab 1.12. lokaler Gerätezeit) + Zählung der Jahres-Abschlüsse (≥ 3). Kein Cron-Job, kein „Freischalten" im Backend — der Rückblick *ist* verfügbar, sobald die Bedingungen stimmen.

### C) Tech-Entscheidungen (Warum)

1. **Live-Berechnung im Client statt Server-Aggregation** — Datenmenge winzig, RLS deckt die Sicherheits-AC vollständig ab, kein neuer Angriffs- oder Wartungspunkt. Konsistent mit der Static-Export-Vorgabe des Projekts (kein SSR).
2. **`completed_at` per Datenbank-Trigger** — die Jahreszuordnung soll auch für Aktivitäten ohne Startdatum stimmen. Ein automatisch gesetzter, nicht manipulierbarer Zeitstempel erfüllt die Spec-Vorgabe „Zahlen dürfen client-seitig nicht manipulierbar sein". Bestand ohne Startdatum fällt auf `created_at` zurück (bewusst akzeptierte Unschärfe für Alt-Daten).
3. **Bild-Export mit `html-to-image`** — die Share-Bilder entstehen aus einer echten, im Styleguide gestalteten Slide (DOM → PNG, 1080×1920). Alternative wäre, jedes Slide-Design ein zweites Mal von Hand auf ein Canvas zu malen — doppelte Design-Pflege bei jedem Layout-Feinschliff. `html-to-image` ist klein, rein clientseitig und braucht keinen Server.
4. **Teilen über den bestehenden Native-Share-Pfad** — natives Share-Sheet via Capacitor (Bild in den App-Cache schreiben, Share-Sheet öffnen) exakt nach dem erprobten Muster des Kalender-Exports (PROJ-7/9). Im Browser: Web-Share mit Bild, wenn der Browser es kann, sonst Download. Keine neuen Plugins nötig.
5. **Zeitzonen-Regel: lokale Gerätezeit** — Zielgruppe ist eine Freundesgruppe in einer Zeitzone; ob der Banner um 23:58 oder 00:02 erscheint, ist ohne Belang. Server-genaue Zeitlogik wäre Aufwand ohne Nutzen. (Offene Frage aus der Spec damit bestätigt.)
6. **Skip-Logik im Datensammler, nicht im Viewer** — der Viewer bekommt nur anzeigbare Slides. Das hält die Story-Steuerung (Tippen, Fortschritt, Teilen) frei von Sonderfällen und macht die Zählregeln isoliert testbar.
7. **Branding „Mellon Rückblick"** — Feature heißt in der App „Mellon Rückblick" (Banner, Slides, geteilte Bilder). Interne Bezeichner (Dateien, Hook-Namen) nutzen neutral `wrapped`.

### D) Abhängigkeiten (neue Pakete)

| Paket | Zweck |
|-------|-------|
| `html-to-image` | Slide-DOM als PNG im Story-Format exportieren (einziges neues Paket) |

Alles andere (Capacitor Share + Filesystem, Supabase JS, shadcn/ui) ist bereits installiert.

### Umsetzungs-Reihenfolge

1. `/backend` (klein): Migration `completed_at` + Trigger — bewusst **vor** `/frontend`, damit ab sofort Abschluss-Zeitpunkte erfasst werden und bis Dezember möglichst viele Aktivitäten präzise zugeordnet sind.
2. `/frontend`: Datensammler-Hook, Story-Viewer, Banner, Archiv-Einstieg, Share-Bild-Export.

## Backend Implementation Notes

**Erledigt am:** 2026-07-17 · **Ergebnis: Keine neue Backend-Arbeit nötig — die einzige Backend-Anforderung war bereits vorhanden.**

Der in der Umsetzungs-Reihenfolge (Schritt 1) geplante Baustein „Migration `completed_at` + Trigger" wurde bereits **vollständig von PROJ-17 (Memory Cards & Album)** geliefert und ist auf der Produktions-DB live. PROJ-17 brauchte denselben fälschungssicheren Abschluss-Zeitstempel und hat ihn identisch zur PROJ-18-Technical-Decision gebaut.

Migration `20260716101227_proj17_activity_completed_at.sql` (+ Härtung `20260716101643_proj17_harden_trigger_functions.sql`) liefert:

| PROJ-18-Anforderung | Live auf Remote (verifiziert `execute_sql`) |
|---|---|
| Feld `activities.completed_at timestamptz` | ✅ vorhanden |
| Von DB-Trigger gesetzt beim Wechsel auf `abgeschlossen` | ✅ `trg_activity_completed_at` aktiv, setzt `now()` beim Eintritt, erhält den Wert solange abgeschlossen, leert bei Verlassen |
| Fälschungssicher (Client kann nicht schreiben) | ✅ `set_activity_completed_at()` von public/anon/authenticated `revoke`d — kein EXECUTE-Recht |
| Bestandsdaten zugeordnet | ✅ Backfill `coalesce(start_date, created_at)`; 0 abgeschlossene Aktivitäten ohne Zeitstempel |
| Index für die Rückblick-Query | ✅ `idx_activities_completed_at` |

Die Jahreszuordnungs-Fallback-Kette (`start_date` → `completed_at` → `created_at`) ist reine Client-Leselogik und gehört in den Datensammler-Hook (`useGroupWrapped`) → `/frontend`.

Alle weiteren Datenquellen des Rückblicks (`activity_votes`, `group_members`, `profiles`, `group_momentum`, `groups`) bestehen bereits und sind RLS-geschützt — damit ist die Sicherheits-AC „Nicht-Mitglied erhält keine Daten" ohne neue Policies erfüllt. Es wurde bewusst **keine** duplizierte `completed_at`-Migration angelegt (würde mit PROJ-17 kollidieren).

**Fazit:** Backend ist ein No-op. Feature ist bereit für `/frontend`.

## Frontend Implementation Notes

**Erledigt am:** 2026-07-17 · **Feature-Name in der App:** „Mellon Rückblick" (interne Bezeichner neutral `wrapped`).

### Neue Dateien
| Datei | Zweck |
|---|---|
| `src/lib/wrapped.ts` | Reine Rechen-Datei: Jahres-/Monatsregel (Fallback-Kette `start_date → completed_at → created_at`, lokale Zeit), Saison-Gate (Dezember), Verfügbarkeits-/Archiv-Jahre, **`buildWrappedSlides`** mit allen Zähl-, Gleichstands- und Skip-Regeln. Kein Supabase/React. |
| `src/lib/wrapped.test.ts` | 26 Unit-Tests: Jahreszuordnung inkl. UTC-Off-by-one, Saison, Archiv-Jahre, Shout-out-Tie/Fallthrough/>3-Skip, Momentum-Meilenstein-Herleitung, Top-Monat/-Aktivität-Gleichstände. |
| `src/hooks/useWrappedAvailability.ts` | Leichte Vorab-Prüfung (nur abgeschlossene Aktivitäten, Realtime auf `activities`) → `availableYears` (Archiv) + `currentYearLive` (Banner). |
| `src/hooks/useGroupWrapped.ts` | Datensammler: lädt beim Öffnen Aktivitäten/Votes/Mitglieder/Profile/Momentum der Gruppe und ruft `buildWrappedSlides`. Liefert nur anzeigbare Slides. |
| `src/lib/wrapped-share.ts` | Bild-Export via `html-to-image` (Design-Bühne 360×640 → `pixelRatio 3` → 1080×1920) + Teilen (nativ / Web-Share / Download-Fallback). |
| `src/lib/native/share-image.ts` | Native Share-Bridge (Cache-Datei + Share-Sheet), exakt nach PROJ-7/9-Muster. |
| `src/components/wrapped/WrappedSlide.tsx` | Eine Slide (9 Typen), hart kodierte warme Paletten (identisch für Anzeige & PNG), Serif für Nutzer-Inhalte. |
| `src/components/wrapped/WrappedStoryViewer.tsx` | Vollbild-Story-Viewer (z-[70]): Fortschritts-Segmente, Tipp-Zonen (rechts/links), Schließen/Teilen, Tastatur (Pfeile/Escape), unsichtbare Share-Bühne. |
| `src/components/wrapped/WrappedBanner.tsx` | Saisonaler Teaser-Banner (invertierter Grün-Block). |
| `src/components/wrapped/WrappedArchiveSection.tsx` | Ganzjähriger Archiv-Einstieg im Gruppen-Detail-Sheet (Jahrgangs-Liste + Leerzustand). |

### Integration
- `GroupShellContext` um `openWrapped(year)` erweitert; die Group-View-Seite hält `wrappedYear` und rendert den Viewer auf Shell-Ebene (neben Momentum-Feier / Card-Reveal, z-[70] über allem).
- `VorschlaegeTab`: Teaser-Banner über dem Momentum-Banner, nur wenn `currentYearLive` (Dezember + ≥ 3 Abschlüsse).
- `GroupDetailSheet`: neue Pflicht-Prop `onOpenWrapped`; Archiv-Sektion unter der Mitgliederliste (schließt das Sheet und öffnet den Viewer).

### Abweichungen / Entscheidungen im /frontend
- **Archiv als Sektion im Detail-Sheet** statt separatem verschachteltem Modal — vermeidet Modal-in-Modal, bleibt konsistent mit den übrigen Sektionen (InviteCode, Mitglieder).
- **Shout-out-Avatare als Initialen-Medaillons** (kein externes Bild) — robust für `html-to-image` (kein CORS-Taint) und konsistent mit `MemberRow`.
- **Slide-Farben hart kodiert** (nicht Theme-Tokens) — die Slides sind ein eigenständiger, immersiver Look, identisch in Light/Dark und im geteilten PNG (gleiches Vorgehen wie PROJ-15-Feier / PROJ-17-Reveal).
- **Momentum-Slide** erscheint, sobald eine `group_momentum`-Akte existiert (zeigt dann Level + ggf. Jahres-Meilensteine); ohne Akte wird sie übersprungen.

### Verifikation
- `npm run build` grün (TypeScript + Static Export). `npx vitest run`: **396/396** Tests grün (davon 26 neu für `wrapped.ts`).
- Live-Smoke-Test (QA-Account, iPhone-Emulation, lokal): Gruppe lädt ohne Fehler, **kein** Teaser-Banner im Juli (Saison-Gate korrekt), Archiv-Sektion rendert mit korrektem Leerzustand, keine Konsolen-Fehler aus den neuen Hooks/Realtime.
- **Nicht live gefahren:** das visuelle Abspielen des Story-Viewers mit echten Slide-Daten — dafür bräuchte eine Gruppe ≥ 3 Abschlüsse in einem vergangenen Jahr; das Seeden von Produktionsdaten wurde bewusst geblockt und nicht umgangen. Die Slide-Erzeugung (Datengrundlage des Viewers) ist über die 26 Unit-Tests abgedeckt. → In `/qa` mit Testdaten visuell prüfen (Slides, Tipp-Navigation, Bild-Export/Teilen, lange Namen).

### Offen für /qa
- Story-Viewer mit echten Daten (Slides 1–9, Skip-Verhalten, Tipp-Zonen, Fortschritt).
- Bild-Export & Teilen: nativ (Share-Sheet) und Web (Web-Share bzw. Download-Fallback).
- Lange Aktivitäts-/Nutzernamen auf Slides (Umbruch/Clamp).
- Dezember-Freischaltung (Saison-Gate) — ggf. per Systemdatum/Testdaten.

## QA Test Results

**Tested:** 2026-07-17
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)

### Testansatz
Der Rückblick ist gezielt so gebaut, dass die gesamte Zähl-/Skip-/Gleichstands-Logik in der reinen
`wrapped.ts` isoliert testbar liegt (**26 Unit-Tests, alle grün**). Die visuellen ACs (9 Slide-Typen,
lange Namen, Story-Format, Branding-Fuß) wurden über eine wegwerfbare Render-Bühne (`/qa-wrapped`,
nach dem Test wieder entfernt) mit echten Slide-Formen im Browser (Chrome) verifiziert und danach
gelöscht. Produktions-/QA-Daten wurden bewusst **nicht** geseedet (Vorgabe aus `/frontend`).
Volle Suite: **396/396 Unit-Tests grün**, `npm run build` (Static Export, 13 Routen) grün.

### Acceptance Criteria Status

#### Verfügbarkeit & Einstieg
- [x] ≥ 3 Abschlüsse + ab 1.12. → Teaser-Banner (`isCurrentYearWrappedLive`, unit-getestet; `VorschlaegeTab`-Integration geprüft)
- [x] < 3 Abschlüsse im Dezember → kein Banner/kein Wrapped (unit-getestet)
- [x] Vor dem 1.12. → kein Banner, unabhängig von der Aktivitätszahl (Saison-Gate `isWrappedSeason`, unit-getestet)
- [x] Jede Rolle (Admin/Redakteur/Beobachter) sieht das Wrapped gleich — keine Rollen-Gatekeeper im Code (kollektiv)
- [x] Archiv listet alle Vorjahre mit ≥ 3 Abschlüssen, neueste zuerst (`availableWrappedYears` unit-getestet; `WrappedArchiveSection` inkl. Leerzustand gerendert)

#### Story-Viewer
- [x] Öffnet bei Slide 1 mit Fortschritts-Segmenten (Code-Review + Render-Bühne)
- [x] Rechte Hälfte = weiter, linke = zurück (Tipp-Zonen als aria-beschriftete Buttons; Kontroll-Buttons liegen mit z-10 darüber)
- [x] Schließen-Button schließt das Overlay (Escape ebenfalls; `onClose`)
- [x] Slide ohne Daten wird still übersprungen — Reihenfolge bleibt (Skip im Datensammler, unit-getestet: votes/momentum/shoutout/top-activity/top-month)
- [x] Live-Berechnung: jedes Öffnen lädt frisch, kein Snapshot (`useGroupWrapped` re-fetcht bei `year`-Wechsel)

#### Inhalte & Zählregeln
- [x] Slide 2 zählt nur `abgeschlossen`-Aktivitäten mit Bezugsdatum im Jahr (Fallback `start_date → completed_at → created_at`, unit-getestet inkl. UTC-Off-by-one)
- [x] Top-Aktivität bei Vote-Gleichstand → früher stattgefunden (unit-getestet); ohne Votes übersprungen
- [x] Aktivster Monat bei Gleichstand → früherer Monat (unit-getestet)
- [x] Momentum-Slide: aktuelles Level + im Jahr überschrittene Meilensteine (5/10/25), hergeleitet (unit-getestet)
- [x] Ideengeber:in-Shout-out: eigener Name + eigene Zahl, keine Fremdzahlen (unit-getestet)
- [x] Gleichstand: bis 3 gemeinsam, > 3 entfällt (unit-getestet)
- [x] Erstplatzierte:r hat Gruppe verlassen → nächste Stufe rückt nach / sonst entfällt (unit-getestet)

#### Teilen
- [x] Slide-Bild im Story-Format 9:16 mit dezentem Branding-Fuß „MELLON RÜCKBLICK · {Jahr}" (Share-Bühne 360×640 → `pixelRatio 3` → 1080×1920; `variant="share"` gerendert)
- [~] Browser ohne Web-Share → Download-Fallback: Code-Review korrekt (`navigator.canShare` → sonst `<a download>`); **nicht end-to-end** aus dem Viewer mit Live-Daten ausgelöst (siehe Restrisiko)
- [~] Nativ (Capacitor) Share-Sheet: exakt das erprobte PROJ-7/9-Muster (Cache-Datei + `Share.share`); Code-Review, nicht auf Gerät ausgelöst

#### Sicherheit
- [x] Nicht-Mitglied erhält keine Daten: rein lesend über bestehende, RLS-geschützte Tabellen (`groups`, `activities`, `group_members`, `group_momentum`, `profiles`, `activity_votes`); keine neuen Tabellen/Policies. Realtime-Kanal signalisiert nur Refetch, der für Nicht-Mitglieder leer bleibt.

### Edge Cases Status
- [x] **Lange Aktivitäts-/Gruppen-/Nutzernamen:** kein Frame bricht das 9:16-Layout (`scrollWidth==clientWidth` je Slide-Root; H2 `break-words line-clamp-3/4`, Rest-Delta 2px sub-pixel). Visuell bestätigt.
- [x] **Knapp unter der Schwelle (2 Abschlüsse):** kein Wrapped; 3. Aktivität im Dezember schaltet live frei (unit-getestet)
- [x] **Aktivität ohne Startdatum:** Fallback-Kette → genau ein Jahr (unit-getestet)
- [x] **Shout-out-Kandidat:in hat Gruppe verlassen:** nur aktuelle Mitglieder (unit-getestet)
- [x] **Jahreswechsel:** ab 1.1. nur noch übers Archiv, Banner erst wieder am 1.12. (Saison-Gate)
- [x] **Momentum-Akte fehlt:** Slide entfällt (unit-getestet)

### Security Audit Results
- [x] Authorization: Datenzugriff ausschließlich über RLS der Quelltabellen; Client schreibt nichts (`completed_at` per Trigger, für Clients revoke'd)
- [x] Input/XSS: alle Slide-Inhalte als React-Textknoten gerendert (kein `dangerouslySetInnerHTML`); Avatare als Initialen-Medaillons (kein externes Bild → kein CORS-Taint im PNG)
- [x] Keine Secrets/sensiblen Felder in den Queries (nur `display_name`, Zählwerte, Datumsfelder)
- [x] Kein öffentlicher Share-Link — Gruppendaten verlassen die App nur als bewusst geteiltes Bild

### Bugs Found
Keine Critical-, High-, Medium- oder Low-Bugs.

#### Beobachtungen (kein Bug, spec-konform)
- **OBS-1 (Info):** Die Momentum-Slide eines **archivierten** Jahrgangs zeigt das *heutige* Gruppen-Level (Live-Zähler `group_momentum`), während die Meilensteine korrekt jahresbezogen sind. Das entspricht der Spec-Formulierung „Aktuelles Gruppen-Level", kann auf einem alten Rückblick aber leicht inkonsistent zu den Jahres-Meilensteinen wirken. Bewusst als spec-konform akzeptiert.
- **OBS-2 (Info):** Top-Aktivität berücksichtigt nur abgeschlossene Aktivitäten, der Ideengeber-Shout-out zählt Vorschläge aller Status. Beide Lesarten sind spec-gedeckt (Slide 4 „Aktivität des Jahres" vs. Slide 7 „Vorschläge eingebracht").

### Restrisiko (nicht end-to-end verifiziert)
Das Auslösen des **Teilen-Flows aus dem laufenden Viewer mit Live-Daten** (html-to-image-Export → natives Share-Sheet bzw. Web-Share/Download) wurde nicht end-to-end gefahren, da dafür eine Gruppe mit ≥ 3 Abschlüssen in einem Jahr geseedet werden müsste (bewusst geblockt). Slide-Rendering (Datengrundlage des Exports) und beide Fallback-Pfade sind über Render-Bühne bzw. Code-Review abgedeckt; der native Pfad ist 1:1 das in Produktion bewährte PROJ-7/9-Muster. Empfehlung: beim ersten realen Dezember-Wrapped (oder mit einer QA-Testgruppe mit Alt-Daten) das Teilen einmal auf Gerät bestätigen.

### Summary
- **Acceptance Criteria:** 20/20 erfüllt (2 Teilen-ACs code-verifiziert statt end-to-end — siehe Restrisiko)
- **Bugs Found:** 0 (0 Critical, 0 High, 0 Medium, 0 Low) + 2 spec-konforme Beobachtungen
- **Security:** Pass (rein lesend über bestehende RLS, keine neue Angriffsfläche)
- **Tests:** 396/396 Unit-Tests grün · `npm run build` (Static Export) grün
- **Production Ready:** YES
- **Recommendation:** Deploy — Restrisiko (Teilen-Flow auf Gerät) beim ersten echten Wrapped bestätigen.

## Deployment

**Deployed:** 2026-07-17 · **Production URL:** https://qt-voting-app.vercel.app

### Pre-Deployment Checks
- ✅ `npm run build` grün — Static Export, 13 Routen, TypeScript-Check bestanden
- ✅ `npx vitest run` grün — **396/396** Unit-Tests (26 neu für `wrapped.ts`)
- ✅ QA approved (20/20 ACs, 0 Bugs, Production Ready: YES)
- ✅ Keine Secrets im Diff; neue Abhängigkeit `html-to-image@^1.11.13` in `package.json` + `package-lock.json` gepinnt
- ✅ Keine neue Migration nötig — `activities.completed_at` (Trigger, fälschungssicher) bereits mit PROJ-17 live
- ⚠️ `npm run lint` projektweit defekt (`next lint` in Next.js 16 entfernt) — betrifft den Vercel-Build **nicht**; Typsicherheit deckt der TS-Check im Build ab

### Deploy
- Auto-Deploy via Push auf `main` → Vercel-Projekt `qt-voting-app`
- Deployte Dateien: `src/lib/wrapped.ts` (+ Tests), `src/lib/wrapped-share.ts`, `src/lib/native/share-image.ts`, `src/hooks/useGroupWrapped.ts`, `src/hooks/useWrappedAvailability.ts`, `src/components/wrapped/*` + Integration in `groups/view/page.tsx`, `GroupDetailSheet`, `GroupShellContext`, `VorschlaegeTab`

### Restrisiko (aus /qa, unverändert)
Der Teilen-Flow (html-to-image-Export → natives Share-Sheet / Web-Share / Download) wurde nicht end-to-end mit Live-Daten gefahren (setzt eine Gruppe mit ≥ 3 Abschlüssen voraus, Seeden bewusst geblockt). Slide-Rendering und beide Fallback-Pfade sind über Render-Bühne/Code-Review abgedeckt; der native Pfad ist 1:1 das in Produktion bewährte PROJ-7/9-Muster. **Beim ersten echten Dezember-Wrapped einmal auf Gerät bestätigen.**

# PROJ-17: Memory Cards & Album (Gamification)

## Status: In Progress
**Created:** 2026-07-13
**Last Updated:** 2026-07-16

## Dependencies
- PROJ-6 (Aktivitäts-Detail) — Erinnerungsfotos (`activity_photos`), `og_image_url` als Cover-Quelle, `ActivityDetailSheet` mit `readOnly`-Modus
- PROJ-8 (Nutzerprofil & Archiv) — der bestehende Archiv-Tab im ProfileSheet wird zum Album umgebaut (erweitern, nicht duplizieren)
- PROJ-15 (Gruppen-Momentum) — Abstimmung der Overlay-Reihenfolge bei gleichzeitigem Meilenstein (Feier vor Karten-Reveal)

## Kontext

Memory Cards sind das zweite Feature des Gamification-Dachkonzepts **„Momentum"**. Beim Statuswechsel einer Aktivität auf `abgeschlossen` entsteht **automatisch** eine visuell gestaltete Sammelkarte (Cover, Titel, Datum, Gruppe, Farbakzent) — ohne jeden zusätzlichen Dateninput. Das persönliche **Album** ersetzt die bisherige Archiv-Liste im Profil-Sheet durch ein Sammelkarten-Grid: Aus dem nüchternen Archiv wird ein füllendes Sammelerlebnis. Die Karte ist eine **abgeleitete Ansicht** der Aktivität, kein eigenständig editierbares Objekt.

## User Stories
- Als Gruppenmitglied möchte ich, dass beim Abschluss einer Aktivität automatisch eine gestaltete Erinnerungskarte entsteht, damit unsere Unternehmung ohne Zusatzaufwand festgehalten wird.
- Als Person, die eine Aktivität abschließt, möchte ich die neue Karte sofort in einer Aufdeck-Animation sehen, damit sich der Abschluss belohnend anfühlt.
- Als angemeldeter Nutzer möchte ich im Profil ein Album mit allen Karten aus allen meinen Gruppen durchstöbern, damit meine gemeinsamen Erinnerungen an einem Ort gesammelt sind.
- Als Gruppenmitglied möchte ich neue, noch nicht gesehene Karten im Album markiert sehen, damit ich keine Erinnerung verpasse, die jemand anderes abgeschlossen hat.
- Als Mitglied einer bestehenden Gruppe möchte ich, dass unsere früheren abgeschlossenen Aktivitäten rückwirkend Karten bekommen, damit unser Album nicht leer startet.

## Out of Scope
- Teilen/Export einer Karte als Bild (nativer Share-Dialog, Canvas-Rendering) — bewusst verschoben auf PROJ-18 (ZUSAMMEN Wrapped)
- Kurator-Funktionen: Cover manuell wählen, Erinnerungssatz/Caption hinzufügen, Karte bearbeiten — Karte bleibt vollautomatisch abgeleitet
- Reveal-Animation für andere Mitglieder als den Abschließenden — bewusste Abweichung von der PROJ-15-Feier-Mechanik (siehe Product Decisions); andere sehen nur das „Neu"-Badge
- Gruppen-Album innerhalb des Gruppen-Bereichs — Album ist ausschließlich persönlich im Profil (ggf. Follow-up)
- Neues Emoji-/Themen-Kategorie-Feld an Aktivitäten — visuelle Vielfalt kommt aus Cover-Fotos + Dauer-Kategorie-Farbakzent
- Seltenheitsstufen, Sammel-Slots, „fehlende Karten"-Mechanik (Panini-Stil)
- Retroaktive Reveal-Animationen oder „Neu"-Badges für Backfill-Karten
- Benachrichtigungen („Neue Karte in eurem Album") — keine Erweiterung von PROJ-12
- Video-Cover (analog PROJ-6: nur Bilder)

## Acceptance Criteria

### Karten-Erzeugung (automatisch)

- [ ] Angenommen eine Aktivität wechselt in den Status `abgeschlossen`, dann existiert dafür genau eine Memory Card, die im Album aller Mitglieder der Gruppe erscheint.
- [ ] Angenommen eine Karte wird angezeigt, dann zeigt ihre Vorderseite: Cover-Motiv, Aktivitäts-Titel, Datum, Gruppen-Badge und einen Rahmen-/Farbakzent entsprechend der Dauer-Kategorie (spontan / Wochenende / längerer Zeitraum).
- [ ] Angenommen die Aktivität hat einen Termin (`start_date`), dann zeigt die Karte diesen Termin als Datum; andernfalls das Abschlussdatum.
- [ ] Angenommen die Gruppe hatte vor dem Feature-Launch bereits abgeschlossene Aktivitäten, wenn das Album erstmals geladen wird, dann erscheinen diese vollständig als Karten (Backfill) — ohne Reveal-Animation und ohne „Neu"-Badge.

### Cover-Motiv (dynamisch)

- [ ] Angenommen die Aktivität hat noch keine Erinnerungsfotos, aber ein Link-Vorschaubild (`og_image_url`), dann zeigt die Karte dieses Bild als Cover.
- [ ] Angenommen die Aktivität hat weder Erinnerungsfotos noch `og_image_url`, dann zeigt die Karte einen gestalteten Platzhalter im Styleguide-Look (kein leeres/gebrochenes Bild).
- [ ] Angenommen das erste Erinnerungsfoto wird zur Aktivität hochgeladen (PROJ-6), dann wird es automatisch zum Cover der Karte und ersetzt Vorschaubild bzw. Platzhalter.
- [ ] Angenommen das aktuelle Cover-Foto wird gelöscht, dann wird das älteste verbleibende Erinnerungsfoto zum Cover; existiert keines mehr, fällt das Cover auf `og_image_url` bzw. den Platzhalter zurück.

### Karten-Reveal (nur für den Abschließenden)

- [ ] Angenommen ein Mitglied bestätigt den Statuswechsel einer Aktivität auf `abgeschlossen`, dann sieht dieses Mitglied unmittelbar eine Vollbild-Aufdeck-Animation (Karten-Flip), die die neue Memory Card zeigt.
- [ ] Angenommen die Reveal-Animation wird angezeigt, wenn das Mitglied irgendwo tippt, dann schließt sich der Reveal (Dismiss).
- [ ] Angenommen durch denselben Abschluss wird gleichzeitig ein Momentum-Meilenstein erreicht (PROJ-15), dann erscheint zuerst die Meilenstein-Feier; nach deren Dismiss folgt der Karten-Reveal.
- [ ] Angenommen ein anderes Mitglied hat die Aktivität abgeschlossen, dann sehe ich keine Reveal-Animation — die Karte erscheint für mich still im Album mit „Neu"-Badge.

### Album (Archiv-Tab wird zum Karten-Grid)

- [ ] Angenommen der Nutzer öffnet im Profil-Sheet den Tab „Album" (ehemals „Archiv"), dann sieht er seine Memory Cards als 2-spaltiges Karten-Grid (mobil), sortiert nach Datum absteigend (neueste zuerst), gruppenübergreifend aus allen Gruppen, in denen er Mitglied ist oder war.
- [ ] Angenommen der Nutzer ist in mehreren Gruppen, dann erscheinen über dem Grid Filter-Chips („Alle" + eine pro Gruppe); die Auswahl eines Chips filtert das Grid auf diese Gruppe.
- [ ] Angenommen noch keine Aktivität abgeschlossen wurde, dann zeigt das Album einen Leer-State: „Noch keine Erinnerungen — schließt eure erste Aktivität ab und eure erste Karte erscheint hier!"
- [ ] Angenommen es existieren mehr als 20 Karten, dann werden weitere über einen „Mehr laden"-Button nachgeladen (bestehendes Paginierungs-Muster).
- [ ] Angenommen der Nutzer tippt auf eine Karte, dann öffnet sich das bestehende ActivityDetailSheet im read-only-Modus (Fotos, Kommentare, Termin sichtbar; keine Mutationen).

### „Neu"-Badge (ungesehene Karten)

- [ ] Angenommen seit dem letzten Album-Besuch des Nutzers sind neue Karten entstanden, dann tragen diese Karten im Grid ein „Neu"-Badge.
- [ ] Angenommen der Nutzer hat das Album geöffnet, dann gelten alle bis dahin entstandenen Karten als gesehen — beim nächsten Öffnen tragen sie kein „Neu"-Badge mehr.
- [ ] Angenommen es existieren ungesehene Karten, dann zeigt der Tab „Album" im Profil-Sheet einen Punkt-Indikator, damit der Nutzer den Grund zum Reinschauen sieht.
- [ ] Angenommen der Nutzer hat das Album noch nie geöffnet (Erstnutzung nach Launch), dann tragen Backfill-Karten kein „Neu"-Badge.

### Konsistenz mit bestehendem Verhalten

- [ ] Angenommen ein Admin löscht eine abgeschlossene Aktivität, dann verschwindet die zugehörige Karte aus allen Alben (konsistent mit Archiv und PROJ-15-Live-Count).
- [ ] Angenommen der Nutzer hat eine Gruppe verlassen, dann bleiben die Karten dieser Gruppe in seinem Album sichtbar (PROJ-8-Prinzip: die Erinnerung gehört dem Nutzer) und die Gruppe erscheint weiterhin als Filter-Chip.

## Edge Cases
- **Reveal unterbrochen (App-Crash, Offline direkt nach Abschluss):** Der Reveal wird nicht nachgeholt — die Karte erscheint beim nächsten Album-Besuch regulär (ggf. mit „Neu"-Badge). Kein Retry-Mechanismus.
- **Zwei Mitglieder schließen quasi-gleichzeitig zwei Aktivitäten ab:** Jedes Mitglied sieht nur den Reveal der selbst abgeschlossenen Karte; die andere Karte erhält bei ihm das „Neu"-Badge.
- **Aktivität ohne Termin abgeschlossen:** Karte zeigt das Abschlussdatum statt des Termins (siehe Open Question zur Datumsquelle).
- **Cover-Foto wird gelöscht:** Fallback-Kette ältestes verbleibendes Foto → `og_image_url` → Styleguide-Platzhalter; nie ein gebrochenes Bild.
- **`og_image_url` liefert 404 / lädt nicht:** Platzhalter wird angezeigt (Fehlerbild abfangen).
- **Sehr langer Aktivitäts-Titel:** Titel wird auf der Karte auf max. 2 Zeilen gekürzt (Ellipsis); voller Titel im Detail-Sheet.
- **Album mit 100+ Karten:** Pagination à 20 Karten hält das Grid performant; Filter-Chips arbeiten serverseitig (Query-Filter), nicht client-seitig über alle geladenen Karten.
- **Meilenstein-Feier + Karten-Reveal gleichzeitig:** Sequenziell, nie gestapelt — Feier zuerst (seltener, größerer Moment), Reveal danach.
- **Gruppe wird komplett gelöscht:** Verhalten folgt dem bestehenden Archiv-Verhalten bei Gruppenlöschung (Aktivitäten werden kaskadiert gelöscht → Karten verschwinden).

## Technical Requirements
- **Abgeleitete Daten:** Die Karte ist eine Ansicht der bestehenden `activities`-/`activity_photos`-Daten — ob eine eigene Karten-Tabelle nötig ist (z.B. für den Gesehen-Status), entscheidet /architecture
- **Kein Realtime nötig:** Das Album ist eine persönliche Ansicht; „Neu"-Badges werden beim Öffnen berechnet — keine Live-Subscription erforderlich
- **Static Export Kompatibilität:** Kein SSR; alle Datenoperationen client-seitig via Supabase JS + RLS
- **RLS:** Nutzer sieht nur Karten aus Gruppen, in denen er Mitglied ist oder war (bestehende Archiv-Query als Basis)
- **Performance:** Album-Grid lädt in Chunks à 20; Cover-Bilder lazy-loaden

## Open Questions
- [x] **Quelle des Abschlussdatums:** Entschieden — neue Spalte „Abschlussdatum" an der Aktivität, automatisch von der Datenbank gesetzt beim Wechsel auf `abgeschlossen`; Altdaten bekommen rückwirkend Termin bzw. Erstelldatum als Näherung (siehe Tech Design). | 2026-07-14
- [x] **Speicherung des Gesehen-Status:** Entschieden — ein einzelner Zeitstempel „Album zuletzt geöffnet" pro Nutzer (nicht ein Vermerk pro Karte); „Neu" = Karte jünger als der Zeitstempel (siehe Tech Design). | 2026-07-14
- [x] **Karten nach Gruppen-Austritt:** Nutzer-Entscheidung 2026-07-14 — die seit PROJ-8 bestehende Lücke (Zugriff endet faktisch mit der Mitgliedschaft) wird in PROJ-17 vollständig geschlossen: Mitgliedschafts-Historie + erweiterte Lese-Rechte (siehe Tech Design, Baustein 3). | 2026-07-14

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Karte ist vollautomatisch abgeleitet, kein Kurator-Schritt | Null Zusatzaufwand für Nutzer — der Kernloop endet ohnehin mit Abschluss + Fotos; Kurator-UI wäre Scope ohne MVP-Mehrwert | 2026-07-13 |
| Album ersetzt den Archiv-Tab im Profil-Sheet (persönlich, gruppenübergreifend) | „Erweitern, nicht duplizieren" (Momentum-Konzept); PROJ-8-Philosophie „Erinnerung gehört dem Nutzer"; kein neuer Navigations-Einstieg | 2026-07-13 |
| Reveal-Animation nur für den Abschließenden, andere bekommen „Neu"-Badge | Bewusste Nutzer-Entscheidung gegen die PROJ-15-Mechanik (Feier für alle): weniger Overlay-Druck bei häufigem Ereignis (jeder Abschluss vs. seltene Meilensteine) | 2026-07-13 |
| Dynamisches Cover: og_image_url/Platzhalter → erstes Erinnerungsfoto | Beim Abschluss existieren noch keine Fotos (PROJ-6 erlaubt Upload erst ab `abgeschlossen`); Karte wird mit der Zeit „schöner" — Anreiz, Fotos hochzuladen | 2026-07-13 |
| Karten-Tap öffnet bestehendes ActivityDetailSheet (readOnly) | Keine Duplikation — Fotos, Kommentare, Termin sind dort bereits read-only verfügbar (PROJ-8-Muster) | 2026-07-13 |
| Stiller Backfill für Alt-Aktivitäten (ohne Reveal/„Neu") | Konsistent mit PROJ-15 (zählen ja, feiern nein); Album ist ab Tag 1 gefüllt statt leer — stärkerer Ersteindruck | 2026-07-13 |
| Visuelle Vielfalt über Farbakzent je Dauer-Kategorie | Einzige vorhandene Kategorisierung; kein neues Datenfeld nötig; Vielfalt kommt primär aus Cover-Fotos; finale Farbzuordnung im /frontend | 2026-07-13 |
| Kein Teilen/Export in diesem Feature | Teilbarer Rückblick ist das Kernversprechen von PROJ-18 (Wrapped); Bild-Rendering + native Share-Integration wären eigener Aufwand | 2026-07-13 |
| Grid neueste zuerst + Gruppen-Filter-Chips | Chronologie = Erinnerungs-Gefühl; Filter löst das Unübersichtlichkeits-Problem bei mehreren Gruppen; Gruppen-Badge auf der Karte bleibt | 2026-07-13 |
| Bei gleichzeitigem Meilenstein: Momentum-Feier vor Karten-Reveal, sequenziell | Meilensteine sind selten und der größere Moment; gestapelte Overlays wären erdrückend — maximal 3× je Gruppe überhaupt möglich (5/10/25) | 2026-07-13 |
| Punkt-Indikator am Album-Tab bei ungesehenen Karten | Ohne Hinweis würden „Neu"-Karten nie entdeckt (Album liegt hinter zwei Taps); minimaler UI-Aufwand | 2026-07-13 |
| Datum auf der Karte: Termin (falls gesetzt), sonst Abschlussdatum | Für die Erinnerung zählt, wann die Unternehmung stattfand — nicht, wann jemand den Status umgestellt hat | 2026-07-13 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Keine eigene Karten-Tabelle — Karte ist eine abgeleitete Ansicht der Aktivität | Spec-Vorgabe („abgeleitete Ansicht"); kein Sync-Problem bei Titel-/Foto-Änderungen; Löschung der Aktivität lässt die Karte automatisch verschwinden (AC erfüllt sich von selbst) | 2026-07-14 |
| Neue Spalte „Abschlussdatum" (`completed_at`) an `activities`, gesetzt per DB-Automatik beim Statuswechsel | Einzige verlässliche Quelle für Karten-Datum + Album-Sortierung + „Neu"-Erkennung; Client kann sie nicht fälschen (gleiche Philosophie wie PROJ-15-Zähler) | 2026-07-14 |
| Backfill Abschlussdatum für Altdaten: Termin (`start_date`), sonst Erstelldatum | Beste verfügbare Näherung; deckt sich mit der Produktentscheidung „für die Erinnerung zählt, wann es stattfand" | 2026-07-14 |
| Gesehen-Status als EIN Zeitstempel „Album zuletzt geöffnet" pro Nutzer (Spalte am Profil) statt Vermerk pro Karte | AC-Semantik („alle bis dahin entstandenen Karten gelten als gesehen") ist exakt Zeitstempel-Logik; eine Zeile pro Nutzer statt Nutzer×Karten-Zeilen; kein Aufräumbedarf | 2026-07-14 |
| Backfill Gesehen-Zeitstempel = Launch-Zeitpunkt für alle Bestandsnutzer; Neu-Nutzer starten mit Registrierungszeitpunkt | Backfill-Karten tragen nie „Neu" (AC); analog PROJ-15-Seeding („Historie zählt, aber keine rückwirkende Feier") | 2026-07-14 |
| Mitgliedschafts-Historie: neue Tabelle „ehemalige Mitgliedschaften", automatisch befüllt beim Austritt/Entfernen; Lese-Rechte werden auf „ist ODER war Mitglied" erweitert (nur Lesen, nie Schreiben) | Schließt die PROJ-8-Lücke „Erinnerung gehört dem Nutzer" auf Datenebene; Schreibrechte bleiben strikt bei aktiven Mitgliedern; Nutzer-Entscheidung 2026-07-14 | 2026-07-14 |
| Karten-Reveal rein client-seitig, ohne Persistenz | Edge Case laut Spec: verpasster Reveal wird nicht nachgeholt — es gibt also nichts zu speichern; der Abschließende hat alle Kartendaten bereits lokal | 2026-07-14 |
| Cover-Kette (ältestes Foto → Link-Vorschaubild → Platzhalter) wird beim Anzeigen berechnet, nicht gespeichert | Kein gespeicherter Cover-Verweis kann veralten (Foto gelöscht = Kette rutscht automatisch nach); ein Zusatz-Query pro Album-Seite genügt | 2026-07-14 |
| Flip-Animation mit CSS (Tailwind), kein neues Package | Projekt nutzt bereits `tailwindcss-animate` (PROJ-15-Feier); ein Karten-Flip ist mit CSS-3D-Transform ohne Library machbar | 2026-07-14 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

**Stand:** 2026-07-14 · **Braucht Backend:** Ja (3 Datenbank-Bausteine) · **Neue Packages:** Keine

### Grundidee

Die Memory Card ist **keine neue Sache in der Datenbank** — sie ist eine hübsche Darstellung von Daten, die es schon gibt (Aktivität + Fotos + Gruppe). Es gibt daher keine „Karten-Tabelle", nichts kann aus dem Takt geraten, und wenn eine Aktivität gelöscht wird, verschwindet die Karte automatisch mit.

Drei Dinge fehlen der Datenbank heute, damit das Album funktioniert — das sind die drei Backend-Bausteine:

### A) Komponenten-Struktur

```
Profil-Sheet (bestehend)
+-- Tab „Profil" (unverändert)
+-- Tab „Album" (umbenannt von „Archiv", mit Punkt-Indikator bei ungesehenen Karten)
    +-- Filter-Chips („Alle" + eine pro Gruppe — nur sichtbar bei >1 Gruppe)
    +-- Karten-Grid (2 Spalten mobil)
    |   +-- Memory Card (NEU)
    |       +-- Cover-Bild (lazy geladen) bzw. gestalteter Platzhalter
    |       +-- Farbakzent nach Dauer-Kategorie (spontan/Wochenende/länger)
    |       +-- Titel (max. 2 Zeilen), Datum, Gruppen-Badge, ggf. „Neu"-Badge
    +-- „Mehr laden"-Button (bestehendes Muster, 20er-Schritte)
    +-- Leer-State („Noch keine Erinnerungen …")
    +-- Tap auf Karte → bestehendes ActivityDetailSheet (read-only, unverändert)

Gruppen-Ansicht (bestehend)
+-- Karten-Reveal-Overlay (NEU) — Vollbild-Flip nach eigenem Abschluss
    +-- zeigt exakt dieselbe Memory-Card-Komponente wie das Album
    +-- Tippen irgendwo schließt
    +-- Warteschlangen-Regel: läuft die PROJ-15-Meilenstein-Feier, kommt der
        Reveal erst NACH deren Schließen dran (nie gestapelt)
```

Wiederverwendet wird: ProfileSheet, ActivityDetailSheet (readOnly), das Paginierungs-Muster und der Overlay-Platz der PROJ-15-Feier. Der alte Archiv-Listeneintrag (ArchiveActivityCard) wird durch die Memory Card ersetzt.

### B) Datenmodell (3 Backend-Bausteine, klartext)

**Baustein 1 — Abschlussdatum an der Aktivität.**
Jede Aktivität bekommt ein Feld „abgeschlossen am". Die Datenbank füllt es selbst in dem Moment, in dem der Status auf `abgeschlossen` wechselt — die App kann es weder vergessen noch fälschen (gleiches Prinzip wie der PROJ-15-Zähler). Bestehende abgeschlossene Aktivitäten bekommen rückwirkend ihren Termin als Abschlussdatum, ersatzweise ihr Erstelldatum.
*Genutzt für:* Album-Sortierung (neueste zuerst), Datum auf der Karte (falls kein Termin gesetzt), „Neu"-Erkennung. Nebeneffekt: Das bestehende Archiv sortiert damit endlich korrekt (bisher Behelf über Erstelldatum).

**Baustein 2 — „Album zuletzt geöffnet" pro Nutzer.**
Ein einzelner Zeitstempel am Nutzerprofil. Beim Öffnen des Albums wird er auf „jetzt" gesetzt. Eine Karte gilt als **neu**, wenn ihr Abschlussdatum jünger ist als dieser Zeitstempel — mehr Logik braucht das „Neu"-Badge nicht. Der Punkt-Indikator am Tab ist dieselbe Frage („gibt es mindestens eine neuere Karte?") als Mini-Abfrage.
Bestandsnutzer starten mit „Launch-Zeitpunkt" (→ Backfill-Karten tragen nie „Neu"), neue Nutzer mit ihrem Registrierungszeitpunkt.

**Baustein 3 — Ehemalige Mitgliedschaften (schließt die PROJ-8-Lücke).**
Heute gilt: wer eine Gruppe verlässt, verliert sofort jeden Lese-Zugriff — das PROJ-8-Versprechen „Erinnerungen bleiben" war nie technisch eingelöst. Neu: Beim Austritt (oder Entfernen durch einen Admin) schreibt die Datenbank automatisch einen Eintrag „war Mitglied in Gruppe X". Die Lese-Regeln der betroffenen Tabellen (Aktivitäten, Gruppenname, Fotos, Kommentare, Termine, Umfragen, Mitglieder-Anzeige) werden von „ist Mitglied" auf **„ist oder war Mitglied"** erweitert — **nur fürs Lesen**. Schreiben (abstimmen, kommentieren, Fotos hochladen, Status ändern) können weiterhin ausschließlich aktive Mitglieder. Wird die Gruppe komplett gelöscht, verschwindet alles wie bisher (Kaskade).
*Wichtig fürs Review:* Das ist eine Änderung an Sicherheitsregeln (RLS) — sie wird im /backend-Schritt einzeln zur Freigabe vorgelegt.

**Woher die Karte ihre Inhalte nimmt (nichts davon wird gespeichert):**
- Cover: ältestes Erinnerungsfoto der Aktivität → sonst Link-Vorschaubild (`og_image_url`) → sonst gestalteter Platzhalter im Styleguide-Look. Die Kette wird bei jeder Anzeige neu berechnet — löscht jemand das Cover-Foto, rutscht automatisch das nächste nach.
- Datum: Termin der Aktivität, sonst Abschlussdatum (Baustein 1).
- Farbakzent: bestehendes Feld Dauer-Kategorie (spontan / Wochenende / längerer Zeitraum).
- Titel + Gruppen-Badge: direkt von Aktivität und Gruppe.

### C) Ablauf-Entscheidungen

- **Reveal nur für den Abschließenden, rein lokal:** Direkt nach erfolgreichem Statuswechsel zeigt die App das Overlay mit den Daten, die sie ohnehin schon in der Hand hat — kein Server-Roundtrip, keine Speicherung. Stürzt die App genau dann ab, wird der Reveal nicht nachgeholt (bewusster Spec-Edge-Case); die Karte erscheint einfach im Album.
- **Reihenfolge bei gleichzeitigem Meilenstein:** Erst PROJ-15-Feier, nach deren Dismiss der Karten-Reveal — als simple Warteschlange am selben Ort, an dem die Feier heute schon hängt.
- **Album-Abfrage = bestehende Archiv-Abfrage, drei Anpassungen:** sortiert nach Abschlussdatum statt Erstelldatum, Gruppen-Filter wird an die Datenbank durchgereicht (nicht client-seitig gefiltert), und die Gruppenliste speist sich aus aktiven + ehemaligen Mitgliedschaften.
- **Kein Realtime:** Das Album berechnet „Neu" beim Öffnen — keine Live-Verbindung nötig (Spec-Vorgabe).
- **Performance:** 20 Karten pro Seite (bestehendes Muster); Cover-Bilder werden lazy geladen; ein einziger Zusatz-Query pro Seite holt die Cover-Fotos für alle 20 Karten gebündelt.

### D) Abhängigkeiten

Keine neuen Packages. Flip-Animation über CSS/Tailwind (`tailwindcss-animate` ist bereits im Einsatz — PROJ-15-Feier nutzt es heute schon).

### Bau-Reihenfolge (Empfehlung)

1. `/backend` zuerst: die drei DB-Bausteine (inkl. Backfill + RLS-Review) — das Album kann ohne Abschlussdatum nicht sinnvoll sortieren
2. `/frontend` danach: Memory Card, Album-Tab-Umbau, Reveal-Overlay, Filter-Chips

_Hinweis: weicht bewusst von der Standard-Reihenfolge (frontend → backend) ab, weil alle drei UI-Kernstücke auf Baustein 1–3 aufsetzen._

## Implementation Notes

### Backend (/backend, 2026-07-16)

Alle drei DB-Bausteine sind in Produktion (4 Migrationen, Spiegel in `supabase/migrations/`):

**Baustein 1 — `activities.completed_at`** (`20260716101227_proj17_activity_completed_at`)
- Neue Spalte `completed_at timestamptz`, gesetzt per `BEFORE INSERT OR UPDATE`-Trigger (`trg_activity_completed_at`): Wechsel auf `abgeschlossen` → `now()`; Verlassen des Status → `NULL`; bleibt der Status `abgeschlossen`, wird jeder Client-Wert mit dem alten Wert überschrieben (fälschungssicher, per Rollback-Test verifiziert).
- Backfill (vor Trigger-Anlage): `coalesce(start_date, created_at)` für alle 6 Bestands-Aktivitäten.
- Partieller Index `idx_activities_completed_at` (`WHERE status = 'abgeschlossen'`) für die Album-Sortierung.

**Baustein 2 — `profiles.album_last_seen_at`** (`20260716101250_proj17_album_last_seen`)
- `NOT NULL DEFAULT now()` erledigt beide Backfill-Fälle: Bestandsnutzer = Launch-Zeitpunkt (Backfill-Karten nie „Neu"), Neu-Nutzer = Registrierungszeitpunkt.
- Schreibbar über die bestehende `profiles_update_own`-Policy (nur eigene Zeile).

**Baustein 3 — Mitgliedschafts-Historie + Lese-RLS** (`20260716101341_proj17_membership_history_read_rls`, **RLS-Änderung vom Nutzer freigegeben 2026-07-16**)
- Neue Tabelle `group_members_history` (PK group_id+user_id, `left_at`), befüllt ausschließlich per `AFTER DELETE`-Trigger auf `group_members`; Kaskaden-Schutz prüft Existenz von Gruppe/User, damit Gruppen-/Account-Löschung nicht blockiert. RLS: Nutzer liest nur eigene Zeilen, keine Schreib-Policies.
- Neue Helper `is_or_was_group_member(gid)` / `is_or_was_activity_group_member(aid)` (SECURITY DEFINER, wie bestehende Helper).
- Auf „ist ODER war Mitglied" erweiterte SELECT-Policies (nur Lesen, Schreibrechte unverändert): `groups`, `group_members`, `activities`, `activity_votes`, `activity_comments`, `activity_responsibilities`, `activity_photos`, `activity_polls`, `activity_poll_options`, `activity_poll_votes` sowie Storage-SELECT für Buckets `activity-photos` und `activity-comment-images`.

**Härtung** (`20260716101643_proj17_harden_trigger_functions`): EXECUTE-Revoke für die beiden Trigger-Funktionen (PROJ-15-Muster).

**Frontend-Datenpfad (vorbereitet für /frontend):**
- `useArchive(groupFilter?)` umgestellt: Mitgliedschaften = `group_members` ∪ `group_members_history`, Sortierung nach `completed_at desc` (statt `created_at`), Gruppen-Filter serverseitig, liefert zusätzlich `groups` (Filter-Chips), `completed_at` + `duration_category` (Farbakzent) pro Aktivität.
- `AuthContext`-Profile-Typ um `album_last_seen_at` erweitert (Profil lädt via `select('*')`, Feld ist damit verfügbar).
- `database.types.ts` regeneriert (handverengte `status`-Union erhalten).

**Tests:** `useArchive.test.ts` erweitert (Historie-Union, Dedupe, Server-Filter, Chips, `completed_at`) — 361/361 Tests grün, Build ok. Trigger-/Backfill-Logik zusätzlich per SQL-Rollback-Test in Produktion verifiziert.

**Bewusste Scope-Grenzen:** Kein Realtime, kein Reveal-Persistenz-Backend (rein client-seitig, /frontend), Cover-Kette wird client-seitig beim Anzeigen berechnet (ein gebündelter `activity_photos`-Query pro Album-Seite — /frontend).

### Frontend (/frontend, 2026-07-16)

**Neue Bausteine:**
- `src/lib/memory-card.ts` — geteilte Ableitungen: `MEMORY_ACCENTS` (finale Farbzuordnung: spontan → Blush, Wochenende → Honiggold, längerer Zeitraum → Waldgrün — je mit passendem Cover-Gradient als Platzhalter), `memoryCardDate()` (Termin vor Abschlussdatum, `dateOnly` wie Kanban), `isCardNew()` (completed_at > album_last_seen_at). Unit-Tests in `memory-card.test.ts`.
- `src/components/memory/MemoryCard.tsx` — die Sammelkarte (Album + Reveal identisch): Cover 4:5 (lazy, `onError`-Fallback), Akzentbalken, Serif-Titel max. 2 Zeilen, Datum, Gruppen-Badge, optional „Neu"-Badge (Gold). Platzhalter = Cover-Gradient + Serif-Initiale (nie ein gebrochenes Bild).
- `src/components/memory/MemoryCardReveal.tsx` — Vollbild-Flip (z-[55], unter der PROJ-15-Feier z-[60]) auf `surface-ink`, CSS-3D-Flip via neue Tailwind-Keyframes (`mellon-card-flip`, einmalig, kein Loop), Tippen irgendwo schließt. Cover beim Reveal = `og_image_url`/Platzhalter (Fotos existieren beim Abschluss noch nicht).
- `src/hooks/useMemoryCovers.ts` — EIN gebündelter `activity_photos`-Query pro Album-Seite, ältestes Foto je Aktivität; Fallback-Kette im Aufrufer (`covers[id] ?? og_image_url ?? Platzhalter`).
- `src/hooks/useAlbumBadge.ts` — Punkt-Indikator-Query (Head-Count, nur bei offenem Sheet) + `markSeen()` (setzt `album_last_seen_at`, refresht Profil).
- `src/components/profile/AlbumTab.tsx` — ersetzt ArchiveTab: 2-spaltiges Grid, Filter-Chips ab 2 Gruppen (serverseitig via `useArchive(groupFilter)`), Leer-State laut AC, „Mehr laden" (20er-Muster), Karten-Tap → bestehendes ActivityDetailSheet (readOnly).

**Umbauten:**
- `ProfileSheet` — Tab „Archiv" → „Album" mit Punkt-Indikator; beim ersten Album-Öffnen pro Sheet-Besuch: Snapshot des alten Zeitstempels (für die „Neu"-Badges) → dann `markSeen()`. Tabs jetzt controlled, Reset bei Sheet-Öffnung.
- `GroupShellContext` + `groups/view/page.tsx` — neues `showCardReveal`; Reveal rendert nur bei `pendingMilestone === null` (Warteschlange: Feier zuerst, Reveal nach deren Dismiss).
- `KanbanBoard` — neuer `onCompleted`-Callback nach erfolgreichem Abschluss (ersetzt den Abschluss-Toast; die Vollbild-Karte ist die Bestätigung), verdrahtet in `PlanungTab`.
- `tailwind.config.ts` — Keyframes `mellon-card-flip`/`mellon-fade-in`; Safelist für die Klassen aus `MEMORY_ACCENTS` (src/lib wird bewusst NICHT in content gescannt — Regex-Zeichenklassen wie `[-:.]` in lib-Dateien brechen den Tailwind-Extractor, im Browser-Test verifiziert).
- Entfernt: `ArchiveTab.tsx`, `ArchiveActivityCard.tsx` (ersetzt durch Album/MemoryCard).

**Verifikation:** 370/370 Unit-Tests grün, Production-Build ok. Browser-Verifikation (Mobile-Viewport, QA-Account in isolierter Testgruppe): Reveal-Flip nach eigenem Abschluss inkl. Dismiss, Karte im Album mit „Neu"-Badge, Punkt-Indikator am Tab, Gesehen-Logik (zweiter Besuch ohne „Neu"/Punkt), Karten-Tap → read-only Detail-Sheet, Leer-State. Zwei dabei gefundene Bugs direkt gefixt: fehlende Platzhalter-Gradient-Klassen (→ Safelist) und Punkt-Indikator-Query nur beim Mount statt beim Sheet-Öffnen (→ `useAlbumBadge(open)`).

**Nicht browser-getestet (→ /qa):** Filter-Chips ab 2 Gruppen, Meilenstein-Feier + Reveal gleichzeitig, Foto-Upload-Cover-Kette, Pagination >20 Karten, Karten nach Gruppen-Austritt.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

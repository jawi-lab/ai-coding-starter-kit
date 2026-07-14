# PROJ-17: Memory Cards & Album (Gamification)

## Status: Planned
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

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
- [ ] **Quelle des Abschlussdatums:** `activities` hat keine `completed_at`-Spalte (PROJ-8 wich deshalb auf `created_at` aus). Für die Karte und die Album-Sortierung braucht es ein echtes Abschlussdatum — neue Spalte, die beim Statuswechsel gesetzt wird (inkl. Backfill-Strategie für Altdaten), oder bewusster Fallback? → /architecture
- [ ] **Speicherung des Gesehen-Status:** Zeitstempel „letzter Album-Besuch" pro Nutzer vs. Gesehen-Vermerk pro Karte (analog `group_momentum_seen`)? → /architecture

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

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

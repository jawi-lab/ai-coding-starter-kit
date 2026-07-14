# PROJ-16: Persönliche Rollen-Badges (Gamification)

## Status: Planned
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

## Dependencies
- PROJ-3 (Gruppe & Mitglieder-Management) — Mitgliederliste als zweiter Anzeigeort der Badges
- PROJ-8 (Nutzerprofil & Archiv) — das eigene Profil ist der Haupt-Anzeigeort (Badge-Sektion mit Fortschritt)
- PROJ-4 (Aktivitäts-Vorschläge & Voting) — Datenquelle für 💡 Ideengeber und ⚡ Entscheider
- PROJ-6 (Aktivitäts-Detail) — Datenquelle für 🗓️ Planer (übernommene Aufgaben)
- PROJ-14 (Umfragen in Aktivitäten) — Datenquelle für ⚡ Entscheider (Umfrage-Votes) und 🗓️ Planer (gestartete Umfragen)

## Übersicht
Persönliche Rollen-Badges sind das zweite Feature des Gamification-Dachkonzepts **„Momentum"**. Während PROJ-15 die Gruppe kollektiv belohnt, geben Badges jeder Person eine **liebevolle Rollen-Identität**: Sie beschreiben, *was für ein Typ* jemand in der App ist — nicht, wer „besser" ist. Es gibt **keine Ranglisten und keinen Vergleich** zwischen Mitgliedern: Jedes Badge hat feste, für alle gleiche Schwellen; jede·r kann jedes Badge in jeder Stufe erreichen.

## Badge-Modell

| Badge | Rolle | Zählbare Aktion |
|-------|-------|-----------------|
| 💡 Ideengeber | bringt die Ideen ein | Aktivitäts-Vorschläge erstellt |
| ⚡ Entscheider | bringt Entscheidungen voran | Votes abgegeben (Aktivitäts-Votes + Umfrage-Votes; je Aktivität bzw. Umfrage einmal) |
| 🗓️ Planer | macht aus Ideen Pläne | Aufgaben in Aktivitäten übernommen + Umfragen/Terminfindungen gestartet |
| ✅ Immer dabei | ist verlässlich am Start | Abgeschlossene Aktivitäten mit eigener Mitwirkung (gevotet, Aufgabe übernommen oder selbst vorgeschlagen) |

**Stufen (für alle Badges gleich):**

| Stufe | Erreicht ab (zählbare Aktionen) |
|-------|--------------------------------|
| 🥉 Bronze | 5 |
| 🥈 Silber | 15 |
| 🥇 Gold | 30 |

- Aktionen zählen **global über alle Gruppen** hinweg (pro Nutzer, nicht pro Gruppe).
- Stufen sind **monoton**: einmal verdient, für immer verdient — Löschungen können den Zähler senken, aber keine Stufe wegnehmen.

## User Stories
- Als Nutzer·in möchte ich in meinem Profil meine Badges mit aktueller Stufe und Fortschritt zur nächsten Stufe sehen, damit ich erkenne, welche Rolle ich in meinen Gruppen spiele und was als Nächstes erreichbar ist.
- Als Nutzer·in möchte ich direkt nach einer Aktion, die mir eine neue Badge-Stufe einbringt, einen kurzen Hinweis (Toast) sehen, damit ich den Moment mitbekomme, ohne aus dem Flow gerissen zu werden.
- Als Gruppenmitglied möchte ich in der Mitgliederliste die verdienten Badges der anderen als kleine Icons sehen, damit ich weiß, wofür jede·r in der Gruppe steht — ohne Rangliste oder Vergleich.
- Als Bestandsnutzer·in möchte ich, dass meine bisherigen Vorschläge, Votes und Aufgaben mitzählen, damit meine Historie nicht bei null beginnt.
- Als neue·r Nutzer·in ohne jede Aktion möchte ich im Profil alle vier Badges als „noch nicht erreicht" mit Fortschritt 0 sehen, damit ich verstehe, was es zu erreichen gibt.

## Out of Scope
- Ranglisten, Bestenlisten oder jeder direkte Vergleich zwischen Mitgliedern — bewusst ausgeschlossen (Momentum-Prinzip „kollektiv > kompetitiv")
- Gruppenbezogene Badge-Stände (Badge nur in Gruppe A) — Zählung ist ausschließlich global pro Nutzer
- Ein echtes „Ich war dabei"-Teilnahme-Signal (Check-in/Teilnehmerliste) — ✅ Immer dabei nutzt in dieser Version einen Mitwirkungs-Proxy; ein echtes Signal kann mit PROJ-17 (Memory Cards) kommen
- Vollbild-Feier mit Konfetti bei Badge-Erhalt — bleibt den Gruppen-Meilensteinen von PROJ-15 vorbehalten
- Push-/E-Mail-Benachrichtigung bei neuer Badge-Stufe → PROJ-12 (kann später als Quelle dienen)
- Badge-Anzeige an Kommentaren, Vorschlagskarten oder sonstigen Orten im Gruppenkontext — nur Profil + Mitgliederliste
- Fremder Fortschritt: andere sehen nur verdiente Stufen, nie Zähler oder Fortschrittsbalken anderer
- Weitere Badges oder Stufen oberhalb Gold — Zähler läuft weiter, wird aber nur im eigenen Profil als Rohzahl gezeigt
- Rückwirkende Toasts für Stufen, die per Backfill beim Launch bereits erreicht waren
- Nutzer-Konfiguration von Schwellen, Namen oder Sichtbarkeit
- Aggregierter Jahresrückblick → PROJ-18 (ZUSAMMEN Wrapped)

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Profil (Badge-Sektion)

- [ ] Angenommen ein·e eingeloggte·r Nutzer·in öffnet das eigene Profil, dann sieht sie/er eine Badge-Sektion mit allen vier Badges, der jeweils aktuellen Stufe (oder „noch nicht erreicht") und einem Fortschrittsbalken zur nächsten Stufe.
- [ ] Angenommen ein·e Nutzer·in hat für ein Badge noch 0 zählbare Aktionen, wenn das Profil angezeigt wird, dann erscheint das Badge ausgegraut mit Fortschritt „Noch 5 bis Bronze".
- [ ] Angenommen ein·e Nutzer·in hat für ein Badge Gold erreicht, wenn das Profil angezeigt wird, dann zeigt das Badge Gold plus die Rohzahl der Aktionen und **keinen** Fortschrittsbalken mehr.
- [ ] Angenommen eine neue Badge-Stufe wurde verdient, aber im Profil noch nicht angesehen, wenn das Profil geöffnet wird, dann ist das betroffene Badge visuell hervorgehoben; nach dem Ansehen verschwindet die Hervorhebung dauerhaft.

### Verdienen & Toast

- [ ] Angenommen ein·e Nutzer·in steht bei 4 zählbaren Aktionen für 💡 Ideengeber, wenn sie/er einen fünften Aktivitäts-Vorschlag erstellt, dann erscheint unmittelbar ein Toast „Neues Badge: Ideengeber 🥉" (analog für Silber/Gold und die anderen Badges).
- [ ] Angenommen eine Aktion bringt keine neue Stufe (z.B. Aktion 6 von 15), wenn sie ausgeführt wird, dann erscheint **kein** Toast — Toasts gibt es ausschließlich beim Stufen-Aufstieg.
- [ ] Angenommen ein·e Nutzer·in votet für eine Aktivität, zieht das Vote zurück und votet erneut, dann zählt diese Aktivität für ⚡ Entscheider insgesamt nur **einmal** (kein Badge-Farming durch Toggeln).
- [ ] Angenommen ein·e Nutzer·in wirkt an einer Aktivität mit (Vote, Aufgabe oder eigener Vorschlag), wenn diese Aktivität in den Status `abgeschlossen` wechselt, dann erhöht sich der Zähler für ✅ Immer dabei um genau 1.
- [ ] Angenommen ein Gruppenmitglied schließt eine Aktivität ab und überschreitet damit gleichzeitig einen Gruppen-Meilenstein (PROJ-15) und eine eigene Badge-Stufe, dann erscheint die PROJ-15-Vollbild-Feier; der Badge-Toast erscheint zusätzlich, ohne die Feier zu blockieren oder zu überlagern.

### Mitgliederliste

- [ ] Angenommen ein Mitglied hat mindestens ein Badge verdient, wenn die Mitgliederliste einer gemeinsamen Gruppe angezeigt wird, dann erscheinen neben seinem Namen die verdienten Badges als kleine Icons mit Stufen-Kennzeichnung.
- [ ] Angenommen ein Mitglied hat noch kein Badge verdient, wenn die Mitgliederliste angezeigt wird, dann erscheinen bei ihm keine Badge-Icons und kein Platzhalter.
- [ ] Angenommen ein Mitglied betrachtet die Badges eines anderen Mitglieds, dann sieht es ausschließlich verdiente Stufen — niemals Zähler, Fortschritt oder „fast erreicht"-Hinweise anderer.

### Zählung, Backfill & Dauerhaftigkeit

- [ ] Angenommen ein·e Nutzer·in ist in mehreren Gruppen aktiv, wenn Badge-Zähler berechnet werden, dann zählen die Aktionen aus **allen** Gruppen zusammen (globale Zählung pro Nutzer).
- [ ] Angenommen ein·e Bestandsnutzer·in hatte vor dem Feature-Launch bereits zählbare Aktionen, wenn das Feature erstmals geladen wird, dann sind alle historischen Aktionen mitgezählt und bereits überschrittene Stufen gelten als still verdient — ohne rückwirkende Toasts und ohne „Neu"-Hervorhebung.
- [ ] Angenommen eine Stufe wurde verdient, wenn danach gezählte Aktionen gelöscht werden (z.B. ein Vorschlag) und der Zähler unter die Schwelle fällt, dann bleibt die verdiente Stufe bestehen; nur der angezeigte Zähler/Fortschritt sinkt.
- [ ] Angenommen der Zähler ist durch Löschungen unter eine bereits verdiente Schwelle gefallen, wenn er sie später erneut überschreitet, dann erscheint **kein** erneuter Toast (einmalig pro Stufe — für immer).

## Edge Cases
- **Frisch registrierte·r Nutzer·in:** Profil zeigt alle vier Badges ausgegraut mit Fortschritt 0/5 — kein leerer Zustand, keine Fehlermeldung.
- **Vote-Toggeln (vote → unvote → vote):** Zählt einmal pro Aktivität bzw. Umfrage — dedupliziert nach Ziel, nicht nach Ereignis (Anti-Farming).
- **Umfrage mit Mehrfachauswahl (PROJ-14):** Mehrere angekreuzte Optionen in derselben Umfrage zählen als **ein** Vote für ⚡ Entscheider.
- **Nutzer·in verlässt eine Gruppe oder eine Gruppe wird gelöscht:** Verdiente Stufen bleiben bestehen (monoton). Sinkt der Zähler durch kaskadiertes Löschen der Gruppendaten, gilt dieselbe Regel wie bei Einzellöschung: Anzeige sinkt, Stufe bleibt.
- **Abgeschlossene Aktivität wird wieder zurück in „Geplant" gezogen und erneut abgeschlossen:** Für ✅ Immer dabei zählt dieselbe Aktivität nur einmal (dedupliziert pro Aktivität).
- **Mehrere Stufen in einer Aktion übersprungen (v.a. durch Backfill-Nachzügler oder Datenkorrektur):** Nur ein Toast für die höchste neu erreichte Stufe; dazwischenliegende gelten als still verdient (analog PROJ-15).
- **Zwei Geräte gleichzeitig aktiv:** Der Toast erscheint auf dem Gerät, das die auslösende Aktion ausgeführt hat; die „Neu"-Hervorhebung im Profil synchronisiert über die Datenbank und erlischt nach dem ersten Ansehen auf irgendeinem Gerät.
- **Netzwerkfehler beim Laden der Badge-Daten im Profil:** Badge-Sektion zeigt einen dezenten Fehlerzustand mit Retry; der Rest des Profils bleibt nutzbar.
- **Mitgliederliste einer großen Gruppe:** Badge-Icons dürfen das Laden der Liste nicht spürbar verlangsamen (ein gebündelter Abruf, kein Abruf pro Mitglied).

## Technical Requirements
- Zählung global pro Nutzer über alle Gruppen; Deduplizierung pro Ziel (Aktivität/Umfrage/Aufgabe), nicht pro Ereignis. Genaues Schema → `/architecture`.
- Persistente Zustände (analog PROJ-15-Muster):
  - pro **Nutzer und Badge**: höchste jemals verdiente Stufe (monoton, verhindert Re-Toast und Stufen-Verlust) sowie höchste im Profil **angesehene** Stufe (steuert die „Neu"-Hervorhebung).
- Backfill per einmaliger Migration: historische Aktionen zählen, bereits erreichte Stufen werden als verdient **und** angesehen markiert (keine Toast-/Hervorhebungs-Flut beim Launch).
- Static-Export-kompatibel: kein SSR, keine Server Actions; Logik über RLS + Trigger/Views, Anzeige client-seitig via Supabase JS Client.
- RLS: Jede·r liest die eigenen Zähler/Fortschritte vollständig; von anderen Nutzern sind ausschließlich verdiente Stufen lesbar (für die Mitgliederliste gemeinsamer Gruppen), niemals Zähler oder Fortschritt.
- Toast über das bestehende Toast-System der App (kein neues Overlay-Muster).

## Open Questions
- [ ] Was genau zählt als „Terminfindung gestartet" für 🗓️ Planer (welches PROJ-7-Ereignis: Terminvorschlag angelegt vs. Terminfindung eröffnet)? → in `/architecture` anhand des PROJ-7-Datenmodells festlegen.
- [ ] Sollen Badge- und Stufen-Namen später lokalisierbar sein? Aktuell fest auf Deutsch (gleiches offenes Thema wie bei PROJ-15).
- [ ] Zählt ⚡ Entscheider auch Availability-Angaben aus der Terminfindung (PROJ-7) oder nur Aktivitäts- und Umfrage-Votes? Aktuell: nur Aktivitäts- + Umfrage-Votes; bei Bedarf per `/refine` erweitern.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Feste Schwellen mit Stufen statt „relativ zur Gruppe" | Relativvergabe wäre eine versteckte Rangliste mit Badge-Verlust; feste Schwellen kann jede·r erreichen — konsistent mit dem PROJ-15-Meilenstein-Modell | 2026-07-13 |
| Globale Zählung pro Nutzer statt pro Gruppe | „Persönliche" Badges beschreiben den Typ Mensch in der App, nicht die Position in einer Gruppe; zudem das einfachere Modell | 2026-07-13 |
| Mapping: Ideengeber=Vorschläge, Entscheider=Votes, Planer=übernommene Aufgaben + gestartete Umfragen/Terminfindungen | Alle drei mit bestehenden Daten (activities, activity_votes, activity_poll_votes, activity_responsibilities, activity_polls) sauber zählbar | 2026-07-13 |
| ✅ Immer dabei als Mitwirkungs-Proxy (Vote/Aufgabe/Vorschlag an später abgeschlossener Aktivität) | Es existiert kein echtes Teilnahme-Signal; der Proxy ist ehrlich messbar, backfillbar und belohnt echtes Mitwirken statt bloßer Mitgliedschaft. Echtes Signal ggf. mit PROJ-17 | 2026-07-13 |
| Sichtbarkeit: eigenes Profil (mit Fortschritt) + Mitgliederliste (nur verdiente Stufen als Icons) | Persönlich bleiben, aber soziale Anerkennung in der Gruppe ermöglichen — ohne Rangliste; fremder Fortschritt bleibt privat | 2026-07-13 |
| Toast + Profil-Hervorhebung statt Vollbild-Feier | Feier-Hierarchie: Konfetti-Vollbild bleibt exklusiv für Gruppen-Meilensteine (PROJ-15); persönliche Erfolge sind leiser | 2026-07-13 |
| Einheitliche Schwellen 5/15/30 (Bronze/Silber/Gold) für alle Badges | Ein mentales Modell; Bronze schnell erreichbar, damit das Feature bei Bestandsnutzern sofort lebt. Bewusst in Kauf genommen: Entscheider wird schneller erreicht als andere | 2026-07-13 |
| Backfill der gesamten Historie, ohne rückwirkende Toasts | Historie nicht auf null setzen (wie PROJ-15); keine Toast-Flut beim Launch | 2026-07-13 |
| Stufen monoton — Löschen senkt Zähler, aber nie die Stufe; kein Re-Toast beim Wieder-Überschreiten | Kein Verlustgefühl, kein Toast-Farming; identisches Prinzip wie „hoechster_erreichter_meilenstein" in PROJ-15 | 2026-07-13 |
| Vote-Deduplizierung pro Ziel (Aktivität/Umfrage), nicht pro Ereignis | Verhindert Badge-Farming durch Vote-Toggeln oder Mehrfachauswahl-Optionen | 2026-07-13 |
| Bei übersprungenen Stufen nur die höchste neu erreichte toasten | Keine gestapelten Toasts; ein sauberer Moment (analog PROJ-15) | 2026-07-13 |

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

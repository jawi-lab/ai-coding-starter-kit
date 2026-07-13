# PROJ-15: Gruppen-Momentum (Gamification)

## Status: In Progress
**Created:** 2026-07-13
**Last Updated:** 2026-07-13

## Dependencies
- PROJ-4 (Aktivitäts-Vorschläge & Voting) — `activities`-Tabelle; der „Vorschläge"-Tab ist der Host für das Momentum-Banner
- PROJ-5 (Kanban-Board) — Status `abgeschlossen` (Terminalzustand) sowie das bestehende Supabase-Realtime-Muster (Channel gefiltert nach `group_id`)
- PROJ-8 (Nutzerprofil & Archiv) — abgeschlossene Aktivitäten als „gemeinsame Erinnerung" (Konzeptbasis)

## Übersicht
Gruppen-Momentum ist das erste Feature des Gamification-Dachkonzepts **„Momentum"**. Es belohnt den Kernloop der App (Vorschlag → Voting → Planung → Durchführung → Erinnerung) **kollektiv statt kompetitiv**: Jede Gruppe hat einen gemeinsamen Zähler abgeschlossener Aktivitäten und ein daraus abgeleitetes gemeinsames **Level**. Das Modell ist eine **kumulative „Gruppen-Reise"** — es gibt keinen zeit-/recency-basierten Verfall und keine reißenden Streaks. Meilensteine werden mit einer Vollbild-Feier zelebriert.

## User Stories
- Als Gruppenmitglied möchte ich das gemeinsame Level und die Anzahl abgeschlossener Aktivitäten meiner Gruppe sehen, damit ich erkenne, wie weit wir zusammen gekommen sind.
- Als Person, die eine Aktivität abschließt, möchte ich sofort eine Level-Up-Feier sehen, damit ich den Moment direkt miterlebe.
- Als Gruppenmitglied, das offline war, möchte ich eine verpasste Meilenstein-Feier beim nächsten Öffnen der Gruppe sehen, damit ich sie nicht verpasse.
- Als Mitglied einer bestehenden Gruppe möchte ich, dass unsere bereits abgeschlossenen Aktivitäten mitzählen, damit unsere Historie nicht bei null beginnt.
- Als Gruppenmitglied möchte ich durch Antippen des Banners die vollständige Level-Leiter sehen, damit ich weiß, welche Meilensteine erreicht und welche noch offen sind.

## Level-Modell

| Level | Name | Erreicht ab (abgeschlossene Aktivitäten) | Feier |
|-------|------|------------------------------------------|-------|
| 1 | Neue Gruppe | 0–4 | — (Startzustand) |
| 2 | Gruppe | 5 | ✅ Vollbild-Feier |
| 3 | Eingespielte Gruppe | 10 | ✅ Vollbild-Feier |
| 4 | Legendäre Gruppe | 25 | ✅ Vollbild-Feier |

> Ab 25 gibt es kein neues Level mehr — der Zähler klettert weiter und wird als Rohzahl angezeigt (z.B. „Legendäre Gruppe · 32 Aktivitäten"), ohne Fortschrittsbalken.

## Out of Scope
- Persönliche/individuelle Punkte oder Ranglisten → PROJ-16 (Persönliche Rollen-Badges)
- Erinnerungskarten & Album beim Abschluss → PROJ-17 (Memory Cards & Album)
- Aggregierter Jahresrückblick / teilbarer Story-Rückblick → PROJ-18 (ZUSAMMEN Wrapped)
- Push-/E-Mail-Benachrichtigung bei Level-Up → PROJ-12 (Momentum kann später als Quelle dienen)
- Punkte für Vorschlagen, Voten oder Planen — **ausschließlich** der Status `abgeschlossen` zählt
- Zeit-/Recency-basierte Streaks oder Verfall — bewusst ausgeschlossen (kumulatives Modell)
- Momentum-Anzeige auf Home/Gruppenliste oder in der Gruppen-Top-Bar — nur der Vorschläge-Tab
- Neue Level-Namen oberhalb von 25 — ab dort nur Rohzahl unter „Legendäre Gruppe"
- Retroaktive Konfetti-Feiern für Meilensteine, die vor dem Feature-Launch überschritten wurden
- Nutzer-Konfiguration der Meilenstein-Schwellen oder Level-Namen

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Momentum-Banner (Anzeige)

- [ ] Angenommen ein Gruppenmitglied öffnet den Tab „Vorschläge", dann sieht es oben ein Momentum-Banner mit aktuellem Level-Namen, der Anzahl abgeschlossener Aktivitäten und einem Fortschrittsbalken zum nächsten Meilenstein.
- [ ] Angenommen die Gruppe hat 0 abgeschlossene Aktivitäten, wenn das Banner angezeigt wird, dann zeigt es „Neue Gruppe", die Zahl 0 und den Fortschritt „Noch 5 bis Gruppe".
- [ ] Angenommen die Gruppe hat 25 oder mehr abgeschlossene Aktivitäten, wenn das Banner angezeigt wird, dann zeigt es „Legendäre Gruppe" mit der Rohzahl und **ohne** Fortschrittsbalken (höchstes Level erreicht).
- [ ] Angenommen ein Mitglied hat eine beliebige Rolle (Admin, Redakteur oder Beobachter), wenn es den Vorschläge-Tab öffnet, dann ist das Banner für alle Rollen gleichermaßen sichtbar (kollektiv, rollenunabhängig).
- [ ] Angenommen ein Mitglied tippt auf das Banner, dann öffnet sich ein Sheet mit der vollständigen Level-Leiter (Level 1–4, Schwellen 0/5/10/25) und markiert erreichte sowie noch offene Meilensteine.
- [ ] Angenommen mein Vorschläge-Tab ist geöffnet, wenn eine andere Person eine Aktivität abschließt, dann aktualisiert sich das Banner (Zahl/Level) automatisch per Supabase Realtime ohne Seitenreload.

### Zählung & Level

- [ ] Angenommen eine Aktivität wechselt in den Status `abgeschlossen`, wenn dadurch die Gesamtzahl steigt, dann erhöht sich die angezeigte Anzahl um genau 1.
- [ ] Angenommen die Gruppe hatte vor dem Feature-Launch bereits abgeschlossene Aktivitäten, wenn das Feature erstmals geladen wird, dann werden diese vollständig mitgezählt (Backfill) — ohne rückwirkende Feier.
- [ ] Angenommen ein Admin löscht eine abgeschlossene Aktivität, dann sinkt die Anzahl entsprechend (Live-Count); fällt sie unter eine Schwelle, sinkt auch das angezeigte Level — ohne Fehlermeldung oder „Level verloren"-Hinweis.

### Meilenstein-Feier

- [ ] Angenommen ein Mitglied markiert eine Aktivität als `abgeschlossen` und überschreitet damit **erstmals** einen Meilenstein (5, 10 oder 25), dann erscheint diesem Mitglied sofort eine Vollbild-Feier mit Animation und dem neuen Level-Namen.
- [ ] Angenommen ein Meilenstein wurde erreicht, wenn ein anderes Gruppenmitglied den Vorschläge-Tab das nächste Mal öffnet, dann sieht es genau einmal die Vollbild-Feier für diesen Meilenstein.
- [ ] Angenommen ein Mitglied hat die Feier für einen Meilenstein bereits gesehen, wenn es die Gruppe erneut öffnet, dann erscheint diese Feier nicht noch einmal.
- [ ] Angenommen die Vollbild-Feier wird angezeigt, wenn das Mitglied irgendwo tippt, dann schließt sich die Feier (Dismiss).
- [ ] Angenommen ein bereits gefeierter Meilenstein wird durch Löschen unterschritten und später erneut überschritten, dann erscheint **keine** erneute Feier (einmalig pro Meilenstein — für immer).
- [ ] Angenommen ein Mitglied war offline, während die Gruppe mehrere Meilensteine überschritten hat (z.B. 5 und 10), wenn es die Gruppe das nächste Mal öffnet, dann wird nur die Feier des **höchsten** neu erreichten Meilensteins gezeigt (keine gestapelten Overlays), und alle dazwischenliegenden gelten als gesehen.

## Edge Cases
- **Neu erstellte Gruppe ohne jede Aktivität:** Banner zeigt „Neue Gruppe · 0", Fortschritt „Noch 5 bis Gruppe". Kein Fehler, kein leerer Zustand.
- **Backfill über einen bereits überschrittenen Meilenstein:** Beim Launch gelten für Bestandsdaten alle bis dahin erreichten Meilensteine als „bereits gefeiert" → keine Konfetti-Flut.
- **Neues Mitglied tritt einer Gruppe bei, die schon Level 3 ist:** Es sieht das aktuelle Level, aber keine Feiern für Meilensteine, die vor seinem Beitritt lagen (gelten als bereits gesehen).
- **Mehrere verpasste Meilensteine bei Rückkehr:** Nur die Feier des höchsten neu erreichten Meilensteins erscheint; niedrigere werden stumm als gesehen markiert.
- **Löschen einer abgeschlossenen Aktivität an einer Schwelle:** Level regrediert live (z.B. 5 → 4 ⇒ „Gruppe" → „Neue Gruppe"); keine negative Meldung.
- **Gleichzeitiger Abschluss durch zwei Personen nahe einem Meilenstein:** Der DB-Zählwert entscheidet; die Meilenstein-Feier ist gruppenweit einmalig (persistentes Flag verhindert Doppel-Feier).
- **Sehr hohe Zahl (z.B. 100+):** Banner zeigt weiterhin „Legendäre Gruppe" plus Rohzahl, kein Fortschrittsbalken.

## Technical Requirements
- Zählung basiert auf dem Live-`COUNT` der `activities` mit `status = 'abgeschlossen'` pro `group_id`.
- Realtime-Update des Banners via Supabase Realtime auf `activities` (bestehendes Kanban-Muster wiederverwenden, gefiltert nach `group_id`).
- Persistente Zustände (genaues Schema → `/architecture`):
  - pro **Gruppe**: welche Meilensteine jemals erreicht/gefeiert wurden (verhindert Re-Feier nach Löschen).
  - pro **Mitglied**: welche Meilenstein-Feiern bereits gesehen wurden (steuert das einmalige Nachhol-Overlay).
- Static-Export-kompatibel: kein SSR, keine Server Actions; Berechnung client-seitig via Supabase JS Client.
- RLS: Alle Mitglieder einer Gruppe dürfen die Momentum-/Meilenstein-Daten ihrer eigenen Gruppe lesen und den eigenen „gesehen"-Status schreiben.

## Open Questions
- [x] Konkrete Umsetzung der Feier-Animation — **entschieden in `/architecture`:** `canvas-confetti` (~6 KB, keine Assets, WebView-tauglich) für das Konfetti, Overlay-Karte per CSS/Tailwind. Feinschliff der Bewegung im `/frontend`.
- [ ] Sollen die Level-Namen später lokalisierbar/konfigurierbar sein? Aktuell fest verdrahtet auf Deutsch (Level-Regeln liegen gekapselt in `src/lib/momentum.ts`, also später leicht austauschbar).
- [x] Finaler Wortlaut von Fortschrittstext und Feier-Überschrift — **entschieden in `/frontend` (User-Auswahl):** Feier-Überschrift „Level up!" (Gold-Overline) + Level-Name als Serif-Display; Fortschrittstext „Noch N bis {Level-Name}"; Unterzeile der Feier „{N} gemeinsame Aktivitäten abgeschlossen — weiter so!".

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Kumulatives „Gruppen-Reise"-Modell statt Recency-Streak | Passt zum kollaborativen, druckfreien Charakter der App; kein Guilt-Tripping bei Freundesgruppen | 2026-07-13 |
| Punkte ausschließlich bei Status `abgeschlossen` | Belohnt tatsächlich durchgeführte Unternehmungen statt bloßen Vorschlagens; Kern der PRD-Vision „Idee → Erinnerung" | 2026-07-13 |
| 4 Level, direkt an Meilensteine 0/5/10/25 gebunden | Ein einziges verständliches Konzept statt paralleler Level- und Meilenstein-Systeme | 2026-07-13 |
| Level-Namen: Neue Gruppe / Gruppe / Eingespielte Gruppe / Legendäre Gruppe | Klare, warme Progression bis „Legendär" | 2026-07-13 |
| Momentum-Banner auf dem Vorschläge-Tab | Landing-Tab der Gruppe; alle Mitglieder sehen es bei jedem Besuch, ohne neue Navigation | 2026-07-13 |
| Sofortige Feier für die abschließende Person + einmalig beim nächsten Öffnen für alle anderen | Geteilter Moment ohne gleichzeitige Anwesenheit aller | 2026-07-13 |
| Vollbild-Overlay mit Animation als Feier-Format | Meilensteine sollen sich besonders anfühlen | 2026-07-13 |
| Backfill aller bestehenden abgeschlossenen Aktivitäten, ohne retroaktive Feier | Historie nicht auf null setzen; keine Konfetti-Flut beim Launch | 2026-07-13 |
| Live-Count: Löschen reduziert Zahl und Level | Zahl bleibt wahrheitsgetreu und simpel; „kein Verfall" bezog sich auf Zeit/Inaktivität, nicht auf explizite Löschung | 2026-07-13 |
| Feier einmalig pro Meilenstein — für immer (persistentes Flag) | Verhindert Konfetti-Farming durch Löschen und Neu-Abschließen | 2026-07-13 |
| Kein Push/E-Mail bei Level-Up (nur In-App) | Benachrichtigungen sind PROJ-12; Momentum kann später als Quelle dienen | 2026-07-13 |
| Kollektiv, keine individuellen Punkte/Ranglisten | Passt zum App-Geist „ZUSAMMEN"/Mellon; individuelle Anerkennung ist PROJ-16 | 2026-07-13 |
| Bei mehreren verpassten Meilensteinen nur den höchsten feiern | Keine gestapelten Overlays; ein sauberer Moment | 2026-07-13 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Ein persistenter Zählwert **pro Gruppe** in eigener Tabelle (`group_momentum`), gepflegt per DB-Trigger auf `activities` — statt jedes Mal client-seitig zu zählen | Der Trigger ist die einzige Wahrheit: Er entscheidet bei gleichzeitigem Abschluss zweier Personen atomar, und das Banner liest nur **eine** Zeile statt eine COUNT-Abfrage. Realtime abonniert diese eine Zeile. | 2026-07-13 |
| Feier-Steuerung über **zwei monotone Zahlen** statt einer Liste gefeierter Meilensteine: `hoechster_erreichter_meilenstein` pro Gruppe (steigt nur, sinkt nie) + `hoechster_gesehener_meilenstein` pro Mitglied | Löst *alle* Kanten mit minimalem Schema: Anti-Farming (Löschen senkt den erreichten Wert nicht → keine Neu-Feier), „nur höchsten verpassten feiern" (ein Vergleich zweier Zahlen), Neu-Mitglied ohne Alt-Feiern (Gesehen-Wert beim Beitritt gleich Gruppen-Wert setzen). | 2026-07-13 |
| Anzeige-Level/-Zahl aus **Live-Count**, Feier-Unterdrückung aus **erreichtem Meilenstein** — bewusst getrennt | Erfüllt gleichzeitig „Löschen senkt Level live" (Anzeige folgt der echten Zahl) und „Feier für immer nur einmal" (erreichter Meilenstein ist dauerhaft). | 2026-07-13 |
| DB-**Trigger** statt Edge Function für die Zähllogik | Rein datengetrieben, atomar, kein Netzwerk-Roundtrip; passt zu Static Export (keine Server Action nötig) und zum PRD-Pfad „sensible Logik über RLS + Trigger". | 2026-07-13 |
| Backfill per einmaliger Migration: erreichten Meilenstein **und** Gesehen-Wert aller Bestandsmitglieder gleich hoch setzen | Historie zählt mit, aber niemand bekommt beim Launch rückwirkend Konfetti. | 2026-07-13 |
| Beitritt einer Gruppe seedet den Gesehen-Wert des neuen Mitglieds auf den aktuellen Gruppen-Meilenstein (per Trigger auf `group_members`) | Neues Mitglied startet „auf Stand" — keine Feiern für Meilensteine vor seinem Beitritt. | 2026-07-13 |
| `canvas-confetti` für die Feier-Animation (statt Lottie/reines CSS) | ~6 KB, keine Asset-Dateien, läuft zuverlässig im Capacitor-WebView; Overlay-Karte selbst per CSS/Tailwind. Feinschliff im `/frontend`. | 2026-07-13 |
| Wiederverwendung von shadcn `progress` (Fortschrittsbalken) und `sheet` (Level-Leiter) | Regel „shadcn first" — beide sind bereits installiert. | 2026-07-13 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Kurzfassung
Jede Gruppe bekommt eine kleine „Fortschritts-Akte", die im Hintergrund automatisch mitgezählt wird, sobald eine Aktivität abgeschlossen wird. Der Vorschläge-Tab zeigt daraus ein **Banner** (Level + Zahl + Fortschrittsbalken). Wird ein Meilenstein (5/10/25) zum ersten Mal geknackt, sieht das die abschließende Person **sofort** als Vollbild-Feier; alle anderen genau einmal beim nächsten Öffnen. Kein neuer Server nötig — die Zählung erledigt eine Automatik direkt in der Datenbank.

### A) Komponenten-Struktur

```
Vorschläge-Tab (bestehend)
├── Momentum-Banner (NEU)                 ← ganz oben, über den Filter-Chips
│   ├── Level-Name  (z.B. „Eingespielte Gruppe")
│   ├── Zahl abgeschlossener Aktivitäten
│   └── Fortschrittsbalken zum nächsten Meilenstein (shadcn „progress")
│        └── entfällt bei „Legendäre Gruppe" (höchstes Level) → nur Rohzahl
│   (antippbar → öffnet Level-Leiter)
│
├── Level-Leiter-Sheet (NEU)              ← shadcn „sheet", von unten
│   ├── Level 1 · Neue Gruppe · ab 0      [Status: erreicht / offen]
│   ├── Level 2 · Gruppe · ab 5           [Status: erreicht / offen]
│   ├── Level 3 · Eingespielte Gruppe · ab 10
│   └── Level 4 · Legendäre Gruppe · ab 25
│
├── Filter-Chips (bestehend)
└── Vorschlags-Liste (bestehend)

Vollbild-Feier-Overlay (NEU)              ← über der ganzen App, group-weit
├── Konfetti-Animation (canvas-confetti)
├── Neuer Level-Name + kurze Gratulation
└── „Irgendwo tippen zum Schließen"
```

Neue Bausteine (Namen als Vorschlag für `/frontend`):
- **MomentumBanner** — liest die Fortschritts-Akte, zeigt Level/Zahl/Balken, öffnet die Leiter.
- **MomentumLevelSheet** — die vollständige Level-Leiter mit erreicht/offen-Markierung.
- **MomentumCelebration** — das Vollbild-Feier-Overlay mit Konfetti.
- **useGroupMomentum(groupId)** — Daten-Hook: lädt die Fortschritts-Akte + „was habe ich schon gesehen", hält sie per Realtime aktuell, meldet eine anstehende Feier.

Wiederverwendet: shadcn `progress` + `sheet`, das bestehende Realtime-Muster (Kanal gefiltert nach `group_id`), die Membership-Helfer der Datenbank (`is_group_member`).

### B) Datenmodell (in Alltagssprache)

Es kommen **zwei** kleine Tabellen dazu — keine Änderung an bestehenden Daten.

**1. Fortschritts-Akte je Gruppe** („group_momentum")
- Zu welcher Gruppe gehört sie
- Anzahl abgeschlossener Aktivitäten (wird automatisch gepflegt)
- Höchster jemals erreichter Meilenstein (0, 5, 10 oder 25) — **steigt nur, sinkt nie**
- Zuletzt aktualisiert

Diese Zahl „höchster erreichter Meilenstein" ist der Trick gegen Konfetti-Farming: Wer eine abgeschlossene Aktivität löscht, senkt zwar die Anzahl (und damit das angezeigte Level), aber nicht diese Marke — also gibt es beim erneuten Überschreiten keine zweite Feier.

**2. Gesehen-Vermerk je Mitglied** („group_momentum_seen")
- Gruppe + Mitglied
- Höchster Meilenstein, dessen Feier dieses Mitglied schon gesehen hat

**So entscheidet die App, ob gefeiert wird:** Ist der „höchste erreichte Meilenstein" der Gruppe größer als der „höchste gesehene" dieses Mitglieds → einmal feiern (immer den höchsten), danach den Gesehen-Wert nachziehen. Damit sieht bei mehreren verpassten Meilensteinen jede:r nur die höchste Feier, und niemals eine doppelt.

**Wer pflegt die Zahlen?** Eine **Automatik in der Datenbank** (Trigger): Sobald eine Aktivität angelegt, geändert oder gelöscht wird, zählt sie die abgeschlossenen Aktivitäten der betroffenen Gruppe neu und hebt bei Bedarf die Meilenstein-Marke an. Mitglieder schreiben selbst **nur** ihren eigenen Gesehen-Wert.

**Anzeige vs. Feier — bewusst getrennt:**
- *Anzeige* (Level-Name, Zahl, Balken) folgt immer der **echten aktuellen** Anzahl → sinkt beim Löschen live.
- *Feier* hängt an der **dauerhaften Meilenstein-Marke** → passiert pro Meilenstein für immer nur einmal.

**Gespeichert in:** Supabase (PostgreSQL) — geräteübergreifend, für alle Gruppenmitglieder synchron.

### C) Realtime & Ablauf

- Das Banner **abonniert die eine Fortschritts-Akte-Zeile** der Gruppe (Realtime, gefiltert nach `group_id`). Schließt jemand eine Aktivität ab, aktualisiert die Automatik die Zeile → das Banner springt bei allen Geöffneten ohne Reload weiter.
- **Sofort-Feier (abschließende Person):** Nach dem Statuswechsel lädt der Hook die Akte neu; ist die Meilenstein-Marke jetzt höher als der eigene Gesehen-Wert → Overlay zeigen, dann Gesehen-Wert nachziehen.
- **Nachhol-Feier (alle anderen):** Beim Öffnen des Vorschläge-Tabs prüft der Hook denselben Vergleich → höchsten neuen Meilenstein einmal feiern, Gesehen-Wert nachziehen.
- **Beitritt:** Eine Automatik setzt den Gesehen-Wert des neuen Mitglieds sofort auf den aktuellen Gruppen-Meilenstein → keine Alt-Feiern.
- **Launch/Backfill:** Eine einmalige Einrichtung setzt für jede Gruppe die Meilenstein-Marke auf den bereits erreichten Stand **und** hebt den Gesehen-Wert aller Bestandsmitglieder auf denselben Stand → Historie zählt, aber keine rückwirkende Feier.

### D) Zugriffsschutz (RLS)
- Fortschritts-Akte: **alle Mitglieder der Gruppe dürfen lesen**; schreiben darf nur die Datenbank-Automatik (kein direkter Client-Schreibzugriff → Zahlen sind fälschungssicher).
- Gesehen-Vermerk: Mitglieder dürfen **nur ihren eigenen** Eintrag ihrer eigenen Gruppe lesen und schreiben.

### E) Level-Regeln (eine kleine Hilfsdatei, kein Server)
Eine reine Rechen-Datei (`src/lib/momentum.ts`, mit Test daneben) kapselt: Level-Namen, Schwellen 0/5/10/25, „welches Level bei Zahl X", „nächster Meilenstein", „noch N bis …". So sind die Regeln an einer Stelle und leicht testbar.

### F) Abhängigkeiten (zu installierende Pakete)
- `canvas-confetti` — leichte Konfetti-Animation für die Feier (~6 KB, keine Assets).
- `@types/canvas-confetti` — TypeScript-Typen (nur Entwicklung).

*(shadcn `progress` und `sheet` sind bereits vorhanden — keine Installation nötig.)*

### G) Was NICHT gebaut wird
Kein neuer API-Endpunkt, keine Edge Function, kein Server-Rendering. Die gesamte Logik lebt in DB-Automatik (Zählen/Feier-Marke) + Client (Anzeige/Feier-Auslösung). Passt vollständig zum Static Export.

## Frontend Implementation (/frontend)

**Datum:** 2026-07-13 · **Status:** UI komplett, wartet auf `/backend` (Tabellen + Trigger + Backfill).

### Neue Dateien
- `src/lib/momentum.ts` + `momentum.test.ts` (21 Tests) — Level-Regeln gekapselt: `MOMENTUM_LEVELS` (0/5/10/25), `levelForCount`, `nextLevel`, `progressToNextLevel`, `progressLabel` („Noch N bis …"), `pendingCelebrationMilestone` (erreicht > gesehen → höchster), `levelForMilestone`.
- `src/hooks/useGroupMomentum.ts` — lädt `group_momentum` (Akte) + eigenen `group_momentum_seen`-Wert, Realtime-Subscription auf die Akte-Zeile (Kanban-Muster, Filter `group_id`), `markCelebrationSeen()` mit optimistischem Update + Upsert.
- `src/components/groups/MomentumBanner.tsx` — Karte mit Sparkles-Medaillon, Overline „Gruppen-Momentum", Level-Name + Zahl, shadcn `progress` (h-2) + Fortschrittstext; im höchsten Level nur Rohzahl ohne Balken. Antippen → Level-Leiter.
- `src/components/groups/MomentumLevelSheet.tsx` — `ResponsiveModal` (Bottom-Sheet mobil / Dialog Desktop) mit allen 4 Leveln, Haken = erreicht, Schwellen-Zahl = offen, „Aktuell"-Chip; „erreicht" folgt der Live-Anzahl.
- `src/components/groups/MomentumCelebration.tsx` — Vollbild-Overlay (invertierter Feier-Block `--surface-ink`), „Level up!"-Overline in Gold, Level-Name als Serif-Display 38px, canvas-confetti in Mellon-Palette (eigene Canvas-Instanz, 1 Burst + 2 Nachzügler, kein Loop), Tippen irgendwo schließt.

### Integrationen / Abweichungen
- **Hook auf Shell-Ebene statt im Tab:** `useGroupMomentum` wird einmal in `src/app/groups/view/page.tsx` gemountet und via `GroupShellContext` (neues Feld `momentum`) ans Banner gereicht. Grund: Die Sofort-Feier muss auch beim Abschluss am **Board** erscheinen (Realtime-Event trifft die Shell, egal welcher Tab aktiv ist) — und es gibt nur eine Subscription statt zwei. Die Spec verortete den Hook im Vorschläge-Tab; das Overlay „über der ganzen App" (Tech Design C) erzwingt die Shell-Ebene.
- Banner in `VorschlaegeTab.tsx` über den Filter-Chips; blendet sich still aus, solange die Akte fehlt (`momentum === null`) → kein Fehlerzustand vor dem `/backend`-Rollout.
- `database.types.ts` um `group_momentum` + `group_momentum_seen` erweitert (Typ-Vertrag; wird von `/backend` aus dem echten Schema regeneriert). Spalten: `completed_count`, `highest_milestone`, `highest_seen_milestone`, jeweils + `group_id`/`user_id`/`updated_at`.
- `canvas-confetti` + `@types/canvas-confetti` installiert.
- Feier-Fehlschlag beim Speichern des Gesehen-Werts ist bewusst still (console.warn) — schlimmstenfalls erscheint die Feier einmal erneut.

### Erwartungen an /backend
- Tabellen `group_momentum` (PK `group_id`, vom Trigger auf `activities` gepflegt) und `group_momentum_seen` (PK `group_id,user_id`, Upsert mit `onConflict: 'group_id,user_id'`).
- `group_momentum` in die Realtime-Publication aufnehmen (Banner/Feier abonnieren `postgres_changes`).
- RLS: Mitglieder lesen die Akte ihrer Gruppe; `group_momentum_seen` nur eigene Zeile lesen/schreiben; Akte nicht client-schreibbar.
- Backfill-Migration + Join-Trigger laut Tech Design (Gesehen-Wert seeden).

## Backend Implementation (/backend)

**Datum:** 2026-07-13 · **Status:** Live in Supabase (Migrationen `proj15_group_momentum`, `proj15_momentum_harden_functions`).

### Schema (deployed)
- **`group_momentum`** — `group_id` (PK, FK→groups CASCADE), `completed_count` (≥0), `highest_milestone` (CHECK in 0/5/10/25), `updated_at`.
- **`group_momentum_seen`** — PK (`group_id`,`user_id`), FK→groups/auth.users CASCADE, `highest_seen_milestone` (CHECK in 0/5/10/25), `updated_at` (per Trigger gepflegt).
- Partial-Index `idx_activities_group_completed` auf `activities(group_id) WHERE status='abgeschlossen'` für den Trigger-Recount.

### Automatik (Trigger, alle SECURITY DEFINER)
- `refresh_group_momentum(gid)` — Recount + `GREATEST`-Upsert: Marke steigt monoton, sinkt nie (Anti-Konfetti-Farming, atomar bei Gleichzeitigkeit via Row-Lock).
- `trg_activity_momentum` auf `activities` (INSERT/UPDATE/DELETE, inkl. Gruppenwechsel → beide Gruppen).
- `trg_group_momentum_init` auf `groups` — neue Gruppe bekommt sofort eine Akte (Banner „Neue Gruppe · 0" ab Sekunde 1).
- `trg_member_momentum_seen_seed` auf `group_members` — Beitritt seedet Gesehen-Wert = aktueller Gruppen-Meilenstein (keine Alt-Feiern).

### RLS & Härtung
- `group_momentum`: SELECT nur für Gruppenmitglieder (`is_group_member`); **keine** Client-Schreib-Policies — Zahlen fälschungssicher.
- `group_momentum_seen`: SELECT/INSERT/UPDATE nur eigene Zeile + Mitgliedschaft.
- EXECUTE auf allen Momentum-Funktionen für `public`/`anon`/`authenticated` revoked (nicht als RPC gedacht; Trigger feuern unabhängig davon).
- `group_momentum` zur `supabase_realtime`-Publication hinzugefügt (Banner/Feier-Updates).

### Backfill (verifiziert)
- 5/5 Gruppen mit Akte, 8/8 Mitglieder mit Gesehen-Vermerk = Gruppen-Meilenstein → keine rückwirkende Feier.
- Größter Bestand: eine Gruppe mit 4 abgeschlossenen (Marke 0) — der nächste Abschluss löst dort die erste 5er-Feier aus.

### Tests (verifiziert)
- **DB-Trigger transaktional getestet (mit Rollback):** 0→5 Abschlüsse ⇒ Count 5/Marke 5; alle löschen ⇒ Count 0/**Marke bleibt 5** (monoton). ✓
- **RLS-Negativtest:** `authenticated` ohne Mitgliedschaft sieht 0 Zeilen, Update trifft 0 Zeilen. ✓
- **`useGroupMomentum.test.ts` (7 Tests):** Laden, höchster verpasster Meilenstein, fehlende Seen-Zeile, fehlende Akte (still), Upsert bei `markCelebrationSeen`, Realtime-Subscription, Channel-Cleanup. ✓
- `database.types.ts` gegen das echte Schema verifiziert (Generator-Output identisch mit Frontend-Vertrag) + neue Functions-Einträge ergänzt.

Kein API-Endpunkt, keine Edge Function — komplett Static-Export-konform (DB-Automatik + Client).

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

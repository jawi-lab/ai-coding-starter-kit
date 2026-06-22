# PROJ-5: Kanban-Board

## Status: Planned
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Datenbank, RLS
- PROJ-2 (Authentifizierung & User Accounts) — eingeloggter Nutzer
- PROJ-3 (Gruppe & Mitglieder-Management) — Gruppen, Rollen (admin / editor / observer)
- PROJ-4 (Aktivitäts-Vorschläge & Voting) — `activities`-Tabelle, Status `zu_planen`, GroupMainSheet mit TabBar

## User Stories
- Als Gruppenmitglied möchte ich alle Aktivitäten meiner Gruppe auf einem Kanban-Board sehen, damit ich den Planungsstand auf einen Blick erkenne.
- Als Initiator oder Admin möchte ich einen Zeitraum für eine Aktivität im Status „Zu Planen" festlegen und sie in „In Planung" verschieben, damit die konkrete Planung beginnen kann.
- Als Initiator oder Admin möchte ich eine Aktivität von „In Planung" auf „Planung abgeschlossen" setzen, wenn alle Details feststehen.
- Als Initiator oder Admin möchte ich eine Aktivität als „Abgeschlossen" markieren, damit die Gruppe weiß, dass das Ereignis stattgefunden hat.
- Als Nutzer auf dem Smartphone möchte ich durch die Kanban-Spalten wischen, damit ich das Board auf kleinen Bildschirmen komfortabel nutzen kann.

## Out of Scope
- Volles Terminfindungs-Feature (Kalender-Sync, Verfügbarkeits-Overlay der Gruppe) → PROJ-7
- „Zu meinem Kalender hinzufügen"-Button bei „Planung abgeschlossen" → PROJ-7
- Unteraufgaben, Verantwortlichkeiten, Kommentare auf Aktivitäten → PROJ-6
- Bild-Upload nach Abschluss → PROJ-6
- Archivierung im Nutzerprofil → PROJ-8
- Push-/E-Mail-Benachrichtigungen bei Statuswechseln → PROJ-10 / PROJ-12
- Drag-and-Drop zum Verschieben von Karten (zu fehleranfällig auf Mobile)
- Rückwärtsbewegung von Karten (kein „Zurück"-Status)
- Aktivitäten im Status `vorschlag` (die erscheinen nur im „Vorschläge"-Tab aus PROJ-4, nicht auf dem Kanban)

## Acceptance Criteria

### Board-Ansicht

- [ ] Angenommen der Nutzer öffnet den Tab „Planung" im GroupMainSheet, dann sieht er alle Aktivitäten der Gruppe mit Status `zu_planen`, `in_planung`, `planung_abgeschlossen` und `abgeschlossen` auf dem Kanban-Board.
- [ ] Angenommen das Gerät hat eine Breite < 768 px (Mobile), dann wird ein tab-basiertes Layout angezeigt: vier Tabs „Zu Planen / In Planung / Planung abgeschlossen / Abgeschlossen", horizontal wischbar — jeweils nur eine Spalte sichtbar.
- [ ] Angenommen das Gerät hat eine Breite ≥ 768 px (Desktop/Tablet), dann werden alle vier Spalten nebeneinander als Grid angezeigt, vertikal scrollbar pro Spalte.
- [ ] Angenommen eine Spalte enthält Aktivitäten, dann zeigt jede Karte: Titelbild (og_image_url oder gemeinfreies Platzhalterbild), Name, Initiator, Zeitraum (Start–Ende, nur wenn gesetzt).
- [ ] Angenommen eine Spalte enthält keine Aktivitäten, dann wird ein leerer Zustand mit dem Text „Noch keine Aktivitäten hier" angezeigt (kein weiterer CTA).
- [ ] Angenommen eine andere Person ändert den Status einer Aktivität, dann aktualisiert sich das Board aller geöffneten Clients automatisch per Supabase Realtime — ohne Seitenreload.

### Zeitraum festlegen & Übergang „Zu Planen" → „In Planung"

- [ ] Angenommen der Nutzer ist Initiator oder Admin und eine Aktivität liegt in der Spalte „Zu Planen", wenn er das ⋯-Aktionsmenü der Karte öffnet, dann sieht er die Option „In Planung verschieben".
- [ ] Angenommen er wählt „In Planung verschieben", dann öffnet sich ein Dialog mit einem Datumsbereich-Picker (Start-Datum + End-Datum, Pflichtfelder).
- [ ] Angenommen er gibt einen gültigen Zeitraum ein (Start ≤ Ende, Start liegt nicht in der Vergangenheit), dann wechselt die Aktivität in den Status `in_planung`, der Zeitraum wird gespeichert und die Karte wandert in die Spalte „In Planung".
- [ ] Angenommen er gibt einen ungültigen Zeitraum an (Start > Ende oder Start in der Vergangenheit), dann wird eine Validierungsfehlermeldung angezeigt und der Status wechselt nicht.
- [ ] Angenommen der Nutzer ist Redakteur oder Beobachter, dann sieht er kein ⋯-Aktionsmenü auf Karten — nur die Karteninhalte.

### Übergang „In Planung" → „Planung abgeschlossen"

- [ ] Angenommen der Nutzer ist Initiator oder Admin und eine Aktivität liegt in „In Planung", wenn er ⋯ → „Planung abschließen" wählt, dann erscheint ein Bestätigungsdialog mit dem Hinweis „Diese Aktion kann nicht rückgängig gemacht werden."
- [ ] Angenommen der Nutzer bestätigt, dann wechselt die Aktivität in den Status `planung_abgeschlossen` und wandert in die gleichnamige Spalte.
- [ ] Angenommen der Nutzer bricht den Dialog ab, dann bleibt die Aktivität unverändert in „In Planung".

### Übergang „Planung abgeschlossen" → „Abgeschlossen"

- [ ] Angenommen der Nutzer ist Initiator oder Admin und eine Aktivität liegt in „Planung abgeschlossen", wenn er ⋯ → „Als abgeschlossen markieren" wählt, dann erscheint ein Bestätigungsdialog.
- [ ] Angenommen der Nutzer bestätigt, dann wechselt die Aktivität in den Status `abgeschlossen` und wandert in die Spalte „Abgeschlossen".
- [ ] Angenommen der Nutzer bricht den Dialog ab, dann bleibt die Aktivität unverändert.

### Fehlerverhalten

- [ ] Angenommen die API ist bei einem Statuswechsel nicht erreichbar, dann bleibt die Karte in der aktuellen Spalte, eine Toast-Fehlermeldung erscheint und der Dialog schließt sich.

## Edge Cases
- **Kein Inhalt auf dem gesamten Board:** Alle vier Spalten zeigen den leeren Zustand gleichzeitig.
- **Sehr viele Karten in einer Spalte:** Spalte wird vertikal scrollbar; auf Mobile scrollt man innerhalb des aktiven Tabs.
- **Sehr langer Aktivitätsname:** Name wird auf der Karte mit `line-clamp-2` abgeschnitten; voller Name erscheint in der Detailansicht (PROJ-6).
- **Gleichzeitiger Statuswechsel durch zwei Admins:** Kein Lock erforderlich — letzter DB-Write gewinnt; Realtime synchronisiert alle Clients sofort.
- **Beobachter versucht Statuswechsel via direktem API-Aufruf:** RLS-Policy auf `activities` verhindert UPDATE durch Nicht-Initiator und Nicht-Admin.
- **Zeitraum liegt in der Vergangenheit:** Wird client-seitig validiert (Start-Datum ≥ heute); falls trotzdem über API gesendet, wird er gespeichert (kein DB-Level-Check, da historische Aktivitäten möglich sind).
- **Aktivität ohne og_image_url:** Platzhalterbild aus PROJ-4 wird verwendet — kein leerer Slot.

## Technical Requirements
- Realtime-Update via Supabase Realtime auf `activities` (gefiltert nach `group_id`) für alle Kanban-Status-Änderungen
- RLS: UPDATE auf `activities` nur für Initiator (`initiator_id = auth.uid()`) oder Admin des Projekts
- DB-Migration: neue CHECK-Constraint-Werte `in_planung`, `planung_abgeschlossen`, `abgeschlossen` zu `activities.status` hinzufügen; neue Felder `start_date` (date, nullable) und `end_date` (date, nullable)

## Open Questions
- [ ] Soll der Zeitraum bei der Transition `zu_planen` → `in_planung` Pflicht sein, oder kann er später nachgetragen werden? (Empfehlung: Pflicht bei der Transition — sonst fehlt das Kernelement der Planung. PROJ-7 ersetzt den Picker durch vollständigen Kalender-Sync.)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Tab-basiertes Layout auf Mobile, 4-Spalten-Grid auf Desktop | Horizontal-Scroll-Kanban auf Mobile ist auf kleinen Screens schwer bedienbar; Tabs sind konsistent mit dem GroupMainSheet-Pattern aus PROJ-4 | 2026-06-22 |
| Statuswechsel nur per Aktionsmenü (⋯), kein Drag-and-Drop | Drag-and-Drop ist auf Mobile fehleranfällig und erfordert eine zusätzliche Library; Kontextmenü ist etabliertes Muster (PROJ-4) | 2026-06-22 |
| Nur Initiator oder Admin darf Karten verschieben | Konsistent mit Rollenkonzept aus PROJ-3; Redakteur und Beobachter können den Fortschritt verfolgen, aber nicht eigenständig Statuswechsel auslösen | 2026-06-22 |
| Kein Rückwärts-Status | Rückschritte würden die Gruppenplanung durcheinanderbringen; „Erneut zur Abstimmung" (PROJ-4) ist der einzige definierte Rückweg (nur im Vorschlag-Stadium) | 2026-06-22 |
| Einfacher Date-Picker für Zeitraum (nicht Kalender-Sync) | Kalender-Sync ist PROJ-7; für PROJ-5 reicht ein simpler Date-Range-Picker als Grundlage — PROJ-7 ersetzt ihn durch die vollständige Terminfindungs-Ansicht | 2026-06-22 |
| Bestätigungsdialog bei allen Statuswechseln ab `in_planung` | Irreversible Aktionen brauchen eine Sicherheitsstufe; bei `zu_planen` → `in_planung` ist der Picker selbst die Bestätigung | 2026-06-22 |
| Status `vorschlag` erscheint nicht auf dem Kanban | Konzept-Vorgabe: saubere Trennung zwischen Backlog (Vorschläge-Tab) und Planungsphase (Kanban-Tab); Übergangsstatus ist `zu_planen` | 2026-06-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| shadcn Calendar (react-day-picker) für DateRange-Picker | Konsistent mit Design-System; keine externe Date-Library nötig; Popover-Pattern bereits vorhanden | 2026-06-22 |
| Supabase Realtime Channel gefiltert nach `group_id` | Echtzeit-Updates ohne Seitenreload; nur relevante Daten pro Gruppe übertragen, minimaler Bandwidth-Verbrauch | 2026-06-22 |
| `ActivityStatus`-Typ erweitern statt neuen Typ anlegen | Single source of truth in `activity-types.ts`; alle Hooks und Komponenten nutzen denselben Typ automatisch | 2026-06-22 |
| `ConfirmStatusDialog` als generische Komponente | Zwei Statuswechsel (`in_planung → planung_abgeschlossen`, `planung_abgeschlossen → abgeschlossen`) teilen die gleiche Dialog-Logik — eine Komponente, konfigurierbar über Props | 2026-06-22 |
| CSS Grid 4-Spalten (Tailwind) für Desktop, shadcn Tabs für Mobile | Keine zusätzliche Layout-Library nötig; Tabs sind konsistent mit dem GroupMainSheet-Pattern aus PROJ-4 | 2026-06-22 |
| RLS UPDATE-Policy auf Initiator + Admin erweitern | Sicherheit liegt in der DB, nicht nur im UI; schützt gegen direkte API-Aufrufe durch Observer/Editor (Out-of-Scope für PROJ-5-Komponenten, aber DB-seitig nötig) | 2026-06-22 |

---

## Tech Design (Solution Architect)

### Komponentenstruktur

```
GroupMainSheet
└── Tab Bar (Vorschläge | Planung | Archiv)
    └── [Tab: Planung]
        └── KanbanBoard
            ├── [Mobile < 768px — shadcn Tabs]
            │   ├── Tab "Zu Planen"           → KanbanColumn
            │   ├── Tab "In Planung"          → KanbanColumn
            │   ├── Tab "Planung abgschl."    → KanbanColumn
            │   └── Tab "Abgeschlossen"       → KanbanColumn
            └── [Desktop ≥ 768px — CSS 4-Column Grid]
                ├── KanbanColumn "Zu Planen"
                │   ├── KanbanCard ×n
                │   │   ├── Thumbnail (og_image_url / Placeholder)
                │   │   ├── Name (line-clamp-2)
                │   │   ├── Initiator-Name
                │   │   ├── Zeitraum Start–Ende (wenn gesetzt)
                │   │   └── ⋯ ActionMenu (nur Initiator / Admin)
                │   └── EmptyColumnState
                ├── KanbanColumn "In Planung"            (gleiche Struktur)
                ├── KanbanColumn "Planung abgeschlossen" (gleiche Struktur)
                └── KanbanColumn "Abgeschlossen"         (gleiche Struktur)

[Overlays/Dialoge]
├── MoveToPlanningDialog
│   ├── DateRange-Picker (Start + End-Datum, Pflicht)
│   └── Inline-Validierungsfehler
└── ConfirmStatusDialog (generisch, für Übergänge ab "In Planung")
```

### Neue Dateien

| Datei | Zweck |
|-------|-------|
| `src/components/groups/KanbanBoard.tsx` | Board-Wrapper: Mobile-/Desktop-Layout, Datenverteilung nach Status |
| `src/components/groups/KanbanColumn.tsx` | Einzelne Spalte: Header, Kartenliste, Empty State |
| `src/components/groups/KanbanCard.tsx` | Aktivitätskarte: Bild, Name, Zeitraum, ⋯ ActionMenu |
| `src/components/groups/MoveToPlanningDialog.tsx` | Zeitraum eingeben → Übergang `zu_planen → in_planung` |
| `src/components/groups/ConfirmStatusDialog.tsx` | Generischer Bestätigungsdialog für Statuswechsel |
| `src/hooks/useKanbanActivities.ts` | Datenabruf + Realtime-Subscription gefiltert nach group_id |
| `src/hooks/useUpdateActivityStatus.ts` | Status + Start/End-Datum schreiben, Fehlerbehandlung |

### Geänderte Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/groups/GroupMainSheet.tsx` | „Planung"-Tab aktivieren, Tab-State einführen, KanbanBoard einbinden |
| `src/lib/activity-types.ts` | `ActivityStatus` um `in_planung`, `planung_abgeschlossen` erweitern; `start_date`, `end_date` zu `Activity` hinzufügen |
| `src/components/ui/calendar.tsx` | Neu via shadcn CLI installieren (`npx shadcn@latest add calendar`) |

### Datenmodell — DB-Änderungen

**Neue Felder auf `activities`:**

| Feld | Typ | Default | Bedeutung |
|------|-----|---------|-----------|
| `start_date` | date | NULL | Geplantes Startdatum |
| `end_date` | date | NULL | Geplantes Enddatum |

**Status-Werte (aktualisierter CHECK-Constraint):**

| Status | Bedeutung | Übergang von |
|--------|-----------|-------------|
| `vorschlag` | Aktiver Vorschlag im Voting | — |
| `zu_planen` | Voting gewonnen, Planung steht aus | PROJ-4 |
| `in_planung` | Zeitraum festgelegt, aktiv in Planung | `zu_planen` |
| `planung_abgeschlossen` | Termin fixiert, alle Details stehen | `in_planung` |
| `abgeschlossen` | Aktivität hat stattgefunden | `planung_abgeschlossen` |

> `geplant` bleibt im Constraint für Bestandsdaten; neue Karten nutzen nur die fünf definierten Werte.

### Datenfluss

```
Nutzer öffnet Tab "Planung"
  → useKanbanActivities(groupId)
     lädt Aktivitäten mit Status ∈ {zu_planen, in_planung, planung_abgeschlossen, abgeschlossen}
  → Supabase Realtime: Channel auf activities WHERE group_id = X
     INSERT / UPDATE / DELETE → lokaler State aktualisiert → Board re-rendert

Initiator / Admin → ⋯ → "In Planung verschieben"
  → MoveToPlanningDialog öffnet sich
  → Nutzer wählt Start + End-Datum (shadcn Calendar in Popover)
  → Client-Validierung: Start ≥ heute, Start ≤ Ende
  → useUpdateActivityStatus({ status: 'in_planung', start_date, end_date })
     Fehler → Toast, Dialog bleibt offen, kein State-Wechsel
     Erfolg → Realtime-Update → Karte wandert in "In Planung"

Initiator / Admin → ⋯ → "Planung abschließen" / "Als abgeschlossen markieren"
  → ConfirmStatusDialog öffnet sich
  → Bestätigung → useUpdateActivityStatus({ status: '...' })
  → gleicher Fehler-/Erfolgspfad
```

### Benötigte Packages

| Package | Zweck | Installation |
|---------|-------|-------------|
| `react-day-picker` | Kalender-Dependency von shadcn Calendar | `npx shadcn@latest add calendar` |

> Alle anderen Bausteine (Tabs, Dialog, DropdownMenu, Popover, Skeleton, Sonner) sind bereits installiert.

### RLS & Sicherheit

- Die UPDATE-Policy auf `activities` aus PROJ-4 erlaubt nur dem Initiator Änderungen. Sie muss um Admin-Rollcheck erweitert werden: Mitglied in `group_members` mit `role = 'admin'` für die gleiche `group_id`.
- Supabase Realtime respektiert RLS — nur Gruppenmitglieder empfangen Updates.
- Client-Validierung des Zeitraums dient der UX; Sicherheit liegt vollständig in RLS.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

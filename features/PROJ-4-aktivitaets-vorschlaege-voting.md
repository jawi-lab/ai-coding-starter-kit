# PROJ-4: Aktivitäts-Vorschläge & Voting

## Status: In Progress
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Datenbank, RLS, Storage
- PROJ-2 (Authentifizierung & User Accounts) — eingeloggter Nutzer, `active`-Status
- PROJ-3 (Gruppe & Mitglieder-Management) — Gruppen, Rollen (admin / editor / observer)

## User Stories
- Als Admin oder Redakteur möchte ich einen Aktivitäts-Vorschlag mit Name, Dauer-Kategorie und optionaler URL erstellen, damit meine Gruppe darüber abstimmen kann.
- Als Gruppenmitglied möchte ich alle offenen Vorschläge meiner Gruppe sehen, sortiert nach Vote-Fortschritt, damit ich schnell erkenne, welche kurz vor der Schwelle stehen.
- Als Gruppenmitglied möchte ich einen Vorschlag upvoten (und den Vote wieder entfernen), damit ich demokratisch mitentscheide, was geplant wird.
- Als Initiator oder Admin möchte ich einen Vorschlag bearbeiten, löschen oder erneut zur Abstimmung geben, solange er noch im Status „Vorschlag" ist.
- Als Gruppenmitglied möchte ich sehen, wie viele Votes ein Vorschlag hat (z. B. „3/5"), damit ich den Fortschritt einschätzen kann.

## Out of Scope
- Kanban-Board-Ansicht und Spalten-Layout — PROJ-5
- Unteraufgaben, Verantwortlichkeiten, Kommentare — PROJ-6 (Aktivitäts-Detail)
- Bild-Upload nach Abschluss — PROJ-6 / PROJ-8
- Kalender-Sync und Terminfindung — PROJ-7
- Push-Benachrichtigung wenn Schwelle erreicht — PROJ-10
- Downvote / Ablehnung von Vorschlägen (nur Upvote vorgesehen)
- Kommentar-Funktion auf Vorschlägen (gehört zu PROJ-6)
- Zeitraum / Datum festlegen (wird in PROJ-5 / PROJ-7 gesetzt)

## Acceptance Criteria

### Vorschlag erstellen
- [ ] Angenommen der Nutzer ist Admin oder Redakteur, wenn er „Vorschlag erstellen" aufruft, dann sieht er ein Formular mit den Feldern: Name (Pflicht), Dauer-Kategorie (Pflicht, Dropdown: spontan / Wochenende / längerer Zeitraum), Benötigte Upvotes (Pflicht, Minimum 1), URL (optional), Beschreibung (optional).
- [ ] Angenommen der Nutzer gibt eine URL ein, wenn er das Feld verlässt, dann ruft die App das og:image der Seite ab und zeigt es als Vorschau an.
- [ ] Angenommen die URL liefert kein Vorschaubild, dann wird ein gemeinfreies Platzhalterbild angezeigt und ein Hinweis „Kein Vorschaubild gefunden".
- [ ] Angenommen der Nutzer versucht das Formular ohne Pflichtfelder abzuschicken, dann wird für jedes fehlende Pflichtfeld eine Validierungsfehlermeldung angezeigt.
- [ ] Angenommen die Anzahl offener Vorschläge der Gruppe bereits der Mitgliederanzahl entspricht, wenn ein Nutzer „Vorschlag erstellen" aufruft, dann wird das Formular gesperrt und eine Meldung angezeigt: „Maximale Vorschlagsanzahl erreicht (X/X). Erst wenn ein Vorschlag abgestimmt oder gelöscht wird, kannst du einen neuen erstellen."
- [ ] Angenommen alle Pflichtfelder sind ausgefüllt, wenn der Nutzer „Speichern" klickt, dann wird der Vorschlag mit Status `vorschlag` angelegt und erscheint sofort in der Übersicht.

### Vorschlag-Übersicht
- [ ] Angenommen der Nutzer öffnet die Gruppe, dann sieht er alle Vorschläge im Status `vorschlag` sortiert nach Vote-Fortschritt (höchste Prozentzahl zuerst), bei Gleichstand nach Erstelldatum (neueste zuerst).
- [ ] Angenommen es gibt keine Vorschläge, dann wird ein leerer Zustand mit einem Call-to-Action „Ersten Vorschlag erstellen" angezeigt (nur für Admin/Redakteur klickbar).
- [ ] Angenommen die Übersicht lädt, dann zeigt jede Karte: Titelbild, Name, Initiator, Dauer-Kategorie, Vote-Fortschritt (z. B. „3/5").
- [ ] Angenommen der Nutzer wählt einen Filter (spontan / Wochenende / längerer Zeitraum), dann werden nur Vorschläge der gewählten Kategorie angezeigt.

### Voting
- [ ] Angenommen der Nutzer hat noch nicht gevoted, wenn er auf Upvote klickt, dann wird sein Vote gespeichert und der Zähler erhöht sich sofort (optimistic update).
- [ ] Angenommen der Nutzer hat bereits gevoted, wenn er erneut auf Upvote klickt, dann wird sein Vote entfernt und der Zähler verringert sich.
- [ ] Angenommen der Initiator ist eingeloggt, wenn er auf Upvote klickt, dann zählt sein eigener Vote regulär mit.
- [ ] Angenommen der Nutzer ist Beobachter, dann sieht er den Vote-Fortschritt, kann aber ebenfalls voten (Beobachter darf nur nicht erstellen).
- [ ] Angenommen der entscheidende Vote bringt den Zähler auf die Schwelle, dann wechselt der Status automatisch zu `zu_planen` und die Aktivität erscheint auf dem Kanban-Board — ohne Seitenreload (Realtime).
- [ ] Angenommen die Aktivität ist bereits `zu_planen`, wenn ein Nutzer seinen Vote zurückzieht und der Zähler unter die Schwelle fällt, dann bleibt die Aktivität im Status `zu_planen` (kein Rückschritt).

### Vorschlag bearbeiten
- [ ] Angenommen der Nutzer ist Initiator oder Admin, wenn er einen Vorschlag im Status `vorschlag` aufruft, dann sieht er eine „Bearbeiten"-Option.
- [ ] Angenommen der Nutzer bearbeitet Name, URL, Schwelle oder Dauer-Kategorie und speichert, dann werden die Änderungen sofort in der Übersicht sichtbar.
- [ ] Angenommen der Vorschlag hat bereits den Status `zu_planen`, dann ist die Bearbeitungsoption nicht verfügbar.

### Vorschlag löschen
- [ ] Angenommen der Nutzer ist Initiator oder Admin und der Vorschlag ist im Status `vorschlag`, wenn er „Löschen" wählt, dann erscheint ein Bestätigungsdialog.
- [ ] Angenommen der Nutzer bestätigt das Löschen, dann wird der Vorschlag inkl. aller zugehörigen Votes entfernt.

### Erneut zur Abstimmung
- [ ] Angenommen der Nutzer ist Initiator oder Admin und der Vorschlag ist im Status `vorschlag`, wenn er „Erneut zur Abstimmung" wählt, dann erscheint ein Bestätigungsdialog mit dem Hinweis, dass alle Votes zurückgesetzt werden.
- [ ] Angenommen der Nutzer bestätigt, dann werden alle Votes des Vorschlags auf 0 zurückgesetzt und der Zähler zeigt „0/X".

### Fehlerverhalten
- [ ] Angenommen die API ist nicht erreichbar, wenn der Nutzer ein Formular abschickt, dann wird eine Fehlermeldung angezeigt und die Eingabe bleibt erhalten.
- [ ] Angenommen der Vote-Request schlägt fehl, dann wird der Zähler auf den vorherigen Wert zurückgesetzt und eine Toast-Fehlermeldung erscheint.

## Edge Cases
- **Maximum Vorschläge:** Max. offene Vorschläge pro Gruppe = aktuelle Mitgliederanzahl. Zählt nur Status `vorschlag`; Aktivitäten in `zu_planen` oder weiter zählen nicht mit.
- **Minimum-Schwelle:** Benötigte Upvotes minimum 1 (Validierung im Formular und DB-Check).
- **Schwelle = 0 bei Reset:** Nicht möglich — Votes werden auf 0 gesetzt, aber die Schwelle bleibt unverändert.
- **Gleichzeitiges Voten:** Zwei Nutzer voten gleichzeitig den letzten benötigten Vote — die DB-Unique-Constraint stellt sicher, dass kein doppelter Vote eines Users gespeichert wird; der Statuswechsel passiert genau einmal durch einen DB-Trigger oder RLS-Logik.
- **Beobachter versucht Vorschlag zu erstellen:** Button ist nicht sichtbar; ggf. direkter API-Aufruf wird durch RLS abgewiesen.
- **URL-Abruf schlägt fehl (Timeout, CORS, privat):** Platzhalter-Bild wird verwendet, kein Formularfehler.
- **Sehr lange Aktivitätsnamen:** UI kürzt den Namen ab (Ellipsis), voller Name in der Detailansicht.
- **Nur ein Mitglied in der Gruppe:** Schwelle kann auf 1 gesetzt werden; Nutzer votet sich selbst durch.

## Technical Requirements
- Realtime-Update via Supabase Realtime bei Statuswechsel `vorschlag` → `zu_planen`
- og:image-Abruf: serverseitig (Edge Function) um CORS-Probleme zu vermeiden
- Vote-Uniqueness: DB-Constraint (unique per user + activity)
- RLS: Nur Gruppenmitglieder können Vorschläge der Gruppe sehen/erstellen/voten

## Open Questions
- [x] Maximale Vorschlagsanzahl: entspricht der aktuellen Mitgliederanzahl der Gruppe (z. B. 5 Mitglieder → max. 5 offene Vorschläge). → Gelöst.
- [x] In-App- und E-Mail-Benachrichtigungen beim Statuswechsel → ausgelagert in PROJ-12 (Benachrichtigungen & Einstellungen). Dort werden alle Trigger, Rollen-spezifischen Regeln und User-Einstellungen spezifiziert.

## Decision Log

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| GroupMainSheet statt Route `/groups/[groupId]` | Static Export verhindert dynamische Routen mit Laufzeit-IDs; Sheet-Pattern konsistent mit PROJ-3 | 2026-06-22 |
| Denormalisierter `current_votes`-Zähler in `activities` | Realtime-Subscription auf eine Tabelle statt zwei; einfachere Client-Logik; Trigger hält Zähler atomar aktuell | 2026-06-22 |
| DB-Trigger für `vorschlag` → `zu_planen` Statuswechsel | Race-Condition-sicher bei gleichzeitigem Voten; Statuswechsel passiert genau einmal im DB-Layer | 2026-06-22 |
| Supabase Edge Function `fetch-og-image` | CORS verhindert direkten Browser-Abruf fremder Seiten; Static Export hat keine eigenen API-Routen | 2026-06-22 |
| Supabase Realtime auf `activities`-Tabelle | Ein Event pro Änderung reicht für UI-Update; kein Seitenreload nötig; gefiltert nach `group_id` | 2026-06-22 |
| Optimistic Update beim Voten | Vote-Toggle ist einfach und umkehrbar — idealer Kandidat für sofortige UI-Reaktion mit Rollback bei Fehler | 2026-06-22 |
| RPC `reset_activity_votes` für Votes-Reset | Transaktionaler Reset (Votes + Zähler + Status) in einer Datenbankoperation; verhindert inkonsistente Zwischenzustände | 2026-06-22 |

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Eigener Status `vorschlag` als Backlog-Phase vor dem Kanban | Saubere Trennung zwischen „noch nicht bereit" und „bereit zur Planung"; Kanban-Board (PROJ-5) zeigt nur `zu_planen` und weiter | 2026-06-22 |
| Upvote ist togglebar | Standard-UX; verhindert irreversibles Festsetzen des Votes | 2026-06-22 |
| Initiator darf eigenen Vorschlag voten | Zählt regulär — der Initiator legt die Schwelle selbst fest und trägt Verantwortung dafür | 2026-06-22 |
| Nur Admin und Redakteur dürfen Vorschläge erstellen | Beobachter hat explizit nur Lese- und Voting-Rechte (Rollenkonzept PROJ-3) | 2026-06-22 |
| Titelbild nur via URL (og:image-Abruf), kein Upload | Upload gehört zur Abschluss-Phase; URL-Link (z. B. Airbnb) liefert automatisch ein passendes Bild | 2026-06-22 |
| Maximale Vorschlagsanzahl = Mitgliederanzahl | Verhindert Backlog-Spam; gibt jedem Mitglied implizit einen „Slot"; Limit passt sich dynamisch an, wenn Mitglieder beitreten oder die Gruppe verlassen | 2026-06-22 |
| Gemeinfreies Platzhalterbild bei fehlendem og:image | Kein Copyright-Risiko; bessere UX als leerer Platzhalter | 2026-06-22 |
| Statuswechsel `vorschlag` → `zu_planen` ist automatisch und irreversibel (aus Vote-Sicht) | Rückwärtsbewegung durch Vote-Entzug wäre verwirrend; „Erneut zur Abstimmung" ist der bewusste manuelle Reset-Pfad | 2026-06-22 |
| „Erneut zur Abstimmung" setzt alle Votes auf 0 | Echter Reset für faire zweite Runde; rein kosmetische Lösung wäre wertlos | 2026-06-22 |
| Sortierung nach Vote-Fortschritt (% zur Schwelle) | Gibt der Gruppe sofort Orientierung, wo eine Entscheidung nahe ist | 2026-06-22 |

---

## Tech Design (Solution Architect)

### Navigations-Architektur

PROJ-4 führt die primäre Gruppenansicht ein. Bisher öffnete ein Tap auf eine Gruppenkarte den `GroupDetailSheet` (Einstellungen). Ab PROJ-4 gilt:

- **GroupCard-Tap → `GroupMainSheet`** (neue Hauptansicht mit Tabs)
- **Einstellungs-Icon im Header → `GroupSettingsSheet`** (bisheriger `GroupDetailSheet`, unverändert, nur umbenannt)

Diese Trennung ist notwendig, weil die App wächst (Kanban in PROJ-5, Archiv in PROJ-8) und eine Tab-basierte Struktur vorbereitet werden muss. Ein eigener URL-Pfad `/groups/[groupId]` ist nicht möglich, da die App als statischer Export ohne Server läuft und Gruppen-IDs zur Laufzeit erzeugt werden (keine statischen Parameter vorher bekannt).

---

### A) Komponentenstruktur

```
Gruppen-Übersicht (/groups)
└── GroupCard (×n)
    └── Tap → öffnet GroupMainSheet

GroupMainSheet  [NEU – primäre Gruppenansicht]
├── Header
│   ├── Schließen-Button
│   ├── Gruppenname
│   └── Einstellungen-Icon  → öffnet GroupSettingsSheet
├── TabBar  [Vorschläge | Planung* | Archiv*]   (* zukünftig)
└── Tab "Vorschläge"
    ├── ProposalFilterBar
    │   └── Filter-Chips: Alle | Spontan | Wochenende | Längerer Zeitraum
    ├── ProposalList
    │   └── ProposalCard (×n)
    │       ├── Titelbild  (og:image oder Platzhalter)
    │       ├── ProposalMeta
    │       │   ├── Name (abgeschnitten bei Überlänge)
    │       │   ├── Initiator · Dauer-Kategorie-Badge
    │       │   └── Vote-Fortschritt  z. B. „3 / 5"
    │       ├── VoteButton  (Upvote-Toggle, ♡ → ♥)
    │       └── ProposalActionsMenu  (⋯, nur Initiator / Admin)
    │           ├── Bearbeiten
    │           ├── Erneut zur Abstimmung
    │           └── Löschen
    ├── EmptyProposalState
    │   └── CTA „Ersten Vorschlag erstellen"  (nur Admin / Redakteur)
    └── CreateProposalFAB  (Floating Button, nur Admin / Redakteur)

CreateProposalSheet  [neues unteres Sheet]
├── Name  (Pflicht, max. 200 Zeichen)
├── Dauer-Kategorie  (Dropdown: Spontan / Wochenende / Längerer Zeitraum)
├── Benötigte Upvotes  (Zahleingabe, min. 1, max. Mitgliederanzahl)
├── URL  (optional)
│   └── OgImagePreview  (erscheint nach URL-Eingabe)
└── Beschreibung  (optional, Textarea)

EditProposalSheet  [identisches Formular, vorausgefüllt]

DeleteProposalDialog  [Bestätigungsdialog]

ResetVotesDialog  [Bestätigungsdialog mit Hinweis „Alle Votes werden zurückgesetzt"]

GroupSettingsSheet  [bisheriger GroupDetailSheet – bleibt unverändert]
├── Gruppenname (editierbar, Admin)
├── Einladungscode-Karte
├── Mitgliederliste
└── Gruppe verlassen / löschen
```

---

### B) Datenmodell

**Tabelle: `activities`**

| Feld | Typ | Hinweis |
|------|-----|---------|
| id | UUID | Primärschlüssel |
| group_id | UUID | Fremdschlüssel → groups |
| initiator_id | UUID | Fremdschlüssel → profiles |
| name | Text | Pflicht, max. 200 Zeichen |
| duration_category | Enum | `spontan` / `wochenende` / `laengerer_zeitraum` |
| required_votes | Integer | Pflicht, min. 1 |
| current_votes | Integer | Denormalisierter Zähler, Default 0, via Trigger aktualisiert |
| url | Text | Optional |
| description | Text | Optional |
| og_image_url | Text | Optional, gespeichert nach og:image-Abruf |
| status | Enum | `vorschlag` (initial) → `zu_planen` (nach Schwellen-Erreichen) → weitere in PROJ-5+ |
| created_at | Timestamp | Automatisch |

**Tabelle: `activity_votes`**

| Feld | Typ | Hinweis |
|------|-----|---------|
| id | UUID | Primärschlüssel |
| activity_id | UUID | Fremdschlüssel → activities |
| user_id | UUID | Fremdschlüssel → profiles |
| created_at | Timestamp | Automatisch |
| — | UNIQUE | (activity_id, user_id) — verhindert Doppel-Votes |

**Automatischer Statuswechsel (Datenbank-Trigger):**
Jedes Mal, wenn ein Vote gespeichert oder gelöscht wird, aktualisiert ein Trigger den `current_votes`-Zähler in `activities`. Falls `current_votes >= required_votes` UND `status = 'vorschlag'`, setzt der Trigger den Status auf `zu_planen`. Der Wechsel ist irreversibel: auch wenn Votes zurückgezogen werden, bleibt der Status `zu_planen`.

**Supabase RPC `reset_activity_votes(activity_id)`:**
Löscht alle Votes einer Aktivität in einer einzigen Transaktion und setzt `current_votes = 0` sowie `status = 'vorschlag'` zurück. Nur für die „Erneut zur Abstimmung"-Funktion verwendet.

---

### C) Technische Entscheidungen (Begründungen)

**1. GroupMainSheet statt eigener URL-Route**
Die App läuft als statischer Export (`output: 'export'`). Dynamische Routen wie `/groups/[groupId]` würden `generateStaticParams` voraussetzen — unmöglich, da Gruppen-IDs zur Laufzeit erzeugt werden. Das Sheet-Pattern ist konsistent mit PROJ-3 und erzeugt dasselbe native App-Feeling.

**2. Denormalisierter `current_votes`-Zähler in `activities`**
Realtime-Subscription läuft auf der `activities`-Tabelle (nicht `activity_votes`). Ein einzelnes Ereignis pro Vote-Änderung reicht aus, um die Karte zu aktualisieren. Client-seitige Vote-Aggregation (über `activity_votes`-Subscription) wäre deutlich komplexer und fehleranfälliger.

**3. DB-Trigger für den `vorschlag` → `zu_planen` Statuswechsel**
Bei gleichzeitigem Voting zweier Nutzer (Race Condition) muss der Wechsel genau einmal passieren. Ein Client-seitiger Check (nach jedem Vote prüfen ob Schwelle erreicht) ist nicht race-safe. Der Trigger im Datenbankserver garantiert Atomarität.

**4. Supabase Edge Function `fetch-og-image`**
Der Browser kann fremde Seiten wegen CORS-Richtlinien nicht direkt abrufen. Da es keine eigenen Server-Endpunkte gibt (Static Export), übernimmt eine Supabase Edge Function den serverseitigen Abruf und die Extraktion des `og:image`-Meta-Tags. Die geparste Bild-URL wird gespeichert, um wiederholte Abrufe zu vermeiden.

**5. Supabase Realtime für Live-Updates ohne Seitenreload**
Alle Clients, die eine Gruppe geöffnet haben, subscriben auf Änderungen an der `activities`-Tabelle gefiltert nach `group_id`. Wenn der DB-Trigger einen Statuswechsel oder den `current_votes`-Zähler ändert, empfangen alle Clients das Event und aktualisieren ihre Ansicht sofort.

**6. Optimistic Update beim Voten**
Die Vote-Aktion ist einfach und umkehrbar — ideal für Optimistic Updates. UI reagiert sofort (Zähler +1/-1, Button-Zustand kippt). Bei Fehler wird der vorherige Zustand wiederhergestellt und ein Toast-Hinweis angezeigt (entsprechend Fehlerverhalten-Acceptance Criterion).

---

### D) Neue Custom Hooks

| Hook | Zweck |
|------|-------|
| `useActivityProposals(groupId)` | Lädt Vorschläge + Realtime-Subscription; sortiert nach Vote-Fortschritt |
| `useVote(activityId, groupId)` | Toggle-Vote mit Optimistic Update und Rollback |
| `useCreateProposal(groupId)` | Formular-Mutation zum Erstellen |
| `useEditProposal(activityId)` | Formular-Mutation zum Bearbeiten |
| `useDeleteProposal(activityId)` | Löscht Vorschlag inkl. aller Votes |
| `useResetVotes(activityId)` | Ruft RPC `reset_activity_votes` auf |
| `useOgImage(url)` | Debounced Aufruf der Edge Function `fetch-og-image` |

---

### E) Neue Backend-Komponenten

| Komponente | Typ | Beschreibung |
|------------|-----|--------------|
| `activities` | DB-Tabelle | Haupttabelle für Vorschläge |
| `activity_votes` | DB-Tabelle | Vote-Einträge (UNIQUE per user+activity) |
| Zähler-Trigger | DB-Trigger | Aktualisiert `current_votes` bei INSERT/DELETE auf `activity_votes` |
| Status-Trigger | DB-Trigger | Setzt Status `zu_planen` wenn Schwelle erreicht |
| `reset_activity_votes` | RPC | Transaktionaler Reset: Votes löschen + Zähler + Status zurücksetzen |
| `fetch-og-image` | Edge Function | Abruf + Parsing des `og:image`-Meta-Tags einer URL |
| RLS `activities` | Policy | SELECT für Gruppenmitglieder; INSERT für Admin/Redakteur; UPDATE/DELETE für Initiator oder Admin |
| RLS `activity_votes` | Policy | SELECT für Gruppenmitglieder; INSERT/DELETE nur eigene Votes |

---

### F) Neue Pakete

Keine neuen Pakete erforderlich:
- Supabase Realtime ist in `@supabase/supabase-js` bereits enthalten
- Formularvalidierung via `react-hook-form` + `zod` bereits installiert
- og:image-Parsing in der Edge Function via native Deno-APIs (kein externes Paket nötig)

## Implementation Notes (Backend)

### DB Migration: `create_activities_and_voting`
- Tables `activities` and `activity_votes` created with CHECK constraints (no enums, consistent with PROJ-3 pattern)
- `REPLICA IDENTITY FULL` + `supabase_realtime` publication added for Realtime support
- Trigger `trg_activity_votes_count` (SECURITY DEFINER): updates `current_votes` and auto-promotes `vorschlag` → `zu_planen` atomically
- RPC `reset_activity_votes` (SECURITY DEFINER): transactional reset with inline permission check (initiator or admin)
- RLS covers all 4 operations on both tables; observers can vote but cannot create

### Edge Function: `fetch-og-image` (v1, ACTIVE)
- 6-second timeout, CORS headers, falls back to public-domain Unsplash placeholder
- Regex handles both meta-tag attribute orderings
- `verify_jwt: true` — only authenticated users can call it

### TypeScript
- `database.types.ts` regenerated with `activities`, `activity_votes`, `reset_activity_votes` RPC
- `src/lib/activity-types.ts` — domain types, `DurationCategory`, `ActivityStatus`, `CreateActivityInput`, `UpdateActivityInput`, label maps

### Hooks (`src/hooks/`)
| File | Purpose |
|------|---------|
| `useActivityProposals.ts` | Fetch proposals + Realtime subscription + client-side filter |
| `useVote.ts` | Toggle vote with optimistic update + rollback |
| `useCreateProposal.ts` | Insert new activity |
| `useEditProposal.ts` | Patch existing proposal (status=vorschlag guard) |
| `useDeleteProposal.ts` | Delete proposal (cascades votes via FK) |
| `useResetVotes.ts` | Calls `reset_activity_votes` RPC |
| `useOgImage.ts` | Debounced (600 ms) Edge Function call for og:image |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

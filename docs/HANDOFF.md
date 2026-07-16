# Session-Übergabe — 2026-07-16

## Stand
**PROJ-17 (Memory Cards & Album)** ist QA-getestet → Status **In Review** in `features/INDEX.md`.
19/19 Acceptance Criteria grün. Vitest 370/370, E2E-Regression 0 Fails, neue Suite `tests/PROJ-17-memory-cards-album.spec.ts` (5 grün). Volle QA-Ergebnisse im Spec-Abschnitt „QA Test Results".

## Offene Bugs (vor Deploy per `/backend` fixen)
- **BUG-17-1 (High):** Gruppenlöschung schlägt fehl, sobald die Gruppe ≥1 Aktivität hat. Ursache pre-existing (PROJ-15): `refresh_group_momentum` macht ein bedingungsloses Upsert für die gerade gelöschte Gruppe → FK-Verletzung. Fix: `if exists (select 1 from groups where id = p_group_id)`-Guard (analog PROJ-17-Historie-Trigger). Betrifft auch die Live-App.
- **BUG-17-2 (Medium):** Ex-Mitglied als Initiator kann eigene, nicht-abgeschlossene Aktivität weiter ändern/abschließen/löschen. Fix: aktive Mitgliedschaft (`is_group_member`) in den `activities`-UPDATE/DELETE-Policies ergänzen.
- **BUG-17-3 (Low):** A11y-Warnung „DialogContent requires a DialogTitle" (repo-weites Modal-Muster).
- **Notiz:** PROJ-8-E2E-Tests referenzieren den umbenannten „Archiv"-Tab und skippen stumm → bei Gelegenheit auf „Album" aktualisieren.

## Working Tree
- **Meine QA-Deliverables (uncommitted):** `features/INDEX.md`, `features/PROJ-17-memory-cards-album.md`, `tests/PROJ-17-memory-cards-album.spec.ts`. Noch **nicht committet** (auf Bug-Priorisierung wartend). Commit-Vorschlag: `test(PROJ-17): Add QA test results for Memory Cards & Album`.
- **Fremde WIP (NICHT anfassen):** unabhängige Icon-Set-Arbeit (`@/components/icons/mellon-icons`, `docs/ICON-SPEC.md`, `docs/ICON-BRIEF-*.md`, Änderungen an Momentum-/Badge-Komponenten + `src/lib/badges.ts`). Gehört nicht zu PROJ-17.

## Sandbox
QA läuft auf `qa-bot@zusammen.test` (eigene isolierte Testgruppe). Alle Temp-Daten wurden restlos entfernt; echte Nutzerdaten unangetastet.

## TODO für die neue Session: Docs via context7 aktualisieren
Bevor an dieser App weitergearbeitet wird, die relevanten Library-Docs über **context7** (MCP) auf den aktuellen Stand ziehen — die App nutzt zum Teil ältere gemerkte APIs, context7 liefert die Live-Doku. Zu aktualisieren (Stack aus `CLAUDE.md`/`PRD.md`):
- **Next.js 16** (App Router, `output: 'export'` / Static Export — keine Server Components/SSR/Server Actions)
- **Supabase** JS-Client, Row Level Security, Postgres-Trigger/Functions, Edge Functions
- **Tailwind CSS** + **shadcn/ui**
- **Zod** + **react-hook-form**
- **Playwright** + **Vitest**
- **Capacitor** (iOS/Android Native Shell, PROJ-9)
- **Vercel** Deployment (Static Export)

Vorgehen: pro Library `resolve-library-id` → `get-library-docs` über context7, dann Abgleich gegen die tatsächliche Nutzung im Code (v. a. Next-Static-Export-Einschränkungen und Supabase-RLS-Muster). Falls context7 in der neuen Session nicht verbunden ist: den Nutzer bitten, den context7-MCP-Server zu verbinden (interaktiv via `claude mcp` bzw. claude.ai-Connector-Einstellungen).

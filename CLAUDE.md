# Mellon

> Mobile-first app for friend groups: vote on ideas, plan on a Kanban board, find dates, keep memories. Web (Vercel) plus iOS/Android via Capacitor. Formerly "ZUSAMMEN": old specs still use that name, and the repo and bundle ID (`com.zusammen.app`) keep their old names on purpose.

## Hard Constraints

- **Static export only** (`output: 'export'`): no SSR, Server Components, Server Actions or API routes. All data access is client-side through the Supabase JS client; sensitive logic lives in RLS and Edge Functions.
- **Deploy = push to `main`.** Vercel builds from GitHub. Never deploy with the Vercel CLI, not even as a fallback.
- **Start the dev server only with `npm run dev`** (`scripts/dev-guard.mjs`), never `next dev` directly. An unguarded server once crashed the 16 GB Mac. Supervise background runs and check that no processes remain afterwards.
- **The repo is on GitHub:** keep real names, accounts and device IDs out of tracked files. Those belong in auto-memory.
- **Project folder is in iCloud:** it creates `file 2.ext` duplicates that break native builds (see `.claude/rules/native.md`).

## Where to Find What

Open the narrowest source first; only widen when it doesn't answer the question.

| Question | Source |
|----------|--------|
| Which files implement feature X? Tables, routes, hooks? | `docs/CODEMAP.md` |
| Feature status | `features/INDEX.md` (wins over the PRD) |
| Requirements and decisions for a feature | `features/PROJ-X-*.md`. Specs run 200–800 lines: list sections with `grep -n '^## '`, then read only what you need |
| Colors, type, radii, components | `STYLEGUIDE.md` |
| Rules per area | `.claude/rules/` (`frontend`, `backend`, `security`, `testing`, `native`, `general`) |
| Current DB schema | `src/lib/database.types.ts`, or Supabase MCP `list_tables`. Old migrations may be superseded |
| Production guides | `docs/production/` |
| QA reports outside specs | `docs/qa/` |
| System diagram data | `docs/architecture/mellon.architecture.json` |
| Marketing website (WordPress) | `website/README.md` |

**Don't read unless the task is about them:** `docs/architecture/mellon-architektur.html` (15k lines, use the JSON), `design/` (exported design bundle), `docs/archive/` (superseded), `_local/` and `website/` (local only), `ios/App/App/public/` and `android/app/src/main/assets/` (build copies of `out/`).

## Project Structure

```
src/app/            Routes (static pages, client components)
src/components/     ui/ = shadcn (never recreate), others by domain
src/hooks/          Data and behavior hooks, one per concern
src/lib/            Domain logic and helpers; lib/native/ = Capacitor wrappers
tests/              Playwright E2E (unit tests sit next to their source)
supabase/           migrations/ (1:1 mirror of remote history), functions/ (Edge Functions)
android/, ios/      Capacitor native projects
assets/             Source images for app icon and splash
public/             Static web files
features/           Specs and INDEX.md
docs/               PRD, CODEMAP, production guides, QA, architecture, archive/
design/             Exported icon-set design bundle (reference, not project code)
_local/             Gitignored: videos, screenshots, backups
website/            Gitignored: marketing website mellon-app.de
```

## Workflow

`/write-spec` → `/architecture` → `/frontend` → `/backend` → `/qa` → `/deploy`. Use `/refine PROJ-X` to revisit a spec and `/help` when unsure. `/init` already ran, so don't run it again.

## Conventions

- **Feature IDs:** PROJ-1, PROJ-2, … (sequential, see INDEX.md)
- **Commits:** `type(PROJ-X): description`
- **shadcn/ui first:** never build custom versions of installed components
- **Human-in-the-loop:** user approval at workflow checkpoints
- **Tests:** unit tests next to the source (`useHook.test.ts`), E2E in `tests/`
- **Later design changes:** add a `## Design-Polish (YYYY-MM-DD)` section at the end of the spec

## Commands

```bash
npm run dev          # Dev server (localhost:3000) with memory guard
npm run build        # Static export to out/
npm run lint         # ESLint
npm test             # Vitest unit/integration
npm run test:e2e     # Playwright (with login: --project=chromium --workers=1)
npm run test:all     # Both suites
```

## Product Context

@docs/PRD.md

## Feature Overview

@features/INDEX.md

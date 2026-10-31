# Mellon

Mobile-First-App für Freundesgruppen: Ideen abstimmen, auf dem Kanban-Board planen, Termine finden, Erinnerungen behalten. Web-App auf Vercel, iOS und Android über Capacitor.

**Stack:** Next.js 16 (Static Export), TypeScript, Tailwind CSS, shadcn/ui, Supabase, Capacitor.

## Start

```bash
npm install
cp .env.local.example .env.local   # Zugangsdaten eintragen
npm run dev                        # localhost:3000, mit Speicher-Wächter
```

## Befehle

| Befehl | Zweck |
|--------|-------|
| `npm run build` | Statischer Export nach `out/` |
| `npm run lint` | ESLint |
| `npm test` | Vitest |
| `npm run test:e2e` | Playwright |

## Doku

| Datei | Inhalt |
|-------|--------|
| [CLAUDE.md](CLAUDE.md) | Einstieg für Agents: Regeln und Wegweiser |
| [docs/PRD.md](docs/PRD.md) | Produktanforderungen |
| [docs/CODEMAP.md](docs/CODEMAP.md) | Welcher Code gehört zu welchem Feature |
| [features/INDEX.md](features/INDEX.md) | Feature-Status und Specs |
| [STYLEGUIDE.md](STYLEGUIDE.md) | Design System |

Deployment: Ein Push auf `main` löst den Vercel-Build aus.

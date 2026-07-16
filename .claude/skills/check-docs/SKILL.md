---
name: check-docs
description: >-
  Gleicht den Code dieser App mit der aktuellen Library-Dokumentation ab
  (via Context7 CLI). Token-sparsam: prüft standardmäßig nur die Library
  aus dem Argument bzw. die Libraries, die im aktuellen git diff berührt
  werden. Nutzung: /check-docs supabase, /check-docs next.js,
  /check-docs alle (kompletter Stack).
---

# Docs-Check (token-sparsam)

Prüfe, ob unser Code veraltete Patterns nutzt, indem du gezielte Fragen an die
aktuelle Doku stellst — NICHT indem du komplette Dokus lädst.

## Pinned Library-IDs (Resolution-Schritt überspringen!)

Nutze diese IDs direkt mit `npx ctx7@latest docs <id> "<query>"`.
Führe `ctx7 library` NUR aus, wenn eine Library hier fehlt.

| Library | Context7-ID |
|---|---|
| Next.js 16 | `/vercel/next.js` |
| Supabase | `/supabase/supabase` |
| Tailwind CSS | `/tailwindlabs/tailwindcss.com` |
| shadcn/ui | `/shadcn-ui/ui` |
| Zod | `/colinhacks/zod` |
| react-hook-form | `/react-hook-form/react-hook-form` |
| Capacitor | `/ionic-team/capacitor-docs` |
| Vitest | `/vitest-dev/vitest` |
| Playwright | `/microsoft/playwright` |

## Scope bestimmen (WICHTIG für Token-Budget)

1. **Mit Argument** (z.B. `/check-docs supabase`): nur diese eine Library prüfen.
2. **Ohne Argument**: `git diff --name-only HEAD` ausführen und nur die
   Libraries prüfen, die in den geänderten Dateien tatsächlich importiert/genutzt
   werden (per Grep auf Imports). Maximal 3 Libraries.
3. **`alle` / `all`**: kompletter Stack aus der Tabelle — aber trotzdem nur
   **eine** fokussierte Query pro Library.

## Regeln pro Library (Budget: 1 Query, max. 2 bei konkretem Verdacht)

1. Zuerst mit Grep 2–3 konkrete Patterns aus unserem Code ziehen
   (z.B. wie wir `createClient` aufrufen, welche RHF-Resolver wir nutzen).
2. Dann EINE gezielte Frage an die Doku, die genau diese Patterns betrifft:
   `npx ctx7@latest docs /supabase/supabase "current recommended way to initialize supabase-js client and auth session handling"`
3. Antwort nur intern auswerten — Doku-Output NIEMALS in den Chat kopieren.
4. Installierte Version aus `package.json` mit der Doku-Empfehlung abgleichen.

Harte Grenzen:
- Max. 6 `docs`-Aufrufe pro Skill-Lauf, auch bei `alle`.
- Keine breiten Queries ("all breaking changes") — immer auf unsere
  tatsächlichen Code-Patterns bezogen.
- Projektkontext beachten: Static Export (`output: 'export'`), keine Server
  Components/SSR/Server Actions — Doku-Empfehlungen, die das voraussetzen,
  sind für uns irrelevant und werden nicht gemeldet.

## Output-Format (kompakt, Deutsch)

Pro geprüfter Library genau ein Bullet:
- ✅ `library@version` — aktuell, keine Auffälligkeiten
- ⚠️ `library@version` — veraltetes Pattern in `datei.ts:zeile`: 1 Satz Problem → 1 Satz Empfehlung

Kein Fließtext, keine Doku-Zitate, keine Code-Blöcke außer bei konkretem
Fix-Vorschlag (max. 5 Zeilen). Am Ende: ein Satz Gesamtfazit.

---
paths:
  - "tests/**"
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "src/test/**"
  - "playwright.config.ts"
  - "vitest.config.ts"
---

# Testing Rules

## E2E (Playwright)
- Runs with login need `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`; without them those tests are skipped, so a green run doesn't cover them.
- Run them with `--project=chromium --workers=1`. Every test logs in again, and parallel runs hit the Supabase auth rate limit. The resulting 429 looks like a login redirect bug. Wait about 5 minutes after a rate-limited run. The full suite can hit the limit even in a single run (fails show "Zu viele Login-Versuche"); `storageState` from a global setup would fix that (open).
- Skips that depend on data (e.g. "No zu_planen card") are normal after the QA group has been cleaned up.
- After UI redesigns, check for outdated assertions before suspecting a bug.
- To test the static export: `npm run build`, then `node scripts/serve-out.mjs` on port 3000 (Playwright reuses it). Don't use `python3 -m http.server`: it resets connections under load and pages stay blank.

## Browsers
- Don't download WebKit. Test mobile with iPhone emulation on Chromium.

## Test Data
- `tests/PROJ-6-kommentare-realtime.spec.ts` also needs `TEST_USER2_EMAIL` and `TEST_USER2_PASSWORD` (second QA account, see auto-memory).
- Use only the QA account and its own test group. Never change real groups.

## Running Safely
- Set short time limits that kill the whole process group, not just `npx`.
- Afterwards check that nothing is left running (`next-server`, `postcss.js`).

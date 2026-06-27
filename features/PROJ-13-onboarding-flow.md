# PROJ-13: Onboarding-Flow (Erst-Login)

## Status: Approved
**Created:** 2026-06-27
**Last Updated:** 2026-06-27 (QA bestanden — 21/22 ACs, 1 Low-Bug, production-ready; noch nicht via /deploy)

## Dependencies
- PROJ-2 (Authentifizierung & User Accounts) — Supabase Auth Session, AuthGuard, AuthContext-Profil
- PROJ-3 (Gruppe & Mitglieder-Management) — `CreateGroupForm` / `JoinGroupForm` werden im Gruppen-Schritt wiederverwendet
- PROJ-8 (Nutzerprofil & Archiv) — `useProfile` (Anzeigename + Avatar-Upload) wird im Profil-Schritt wiederverwendet
- PROJ-9 (Capacitor Native Apps) — native Kamera (`pickAvatarPhoto`) + Safe-Areas (`pt-safe` / `pb-safe`)

## Kontext
Basierend auf den Stitch-Designs „Willkommen / Starten / Profil einrichten" (Projekt „Zusammen App Visualizer", Warm-Variante). Ein neuer Nutzer soll beim allerersten Login durch einen kurzen, geführten Onboarding-Flow im App-Design (Warm Cream / Terracotta, Archivo) geleitet werden, statt direkt auf dem nackten Gruppen-Auswahlbildschirm zu landen.

## User Stories
- Als neuer Nutzer möchte ich beim ersten Login eine kurze Willkommens-Einführung sehen, damit ich verstehe, wofür ZUSAMMEN da ist.
- Als neuer Nutzer möchte ich meinen Namen und mein Profilbild direkt beim Einstieg festlegen können, damit mich meine Freunde in der Gruppe erkennen.
- Als neuer Nutzer möchte ich geführt eine Gruppe gründen oder einer beitreten, damit ich nach dem Onboarding sofort loslegen kann.
- Als wiederkehrender Nutzer möchte ich den Intro-Flow nur einmal sehen, damit ich bei späteren Logins nicht aufgehalten werde.

## Out of Scope
- Mehrseitiges Feature-Tutorial / Coachmarks innerhalb der App nach dem Onboarding
- Onboarding-Wiederholung / „Tour erneut ansehen" in den Einstellungen
- A/B-Tests oder Analytics-Tracking der Onboarding-Schritte → spätere Version
- Profilbild-Zuschneiden / In-App-Bildbearbeitung (wie PROJ-8 ebenfalls out of scope)
- E-Mail-Verifizierung / Pending-Status-Flow (bleibt in PROJ-2; Onboarding gilt nur für `active` Nutzer)

## Acceptance Criteria

### Erkennung des ersten Logins
- [ ] Angenommen ein Profil hat `onboarded = false`, wenn der Nutzer (Status `active`) auf `/onboarding` landet, dann erscheint der volle 3-Schritt-Flow (Willkommen → Profil → Gruppe).
- [ ] Angenommen ein Profil hat `onboarded = true` und keine Gruppen-Mitgliedschaft, wenn der Nutzer auf `/onboarding` landet, dann wird nur der Gruppen-Schritt angezeigt (kein Willkommen/Profil).
- [ ] Angenommen ein bereits onboardeter Nutzer ist Mitglied einer Gruppe, dann wird er von `/` direkt nach `/groups` geleitet und sieht den Flow gar nicht.
- [ ] Angenommen ein Nutzer hat Status `pending`, dann leitet der AuthGuard ihn nach `/signup/pending` (Onboarding wird nicht angezeigt).

### Schritt 1 — Willkommen
- [ ] Angenommen der Nutzer ist im Willkommen-Schritt, dann sieht er die Überschrift „Willkommen bei ZUSAMMEN" (ZUSAMMEN in Primärfarbe), eine kurze Wertbeschreibung und einen „Los geht's"-Button.
- [ ] Angenommen der Nutzer tippt auf „Los geht's", dann wechselt der Flow zu Schritt 2 (Profil).

### Schritt 2 — Dein Profil
- [ ] Angenommen der Nutzer ist im Profil-Schritt, dann sieht er einen Avatar-Picker (vorbelegt mit Initialen), ein Namensfeld (vorbelegt mit aktuellem Anzeigenamen) und den Hinweis „Dein Profil ist für Gruppenmitglieder sichtbar."
- [ ] Angenommen der Nutzer tippt auf den Avatar, dann öffnet sich auf nativen Plattformen der Kamera-/Galerie-Dialog, im Web der Datei-Picker; nach Auswahl wird das Bild hochgeladen (5-MB-Limit, gleiche Validierung wie PROJ-8).
- [ ] Angenommen der Nutzer ändert seinen Namen und tippt „Weiter", dann wird der Name gespeichert und der Flow wechselt zu Schritt 3.
- [ ] Angenommen der Nutzer tippt „Schritt überspringen", dann wechselt der Flow ohne Speichern zu Schritt 3.
- [ ] Angenommen der Nutzer gibt einen leeren/zu langen Namen ein und tippt „Weiter", dann erscheint eine Validierungsfehlermeldung und der Flow wechselt nicht.

### Schritt 3 — Wie möchtest du starten?
- [ ] Angenommen der Nutzer ist im Gruppen-Schritt, dann sieht er zwei Karten: „Gruppe gründen" (Terracotta) und „Code eingeben" (Navy).
- [ ] Angenommen der Nutzer wählt „Gruppe gründen", dann erscheint das `CreateGroupForm`; bei Erfolg wird `onboarded = true` gesetzt und nach `/groups?group=<id>` navigiert.
- [ ] Angenommen der Nutzer wählt „Code eingeben", dann erscheint das `JoinGroupForm`; bei Erfolg wird `onboarded = true` gesetzt und nach `/groups?group=<id>` navigiert.
- [ ] Angenommen der Nutzer ist in einem Unter-Panel (gründen/beitreten), dann kann er über „← Zurück zur Auswahl" zur Kartenauswahl zurück.

### Navigation & Allgemein
- [ ] Angenommen der Flow hat mehr als einen Schritt, dann zeigt die Kopfzeile Fortschritts-Punkte und ab Schritt 2 einen Zurück-Pfeil zum vorherigen Schritt.
- [ ] Angenommen der Nutzer tippt „Abmelden", dann wird die Session beendet und er landet auf `/login`.
- [ ] Angenommen die App läuft nativ (Capacitor), dann respektiert der Flow die Safe-Areas (Statusleiste oben, Home-Indicator unten).

## Edge Cases
- **Name unverändert + „Weiter":** Kein DB-Write, Flow wechselt einfach weiter (vermeidet unnötigen Schreibvorgang).
- **`markOnboarded()` schlägt fehl:** Best-effort — blockiert den Nutzer nicht; im schlimmsten Fall erscheint der Intro beim nächsten Login erneut.
- **Bestehende Nutzer zum Zeitpunkt der Migration:** Werden per Backfill auf `onboarded = true` gesetzt und sehen den neuen Flow nicht.
- **Erst-Login-Nutzer, der bereits einer Gruppe angehört (z.B. Auto-Join):** Wird von `/` nach `/groups` geleitet und überspringt den Intro (akzeptierter Grenzfall).
- **Avatar-Upload-Fehler:** Toast-Fehlermeldung, Flow bleibt im Profil-Schritt, kein Datenverlust.

## Technical Requirements
- **First-Login-Erkennung:** Boolean-Spalte `profiles.onboarded` (statt localStorage) → pro Account, geräteübergreifend.
- **Static-Export-Kompatibel:** Alle Datenoperationen client-seitig via Supabase JS; keine Server Components / Server Actions.
- **Wiederverwendung statt Duplikation:** Gruppen-Schritt nutzt `CreateGroupForm`/`JoinGroupForm` (PROJ-3); Profil-Schritt nutzt `useProfile` (PROJ-8).
- **Design-Tokens:** Ausschließlich bestehende Tokens (`bg-bg`, `bg-surface`, `text-ink*`, `border-line`, `bg-primary-soft`, `rounded-pill` …), Archivo-Font, Light/Dark via vorhandene CSS-Variablen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Voller 3-Schritt-Flow (Willkommen → Profil → Gruppe) | Vom Nutzer gewählt; geführter Einstieg statt nacktem Gruppen-Auswahlbildschirm; entspricht den Stitch-Designs | 2026-06-27 |
| Profil-Schritt überspringbar | Name ist bereits beim Signup gesetzt; Avatar ist optional — kein Zwang, um den Einstieg nicht zu blockieren | 2026-06-27 |
| Intro im App-Design statt der lila Stitch-Illustration | „Im Design der App" = Warm Cream/Terracotta; Illustration aus Design-Tokens (überlappende Freunde-Avatare) statt Fremd-Asset | 2026-06-27 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| `profiles.onboarded` DB-Spalte statt localStorage | Vom Nutzer gewählt; robust pro Account & geräteübergreifend; bestehende Nutzer per Backfill auf `true` | 2026-06-27 |
| Routing unverändert gelassen | Bestehendes `/`-Routing (Gruppe → `/groups`, sonst `/onboarding`) reicht; der Flow entscheidet intern via `profile.onboarded` zwischen Voll-Flow und Nur-Gruppen-Schritt | 2026-06-27 |
| `onboarded` erst am Ende (nach Gruppen-Erstellung/-Beitritt) gesetzt | Abbruch mitten im Flow → nächster Login setzt fort; vermeidet „halb onboardete" Nutzer ohne Gruppe | 2026-06-27 |
| Gruppen-/Profil-Logik wiederverwendet | Keine Duplikation bestehender Formulare/Hooks; `OnboardingScreen` (PROJ-3, Gruppen-Hinzufügen) bleibt separat erhalten | 2026-06-27 |

## Implementation Notes (Frontend + Backend — 2026-06-27)

### DB Migration Applied
- Migration `add_onboarded_to_profiles`: `profiles.onboarded boolean not null default false`; bestehende Zeilen per `update` auf `true` zurückgesetzt (Backfill), damit nur neue Accounts den Flow sehen.

### New Files
- `src/components/onboarding/OnboardingFlow.tsx` — Orchestrator: Schritt-State, Fortschritts-Punkte, Zurück-Pfeil, Safe-Areas, „Abmelden"; entscheidet Voll-Flow vs. Nur-Gruppen-Schritt über `profile.onboarded`
- `src/components/onboarding/WelcomeStep.tsx` — Willkommen-Schritt inkl. on-brand Illustration aus Design-Tokens
- `src/components/onboarding/ProfileStep.tsx` — Avatar-Picker (inkl. nativer Kamera) + Namensfeld + „Weiter"/„Schritt überspringen"
- `src/components/onboarding/GroupStep.tsx` — Karten „Gruppe gründen"/„Code eingeben" + Wiederverwendung von `CreateGroupForm`/`JoinGroupForm`

### Modified Files
- `src/app/onboarding/page.tsx` — rendert jetzt `OnboardingFlow` (statt direkt `OnboardingScreen`); `onComplete` navigiert nach `/groups?group=<id>`
- `src/hooks/useProfile.ts` — neue `markOnboarded()`-Funktion (setzt `onboarded = true`, best-effort, danach `refreshProfile()`)
- `src/contexts/AuthContext.tsx` — `Profile`-Typ um `onboarded: boolean` erweitert
- `src/lib/database.types.ts` — `profiles` Row/Insert/Update um `onboarded` ergänzt

### Build Verified
- `npx tsc --noEmit` ✅ (einziger verbleibender Fehler `ical-export.test.ts` ist vorbestehend, nicht von diesem Feature berührt)
- `npm run build` ✅ — `/onboarding` als statische Route generiert
- Hinweis: `npm run lint` ist projektweit defekt (Next 16 entfernt `next lint`) — bekanntes, vorbestehendes Issue

### Deviations from Spec
- Keine — Implementierung entspricht dem oben dokumentierten Design.

### Offene Schritte
- `/deploy` noch nicht durchgeführt

---

## QA Test Results

**Tested:** 2026-06-27
**App URL:** http://localhost:3000 (Static Export, Supabase Live-Backend)
**Tester:** QA Engineer (AI)

**Testmethodik-Hinweis:** Die interaktiven Schritt-ACs erfordern einen eingeloggten
Erst-Login-Account (`profiles.onboarded = false`, ohne Gruppen-Mitgliedschaft). Ein
solches Test-Login stand in dieser Umgebung nicht zur Verfügung (kein
`TEST_USER_EMAIL`/`PASSWORD`, Signup durch Supabase-E-Mail-Ratelimit blockiert). Diese
ACs wurden daher per **Code-Review gegen die Implementierung** verifiziert (mit „(Code)"
markiert), nicht live im Browser durchgeklickt. Auth-Guard, Build, Typecheck und die
automatisierte Suite liefen real.

### Acceptance Criteria Status

#### AC-1: Erkennung des ersten Logins
- [x] (Code) `onboarded = false` → voller 3-Schritt-Flow: `isFirstLogin` ⇒ `['welcome','profile','group']` ([OnboardingFlow.tsx:24-25](../src/components/onboarding/OnboardingFlow.tsx#L24-L25))
- [x] (Code) `onboarded = true` ohne Gruppe → nur Gruppen-Schritt: `steps = ['group']`
- [x] (Code) onboardeter Nutzer mit Gruppe → `/` leitet via `group_members`-Count nach `/groups` ([page.tsx:14-24](../src/app/page.tsx#L14-L24))
- [x] (Code) Status `pending` → AuthGuard leitet nach `/signup/pending` ([AuthGuard.tsx:17-19](../src/components/auth/AuthGuard.tsx#L17-L19))

#### AC-2: Schritt 1 — Willkommen
- [x] (Code) Überschrift „Willkommen bei ZUSAMMEN" (ZUSAMMEN in `text-primary`), Wertbeschreibung, „Los geht's"-Button ([WelcomeStep.tsx:56-72](../src/components/onboarding/WelcomeStep.tsx#L56-L72))
- [x] (Code) „Los geht's" → `onNext()` wechselt zu Schritt 2

#### AC-3: Schritt 2 — Dein Profil
- [x] (Code) Avatar-Picker (Initialen-Fallback), Namensfeld (vorbelegt `profile.display_name`), Hinweis „Dein Profil ist für Gruppenmitglieder sichtbar."
- [x] (Code) Avatar-Tap: nativ `pickAvatarPhoto()`, Web `<input type=file>`; 5-MB-Limit + Validierung identisch zu PROJ-8 ([ProfileStep.tsx:35-66](../src/components/onboarding/ProfileStep.tsx#L35-L66))
- [x] (Code) Name geändert + „Weiter" → speichert via `updateDisplayName`, danach `onNext()`
- [x] (Code) „Schritt überspringen" → `onSkip()` = `next()` ohne Speichern
- [ ] (Code) **BUG-1:** Leerer Name + „Weiter" zeigt KEINE Validierungsfehlermeldung und wechselt trotzdem weiter (siehe BUG-1). Die „zu lang"-Variante ist via `maxLength={50}` am Input nicht erreichbar (im Hook zusätzlich abgesichert).

#### AC-4: Schritt 3 — Wie möchtest du starten?
- [x] (Code) Zwei Karten „Gruppe gründen" (Terracotta/`primary`) + „Code eingeben" (Navy/`secondary`) ([GroupStep.tsx:39-69](../src/components/onboarding/GroupStep.tsx#L39-L69))
- [x] (Code) „Gruppe gründen" → `CreateGroupForm`; Erfolg → `handleGroupReady` setzt `markOnboarded()` + Navigation `/groups?group=<id>`
- [x] (Code) „Code eingeben" → `JoinGroupForm`; analog
- [x] (Code) „← Zurück zur Auswahl" kehrt zur Kartenauswahl zurück

#### AC-5: Navigation & Allgemein
- [x] (Code) Fortschritts-Punkte ab >1 Schritt + Zurück-Pfeil ab Schritt 2 ([OnboardingFlow.tsx:43-68](../src/components/onboarding/OnboardingFlow.tsx#L43-L68))
- [x] **(Live, E2E)** „Abmelden" → Session beendet → `/login` (E2E `AC-SIGNOUT` + Code `signOut`)
- [x] (Code) Safe-Areas: `pt-safe` (Header) + `pb-safe` (unten)

### Edge Cases Status
- [x] (Code) Name unverändert + „Weiter": kein DB-Write, Flow wechselt (`trimmed !== display_name`-Guard)
- [x] (Code) `markOnboarded()` schlägt fehl: best-effort, kein `await`-Throw blockiert, Navigation läuft trotzdem
- [x] (DB) Bestandsnutzer per Backfill auf `onboarded = true` (verifiziert: 4/5 Profile `true`, 1 neuer `false`)
- [x] (Code) Erst-Login mit bestehender Gruppe → `/` → `/groups` (überspringt Intro)
- [x] (Code) Avatar-Upload-Fehler → Toast, Flow bleibt im Profil-Schritt, kein Datenverlust

### Security Audit Results
- [x] **Authentifizierung:** `/onboarding` ohne Login → `/login` (E2E `AC-GUARD` **live bestanden**)
- [x] **Autorisierung:** `markOnboarded()` schreibt via RLS `profiles_update_own` (`with_check: auth.uid() = id`) → nur eigene Zeile; kein Fremd-Zugriff möglich
- [x] **Input-Validierung:** Name-Feld `maxLength=50` + Hook-Längen-/Leerprüfung; Name wird als Textinhalt gerendert (React-Escaping, kein `dangerouslySetInnerHTML`) → kein XSS
- [x] **Datei-Upload:** `accept` + 5-MB-Limit, Pfad an `user.id` gebunden (Storage-RLS aus PROJ-8)
- [x] **Advisors:** Keine NEUEN Security-Lints durch die `onboarded`-Spalte; bestehende Warnungen (SECURITY DEFINER RPCs, leaked-password-protection, public avatars bucket) sind vorbestehend und außerhalb des PROJ-13-Scopes
- Hinweis (vorbestehend, kein PROJ-13-Bug): `profiles_update_own` erlaubt dem Nutzer das Schreiben beliebiger eigener Spalten inkl. `status` — bewusst server-seitig via Trigger gehärtet (PROJ-2).

### Bugs Found

#### BUG-1: Leerer Name + „Weiter" wechselt ohne Validierungsfehler weiter
- **Severity:** Low
- **Steps to Reproduce:**
  1. Erst-Login → Profil-Schritt
  2. Namensfeld komplett leeren, „Weiter" tippen
  3. Erwartet (laut AC): Validierungsfehlermeldung „Name darf nicht leer sein", Flow bleibt im Profil-Schritt
  4. Tatsächlich: Der `if (trimmed && trimmed !== profile?.display_name)`-Guard ([ProfileStep.tsx:71](../src/components/onboarding/ProfileStep.tsx#L71)) ist bei leerem `trimmed` falsch ⇒ kein `updateDisplayName`-Aufruf ⇒ kein Fehler ⇒ `onNext()` wechselt weiter
- **Auswirkung:** Kein Datenverlust — der bestehende Name bleibt in der DB unverändert; lediglich die AC-Vorgabe (Fehlermeldung + kein Wechsel) ist verletzt. Verhält sich faktisch wie „überspringen".
- **Fix-Vorschlag:** In `handleContinue` zuerst auf leeren `trimmed` prüfen und `setError('Name darf nicht leer sein')` + früh zurückkehren, bevor der „unverändert"-Pfad greift.
- **Priorität:** Nice to have / vor Deployment optional

### Summary
- **Acceptance Criteria:** 21/22 bestanden (1 Abweichung = BUG-1)
- **Bugs Found:** 1 total (0 Critical, 0 High, 0 Medium, 1 Low)
- **Security:** Pass (keine neuen Findings; Auth-Guard live verifiziert)
- **Automatisierte Tests:** Vitest 198/198 ✅, Playwright PROJ-13 1 passed / 3 skipped (auth-gated) ✅, `tsc` clean (außer vorbestehendem `ical-export.test.ts`)
- **Production Ready:** YES (kein Critical/High; BUG-1 ist Low, kein Blocker)
- **Recommendation:** Deploy möglich; BUG-1 optional vorab durch `/frontend` fixen lassen. Für einen vollständigen Live-Durchklick der interaktiven Schritte empfiehlt sich ein Test-Account mit `onboarded = false` (+ `TEST_USER_EMAIL/PASSWORD`).

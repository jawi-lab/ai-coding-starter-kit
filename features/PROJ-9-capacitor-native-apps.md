# PROJ-9: Capacitor Native Apps (iOS + Android)

## Status: In Progress
**Created:** 2026-06-26
**Last Updated:** 2026-06-26

## Dependencies
- Requires: PROJ-1..PROJ-8 — die vollständige Web-App muss fertig sein (PRD-Constraint Abschnitt 17, verbindlich). Alle P0-Features sind Deployed. ✓
- Requires: PROJ-2 (Authentifizierung) — der OAuth-/Magic-Link-Redirect muss als nativer Deep Link funktionieren.
- Requires: PROJ-7 (Kalender-Export) — der `.ics`-Export muss nativ über das Teilen-Menü laufen.
- Requires: PROJ-8 (Nutzerprofil) — Avatar-Upload nutzt den nativen Kamera-/Foto-Zugriff.
- Bereitet vor: PROJ-10 (Push) — das Capacitor-Push-Plugin wird in PROJ-9 installiert/vorbereitet, aber **nicht** implementiert.

## Ziel / Definition of Done
Die bestehende ZUSAMMEN-Web-App läuft als **echte native App auf iOS und Android** — installierbar auf Simulator/Emulator und physischem Gerät, verteilbar über **TestFlight (iOS)** und **internen Test (Android)**. Eine öffentliche Veröffentlichung im App Store / Play Store ist **nicht** Teil dieses Features (eigener späterer Schritt).

**Reihenfolge:** iOS wird zuerst lauffähig gemacht, Android direkt danach.

## User Stories
- Als Nutzer möchte ich ZUSAMMEN als App aus TestFlight / internem Test installieren, damit ich sie wie eine echte App auf meinem Handy öffnen kann statt im Browser.
- Als Nutzer möchte ich mich in der nativen App einloggen und nach dem Login automatisch zurück in die App geleitet werden, damit der Login nahtlos funktioniert.
- Als Nutzer möchte ich beim Kalender-Export einen Termin direkt über das native Teilen-Menü in meine Kalender-App übernehmen können.
- Als Nutzer möchte ich für mein Profilbild direkt die Kamera oder meine Fotomediathek nativ nutzen können.
- Als Nutzer möchte ich, dass sich die App nativ anfühlt (korrekte Safe-Areas an Notch/Home-Indicator, eigenes App-Icon, Splash-Screen, funktionierender Android-Zurück-Button).
- Als Entwickler möchte ich aus dem bestehenden Code mit einem reproduzierbaren Build native iOS-/Android-Projekte erzeugen, damit ich nicht zwei Codebasen pflegen muss.

## Out of Scope
- **Öffentliche Store-Veröffentlichung** (App Store / Play Store Listing, Review, Screenshots, Metadaten) — späterer Schritt nach PROJ-9.
- **Push-Benachrichtigungen** (FCM/APNs, Versand-Logik, Geräte-Tokens, Trigger) — eigenständiges Feature **PROJ-10**. In PROJ-9 wird nur das Plugin-Fundament vorbereitet.
- **OTA-Updates via Capgo** — eigenständiges Feature **PROJ-11**.
- **Offline-Modus / lokale Datenhaltung** — die App benötigt weiterhin eine Internetverbindung (Supabase). Es wird kein Offline-Caching der Daten implementiert.
- **Neue fachliche Features oder UI-Screens** — PROJ-9 verpackt nur die bestehende App, es kommt keine neue Funktionalität hinzu.
- **Biometrischer Login (Face ID / Fingerprint)** — nicht in diesem Schritt.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Build & Static Export
- [ ] Angenommen das Projekt nutzt aktuell keinen Static Export, wenn der native Build vorbereitet wird, dann erzeugt der Build-Prozess einen statischen `out/`-Ordner ohne SSR-/Server-Abhängigkeiten.
- [ ] Angenommen der Static Export ist aktiviert, wenn die App weiterhin auf Vercel deployt wird, dann funktioniert die Web-Version unverändert weiter.
- [ ] Angenommen ein Entwickler hat den Code ausgecheckt, wenn er den dokumentierten Build-Befehl ausführt, dann werden reproduzierbar native iOS- und Android-Projekte erzeugt.

### App-Start & natives Verhalten
- [ ] Angenommen die App ist auf einem iOS-Gerät/Simulator installiert, wenn der Nutzer sie öffnet, dann startet sie mit eigenem App-Icon und Splash-Screen und zeigt den Startbildschirm der App.
- [ ] Angenommen die App läuft auf einem Gerät mit Notch/Home-Indicator, wenn ein Bildschirm angezeigt wird, dann werden Inhalte korrekt innerhalb der Safe-Area dargestellt (nichts wird von Notch oder Statusleiste verdeckt).
- [ ] Angenommen der Nutzer ist auf Android in einem Unter-Screen, wenn er den System-Zurück-Button drückt, dann navigiert die App eine Ebene zurück (statt die App zu schließen).

### Login / Deep Link
- [ ] Angenommen der Nutzer startet den Login in der nativen App, wenn er den Auth-Flow abschließt, dann wird er per Deep Link automatisch in die App zurückgeleitet und ist eingeloggt.
- [ ] Angenommen der Login schlägt fehl oder wird abgebrochen, wenn der Nutzer zur App zurückkehrt, dann sieht er eine verständliche Meldung und bleibt auf dem Login-Screen.

### Kalender-Export (nativ)
- [ ] Angenommen der Nutzer exportiert einen Termin, wenn er auf „Exportieren" tippt, dann öffnet sich das native Teilen-Menü und der Termin kann in eine Kalender-App übernommen werden.

### Kamera / Foto (nativ)
- [ ] Angenommen der Nutzer ändert sein Profilbild, wenn er „Foto auswählen" antippt, dann kann er nativ zwischen Kamera und Fotomediathek wählen.
- [ ] Angenommen die App fordert Kamera-/Fotozugriff an, wenn der Nutzer die Berechtigung ablehnt, dann zeigt die App eine verständliche Meldung und der restliche App-Betrieb bleibt funktionsfähig.

### Verteilung (Test)
- [ ] Angenommen ein Build wurde erstellt, wenn er nach TestFlight (iOS) bzw. zum internen Android-Test hochgeladen wird, dann lässt sich die App von einem eingeladenen Tester installieren und starten.

## Edge Cases
- **Keine Internetverbindung beim Start:** Die App benötigt Supabase. Was sieht der Nutzer offline? → Erwartung: verständliche „Keine Verbindung"-Meldung statt weißer Bildschirm.
- **Session-Ablauf in der nativen App:** Was passiert, wenn das Supabase-Token abläuft, während die App im Hintergrund war? → Erwartung: Nutzer wird sauber zum Login geführt.
- **App kehrt aus dem Hintergrund zurück (Resume):** Bleibt der Zustand erhalten, ohne dass ein voller Reload den Nutzer ausloggt?
- **Deep-Link-Aufruf bei nicht laufender App:** Funktioniert der Auth-Redirect auch, wenn die App vorher komplett geschlossen war (Cold Start)?
- **Kamera-/Foto-Berechtigung dauerhaft verweigert:** Wird der Nutzer sinnvoll zu den Einstellungen geleitet, statt in einer Sackgasse zu landen?
- **Externe Links (z. B. Datenschutz):** Öffnen sich Links zu externen Seiten im System-Browser statt innerhalb der WebView?
- **Tastatur überdeckt Eingabefelder:** Scrollt die Ansicht korrekt, wenn die native Tastatur eingeblendet wird?

## Technical Requirements (optional)
- Plattformen: iOS und Android. Mindest-OS-Versionen werden in der Architektur-Phase festgelegt (Vorschlag: iOS 15+, Android 8+).
- Static Export (`output: 'export'`) ist Voraussetzung — keine SSR/Server Components/Server Actions im genutzten Pfad.
- Native Berechtigungen: Kamera, Fotomediathek (mit den verpflichtenden iOS-Usage-Description-Texten).
- Deep-Link-/Custom-URL-Schema für den Auth-Redirect.

## Open Questions
- [x] Welche Bundle-ID / App-ID? → **`com.zusammen.app`** (final, iOS + Android identisch). _(2026-06-26)_
- [x] Wie soll der angezeigte App-Name auf dem Homescreen lauten? → **„ZUSAMMEN"**. _(2026-06-26)_
- [x] Welche Mindest-OS-Versionen? → **iOS 16+, Android 10+ (API 29)**. _(2026-06-26)_
- [x] Apple Developer Account & Google Play Console vorhanden? → **Beide vorhanden** — TestFlight & interner Test direkt erreichbar. _(2026-06-26)_
- [x] Remote Vercel-Frontend oder lokaler Static Export? → **Lokaler Static Export** (nativ, Store-konform, Basis für OTA/PROJ-11). _(2026-06-26)_

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| „Done" = native lauffähig + TestFlight/interner Test, **keine** öffentliche Store-Veröffentlichung | Hält das Feature testbar und auslieferbar; Store-Release ist ein eigener, gut abgrenzbarer Schritt | 2026-06-26 |
| Beide Plattformen im Spec, **iOS zuerst** lauffähig | Entwickler ist auf Mac; OAuth-/Deep-Link-Themen auf iOS früh absichern, Android direkt danach | 2026-06-26 |
| Kamera-/Fotozugriff **nativ** im MVP | Vom Nutzer ausdrücklich gewünscht; Profilbild-Erfassung soll sich nativ anfühlen | 2026-06-26 |
| Push-Benachrichtigungen bleiben **PROJ-10**, nur Plugin-Fundament in PROJ-9 | Push ist ein eigenständiges, umfangreiches Feature (Server-Keys, Edge Function, Tokens, Trigger) — würde Single-Responsibility verletzen und PROJ-9 unauslieferbar groß machen | 2026-06-26 |
| Kein Offline-Modus | App ist auf Supabase angewiesen; Offline-Caching ist erheblicher Mehraufwand ohne MVP-Nutzen | 2026-06-26 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| Lokal gebündelter Static Export (App lädt `out/`, nicht die Remote-Vercel-URL) | Echtes natives Verhalten, App-Store-konform, Grundlage für OTA (PROJ-11); Web-Version auf Vercel bleibt unverändert | 2026-06-26 |
| Bundle-ID / App-ID: `com.zusammen.app` (iOS + Android identisch) | Eindeutig, final, passt zum App-Namen; später nicht änderbar | 2026-06-26 |
| Mindest-OS: iOS 16+, Android 10+ (API 29) | Moderne WebView-Engine, weniger Alt-Geräte-Sonderfälle | 2026-06-26 |
| `output: 'export'` + `images.unoptimized` in `next.config.ts` | Static Export ist Pflicht; kein Next Image-Server vorhanden; App nutzt nur Client-Supabase, keine API-Routes → Export ist machbar | 2026-06-26 |
| Dynamische Route `groups/[groupId]/…` wird zu client-seitig aufgelöster Route umgebaut | Static Export kann keine unbekannten Gruppen-IDs vorrendern; größter Umbau des Features; betrifft Frontend | 2026-06-26 |
| Plattform-Abstraktionsschicht (`src/lib/native/`) mit `Capacitor.isNativePlatform()`-Weiche | Web-Pfad bleibt 1:1 erhalten; native Pfade (Share, Kamera, Deep Link) nur auf Gerät aktiv → eine Codebasis | 2026-06-26 |
| Auth-Redirect via Custom-URL-Schema `com.zusammen.app://auth/callback` + PKCE-Flow | `window.location.origin` ist nativ `capacitor://localhost`; Deep Link führt zuverlässig in die App zurück (auch Cold Start) | 2026-06-26 |
| Kalender-Export nativ über `@capacitor/share` + `@capacitor/filesystem` statt `<a download>` | Der HTML-Download-Anchor funktioniert in der WebView nicht; Share-Sheet ist der native Weg in die Kalender-App | 2026-06-26 |
| Avatar nativ über `@capacitor/camera` (Kamera/Mediathek), Web-Pfad behält `<input type=file>` | Vom Nutzer gewünschtes natives Foto-Erlebnis; Web bleibt unverändert | 2026-06-26 |
| Supabase-Auth-Session nativ über `@capacitor/preferences` als Storage statt nur WebView-localStorage | Zuverlässigere Token-Persistenz über App-Resume/Cold-Start hinweg | 2026-06-26 |
| `@capacitor/push-notifications` wird installiert, aber **nicht** verdrahtet | Fundament für PROJ-10 vorbereiten, ohne Single-Responsibility zu verletzen | 2026-06-26 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Grundidee in einem Satz
PROJ-9 fügt **keine neue Funktionalität** hinzu — es verpackt die bestehende ZUSAMMEN-Web-App mit **Capacitor** in eine native Hülle (iOS + Android). Die App lädt im Inneren genau den Code, der heute schon im Browser läuft; an wenigen Stellen wird das Verhalten gegen native Gerätefunktionen ausgetauscht.

### Was Capacitor ist (PM-Erklärung)
Capacitor stellt um die Web-App einen nativen Container mit eingebauter Browser-Ansicht (WebView). Aus demselben Code entstehen ein echtes Xcode-Projekt (iOS) und ein Android-Studio-Projekt. So bleibt **eine Codebasis**, statt zwei getrennte Apps zu pflegen.

### Bausteine / Struktur (kein neuer Screen)
```
ZUSAMMEN (eine Codebasis)
│
├── Web-Version (Vercel)              ← bleibt unverändert
│
└── Native Hülle (Capacitor)          ← NEU in PROJ-9
    ├── iOS-Projekt (Xcode)           App-Icon, Splash, Safe-Areas
    ├── Android-Projekt (Android Studio)  Zurück-Button, Splash
    └── Plattform-Brücke (src/lib/native/)
        ├── Login-Rückleitung         Deep Link statt Browser-Redirect
        ├── Kalender-Export           natives Teilen-Menü statt Datei-Download
        ├── Profilbild                Kamera / Fotomediathek statt Datei-Dialog
        ├── Externe Links             öffnen im System-Browser
        └── Verbindungs-Hinweis       „Keine Verbindung"-Meldung statt weißer Bildschirm
```

### Die fünf Anpassungen im Detail (WAS, nicht WIE)

1. **Static Export aktivieren.** Die App wird zusätzlich als statischer `out/`-Ordner gebaut. Das ist unkritisch, weil ZUSAMMEN bereits **komplett client-seitig** läuft (keine API-Routes, keine Server-Logik). Die Vercel-Web-Version läuft danach unverändert weiter.
   - **Größter Umbau:** Die Gruppen-Detailseiten nutzen heute eine dynamische URL mit der Gruppen-ID (`/groups/[groupId]/…`). Ein Static Export kann unbekannte IDs nicht vorab erzeugen. Diese Seiten werden so umgebaut, dass eine **statische Hülle** ausgeliefert wird und die konkrete Gruppe erst im Gerät geladen wird (client-seitiges Routing). Umsetzung erfolgt im `/frontend`-Schritt.

2. **Login / Deep Link.** Heute leitet der Login über `window.location.origin` zurück — in der nativen App existiert diese Web-Adresse nicht. Stattdessen wird ein **eigenes App-Schema** (`com.zusammen.app://auth/callback`) registriert. Nach erfolgreichem Login springt das System zurück in die App und schließt die Sitzung ab — auch wenn die App vorher komplett geschlossen war. Bei Abbruch/Fehler bleibt der Nutzer mit verständlicher Meldung auf dem Login-Screen.

3. **Kalender-Export.** Der heutige unsichtbare Datei-Download funktioniert in einer App-WebView nicht. Nativ wird die `.ics`-Datei kurz abgelegt und über das **native Teilen-Menü** angeboten, aus dem der Nutzer sie direkt in seine Kalender-App übernimmt.

4. **Profilbild.** Statt des Datei-Dialogs erscheint nativ die Auswahl **Kamera oder Fotomediathek**. Lehnt der Nutzer die Berechtigung ab, zeigt die App eine verständliche Meldung; der Rest der App bleibt nutzbar.

5. **Natives Feinverhalten.** Eigenes App-Icon und Splash-Screen; korrekte **Safe-Areas** an Notch/Home-Indicator; funktionierender **Android-Zurück-Button**; externe Links (z. B. Datenschutz) öffnen im System-Browser; bei eingeblendeter Tastatur scrollt das Eingabefeld in den sichtbaren Bereich; bei fehlender Internetverbindung erscheint eine „Keine Verbindung"-Meldung statt eines weißen Bildschirms.

### Daten-Modell
**Keine neuen Daten.** PROJ-9 speichert nichts Zusätzliches in der Datenbank. Einzige Änderung beim Speichern: Die **Login-Sitzung** wird auf dem Gerät zuverlässiger abgelegt (über Capacitor-Preferences statt nur WebView-Speicher), damit der Nutzer beim App-Wechsel/Neustart eingeloggt bleibt.

### Plattform-Entscheidungen (begründet)
- **Lokal gebündelter Static Export** statt Remote-Vercel-URL → fühlt sich nativ an, ist Store-konform und legt die Basis für spätere OTA-Updates (PROJ-11).
- **Bundle-ID `com.zusammen.app`**, App-Name **„ZUSAMMEN"**, identisch auf beiden Plattformen.
- **Mindest-OS iOS 16+ / Android 10+** → moderne WebView, weniger Sonderfälle.
- **iOS zuerst**, Android direkt danach (Entwickler arbeitet am Mac; Deep-Link/OAuth früh absichern).

### Benötigte Pakete (nur Namen + Zweck)
| Paket | Zweck |
|-------|-------|
| `@capacitor/core`, `@capacitor/cli` | Capacitor-Fundament + Kommandozeile |
| `@capacitor/ios`, `@capacitor/android` | Native iOS-/Android-Projekte |
| `@capacitor/app` | Deep Links (Login-Rückleitung), Android-Zurück-Button, App-Resume |
| `@capacitor/browser` | Login-Flow & externe Links im System-Browser |
| `@capacitor/camera` | Profilbild über Kamera/Mediathek |
| `@capacitor/share` | Kalender-`.ics` über natives Teilen-Menü |
| `@capacitor/filesystem` | `.ics` kurz ablegen, damit es geteilt werden kann |
| `@capacitor/preferences` | Login-Sitzung zuverlässig auf dem Gerät speichern |
| `@capacitor/status-bar`, `@capacitor/splash-screen` | Splash, Statusleiste, Safe-Area-Verhalten |
| `@capacitor/keyboard` | Eingabefeld bei eingeblendeter Tastatur sichtbar halten |
| `@capacitor/network` | „Keine Verbindung"-Erkennung |
| `@capacitor/push-notifications` | **nur installiert**, Fundament für PROJ-10 (nicht verdrahtet) |

### Voraussetzungen / externe Schritte (kein Code)
- **Supabase:** Das neue Redirect-Schema `com.zusammen.app://auth/callback` muss in den Auth-Redirect-URLs des Supabase-Projekts hinterlegt werden; Auth-Flow auf **PKCE** stellen.
- **Apple/Google:** Beide Entwicklerkonten vorhanden ✓ → TestFlight (iOS) und interner Test (Android) sind direkt erreichbar. App-Records mit der Bundle-ID `com.zusammen.app` anlegen.
- **iOS-Pflichttexte:** Usage-Description-Texte für Kamera und Fotomediathek (sonst weist Apple den Build zurück).

### Risiken / offene Punkte
- Der Umbau der dynamischen Gruppen-Route ist der einzige nennenswerte Code-Eingriff und muss so erfolgen, dass die **Vercel-Web-Version unverändert** funktioniert (Regressionstest in QA).
- Deep-Link-Verhalten beim **Cold Start** (App war geschlossen) explizit testen.

## Implementation Notes (Frontend)

### Schritt 1 — Static Export aktiviert (2026-06-26)
Dies ist der erste `/frontend`-Teil von PROJ-9: die Static-Export-Tauglichkeit. Die
native Capacitor-Hülle, die Plugin-Verdrahtung (Deep Link, Kamera, Share, Status-Bar
etc.) und der Supabase-Redirect (`/backend`) stehen noch aus.

**Was gebaut wurde:**
- `next.config.ts`: `output: 'export'`, `images: { unoptimized: true }`, `trailingSlash: true`.
  Der Build erzeugt jetzt einen statischen `out/`-Ordner (13 Routen, alle `○ Static`).
- **Dynamische Route `groups/[groupId]/…` entfernt** und durch eine einzige statische
  Hülle **`/groups/view`** ersetzt. Gruppe und Tab kommen aus Query-Params
  (`?id=<groupId>&tab=<vorschlaege|planung|archiv>`) und werden client-seitig aufgelöst.
  - Gewählter Weg: **Single-Shell mit Query-Param** (statt Placeholder-Param + Host-Rewrite),
    weil das ohne host-spezifische Config identisch auf Vercel (statisch) und in der
    Capacitor-WebView funktioniert und robust gegen Hard-Reloads/Cold-Start ist. Entspricht
    der Architektur-Entscheidung „eine statische Hülle".
  - Neuer Helper `src/lib/group-routes.ts` (`GROUP_TABS`, `groupHref()`, `resolveGroupTab()`)
    zentralisiert Tab-Definition und URL-Bau.
  - Die drei Tab-Inhalte sind jetzt eigenständige Komponenten unter
    `src/components/groups/tabs/` (`VorschlaegeTab`, `PlanungTab`, `ArchivTab`); Logik
    unverändert übernommen. Die alte `layout.tsx`-GroupShell ist in `groups/view/page.tsx`
    aufgegangen, inkl. `<Suspense>`-Boundary (Pflicht für `useSearchParams()` im Export).
  - Navigations-Aufrufe in `src/app/groups/page.tsx` (3×) nutzen jetzt `groupHref()`.

**Verifikation:**
- `npm run build` erfolgreich, `out/groups/view/index.html` vorhanden, keine
  SSR-/`generateStaticParams`-Fehler mehr.
- `npm test`: 164/164 Unit-Tests grün (keine Regression).

**Hinweis Web-Version:** Die Gruppen-Detail-URLs ändern sich von
`/groups/<id>/vorschlaege` zu `/groups/view?id=<id>&tab=vorschlaege`. Interne Navigation
ist vollständig umgestellt; alte externe Deep-Links auf das Pfad-Schema funktionieren nach
dem nächsten Vercel-Deploy nicht mehr (Gruppen sind ohnehin nur für Mitglieder via RLS
zugänglich, kein öffentlicher Share-Flow).

**Noch offen in PROJ-9 (nächste Schritte):** Capacitor installieren/initialisieren,
native Plugins (`@capacitor/app`, `browser`, `camera`, `share`, `filesystem`,
`preferences`, `status-bar`, `splash-screen`, `keyboard`, `network`, `push-notifications`),
Plattform-Brücke `src/lib/native/`, Auth-Deep-Link (`com.zusammen.app://auth/callback`,
PKCE), nativer Kalender-Export & Avatar, iOS/Android-Projekte, Safe-Areas/Splash/Icon.
Backend-seitig: Supabase-Redirect-URL + PKCE-Flow (`/backend`).

## Implementation Notes (Backend)

### Schritt 2 — Supabase-Redirect & PKCE (2026-06-26)
Backend-/Auth-Teil von PROJ-9: den Auth-Redirect deep-link-fähig machen und den
Flow auf **PKCE** umstellen. Capacitor selbst ist noch **nicht** installiert (das
ist der nächste `/frontend`-Schritt) — der Code ist aber bereits forward-kompatibel.

**Was gebaut wurde (Code):**
- `src/lib/supabase.ts`: Client explizit auf **`auth.flowType: 'pkce'`** gestellt.
  Auth-Links kommen damit als `?code=…` und werden über `exchangeCodeForSession()`
  eingelöst — Voraussetzung für den nativen Deep-Link-Rücksprung und zugleich
  sicherer als der bisherige (implizite) Hash-Token-Flow im Web. Die Callback-Seite
  (`src/app/auth/callback/page.tsx`) löste `?code=` bereits ein → kompatibel.
- Neuer Helper **`src/lib/auth-redirect.ts`**:
  - `getAuthCallbackUrl()` liefert nativ `com.zusammen.app://auth/callback`,
    im Web `${window.location.origin}/auth/callback`.
  - `isNativePlatform()` erkennt die Capacitor-Hülle über das `window.Capacitor`-Global
    **ohne harte `@capacitor/core`-Abhängigkeit** (bis zum Frontend-Schritt schlicht
    `false` → Web-Pfad unverändert).
  - Konstanten `NATIVE_AUTH_SCHEME`, `AUTH_CALLBACK_PATH`, `NATIVE_AUTH_CALLBACK_URL`
    (wiederverwendbar durch den späteren `@capacitor/app`-Deep-Link-Listener).
- `SignupForm.tsx` (`emailRedirectTo`) und `ForgotPasswordForm.tsx` (`redirectTo`)
  nutzen jetzt `getAuthCallbackUrl()` statt des fest verdrahteten `window.location.origin`.
- Test `src/lib/auth-redirect.test.ts` (Web-Origin, native Deep-Link, Capacitor-Erkennung).

**Verifikation:**
- `npx vitest run`: 170/170 grün (7 neu, keine Regression).
- `npx next build`: sauberer Static Export (13 Routen, alle `○ Static`).

**⚠️ Manueller Dashboard-Schritt (zwingend, nicht per MCP möglich):**
Im Supabase-Projekt `fogldssdmqgeffpuhvxd` unter **Authentication → URL Configuration
→ Redirect URLs** folgende Einträge zur Allow-List hinzufügen, sonst weist Supabase
den Redirect ab:
- `com.zusammen.app://auth/callback` (native App)
- Web-URLs unverändert lassen (`http://localhost:3000/auth/callback`,
  `https://<vercel-prod-domain>/auth/callback`).
PKCE selbst ist eine reine **Client-Einstellung** (oben gesetzt) — am Server muss nur
die Redirect-URL freigegeben sein.

**Hinweis Produktion (Web):** Der globale Wechsel auf PKCE betrifft auch die bereits
deployte Web-App (PROJ-2). Nach dem nächsten Vercel-Deploy kommen Bestätigungs-/
Reset-Links als `?code=` statt als Hash-Token. Edge case: Wird ein Bestätigungslink
auf einem **anderen Gerät/Browser** geöffnet als dem, auf dem die Registrierung lief,
fehlt der PKCE-Verifier und der Austausch schlägt fehl (Standard-PKCE-Verhalten) —
in QA prüfen.

**Noch offen in PROJ-9 (nächste `/frontend`-Schritte):** Capacitor installieren,
`@capacitor/app`-`appUrlOpen`-Listener, der `?code=` aus dem Deep Link extrahiert und
`exchangeCodeForSession()` aufruft (inkl. Cold-Start); native Client-Konfig mit
`@capacitor/preferences` als Auth-Storage + `detectSessionInUrl: false` für nativ;
übrige native Plugins (Kamera, Share, Status-Bar etc.); iOS/Android-Projekte.

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

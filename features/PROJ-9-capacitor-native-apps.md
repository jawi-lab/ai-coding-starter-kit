# PROJ-9: Capacitor Native Apps (iOS + Android)

## Status: Approved
**Created:** 2026-06-26
**Last Updated:** 2026-07-11

## Änderung (2026-07-11) – UI-Überarbeitung in Native übernommen
- Web-Änderungen (persistente Bottom-Nav ohne FAB, Top-Bar-"+", Home-Aufgaben,
  Master-Toggle, Gruppenname-Limit, Kalender-Fix) wurden per `npm run build` +
  `npx cap sync` in iOS und Android übernommen. Safe-Area/Notch-Handling über die
  bestehenden `pt-safe`/`pb-safe`-Utilities; ProposalFormSheet zusätzlich mit
  `useKeyboardInset` (Tastatur-Overlay).
- **Native gegengeprüft (2026-07-11):**
  - **iOS** (iPhone 17, iOS 26, Debug-Build via externem DerivedData + GIT_CONFIG-
    Override, Router-Fix aktiv): Home mit „Meine Aufgaben", Gruppenliste und
    persistenter Bottom-Nav rendern korrekt; Content unter der Dynamic Island,
    Nav über dem Home-Indicator (Safe-Area ok), Light-Mode.
  - **Android** (Emulator `ZUSAMMEN_Pixel7`, API 36, foojay/ProGuard-Fixes,
    `assembleDebug`): Home + Bottom-Nav, Gruppe-erstellen-Flow mit 20-Zeichen-
    Zähler und die Gruppen-Top-Bar (Name mittig, rotes „+" links neben der Glocke,
    Personen-Icon) rendern korrekt, Safe-Area über der Gesten-Bar ok.
  - iCloud-Geisterdateien (`* 2.*`) vor jedem Build entfernt (brechen sonst
    `mergeDebugResources` / iOS-Bundle).

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
- [x] Supabase-Redirect-URL `com.zusammen.app://auth/callback` freigeben → **erledigt** (im Dashboard zur Redirect-Allow-List hinzugefügt, neben `localhost:3000/**` und `qt-voting-app.vercel.app/**`). _(2026-06-28)_
- [ ] **Restliche manuelle Geräte-/Dashboard-Schritte (bleiben offen, nicht headless):** Erfolgs-Login end-to-end auf echtem Gerät; Kalender-Export- & Avatar-UI-Tap inkl. Berechtigungs-Dialoge; TestFlight- + interner-Android-Test-Upload (Signing/Accounts). _(angelegt 2026-06-28)_

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| „Done" = native lauffähig + TestFlight/interner Test, **keine** öffentliche Store-Veröffentlichung | Hält das Feature testbar und auslieferbar; Store-Release ist ein eigener, gut abgrenzbarer Schritt | 2026-06-26 |
| Beide Plattformen im Spec, **iOS zuerst** lauffähig | Entwickler ist auf Mac; OAuth-/Deep-Link-Themen auf iOS früh absichern, Android direkt danach | 2026-06-26 |
| Kamera-/Fotozugriff **nativ** im MVP | Vom Nutzer ausdrücklich gewünscht; Profilbild-Erfassung soll sich nativ anfühlen | 2026-06-26 |
| Push-Benachrichtigungen bleiben **PROJ-10**, nur Plugin-Fundament in PROJ-9 | Push ist ein eigenständiges, umfangreiches Feature (Server-Keys, Edge Function, Tokens, Trigger) — würde Single-Responsibility verletzen und PROJ-9 unauslieferbar groß machen | 2026-06-26 |
| Kein Offline-Modus | App ist auf Supabase angewiesen; Offline-Caching ist erheblicher Mehraufwand ohne MVP-Nutzen | 2026-06-26 |
| „Fertig bauen" (Refine 2026-06-28) = restliche iOS-Native-Lücken **vollständig** + **komplettes Android-Projekt**; Geräte-/Dashboard-ACs bleiben manuell | Alle code-seitig schließbaren Lücken werden in einem Rutsch erledigt, danach QA. TestFlight-/interner-Test-Upload, Erfolgs-Login-/Share-/Avatar-UI-Tap und Supabase-Redirect-Freigabe erfordern echtes Gerät/Konto/Dashboard und können nicht headless ausgeführt werden | 2026-06-28 |
| App-Icon & Splash aus bestehendem App-Logo `public/logo.png` (ZSMN-Wortmarke auf Cream, 2000×2000) | Vom Nutzer gewünscht — gleiche Marke wie im Web; kein separates Quell-Asset nötig | 2026-06-28 |

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

### Schritt 3 — Capacitor installiert + Auth-Deep-Link verdrahtet (2026-06-27)
Dritter `/frontend`-Teil: **Capacitor wird installiert** und der native
OAuth-/Magic-Link-Rücksprung tatsächlich an `exchangeCodeForSession()` angeschlossen.

**Was gebaut wurde:**
- **Capacitor 8 installiert:** `@capacitor/core`, `@capacitor/app`,
  `@capacitor/preferences` (deps) + `@capacitor/cli` (devDep).
  - Kamera/Share/Filesystem/Status-Bar/Splash/Keyboard/Network/Push folgen in ihren
    jeweiligen Verdrahtungs-Schritten — ungenutzte Plugins jetzt zu installieren wäre
    toter Ballast.
- **`capacitor.config.ts`** (Repo-Root): `appId: com.zusammen.app`,
  `appName: ZUSAMMEN`, `webDir: out` (lokal gebündelter Static Export).
- **Plattform-Brücke `src/lib/native/`:**
  - `platform.ts` — `isNativePlatform()` / `getPlatform()` über `@capacitor/core`.
  - `deep-link.ts` — Kern dieses Schritts:
    - `parseAuthDeepLink()` (pure) extrahiert `?code=` / `?error=` aus
      `com.zusammen.app://auth/callback?…`; klassifiziert Fehler (expired/used/generic)
      **identisch zur Web-Callback-Seite**; erkennt `type=recovery`.
    - `handleAuthDeepLink()` ruft **`supabase.auth.exchangeCodeForSession(code)`** auf
      und liefert `signed-in` / `recovery` / `error` / `ignored`.
    - `registerAuthDeepLinkListener()` verdrahtet `@capacitor/app` `appUrlOpen`
      (warm) **und** `App.getLaunchUrl()` (**Cold Start** — App war geschlossen),
      navigiert je Ergebnis (`/`, `/reset-password/`, `/login/?auth_error=<kind>`).
- **`src/components/native/NativeAuthListener.tsx`** — mountet den Listener im
  Root-Layout (innerhalb `AuthProvider`); **No-op im Web** (`isNativePlatform()`-Guard).
- **`src/lib/supabase.ts`** — nativ: Session-Storage über `@capacitor/preferences`
  (statt WebView-localStorage) + `detectSessionInUrl: false` (URL wird nativ nicht
  auto-gescannt, der Deep-Link-Listener löst den Code explizit ein). Web-Pfad
  unverändert (default localStorage, `detectSessionInUrl` an).
- **`src/app/login/page.tsx`** — zeigt bei `?auth_error=<kind>` eine inline
  `Alert`-Meldung (AC „Login abgebrochen → verständliche Meldung, bleibt auf Login").
  _(sonner-`Toaster` ist projektweit nicht gemountet → bewusst inline statt Toast.)_

**Verifikation:**
- `npx vitest run`: **183/183 grün** (13 neu in `deep-link.test.ts`, keine Regression).
- `npm run build`: sauberer Static Export, alle 13 Routen `○ Static` — die neuen
  Capacitor-Imports brechen den Export/Prerender nicht (`isNativePlatform()` ist
  serverseitig `false`).

**Noch offen in PROJ-9 (nächste Schritte):**
- **Native Projekte erzeugen** (`npx cap add ios` / `android`) — braucht Xcode/Android
  Studio, daher eigener Schritt; danach `npx cap sync` und Deep-Link/Cold-Start auf
  Simulator/Gerät testen.
- iOS `Info.plist` Custom-URL-Scheme `com.zusammen.app` + Kamera/Foto-Usage-Descriptions;
  Android Intent-Filter für das Scheme.
- Übrige Plugins verdrahten: Kalender-Export (`share`+`filesystem`), Avatar (`camera`),
  Status-Bar/Splash/Safe-Areas, Android-Zurück-Button, `network`-Hinweis, externe Links
  via `browser`; `push-notifications` nur installieren (PROJ-10).
- **Erinnerung Backend/Dashboard:** `com.zusammen.app://auth/callback` muss in Supabase
  → Authentication → URL Configuration → Redirect URLs stehen (Schritt 2-Note).

### Schritt 4 — Natives iOS-Projekt erzeugt, im Simulator lauffähig, Deep-Link getestet (2026-06-27)
Vierter `/frontend`-Teil: aus dem Code das **native Xcode-Projekt** erzeugt, im
iOS-Simulator zum Laufen gebracht (kein Whitescreen) und den **Auth-Deep-Link
warm + Cold-Start** verifiziert.

**Toolchain-Vorbereitung:**
- **CocoaPods 1.16.2** via Homebrew installiert. (Hinweis: Capacitor 8 nutzt für
  iOS inzwischen **Swift Package Manager** — das generierte Projekt hat `Package.swift`,
  kein `Podfile`; CocoaPods war hier letztlich nicht nötig, schadet aber nicht.)
- `@capacitor/ios@8.4.1` als Dependency installiert.

**Native iOS-App erzeugt:**
- `npx cap add ios` → `ios/`-Xcode-Projekt (committet; `ios/.gitignore` schließt
  `App/App/public`, `DerivedData`, `build`, generierte Config aus → keine Artefakte
  im Repo). `npm run build && npx cap sync ios` füllt `out/` → `public`.
- **`ios/App/App/Info.plist`:** Custom-URL-Scheme `com.zusammen.app` als
  `CFBundleURLTypes` registriert (Deep-Link-Rücksprung). Zusätzlich die iOS-Pflicht-
  Usage-Descriptions `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSPhotoLibraryAddUsageDescription` vorbereitet (für den späteren `@capacitor/camera`-
  Avatar-Schritt — Apple weist Builds sonst zurück).

**Whitescreen behoben (zwei Ursachen):**
1. **Capacitor-Router inkompatibel mit Next-Static-Export (MPA).** Der Default
   `CapacitorRouter` mappt **jeden extensionslosen Pfad** (`/login`, `/groups/view`,
   auch `/login/`) auf die **Root-`index.html`** (SPA-Verhalten). ZUSAMMEN ist aber
   ein Multi-Page-Static-Export mit echten Dateien pro Route → harte Navigationen
   (`window.location.href = '/login'`, Cold-Start-Deep-Link-Ziel) landeten immer auf
   der Root-Shell, die unauthentifiziert `null` rendert → weiß, Endlos-Redirect.
   - **Fix:** Custom-Router **`ios/App/App/MainViewController.swift`** (`NextStaticRouter`
     + `CAPBridgeViewController`-Subclass, via `Main.storyboard` `customClass` verdrahtet,
     in `project.pbxproj` eingetragen). Er löst eine Verzeichnis-Route auf ihre eigene
     `index.html` auf, wenn diese existiert; Dateien mit Endung werden direkt serviert;
     Fallback Root-Shell. **Rein nativ — kein Eingriff in den Web-Code, eine Codebasis.**
     (next/link-Soft-Navigationen brauchten den Fix nicht — sie laufen über die History-API,
     nicht über den Asset-Handler; nur harte Navigationen waren betroffen.)
2. **Sync-korruptes Bundle.** Da das Projekt in einem cloud-synchronisierten
   `~/Desktop`-Ordner liegt, hatte der Sync-Dienst Konflikt-Duplikate (`… 3.html` etc.)
   erzeugt und die kopierte `public` gegen sich selbst desynchronisiert (die gebündelte
   `login/index.html` referenzierte Chunk-Hashes, die im Bundle fehlten → alle JS/CSS
   `code=260 NSFileReadNoSuchFileError` → kein JS → weiß).
   - **Fix:** `out/` + `public` sauber neu erzeugt (Duplikate gelöscht, frisch gebaut,
     `cap copy`), Bundle-Konsistenz vor jedem App-Build verifiziert (HTML-Refs ↔ Chunks).
   - **Build-Stolpersteine durch den iCloud/Sync-Ordner mitgelöst:** (a) `xcodebuild`
     scheiterte am CodeSign (`resource fork … detritus not allowed`) wegen
     `com.apple.FinderInfo`-xattrs aus dem Sync → Build mit **externem
     `-derivedDataPath`** außerhalb des synchronisierten Ordners. (b) SwiftPM-Resolve
     scheiterte an der Sandbox-Git-Einstellung `safe.bareRepository=explicit` →
     pro Build via `GIT_CONFIG_*`-Env auf `all` überschrieben.

**Cold-Start-Redirect-Loop behoben (echter Bug in `deep-link.ts`):**
- Im Static Export ist **jede `window.location.href`-Navigation ein voller Page-Reload**,
  der `NativeAuthListener` neu mountet → `registerAuthDeepLinkListener()` neu aufruft →
  **`App.getLaunchUrl()` liefert die Launch-URL erneut** → erneut navigieren → Loop.
  (Auf dem Erfolgspfad genauso: der zweite `exchangeCodeForSession` schlägt fehl, da der
  PKCE-Code schon verbraucht ist → Error → Loop.)
- **Fix:** Dedupe der Launch-URL über `sessionStorage` (`LAUNCH_URL_GUARD_KEY`). Überlebt
  In-App-Reloads, wird bei echtem Kaltstart (App-Kill) zurückgesetzt → jede neue Launch-URL
  wird **genau einmal** verarbeitet. `warm`-Pfad (`appUrlOpen`) war nie betroffen (Event
  feuert einmal, wird nicht erneut abgefragt). 3 neue Unit-Tests in `deep-link.test.ts`.

**Verifikation (iOS-Simulator, iPhone 17, iOS 26.5):**
- App startet, lädt den Web-Content, **kein Whitescreen** → Login-Screen rendert korrekt.
- **Deep-Link warm** (`appUrlOpen`, App lief): `…?error=access_denied` → Login zeigt
  „Der Login wurde abgebrochen…" (`used`).
- **Deep-Link Cold-Start** (`getLaunchUrl`, App war beendet): `…?error=access_denied&error_code=otp_expired`
  → App launcht via Scheme, Login zeigt „Der Login-Link ist abgelaufen…" (`expired`).
  Kein Redirect-Loop (Idle-Commits ~0).
- URL-Scheme-Registrierung bestätigt (iOS erkennt `com.zusammen.app://` → „ZUSAMMEN").
- `npx vitest run`: **186/186 grün** (3 neu). `npm run build`: sauberer Static Export.

**Noch offen / nicht in diesem Schritt getestet:**
- **Erfolgs-Login end-to-end** (echter PKCE-`?code=` → `exchangeCodeForSession` → `signed-in`
  → `/`): braucht echte Anmeldung (E-Mail/Passwort + Supabase-Magic-Link auf echtem Gerät/
  Konto). Die Deep-Link-Mechanik (Scheme, warm+cold Listener, Parse, Navigation) ist
  verifiziert; nur der erfolgreiche Code-Tausch steht als manuelle Prüfung aus.
- Übrige Plugins verdrahten: Kalender-Export (`share`+`filesystem`), Avatar (`camera`,
  Usage-Descriptions stehen schon), Status-Bar/Splash/Safe-Areas, Android-Zurück-Button,
  `network`-Hinweis, externe Links via `browser`; `push-notifications` nur installieren (PROJ-10).
- **Android-Projekt** (`npx cap add android`) + Intent-Filter fürs Scheme.
- App-Icon/Splash-Screen-Assets.

### Schritt 5 — Safe-Areas + native Status-Bar (2026-06-27)
Fünfter `/frontend`-Teil: das erste Stück **natives Feinverhalten**, nachdem die App
im Simulator lief. Beim Login-Test fiel auf, dass der Content unter Notch/Statusleiste
klebt (Gruppen-Header überlappte die Uhr).

**Safe-Areas:**
- `viewport-fit=cover` als `viewport`-Export in `layout.tsx` (macht die
  `env(safe-area-inset-*)`-Werte überhaupt erst != 0).
- Utility-Klassen in `globals.css`: `.pt-safe`, `.pb-safe`, `.h-bar-safe`
  (= `calc(3.5rem + inset-top)` + `padding-top: inset-top`).
- Angewandt auf die Top-Header (`groups/page.tsx` → `h-bar-safe`,
  `groups/view/page.tsx` → `pt-safe`) und den FAB
  (`VorschlaegeTab.tsx` → `bottom-[calc(1.5rem+inset-bottom)]`).
- **Web bleibt unberührt** — die Insets sind im Browser 0, die Klassen sind No-ops.

**Status-Bar (`@capacitor/status-bar`):**
- Installiert + in `capacitor.config.ts` (`overlaysWebView: true`, `style: DEFAULT`).
- Neue native-only Komponente `src/components/native/NativeStatusBar.tsx` setzt den
  Statusleisten-Stil aus dem App-Theme: Light Mode → `Style.Light` (dunkler Text),
  Dark Mode → `Style.Dark` (heller Text). Reagiert via `MutationObserver` auf die
  `dark`-Klasse, die der Theme-Switch auf `<html>` toggelt. No-op im Web. Im Root-Layout
  gemountet (neben `NativeAuthListener`).

**Verifikation (Simulator, eingeloggt):**
- Light Mode: Header sitzt unter der Statusleiste, dunkler Statusleisten-Text auf Cream.
- Dark Mode (`simctl ui … appearance dark`): heller Statusleisten-Text auf Dunkel,
  Header korrekt im Safe-Area. Beide Modi sauber.
- `npx vitest run`: 186/186 grün, `npm run build` sauber.

**Statische Absicherung der App-weiten Navigation:** Alle harten `window.location.href`-
Ziele im Code (`/groups`, `/onboarding`, `/reset-password`, `/signup/pending`, inkl.
Query-Strings) lösen über den `NextStaticRouter` korrekt auf → kein Whitescreen auf
irgendeinem Sprung, nicht nur beim Login. Tab-Wechsel laufen über next/link (Soft-Nav).

**Bekannte native Lücken (noch offen, wie geplant):**
- **Kalender-Export** (`src/lib/ical-export.ts`) nutzt `Blob` + `a.download` + `a.click()`
  → funktioniert in der WebView **nicht**. Nächster Schritt: `@capacitor/share` +
  `@capacitor/filesystem`.
- **Avatar/Foto** über `<input type=file>` (öffnet auf iOS den nativen Picker, aber nicht
  die gewünschte `@capacitor/camera`-Kamera/Mediathek-Auswahl).
- **Untere Safe-Area in Sheets/Scroll-Listen** nur punktuell (FAB) abgedeckt — Aktivitäts-
  Sheet-Buttons & lange Listen bei Bedarf noch nachziehen.
- Splash-Screen-Assets, Android-Zurück-Button, `network`-Hinweis, externe Links via
  `browser`; `push-notifications` nur installieren (PROJ-10); Android-Projekt.

### Schritt 6 — Nativer Kalender-Export (`.ics` über Share-Sheet) (2026-06-27)
Sechster `/frontend`-Teil: die in Schritt 5 als offen markierte **Kalender-Export-Lücke**
geschlossen. Der Web-Pfad (`Blob` + `<a download>`) blieb in der WebView still wirkungslos.

**Was gebaut wurde:**
- **Plugins installiert:** `@capacitor/share@8.0.1`, `@capacitor/filesystem@8.1.2`
  (+ `npx cap sync ios` → beide jetzt in der iOS-`Package.swift` registriert).
- **`src/lib/ical-export.ts` refaktoriert** ohne den Web-Pfad zu ändern:
  - Reine Builder extrahiert: `buildIcalContent(opts)` (RFC-5545-String) und
    `icalFileName(summary)` (sanitärer Dateiname) — von beiden Plattformen genutzt,
    einzige Quelle der `.ics`-Erzeugung.
  - `exportToIcal()` verzweigt hinter **`isNativePlatform()`**: nativ →
    `shareIcsNative(...)` (fire-and-forget, Signatur bleibt synchron/`void`, Aufrufer
    unverändert); Web → unveränderter `<a download>`-Pfad.
- **Neue Plattform-Brücke `src/lib/native/share-ics.ts`:** `shareIcsNative()` schreibt
  die `.ics` via `@capacitor/filesystem` in `Directory.Cache` (UTF-8) und reicht die
  File-URI an `@capacitor/share` → natives Teilen-Menü („Zum Kalender hinzufügen").
  Eine abgebrochene/abgewiesene Freigabe wird geschluckt (kein Fehler); ein echter
  Schreibfehler wird propagiert.
- **Unit-Tests `src/lib/native/share-ics.test.ts`** (5): Schreiben in Cache/UTF-8,
  Teilen der File-URI, Reihenfolge write→share, Abbruch geschluckt, Schreibfehler propagiert.
  Die bestehenden `ical-export.test.ts` (Web-Pfad) laufen unverändert grün (jsdom →
  `isNativePlatform()` = false → Web-Branch).

**Verifikation:**
- `npx vitest run`: **191/191 grün** (5 neu, keine Regression).
- `npm run build`: sauberer Static Export, alle 13 Routen `○ Static` (neue Capacitor-
  Imports brechen den Prerender nicht).
- `npx cap sync ios` + nativer Build (externes DerivedData) **BUILD SUCCEEDED**,
  auf iPhone-17-Simulator (iOS 26.5) installiert und gestartet (eingeloggt, Gruppen-Liste).

**Manuell offen (nicht headless tappbar — Simulator-Accessibility fehlt):**
- Antippen von „Zum Kalender hinzufügen" in einer terminierten Aktivität → das native
  Share-Sheet muss erscheinen und die `.ics` in die Kalender-App übernehmbar sein
  (AC „Kalender-Export (nativ)"). Mechanik (Build, Plugin-Registrierung, Branch hinter
  `isNativePlatform()`, Datei-Schreiben + Share-Aufruf) ist verifiziert; nur der finale
  UI-Tap steht als Gerätetest aus.

### Schritt 7 — Nativer Avatar über Kamera/Fotomediathek (`@capacitor/camera`) (2026-06-27)
Siebter `/frontend`-Teil: die in Schritt 5/6 als offen markierte **Avatar-Lücke**
geschlossen. Web behält den `<input type=file>`-Dialog; nativ erscheint jetzt die
OS-Auswahl **Kamera oder Fotomediathek**.

**Was gebaut wurde:**
- **Plugin installiert:** `@capacitor/camera@8.2.0` (+ `npx cap sync ios` → jetzt in der
  iOS-`Package.swift`, 6 Plugins registriert).
- **Neue Plattform-Brücke `src/lib/native/camera.ts`:** `pickAvatarPhoto()` ruft
  `Camera.getPhoto()` mit **`CameraSource.Prompt`** (native Action-Sheet Kamera/Mediathek),
  `resultType: Uri`, `quality 80`, `width/height 1024`, `correctOrientation` + deutschen
  Prompt-Labels. Das Ergebnis wird via `fetch(webPath)→blob` zu einer `File`
  (`avatar.<ext>`) umgewandelt, die der **unveränderte** `uploadAvatar(file)`-Flow
  (useProfile) konsumiert. Diskriminierte Rückgabe `picked | cancelled | denied`;
  `classifyCameraError()` trennt Nutzer-Abbruch von Berechtigungs-Ablehnung; echte/
  unerwartete Fehler werden propagiert (Aufrufer → generischer Toast).
- **`ProfileSection.tsx`** verzweigt im Avatar-Tap hinter **`isNativePlatform()`**: nativ →
  `pickAvatarPhoto()` (Abbruch still, `denied` → Hinweis „…in den Einstellungen erlauben",
  AC erfüllt); Web → bestehender `<input type=file>`-Click unverändert. Upload-Erfolgs-/
  Fehler-Toast in `uploadAndNotify()` extrahiert (von beiden Pfaden genutzt).
- **`<Toaster />` (sonner) im Root-Layout gemountet.** Er war projektweit **nirgends**
  gemountet → alle bestehenden Profil-Toasts (Name/Avatar) verpufften still, und die
  AC-pflichtige „Berechtigung abgelehnt"-Meldung hätte nie angezeigt werden können.
  Mounten repariert beides mit einer Zeile. (`sonner.tsx` nutzt `next-themes` `useTheme`;
  ohne Provider fällt es sauber auf `system` zurück — kein Crash.)
- **iOS Usage-Descriptions** (`NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSPhotoLibraryAddUsageDescription`) waren bereits in Schritt 4 vorbereitet → keine
  Info.plist-Änderung nötig.
- **Unit-Tests `src/lib/native/camera.test.ts`** (7): Prompt-Optionen, File-Erzeugung
  (Name/Typ), `cancelled`/`denied`-Klassifikation, Re-Throw bei unerwartetem Fehler.

**Verifikation:**
- `npx vitest run`: **198/198 grün** (7 neu, keine Regression).
- `npm run build`: sauberer Static Export, alle 13 Routen `○ Static` (Camera-Import bricht
  den Prerender nicht — `isNativePlatform()` ist serverseitig `false`).
- `npx cap sync ios`: `@capacitor/camera@8.2.0` in Package.swift registriert.

**Manuell offen (nicht headless tappbar — Simulator-Accessibility/Kamera fehlt):**
- Avatar antippen → natives Action-Sheet „Kamera / Aus Mediathek" muss erscheinen,
  Foto/Bild wählbar und als Profilbild hochgeladen (AC „Kamera/Foto nativ"). Berechtigung
  ablehnen → Hinweis-Toast (AC). Mechanik (Plugin-Registrierung, `Prompt`-Source,
  File-Konvertierung, Branch hinter `isNativePlatform()`, Denial-Klassifikation, Toast-Mount)
  ist verifiziert; nur der finale UI-Tap + echte Berechtigungs-Dialoge stehen als
  Gerätetest aus.

**Noch offen in PROJ-9 (nächste Schritte):** Status-Bar/Splash-Screen-Assets,
Android-Zurück-Button, `@capacitor/network`-Hinweis, externe Links via `@capacitor/browser`,
untere Safe-Area in Sheets/Listen; `@capacitor/push-notifications` nur installieren (PROJ-10);
**Android-Projekt** (`npx cap add android` + Intent-Filter). Erfolgs-Login end-to-end (Schritt 4)
weiterhin als Gerätetest offen.

### Schritt 8 — Restliches natives Feinverhalten + Android-Projekt (2026-06-28)
Achter `/frontend`-Teil (Refine-Runde 2026-06-28): die in Schritt 5–7 als offen
markierten Native-Lücken **vollständig** geschlossen und das **Android-Projekt** erzeugt.
Damit ist PROJ-9 **code-seitig komplett**; offen bleiben nur Geräte-/Dashboard-Schritte
(siehe unten).

**Neue Plugins installiert:** `@capacitor/network@8`, `@capacitor/browser@8`,
`@capacitor/keyboard@8`, `@capacitor/splash-screen@8`, `@capacitor/push-notifications@8`
(+ `@capacitor/android@8`). Alle 11 Plugins sind nach `cap sync` in iOS-`Package.swift`
**und** Android registriert.

**Native Komponenten (im Root-Layout gemountet, alle No-op im Web hinter `isNativePlatform()`):**
- **`NativeBackButton.tsx`** — `@capacitor/app` `backButton`: navigiert eine Ebene
  zurück (`history.back()`), beendet die App nur am Wurzel-Screen ohne History
  (AC „Android-Zurück-Button"). iOS feuert das Event nie → harmlos.
- **`NativeNetworkBanner.tsx`** — `@capacitor/network`: zeigt bei Offline einen festen
  „Keine Verbindung"-Banner unter der Statusleiste (`pt-safe`), reagiert live auf
  `networkStatusChange` (AC-Edge-Case „Keine Internetverbindung" → kein stiller Leerlauf).
- **`NativeExternalLinks.tsx`** + **`src/lib/native/external-link.ts`** — delegierter
  Document-Click-Interceptor: http(s)-Links auf eine **fremde Origin** öffnen über
  `@capacitor/browser` im System-Browser statt in der WebView (AC „externe Links").
  Bewusst delegiert → erfasst den `activity.url`-Link (ActivityDetailSheet) und jeden
  künftigen externen Link **ohne** Eingriff in die Komponenten. (AGB/Datenschutz sind
  aktuell `href="#"`-Platzhalter, also nicht betroffen.) 5 Unit-Tests
  (`external-link.test.ts`).
- **`NativeKeyboard.tsx`** + `capacitor.config.ts` `Keyboard: { resize: 'none' }` —
  bewusst **`none`** statt `native`: so verkleinert sich nur der Visual-Viewport (wie
  in mobile Safari), wofür der bestehende `useKeyboardInset`-Hook (hebt das Aktivitäts-
  Sheet über die Tastatur) gebaut wurde. Ein `keyboardDidShow`-Scroll-Assist hält
  Eingabefelder im Normalfluss sichtbar (AC-Edge-Case „Tastatur überdeckt Eingabefelder").

**Untere Safe-Area:** Der Composer-Footer im ActivityDetailSheet nutzt jetzt
`pb-[calc(1rem+env(safe-area-inset-bottom))]` — sitzt über dem Home-Indicator, und da iOS
`safe-area-inset-bottom` bei offener Tastatur auf 0 setzt, bleibt der Abstand bei offener
Tastatur korrekt minimal. Die mobile `GroupBottomNav` hatte bereits `pb-safe`; andere
Sheets haben keine fix am unteren Rand verankerten Buttons (scrollen im normalen Fluss).

**App-Icon & Splash-Screen:** Aus dem bestehenden App-Logo `public/logo.png`
(ZSMN-Wortmarke auf Cream `#F8EBD9`, Eckfarbe exakt = App-`--bg`, kein Seam) wurden Quell-
Assets `assets/icon.png` (1024, Logo in der Android-Safe-Zone) und `assets/splash.png`/
`splash-dark.png` (2732, Logo zentriert auf Cream) komponiert und via
`npx @capacitor/assets generate` in **iOS-AppIcon/Splash (13)** und **Android-Mipmaps/
Splash (100)** umgewandelt. `SplashScreen`-Config: Cream-Hintergrund, 600 ms, kein Spinner.
Die mitgenerierten PWA-Icons (nicht genutzt) wurden wieder entfernt. _(Dark-Splash zeigt
vorerst ebenfalls Cream; eine helle Logo-Variante wäre späterer Politur-Punkt.)_

**Android-Projekt erzeugt (`npx cap add android`):**
- `android/`-Projekt committet; Gradle-Sync übersprungen (kein `java` auf PATH — der
  Build läuft in Android Studio mit dessen gebündeltem JBR).
- **`AndroidManifest.xml`:** Intent-Filter für das Custom-Scheme `com.zusammen.app`
  (`VIEW`/`DEFAULT`/`BROWSABLE`) — Pendant zum iOS-`CFBundleURLTypes`-Eintrag; der
  `@capacitor/app`-Deep-Link-Listener (warm + Cold-Start) löst den Auth-Rücksprung auf.
- **Router-Parität (echter Bug verhindert):** Capacitors Android-Local-Server hat
  **dasselbe MPA-Problem wie iOS** — mit `html5mode` (Default) mappt er jeden
  extensionslosen Pfad (`/login`) auf die **Root-`index.html`** → Whitescreen bei harten
  Navigationen/Cold-Start-Deep-Link-Zielen. Der `RouteProcessor`-Hook reicht hier
  **nicht** (im html5mode-Zweig fix mit `/index.html` aufgerufen). Lösung:
  **`NextStaticWebViewClient.java`** (Subclass von `BridgeWebViewClient`, in
  `MainActivity.onCreate` via `setWebViewClient` verdrahtet) schreibt eine extensionslose
  Verzeichnis-Anfrage vor dem Servieren auf deren eigene `…/index.html` um und delegiert
  dann an Capacitors normale Asset-Pipeline (korrekte MIME-Typen, JS-Injection). Dateien
  mit Endung und `/` bleiben unberührt. **Rein nativ — kein Eingriff in den Web-Code,
  exakt das Pendant zum iOS-`NextStaticRouter`.**

**Verifikation (in dieser Umgebung möglich):**
- `npx vitest run`: **203/203 grün** (5 neu in `external-link.test.ts`, keine Regression).
- `npm run build`: sauberer Static Export, alle 13 Routen `○ Static` (neue Capacitor-
  Imports brechen den Prerender nicht — `isNativePlatform()` serverseitig `false`).
- `npx cap sync`: 11/11 Plugins in iOS-`Package.swift` **und** Android registriert.
- Bundle-Integrität geprüft: keine iCloud-Sync-Duplikate in `out/` / `ios/.../public` /
  `android/.../public`; referenzierte JS-Chunks der `login/index.html` existieren im Bundle.

**Manuell offen (nicht in dieser Umgebung möglich — Gerät/Dashboard nötig):**
- **iOS:** Rebuild in Xcode mit den 5 neuen SPM-Plugins (externes `-derivedDataPath`,
  `GIT_CONFIG`-Override — Schritt-4-Gotchas), dann am Simulator/Gerät prüfen.
- **Android:** Erst-Build in Android Studio (JBR), App im Emulator/Gerät starten →
  **`NextStaticWebViewClient` + Intent-Filter + Zurück-Button** verifizieren (kein
  Whitescreen, Deep-Link warm + Cold-Start). _Hinweis: `@capacitor/push-notifications`
  zieht auf Android `firebase-messaging`; für PROJ-10 sind Firebase-`google-services.json`
  + Gradle-Plugin nötig — ohne Verdrahtung baut die App, ein Token-Abruf erfolgt nicht._
- Erfolgs-Login end-to-end, Kalender-Export-/Avatar-UI-Tap, Offline-/Tastatur-/externe-
  Links-Verhalten am Gerät; Supabase-Redirect-Freigabe; TestFlight- + interner-Android-
  Test-Upload. (Siehe Open Questions.)

## QA Test Results

**QA-Datum:** 2026-06-28 · **Tester:** QA (statisch + Red-Team + Android-On-Device) · **Status:** Approved

### Testbarkeits-Hinweis (wichtig für dieses Feature)
PROJ-9 verpackt die Web-App nativ. Die nativen Pfade laufen **nur** auf Gerät/Simulator
(`isNativePlatform()` ist im Desktop-Browser `false` → alle nativen Komponenten sind No-ops).
Headless E2E/Browser-Tests können das native Verhalten daher **nicht** ausüben. QA hier =
**(a)** Web-Regression (automatisiert), **(b)** statischer Red-Team-/Korrektheits-Review des
neuen Codes, **(c)** ehrliche AC-Matrix mit Geräte-Verifikations-Gate. Die On-Device-Tests
(Distribution, Erfolgs-Login, native UI-Taps) sind **vom Nutzer** durchzuführen.

### Automatisierte Tests (Web-Regression) — ✅
| Suite | Ergebnis |
|-------|----------|
| `npx vitest run` | **205/205 grün** (inkl. 7 `external-link.test.ts`, davon 2 neu für BUG-9-1) |
| `npm run build` | sauberer Static Export, 13/13 Routen `○ Static` |
| `npx cap sync` | 11/11 Plugins in iOS-`Package.swift` **und** Android registriert |
| Bundle-Integrität | keine iCloud-Sync-Duplikate; referenzierte JS-Chunks vorhanden |

### Nativer iOS-Build + Smoke-Test (in dieser Umgebung durchgeführt) — ✅
- **`xcodebuild` (iPhone-17-Pro-Simulator, Xcode 26.6):** **BUILD SUCCEEDED** — die 5 neuen
  SPM-Plugins (network, browser, keyboard, splash-screen, push-notifications) + die neue
  Keyboard-/Splash-Config + der Swift-`NextStaticRouter` kompilieren und linken sauber.
  (Workarounds wie in Schritt 4: externer `-derivedDataPath` im Scratchpad, `GIT_CONFIG`-
  Override für `safe.bareRepository`, `CODE_SIGNING_ALLOWED=NO`.)
- **App im Simulator gestartet:** bootet sauber auf den **Login-Screen** (ZSMN-Logo,
  Safe-Area korrekt, Statusleisten-Text dunkel im Light Mode) — **kein Whitescreen**. Die 4
  neu gemounteten Native-Komponenten (`NativeBackButton`, `NativeKeyboard`,
  `NativeExternalLinks`, `NativeNetworkBanner`) brechen den Boot **nicht** → keine Regression.
- _Hinweis:_ Deployment-Target jetzt auf iOS 16.0 gesetzt (war Capacitor-Default 15.0) —
  passend zur Decision-Log-Entscheidung iOS 16+.

### Nativer Android-Compile (in dieser Umgebung durchgeführt) — ✅
- **`./gradlew :app:compileDebugJavaWithJavac`** (JDK 21 aus Android Studios JBR):
  **BUILD SUCCESSFUL** — der neue **`NextStaticWebViewClient.java`** + `MainActivity.java`
  kompilieren sauber gegen die Capacitor-8-Android-API (verbleibende Warnungen stammen aus
  Capacitors eigenem Plugin-Code, nicht aus unserem). Damit ist die zuvor untestbare Android-
  Router-Java verifiziert.
- **Dabei gefunden & behoben:** iCloud-Sync-Duplikate (`… 2.xml`/`… 2.js` etc.) im Projekt —
  u. a. eine versehentlich getrackte `res/xml/config 2.xml`, die den Android-Resource-Merger
  abbrechen ließ. Alle Duplikate gelöscht, `config 2.xml` aus dem Commit entfernt. (Bekanntes
  Sync-Ordner-Risiko aus Schritt 4 — vor jedem nativen Build prüfen.)
- `minSdkVersion` auf **29 (Android 10)** gesetzt — passend zur Decision-Log-Entscheidung.

> Die historische Playwright-Suite (PROJ-2…8, 13) testet Web-Flows gegen Live-Supabase und
> berührt keinen PROJ-9-Code; eine PROJ-9-E2E-Spec wurde **bewusst nicht** geschrieben, da
> sie natives Verhalten im Desktop-Browser nicht assertieren kann.

### Acceptance-Criteria-Matrix
| AC-Gruppe | Code | Geräte-Verifikation |
|-----------|------|---------------------|
| Build & Static Export | ✅ verifiziert (Build reproduzierbar, Web unverändert) | n/a |
| App-Start (Icon/Splash) | ✅ Assets iOS+Android generiert, Splash-Config gesetzt | ⏳ optischer Check am Gerät |
| Safe-Areas / Status-Bar | ✅ (iOS in Schritt 5 am Simulator verifiziert) | ⏳ Android |
| Android-Zurück-Button | ✅ Code (`NativeBackButton`) | ⏳ Android-Gerät |
| Login / Deep Link | ✅ iOS warm+cold verifiziert (Schritt 4) | ⏳ Erfolgs-Login e2e + Android |
| Kalender-Export (nativ) | ✅ Code+Build (Schritt 6) | ⏳ Share-Sheet-UI-Tap |
| Kamera / Foto (nativ) | ✅ Code+Build (Schritt 7) | ⏳ Action-Sheet + Berechtigung |
| Verteilung (TestFlight/intern. Test) | — | ⏳ **nur manuell** (Signing/Dashboards) |
| Edge: Offline-Hinweis | ✅ Code (`NativeNetworkBanner`, beide Themes kontrastgeprüft) | ⏳ Gerät |
| Edge: externe Links | ✅ Code (`NativeExternalLinks` Interceptor) | ⏳ Gerät |
| Edge: Tastatur | ✅ `resize:'none'` + Scroll-Assist (nutzt bestehenden `useKeyboardInset`) | ⏳ Gerät |

### Gefundene Bugs / Findings
**BUG-9-1 — `javascript:`/Nicht-HTTP-Schema als Aktivitäts-URL speicherbar — Medium (Security) — ✅ BEHOBEN (2026-06-28)**
- **Fix (3 Ebenen, Defense-in-Depth):**
  1. **Eingabe-Validierung** (`ProposalFormSheet.tsx`): URL muss `http:`/`https:` sein,
     sonst Fehlermeldung „Nur http(s)-Links sind erlaubt" → keine neuen Bad-Data.
  2. **Render-Guard** (`ActivityDetailSheet.tsx`): `activity.url` wird nur als `<a>`
     gerendert, wenn `isHttpUrl()` → sonst als reiner Text. Neutralisiert **bereits
     gespeicherte** Bad-Data auf Web **und** Nativ.
  3. **Interceptor-Hardening** (`external-link.ts`): `javascript:`/`data:`/`vbscript:`/
     `blob:`/`file:`-Links werden in der WebView aktiv geblockt (`preventDefault`, kein Öffnen).
- **Tests:** `isHttpUrl` + Dangerous-Scheme-Fälle in `external-link.test.ts` → **205/205 grün**.
- _Ursprünglicher Befund unten zur Nachvollziehbarkeit:_
- **Wo:** `ProposalFormSheet.tsx:102` validiert die URL nur via `new URL(value)` — das
  akzeptiert **jedes** Schema (`javascript:`, `data:`). Die URL wird in
  `ActivityDetailSheet.tsx:626` als `<a href={activity.url} target="_blank">` gerendert.
- **Native Auswirkung (durch PROJ-9 relevanter):** Der neue `NativeExternalLinks`-Interceptor
  fängt **nur** `http(s)` ab; ein `javascript:`-Link fällt aufs Default-Anchor-Verhalten
  zurück und **führt JS in der WebView aus** (Zugriff auf Capacitor-Bridge + Supabase-Session).
- **Realismus:** Insider-Angriff (ein Gruppenmitglied legt die URL an, ein anderes tippt sie) —
  in einer Freundesgruppe begrenzt, Impact nativ aber hoch. Im reinen Web blocken moderne
  Browser `javascript:`-Navigationen weitgehend → primär ein Nativ-Risiko.
- **Empfehlung (Fix in `/frontend`, nicht hier):** URL-Validierung auf `http`/`https`
  beschränken (`new URL(v).protocol === 'http(s):'`) **und** im Interceptor Nicht-HTTP-Schemata
  aktiv blocken (preventDefault ohne Öffnen). Pre-existing Datengap (Proposal-Form), durch die
  native Hülle verschärft.

**OBS-9-2 — Google-Calendar-Connect (OAuth) nativ inkompatibel — Medium, außerhalb PROJ-9-AC — bewusst NICHT in dieser Runde gefixt**
- `useCalendarConnection.ts:54` navigiert per `window.location.href = data.auth_url` zur Google-
  OAuth-Seite. In einer eingebetteten WebView blockt Google das (`disallowed_useragent`). Der
  **Kalender-Export (.ics)** — der eigentliche PROJ-9-AC — ist davon **nicht** betroffen (Schritt 6,
  `@capacitor/share`). Betrifft die separate Google-**Sync**-Funktion.
- **Warum nicht heute gefixt:** Ein korrekter Fix berührt mehrere Stellen, die headless weder
  konfigurierbar noch testbar sind — ein Teil-Fix wäre ein anderes, ebenso gebrochenes Verhalten.
- **Konkreter Plan (eigener Schritt / PROJ-7-Nachzug):**
  1. **Nativ** `auth_url` per `@capacitor/browser` (`Browser.open`) im System-Browser/Custom-Tab
     öffnen statt `window.location.href` (umgeht `disallowed_useragent`).
  2. **Redirect-URI** auf ein Custom-Scheme-Deep-Link umstellen
     (`com.zusammen.app://auth/google-calendar/callback`) — in **Google Cloud Console** (OAuth-
     Client) **und** in der Edge Function `google-calendar-oauth/init` als erlaubte Redirect-URI
     hinterlegen; nativ diese statt der `window.location.origin`-Web-URL senden.
  3. **Deep-Link-Handler** für `…/google-calendar/callback` ergänzen (analog zu `deep-link.ts`
     Auth-Flow), der den `?code=` an die Edge Function zum Token-Tausch weiterreicht und das
     System-Browser-Fenster schließt (`Browser.close`).
  4. Web-Pfad unverändert lassen (Branch hinter `isNativePlatform()`).

**OBS-9-3 — Android-Router-Fallback bei unbekannter Route — Low/Info — ✅ ANGEGLICHEN (2026-06-28)**
- `NextStaticWebViewClient` prüft jetzt per `AssetManager`, ob `public/<route>/index.html`
  existiert; falls nicht, fällt er auf die Root-Shell (`/index.html`) zurück — exakt wie der
  iOS-`NextStaticRouter`. Unbekannte Routen zeigen damit keine leere Seite mehr.

### Red-Team-Audit (sonst)
- Kein Secret-Leak in den neuen Modulen; `Browser.open` öffnet nur validierte http(s)-URLs.
- `NextStaticWebViewClient`: kein Pfad-Traversal-Vektor (AssetManager sandboxed; Requests stammen
  von der eigenen App-Origin).
- Deep-Link-/Auth-Pfad (`deep-link.ts`, PKCE) in dieser Runde **unverändert** → keine Regression.
- Netzwerk-Banner-Kontrast in Light **und** Dark Mode geprüft (ok).

### Android On-Device-Verifikation (Emulator) — ✅ (2026-06-28, Nachtrag)
Live auf dem Android-Emulator **ZUSAMMEN_Pixel7** (API 36, arm64-v8a) durchgeführt — schließt die
zuvor mit ⏳ markierten Android-Gates. Build via `./gradlew installDebug` (foojay-Toolchain lädt
JDK 21; ProGuard-Fix `proguard-android-optimize.txt`). Verifiziert (mit Screenshots):
- **Boot ohne Whitescreen** → Login-Screen rendert (ZSMN-Logo). Der `NextStaticWebViewClient`-Router
  funktioniert: harte Navigationen (`/login`, `/groups/view`) lösen korrekt auf, kein Whitescreen.
- **Erfolgs-Login end-to-end** (E-Mail/Passwort durch den Nutzer) → Gruppen-Liste „Meine Gruppen"
  lädt live aus Supabase. **(Schließt das in Schritt 4 offene „Erfolgs-Login e2e"-Gate für Android.)**
- **Session-Persistenz** über Emulator-Neustart + App-Cold-Start hinweg → direkt eingeloggt
  (Logcat: `Preferences get sb-…-auth-token`). Bestätigt den nativen `@capacitor/preferences`-Storage.
- **Android-Zurück-Button** → aus Gruppen-Detail eine Ebene zurück auf „Meine Gruppen", App bleibt
  im Vordergrund (schließt nicht). `NativeBackButton` verifiziert.
- **Offline-Banner** → bei `svc wifi/data disable` erscheint „Keine Verbindung – einige Inhalte sind
  nicht verfügbar." live unter der Statusleiste (Safe-Area korrekt); verschwindet bei Reconnect
  live. `NativeNetworkBanner` verifiziert.
- **Safe-Areas** → Header sitzt unter der Statusleiste, Bottom-Nav/FAB über dem Home-Indicator.
- **Custom-Scheme-Cold-Start** → `am start -a VIEW -d com.zusammen.app://auth/callback?error=…`
  startet die zuvor beendete App (Intent-Filter `Scheme: com.zusammen.app`, VIEW/DEFAULT/BROWSABLE
  bestätigt via `dumpsys package`). Die Fehlermeldung selbst wird hier nicht gezeigt, weil eine
  gültige Session besteht (Auth-Guard leitet `/login` → `/`); der Fehlertext-Pfad ist auf iOS
  (Schritt 4, ausgeloggt) bereits verifiziert.

### Aktualisierte AC-Matrix (Geräte-Verifikation)
| AC-Gruppe | Stand nach 2026-06-28-Nachtrag |
|-----------|-------------------------------|
| App-Start (Icon/Splash) | ✅ Android-Icon (ZSMN) auf Homescreen + Boot verifiziert; iOS optisch ⏳ |
| Safe-Areas / Status-Bar | ✅ iOS (Schritt 5) **+ Android (Emulator)** |
| Android-Zurück-Button | ✅ **am Emulator verifiziert** |
| Login / Deep Link | ✅ iOS warm+cold (Schritt 4) **+ Android Erfolgs-Login e2e + Scheme-Cold-Start** |
| Edge: Offline-Hinweis | ✅ Code **+ am Emulator live verifiziert** |
| Edge: externe Links | ✅ Code; Geräte-Tap ⏳ (kein externer Link in aktuellen Testdaten) |
| Edge: Tastatur | ✅ Code; Geräte-Tap ⏳ |
| Kalender-Export (nativ) | ✅ Code+Build; Share-Sheet-UI-Tap ⏳ (braucht terminierte Aktivität) |
| Kamera / Foto (nativ) | ✅ Code+Build; Action-Sheet + Berechtigung ⏳ (Emulator ohne Kamera) |
| Verteilung (TestFlight/intern. Test) | ⏳ **nur manuell** (Signing/Dashboards) |

### Production-Ready-Entscheidung: **APPROVED** (2026-06-28)
- **Keine Critical/High-Bugs.** BUG-9-1 (Medium, Security) ist behoben; OBS-9-3 (Low) angeglichen.
- **Web-Regression vollständig grün** (205/205), Static Export sauber.
- **Native Kern-ACs auf beiden Plattformen verifiziert:** iOS am Simulator (Schritte 4–7),
  **Android live am Emulator** (dieser Nachtrag) — Boot, Erfolgs-Login, Session-Persistenz,
  Zurück-Button, Offline-Banner, Safe-Areas, Custom-Scheme-Cold-Start.
- **Verbleibende ⏳-Punkte sind keine Bugs**, sondern (a) manuelle Distribution (TestFlight/interner
  Android-Test — Signing/Konten) und (b) wenige UI-Taps, die echte Daten/Hardware brauchen
  (Share-Sheet einer terminierten Aktivität, Kamera-Action-Sheet). Diese sind vor dem späteren
  **Store-Schritt** (eigenes Feature) abzuhaken, nicht für die App-Funktion blockierend.

### Empfohlene Reihenfolge der Behebung
1. ~~**BUG-9-1** (Security, Medium)~~ → **✅ behoben** (2026-06-28).
2. ~~**On-Device-Verifikation Android**~~ → **✅ am Emulator durchgeführt** (2026-06-28).
3. **Manuelle Distribution** (TestFlight + interner Android-Test) — beim späteren Store-Schritt.
4. **OBS-9-2** (Google-Sync nativ) — separat / PROJ-7-Nachzug (außerhalb PROJ-9-AC).
5. ~~**OBS-9-3** (Low)~~ → **✅ angeglichen** (2026-06-28).

## Deployment
_To be added by /deploy_

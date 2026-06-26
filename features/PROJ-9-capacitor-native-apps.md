# PROJ-9: Capacitor Native Apps (iOS + Android)

## Status: Planned
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
- [ ] Welche Bundle-ID / App-ID? (Vorschlag: `com.zusammen.app` — muss eindeutig und final sein, da später nicht mehr änderbar.)
- [ ] Wie soll der angezeigte App-Name auf dem Homescreen lauten? (Vorschlag: „ZUSAMMEN".)
- [ ] Welche Mindest-OS-Versionen werden offiziell unterstützt? (Vorschlag: iOS 15+, Android 8+.)
- [ ] Bestehen bereits Apple Developer Account und Google Play Console (für TestFlight / internen Test nötig)?
- [ ] Soll die native App immer das auf Vercel gehostete Web-Frontend nutzen oder den lokal gebündelten Static Export? (Entscheidung in der Architektur-Phase — beeinflusst späteres OTA/Capgo PROJ-11.)

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
| _wird in /architecture ergänzt_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

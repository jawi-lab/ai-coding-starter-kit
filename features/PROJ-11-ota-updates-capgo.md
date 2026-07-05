# PROJ-11: OTA-Updates via Capgo

## Status: Deployed
**Created:** 2026-07-05
**Last Updated:** 2026-07-05

## Dependencies
- Requires: **PROJ-9 (Capacitor Native Apps)** — OTA existiert nur in der nativen Hülle. Capgo aktualisiert genau den lokal gebündelten Static Export (`webDir: out`), den PROJ-9 in die App packt. Ohne die native Hülle gibt es kein OTA.
- Nutzt das bestehende Build-Fundament aus PROJ-9 (`npm run build` → `out/` → `npx cap sync`) als Quelle der OTA-Bundles.
- Grenzt ab gegen: **PROJ-10 (Push)** und alle bisherigen Features — OTA verändert deren Auslieferung nicht, sondern nur den Update-Weg des Web-Bundles.
- Betrifft **nicht** die Web-Version (Vercel) — die aktualisiert sich weiterhin über den normalen Auto-Deploy.

## Ziel / Definition of Done
Die installierte native ZUSAMMEN-App kann neue **Web-Bundle-Versionen** (JS/HTML/CSS aus `out/`) **over-the-air** empfangen — also Bugfixes und kleine Verbesserungen ohne einen erneuten App-Store-/TestFlight-/Play-Store-Build und ohne Store-Review. Updates werden **still im Hintergrund** geladen und beim nächsten App-Start unsichtbar aktiv; ein fehlerhaftes Bundle wird automatisch zurückgerollt.

**Primärer Anwendungsfall (Warum jetzt):** Die App wird zunächst im **Freundeskreis getestet** und dabei laufend um Funktionen und Anpassungen erweitert. OTA erlaubt genau diese schnelle Iteration — Web-Bundle-Änderungen erreichen die installierten Apps der Test-Freunde direkt, ohne dass für jede Anpassung ein neuer Store-Build und Review nötig ist. (Native Erweiterungen bleiben die Ausnahme, die weiterhin einen echten Build erfordert — siehe Native-Grenze.)

**Wichtig — bewusstes Scoping:** In PROJ-11 wird die **Capgo-Infrastruktur vollständig in die App eingebaut und verdrahtet** (Plugin, Update-Check, Auto-Update, Auto-Rollback, Channel-Konfiguration, Build-/Upload-Ablauf dokumentiert). Die **Anlage eines echten Capgo-Accounts und das tatsächliche Live-Schalten der ersten OTA-Auslieferung erfolgen bewusst später** (eigener manueller Schritt, analog zum Apple-Push-Key in PROJ-10). Die App muss **ohne Live-Account völlig normal funktionieren** — kein Account/keine veröffentlichten Updates bedeutet schlicht „kein Update", niemals einen Fehler oder Absturz.

PROJ-11 ist „fertig", wenn: das Capgo-Updater-Plugin installiert und konfiguriert ist, die App beim Start (nativ) auf Updates prüft, ein verfügbares Bundle still lädt und beim nächsten Start anwendet, Auto-Rollback bei einem nicht sauber startenden Bundle greift, die Trennung **Beta/Produktion** angelegt ist, native-inkompatible Bundles gar nicht erst geliefert werden, und der komplette Build-→-Upload-→-Promote-Ablauf dokumentiert ist — der reale Go-Live steht als dokumentierter manueller Schritt aus.

## User Stories
- Als Nutzer möchte ich Bugfixes und kleine Verbesserungen **automatisch** erhalten, ohne die App manuell im Store aktualisieren zu müssen.
- Als Nutzer möchte ich, dass Updates mich **nicht unterbrechen** — sie sollen still im Hintergrund passieren und beim nächsten Öffnen einfach da sein.
- Als Nutzer möchte ich mich darauf verlassen können, dass ein **fehlerhaftes Update meine App nicht unbrauchbar macht** (automatischer Rückfall auf die letzte funktionierende Version).
- Als Entwickler möchte ich Web-Bundle-Fixes **ohne Store-Review** ausliefern, um schnell auf Fehler reagieren zu können.
- Als Entwickler möchte ich jedes Update erst auf meinem **eigenen Gerät (Beta-Channel)** testen, bevor es alle Nutzer bekommen.
- Als Entwickler möchte ich bei einem **kritischen Fix** ein Update erzwingen können (sofort statt erst beim nächsten Neustart).
- Als Entwickler möchte ich die **Capgo-Infrastruktur schon jetzt** in der App haben, den echten Live-Betrieb (Account, erste Auslieferung) aber **später** aktivieren.

## Out of Scope
- **Native Änderungen per OTA** (neue Capacitor-Plugins, neue Berechtigungen, geänderter nativer Code) — die lassen sich grundsätzlich **nicht** over-the-air ausliefern und brauchen weiterhin einen echten Store-/TestFlight-/interner-Test-Build.
- **„Bitte im Store aktualisieren"-Hinweis-UI** für veraltete native Hüllen — bewusst zurückgestellt (die App ist noch in TestFlight/internem Test, nicht öffentlich veröffentlicht). Für den MVP genügt der stille Kompatibilitäts-Check (siehe unten). _(kann später ergänzt werden)_
- **Echte Capgo-Account-Anlage + erste Live-Auslieferung eines Bundles** — bewusster späterer manueller Schritt (siehe Ziel/DoD und Open Questions).
- **Web-Version (Vercel)** — bekommt kein OTA; sie wird weiterhin über den normalen Vercel-Auto-Deploy aktualisiert. Alle OTA-Pfade sind **nativ-only** hinter `isNativePlatform()`.
- **Öffentliche Store-Veröffentlichung** (App Store / Play Store Listing, Review) — bleibt der separate Nachgang zu PROJ-9.
- **A/B-Tests, Feature-Flags oder gestaffelte Prozent-Rollouts** über Capgo — nur die zwei festen Channels (Beta/Produktion), kein Prozent-Rollout im MVP.
- **Update-Telemetrie/Analytics als eigenes Produkt-Feature** (In-App-Statistiken) — die Standard-Statistiken im Capgo-Dashboard genügen; es wird keine eigene Auswertungs-UI gebaut.
- **OTA für rein native Assets** (App-Icon, Splash-Screen, Store-Metadaten) — nicht über Capgo austauschbar.
- **Selbst gehostetes Update-Backend** — es wird auf Capgo Cloud gesetzt (self-hosted verworfen, siehe Product Decisions).

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Infrastruktur & „Ready ohne Live-Account"
- [ ] Angenommen das Capgo-Updater-Plugin ist installiert und konfiguriert, wenn `npm run build` und der native Build laufen, dann bauen iOS **und** Android weiterhin fehlerfrei und die App startet normal.
- [ ] Angenommen es existiert **noch kein** Capgo-Account / es sind keine Updates veröffentlicht, wenn die native App startet und auf Updates prüft, dann funktioniert die App vollständig normal weiter (kein Fehler, kein Absturz, kein sichtbarer Hinweis) und nutzt das lokal gebündelte Bundle.
- [ ] Angenommen die App läuft als Web-Version (Vercel), wenn sie geladen wird, dann ist die komplette OTA-Logik ein No-op (kein Update-Check, kein Capgo-Aufruf) — der Web-Pfad bleibt unverändert.

### Stiller Hintergrund-Update-Fluss (Standardfall)
- [ ] Angenommen der Nutzer öffnet die native App und ein neueres Bundle ist im zutreffenden Channel verfügbar, wenn die App auf Updates prüft, dann wird das neue Bundle **im Hintergrund geladen**, ohne den Nutzer zu unterbrechen oder einen Dialog zu zeigen.
- [ ] Angenommen ein neues Bundle wurde im Hintergrund geladen, wenn der Nutzer die App das nächste Mal (kalt) startet, dann ist das neue Bundle **automatisch und unsichtbar aktiv**.
- [ ] Angenommen kein neueres Bundle ist verfügbar, wenn die App auf Updates prüft, dann passiert nichts Sichtbares und die App läuft normal weiter.
- [ ] Angenommen das Gerät hat beim App-Start **keine Internetverbindung**, wenn die App auf Updates prüft, dann schlägt die Prüfung still fehl, die App startet mit dem aktuell installierten Bundle und es erscheint keine Fehlermeldung.

### Auto-Rollback (Sicherheitsnetz)
- [ ] Angenommen ein neu angewendetes Bundle startet **nicht sauber** (meldet nicht innerhalb der Wartezeit „bereit"), wenn die App startet, dann wird automatisch auf die zuletzt funktionierende Version zurückgerollt und der Nutzer kann die App normal weiter nutzen.
- [ ] Angenommen ein Bundle wurde per Auto-Rollback verworfen, wenn die App erneut startet, dann versucht sie **nicht** endlos, dasselbe fehlerhafte Bundle wieder anzuwenden (kein Rollback-Loop).

### Beta- / Produktions-Channels
- [ ] Angenommen ein Bundle wird in den **Beta-Channel** hochgeladen, wenn ein registriertes Testgerät (Entwickler) auf Updates prüft, dann erhält **nur** dieses Gerät das Beta-Bundle, während Produktions-Geräte es nicht bekommen.
- [ ] Angenommen ein Beta-Bundle wurde erfolgreich getestet, wenn es nach **Produktion** promotet wird, dann erhalten anschließend alle Produktions-Geräte dieses Bundle über den stillen Hintergrund-Fluss.

### Kritischer / erzwungener Fix
- [ ] Angenommen ein Bundle ist als **kritisch/verpflichtend** markiert, wenn die App startet und das Update erkennt, dann wird es **sofort** angewendet (kurzer „Aktualisiere…"-Zustand statt erst beim nächsten Neustart), bevor der Nutzer weiterarbeitet.

### Native-Kompatibilität
- [ ] Angenommen ein Web-Bundle setzt native Bestandteile voraus, die eine **ältere** installierte native Hülle nicht hat, wenn diese alte Hülle auf Updates prüft, dann wird ihr das inkompatible Bundle **nicht** ausgeliefert (sie bleibt sicher auf ihrem letzten kompatiblen Stand, kein Crash).
- [ ] Angenommen ein Nutzer installiert einen **neuen Store-/TestFlight-Build** (neuere native Hülle), wenn diese auf Updates prüft, dann erhält sie wieder die für sie passenden OTA-Bundles.

## Edge Cases
- **Kein Capgo-Account / keine Updates veröffentlicht (Ausgangszustand nach PROJ-11):** Die App muss sich exakt wie ohne OTA verhalten — lokales Bundle, kein Fehler. Dies ist der reguläre Zustand bis zum späteren Go-Live.
- **App wird während des Bundle-Downloads geschlossen:** Ein unvollständig geladenes Bundle darf nie angewendet werden; beim nächsten Start wird der Download entweder sauber neu versucht oder das aktuelle Bundle behalten.
- **Update-Check bei jedem App-Resume aus dem Hintergrund:** Kehrt die App nach längerer Hintergrundzeit zurück, prüft sie erneut — ohne den Nutzer mitten in einer Aktion zu unterbrechen (Anwendung erst beim nächsten Kaltstart, außer bei kritischem/erzwungenem Update).
- **Fehlerhaftes Bundle erreicht den Beta-Channel:** Auto-Rollback fängt harte Ladefehler auf dem Testgerät ab, bevor das Bundle je nach Produktion promotet wird — genau der Zweck des Beta-Channels.
- **Rollback-Loop verhindern:** Ein wiederholt fehlschlagendes Bundle darf nicht bei jedem Start erneut versucht werden.
- **Native-Version neuer als Bundle (Downgrade-Fall):** Wird eine native Hülle installiert, die neuer ist als das jüngste OTA-Bundle, darf kein „Rückschritt" erzwungen werden — die App nutzt ihr eingebautes (neueres) Bundle.
- **Sehr langsame/instabile Verbindung:** Der Update-Check darf den App-Start nicht blockieren; er läuft nebenläufig, und die App ist sofort nutzbar.
- **Datenschutz/Vertrauen:** Über OTA dürfen nur die vom Entwickler signierten/hochgeladenen Bundles ankommen — kein fremder Code (die Auslieferung läuft ausschließlich über den kontrollierten Capgo-Channel).

## Technical Requirements (optional)
- **Nativ-only:** Alle OTA-Pfade laufen hinter `isNativePlatform()`; die Web-/Vercel-Version bleibt unberührt.
- **Quelle der Bundles:** der bestehende Static Export (`out/`) aus PROJ-9; kein separater Build-Pfad.
- **Kein Blockieren des Starts:** Update-Check und Download laufen nebenläufig; die App ist sofort bedienbar.
- **Sicherheit:** Bundles werden ausschließlich über den kontrollierten Capgo-Channel ausgeliefert; API-Keys/Upload-Credentials liegen nie im App-Code (nur in der Entwickler-/CI-Umgebung).
- **Kompatibilität:** iOS und Android, dieselbe Capgo-Konfiguration; iOS-Reihenfolge wie in PROJ-9/10 (iOS zuerst, Android direkt danach).
- **Beachte iCloud-Sync-Fallen des Projektordners** (Konflikt-Duplikate `* 2.ext`, xattr-CodeSign) aus den PROJ-9-Build-Notizen bei der Bundle-Erzeugung/-Upload.

## Open Questions
- [ ] **Capgo-Account anlegen + App/API-Key in Capgo registrieren** (bewusster späterer manueller Schritt, analog zum Apple Push Key .p8 in PROJ-10). Bis dahin ist die App Capgo-ready, aber es werden keine Updates ausgeliefert.
- [ ] **Capgo-Plan wählen** (Solo/Indie-Tarif, ~13–26 $/Monat) beim Go-Live.
- [ ] **On-Device-Verifikation der echten OTA-Auslieferung** (Beta-Bundle laden → anwenden → Promote → Rollback-Fall) — erst nach Account-Anlage möglich; auf physischem iOS- und Android-Gerät gegenprüfen.
- [x] Konkrete Wartezeit/Schwelle für Auto-Rollback und die genaue Definition „native-inkompatibel" werden in `/architecture` festgelegt. → **Gelöst:** `appReadyTimeout = 10 000 ms`; „native-inkompatibel" = Bundle gegen neuere native Hülle gebaut als installiert (Capgos eingebauter Native-Versions-Vergleich sperrt die Auslieferung). Siehe Technical Decisions.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Update-UX: **silent im Hintergrund**, Anwendung beim nächsten Kaltstart | Am wenigsten störend; Nutzer bekommen Fixes automatisch ohne Unterbrechung — Capgo-Standardverhalten | 2026-07-05 |
| Zusätzlicher **Forced-/Kritisch-Pfad** für dringende Fixes (sofortige Anwendung) | Bei ernsten Bugs soll ein Fix nicht erst beim nächsten zufälligen Neustart greifen | 2026-07-05 |
| **Capgo Cloud** statt self-hosted | Solo-Dev: keine eigene Auslieferungs-Infrastruktur bauen/warten; Dashboard für Channels/Rollback/Stats sofort nutzbar | 2026-07-05 |
| **Infrastruktur jetzt verdrahten, Account/Go-Live bewusst später** | Die App wird OTA-ready gebaut, ohne dass ein Live-Account Voraussetzung fürs normale Funktionieren ist (gleiches Muster wie Apple-Push-Key in PROJ-10) | 2026-07-05 |
| **Zwei Channels: Beta + Produktion** | Jedes Update erst auf dem eigenen Gerät live testen, dann promoten — schützt bei silent-auto-apply davor, dass ein kaputtes Bundle sofort die ganze Gruppe erreicht | 2026-07-05 |
| **Auto-Rollback** als festes Sicherheitsnetz | Ein Bundle, das nicht sauber startet, darf die App nicht unbrauchbar machen — automatischer Rückfall auf die letzte funktionierende Version | 2026-07-05 |
| Native-Grenze: **stiller Kompatibilitäts-Check, kein Store-Update-Hinweis-UI** | Inkompatible Bundles werden gar nicht erst an alte native Hüllen geliefert; ein „Im Store aktualisieren"-Dialog ist unnötig, solange die App nur in TestFlight/internem Test läuft — hält den MVP schlank | 2026-07-05 |
| **Kein** Prozent-Rollout, A/B-Test, Feature-Flags, keine eigene Update-Analytics-UI im MVP | Scope schlank halten; alles über Capgo nachrüstbar | 2026-07-05 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| **Capgo-Plugin `@capgo/capacitor-updater`** als OTA-Mechanismus | Offizielle Capgo-Bibliothek, deckt Hintergrund-Download, Auto-Apply, Auto-Rollback, Channels und Native-Kompatibilität ab — genau der DoD-Umfang, ohne Eigenbau | 2026-07-05 |
| OTA wird als **native Bootstrap-Komponente `NativeUpdater.tsx`** (in `layout.tsx`, hinter `isNativePlatform()`) + dünner Helfer `src/lib/native/ota.ts` gebaut | Folgt exakt dem bestehenden Muster (`NativePushListener`, `platform.ts`); Web-Pfad bleibt 1:1 unberührt | 2026-07-05 |
| **`autoUpdate: true`** (Capgo prüft/lädt selbst bei Start & Resume) statt manueller Prüf-Logik | Weniger Eigencode, entspricht dem gewünschten „silent im Hintergrund"-UX; App-Start wird nicht blockiert | 2026-07-05 |
| **`notifyAppReady()` beim ersten erfolgreichen App-Render** aufrufen (in `NativeUpdater.tsx`) | Dieses „Ich bin sauber gestartet"-Signal ist der Auslöser, der Auto-Rollback *entwaffnet* — fehlt es, rollt Capgo automatisch zurück. Kern des Sicherheitsnetzes | 2026-07-05 |
| **Auto-Rollback-Schwelle `appReadyTimeout = 10 000 ms`** (Capgo-Default) | Lang genug für langsame Geräte/kalten Start, kurz genug für schnelle Erholung; Capgo verhindert Rollback-Loops durch internes Blacklisting des fehlerhaften Bundles | 2026-07-05 |
| **Zwei feste Channels „beta" und „production"**; Beta-Gerät per einmaligem `setChannel('beta')` selbst zugeordnet, alle anderen bleiben auf `production` (Dashboard-Default) | Erfüllt AC „nur mein Gerät bekommt Beta"; kein Prozent-Rollout nötig | 2026-07-05 |
| **Forced-/Kritisch-Pfad über Capgo `directUpdate`** (Bundle im Dashboard als kritisch markiert → sofortige Anwendung mit kurzem „Aktualisiere…"-Zustand) | Deckt AC „sofort statt beim nächsten Neustart" ab, ohne separaten Mechanismus | 2026-07-05 |
| **„Native-inkompatibel" := Bundle wurde gegen eine neuere native Hülle gebaut als die installierte** (neues Plugin/Permission/native API). Capgos eingebauter Native-Versions-Vergleich liefert solche Bundles gar nicht erst aus; die alte Hülle bleibt auf ihrem letzten kompatiblen Stand | Beantwortet Open Question; nutzt Capgos Kompatibilitäts-Gate statt eigener Logik | 2026-07-05 |
| **Kein API-Key im App-Code**: Upload-Credential (`CAPGO_TOKEN`) nur in lokaler Entwickler-/CI-Umgebung; der `appId` in `capacitor.config.ts` genügt clientseitig | Sicherheitsanforderung; das Plugin braucht clientseitig keinen Secret-Key zum Empfangen | 2026-07-05 |
| **Build-Quelle bleibt `out/`** (bestehender Static Export aus PROJ-9); Upload via `npx @capgo/cli bundle upload` | Kein separater Build-Pfad; ein Bundle = ein `npm run build`-Ergebnis | 2026-07-05 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick — Was gebaut wird
OTA ist **kein sichtbares Feature**, sondern eine unsichtbare Auslieferungs-Schicht in der nativen Hülle. Es kommt **keine neue UI** dazu (außer optional einem sehr kurzen „Aktualisiere…"-Moment nur im Forced-Fall). Konkret entstehen drei kleine Bausteine, alle strikt nativ-only:

```
Native Hülle (iOS / Android)  — nur wenn isNativePlatform()
│
├── capacitor.config.ts
│     └── plugins.CapacitorUpdater  ← Channel-, Auto-Update- & Rollback-Konfiguration
│
├── src/lib/native/ota.ts           ← dünner Helfer: „ready melden", „Channel setzen", Status
│
└── src/components/native/NativeUpdater.tsx   ← in layout.tsx gemountet (wie NativePushListener)
        └── meldet beim ersten sauberen Render „App bereit" (entwaffnet Rollback)
        └── setzt auf registrierten Testgeräten den Beta-Channel
```

Die Web-/Vercel-Version bindet **nichts** davon ein: `NativeUpdater` kehrt bei `!isNativePlatform()` sofort ohne Wirkung zurück — identisch zu allen bestehenden `Native*`-Komponenten.

### Der Update-Lebenszyklus (in Worten, kein Code)
1. **App-Start (nativ):** Capgo prüft im Hintergrund den zutreffenden Channel auf ein neueres Bundle. Der Start wird dabei **nie blockiert** — die App ist sofort bedienbar.
2. **Download:** Ist ein neueres Bundle da, lädt Capgo es still herunter. Der Nutzer merkt nichts.
3. **Anwenden:** Beim **nächsten Kaltstart** ist das neue Bundle automatisch aktiv (Standardfall). Ausnahme: ein als **kritisch** markiertes Bundle wird sofort angewendet (kurzer „Aktualisiere…"-Zustand).
4. **Sicherheitsnetz:** Nach dem Wechsel auf ein neues Bundle muss die App innerhalb von **10 Sekunden** das Signal „ich bin sauber gestartet" senden (`notifyAppReady()` in `NativeUpdater`). Bleibt das Signal aus (Bundle startet nicht), rollt Capgo automatisch auf die letzte funktionierende Version zurück und merkt sich das kaputte Bundle, sodass es **nicht erneut** versucht wird (kein Rollback-Loop).
5. **Kein Netz / kein Account / keine Updates:** Die Prüfung schlägt still fehl → die App läuft mit dem eingebauten Bundle weiter. Dies ist der **reguläre Zustand bis zum späteren Go-Live**.

### Datenmodell
**Kein eigenes Datenmodell, keine Supabase-Tabelle, keine RLS-Änderung.** Der gesamte Zustand (welches Bundle installiert ist, welcher Channel, Download-Status) wird vom Capgo-Plugin geräteseitig verwaltet und liegt im Capgo-Cloud-Dashboard. ZUSAMMENs eigene Datenbank ist unberührt.

Die einzige geräteseitig „gemerkte" Information ist die Channel-Zuordnung (Beta/Produktion), die das Plugin selbst persistiert; wir setzen sie nur einmalig auf Testgeräten.

### Wie die Acceptance Criteria abgedeckt werden
| Kriterium | Umsetzung |
|-----------|-----------|
| App ohne Live-Account normal | `autoUpdate` scheitert still ohne veröffentlichte Bundles; eingebautes `out/`-Bundle bleibt aktiv |
| Web-Version = No-op | Alles hinter `isNativePlatform()`; `NativeUpdater` mountet effektiv nichts im Web |
| Stiller Hintergrund-Fluss | Capgo `autoUpdate` + Anwendung beim nächsten Kaltstart |
| Kein Netz → still weiter | Netzwerkfehler des Checks werden verschluckt; kein Dialog |
| Auto-Rollback | Ausbleibendes `notifyAppReady()` innerhalb 10 s ⇒ Rückfall; kaputtes Bundle wird geblacklistet |
| Beta/Produktion | Zwei Channels; Testgerät via `setChannel('beta')`, Rest bleibt `production` |
| Kritischer Fix sofort | Bundle im Dashboard als kritisch → `directUpdate` |
| Native-Kompatibilität | Capgos eingebauter Native-Versions-Vergleich; inkompatible Bundles werden gar nicht erst geliefert |

### Auslieferungs-Workflow (dokumentiert, Go-Live später)
Der laufende Ablauf für ein OTA-Update (nach dem späteren Account-Setup):
1. `npm run build` → erzeugt das neue `out/`-Bundle (gleiche Quelle wie PROJ-9).
2. `npx @capgo/cli bundle upload --channel beta` → lädt das Bundle in den **Beta**-Channel.
3. Auf dem eigenen Testgerät App neu starten → Update prüfen, laden, anwenden, kurz gegentesten.
4. Bei Erfolg im Capgo-Dashboard **Beta → Produktion promoten** (oder per CLI) → alle Freunde erhalten es über den stillen Fluss.
5. Bei einem Problem: im Dashboard auf die vorige Version zurücksetzen (manuelles Rollback zusätzlich zum automatischen).

> ⚠️ **Build-Falle aus PROJ-9/10 beachten:** Der Projektordner liegt in iCloud — vor dem Bundle-Upload auf iCloud-Konflikt-Duplikate (`* 2.ext`) und xattr-CodeSign-Reste prüfen, damit kein Müll ins Bundle wandert. iOS zuerst bauen, Android direkt danach.

### Dependencies (zu installieren)
| Paket | Zweck |
|-------|-------|
| `@capgo/capacitor-updater` | Das OTA-Runtime-Plugin (Hintergrund-Update, Rollback, Channels) — kommt in die App |
| `@capgo/cli` (dev-only) | Kommandozeilen-Tool zum Hochladen/Promoten von Bundles — **nur** Entwickler-/CI-Umgebung, nicht im App-Bundle |

### Bewusst ausgeklammert (bestätigt aus dem Spec)
Kein Prozent-Rollout, keine A/B-Tests, keine eigene Update-Analytics-UI, kein „Bitte im Store aktualisieren"-Dialog, kein Self-Hosting. Der echte **Capgo-Account + erste Live-Auslieferung** bleibt ein bewusster späterer manueller Schritt (analog zum Apple-Push-Key in PROJ-10) — die App ist danach OTA-*ready*, aber ohne Live-Auslieferung.

## Implementation Notes (Frontend)

**Datum:** 2026-07-05 · **Skill:** `/frontend`

Die client-seitige OTA-Schicht ist gebaut, exakt nach Tech Design — drei kleine, strikt nativ-only Bausteine, Web-Pfad 1:1 unberührt:

| Datei | Rolle |
|-------|-------|
| [src/lib/native/ota.ts](../src/lib/native/ota.ts) | Dünner Helfer: `notifyAppReady()`, `setOtaChannel()`, `getOtaStatus()` — alle hinter `isNativePlatform()`, Plugin per dynamischem `import()` (wie `external-link.ts`/`push.ts`), jeder Aufruf schluckt Fehler still |
| [src/components/native/NativeUpdater.tsx](../src/components/native/NativeUpdater.tsx) | Bootstrap-Komponente, in [layout.tsx](../src/app/layout.tsx) gemountet (neben den anderen `Native*`). Ruft beim ersten Render `notifyAppReady()` (entwaffnet Auto-Rollback) und ordnet Test-Builds einmalig den `beta`-Channel zu |
| [capacitor.config.ts](../capacitor.config.ts) | `CapacitorUpdater`-Plugin-Konfiguration |

**Installierte Pakete:** `@capgo/capacitor-updater@8.50.2` (Runtime, Capacitor-8-kompatibel) + `@capgo/cli` (dev-only, für Bundle-Upload/Promote).

**Umgesetzte Konfiguration** (`capacitor.config.ts` → `plugins.CapacitorUpdater`):
- `autoUpdate: true` — stiller Hintergrund-Check + Download, Anwendung beim nächsten Kaltstart.
- `appReadyTimeout: 10000` — Auto-Rollback-Fenster (Tech Decision).
- `autoDeleteFailed: true`, `autoDeletePrevious: true` — hält den Bundle-Speicher sauber, kein Cruft nach Rollback.
- `defaultChannel: 'production'` — alle Geräte auf Produktion; Test-Gerät self-assigned `beta`.

**Channel-Zuordnung (Beta-Gerät):** Statt einer UI (Static Export → keine Per-Device-UI möglich) baut ein Entwickler seinen eigenen Test-Build mit `NEXT_PUBLIC_OTA_CHANNEL=beta`; `NativeUpdater` ruft dann einmalig `setChannel('beta')`. Ohne die Env-Variable (Normalfall) bleibt jedes Gerät auf `production`. Erfüllt AC „nur mein Gerät bekommt Beta" ohne Zusatz-UI.

**Abweichungen vom Tech Design:**
- Kein globales `directUpdate: true` gesetzt. In der aktuellen Plugin-Version (8.50.2) ist `directUpdate` deprecatet und würde **alle** Updates sofort anwenden — das widerspricht dem „silent, erst beim nächsten Kaltstart"-Default. Der Kritisch-/Forced-Pfad läuft daher wie vorgesehen über die **Dashboard-Markierung** eines Bundles als kritisch (Capgo wendet solche Bundles sofort an); kein separater App-Code nötig. Decision-Log-Eintrag „Forced über directUpdate" bleibt inhaltlich erfüllt, nur über die Dashboard-Route statt Config-Toggle.

**Tests:** [src/lib/native/ota.test.ts](../src/lib/native/ota.test.ts) — 11 Tests: Web-No-op (kein Plugin-Zugriff), Native-Pfad, stilles Fehler-Schlucken (kein Account/offline → nie ein Fehler), Channel-Accept/Reject, Status-Auslesen inkl. Offline-Fall. Alle 58 Native-Unit-Tests grün, `tsc` sauber auf den neuen Dateien.

**Ready ohne Live-Account (bestätigt):** Ohne veröffentlichte Bundles verhält sich die App exakt wie ohne OTA — `notifyAppReady()`/`setChannel()`/`current()` schlagen still fehl, das eingebaute `out/`-Bundle bleibt aktiv. Web-Version ist ein vollständiger No-op.

**Offen für spätere Skills / manuelle Schritte:**
- `/backend` **nicht erforderlich** — kein Datenmodell, keine Supabase-/RLS-Änderung (Tech Design bestätigt).
- Nativ: `npx cap sync` (iOS zuerst, Android danach) muss vor dem nächsten Native-Build laufen, damit das neue Plugin registriert wird.
- Capgo-Account + erste Live-Auslieferung + On-Device-Verifikation (Beta→Promote→Rollback) bleiben die dokumentierten manuellen Go-Live-Schritte (Open Questions).

## QA Test Results

**Datum:** 2026-07-05 · **Skill:** `/qa` · **Tester:** QA + Red-Team

### Testansatz — was hier prüfbar ist
OTA ist ein **unsichtbares, nativ-only Feature** ohne Web-UI. `NativeUpdater` rendert `null`; auf dem Web-Pfad läuft nichts. Der echte Auslieferungs-/Rollback-/Channel-Fluss braucht laut Spec einen **Capgo-Account + physisches Gerät** und ist ein bewusst zurückgestellter manueller Go-Live-Schritt (Open Question). Deshalb teilt sich die Prüfung in **jetzt verifizierbar (Code-/Build-Ebene)** und **erst am Gerät nach Account-Setup**.

### Automatisierte Tests
| Suite | Ergebnis |
|-------|----------|
| `vitest src/lib/native/ota.test.ts` | ✅ 11/11 grün |
| `vitest src/lib/native` (voller Native-Satz, Regression) | ✅ 58/58 grün |
| `tsc --noEmit` (ota.ts, NativeUpdater.tsx) | ✅ sauber |
| `npm run build` (Static Export, 13 Routen) | ✅ erfolgreich, alle Routen prerendered |

### Plugin-API-Vertrag verifiziert (höchstes Integrationsrisiko)
Da das Plugin per `import()` dynamisch geladen wird, können die Mocks eine falsche Methodensignatur nicht fangen. Gegen die realen Typdefinitionen + iOS-Swift-Quelle von `@capgo/capacitor-updater@8.50.2` gegengeprüft:
- `notifyAppReady()` ✅ existiert, Rückgabe wird (korrekt) ignoriert.
- `setChannel({channel})` → `ChannelRes.status` ✅; nativer Erfolgsfall setzt `status = "ok"` (CapgoUpdater.swift:2198/2291) → `res.status === 'ok'` in ota.ts:64 **korrekt**.
- `current()` → `{ bundle: { version }, native }` ✅ passt zu ota.ts:96–97.
- `getChannel()` → `{ channel?: string }` ✅ passt zu ota.ts:91.

### Acceptance Criteria

**Jetzt verifiziert (Code-/Build-Ebene):**
| AC | Status | Beleg |
|----|--------|-------|
| App ohne Live-Account läuft normal, kein Fehler/Absturz | ✅ PASS | Jeder Aufruf schluckt Fehler still (Unit-Tests „no account/offline"); eingebautes Bundle bleibt aktiv |
| Web-Version = vollständiger No-op | ✅ PASS | Alles hinter `isNativePlatform()` (false im Web); Plugin lazy-split in eigenen 5,4-KB-Chunk, in **keinem** prerendered HTML referenziert → wird im Web nie geladen |
| Build iOS/Android/Web bleibt fehlerfrei | ✅ PASS (Web+tsc); ⏸️ native Build am Gerät | Web-Export grün; nativer Xcode/Gradle-Build nicht in dieser QA-Umgebung ausführbar |
| Kein Netz → still weiter, keine Fehlermeldung | ✅ PASS | Fehler-Swallowing verifiziert (Unit-Tests offline-Fall) |
| Kein Secret/API-Key im App-Code | ✅ PASS | Grep über `src/` + `capacitor.config.ts`: nur `appId`, kein `CAPGO_TOKEN`/Key |
| Konfig entspricht Tech-Design | ✅ PASS | `autoUpdate:true`, `appReadyTimeout:10000`, `autoDeleteFailed/Previous:true`, `defaultChannel:'production'` |
| `notifyAppReady()` beim ersten Render, Channel-Opt-in per Env | ✅ PASS | NativeUpdater useEffect feuert unmittelbar nach Mount (< 10 s) |

**Erst am Gerät nach Capgo-Account (bewusst zurückgestellt, kein QA-Fail):**
Stiller Hintergrund-Download • Apply beim Kaltstart • Auto-Rollback + kein Rollback-Loop • Beta/Produktion-Routing auf echten Geräten • Forced/kritisch-Sofortanwendung • Native-Kompatibilitäts-Gate • Downgrade-Fall. Alle hängen an veröffentlichten Bundles/Capgo-Backend und stehen als Open-Question-Go-Live-Schritt (Zeile 91–93).

### Security-Audit (Red Team)
- **Kein Secret im Bundle:** ✅ bestätigt.
- **Fremdcode-Injektion:** `allowModifyUrl` **nicht** gesetzt → `setChannelUrl()` wird vom Plugin abgelehnt; die Update-/Channel-URL kann nicht zur Laufzeit auf einen fremden Server umgebogen werden. Auslieferung nur über den kontrollierten Capgo-Endpunkt. ✅
- **`NEXT_PUBLIC_OTA_CHANNEL`:** reiner Build-Time-Wert (inlined), keine Laufzeit-Nutzereingabe → keine Angriffsfläche. ✅
- **Stilles Fehler-Swallowing:** by design; keine sensiblen Daten geloggt. ✅

### Gefundene Bugs
Keine Critical / High / Medium.

**Low / Hinweis:**
- `getOtaStatus()` ist exportiert + getestet, aber (noch) nirgends aufgerufen — bewusster Diagnose-/Support-Helfer laut Spec (keine Analytics-UI). Kein Bug; nur festgehalten.

### E2E-Tests
**Nicht anwendbar** — das Feature hat keine Web-UI (`NativeUpdater` rendert `null`, alle Pfade nativ-only). Playwright hätte im Web nichts zu testen. Angemessene Abdeckung = die Unit-Tests (11) + Build-/Bundle-Verifikation. Die echte End-to-End-Prüfung ist die dokumentierte On-Device-Verifikation nach Account-Anlage (Open Question).

### Produktions-Empfehlung
✅ **READY (Infrastruktur-Scope von PROJ-11)** — keine Critical/High-Bugs, Web-Pfad nachweislich unberührt, Plugin-API-Vertrag stimmt, alle automatisierten Tests grün. Entspricht exakt dem DoD („OTA-Infrastruktur verdrahtet, Account/Go-Live bewusst später"). **Vor echtem Nutzer-Rollout** verbleibt die On-Device-Verifikation (Beta laden → anwenden → promote → Rollback) als dokumentierter manueller Go-Live-Schritt.

## Deployment

**Datum:** 2026-07-05 · **Skill:** `/deploy`

- **Produktions-URL:** https://qt-voting-app.vercel.app
- **Auslieferung:** `git push origin main` → Vercel Auto-Deploy (Projekt `qt-voting-app`).
- **Scope dieses Deploys:** Web-Bundle mit eingebauter, **nativ-only** OTA-Infrastruktur (Capgo). Auf dem Vercel-/Web-Pfad ist die OTA-Schicht ein vollständiger No-op (`NativeUpdater` rendert `null` hinter `isNativePlatform()`), d.h. dieses Deploy verändert das sichtbare Web-Verhalten nicht — es liefert lediglich den Code aus, der in den nächsten nativen Build gebündelt wird.

### Pre-Deployment-Checks
- ✅ `npm run build` erfolgreich — 13 Routen als Static Export prerendered, TypeScript-Check sauber.
- ✅ `npm test` — 278/278 grün (inkl. 11 OTA-Unit-Tests + 58 Native-Regression).
- ✅ QA freigegeben (keine Critical/High/Medium-Bugs).
- ✅ Kein Secret/API-Key im App-Code (`CAPGO_TOKEN` nur Dev/CI).
- ⚠️ **Fix beim Deploy:** Die `@capgo/cli`-Installation hatte `react` auf 19.2.7 angehoben, `react-dom` aber auf 19.2.3 belassen (Version-Mismatch, ließ 12 Test-Files fehlschlagen). Behoben via `npm install react-dom@19.2.7` → beide auf 19.2.7 angeglichen.
- ⚠️ **Bekanntes Nicht-Blocker-Issue:** `npm run lint` (`next lint`) ist unter Next 16 projektweit defekt (Kommando entfernt, keine `eslint.config.js`). Betrifft den Vercel-Build **nicht**; Typprüfung erfolgt über den Build.

### Offen (bewusster späterer manueller Go-Live-Schritt)
Der eigentliche OTA-**Live-Betrieb** (Capgo-Account anlegen, App/API-Key registrieren, erstes Bundle-Upload/Promote, On-Device-Verifikation Beta→Promote→Rollback auf physischem iOS/Android) bleibt der dokumentierte manuelle Schritt aus den Open Questions — analog zum Apple-Push-Key in PROJ-10. Bis dahin ist die App OTA-*ready*, liefert aber keine Updates aus (= regulärer Zustand, kein Fehler).

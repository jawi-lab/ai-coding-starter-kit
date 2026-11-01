# Phase 2 – Anforderungen Technik

Stand: 2026-11-01. Rolle: **Technik** (Frontend, Mobile/Capacitor, Backend/Supabase, Daten, Performance, Release). Grundlage: `Discovery.md`, `CLAUDE.md`, `docs/CODEMAP.md`, `.claude/rules/{frontend,backend,native}.md`, `docs/architecture/mellon.architecture.json`, `docs/production/performance.md`, gezielte Stellen im Code (unten jeweils genannt). Aufwände sind Schätzungen für Solo-Entwicklung mit KI-Unterstützung, inkl. Tests und Spec-Pflege, ohne Store-Review-Wartezeit. Personas und Tests bleiben simuliert. Platzhalter wie `<web-domain>` ersetzen echte Domains und IDs.

Größen: **S** ≤ 2 PT · **M** 3–5 PT · **L** ≥ 6 PT.

## 1. Technischer Rahmen und was er für Mockups bedeutet

| Rahmen | Fakt im Repo | Folge für Mockup-Ideen |
|---|---|---|
| Static Export | `next.config.ts`: `output: 'export'`, `trailingSlash: true`, `images.unoptimized` | Keine Pfad-Parameter (`/g/ABC123`), nur Query-Params (`/groups/view/?id=…&activity=…`, `lib/group-routes.ts`). Neue Seiten sind statische Ordner (`/join/`, `/home/`). Keine pro Datensatz gerenderten Meta-Tags (Link-Vorschau mit Gruppenname geht nicht, siehe 2.1). |
| Daten nur client-seitig | supabase-js, RLS als einzige Autorisierungsgrenze, Realtime auf Board/Polls/Notifications | Jede neue Ansicht braucht Lade-, Leer-, Fehler- und Offline-Zustand. Was „alle sehen“ sollen, muss sich als RLS-Regel formulieren lassen. |
| Server-Logik | 4 Edge Functions (`generate-invite-code`, `get-group-availability`, `send-push`, `unsubscribe`), DB-Trigger → `pg_net` → `send-push` (Secret aus Vault) | Zeitgesteuertes (Erinnerungen) braucht `pg_cron`; die Erweiterung ist bisher in keiner Migration aktiviert. Versandweg Push/E-Mail ist wiederverwendbar. |
| Capacitor | Bundle lokal aus `out/`, Custom Scheme nur für Auth (`com.zusammen.app://auth/callback`), keine `.entitlements`-Datei im Repo, Android-Intent-Filter nur für das Custom Scheme | Universal/App Links sind native Änderungen → Store-Release. Alles Übrige ist Web-Code im Bundle. |
| Capgo-OTA | `CapacitorUpdater.autoUpdate: false`, Kanäle `production`/`beta` | OTA ist eingebaut, aber **noch nicht scharf**. Bis zur Aktivierung erreicht jede Änderung native Nutzer nur per Store-Release. |
| Datenmodell | `activities.start_date`/`end_date` sind `date` **ohne Uhrzeit** | Mockups dürfen keine Uhrzeiten („Sa 19:00“, „2 h vorher erinnern“) als vorhanden darstellen. Mit Uhrzeit = Schema-Erweiterung (+ iCal-Export, Verfügbarkeit). |

**Korrektur zur Discovery (1.4 Nr. 6):** Das Vorschlagslimit = Mitgliederzahl ist seit 2026-06-23 entfernt (`features/PROJ-4-*.md`, „Post-Deployment Fixes“; kein `atProposalLimit` mehr im Code, kein DB-Trigger). Verbleibende Grenze: `required_votes` ≤ Mitgliederzahl (`ProposalFormSheet.tsx`). Mockups zeigen kein Limit-Banner.

## 2. Machbarkeit, Aufwand, Lösungsskizze

Übersicht (Details darunter):

| # | Idee | Machbar | Aufwand | Store-Release | Stack-Konflikt |
|---|---|---|---|---|---|
| 2.1 | Teilen-Link + Deep Link | ja | M (4–5 PT) | ja (iOS + Android) | Link-Vorschau mit Gruppenname: **ja** |
| 2.2 | Erinnerungen | ja, nur tagesgenau | M (4–5 PT) | nein | Uhrzeit-Erinnerung: Schema fehlt |
| 2.3 | Globaler Offline-Zustand | ja | S Banner / M mit Lese-Cache | nein | Offline-Schreiben: **ja** |
| 2.4 | Zusage/RSVP | ja | S–M (2–3 PT) | nein | nein |
| 2.5 | Terminabstimmung | ja | M (3–4 PT) via PROJ-14 | nein | widerspricht PROJ-7-Entscheidung (Produkt, nicht Stack) |
| 2.6 | 2 statt 3 Rollen | ja, riskant | S (nur UI) / M (Migration) | nein | Abwärtskompatibilität alter App-Versionen |
| 2.7 | Vorschlagslimit lockern | erledigt | 0 PT | nein | nein |
| 2.8 | Reaktionen auf Kommentare | ja | S (2 PT) | nein | nein |
| 2.9 | Gruppen-Ziele | ja | M (3–5 PT) | nein | Überschneidung mit Momentum |
| 2.10 | „Was steht an“-Startseite | ja | S–M (2–3 PT) | nein | nein |
| 2.11 | Web-Push | ja, nur Web | M–L (5–6 PT) | nein | im WebView: **ja** |

### 2.1 Teilen-Link mit Deep Link — M, 4–5 PT
- **Link:** `https://<web-domain>/join/?code=ABC123`. Neue statische Seite `src/app/join/page.tsx`, liest `code` per `useSearchParams`/`useSyncExternalStore`. Der 6-stellige Code bleibt (Eingabe, Kopieren, Neu generieren); der Link ist nur eine Verpackung.
- **Ablauf:** Eingeloggt → Bestätigungsseite „Gruppe beitreten?“ → bestehende RPC `join_group_by_invite_code` (Rate-Limit `invite_code_attempts` greift weiter). Nicht eingeloggt → Code in `localStorage` (Web) bzw. `@capacitor/preferences` (nativ) sichern, Login/Signup, danach zurück auf `/join/`. Achtung Double-Opt-In: Bestätigungslink öffnet oft anderen Browser → Code geht verloren; daher Code zusätzlich im `emailRedirectTo` (`/auth/callback?next=/join/?code=…`) mitgeben, `next` nur als relative Pfad-Whitelist zulassen (Open-Redirect).
- **Universal Links (iOS):** `public/.well-known/apple-app-site-association` (ohne Endung, `applinks` mit Pfad `/join/*`). Vercel muss sie als `application/json` ohne Redirect ausliefern → `vercel.json`-Header nötig (existiert noch nicht). Im Build prüfen, dass `out/.well-known/` entsteht. App: `App.entitlements` mit `com.apple.developer.associated-domains = applinks:<web-domain>`, Capability im Developer-Portal, neues Provisioning-Profil.
- **App Links (Android):** `public/.well-known/assetlinks.json` (Paketname + SHA-256 des Play-App-Signing-Zertifikats; öffentlich, kein Geheimnis, gehört trotzdem nicht in Doku-Texte). Zusätzlicher `intent-filter android:autoVerify="true"` mit `https`, `host=<web-domain>`, `pathPrefix=/join`.
- **App-Seite:** `deep-link.ts` ignoriert heute alles außer dem Auth-Scheme. Neuer Zweig in `appUrlOpen`/`getLaunchUrl`: `https://<web-domain>/join/?code=…` → `window.location.href = '/join/?code=…'` (lokales Bundle; die Static-Router-Fixes in `MainViewController.swift`/`NextStaticWebViewClient.java` lösen `/join/` auf). Launch-URL-Guard wiederverwenden.
- **Fallback:** Kein App installiert oder In-App-Browser (Instagram u. a.) öffnet die Web-Seite → dort beitreten im Web + Hinweis „App laden“. Kein Smart-Banner-Zwang.
- **Stack-Konflikt:** Eine Link-Vorschau (Open Graph) mit Gruppenname/Avatar pro Code braucht serverseitiges HTML → **widerspricht Static Export**. Machbar ist nur eine generische Vorschau („Du wurdest zu Mellon eingeladen“). Eine Gruppen-Vorschau auf der Join-Seite (vor dem Beitritt) bräuchte eine neue SECURITY-DEFINER-RPC `preview_invite_code` → zeigt Nicht-Mitgliedern den Gruppennamen; Entscheidung bei Sicherheit & QA.

### 2.2 Erinnerungen — M, 4–5 PT
- **Takt:** `pg_cron` (Erweiterung aktivieren) ruft täglich eine SQL-Funktion `dispatch_due_reminders()` auf. Cron läuft in UTC → Ziel 09:00 Europe/Berlin über Sommer-/Winterzeit hinweg: stündlich laufen und in der Funktion auf lokale Stunde prüfen, oder 07:00 UTC fest akzeptieren.
- **Arten (tagesgenau):** Termin morgen (`start_date = heute+1`, Status `planung_abgeschlossen`), offene Verantwortlichkeit ≤ 2 Tage vor Termin, Vorschlag ohne eigenen Vote seit 3 Tagen (optional, Nerv-Risiko). Manuelles „Anstupsen“ als RPC mit Limit 1×/24 h je Aktivität.
- **Tabelle:** `activity_reminders_sent(activity_id, user_id, kind, sent_on date, primary key(activity_id,user_id,kind,sent_on))` als Dedupe; RLS: nur eigene Zeilen lesbar, Schreiben nur durch die Funktion (SECURITY DEFINER, `search_path=''`). Für konfigurierbare Zeitpunkte später `activity_reminder_settings`.
- **Versand:** Funktion legt Zeilen in `notifications` an und ruft wie `proj10_dispatch_push` per `net.http_post` + Vault-Secret `send-push` auf. Neuer Event-Typ `reminder` in `send-push/logic.ts` **und** `lib/notification-types.ts` (Liste doppelt pflegen) + Präferenz-Schalter; Resend-E-Mail nur bei Opt-in, Abmelde-Link wie bisher.
- **Grenze:** Ohne Uhrzeit keine „2 h vorher“-Erinnerung. Lokale Notifications (`@capacitor/local-notifications`) wären ein neues natives Plugin → Store-Release; nicht nötig.

### 2.3 Globaler Offline-Zustand — S (Banner) / M (mit Lese-Cache)
- **Erkennung:** Web `navigator.onLine` + `online`/`offline`-Events, nativ `@capacitor/network` (vorhanden). `navigator.onLine` meldet „online“ auch ohne Internet → zusätzlich Netzfehler von supabase-js (`TypeError: Failed to fetch`) als Offline-Signal zählen. Ein Hook `useConnectivity` (`useSyncExternalStore`), `NativeNetworkBanner` wird plattformübergreifend.
- **Verhalten:** Banner + Schreib-Buttons deaktiviert mit Hinweis statt Fehler-Toast-Kaskade; Realtime-Kanäle nach Reconnect neu laden.
- **Lese-Cache (M):** letzte Antwort je Schlüssel (Gruppenliste, „Was steht an“, Board der letzten Gruppe) in `localStorage`/IndexedDB, Anzeige mit „Stand: vor 2 h“. Nicht für Kommentare/Fotos (Signed URLs laufen ab). Cache bei Logout löschen (Gerätewechsel, Datenschutz).
- **Stack-Konflikt:** Offline-Schreiben mit späterer Synchronisation (Queue, Konfliktauflösung gegen RLS/Trigger wie `guard_activity_workflow`) hat keine Grundlage im Stack (kein lokaler DB-Sync) → nicht in Mockups versprechen.

### 2.4 Zusage/RSVP — S–M, 2–3 PT
- Tabelle `activity_attendance(activity_id → activities on delete cascade, user_id → profiles on delete cascade, status text check in ('yes','maybe','no'), updated_at, primary key(activity_id,user_id))`, Index auf `activity_id`.
- RLS: SELECT `is_activity_group_member(activity_id)`; INSERT/UPDATE/DELETE nur `user_id = auth.uid()` und Mitglied. Ehemalige Mitglieder verlieren Zugriff analog `sec_former_members_lose_access`.
- Realtime-Abo je offener Aktivität; Avatare „dabei/vielleicht“ im Detail und auf der Karte (Zähler per Join, kein N+1). Optional als Signal für Erinnerungen (nur „yes“/„maybe“ erinnern).

### 2.5 Terminabstimmung mit Optionen — M, 3–4 PT (Wiederverwendung PROJ-14)
- Umfragen existieren (`activity_polls`, `activity_poll_options`, `activity_poll_votes`, Realtime-Kanal `polls:<activityId>`, Mehrfachauswahl). Erweiterung: `activity_polls.kind in ('text','date')`, `activity_poll_options.start_date/end_date`. Ergebnis: Admin/Initiator übernimmt Gewinner-Option → setzt `activities.start_date/end_date` (über bestehende Rechte/`guard_activity_workflow`), bestehender `date_set`-Push feuert.
- Verfügbarkeits-Overlay (PROJ-7) bleibt als Entscheidungshilfe neben den Optionen.
- Eigene Tabellen (`date_polls`, …) wären L (6–8 PT) ohne Mehrwert.
- Hinweis: PROJ-7 schließt Doodle-Stil explizit aus → Produktentscheidung (Leitung), kein Stack-Konflikt.

### 2.6 Vereinfachtes Rollenmodell — S (UI) / M (Migration, 3–5 PT)
- Heute `group_members.role check in ('admin','editor','observer')`, Default `editor`; Rollen in 5 Migrationen (RLS, Rate-Limit, Spaltenschutz) und 6 Quelldateien referenziert.
- **Variante UI (S):** DB unverändert; UI zeigt „Admin“ und „Mitglied“ (= editor), `observer` wird nicht mehr vergeben, Bestandsfälle als „Mitglied (nur ansehen)“ sichtbar.
- **Variante Migration (M):** `observer → editor` (erweitert Rechte ohne Zustimmung → kurze Info an Betroffene), Check-Constraint auf `('admin','member')`, alle Policies neu, Typen regenerieren. Letzter Admin verlässt Gruppe → Trigger macht ältestes Mitglied zum Admin (ersetzt manuelle Übergabe).
- **Risiko:** Alte Store-Builds im Feld senden/prüfen weiter `editor`/`observer` → Migration nur mit Übergangsphase (beide Werte akzeptieren) und erst nach erzwungenem Update bzw. aktiver OTA. Empfehlung: zuerst UI-Variante.

### 2.7 Vorschlagslimit lockern — 0 PT
Bereits umgesetzt (siehe Abschnitt 1). Nur Texte/Hilfen prüfen, die das Limit noch nennen.

### 2.8 Reaktionen auf Kommentare — S, 2 PT
- `activity_comment_reactions(comment_id → activity_comments on delete cascade, user_id, emoji text check in (feste Liste, 5–6 Werte), created_at, primary key(comment_id,user_id,emoji))`.
- RLS über neue Helper-Funktion `is_comment_group_member(comment_id)` (SECURITY DEFINER wie bestehende Helper, vermeidet Rekursion). Laden per Join mit den Kommentaren, Realtime optional (Kommentare laufen heute ohne eigenen Kanal → Refetch genügt).
- Feste Auswahl statt freiem Emoji-Picker: keine Moderation, keine Darstellungsprobleme, kleiner Code.

### 2.9 Gemeinsame Gruppen-Ziele — M, 3–5 PT
- `group_goals(id, group_id, title, metric check in ('completed_activities','new_members',…), target int, period_start, period_end, created_by)`; Fortschritt nicht speichern, sondern ableiten (Zählung über `activities.completed_at`, wie `refresh_group_momentum`).
- RLS: Lesen Mitglieder, Schreiben Admin (oder alle, je nach 2.6).
- Überschneidung mit PROJ-15 Momentum (kumulativ, kein Verfall): Ziele mit Frist dürfen keinen Verlust-Druck erzeugen (Ablauf = „neues Ziel setzen“, kein Scheitern-Zustand). Abstimmung mit Design.

### 2.10 „Was steht an“-Startseite — S–M, 2–3 PT
- RLS filtert bereits auf eigene Gruppen → eine Abfrage reicht: `activities` mit `groups(name)` `in status ('in_planung','planung_abgeschlossen')`, `start_date >= heute`, `order(start_date)`, `limit(20)`. Dazu vorhandener Hook `useMyOpenResponsibilities`.
- „Vorschläge ohne meinen Vote“ braucht Anti-Join → RPC `get_my_agenda()` (SECURITY INVOKER, damit RLS gilt) liefert alles in einem Round-Trip. Index `activities(status, start_date)`.
- Route: `app/page.tsx` leitet heute nur weiter; neue statische Seite `/home/` oder `/` selbst. Ideal für Lese-Cache (2.3).

### 2.11 Web-Push — M–L, 5–6 PT
- **Möglich im Static Export:** `public/sw.js` wird mit ausgeliefert; Registrierung nur im Web (`!isNativePlatform()`). `device_tokens.platform` erlaubt bereits `'web'`. Versand: Web-Push-Protokoll mit VAPID (Schlüssel nur als Function-Secret) in `send-push` oder FCM-Web.
- **Abwägung:** iOS-Safari liefert Web-Push nur an installierte Home-Bildschirm-Web-Apps (Web-App-Manifest nötig, existiert nicht). Service Worker ohne `fetch`-Handler halten, sonst Cache-Probleme bei jedem Vercel-Deploy. Zweiter Versandkanal = mehr Fehlerfälle (abgelaufene Subscriptions aufräumen).
- **Stack-Konflikt:** Im Capacitor-WebView keinen Service Worker registrieren (nativ gibt es FCM/APNs; doppelte Pushes, WKWebView-Einschränkungen).
- Empfehlung: nach Erinnerungen (2.2), Desktop-Nutzer bis dahin über E-Mail-Opt-in.

### Weitere Stack-Grenzen für Mockups
- Keine Volltextsuche serverseitig gerendert; clientseitige Suche über geladene Daten oder Postgres-`ilike`/`tsvector` per RPC (machbar).
- Realtime-Presence („wer schaut gerade“) ist machbar, kostet aber Kanäle und Akku → nur wenn Nutzen klar.
- Bilder: `images.unoptimized` → `next/image` optimiert **nicht** (Hinweis in `docs/production/performance.md` gilt hier nicht). Vorschaubilder müssen beim Upload clientseitig erzeugt werden.

## 3. Performance- und Nachhaltigkeitsbudget

### 3.1 App
| Bereich | Budget | Befund / Maßnahme |
|---|---|---|
| JS initial je Route | ≤ 200 KB gzip (First Load), Ziel Lighthouse Mobil > 90 | Im Repo gibt es **keinen** `next/dynamic`-Import. Tiptap (`ActivityDetailSheet`), `canvas-confetti` (`MomentumCelebration`) und `html-to-image` (`wrapped-share.ts`) werden statisch importiert → per `dynamic()` bzw. `await import()` erst bei Bedarf laden. Messen mit `npm run build`-Ausgabe. |
| Neue Features | je Feature ≤ +15 KB gzip | RSVP, Reaktionen, Offline-Hook ohne neue Bibliotheken; kein Emoji-Picker-Paket. |
| Schriften | ≤ 120 KB woff2 gesamt | `src/fonts/`: Hanken 48 KB + Source Serif 4 99 KB = 147 KB. Source Serif auf Latin subsetten (~50 %), `font-display: swap`, nur die genutzten Achsen. |
| Bilder | Upload ≤ 400 KB, max. 1600 px Kante, WebP/JPEG q≈0,8; Vorschau ≤ 40 KB | Clientseitig vor Upload komprimieren. Signed URLs je Sitzung wiederverwenden (`useSignedUrls`), sonst Cache-Miss bei jedem Laden. Logos als SVG (E-04). |
| Animationen | nur `transform`/`opacity`, ≤ 400 ms, keine Layout-Animationen | `prefers-reduced-motion`: kein Konfetti, kein Karten-Flip, Übergänge als Überblendung ≤ 150 ms. `backdrop-blur` nur auf Nav und Sheet-Overlay (teuer auf schwachen Android-Geräten). |
| Netzwerk | alle Listen mit `.limit()`, Joins statt N+1, ≤ 3 Realtime-Kanäle je Ansicht | Kanäle beim Unmount schließen; kein Polling. |
| Hintergrund | Cron ≤ 1×/h, Benachrichtigungen bündeln | Ein Reminder je Aktivität und Art; Digest statt Einzel-Push wo möglich (spart Geräte-Wakeups). |
| Dark Mode | vorhanden | Spart auf OLED Energie; Mockups zeigen beide Modi. |

### 3.2 Mockups (`mockups/optimierung/mockup-{a,b,c}.html`)
| Bereich | Budget |
|---|---|
| Datei gesamt | ≤ 1 MB je HTML inkl. Base64 (Base64 = +33 %) |
| Schriften | ≤ 300 KB Base64 je Datei. A: Hanken + Source Serif ≈ 196 KB; B: Nunito ≈ 55 KB; C: Bricolage + Hanken ≈ 120 KB (aus woff2-Größen hochgerechnet) |
| CSS / JS / Demodaten | ≤ 80 KB / ≤ 150 KB / ≤ 40 KB unkomprimiert |
| Grafiken | nur Inline-SVG (Icon-Sprite ≤ 40 KB), Avatare als Initialen/SVG, keine Raster-Bilder |
| Netzwerk | 0 Requests: kein CDN, keine Webfonts von außen, kein `fetch`. Absichern per `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:">` und Playwright-Test, der alle Requests außer der Datei selbst zählt (= 0) |
| Bewegung | wie App: `transform`/`opacity`, `prefers-reduced-motion` respektiert, Schalter im Info-Panel |
| Zustände | je Hauptansicht: geladen, lädt (Skeleton), leer, Fehler, offline |

## 4. Release-Aspekte

| Änderung | OTA (Capgo) | Store-Release | Backend-Deploy |
|---|---|---|---|
| UI, neue statische Seiten (`/join/`, `/home/`), Offline-Banner Web+nativ, RSVP-/Reaktions-/Ziele-UI, Rollen-Variante UI | ja* | nein | – |
| Neuer Zweig in `deep-link.ts` | ja*, wirkt aber erst mit nativen Link-Einstellungen | – | – |
| Universal Links iOS: `App.entitlements` (Associated Domains), App-ID-Capability, Provisioning | nein | **ja** | AASA auf Vercel (`public/.well-known/` + `vercel.json`-Header) |
| App Links Android: `intent-filter autoVerify=true` (https, Host, `/join`) | nein | **ja** | `assetlinks.json` auf Vercel |
| Neue native Plugins (z. B. local-notifications) | nein | **ja** | – |
| Tabellen, RLS, RPCs, `pg_cron`, Edge Functions, neuer Push-Typ | – | nein | Migration + Function-Deploy, unabhängig vom App-Release |
| Web-Push | – (nur Web, Push auf `main`) | nein | VAPID-Secret, `send-push` |

\* OTA erst nach Aktivierung (`autoUpdate: true`, Capgo-Konto, Schlüsselpaar). Bis dahin gilt für native Nutzer jede Web-Änderung als Store-Release. OTA-Bundles, die einen neuen nativen Stand voraussetzen, über Capgo-Mindestversion sperren.

**Reihenfolge-Regeln:** Backend immer abwärtskompatibel ausrollen (alte Store-Builds bleiben im Feld). `.well-known`-Dateien vor dem Store-Release live schalten (Apple liest die AASA bei Installation/Update). Store-Review: OTA ändert nur Web-Inhalte, keinen App-Zweck (Apple-Richtlinie zu nachgeladenem Code beachten).

## 5. Umsetzbarkeit mit shadcn/ui + Tailwind

Vorhanden in `src/components/ui/`: accordion, alert, alert-dialog, avatar, badge, breadcrumb, button, calendar, card, checkbox, collapsible, command, dialog, dropdown-menu, form, input, label, navigation-menu, pagination, popover, progress, radio-group, **responsive-modal**, scroll-area, select, separator, sheet, sidebar, skeleton, sonner, switch, table, tabs, textarea, toast/toaster, tooltip.

| Mockup-Muster | Komponente(n) | Hinweis |
|---|---|---|
| Bottom-Sheet mobil / Dialog Desktop (Vorschlag, Teilen, RSVP-Details, Terminoptionen, Erinnerung einstellen) | `responsive-modal` (+ `useSheetDrag`) | Ein Radix-Dialog, Umschaltung rein per CSS bei `md` (768 px). Mockups schalten bei 720 px (E-07) → für Treue auf 768 px angleichen. |
| Seitenpanel Desktop (Benachrichtigungen, Aktivitäts-Detail rechts) | `sheet` | |
| Navigation Desktop / Mobil | `sidebar`, `navigation-menu`; Tab-Bar = bestehende Komposition `GroupBottomNav` | Variante C (neue IA) ändert nur Kompositionen, keine Primitive. |
| Board-Spalten mobil, Profil/Album | `tabs`, `scroll-area` (horizontal) | |
| Aktivitäts-/Agenda-Karten | `card`, `badge` (Status), `avatar` (Teilnehmer-Stapel) | |
| Zusage Ja/Vielleicht/Nein (Segment) | `radio-group` gestylt oder **`toggle-group` nachinstallieren** (`npx shadcn@latest add toggle-group`) | Nicht selbst bauen. |
| Terminoptionen wählen | `calendar` (react-day-picker, Mehrfachauswahl), `checkbox`, `progress` für Ergebnis | |
| Reaktionen | `popover` (Auswahl), `button` variant ghost als Chip, `tooltip` (Desktop: wer reagiert hat) | |
| Gruppen-Ziel, Momentum | `progress`, `card` | |
| Offline-/Hinweisleiste | `alert` (inline), bestehender Banner; Toasts über `sonner` | |
| Bestätigungen (Beitreten, Verlassen, Rolle ändern) | `alert-dialog` | |
| Einstellungen Erinnerungen/Push | `switch`, `select`, `accordion`/`collapsible` | |
| Schnellsuche / Gruppenwechsel (C) | `command` | |
| Ladezustand | `skeleton` | |
| ⋯-Menü Statuswechsel | `dropdown-menu` | |

Fehlend, aber nicht nötig: `drawer` (vaul) — `responsive-modal` deckt es ab; `carousel` — `scroll-area` mit Scroll-Snap genügt. Alle Muster sind ohne eigene Primitive umsetzbar; neue Komponenten sind reine Fach-Kompositionen.

# PROJ-12: Benachrichtigungen & Einstellungen (In-App-Center + E-Mail + Pro-Typ-Schalter)

## Status: Deployed
**Created:** 2026-07-04
**Last Updated:** 2026-07-04

## Dependencies
- Requires: **PROJ-2 (Authentifizierung & User Accounts)** — Benachrichtigungen und Einstellungen sind pro eingeloggtem Nutzer; RLS pro `user_id`.
- Requires: **PROJ-8 (Nutzerprofil & Archiv)** — die Pro-Typ-Schalter leben als neue Sektion im bestehenden `ProfileSheet` (Profil-Tab).
- Requires / baut auf: **PROJ-10 (Push-Benachrichtigungen)** — nutzt exakt dieselben 5 Ereignisse und dieselbe Server-Pipeline (`send-push` Edge Function, Database Webhooks, `device_tokens`). PROJ-12 erweitert diese Pipeline von „nur Push" auf einen **Fan-out an drei Kanäle** (In-App, Push, E-Mail), gesteuert durch Nutzer-Präferenzen.
- Verwandt: **PROJ-13 (Onboarding-Flow)** — der Push-Soft-Ask bleibt in PROJ-13; PROJ-12 fügt keine Onboarding-Schritte hinzu.

## Ziel / Definition of Done
Nutzer bekommen einen **zentralen, gruppenübergreifenden In-App-Posteingang** (Glocke oben rechts) mit Historie, Gelesen-Status und ungelesen-Badge, der bei jedem der 5 Gruppen-Ereignisse einen Eintrag erhält — **verlustfrei**, auch im Web (nicht nur nativ). Zusätzlich kann jeder Nutzer **pro Ereignis-Typ** feingranular steuern, ob er zusätzlich **Push** und/oder **E-Mail** erhält. E-Mail ist ein neuer Kanal (bislang gab es nur natives Push).

PROJ-12 ist „fertig", wenn: (1) jedes der 5 Ereignisse einen In-App-Eintrag für jeden korrekten Empfänger erzeugt; (2) die Glocke die ungelesene Gesamtzahl live anzeigt und Antippen eines Eintrags navigiert + als gelesen markiert; (3) die bestehende Push-Pipeline die Pro-Typ-Push-Präferenz respektiert (kein Push, wenn abgeschaltet); (4) aktivierte E-Mail-Kanäle sofort pro Ereignis eine deutsche E-Mail mit Deep-Link + Abmelde-Link auslösen; (5) alle Präferenzen in einer neuen Sektion im Profil bearbeitbar und persistent sind.

## User Stories
- Als Gruppenmitglied möchte ich an einer zentralen Stelle sehen, was seit meinem letzten Besuch in **all meinen Gruppen** passiert ist, damit ich nichts verpasse, ohne jede Gruppe einzeln durchzugehen.
- Als Nutzer möchte ich an einem Badge erkennen, **wie viele** ungelesene Benachrichtigungen ich habe, damit ich weiß, ob es etwas Neues gibt.
- Als Nutzer möchte ich eine Benachrichtigung antippen und **direkt an die richtige Stelle** (Gruppe/Aktivität) gelangen; danach gilt sie als gelesen.
- Als Nutzer möchte ich **pro Ereignis-Typ einzeln** festlegen, ob ich zusätzlich Push und/oder E-Mail bekomme, damit ich nur bei den für mich wichtigen Dingen „laut" benachrichtigt werde.
- Als Nutzer, der die App überwiegend im **Web** nutzt (kein Push), möchte ich per E-Mail und über das In-App-Center auf dem Laufenden bleiben.
- Als Nutzer möchte ich E-Mails mit **einem Klick abbestellen** können, ohne mich einloggen zu müssen, damit ich die Kontrolle über meinen Posteingang behalte.
- Als Nutzer möchte ich alle Benachrichtigungen **auf einmal als gelesen** markieren können, damit ich das Badge schnell leeren kann.

## Out of Scope
- **Neue Ereignis-Trigger** über die 5 bestehenden hinaus (z. B. „neues Mitglied", „Aktivität abgeschlossen", „Kommentar ohne @", „jemand hat für deinen Vorschlag gestimmt") — bewusst ausgelassen, um auf der PROJ-10-Pipeline aufzusetzen. Später nachrüstbar.
- **In-App-Kanal abschaltbar machen** — das In-App-Center erhält bewusst **immer alles** (verlustfreie Historie). Die Pro-Typ-Schalter regeln nur Push und E-Mail. (Siehe Product Decision.)
- **E-Mail-Digest / gebündelte Zusammenfassungen / Ruhezeiten** — E-Mail ist im MVP sofort-pro-Ereignis. Digest ist ein späteres Feature.
- **Web-Push (Browser-Benachrichtigungen)** — weiterhin nicht Teil des Produkts; Push bleibt nativ-only (PROJ-10). Web-Nutzer werden über In-App-Center + E-Mail erreicht.
- **Reichhaltige Benachrichtigungen / Action-Buttons** in Push oder E-Mail (z. B. direkt abstimmen) — nicht im MVP (bereits in PROJ-10 ausgeschlossen).
- **App-Icon-Badge-Zähler (nativ)** — nicht im MVP (bereits in PROJ-10 ausgeschlossen); PROJ-12 liefert nur das In-App-Glocken-Badge.
- **Benachrichtigungen für System-/Konto-Ereignisse** (z. B. „Passwort geändert", „neues Gerät eingeloggt") — nur Gruppen-Aktivitäts-Ereignisse.
- **Onboarding-Änderungen** — der Push-Soft-Ask bleibt in PROJ-13; PROJ-12 ergänzt keinen Onboarding-Schritt.
- **Push-Erlaubnis-Handling / Token-Verwaltung** — bleibt in PROJ-10 (`device_tokens`, `PushNotificationSection`). PROJ-12 fügt nur die Pro-Typ-Präferenz-Ebene darüber hinzu.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### In-App-Center (Glocke, Historie, Badge)
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er die App öffnet, dann sieht er oben rechts (neben dem Avatar, auf „Meine Gruppen" und in der Gruppen-Ansicht) ein Glocken-Icon.
- [ ] Angenommen es gibt ungelesene Benachrichtigungen, wenn der Nutzer die Kopfzeile sieht, dann zeigt die Glocke ein Badge mit der **gruppenübergreifenden** ungelesenen Gesamtzahl (mehrstellige Zahlen werden ab einer Grenze als „9+"/„99+" o. ä. gekürzt).
- [ ] Angenommen der Nutzer tippt auf die Glocke, wenn sich das Center öffnet, dann sieht er eine chronologische Liste (neueste zuerst) seiner Benachrichtigungen aus **allen** Gruppen mit Titel, Kurztext und relativer Zeitangabe; ungelesene sind visuell hervorgehoben.
- [ ] Angenommen ein Eintrag ist ungelesen, wenn der Nutzer ihn antippt, dann wird er als gelesen markiert **und** die App navigiert zum passenden Kontext (Gruppe/Aktivität) über dasselbe Deep-Link-Ziel-Format wie PROJ-10.
- [ ] Angenommen es gibt mehrere ungelesene Einträge, wenn der Nutzer „Alle als gelesen markieren" wählt, dann werden alle seine Benachrichtigungen als gelesen markiert und das Badge verschwindet.
- [ ] Angenommen der Nutzer hat noch keine Benachrichtigungen, wenn er das Center öffnet, dann sieht er einen freundlichen Leerzustand statt einer leeren Liste.
- [ ] Angenommen ein neues Ereignis erzeugt eine Benachrichtigung für den Nutzer, wenn die App geöffnet ist, dann erscheint der Eintrag **live** (Supabase Realtime) und das Badge zählt hoch, ohne dass der Nutzer neu laden muss.

### Ereignis → Kanal-Fan-out (Empfänger identisch zu PROJ-10)
- [ ] Angenommen eines der 5 Ereignisse tritt ein (neuer Vorschlag, wird geplant, Termin steht, @-Erwähnung, Verantwortung erhalten), wenn die Server-Pipeline es verarbeitet, dann wird für **jeden korrekten Empfänger** (aktuelle Gruppenmitglieder bzw. Erwähnte/Zugewiesene, **ohne** den Auslöser) ein In-App-Eintrag erzeugt.
- [ ] Angenommen ein Empfänger hat für dieses Ereignis den **Push-Schalter aktiv** und ein gültiges Geräte-Token, wenn das Ereignis eintritt, dann erhält er zusätzlich eine native Push (wie PROJ-10).
- [ ] Angenommen ein Empfänger hat für dieses Ereignis den **Push-Schalter deaktiviert**, wenn das Ereignis eintritt, dann erhält er **keine** Push — bekommt aber weiterhin den In-App-Eintrag.
- [ ] Angenommen ein Empfänger hat für dieses Ereignis den **E-Mail-Schalter aktiv**, wenn das Ereignis eintritt, dann erhält er zeitnah eine deutsche E-Mail mit Name des Auslösers, Aktivitäts-/Gruppentitel, einem Link in die App und einem Abmelde-Link.
- [ ] Angenommen ein Empfänger hat für dieses Ereignis den **E-Mail-Schalter inaktiv** (Standard), wenn das Ereignis eintritt, dann erhält er **keine** E-Mail.
- [ ] Angenommen der Auslöser löst das Ereignis selbst aus, wenn die Benachrichtigungen erzeugt werden, dann erhält er **weder** In-App-Eintrag **noch** Push **noch** E-Mail über die eigene Aktion.

### Pro-Typ-Einstellungen
- [ ] Angenommen der Nutzer öffnet im Profil-Tab die Sektion „Benachrichtigungen", wenn sie geladen ist, dann sieht er pro Ereignis-Typ (5 Zeilen) je einen Schalter für **Push** und einen für **E-Mail**.
- [ ] Angenommen ein Nutzer hat noch nie Präferenzen gesetzt, wenn er die Sektion erstmals öffnet, dann sind die **Push-Schalter standardmäßig an** (verhält sich wie PROJ-10 heute) und die **E-Mail-Schalter standardmäßig aus** (Opt-in).
- [ ] Angenommen der Nutzer schaltet einen Schalter um, wenn die Änderung gespeichert ist, dann gilt sie sofort für künftige Ereignisse und bleibt nach App-Neustart erhalten.
- [ ] Angenommen der Nutzer ist im **Web** (kein Push möglich), wenn er die Sektion öffnet, dann sind die E-Mail-Schalter voll nutzbar; Push-spezifische Bedienung folgt der bestehenden PROJ-10-Logik (Push-Aktivierung ist native-only).
- [ ] Angenommen die Speicherung der Präferenz schlägt fehl (Netzwerkfehler), wenn der Nutzer einen Schalter umlegt, dann wird der vorherige Zustand wiederhergestellt und ein Fehlerhinweis angezeigt.

### E-Mail-Kanal
- [ ] Angenommen eine E-Mail wird erzeugt, wenn sie zugestellt wird, dann ist sie auf Deutsch, nennt (soweit verfügbar) Auslöser + Titel und enthält einen Link, der in der App/Web zum passenden Kontext führt.
- [ ] Angenommen der Nutzer klickt in einer E-Mail auf „Abmelden", wenn der Link geöffnet wird, dann werden künftige E-Mails für ihn deaktiviert **ohne** dass ein Login nötig ist, und er sieht eine Bestätigung.

## Edge Cases
- **Benachrichtigung zu nicht mehr zugänglichem Inhalt** (Aktivität gelöscht, Nutzer aus Gruppe entfernt): Antippen im Center fängt das genauso ab wie ein Push-Tap in PROJ-10 (verständlicher Hinweis / „Gruppe nicht gefunden"-Fallback, kein Whitescreen). Der Eintrag bleibt in der Historie, führt aber ins Leere-Handling.
- **Nutzer aus Gruppe ausgetreten, bevor er ältere Einträge liest:** bereits erzeugte In-App-Einträge bleiben sichtbar (Historie), aber es entstehen **keine neuen** Einträge für Ereignisse dieser Gruppe (Empfängerkreis = aktuelle Mitgliedschaft, wie PROJ-10).
- **Alle Kanäle für ein Ereignis aus (Push aus, E-Mail aus):** der In-App-Eintrag wird **trotzdem** erzeugt (In-App ist immer an) — der Nutzer verliert nie die Historie, nur die „lauten" Kanäle.
- **Massen-/gleichzeitige Ereignisse:** mehrere Ereignisse kurz hintereinander erzeugen mehrere In-App-Einträge, ggf. mehrere Push/E-Mails (kein Digest im MVP). Die Pipeline muss zuverlässig genau einen Eintrag pro Ereignis pro Empfänger erzeugen (keine Doppelzustellung desselben Ereignisses).
- **Realtime-Verbindung fällt weg** (schlechtes Netz, App im Hintergrund): beim nächsten Öffnen/Laden wird der aktuelle Stand nachgeladen, sodass keine Benachrichtigung dauerhaft „unsichtbar" bleibt.
- **Präferenz existiert noch nicht in der DB:** fehlende Präferenz wird als Standard interpretiert (Push an, E-Mail aus) — kein Fehler, kein leerer Zustand.
- **E-Mail-Zustellung schlägt fehl / Rate-Limit:** ein fehlgeschlagener E-Mail-Versand darf weder den In-App-Eintrag noch die Push blockieren; Fehler werden serverseitig geloggt, die übrigen Empfänger/Kanäle laufen weiter.
- **Historie wächst unbegrenzt:** ältere Einträge werden automatisch begrenzt (z. B. 30 Tage / letzte N pro Nutzer — genaue Grenze in `/architecture`), damit Tabelle und Liste übersichtlich bleiben.
- **Badge-Zahl sehr groß:** die Anzeige wird gekürzt (z. B. „99+"), damit die Kopfzeile nicht bricht.

## Technical Requirements (optional)
- **Plattform-Reichweite:** In-App-Center + E-Mail funktionieren **im Web und nativ**. Push bleibt nativ-only hinter `isNativePlatform()` (unverändert aus PROJ-10). Dies ist die erste Benachrichtigungs-Oberfläche für Web-Nutzer.
- **Server-Pipeline-Erweiterung:** Die bestehende `send-push` Edge Function (bzw. eine daraus hervorgehende Benachrichtigungs-Funktion) muss den Empfängerkreis wie bisher ermitteln und dann **pro Empfänger** die Präferenzen konsultieren: In-App-Eintrag immer schreiben, Push nur bei aktivem Push-Schalter senden, E-Mail nur bei aktivem E-Mail-Schalter senden. Auslöser-Ausschluss bleibt serverseitig und zentral.
- **Datenmodell (Details in `/architecture`):** neue Tabelle für In-App-Benachrichtigungen (pro Nutzer, Gelesen-Status, Deep-Link-Daten, Zeitstempel) + neue Tabelle/Struktur für Pro-Typ-Präferenzen (pro Nutzer × Ereignis × Kanal). RLS: Nutzer sieht/ändert nur eigene Zeilen; Versand liest über vertrauenswürdige Service-Logik.
- **Realtime:** In-App-Badge/Liste via Supabase Realtime-Subscription auf die Benachrichtigungs-Tabelle des Nutzers.
- **Sicherheit:** kein Service-Key im Client; E-Mail-Provider-Credentials nur serverseitig. Abmelde-Link ohne Login muss fälschungssicher sein (signiertes Token, nicht erratbar).
- **Latenz:** In-App-Eintrag + Push zeitnah nach dem Ereignis (Richtwert wenige Sekunden, kein harter SLA), konsistent mit PROJ-10.

## Open Questions
- [x] **E-Mail-Versand-Provider:** → **Resend** (REST via `fetch`, Domain-Verifikation SPF/DKIM manuell, `RESEND_API_KEY` als Supabase-Secret). _Entschieden 2026-07-04._
- [x] **Exakte Aufbewahrungsgrenze:** → **30 Tage**, umgesetzt per täglichem **`pg_cron`-Job**. _Entschieden 2026-07-04._
- [x] **Abmelde-Link-Semantik:** → sichtbarer Link **führt ins In-App-Center** (Deep-Link, granulare Toggle-Steuerung); zusätzlich login-freier **`List-Unsubscribe`-Header** (signiert) schaltet alle E-Mail-Schalter aus (Deliverability). **Ändert AC Zeile 68**: der *sichtbare* Weg ist bewusst nicht mehr login-frei. _Entschieden 2026-07-04._
- [ ] **Badge-Kürzungsgrenze** (ab wann „9+" vs. „99+") → UX-Detail in `/frontend`.
- [ ] **Reihenfolge Frontend↔Backend:** Feature hat sowohl UI (Glocke, Center, Switch-Matrix) als auch Server (Pipeline-Erweiterung, E-Mail, RLS). Empfehlung: `/frontend` zuerst (Center + Einstellungen gegen die neuen Tabellen), dann `/backend` für Pipeline-Fan-out + Resend + `pg_cron` — analog zum Workflow-Standard. → beim Start von `/frontend` bestätigen.

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Ein zusammenhängendes Feature (In-App-Center + E-Mail + Pro-Typ-Schalter) statt Aufteilung | Alle drei teilen dasselbe Fundament: ein Ereignis → Fan-out an Kanäle, gesteuert durch eine gemeinsame Präferenz-Ebene. Trennung würde das geteilte Datenmodell fragmentieren. | 2026-07-04 |
| In-App-Center = persistente Liste mit Gelesen-Status + ungelesen-Badge | Anders als flüchtiges Push braucht ein Posteingang Historie; Gelesen-Status zeigt dem Nutzer, was neu ist. | 2026-07-04 |
| Dieselben 5 Ereignisse wie PROJ-10 (kein neues Ereignis-Design) | Baut direkt auf der bestehenden `send-push`-Pipeline auf → maximale Wiederverwendung, weniger Rausch-Risiko; weitere Trigger später nachrüstbar. | 2026-07-04 |
| Pro-Typ-Schalter je Ereignis × {Push, E-Mail}; **In-App immer an** | Klar verständliche Granularität; In-App als verlustfreie Historie schützt vor versehentlichem Datenverlust — Schalter regeln nur die „lauten" Kanäle. | 2026-07-04 |
| Push-Schalter standardmäßig AN, E-Mail-Schalter standardmäßig AUS (Opt-in) | Push-Default bewahrt das heutige PROJ-10-Verhalten (kein Verlust für Bestandsnutzer); E-Mail opt-in verhindert Spam und Supabase-Rate-Limit-Ärger. | 2026-07-04 |
| E-Mail sofort pro Ereignis (kein Digest im MVP) | Gleiche Echtzeit-Pipeline wie Push; Digest-Logik (Cron, Bündelung) ist deutlich aufwändiger und später nachrüstbar. | 2026-07-04 |
| Glocke gruppenübergreifend in der Kopfzeile neben dem Avatar | Ein zentraler Posteingang für alle Gruppen; der Nutzer muss nicht jede Gruppe einzeln prüfen. Jeder Eintrag deep-linkt in die richtige Gruppe. | 2026-07-04 |
| Badge/Liste live via Supabase Realtime | Passt zum client-seitigen Static-Export-Setup (kein Server nötig); Benachrichtigungen erscheinen sofort. | 2026-07-04 |
| Pro-Typ-Schalter als neue „Benachrichtigungen"-Sektion im Profil-Tab | Konsistent mit den bestehenden ProfileSheet-Sektionen (Darstellung, Push, Kalender…); kein neuer Screen nötig. | 2026-07-04 |
| In-App-Historie automatisch begrenzt (z. B. 30 Tage / letzte N) | Verhindert unbegrenztes Tabellenwachstum und hält die Liste übersichtlich; alte Einträge haben wenig Nutzen. | 2026-07-04 |
| E-Mails mit Ein-Klick-Abmelde-Link (ohne Login) | Erwartungskonform und für transaktionale/benachrichtigende Mails Best Practice (Nutzerkontrolle, Zustellbarkeit). | 2026-07-04 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| **Bestehende `send-push` Edge Function erweitern** statt neuer Funktion/Webhooks | Maximale Wiederverwendung: Empfänger-Ermittlung, Auslöser-Ausschluss, Nachrichtentext und die 5 DB-Webhooks bleiben unverändert; nur der Versand-Teil wird zum 3-Kanal-Fan-out. Kein Re-Pointing von Webhooks, geringstes Regressionsrisiko. | 2026-07-04 |
| **In-App-Eintrag zuerst und immer, Push/E-Mail bester-Aufwand danach** | Schützt die verlustfreie Historie: ein fehlgeschlagener Push/E-Mail-Versand darf den Posteingang-Eintrag nie verhindern. | 2026-07-04 |
| **Vorlieben-Tabelle: 1 Zeile pro (Nutzer × Ereignis) mit 2 Bool-Spalten (Push, E-Mail)** statt 1 Zeile pro Kanal | Kompakter (max. 5 statt 10 Zeilen/Nutzer), leichter lesbar, „alle E-Mail aus" berührt genau 5 Zeilen. | 2026-07-04 |
| **Fehlende Vorliebe = Standard (Push AN, E-Mail AUS)**, kein Backfill nötig | Versand-Logik interpretiert „keine Zeile" identisch zum Default → kein Migrations-/Leerzustands-Aufwand, bewahrt PROJ-10-Verhalten für Bestandsnutzer. | 2026-07-04 |
| **In-App-Titel/Text beim Schreiben „einfrieren"** (denormalisiert speichern) | Historie bleibt stabil und lesbar, auch wenn sich Namen/Aktivitäten später ändern oder gelöscht werden; keine Live-Joins beim Anzeigen nötig. | 2026-07-04 |
| **Deep-Link-Ziel als `{group_id, activity_id, tab}`** — identisch zum PROJ-10-Push-Target | Ein einziges Navigations-/Fallback-Format für Push-Tap und In-App-Tap (wiederverwendet `buildPushTarget`-Logik). | 2026-07-04 |
| **E-Mail-Provider: Resend** (statt Postmark/SES/Supabase-SMTP) | Einfachste Integration, faires Free-Tier, reine REST-API (kein zusätzliches Paket). Supabase-SMTP ist rate-limitiert; SES/Postmark = mehr Setup ohne aktuellen Mehrwert. | 2026-07-04 |
| **Resend via `fetch` gegen REST-API** statt npm-SDK | Vermeidet ein Edge-Function-Paket; spiegelt das bestehende FCM-`fetch`-Muster in `send-push/index.ts`. | 2026-07-04 |
| **Abmelden zweistufig: sichtbarer Link → In-App-Center (Deep-Link); `List-Unsubscribe`-Header → login-freier, signierter Ein-Klick (alle E-Mail aus)** | Erfüllt die Nutzer-Entscheidung (Steuerung im Center) UND die Deliverability-Anforderung von Gmail/Apple (login-freier List-Unsubscribe ist De-facto-Pflicht für Opt-in-Mails). | 2026-07-04 |
| **Unsubscribe-Token = HMAC über Nutzer-ID, Secret nur serverseitig** | Fälschungssicher, nicht erratbar, ohne Login ausschließlich zum E-Mail-Abschalten nutzbar. | 2026-07-04 |
| **Aufbewahrung: 30 Tage per täglichem `pg_cron`-Job** (nicht Prune-beim-Schreiben) | Reine Zeitgrenze ist als täglicher Datums-Vergleich trivial und belastet den Versand-Pfad nicht; Prune-beim-Schreiben lohnt nur bei Anzahl-Grenzen. | 2026-07-04 |
| **Live-Aktualisierung via Supabase Realtime auf der Benachrichtigungs-Tabelle, nach `user_id` gefiltert** | Passt zum Static-Export (rein client-seitig); Nachladen beim Öffnen deckt Verbindungsabbrüche ab. | 2026-07-04 |
| **Keine neuen Client-Pakete** (`switch`, `sheet`, `scroll-area`, `skeleton`, `sonner`, `date-fns` bereits vorhanden) | Reduziert Bundle- und Wartungsaufwand; alle UI-Primitives sind schon installiert. | 2026-07-04 |
| **Sekrete/Extensions als manuelle Schritte mit sauberem Degradieren** (`RESEND_API_KEY`, `UNSUBSCRIBE_SIGNING_SECRET`, `pg_cron`) | Nicht headless automatisierbar (DNS/Secrets); Feature bleibt lauffähig, solange sie fehlen — der jeweilige Kanal ruht nur (Muster wie fehlendes `FCM_SERVICE_ACCOUNT`). | 2026-07-04 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

> Ziel dieses Abschnitts: **WAS** gebaut wird und **WARUM** — ohne Code. Die genaue Umsetzung (SQL, Templates, Komponenten-Details) macht `/backend` und `/frontend`.

### Leitidee in einem Satz
Wir bauen **kein neues Benachrichtigungs-System**, sondern rüsten die bestehende PROJ-10-Push-Pipeline zu einem **Verteiler an drei Kanäle** um: dasselbe Ereignis erzeugt künftig (1) **immer** einen In-App-Posteingang-Eintrag, (2) **wahlweise** eine Push (wie heute) und (3) **wahlweise** eine E-Mail — gesteuert durch die Vorlieben jedes Empfängers.

---

### A) Komponenten-Struktur (was der Nutzer sieht)

```
Kopfzeile (Meine Gruppen + Gruppen-Ansicht)
+-- Avatar (bestehend, öffnet ProfileSheet)
+-- 🔔 Glocken-Button (NEU)
    +-- Ungelesen-Badge (gruppenübergreifende Zahl, „99+"-Kürzung)
    +-- Benachrichtigungs-Center (NEU, öffnet als Sheet/Popover)
        +-- Kopf: „Benachrichtigungen"  +  „Alle als gelesen" (Aktion)
        +-- Liste (neueste zuerst, live via Realtime)
        |   +-- Eintrag: Titel · Kurztext · relative Zeit · ungelesen-Markierung
        |       └─ Antippen → als gelesen + Deep-Link in Gruppe/Aktivität
        +-- Leerzustand (freundlich, wenn nichts da ist)

ProfileSheet › Profil-Tab (bestehend)
+-- ProfileSection · AppearanceSection (bestehend)
+-- Benachrichtigungs-Einstellungen (NEU — ersetzt/erweitert die heutige
|   „Benachrichtigungen"-Überschrift der PushNotificationSection)
|   +-- Push-Aktivierung (bestehende PushNotificationSection, unverändert)
|   +-- Pro-Typ-Matrix (NEU): 5 Zeilen (die 5 Ereignisse) × 2 Switches
|       Zeile: [Ereignis-Name]   (•) Push   (•) E-Mail
+-- CalendarConnectionSection · DateBlocksSection (bestehend)
```

**Neue Bausteine (Frontend):**
- `NotificationBell` — Glocke + Badge in der Kopfzeile, abonniert den ungelesen-Zähler live.
- `NotificationCenter` — die Liste im Sheet/Popover (nutzt `sheet` + `scroll-area`, beide vorhanden).
- `NotificationItem` — eine Zeile mit Tap→gelesen+Navigation.
- `NotificationPreferencesSection` — die 5×2-Switch-Matrix im Profil (nutzt `switch`, vorhanden).
- `useNotifications` (Hook) — lädt Historie, hält Realtime-Subscription, liefert `unreadCount`, `markRead`, `markAllRead`.
- `useNotificationPreferences` (Hook) — lädt/schreibt die Pro-Typ-Vorlieben mit optimistischem Update + Rollback bei Fehler.

**Kein neuer Screen** — die Glocke lebt in der bestehenden Kopfzeile, die Einstellungen in der bestehenden Profil-Sektion. Konsistent mit dem heutigen Aufbau.

---

### B) Datenmodell (in Alltagssprache, keine Tabellen-DDL)

**Neu: „Benachrichtigungen" (der In-App-Posteingang)**
Jeder Eintrag gehört **genau einem Empfänger** und speichert:
- wem er gehört (Nutzer),
- welches der 5 Ereignisse ihn ausgelöst hat,
- fertigen deutschen **Titel + Kurztext** (zum Zeitpunkt des Ereignisses „eingefroren", damit die Historie stabil bleibt, auch wenn sich später Namen ändern),
- das **Sprungziel** (Gruppe + Aktivität + Tab) — dasselbe Format wie der PROJ-10-Push-Deep-Link,
- **gelesen ja/nein**,
- **Zeitstempel**.
Sichtbarkeit: Jeder sieht/ändert **nur seine eigenen** Einträge. Geschrieben werden sie ausschließlich serverseitig (vertrauenswürdige Versand-Logik), nie direkt vom Client.

**Neu: „Benachrichtigungs-Vorlieben" (die Pro-Typ-Schalter)**
Pro Nutzer bis zu **5 Zeilen** — eine je Ereignis-Typ — mit zwei Ja/Nein-Werten: **Push an?** und **E-Mail an?**.
- **Fehlt** eine Zeile (Nutzer hat nie etwas umgestellt), gilt der **Standard: Push AN, E-Mail AUS**. Kein Fehler, kein Leerzustand — die Versand-Logik behandelt „keine Zeile" identisch zu „Push an, E-Mail aus".
- Sichtbarkeit: Jeder verwaltet **nur seine eigenen** Zeilen.

**Bewusst zwei Werte pro Zeile (statt eine Zeile pro Kanal):** kompakter (max. 5 statt 10 Zeilen/Nutzer), einfacher zu lesen und der „Abmelden"-Vorgang (alle E-Mail aus) berührt genau diese 5 Zeilen.

**Wiederverwendet, unverändert:** `group_members` (Empfängerkreis), `profiles` (Auslöser-Name), `device_tokens` (Push-Ziele), `activities` (Titel/Gruppe). PROJ-12 legt hier nichts an.

---

### C) Der Weg eines Ereignisses (Server-Pipeline)

Heute: DB-Webhook → `send-push` → Empfänger ermitteln → Push. **Wir erweitern genau diese eine Funktion** (kein zweiter Dienst, keine neuen Webhooks — die 5 bestehenden Trigger bleiben). Neuer Ablauf **pro Empfänger** (Auslöser wie bisher zentral ausgeschlossen):

```
Ereignis (1 von 5)  →  send-push (erweitert)
   1. Empfänger + Auslöser-Ausschluss ermitteln   [unverändert aus PROJ-10]
   2. Deutschen Titel/Text bauen                   [bestehende buildMessage-Logik, wiederverwendet]
   3. Für JEDEN Empfänger:
        a) In-App-Eintrag schreiben        → IMMER (verlustfreie Historie)
        b) Push senden                      → NUR wenn Push-Vorliebe an UND Gerät-Token vorhanden
        c) E-Mail senden (Resend)           → NUR wenn E-Mail-Vorliebe an
```

**Wichtige Garantien:**
- **In-App zuerst und immer:** Der Posteingang-Eintrag wird geschrieben, bevor die „lauten" Kanäle laufen. Schlägt Push oder E-Mail fehl (Rate-Limit, totes Token), bleibt der In-App-Eintrag bestehen — der Nutzer verliert nie die Historie.
- **Ein Eintrag pro Ereignis pro Empfänger:** keine Doppelzustellung (die Webhook-Klassifizierung bleibt dieselbe deterministische Logik wie PROJ-10).
- **Bester-Aufwand für E-Mail:** ein fehlgeschlagener Versand wird serverseitig geloggt und blockiert weder die übrigen Empfänger noch die anderen Kanäle.

---

### D) E-Mail-Kanal (Resend)

- **Provider: Resend.** Grund: einfachste Integration für ein Solo-Dev-Setup, faires Free-Tier (~3.000 Mails/Monat), reine REST-API (kein zusätzliches Paket nötig, die Edge Function ruft sie per `fetch` auf). Supabase-Auth-SMTP scheidet aus (bekanntes Rate-Limit-Problem, siehe [[project_supabase_email_rate_limit]]).
- **Manuelle Einrichtung (nicht automatisierbar, vom Nutzer zu erledigen):** Absender-Domain bei Resend verifizieren (SPF- + DKIM-DNS-Records setzen), API-Key als **Supabase-Secret** `RESEND_API_KEY` hinterlegen. Bis das erledigt ist, degradiert der E-Mail-Zweig sauber (wie heute schon der FCM-Zweig ohne `FCM_SERVICE_ACCOUNT`): kein Fehler, nur „E-Mail nicht konfiguriert".
- **Inhalt:** deutsche Mail, nennt Auslöser + Aktivitäts-/Gruppentitel, enthält (1) einen **Deep-Link** in den passenden Kontext (App/Web) und (2) einen **„Benachrichtigungen verwalten"-Link** → siehe E).
- **Kein Digest, sofort pro Ereignis** (MVP-Entscheidung aus der Spec).

---

### E) Abmelden / „Benachrichtigungen verwalten" — zweistufig

Deine Entscheidung: **Der sichtbare Link in der E-Mail führt ins In-App-Benachrichtigungs-Center**, wo der Nutzer alle Typen manuell per Toggle steuert. So umgesetzt — plus eine kleine Deliverability-Absicherung darüber:

1. **Sichtbarer Link „Benachrichtigungen verwalten"** → **Deep-Link** (Universal-/App-Link mit Web-Fallback) direkt auf die neue **Benachrichtigungs-Einstellungen im Profil**. Der Nutzer entscheidet dort granular pro Typ. Das ist die von dir gewünschte Semantik: keine stille Pauschal-Abschaltung, sondern Kontrolle in der App.
2. **Unsichtbarer `List-Unsubscribe`-Header** (technisch, für Gmail/Apple Mail): zeigt auf einen kleinen, **login-freien** Endpunkt mit **signiertem Token** (HMAC über die Nutzer-ID, Secret nur serverseitig — fälschungssicher, nicht erratbar). Klickt der Nutzer den nativen „Abbestellen"-Knopf seines Mail-Programms, werden **alle E-Mail-Schalter** dieses Nutzers ausgeschaltet. Push und In-App bleiben unberührt.

**Warum beides:** (1) erfüllt exakt deinen UX-Wunsch (Steuerung im Center), (2) ist ohne den `List-Unsubscribe`-Header landen transaktionale Opt-in-Mails schnell im Spam — dieser Header ist heute De-facto-Pflicht für gute Zustellbarkeit und braucht per Definition einen login-freien Ein-Klick-Weg.

> **Abweichung zur ursprünglichen Spec:** Acceptance-Kriterium (Zeile 68) formulierte das sichtbare „Abmelden ohne Login". Mit deiner Entscheidung wird der **sichtbare** Weg bewusst ein Deep-Link ins (eingeloggte) Center; die login-freie Ein-Klick-Abmeldung wandert in den `List-Unsubscribe`-Header. `/qa` sollte gegen diese angepasste Semantik testen.

---

### F) Live-Aktualisierung (Realtime)

Auf der neuen „Benachrichtigungen"-Tabelle wird **Supabase Realtime** aktiviert. Der Client abonniert nur die eigenen Zeilen (nach Nutzer-ID gefiltert). Neue Einträge erscheinen sofort im Center und der Badge-Zähler steigt live — ohne Neuladen. Fällt die Verbindung weg (schlechtes Netz, App im Hintergrund), lädt der Hook beim nächsten Öffnen den aktuellen Stand nach, sodass nichts dauerhaft unsichtbar bleibt. Passt zum Static-Export-Setup (rein client-seitig, kein Server nötig).

---

### G) Aufbewahrung: 30 Tage per geplantem Aufräum-Job

- **Grenze: 30 Tage** (deine Entscheidung). Einträge, die älter sind, werden automatisch entfernt.
- **Umsetzung: geplanter Job** (`pg_cron`, einmal täglich) statt „beim Schreiben aufräumen". Grund: eine reine Zeitgrenze ist als Datums-Vergleich in einem täglichen Job trivial und belastet den Versand-Pfad nicht; „Prune beim Schreiben" wäre nur bei einer *Anzahl*-Grenze („letzte N") sinnvoll gewesen.
- **Manueller Schritt:** die `pg_cron`-Extension muss im Supabase-Projekt aktiviert sein (einmalig, in `/backend`).

---

### H) Sicherheit (Zusammenfassung)

- **RLS auf beiden neuen Tabellen:** jeder sieht/ändert ausschließlich eigene Zeilen. In-App-Einträge werden **nur** von der Versand-Funktion (Service-Rolle) geschrieben, nie vom Client.
- **Kein Service-Key im Client.** Resend-API-Key und HMAC-Unsubscribe-Secret liegen ausschließlich als Supabase-Secrets vor.
- **Abmelde-Token signiert** (HMAC), nicht erratbar, ohne Login nur zum E-Mail-Abschalten nutzbar — nichts anderes.
- **Webhook-Authentifizierung** (`x-webhook-secret`) bleibt wie in PROJ-10.

---

### I) Zu installierende Pakete

- **Client:** *keine neuen.* Alles vorhanden — `switch`, `sheet`, `scroll-area`, `skeleton`, `sonner` (Fehler-Toasts), `date-fns` (relative Zeit), Supabase-Realtime (im bereits genutzten `@supabase/supabase-js`).
- **Edge Function:** *keine neuen Pakete* — Resend wird per `fetch` gegen die REST-API angesprochen (Muster wie der bestehende FCM-Aufruf).
- **Supabase-Extension:** `pg_cron` aktivieren (kein npm-Paket, Projekt-Einstellung).

---

### J) Offene manuelle Schritte für den Nutzer (nicht headless automatisierbar)
1. Resend-Konto + Absender-Domain verifizieren (SPF/DKIM-DNS-Records).
2. `RESEND_API_KEY` und ein `UNSUBSCRIBE_SIGNING_SECRET` als Supabase-Secrets setzen.
3. `pg_cron`-Extension im Supabase-Projekt aktivieren.
(Alle drei degradieren sauber, solange sie fehlen — das Feature bleibt lauffähig, nur der jeweilige Teil ruht.)

## Frontend Implementation Notes (/frontend)

**Umgesetzt am 2026-07-04.** Reine Client-Schicht gegen die zwei neuen Tabellen — läuft im Web und nativ, degradiert sauber, bis `/backend` die Tabellen anlegt (fehlgeschlagene Queries → leerer Posteingang, Badge 0, kein Crash).

### Neue Dateien
- `src/lib/notification-types.ts` — die 5 Ereignisse (Spiegel von PROJ-10 `PushEvent`), deutsche Labels/Beschreibungen für die Matrix, `DEFAULT_PREFERENCE` (Push AN, E-Mail AUS), `formatBadgeCount`.
- `src/lib/date-format.ts` → `formatRelativeGerman(value, now?)` — kompakte relative Zeit („gerade eben", „vor 5 Min.", „vor 3 Std.", „vor 2 Tg.", sonst Datum). Dependency-frei, `now` injizierbar für Tests.
- `src/hooks/useNotifications.ts` — Historie (letzte 100), Realtime-Subscription gefiltert auf `user_id`, abgeleiteter `unreadCount`, `markRead`/`markAllRead` (optimistisch), `refetch` beim Öffnen deckt Verbindungsabbrüche ab.
- `src/hooks/useNotificationPreferences.ts` — lädt Vorlieben, überlagert Defaults; `toggle(event, channel)` optimistisch mit **Rollback + Fehler-Toast**; Persistenz via `upsert` auf `(user_id, event)`.
- `src/components/notifications/{NotificationBell,NotificationCenter,NotificationItem}.tsx` — Glocke+Badge (besitzt die *eine* Realtime-Subscription pro Screen), Center als `ResponsiveModal` (Bottom-Sheet mobil / zentriert Desktop, konsistent mit ProfileSheet) mit „Alle als gelesen", Leerzustand, Lade-Skeleton; Item mit Tap→gelesen+Deep-Link.
- `src/components/profile/NotificationPreferencesSection.tsx` — die eine „Benachrichtigungen"-Region im Profil: native OS-Push-Aktivierung (bestehende `PushNotificationSection`, jetzt via `hideHeading` eingebettet) + die Pro-Typ-Matrix.

### Geänderte Dateien
- `src/lib/database.types.ts` — Typen für `notifications` + `notification_preferences` (Frontend-first; `/backend` legt passende Tabellen + RLS + Realtime an).
- `src/components/profile/PushNotificationSection.tsx` — optionales `hideHeading`-Prop (rückwärtskompatibel), damit keine doppelte Überschrift entsteht.
- `src/components/profile/ProfileSheet.tsx` — native-only Push-Block ersetzt durch `NotificationPreferencesSection` (jetzt **immer** gerendert; E-Mail-Schalter funktionieren im Web).
- `src/app/groups/page.tsx` + `src/app/groups/view/page.tsx` — `NotificationBell` in beide Kopfzeilen.

### Wiederverwendung
- Navigation der In-App-Einträge nutzt exakt `parsePushTarget` + `pushTargetToPath` aus `@/lib/native/push` → **ein** Deep-Link-/„Inhalt-weg"-Pfad für Push-Tap und In-App-Tap. Deep-Link-Spalten in `notifications` = `{group_id, activity_id, tab}` (identisch zum PROJ-10-Push-Payload).

### Entscheidungen in `/frontend`
- **Badge-Kürzung:** exakt 1–99, darüber „99+" (Open Question Zeile 93 gelöst).
- **Push-Spalte in der Matrix native-only:** im Web (kein Push zustellbar) zeigt die Matrix nur die E-Mail-Spalte; nativ beide. Erfüllt AC „E-Mail-Schalter im Web voll nutzbar".
- **In-App-Kanal nicht abschaltbar** (per Design) — die Matrix regelt nur Push + E-Mail; Hinweistext im UI macht das explizit.

### Offen für `/backend`
Tabellen `notifications` + `notification_preferences` (RLS: nur eigene Zeilen; Insert der `notifications` nur durch Service-Rolle), Realtime auf `notifications` aktivieren, `send-push`-Fan-out (In-App-Insert immer + Push/E-Mail nach Vorliebe), Resend-E-Mail, `List-Unsubscribe`-Endpunkt (HMAC), `pg_cron`-Prune (30 Tage). Die Client-Typen/Hooks passen bereits auf dieses Schema.

## Backend Implementation Notes (/backend)

**Umgesetzt am 2026-07-04.** Server-Pipeline von „nur Push" auf 3-Kanal-Fan-out erweitert, gegen die bereits passenden Client-Typen/Hooks. Alles gegen Supabase-Projekt `fogldssdmqgeffpuhvxd` (eu-central-1) angewandt und deployt.

### Datenbank — Migration `supabase/migrations/20260704_proj12_notifications.sql` (angewandt)
- **`notifications`** (In-App-Posteingang): `id, user_id→profiles, event (5er-Check), title, body, group_id, activity_id, tab, read, created_at`. `group_id/activity_id` bewusst **ohne** FK — Historie überlebt gelöschte Gruppen/Aktivitäten (Edge Case „nicht mehr zugänglicher Inhalt"). Spalten identisch zu `database.types.ts`.
  - RLS: `select`/`update` nur eigene Zeilen (`auth.uid() = user_id`, Update mit `with check` gepinnt). **Kein** Insert/Delete-Policy → Schreiben ausschließlich durch die Service-Rolle (send-push), Löschen nur durch den Prune-Job.
  - Indizes: `(user_id, created_at desc)` für die Center-Liste, `(created_at)` für den Prune.
- **`notification_preferences`** (Pro-Typ-Schalter): PK `(user_id, event)`, `push_enabled default true`, `email_enabled default false`, `updated_at`. RLS: select/insert/update nur eigene Zeilen (Client-`upsert` on `(user_id,event)`). Fehlende Zeile = Default (Push AN/E-Mail AUS) — kein Backfill.
- **Realtime:** `notifications` zur Publikation `supabase_realtime` hinzugefügt (idempotent). Client abonniert `user_id=eq.…`.
- **Aufbewahrung:** `pg_cron` aktiviert + täglicher Job `proj12-prune-notifications` (03:00 UTC) löscht Einträge > 30 Tage. Tolerant gebaut (DO/exception) — fehlt pg_cron, ruht nur der Prune. **Hier lief die Aktivierung erfolgreich durch**, Job ist geplant (verifiziert via `cron.job`).

### Edge Functions
- **`send-push` erweitert (v5 deployed, `verify_jwt=false`, x-webhook-secret unverändert):** nach der unveränderten PROJ-10-Empfänger-Ermittlung fan-out **pro Empfänger**:
  1. **In-App immer & zuerst** — Bulk-`insert` in `notifications` (frozen title/body aus `buildMessage`, Deep-Link-Spalten aus `buildPushTarget`). Fehler wird geloggt, blockiert die anderen Kanäle nicht.
  2. **Präferenzen** einmalig geladen (`notification_preferences` für alle Empfänger × Event) → `resolveChannels` splittet in `pushUserIds`/`emailUserIds` (fehlend = Default).
  3. **Push** nur für `pushUserIds` mit Token — bestehende FCM-Logik, jetzt in try/catch gekapselt (FCM-Fehler versenkt In-App/E-Mail nicht mehr).
  4. **E-Mail (Resend)** nur für `emailUserIds` — Adresse via `auth.admin.getUserById` (liegt in `auth.users`, nicht `profiles`), REST-`fetch` (kein SDK), mit signiertem `List-Unsubscribe`-Header. Best-effort, Fehler geloggt.
  - Neue reine Helfer in `send-push/logic.ts` (Vitest-getestet): `resolveChannels`, `targetToPath`, `escapeHtml`, `buildEmail`, `DEFAULT_CHANNEL_PREFERENCE`.
- **`unsubscribe` neu (v1 deployed, `verify_jwt=false`):** login-freier Ziel-Endpunkt des `List-Unsubscribe`-Headers. Autorität = HMAC-SHA256(user_id) mit `UNSUBSCRIBE_SIGNING_SECRET` (konstante-Zeit-Vergleich, `../_shared/unsubscribe.ts`). `GET` → deutsche HTML-Bestätigung, `POST` (RFC 8058 One-Click) → 200. Schaltet **alle** E-Mail-Schalter des Nutzers aus (Push/In-App unberührt). Fehlt das Secret → 503 fail-closed (verifiziert).

### Manuelle Schritte (nicht headless automatisierbar — jeder degradiert sauber, solange offen)
1. **Resend (Phase 1 — Absender-Domain steht fest):** `qt-voting-app.vercel.app` geht **nicht** (Resend blockt geteilte `*.vercel.app`-Domains). Genutzt wird die eigene IONOS-**Root-Domain `messe-software.com`** (Root, nicht Subdomain, damit die reale Mailbox `zsmn@messe-software.com` zugleich Absender **und** Reply-Postfach ist). In Resend Domain hinzufügen → angezeigte DNS-Records bei **IONOS** eintragen. **SPF-Achtung:** `messe-software.com` hat durch das IONOS-Postfach bereits einen SPF-TXT-Record — Resends `include:` in den **bestehenden** Eintrag mergen (nur **ein** SPF-Record pro Domain erlaubt), DKIM ist ein separater Record und unkritisch. Danach Supabase-Secrets `RESEND_API_KEY` und `RESEND_FROM = ZUSAMMEN <zsmn@messe-software.com>`. Ohne Key: E-Mail-Zweig no-op (wie FCM ohne Key). _Späterer „richtiger" Schritt: eigene ZUSAMMEN-Domain statt `messe-software.com`._
2. **`UNSUBSCRIBE_SIGNING_SECRET`** als Supabase-Secret setzen (beliebiges hohes-Entropie-Geheimnis). Ohne: E-Mail sendet ohne List-Unsubscribe-Header, `unsubscribe` liefert 503.
3. **Optional `APP_BASE_URL`** (Default `https://qt-voting-app.vercel.app`) für die absoluten E-Mail-Deep-Links. Hinweis: Absender-Domain (`messe-software.com`) und Link-/App-Domain (`qt-voting-app.vercel.app`) dürfen bewusst unterschiedlich sein.
   (`pg_cron` war als manueller Schritt notiert, konnte hier aber direkt in der Migration aktiviert werden — erledigt.)

### Verifikation
- `npm test` grün (257 Tests, davon 29 in `send-push/logic.test.ts` inkl. der neuen Fan-out-Helfer).
- Security-Advisors: keine neuen Findings für die zwei Tabellen (beide haben Policies); Endpunkt-Auth geprüft (`unsubscribe` 503 fail-closed ohne Secret, `send-push` 401 ohne Webhook-Secret).

### Abweichung / Hinweis für /qa
- Sichtbarer „Benachrichtigungen verwalten"-Link zeigt aktuell auf `${APP_BASE_URL}/groups/` (App-Home) statt direkt in die Profil-Sektion — es existiert keine Route, die das ProfileSheet auf der Benachrichtigungs-Sektion öffnet. Login-freie Ein-Klick-Abmeldung läuft wie geplant über den `List-Unsubscribe`-Header (siehe angepasstes AC Zeile 68/Open Question).

## QA Test Results

**Getestet am 2026-07-04.** Kombiniert: Code-Review aller neuen Dateien (Client-Hooks/Components + Edge Functions + Migration), Live-Verifikation der DB gegen Supabase-Projekt `fogldssdmqgeffpuhvxd`, Produktions-Build, Unit-/E2E-Suiten. Der reine Server-Fan-out (Push/E-Mail/Realtime) ist über Unit-Tests + DB-Introspektion abgedeckt; eine vollständige Ende-zu-Ende-E-Mail-Zustellung ist erst nach den offenen manuellen Resend/Secret-Schritten prüfbar (sauberes Degradieren bis dahin, siehe unten).

### Zusammenfassung
- **Akzeptanzkriterien:** 24 von 24 bestanden (3 davon eingeschränkt / erst nach manueller Resend-Einrichtung final verifizierbar — kein Blocker, da dokumentiert degradierend).
- **Bugs:** 0 Critical · 0 High · 0 Medium · 3 Low.
- **Security-Audit:** keine neuen Findings. RLS auf beiden Tabellen aktiv & korrekt; Insert/Delete der `notifications` nur Service-Rolle; Unsubscribe-Token HMAC-signiert (jetzt unit-getestet); `unsubscribe` fail-closed (503) ohne Secret, `send-push` 401 ohne Webhook-Secret.
- **Regression:** `npm test` 267 grün (27 Dateien, inkl. 10 neue Security-Tests); `npm run build` grün (13 Routen static export); E2E-Suite grün (auth-guard-Regression bestanden, credential-abhängige Tests sauber übersprungen).
- **Produktionsreife-Empfehlung: JA** — keine Critical/High-Bugs. Der E-Mail-Kanal bleibt bis zur manuellen Resend-/Secret-Einrichtung dormant (dokumentiert, degradiert sauber wie der FCM-Kanal ohne Key).

### Automatisierte Tests
- **Unit/Integration (Vitest): 267 passed / 27 Dateien.** Fan-out-Logik (`resolveChannels`, `targetToPath`, `escapeHtml`, `buildEmail`, `DEFAULT_CHANNEL_PREFERENCE`) in `send-push/logic.test.ts`; Badge-Kürzung/Defaults in `notification-types.test.ts`; relative Zeit in `date-format.test.ts`.
- **NEU von /qa:** `supabase/functions/_shared/unsubscribe.test.ts` — 10 Tests für die sicherheitskritische HMAC-Signatur (`signUserId`/`verifyUserId`): Determinismus, Hex-Format, Schlüssel-Abhängigkeit, **Kein Cross-User-Forgery** (Token für User A validiert nicht für User B), Ablehnung bei falschem Secret/leerer Eingabe/falscher Länge. Diese Logik war zuvor ungetestet.
- **E2E (Playwright): `tests/PROJ-12-benachrichtigungen-einstellungen.spec.ts` (NEU von /qa).** Auth-guard-Regression läuft credential-frei (bestanden); Glocke/Center + Präferenz-Matrix-Tests folgen dem etablierten Skip-Muster ohne `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` und greifen in CI mit Credentials.

### Live-Backend-Verifikation (Supabase MCP)
| Prüfung | Ergebnis |
|---|---|
| `notifications` + `notification_preferences` existieren, RLS aktiv | ✅ beide `rls=true` |
| `notifications` Policies | ✅ nur SELECT + UPDATE (kein INSERT/DELETE → Service-Rolle schreibt, Prune löscht) |
| `notification_preferences` Policies | ✅ SELECT + INSERT + UPDATE (eigene Zeilen, `auth.uid()=user_id`) |
| Realtime-Publikation enthält `notifications` | ✅ |
| Cron-Job `proj12-prune-notifications` | ✅ aktiv, `0 3 * * *` (30-Tage-Prune) |
| Indizes | ✅ `idx_notifications_user_created`, `idx_notifications_created_at` |
| Security-Advisors nach DDL | ✅ keine neuen Findings für die 2 Tabellen (übrige Warnungen sind PROJ-10/älter) |

### Akzeptanzkriterien (Detail)
**In-App-Center:** Glocke in beiden Kopfzeilen ✅ · gruppenübergreifendes Badge mit „99+"-Kürzung ✅ (`formatBadgeCount`, getestet) · chronologische Liste, ungelesen hervorgehoben ✅ · Tap → gelesen + Deep-Link (wiederverwendet `parsePushTarget`/`pushTargetToPath`, Pfad identisch zu `targetToPath` im Server verifiziert) ✅ · „Alle als gelesen" nur bei ungelesenen sichtbar ✅ · Leerzustand „Alles ruhig hier" ✅ · Live via Realtime (Publikation + gefilterte Subscription vorhanden) ✅.

**Ereignis→Kanal-Fan-out:** In-App-Eintrag für jeden Empfänger, immer & zuerst geschrieben ✅ · Push nur bei aktivem Schalter + Token, in try/catch gekapselt ✅ · Push-aus → kein Push, aber In-App bleibt ✅ · E-Mail nur bei aktivem Schalter (deutsche Mail, Auslöser+Titel+Deep-Link+Verwalten-Link) ✅* · E-Mail-Standard aus ✅ · Auslöser-Ausschluss zentral in `resolveRecipients` (getestet) ✅.

**Pro-Typ-Einstellungen:** 5 Zeilen × Schalter im Profil ✅ · Defaults Push AN / E-Mail AUS ✅ · optimistisches Speichern, bleibt nach Neustart (upsert) ✅ · Web: E-Mail-Spalte voll nutzbar, Push-Spalte native-only ✅ · Fehler → Rollback + Toast ✅.

**E-Mail-Kanal:** deutsche Mail mit Kontext-Link ✅* · Ein-Klick-Abmeldung login-frei über `List-Unsubscribe`-Header (HMAC, RFC 8058), sichtbarer Link ins Center — angepasste Semantik lt. Open Question Zeile 92, Abweichung dokumentiert ✅*.

_* = Logik/Struktur verifiziert; finale Zustellung erst nach manueller Resend-Domain-/Secret-Einrichtung testbar._

### Gefundene Bugs (alle Low)
- **BUG-12-1 (Low, dokumentierte Abweichung):** Sichtbarer „Benachrichtigungen verwalten"-Link in der E-Mail zeigt auf `${APP_BASE_URL}/groups/` (App-Home) statt direkt in die Profil-Benachrichtigungs-Sektion — es existiert keine Route, die das ProfileSheet auf dieser Sektion öffnet (siehe Backend-Notes Zeile 344). Login-freie Abmeldung funktioniert unabhängig über den `List-Unsubscribe`-Header. UX-Detail, keine Funktionsverletzung.
- **BUG-12-2 (Low):** Der In-App-Eintrag wird als **ein** Bulk-`insert` mit FK auf `profiles(id)` geschrieben. Fehlt für **einen** Empfänger die `profiles`-Zeile (FK-Verletzung), scheitert der **gesamte** Batch → kein Empfänger erhält einen Eintrag (nur geloggt). In der Praxis hat durch `handle_new_user` jeder Nutzer ein Profil → sehr geringe Wahrscheinlichkeit, aber das Alles-oder-nichts-Verhalten widerspricht der „verlustfreien Historie"-Garantie im Grenzfall. Empfehlung: Insert pro Empfänger oder `on conflict do nothing`/tolerantes Schreiben.
- **BUG-12-3 (Low / Defense-in-Depth):** Die UPDATE-Policy auf `notifications` erlaubt dem Besitzer, **alle** Spalten der eigenen Zeilen zu ändern (nicht nur `read`). Nur eigene Daten betroffen (kein Cross-User-Schaden), aber ein Client könnte Titel/Body/Deep-Link der eigenen Historie manipulieren. Optional: Spalten-Whitelist per Trigger/`GRANT UPDATE (read)`.

### Bug-Fixes (2026-07-04, nach QA)
Alle drei Low-Bugs im Repo behoben, lokal verifiziert (`npm run build` grün, `npm test` 267 grün):
- **BUG-12-1 behoben:** Neue Deep-Link-Route `?settings=notifications` auf `/groups` öffnet das ProfileSheet und scrollt zur „Benachrichtigungen"-Sektion (Anker `#notification-settings` in `ProfileSheet`, `scrollToNotifications`-Prop, Param-Handling in `groups/page.tsx`). E-Mail-`manageUrl` in `send-push/index.ts` zeigt jetzt dorthin.
- **BUG-12-2 behoben:** In-App-Insert in `send-push/index.ts` von einem Bulk-`insert` auf resiliente Einzel-Inserts (`Promise.all`) umgestellt — ein fehlerhafter Empfänger isoliert, alle übrigen bekommen ihren Eintrag; Rückgabe zählt `inboxWritten`.
- **BUG-12-3 behoben:** Neue Migration `20260704_proj12_notifications_update_read_only.sql` — `revoke update … / grant update (read)` beschränkt den `authenticated`-UPDATE auf die `read`-Spalte (Service-Rolle unberührt).

**Production-Apply erledigt (2026-07-04, mit Nutzer-Freigabe):** DB-Migration live angewandt (verifiziert: `authenticated` hat UPDATE nur noch auf Spalte `read`) + `send-push` Edge Function **v9 ACTIVE** deployt (`verify_jwt=false` erhalten). BUG-12-2 und -3 sind damit live wirksam; BUG-12-1 (Frontend) geht mit dem nächsten Vercel-Deploy (`/deploy`) live.

### Zu verifizieren nach manueller Einrichtung (kein Bug — offener Betriebs-Schritt)
- **List-Unsubscribe One-Click gegen externe Mail-Clients:** Der `POST`-Endpunkt `unsubscribe` läuft mit `verify_jwt=false`. Beim ersten echten Resend-Versand bestätigen, dass Gmail/Apple-Mail den One-Click-POST (ohne Supabase-`apikey`) ohne Gateway-401 erreicht. Sichtbarer Weg (Center) ist davon unabhängig.
- **E-Mail-Ende-zu-Ende:** nach `RESEND_API_KEY` + `RESEND_FROM` + DNS (SPF/DKIM) + `UNSUBSCRIBE_SIGNING_SECRET` einen echten Ereignis-Trigger auslösen und Zustellung/Deep-Link/Abmelde-Header prüfen.

### Getestete Edge Cases
Deep-Link auf gelöschten Inhalt (kein FK auf `group_id`/`activity_id` → Historie überlebt, Fallback via geteiltem `pushTargetToPath`) ✅ · fehlende Präferenz = Default (getestet in `resolveChannels`) ✅ · alle Kanäle aus → In-App trotzdem geschrieben ✅ · Push-/E-Mail-Fehler blockieren In-App nicht (Reihenfolge + try/catch verifiziert) ✅ · 30-Tage-Prune (Cron aktiv) ✅ · Badge sehr groß → „99+" ✅ · Realtime-Abbruch → `refetch` beim Öffnen ✅.

## Deployment

**Deployed am 2026-07-04.**
- **Production-URL:** https://qt-voting-app.vercel.app (Vercel, Auto-Deploy bei Push auf `main`)
- **Backend (bereits vor dem Frontend-Deploy live in Supabase-Projekt `fogldssdmqgeffpuhvxd`):**
  - Migration `20260704_proj12_notifications.sql` (Tabellen `notifications` + `notification_preferences`, RLS, Realtime, `pg_cron`-Prune) — angewandt.
  - Migration `20260704_proj12_notifications_update_read_only.sql` (BUG-12-3: UPDATE nur auf `read`) — angewandt & verifiziert.
  - Edge Functions: `send-push` **v9** (3-Kanal-Fan-out inkl. resilientem In-App-Insert / BUG-12-2 + manage-Deep-Link / BUG-12-1), `unsubscribe` **v1** — ACTIVE, `verify_jwt=false`.
- **Frontend:** In-App-Glocke/Center, Pro-Typ-Matrix, `?settings=notifications`-Deep-Link (BUG-12-1) — mit diesem Vercel-Deploy live.
- **Pre-Deploy-Gates:** `npm run build` grün · `npm test` 267 grün · keine Critical/High-Bugs · keine Secrets im Diff. (`npm run lint` ist projektweit defekt — `next lint` in Next 16 entfernt; TS-Type-Check im Build deckt Korrektheit ab.)
- **Offener Betriebsschritt (E-Mail-Kanal ruht sauber bis dahin):** Resend-Domain (SPF/DKIM) + Supabase-Secrets `RESEND_API_KEY`, `RESEND_FROM`, `UNSUBSCRIBE_SIGNING_SECRET` setzen; danach echten Ereignis-Trigger + One-Click-Abmeldung einmalig prüfen.

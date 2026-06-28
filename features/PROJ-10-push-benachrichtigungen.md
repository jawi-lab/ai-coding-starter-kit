# PROJ-10: Push-Benachrichtigungen (FCM/APNs)

## Status: Deployed
**Created:** 2026-06-28
**Last Updated:** 2026-06-28

## Dependencies
- Requires: **PROJ-9 (Capacitor Native Apps)** — Push gibt es nur in der nativen Hülle. Das Plugin `@capacitor/push-notifications` ist in PROJ-9 bereits installiert (aber nicht verdrahtet) und der Deep-Link-Mechanismus (warm + Cold Start) existiert.
- Requires: **PROJ-13 (Onboarding-Flow)** — der Soft-Ask nach der Push-Erlaubnis wird als Onboarding-Schritt eingehängt.
- Requires: **PROJ-2 (Authentifizierung)** — Geräte-Tokens werden pro eingeloggtem Nutzer gespeichert.
- Requires: **PROJ-4 (Voting), PROJ-5 (Kanban), PROJ-6 (Aktivitäts-Detail/Kommentare), PROJ-7 (Terminfindung)** — die auslösenden Ereignisse stammen aus diesen Features.
- Bereitet vor / grenzt ab gegen: **PROJ-12 (Benachrichtigungen & Einstellungen, In-App + E-Mail)** — alle feingranularen Pro-Typ-Schalter und ein In-App-Posteingang gehören zu PROJ-12, **nicht** hierher.

## Ziel / Definition of Done
Mitglieder einer ZUSAMMEN-Gruppe erhalten auf ihrem Handy **native Push-Benachrichtigungen** zu den wichtigsten Gruppen-Ereignissen — auch wenn die App geschlossen ist. Tippt der Nutzer auf eine Benachrichtigung, landet er **direkt im passenden Kontext** (Gruppen-Tab bzw. Aktivität). Umgesetzt für **iOS (APNs) und Android (FCM)**, iOS zuerst lauffähig, Android direkt danach.

PROJ-10 ist „fertig", wenn: die Erlaubnis sauber eingeholt wird, ein Geräte-Token serverseitig pro Nutzer hinterlegt ist, die fünf definierten Ereignisse zuverlässig eine Push auslösen (an die richtigen Empfänger, nie an den Auslöser selbst), der Tap zum Kontext navigiert und der Vordergrund-Fall einen In-App-Toast zeigt.

## User Stories
- Als Gruppenmitglied möchte ich benachrichtigt werden, wenn jemand eine **neue Aktivität vorschlägt**, damit ich zeitnah abstimmen kann.
- Als Gruppenmitglied möchte ich erfahren, wenn ein Vorschlag das Voting gewonnen hat und **in die Planung** gewandert ist, damit ich weiß, dass es ernst wird.
- Als Gruppenmitglied möchte ich benachrichtigt werden, wenn ein **gemeinsamer Termin bestätigt** wurde, damit ich ihn mir freihalten kann.
- Als Nutzer möchte ich eine Benachrichtigung bekommen, wenn mich jemand in einem Kommentar **@erwähnt**, damit ich gezielt reagieren kann (ohne von jedem Kommentar gestört zu werden).
- Als Nutzer möchte ich erfahren, wenn ich **für etwas verantwortlich** gemacht wurde, damit ich meine Aufgabe nicht übersehe.
- Als Nutzer möchte ich beim Antippen einer Benachrichtigung **direkt an die richtige Stelle** in der App gelangen, statt sie selbst suchen zu müssen.
- Als Nutzer möchte ich beim ersten Mal **verständlich gefragt** werden, ob ich Push erlauben will — und es später nachträglich ändern können.

## Out of Scope
- **Feingranulare Pro-Typ-Schalter** (z. B. „Nur Erwähnungen, keine Vorschläge") — gehört zu **PROJ-12**. PROJ-10 liefert alle fünf Trigger; Steuerung erfolgt vorerst nur über die OS-Erlaubnis (alles oder nichts).
- **In-App-Benachrichtigungs-Posteingang / Glocken-Center** mit Historie und Gelesen-Status — **PROJ-12**. PROJ-10 zeigt im Vordergrund nur einen flüchtigen Toast.
- **E-Mail-Benachrichtigungen** — **PROJ-12**.
- **Web-Push (Browser-Benachrichtigungen für die Vercel-Web-Version)** — nicht in diesem Feature. Push ist nur nativ (iOS/Android).
- **Weitere Ereignis-Trigger** über die fünf definierten hinaus (z. B. „neues Mitglied beigetreten", „Aktivität abgeschlossen/archiviert", „Foto hinzugefügt", „neue Abstimmung/Vote auf meinen Vorschlag") — bewusst ausgelassen, ggf. später ergänzen.
- **Stummschalt-/Ruhezeiten, Bündelung/Digest, Wiederholungs-Erinnerungen** (z. B. „Termin morgen") — nicht im MVP.
- **Reichhaltige Benachrichtigungen** (Bilder/Action-Buttons in der Benachrichtigung, z. B. direkt abstimmen) — nicht im MVP.
- **Badge-Zähler-Pflege** (App-Icon-Zahl) — nicht im MVP.

## Acceptance Criteria

**Format:** Angenommen [Vorbedingung] / Wenn [Aktion] / Dann [Ergebnis]

### Berechtigung & Token-Registrierung
- [ ] Angenommen ein Nutzer durchläuft erstmals das Onboarding, wenn der Push-Schritt erscheint, dann sieht er eine verständliche Erklärung des Nutzens und kann „Erlauben" oder „Später" wählen, **bevor** der native OS-Dialog erscheint.
- [ ] Angenommen der Nutzer tippt im Soft-Ask auf „Erlauben", wenn der OS-Dialog erscheint und er zustimmt, dann wird ein Geräte-Token erzeugt und serverseitig dem eingeloggten Nutzer zugeordnet gespeichert.
- [ ] Angenommen der Nutzer lehnt im Soft-Ask oder im OS-Dialog ab, wenn das Onboarding fortgesetzt wird, dann funktioniert die App vollständig weiter und es wird kein Token gespeichert.
- [ ] Angenommen ein Nutzer hat Push zunächst abgelehnt, wenn er später im Profil die Push-Aktivierung erneut anstößt, dann wird er (falls die OS-Erlaubnis dauerhaft verweigert ist) verständlich zu den System-Einstellungen geleitet.
- [ ] Angenommen ein Nutzer ist auf mehreren Geräten eingeloggt, wenn auf jedem die Erlaubnis erteilt wurde, dann werden Benachrichtigungen an **alle** registrierten Geräte dieses Nutzers ausgeliefert.

### Auslösende Ereignisse (richtige Empfänger)
- [ ] Angenommen ein Mitglied erstellt einen neuen Aktivitäts-Vorschlag, wenn der Vorschlag gespeichert ist, dann erhalten **alle anderen** Gruppenmitglieder (nicht der Ersteller) eine Push „[Name] hat „[Titel]" vorgeschlagen".
- [ ] Angenommen ein Vorschlag gewinnt das Voting / wird in die Planung verschoben, wenn der Statuswechsel erfolgt, dann erhalten alle **anderen** Gruppenmitglieder (nicht der Auslöser des Statuswechsels — z. B. der entscheidende Voter) eine Push, dass „[Titel]" jetzt geplant wird.
- [ ] Angenommen ein gemeinsamer Termin wird bestätigt, wenn die Bestätigung erfolgt, dann erhalten alle **anderen** Gruppenmitglieder (nicht der Auslöser) eine Push mit Aktivitätstitel und Termin.
- [ ] Angenommen ein Nutzer wird in einem Kommentar @erwähnt, wenn der Kommentar gespeichert ist, dann erhält **nur** der/die Erwähnte(n) eine Push „[Name] hat dich in „[Titel]" erwähnt" (kein Push für nicht erwähnte Mitglieder).
- [ ] Angenommen einem Nutzer wird die Verantwortung für etwas zugewiesen, wenn die Zuweisung gespeichert ist, dann erhält **nur** dieser Nutzer eine Push über seine neue Verantwortung.
- [ ] Angenommen ein Nutzer löst ein Ereignis selbst aus (z. B. erwähnt sich selbst oder kommentiert), wenn die Push erzeugt wird, dann erhält der Auslöser **keine** Benachrichtigung über seine eigene Aktion.
- [ ] Angenommen ein Empfänger ist kein Mitglied der betreffenden Gruppe (mehr), wenn das Ereignis eintritt, dann erhält er keine Push (Empfängerkreis = aktuelle Gruppenmitglieder, RLS-konform).

### Tap-Verhalten & Vordergrund
- [ ] Angenommen die App ist geschlossen und der Nutzer tippt auf eine Push, wenn die App startet (Cold Start), dann öffnet sie direkt den passenden Kontext (Gruppen-Tab bzw. Aktivität) und nicht nur den Startbildschirm.
- [ ] Angenommen die App läuft im Hintergrund und der Nutzer tippt auf eine Push, wenn die App in den Vordergrund kommt, dann navigiert sie zum passenden Kontext.
- [ ] Angenommen die App ist im Vordergrund geöffnet, wenn ein Push-Ereignis eintrifft, dann erscheint ein kurzer, antippbarer In-App-Toast (kein System-Banner); ein Tap navigiert zum Kontext.

### Inhalt
- [ ] Angenommen eine Push wird erzeugt, wenn sie auf dem Gerät erscheint, dann enthält der Text — soweit verfügbar — den Namen des Auslösers und den Aktivitäts-/Gruppentitel und ist auf Deutsch.

## Edge Cases
- **Erlaubnis im Onboarding übersprungen/abgelehnt:** Der Nutzer muss Push später nachholen können (Eintrag im Profil). Onboarding läuft nur einmal — ohne diesen Nachweg gäbe es keine zweite Chance.
- **OS-Erlaubnis dauerhaft verweigert:** Erneutes In-App-Anstoßen kann den OS-Dialog nicht erneut zeigen → der Nutzer wird sinnvoll zu den System-Einstellungen geleitet, statt in einer Sackgasse zu landen.
- **Veraltetes/ungültiges Token:** Wird beim Versand ein Token von APNs/FCM als ungültig zurückgewiesen (App deinstalliert, Token rotiert), dann wird es serverseitig entfernt, damit künftige Sends nicht ins Leere laufen.
- **Token rotiert / Re-Login auf anderem Account:** Loggt sich ein anderer Nutzer auf demselben Gerät ein, darf das alte Token nicht beim alten Nutzer Pushes auslösen → Token wird beim Login dem aktuellen Nutzer zugeordnet und beim Logout entkoppelt.
- **Gleichzeitige/Massen-Ereignisse:** Mehrere Vorschläge kurz hintereinander erzeugen mehrere Pushes (kein Digest im MVP) — akzeptiert, aber das Versand-Backend muss den Mehrfachversand zuverlässig (ohne Doppelzustellung desselben Ereignisses) abwickeln.
- **Empfänger ohne Token:** Ein Mitglied, das Push nie erlaubt hat, wird beim Versand still übersprungen (kein Fehler, kein Abbruch für die übrigen Empfänger).
- **Tap auf Push zu nicht mehr existierendem/zugänglichem Inhalt** (Aktivität gelöscht, aus Gruppe entfernt): Die App fängt das ab und zeigt einen verständlichen Hinweis statt eines leeren/fehlerhaften Screens.
- **Deep-Link-Ziel bei Cold Start ohne Login:** Tippt ein ausgeloggter Nutzer auf eine Push, wird er zuerst zum Login geführt und nach erfolgreichem Login möglichst zum Ziel weitergeleitet (mindestens aber sauber auf den Startbildschirm, ohne Whitescreen).

## Technical Requirements (optional)
- Plattformen: iOS (APNs) und Android (FCM/Firebase). iOS zuerst lauffähig, Android direkt danach.
- Auslieferung serverseitig: Der Versand muss aus einer vertrauenswürdigen Umgebung erfolgen (Service-Keys dürfen nie im Client liegen). Empfängerermittlung RLS-/Mitgliedschafts-konform.
- Geräte-Tokens werden pro Nutzer gespeichert (neue Datenstruktur nötig — Detail in `/architecture`).
- Latenz: Push soll zeitnah nach dem auslösenden Ereignis ankommen (Richtwert: wenige Sekunden, kein harter SLA).
- Web-Version (Vercel) bleibt unberührt — alle Push-Pfade sind nativ-only hinter `isNativePlatform()`.
- Nutzt das in PROJ-9 vorhandene Deep-Link-/Cold-Start-Fundament (`@capacitor/app`) für die Tap-Navigation.

## Open Questions
- [x] **Versand-Architektur** → entschieden in `/architecture`: Supabase **Database Webhooks** auf `activities`/`activity_comments`/`activity_responsibilities` → Edge Function **`send-push`** (Service-Role) → **FCM v1** als einziger Kanal für iOS & Android. (2026-06-28)
- [~] **APNs-/FCM-Einrichtung (manuell, nicht headless):** Firebase-Projekt `zusammen-de6ea` ✅; `google-services.json` (Android) ✅ + `GoogleService-Info.plist` (iOS, App `com.zusammen.app`) ✅ in den Native-Projekten; Server-Credentials (`FCM_SERVICE_ACCOUNT`, `PUSH_WEBHOOK_SECRET`) in Supabase ✅. **Offen:** Apple Push Key (.p8) in Apple Developer anlegen und in Firebase → Cloud Messaging hochladen — Voraussetzung für echte APNs-Zustellung an physische iOS-Geräte. _(angelegt 2026-06-28)_
- [~] **On-Device-Verifikation (manuell):** echte Zustellung End-to-End auf physischem iOS- und Android-Gerät (Simulator/Emulator liefern Push nur eingeschränkt) — Erlaubnis-Dialog, Tokenanlage, Zustellung, Tap-Navigation warm + Cold Start. _(angelegt 2026-06-28)_
  - **Android: ✅ erfolgreich verifiziert (2026-06-28)** auf dem Emulator `ZUSAMMEN_Pixel7` (hat GMS, daher FCM lauffähig). Gesamte Kette bewiesen: Soft-Ask→OS-Dialog→„Allow", Token in `device_tokens`, Vorschlag durch ein anderes Mitglied → System-Benachrichtigung „Neuer Vorschlag / Clemens hat „Bowling am Freitag" vorgeschlagen" auf dem Emulator, Tap öffnet die Aktivität (Deep-Link). Auslöser-Ausschluss + „Empfänger ohne Token still übersprungen" bestätigt.
  - **iOS: ✅ im Simulator verifiziert (2026-06-28)** auf `iPhone 17` (iOS 26.5), Firebase iOS-App `com.zusammen.app` (Projekt `zusammen-de6ea`). `GoogleService-Info.plist` ins iOS-Projekt eingebaut (in `ios/App/App/` + als Bundle-Resource in `project.pbxproj` registriert) → `npx cap sync ios` → Build via externem `-derivedDataPath` (FB iOS-SDK via SwiftPM zieht das Plugin selbst). App startet sauber (FirebaseApp.configure() ohne Crash, Login-Screen). Verifiziert per **simuliertem Push** `xcrun simctl push` (kein echtes APNs/Token nötig): Erlaubnis-Dialog→„Erlauben" (Profil-Sektion), **Vordergrund-Toast** (sonner mit „Öffnen", kein System-Banner), **Hintergrund-System-Banner**, und **Tap→Deep-Link** öffnet datengetrieben exakt die `activity_id` aus der Payload (mit zwei verschiedenen Zielen bewiesen: Dänemark-Urlaub-ID → Dänemark-Detail, Bowling-ID → Bowling-Detail). _Caveat:_ echte APNs-Zustellung + Token-Registrierung in `device_tokens` (`getToken()` braucht APNs) bleibt nur auf **physischem iOS-Gerät** testbar (Apple Developer Program + Push Key .p8 → Firebase).
- [x] **Termin-„bestätigt"-Definition:** entschieden in `/architecture` — gilt als bestätigt, wenn `activities.start_date` von leer auf einen festen Wert wechselt („der Termin steht"). Sauber abgegrenzt vom „In Planung"-Trigger. (2026-06-28)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Fünf Trigger: neuer Vorschlag, Aktivität in Planung, Termin bestätigt, @-Erwähnung im Kommentar, Verantwortung erhalten | Vom Nutzer ausgewählt; deckt die entscheidungs-/handlungsrelevanten Momente ab, ohne mit Kommentar-Rauschen zu nerven (Kommentar nur bei @-Erwähnung) | 2026-06-28 |
| Kommentar löst Push **nur bei @-Erwähnung** aus | Verhindert Benachrichtigungs-Flut bei lebhaften Diskussionen; `mentioned_user_ids` existiert bereits auf `activity_comments` (kein Zusatzaufwand) | 2026-06-28 |
| Nur OS-Erlaubnis in PROJ-10, **keine** Pro-Typ-Schalter | Hält PROJ-10 fokussiert; feingranulare Einstellungen + In-App-Center sind eigenes Feature PROJ-12 (Single Responsibility) | 2026-06-28 |
| Erlaubnis als **Soft-Ask im Onboarding** (PROJ-13), erst danach OS-Dialog | Schont die einmalige iOS-Chance auf den System-Dialog; erklärt den Nutzen vor dem harten Prompt → bessere Zustimmungsrate | 2026-06-28 |
| Nachträgliches Aktivieren über das **Profil** möglich | Onboarding läuft nur einmal; ohne Nachweg gäbe es nie eine zweite Chance, Push zu erlauben | 2026-06-28 |
| Tap navigiert **direkt zum Kontext** (Gruppen-Tab / Aktivität), auch Cold Start | Maximiert den Nutzen der Benachrichtigung; nutzt das bereits in PROJ-9 gebaute Deep-Link-/Cold-Start-Fundament | 2026-06-28 |
| Vordergrund: **In-App-Toast** (sonner), kein System-Banner, kein Posteingang | Hinweis geht nicht verloren, bleibt aber leichtgewichtig; voller Posteingang ist PROJ-12 | 2026-06-28 |
| Beide Plattformen, **iOS zuerst** | Gleiche Reihenfolge/Begründung wie PROJ-9 (Entwickler am Mac, Deep-Link/OAuth früh absichern) | 2026-06-28 |
| Benachrichtigungstext **mit Name & Titel** (Deutsch) | Am nützlichsten und motiviert zum Öffnen; Inhalte sind nur Aktivitätstitel, keine sensiblen Daten → Sperrbildschirm-Anzeige vertretbar | 2026-06-28 |
| **Auslöser bekommt nie** eine Push über die eigene Aktion | Selbstbenachrichtigung ist störend und sinnlos | 2026-06-28 |
| Multi-Device: Push an **alle** registrierten Geräte des Nutzers | Nutzer wechseln zwischen Geräten; eine Zustellung pro Gerät ist erwartetes Verhalten | 2026-06-28 |
| **Kein** Web-Push, kein Digest/Ruhezeiten, keine Rich-/Action-Notifications, kein Badge-Count im MVP | Scope schlank halten; alles nachrüstbar | 2026-06-28 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| **Ein Versandkanal: FCM (Firebase Cloud Messaging) für iOS UND Android** | Statt zwei getrennte Server-Integrationen (APNs + FCM) zu bauen, läuft alles über die FCM v1 HTTP API. Der Apple Push Key (.p8) wird einmalig in Firebase hochgeladen; Firebase leitet an APNs weiter. Halbiert Server-Code und Credentials — passend für Solo-Dev. | 2026-06-28 |
| **Geräte-Token via `@capacitor-firebase/messaging`** (statt nur `@capacitor/push-notifications`) | Liefert auf beiden Plattformen ein einheitliches FCM-Token (auf iOS über die Firebase-SDK, die APNs darunter kapselt). Erlaubnis-Anfrage + Empfang + Tap-Listener kommen vom selben Plugin → ein konsistenter Code-Pfad. Das in PROJ-9 installierte `@capacitor/push-notifications` wird dadurch ersetzt. | 2026-06-28 |
| **Neue Tabelle `device_tokens` (Token pro Gerät, mehrere pro Nutzer)** | Multi-Device-Anforderung: ein Nutzer kann auf mehreren Geräten registriert sein. Trennung von `profiles`, damit Tokens unabhängig kommen/gehen können (Logout, Deinstallation, Rotation). | 2026-06-28 |
| **Versand serverseitig in einer Supabase Edge Function (`send-push`) mit Service-Role** | Service-Keys (Firebase) dürfen nie im Client liegen. Die Funktion ermittelt Empfänger über die DB (RLS-konform durch bewusste Service-Logik), holt deren Tokens und verschickt. Passt zum vorhandenen Edge-Function-Muster (`generate-invite-code`, `get-group-availability`). | 2026-06-28 |
| **Auslösung über Supabase Database Webhooks auf 4 Tabellen** | `activities` (INSERT + UPDATE), `activity_comments` (INSERT), `activity_responsibilities` (INSERT). Die DB feuert bei jedem relevanten Ereignis automatisch → kein Client-Anstoß nötig, funktioniert auch wenn der Auslöser offline geht. Die Funktion klassifiziert das Ereignis und bestimmt Empfänger. | 2026-06-28 |
| **„Termin bestätigt" = `start_date` wechselt von leer auf einen festen Wert** | Eindeutiger, datenbasierter Moment („der Termin steht"). Sauber abgegrenzt vom „In Planung"-Trigger (Kanban-Eintritt `vorschlag`→`zu_planen`), daher keine Doppel-Push. | 2026-06-28 |
| **Auslöser-Ausschluss serverseitig** (nicht im Client) | Die Edge Function entfernt den Verursacher (`initiator_id` / Kommentar-Autor / `created_by`) aus dem Empfängerkreis. Zentral und nicht umgehbar. | 2026-06-28 |
| **Ungültige Tokens werden beim Versand aufgeräumt** | Meldet FCM ein Token als ungültig (App deinstalliert / rotiert), löscht die Funktion die Zeile aus `device_tokens` → keine ins Leere laufenden Sends. | 2026-06-28 |
| **Deep-Link-Daten in der Push-Payload, Navigation über PROJ-9-Fundament** | Jede Push trägt Ziel-Infos (Gruppe / Aktivität) als Daten mit. Der Tap-Handler nutzt denselben Deep-Link-/Cold-Start-Mechanismus wie PROJ-9 (`src/lib/native/deep-link.ts`), statt einen zweiten Navigationsweg zu bauen. | 2026-06-28 |
| **Vordergrund-Toast über `sonner`** (bereits im Projekt) | Kein neues UI-Paket nötig; flüchtiger, antippbarer Hinweis. Voller Posteingang bleibt PROJ-12. | 2026-06-28 |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Überblick (ein Satz)
Die App registriert auf nativen Geräten ein FCM-Token pro Nutzer; die Datenbank feuert bei fünf Gruppen-Ereignissen automatisch eine serverseitige Funktion, die die richtigen Empfänger ermittelt und ihnen über Firebase eine Push schickt — ein Tap bringt den Nutzer direkt in den passenden Kontext.

### A) Was wird gebaut — Bausteine

**1. Native App-Seite (nur hinter `isNativePlatform()`)**
```
Native Shell (bestehend)
+-- Push-Logik (neu: src/lib/native/push.ts)
|   +-- Erlaubnis anfragen (Soft-Ask hat schon zugestimmt)
|   +-- FCM-Token holen
|   +-- Token serverseitig speichern (beim Login / bei Aktivierung)
|   +-- Token entkoppeln (beim Logout)
|   +-- Listener: Push empfangen (Vordergrund) -> sonner-Toast
|   +-- Listener: Push angetippt -> Deep-Link-Navigation (PROJ-9-Fundament)
+-- NativePushListener (neu: Komponente, mountet die Listener wie die anderen Native*-Komponenten)
+-- Onboarding: Push-Soft-Ask-Schritt (in PROJ-13-Flow eingehängt)
|   +-- erklärt den Nutzen -> "Erlauben" löst OS-Dialog aus / "Später" überspringt
+-- Profil: Push-Sektion (neu)
    +-- "Benachrichtigungen aktivieren" (Nachweg, da Onboarding nur 1x läuft)
    +-- bei dauerhaft verweigerter OS-Erlaubnis -> Hinweis/Link zu System-Einstellungen
```

**2. Server-Seite (Supabase)**
```
Datenbank-Ereignis (Database Webhook)
+-- activities  INSERT (status=vorschlag)        -> "Neuer Vorschlag"
+-- activities  UPDATE (vorschlag->zu_planen)    -> "Wird jetzt geplant"
+-- activities  UPDATE (start_date leer->gesetzt)-> "Termin steht"
+-- activity_comments        INSERT              -> "@-Erwähnung"
+-- activity_responsibilities INSERT             -> "Verantwortung erhalten"
        |
        v
Edge Function "send-push" (Service-Role, vertrauenswürdig)
+-- Ereignistyp + auslösenden Nutzer erkennen
+-- Empfängerkreis bestimmen (aktuelle Gruppenmitglieder bzw. Erwähnte/Zugewiesene)
+-- Auslöser selbst entfernen
+-- Geräte-Tokens der Empfänger laden (Empfänger ohne Token still überspringen)
+-- Deutsche Nachricht mit Name + Titel bauen + Deep-Link-Daten anhängen
+-- an FCM v1 senden -> ungültige Tokens löschen
```

### B) Datenmodell (Klartext, keine Technik-Details)

**Neu: Geräte-Token (`device_tokens`)**
```
Jedes registrierte Gerät hat:
- eine eindeutige ID
- den Nutzer, dem es gerade gehört (Verweis auf das Profil)
- das FCM-Token (der "Briefkasten" des Geräts bei Firebase)
- die Plattform (ios / android)
- Zeitstempel: erstellt / zuletzt aktualisiert

Regeln:
- Ein Token ist eindeutig (kein Token doppelt).
- Ein Nutzer kann mehrere Geräte haben (mehrere Zeilen).
- Loggt sich ein anderer Nutzer auf demselben Gerät ein, wird das Token
  dem neuen Nutzer zugeordnet (Re-Login-Fall aus den Edge Cases).
- Beim Logout wird das Token des Geräts entfernt/entkoppelt.
- Nur der Nutzer selbst darf seine eigenen Tokens sehen/anlegen (RLS);
  der Versand liest sie über die vertrauenswürdige Funktion.

Gespeichert in: Supabase-Datenbank (eine neue Tabelle).
```
Es werden **keine** Benachrichtigungen historisiert (kein Posteingang — das ist PROJ-12). Die Push selbst ist flüchtig.

### C) Empfänger-Logik je Ereignis
| Ereignis | Empfänger | Ausgeschlossen |
|----------|-----------|----------------|
| Neuer Vorschlag | alle aktuellen Mitglieder der Gruppe | Ersteller (`initiator_id`) |
| Wird geplant (`vorschlag`→`zu_planen`) | alle aktuellen Mitglieder | der Auslöser des Statuswechsels |
| Termin steht (`start_date` gesetzt) | alle aktuellen Mitglieder | der Auslöser |
| @-Erwähnung im Kommentar | nur `mentioned_user_ids` | Kommentar-Autor (auch falls selbst erwähnt) |
| Verantwortung erhalten | nur `assigned_user_id` | `created_by` (falls = zugewiesener Nutzer) |

Empfängerkreis ist immer **aktuelle Gruppenmitgliedschaft** — wer raus ist, bekommt nichts.

### D) Tech-Entscheidungen (Warum)
- **FCM als einziger Kanal:** ein Server-Integrationspfad statt zwei (APNs + FCM). Apple-Key wird in Firebase hinterlegt; Firebase spricht APNs für uns. Weniger Code, weniger Geheimnisse, schneller fertig. → iOS zuerst, Android direkt danach mit demselben Code.
- **Database Webhooks statt Client-Anstoß:** Die Push entsteht zuverlässig aus der Datenänderung selbst — auch wenn der auslösende Nutzer die App sofort schließt. Kein doppelter Versand desselben Ereignisses, weil genau eine Datenänderung genau einen Webhook auslöst.
- **Versand in einer Edge Function mit Service-Role:** Firebase-Server-Credentials bleiben serverseitig (nie im Client). Empfängerermittlung passiert vertrauenswürdig und mitgliedschafts-konform.
- **Deep-Link über das PROJ-9-Fundament:** wir bauen keinen zweiten Navigationsweg, sondern hängen die Ziel-Daten in die Push und füttern damit den bestehenden Warm-/Cold-Start-Mechanismus.
- **Vordergrund-Toast über `sonner`:** schon im Projekt vorhanden, keine neue Abhängigkeit.

### E) Abhängigkeiten (zu installieren)
- `@capacitor-firebase/messaging` — einheitliches FCM-Token + Push-Empfang/Tap auf iOS & Android.
- (ersetzt das in PROJ-9 installierte `@capacitor/push-notifications` — wird im `/frontend`/`/backend`-Schritt entfernt.)
- Server: kein neues npm-Paket; die Edge Function spricht die FCM v1 REST-API direkt (signiert mit dem Firebase-Service-Account).

### F) Manuelle Einrichtung (nicht automatisierbar — Erinnerung)
1. Firebase-Projekt anlegen; `google-services.json` (Android) ins Android-Projekt; Firebase-Config (iOS) ins iOS-Projekt.
2. Apple Push Key (.p8) in Apple Developer erzeugen und in Firebase (Cloud Messaging) hochladen.
3. Firebase-Service-Account-Credentials sicher als Supabase-Secret hinterlegen (für die Edge Function).
4. End-to-End-Test auf **physischen** Geräten (Simulator/Emulator liefern Push nur eingeschränkt).
→ Diese vier Punkte stehen bereits als Open Questions im Spec.

## Frontend Implementation Notes (/frontend, 2026-06-28)

**Was gebaut wurde (Client-Hälfte — Server-Hälfte folgt in /backend):**

- **`src/lib/native/push.ts`** — zentrale Push-Bridge, komplett hinter `isNativePlatform()` (No-op im Web):
  - `getPushPermissionState()`, `requestPushPermission()` (Soft-Ask-„Erlauben"-Pfad: OS-Dialog → Token registrieren), `syncDeviceTokenIfPermitted()` (App-Start/Re-Login, ohne Dialog), `registerDeviceToken()` (FCM-Token holen + `device_tokens`-Upsert mit `onConflict: 'token'` für den Re-Login-Fall), `removeDeviceToken()` (Logout-Entkopplung).
  - `registerPushListeners()` mountet 3 Listener: `tokenReceived` (Rotation → neu speichern), `notificationReceived` (Vordergrund → antippbarer **sonner**-Toast mit „Öffnen"-Action, kein System-Banner), `notificationActionPerformed` (Tap → Deep-Link-Navigation).
  - Reine, getestete Helfer: `parsePushTarget()` (akzeptiert snake_case + camelCase aus der FCM-Payload), `pushTargetToPath()` (→ `/groups/view/?id=…&tab=…&activity=…`, Trailing-Slash für Static Export), `navigateToPushTarget()` (Full-Page-Load wie das Auth-Deep-Link-Fundament).
- **`src/components/native/NativePushListener.tsx`** — mountet die Listener einmalig + synchronisiert das Token, sobald ein User authentifiziert ist (Cold Start mit Session, Re-Login). In `layout.tsx` neben den anderen `Native*`-Komponenten eingehängt.
- **`src/components/onboarding/PushStep.tsx`** — Soft-Ask-Schritt; erklärt den Nutzen **vor** dem OS-Dialog. In `OnboardingFlow.tsx` als Schritt `['welcome','profile','push','group']` eingehängt — **nur nativ** und nur beim Erst-Login (im Web entfällt der Schritt). „Später" überspringt; beide Wege führen weiter.
- **`src/components/profile/PushNotificationSection.tsx`** + **`src/hooks/usePushPermission.ts`** — Nachweg im Profil (Onboarding läuft nur 1×). Zustände: `prompt` → „Aktivieren" (OS-Dialog), `granted` → Bestätigung, `denied` (dauerhaft) → verständlicher Hinweis auf die System-Einstellungen statt Sackgasse. Im ProfileSheet **nur nativ** gerendert (vermeidet doppelte Separatoren im Web).
- **Deep-Link-Ziel:** `src/app/groups/view/page.tsx` liest jetzt `?activity=<id>`, öffnet das `ActivityDetailSheet` und strippt den Param wieder (Schließen öffnet es nicht erneut). Nicht mehr existierende Inhalte fängt das Sheet bzw. der „Gruppe nicht gefunden"-Fallback ab.
- **Logout-Entkopplung:** `AuthContext.signOut()` ruft `removeDeviceToken()` vor dem Abmelden (No-op im Web).

**Abhängigkeiten:**
- `@capacitor-firebase/messaging@^8.3.0` (passend zu Capacitor 8) installiert; **ersetzt** `@capacitor/push-notifications` (deinstalliert, `npx cap sync` ausgeführt — beide Native-Projekte aktualisiert).
- `firebase@^12` als (optionale) Peer-Dependency installiert, damit der Web-Fallback des Plugins den Vercel-Build nicht bricht — landet nur im lazy Web-Chunk, der nativ nie geladen wird.

**Hinweise / bewusste Auslassungen:**
- `device_tokens` wird über einen ungetypten Client-View (`db`) angesprochen, da die generierten Supabase-Typen die Tabelle noch nicht kennen. **/backend** erstellt Tabelle + RLS und regeneriert `database.types.ts`; danach kann der Cast in `push.ts` entfernt werden.
- **Server-Hälfte offen (/backend):** Tabelle `device_tokens` (+RLS), Edge Function `send-push`, Database Webhooks auf den 4 Tabellen, FCM-v1-Versand, Auslöser-Ausschluss + Token-Cleanup.
- **Manuell offen:** Firebase-Projekt/Config (`google-services.json`, iOS-Plist, Apple Push Key .p8 → Firebase), Service-Account als Supabase-Secret, On-Device-E2E-Test. (siehe Open Questions)
- **Verifikation:** `npm run build` (Static Export) grün, `npx tsc` für PROJ-10-Dateien sauber, alle 217 Unit-Tests grün (inkl. neuer `push.test.ts`, 12 Tests). End-to-End-Push ist nur auf physischen Geräten testbar (manuelle Open Question).

## Backend Implementation Notes (/backend, 2026-06-28)

**Was gebaut wurde (Server-Hälfte — Client-Hälfte stand bereits aus /frontend):**

- **Tabelle `device_tokens`** (`supabase/migrations/20260628_proj10_device_tokens.sql`): `id, user_id→profiles(on delete cascade), token (unique), platform ('ios'|'android'|'web'), created_at, updated_at`. Index auf `user_id` (Empfänger-Lookup im Versand). RLS aktiv: **SELECT/DELETE nur eigene** Tokens (`auth.uid() = user_id`, `to authenticated`).
- **RPC `register_device_token(p_token, p_platform)`** (SECURITY DEFINER) statt direktem Client-Insert/Upsert: stempelt immer `user_id = auth.uid()` und macht `on conflict (token) do update`. Damit funktioniert der **Re-Login-Fall** (Token-Zeile wird dem neuen Nutzer zugeordnet) **ohne** eine permissive `USING(true)`-UPDATE-Policy. `push.ts` registriert jetzt über `supabase.rpc('register_device_token', …)`; der frühere ungetypte `db`-Cast ist entfernt.
- **Actor-Tracking:** Spalte `activities.last_changed_by` + BEFORE-INSERT/UPDATE-Trigger `set_activity_last_changed_by()` (setzt `auth.uid()`). Nötig, weil der UPDATE-Webhook sonst nicht weiß, **wer** den Statuswechsel/Termin ausgelöst hat — so kann der Versand den Auslöser zuverlässig ausschließen (NULL bei Service-Role-Änderungen → niemand ausgeschlossen).
- **Database Webhooks via `pg_net`** (`supabase/migrations/20260628_proj10_push_webhooks.sql`): vier AFTER-Trigger rufen `proj10_dispatch_push()` → `net.http_post` an die Edge Function. Enge `WHEN`-Klauseln vermeiden unnötige Aufrufe:
  - `activities` INSERT `WHEN status='vorschlag'`
  - `activities` UPDATE `WHEN (vorschlag→zu_planen) OR (start_date null→gesetzt)`
  - `activity_comments` INSERT `WHEN array_length(mentioned_user_ids,1)>0`
  - `activity_responsibilities` INSERT `WHEN assigned_user_id IS NOT NULL`
  - Webhook-Auth: das gemeinsame Secret liegt in **Supabase Vault** (`push_webhook_secret`, in der Migration zufällig generiert) und wird als Header `x-webhook-secret` mitgeschickt. Trigger- und Hilfsfunktionen sind gegen RPC-Aufruf gesperrt (`revoke execute … from public, anon, authenticated`).
- **Edge Function `send-push`** (`supabase/functions/send-push/`, deployed, `verify_jwt=false`): prüft `x-webhook-secret` gegen `PUSH_WEBHOOK_SECRET`, klassifiziert das Ereignis (`logic.ts`), löst Empfänger über **aktuelle Gruppenmitgliedschaft** auf (Erwähnte/Zugewiesene werden mit der Mitgliederliste geschnitten), **entfernt den Auslöser**, lädt deren Tokens (Empfänger ohne Token still übersprungen), baut die deutsche Nachricht + Deep-Link-Daten (`group_id/activity_id/tab`) und sendet via **FCM v1** (Service-Account-JWT → OAuth → `messages:send`). **Token-Cleanup:** bei `UNREGISTERED`/404/`INVALID_ARGUMENT` wird die Zeile gelöscht. Fehlt `FCM_SERVICE_ACCOUNT` (vor Firebase-Setup), degradiert die Funktion sauber (kein Fehler, kein Versand).
- **Reine Logik in `logic.ts`** (kein Deno/Netz-Import) → mit Vitest getestet: `logic.test.ts` (**21 Tests**, decken Klassifizierung aller 5 Ereignisse, Auslöser-Ausschluss, Mitglieder-Schnitt, Nachrichtentexte/Datumsformat, Deep-Link-Tabs ab).

**Verifikation:** `npm run build` (Static Export) grün · `npx tsc` für PROJ-10-Dateien sauber (vorbestehende Noise in `ical-export.test.ts` + generiertem `.next`-Duplikat unberührt) · **alle 238 Unit-Tests grün** (25 Dateien, inkl. der 21 neuen). `get_advisors (security)` nach den Migrationen geprüft: keine neue kritische Lücke; die einzige permissive Policy wurde durch die RPC vermieden.

**Manuell offen (nicht automatisierbar — siehe Open Questions):**
1. **Firebase-Projekt** anlegen; `google-services.json` (Android) + iOS-Plist in die Native-Projekte; Apple Push Key (.p8) in Firebase → Cloud Messaging hochladen.
2. **Supabase Function Secrets** setzen: `FCM_SERVICE_ACCOUNT` = Service-Account-JSON, `PUSH_WEBHOOK_SECRET` = der in Vault generierte Wert. Den Vault-Wert holst du dir z. B. im SQL-Editor mit `select decrypted_secret from vault.decrypted_secrets where name = 'push_webhook_secret';` und trägst ihn 1:1 als Function-Secret ein (beide Seiten müssen identisch sein). `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` stellt Supabase automatisch bereit.
3. **On-Device-E2E-Test** auf physischem iOS- und Android-Gerät (Simulator/Emulator liefern Push nur eingeschränkt).

## QA Test Results (/qa, 2026-06-28)

**Tester:** QA Engineer + Red-Team · **Build:** static export green · **Unit tests:** 238/238 pass (25 files), incl. 33 PROJ-10 tests (`push.test.ts` 12, `send-push/logic.test.ts` 21).

### Test approach (warum kein Browser-E2E)
Push existiert **nur** in der nativen Hülle; im Web sind alle Pfade No-ops hinter `isNativePlatform()`. Browser-E2E (Playwright) kann native Push **nicht** auslösen — ein Web-Test prüft nur No-ops. Daher wurde stattdessen geprüft:
- **Pure Logik** (Klassifizierung, Empfänger-Auflösung, Nachrichtentexte, Deep-Link-Parsing/-Pfade) über die bestehenden 33 Unit-Tests — alle grün.
- **Live-Infrastruktur** direkt in Supabase verifiziert (Tabelle/RLS/Trigger/Vault/Edge Function).
- **Statische Analyse** der Client- und Server-Hälfte gegen jedes Acceptance Criterion.
- **On-Device-Beweis** liegt bereits vor (Open Questions): Android E2E auf Emulator ✅, iOS im Simulator (simulierter Push) ✅.

### Live-Infrastruktur (Supabase, Projekt `fogldssdmqgeffpuhvxd`)
| Prüfung | Ergebnis |
|---------|----------|
| Tabelle `device_tokens` (RLS aktiv, FK→profiles, unique token, Index user_id) | ✅ vorhanden, 1 Token (Android-Emulator) |
| RLS-Policies `device_tokens` | ✅ nur SELECT/DELETE **eigene** (authenticated). **Kein** INSERT/UPDATE-Policy → Registrierung nur über RPC |
| RPC `register_device_token` (SECURITY DEFINER, `auth.uid()`-Stempel, on-conflict-Reassign) | ✅ live, grant nur `authenticated`/`service_role` |
| Trigger `set_activity_last_changed_by` (Actor-Tracking) | ✅ aktiv |
| Push-Webhooks (5 Trigger: activities INSERT/UPDATE, comments INSERT, responsibilities INSERT) | ✅ alle aktiv mit engen WHEN-Klauseln |
| Vault-Secret `push_webhook_secret` | ✅ vorhanden |
| Edge Function `send-push` | ✅ ACTIVE, `verify_jwt=false` (per Design; eigene `x-webhook-secret`-Prüfung) |
| Integrations-Pfad „wird geplant" | ✅ `vorschlag→zu_planen` wird vom bestehenden `update_activity_votes_count`-Trigger gesetzt → matcht die Webhook-WHEN-Klausel |

### Acceptance Criteria
**Berechtigung & Token-Registrierung**
- [x] Soft-Ask im Onboarding vor OS-Dialog — `PushStep.tsx`, nur nativ in `OnboardingFlow`. ✅
- [x] „Erlauben" → Token serverseitig pro Nutzer — `requestPushPermission()` → `registerDeviceToken()` → RPC. ✅
- [x] Ablehnen → App läuft weiter, kein Token — beide Wege rufen `onNext()`; kein Token ohne `granted`. ✅
- [x] Nachträgliches Aktivieren / dauerhaft verweigert → System-Einstellungen — `PushNotificationSection` + `usePushPermission` (prompt/granted/denied). ✅
- [x] Multi-Device → an alle Geräte — `device_tokens` mehrzeilig pro Nutzer, Versand `.in('user_id', recipientIds)`. ✅ (iOS-Hardware s. Hinweis)

**Auslösende Ereignisse**
- [x] Neuer Vorschlag → alle außer Ersteller — `classifyEvent` new_proposal, actor=`initiator_id`. ✅
- [x] Wird geplant → alle Mitglieder — now_planning (Voting-Trigger erzeugt den Statuswechsel). ✅ (Auslöser ausgeschlossen, s. Finding QA-10-3)
- [x] Termin bestätigt → alle Mitglieder, Titel + Datum — date_set, `formatGermanDate`. ✅
- [x] @-Erwähnung → nur Erwähnte — mention, Schnitt mit Mitgliedschaft, Autor ausgeschlossen. ✅
- [x] Verantwortung → nur Zugewiesener — responsibility, `created_by` ausgeschlossen. ✅
- [x] Auslöser bekommt nie eigene Push — `resolveRecipients` filtert `actorId` zentral serverseitig. ✅
- [x] Kein Mitglied (mehr) → keine Push — Empfänger = aktuelle `group_members`. ✅

**Tap & Vordergrund**
- [x] Cold Start → direkter Kontext — `notificationActionPerformed` → `navigateToPushTarget` (Full-Page-Load), AuthGuard fängt ausgeloggt ab. ✅
- [x] Hintergrund-Tap → Kontext — gleicher Listener. ✅
- [x] Vordergrund → antippbarer sonner-Toast, kein Banner — `notificationReceived`. ✅

**Inhalt**
- [x] Name + Titel, Deutsch — `buildMessage` (5 Texte, getestet). ✅

### Edge Cases
- [x] Onboarding übersprungen → Profil-Nachweg. ✅
- [x] OS dauerhaft verweigert → Hinweis auf Systemeinstellungen. ✅
- [x] Ungültiges Token → Cleanup bei `UNREGISTERED`/404 (s. Finding QA-10-1 zu `INVALID_ARGUMENT`). ✅/⚠️
- [x] Re-Login auf anderem Account → RPC on-conflict reassigned Token an neuen Nutzer; Logout entkoppelt (`removeDeviceToken`). ✅
- [x] Massen-Ereignisse → genau 1 Datenänderung = 1 Webhook, keine Doppelzustellung. ✅
- [x] Empfänger ohne Token → still übersprungen. ✅
- [x] Tap auf gelöschten Inhalt → `?activity=` Param wird vom DetailSheet/„Gruppe nicht gefunden" abgefangen, Param wird gestrippt. ✅
- [x] Cold Start ohne Login → AuthGuard leitet zu Login. ✅

### Security Audit (Red Team)
- ✅ **Service-Keys nie im Client:** FCM-Service-Account + Webhook-Secret nur serverseitig (Edge Function Secrets / Vault).
- ✅ **Webhook fail-closed:** ohne gesetztes `PUSH_WEBHOOK_SECRET` lehnt die Function **jede** Anfrage mit 401 ab; Secret-Vergleich konstant gegen Header.
- ✅ **RLS:** `device_tokens` ohne INSERT/UPDATE-Policy; Schreiben nur über SECURITY DEFINER-RPC mit erzwungenem `auth.uid()`. SELECT/DELETE nur eigene Zeilen.
- ✅ **Empfänger RLS-konform:** Versand schneidet immer mit aktueller Gruppenmitgliedschaft; Ausgetretene erhalten nichts.
- ✅ **Auslöser-Ausschluss serverseitig** (nicht umgehbar vom Client).
- ✅ **Keine sensiblen Daten** in der Payload (nur Aktivitätstitel + IDs; Sperrbildschirm-Anzeige bewusst akzeptiert).

### Findings (alle Low — keine Critical/High) · **aufgeräumt 2026-06-28**
| ID | Sev | Befund | Status |
|----|-----|--------|--------|
| QA-10-1 | Low | Token-Cleanup löschte auch bei `INVALID_ARGUMENT`. Das kann FCM auch bei **fehlerhafter Nachricht** (nicht bei totem Token) liefern — dann würden in einem Send alle gültigen Empfänger-Tokens gelöscht. | ✅ **Behoben (Code)** — `index.ts` löscht jetzt nur bei `UNREGISTERED`/`NOT_FOUND`/HTTP 404; andere Fehler werden geloggt, nicht gelöscht. **Redeploy der Edge Function erfolgt im `/deploy`-Schritt** (Code geändert, noch nicht live). |
| QA-10-2 | Low | `register_device_token` reassigned per `on conflict (token) do update` jedes Token an den Aufrufer. Wer ein **fremdes** FCM-Token kennt, könnte es übernehmen. Exploit erfordert das hochentropische Opfer-Token (nicht via RLS lesbar). | ✅ **Akzeptiert + dokumentiert** — Security-Note im Migrations-Kommentar (`20260628_proj10_device_tokens.sql`). Bewusster Re-Login-Mechanismus, kein neues Angriffsflächen-Risiko. |
| QA-10-3 | Low (Spec) | AC „wird geplant"/„Termin" sagte „**alle** Gruppenmitglieder", Implementierung + Decision Table schließen den Auslöser aus. | ✅ **Behoben** — beide AC-Texte an die Decision Table angeglichen („alle anderen, nicht der Auslöser"). |
| QA-10-4 | Low | Setzt eine einzelne UPDATE gleichzeitig `vorschlag→zu_planen` **und** `start_date`, feuert 1 Webhook; `classifyEvent` wählt `now_planning` und unterdrückt `date_set`. In der Praxis getrennte Nutzeraktionen. | ✅ **Akzeptiert + dokumentiert** — bewusste Präzedenz als Kommentar in `logic.ts` festgehalten. |
| QA-10-5 | Info | `pg_net` im `public`-Schema (Advisor WARN). | ✅ **Akzeptiert** — `pg_net` ist non-relocatable + Supabase-managed (Objekte liegen im `net`-Schema); `set schema` nicht möglich, Drop/Recreate zu riskant für INFO-Lint. Begründung als Kommentar in der Webhook-Migration. |

**Pre-existing (nicht PROJ-10):** Leaked-Password-Protection aus, `function_search_path_mutable` auf 3 Altfunktionen, `group_availability_cache` RLS-ohne-Policy, public `avatars`-Bucket-Listing. Unverändert aus früheren Features.

### Hinweis zur iOS-Hardware (Release-Gate, kein Code-Bug)
Echte **APNs-Zustellung + iOS-Token-Anlage** sind nur auf einem **physischen iPhone** prüfbar (Apple Push Key .p8 → Firebase, Open Question offen `[~]`). Code-seitig ist die iOS-Hälfte fertig und im Simulator (simulierter Push) bewiesen. Für die iOS-Store-Auslieferung muss der .p8-Schritt + ein On-Device-Test vor Release erfolgen.

### Production-Ready: **JA** (mit iOS-Hardware-Gate vor Store-Release)
Keine Critical/High-Bugs. Alle Findings sind Low/optional. Server-Pipeline live und Android E2E-bewiesen; iOS Code-fertig, echte APNs-Zustellung steht als dokumentierter manueller Schritt aus.

## Deployment (/deploy, 2026-06-28)

**Was live ging:**
- **Edge Function `send-push` → v4** (Supabase `fogldssdmqgeffpuhvxd`, ACTIVE, `verify_jwt=false`). Bringt den **QA-10-1-Fix** in Produktion: Token-Cleanup löscht nur noch bei `UNREGISTERED`/`NOT_FOUND`/HTTP 404 — **nicht** mehr bei `INVALID_ARGUMENT` (das FCM auch bei fehlerhafter Nachricht liefert und sonst alle gültigen Empfänger-Tokens eines Sends gelöscht hätte). Andere Fehler werden jetzt geloggt (`console.error`), nicht gelöscht. (Vorher live: v3 mit dem alten Verhalten.)
- **Web (Vercel `qt-voting-app`):** der Deep-Link-Pfad (`?activity=` in `groups/view`) ist über `origin/main` ausgeliefert. Auto-Deploy auf Push; Live-URL lädt sauber, keine Console-Errors.

**Pre-Deployment-Checks:** `npm run build` (Static Export) grün · `npm run lint` exit 0 · QA „Production-Ready: JA" (keine Critical/High) · Working Tree clean, `origin/main` == HEAD · keine Secrets im Code (FCM-Service-Account + Webhook-Secret nur als Supabase-Secrets/Vault).

**Post-Deployment-Verifikation:**
- Edge Function v4-Inhalt erneut gelesen → Fix bestätigt live.
- Production-URL `https://qt-voting-app.vercel.app` lädt (Titel „ZUSAMMEN"), keine Console-Errors/Warnings.

**Offen (Release-Gate, kein Code-Bug):** echte **APNs-Zustellung auf physischem iPhone** — Apple Push Key (.p8) in Apple Developer anlegen → in Firebase → Cloud Messaging hochladen → On-Device-E2E-Test. Android ist End-to-End bewiesen; iOS ist code-fertig und im Simulator verifiziert. Siehe Open Questions `[~]`.

- **Production URL:** https://qt-voting-app.vercel.app
- **Edge Function:** `send-push` v4 (Supabase-Projekt `fogldssdmqgeffpuhvxd`)
- **Deployed:** 2026-06-28
- **Git tag:** `v1.10.0-PROJ-10`

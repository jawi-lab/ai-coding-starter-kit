# PROJ-2: Authentifizierung & User Accounts

## Status: Planned
**Created:** 2026-06-21
**Last Updated:** 2026-06-21 (Open Questions geschlossen)

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — typisierter Supabase-Client, `profiles`-Tabelle mit RLS

## User Stories
- Als neuer Nutzer möchte ich mich mit E-Mail, Passwort und Anzeigename registrieren, damit ich einen persönlichen Account erstelle.
- Als neuer Nutzer möchte ich nach der Registrierung eine Bestätigungs-Mail erhalten und meinen Account per Link aktivieren, damit nur echte E-Mail-Adressen genutzt werden.
- Als bestehender Nutzer möchte ich mich mit E-Mail und Passwort einloggen, damit ich auf meine Gruppen und Aktivitäten zugreife.
- Als Nutzer möchte ich mich mit meinem Google-Account einloggen, damit ich keinen separaten Account anlegen muss.
- Als Nutzer möchte ich mich mit Apple einloggen, damit ich meinen Apple-Account nutzen kann (Pflicht für App Store).
- Als Nutzer möchte ich mein vergessenes Passwort per E-Mail zurücksetzen, damit ich meinen Account wiederherstellen kann.
- Als eingeloggter Nutzer möchte ich mich ausloggen können, damit mein Account auf dem Gerät gesichert ist.
- Als nicht-eingeloggter Nutzer, der eine geschützte Seite aufruft, möchte ich automatisch zur Login-Seite weitergeleitet werden.

## Out of Scope
- **Account löschen** — deferred to PROJ-8 (Nutzerprofil & Archiv), da Bereinigung von Gruppen/Aktivitäten komplexe Abhängigkeiten zu PROJ-3–7 hat
- **Facebook OAuth** — aus der Zielgruppe (Freundesgruppen 18–35) kaum relevant; erhöht Setup-Aufwand unverhältnismäßig
- **Profilbild beim Signup** — deferred to PROJ-8; `avatar_url` bleibt beim Signup `null`
- **Profilbearbeitung (Display-Name ändern, Avatar hochladen)** — deferred to PROJ-8
- **E-Mail-Adresse oder Passwort ändern** — deferred to PROJ-8
- **Benachrichtigungs-Einstellungen** — deferred to PROJ-8
- **Kalender-Verbindung** — deferred to PROJ-7
- **Push-Benachrichtigungen** — deferred to PROJ-10
- **„Redirect back to original URL" nach Login** — zu komplex für Static Export MVP; immer zur Home-Seite
- **Rate-Limiting eigener Implementierung** — Supabase Auth übernimmt das nativ
- **Magic Link (passwortlos)** — nicht im Konzept vorgesehen; E-Mail/Passwort + OAuth ist der definierte Ansatz

## Acceptance Criteria

### Registrierung (E-Mail/Passwort)
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er `/signup` aufruft, dann sieht er ein Formular mit den Pflichtfeldern E-Mail, Passwort, Anzeigename sowie einer AGB/Datenschutz-Checkbox
- [ ] Angenommen der Nutzer füllt das Formular korrekt aus und klickt „Registrieren", dann wird in Supabase Auth ein neuer User angelegt, ein `profiles`-Eintrag mit `status = 'pending'` und dem eingegebenen `display_name` erstellt, und der Nutzer wird zum Hinweis-Screen weitergeleitet
- [ ] Angenommen der Hinweis-Screen wird angezeigt, dann sieht der Nutzer die Info „Bestätigungs-Mail an [E-Mail] gesendet" sowie die Optionen „Mail erneut senden" und „Andere E-Mail-Adresse verwenden"
- [ ] Angenommen der Nutzer klickt „Mail erneut senden", dann wird die Bestätigungs-Mail erneut versendet und ein kurzes Feedback („Mail wurde erneut gesendet") angezeigt
- [ ] Angenommen die Bestätigungs-Mail wurde empfangen und der Nutzer klickt den Verifizierungs-Link, dann wird der Account-Status in `profiles` auf `active` gesetzt, der Nutzer wird automatisch eingeloggt und zur Home-Seite weitergeleitet
- [ ] Angenommen der Nutzer versucht sich mit einer bereits registrierten E-Mail-Adresse zu registrieren, dann wird die Fehlermeldung „Diese E-Mail-Adresse ist bereits registriert" angezeigt

### Login (E-Mail/Passwort)
- [ ] Angenommen der Nutzer ist nicht eingeloggt, wenn er `/login` aufruft, dann sieht er ein Formular mit E-Mail und Passwort sowie Buttons für Google- und Apple-Login
- [ ] Angenommen der Nutzer gibt korrekte Zugangsdaten eines `active`-Accounts ein, wenn er „Einloggen" klickt, dann wird eine Supabase-Session erstellt und der Nutzer zur Home-Seite weitergeleitet
- [ ] Angenommen der Nutzer gibt falsche Zugangsdaten ein, dann wird die Fehlermeldung „E-Mail oder Passwort falsch" angezeigt (kein Hinweis welches Feld falsch ist)
- [ ] Angenommen der Nutzer hat einen `pending`-Account (E-Mail noch nicht bestätigt) und versucht sich einzuloggen, dann sieht er den Hinweis „Bitte bestätige zuerst deine E-Mail-Adresse" mit der Option „Mail erneut senden"

### OAuth — Google
- [ ] Angenommen der Nutzer klickt „Mit Google einloggen", dann wird er zu Googles OAuth-Flow weitergeleitet
- [ ] Angenommen der OAuth-Flow ist erfolgreich und der Nutzer hat noch keinen Account, dann wird automatisch ein Supabase-User, ein `profiles`-Eintrag mit `status = 'active'` und dem Google-Anzeigenamen als `display_name` erstellt, und der Nutzer zur Home-Seite weitergeleitet
- [ ] Angenommen der OAuth-Flow ist erfolgreich und der Nutzer hat bereits einen Account mit dieser E-Mail, dann wird er eingeloggt und zur Home-Seite weitergeleitet (kein doppelter Account)

### OAuth — Apple
- [ ] Angenommen der Nutzer klickt „Mit Apple einloggen", dann wird er zu Apples Sign-in-with-Apple-Flow weitergeleitet
- [ ] Angenommen der Apple-OAuth-Flow ist erfolgreich und der Nutzer ist neu, dann wird automatisch ein `profiles`-Eintrag mit `status = 'active'` erstellt; als `display_name` wird der von Apple übermittelte Name verwendet (falls Apple keinen Namen übermittelt, wird der Teil der E-Mail vor `@` genutzt)
- [ ] Angenommen der Nutzer wählt bei Apple „E-Mail verbergen" (Relay-Adresse), dann funktioniert der Login trotzdem und ein Account wird angelegt

### Passwort zurücksetzen
- [ ] Angenommen der Nutzer klickt auf der Login-Seite „Passwort vergessen", dann wird er zu einem Formular mit einem E-Mail-Feld weitergeleitet
- [ ] Angenommen der Nutzer gibt eine registrierte E-Mail-Adresse ein und klickt „Reset-Link senden", dann erhält er eine E-Mail mit einem Passwort-Reset-Link und sieht die Bestätigung „Falls diese Adresse registriert ist, wurde eine Mail gesendet" (kein Unterschied bei unregistrierter Adresse — verhindert User-Enumeration)
- [ ] Angenommen der Nutzer klickt den Reset-Link in der Mail, dann wird er zu einem Formular weitergeleitet, in dem er ein neues Passwort eingeben kann
- [ ] Angenommen der Nutzer gibt ein gültiges neues Passwort ein und bestätigt es, dann wird das Passwort aktualisiert, der Nutzer eingeloggt und zur Home-Seite weitergeleitet

### Ausloggen
- [ ] Angenommen der Nutzer ist eingeloggt, wenn er auf „Ausloggen" klickt (erreichbar über das Profil-Menü), dann wird die Supabase-Session beendet und der Nutzer zur Login-Seite weitergeleitet

### Geschützte Routen (Auth Guard)
- [ ] Angenommen ein nicht-eingeloggter Nutzer ruft eine geschützte Route auf (alle Routen außer `/login`, `/signup`, `/auth/*`), dann wird er automatisch zu `/login` weitergeleitet
- [ ] Angenommen ein eingeloggter Nutzer ruft `/login` oder `/signup` auf, dann wird er automatisch zur Home-Seite weitergeleitet (kein erneutes Einloggen nötig)

### Validierung
- [ ] Angenommen das Signup-Formular wird abgeschickt, wenn das E-Mail-Feld keine gültige E-Mail-Adresse enthält, dann wird „Bitte gib eine gültige E-Mail-Adresse ein" angezeigt
- [ ] Angenommen das Signup-Formular wird abgeschickt, wenn das Passwort kürzer als 8 Zeichen ist, dann wird „Passwort muss mindestens 8 Zeichen lang sein" angezeigt
- [ ] Angenommen das Signup-Formular wird abgeschickt, wenn der Anzeigename leer ist, dann wird „Anzeigename ist erforderlich" angezeigt
- [ ] Angenommen das Signup-Formular wird abgeschickt, wenn die AGB-Checkbox nicht angehakt ist, dann wird „Bitte akzeptiere die AGB und Datenschutzerklärung" angezeigt

## Edge Cases
- **Bestätigungs-Link abgelaufen:** Supabase invalidiert Links nach 24 Stunden. Der Nutzer sieht eine Fehlermeldung mit dem Hinweis „Link abgelaufen — neuen anfordern" und einem Button zurück zum Hinweis-Screen.
- **Link bereits genutzt (bereits bestätigt):** Supabase erkennt doppelte Token-Nutzung. Der Nutzer sieht den Hinweis „Account bereits bestätigt" und wird zum Login weitergeleitet.
- **Apple übermittelt keinen Namen:** Nur beim ersten Apple-Login übermittelt Apple den Nutzernamen. Bei späteren Logins kommt kein Name. Fallback: E-Mail-Präfix (Teil vor `@`) als `display_name`.
- **OAuth-Popup geblockt:** Falls der Browser den OAuth-Popup blockiert, soll ein Hinweis erscheinen: „Bitte erlaube Popups für diese Seite."
- **Netzwerkfehler beim Login/Signup:** Falls Supabase nicht erreichbar ist, wird eine generische Fehlermeldung angezeigt: „Verbindungsfehler — bitte versuche es erneut." Formulardaten bleiben erhalten.
- **Session abgelaufen während der Nutzung:** Wenn die Supabase-Session während einer aktiven Sitzung abläuft, wird der Nutzer beim nächsten API-Call zur Login-Seite weitergeleitet.
- **Gleiche E-Mail via E-Mail + OAuth:** Supabase verknüpft automatisch Accounts mit identischer E-Mail (OAuth mit bestehendem E-Mail-Account). Kein manuelles Merging nötig.
- **`pending`-Status bei OAuth:** OAuth-Accounts erhalten direkt `status = 'active'` — keine E-Mail-Bestätigung nötig, da der OAuth-Provider die E-Mail bereits verifiziert hat.

## Technical Requirements
- Alle Auth-Seiten sind öffentlich zugänglich (kein Auth Guard auf `/login`, `/signup`, `/auth/*`)
- Auth-State wird über den Supabase-Client client-seitig verwaltet (`onAuthStateChange`)
- Session-Persistenz: Supabase-Standard (JWT in `localStorage`, automatisches Refresh)
- `profiles`-Tabelle braucht eine neue Spalte `status` (text, NOT NULL, default `'pending'`, check constraint: `'pending' | 'active'`) — Migration in PROJ-2
- Profile-Erstellung beim Signup: direkt nach Auth-User-Anlage per Client-Call (kein DB-Trigger) mit `status = 'pending'`; nach E-Mail-Bestätigung Update auf `status = 'active'` per Supabase Auth Webhook oder `/auth/callback`-Handler
- OAuth-Callback-URL: `/auth/callback` — verarbeitet den Supabase-Redirect und leitet zur Home-Seite weiter
- Alle Auth-Seiten nutzen Supabase-Formulare mit react-hook-form + Zod-Validierung

## Open Questions
- [x] Soll die AGB-Seite und Datenschutzerklärung als eigene statische Seiten in PROJ-2 existieren, oder reichen externe Links? → **Externe Links mit Platzhalter-URLs für MVP**
- [x] Wie lang soll der Reset-Link gültig sein? → **1 Stunde (Supabase-Standard) ist ausreichend**
- [x] Soll nach Signup der `pending`-Nutzer die Home-Seite sehen oder den Hinweis-Screen? → **Hinweis-Screen bis zur Bestätigung — kein Zugriff auf die App**

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| E-Mail/Passwort + Google + Apple (kein Facebook) | Facebook in Zielgruppe (18–35 Freundesgruppen) kaum noch dominant; Apple Pflicht für App Store wenn anderer OAuth-Provider vorhanden; Facebook erhöht Setup-Aufwand ohne klaren Nutzen | 2026-06-21 |
| Display-Name als Pflichtfeld beim Signup | Name wird sofort in Gruppenfeatures (PROJ-3+) für andere Mitglieder sichtbar; Auto-Fallback (E-Mail-Präfix) wirkt unprofessionell | 2026-06-21 |
| Passwort zurücksetzen in PROJ-2 | Ohne Reset-Flow sind E-Mail/Passwort-Nutzer dauerhaft ausgesperrt; Supabase unterstützt es nativ mit minimalem Aufwand | 2026-06-21 |
| Account-Löschung auf PROJ-8 verschoben | Bereinigung von Gruppen/Aktivitäten/Votes erfordert Kenntniss von PROJ-3–7; zu komplex für PROJ-2 | 2026-06-21 |
| Nach Login immer zur Home-Seite (kein „Redirect back") | Static Export hat keine serverseitige Redirect-Logik; Client-seitiges Merken der ursprünglichen URL erhöht Komplexität unverhältnismäßig | 2026-06-21 |
| Kein Magic Link | Nicht im Konzept vorgesehen; E-Mail/Passwort + OAuth deckt alle Nutzungsfälle ab | 2026-06-21 |
| Fehlermeldung „E-Mail oder Passwort falsch" (nicht differenziert) | Verhindert User-Enumeration (Angreifer kann nicht herausfinden welche E-Mails registriert sind) | 2026-06-21 |
| Reset-Bestätigung ohne Unterschied bei registrierter/unregistrierter E-Mail | Verhindert User-Enumeration beim Passwort-Reset-Flow | 2026-06-21 |
| AGB/Datenschutz als externe Links mit Platzhalter-URLs | Eigene statische Seiten sind für MVP unnötig; externe Links (z.B. Notion) reichen; Platzhalter werden vor Launch ersetzt | 2026-06-21 |
| Reset-Link-Gültigkeit: 1 Stunde (Supabase-Standard) | Ausreichend für den Nutzungskontext; kürzere Fenster erhöhen Support-Aufwand ohne Sicherheitsgewinn | 2026-06-21 |
| `pending`-Nutzer bleibt auf Hinweis-Screen bis zur E-Mail-Bestätigung | Kein teilweiser Zugriff auf die App mit unbestätigtem Account — klare UX, keine Sonderfälle in der Auth-Guard-Logik | 2026-06-21 |

### Technical Decisions
<!-- Added by /architecture -->
| Decision | Rationale | Date |
|----------|-----------|------|
| _To be added by /architecture_ | | |

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

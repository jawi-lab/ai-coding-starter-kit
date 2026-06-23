# PROJ-8: Nutzerprofil & Archiv

## Status: Architected
**Created:** 2026-06-22
**Last Updated:** 2026-06-23

## Dependencies
- PROJ-2 (Authentifizierung & User Accounts) — Supabase Auth Session, bestehende Login/Logout-Flows
- PROJ-6 (Aktivitäts-Detail) — ActivityDetailSheet wird im Archiv im read-only-Modus wiederverwendet

## User Stories
- Als angemeldeter Nutzer möchte ich meinen Anzeigenamen und mein Profilbild bearbeiten, damit andere Mitglieder mich in der App erkennen.
- Als angemeldeter Nutzer möchte ich meinen Google Kalender verbinden, damit die Terminfindung meine Verfügbarkeit automatisch berücksichtigt.
- Als angemeldeter Nutzer möchte ich manuelle Blockierungen (einzelne Tage oder Zeiträume) hinzufügen und löschen, damit meine Nicht-Verfügbarkeit auch ohne Google-Kalender für die Terminfindung sichtbar ist.
- Als angemeldeter Nutzer möchte ich meine abgeschlossenen Aktivitäten in einem persönlichen Archiv sehen, damit ich gemeinsame Erinnerungen bewahren kann.
- Als angemeldeter Nutzer möchte ich mich sicher abmelden können, damit mein Konto geschützt bleibt.

## Out of Scope
- Apple CalDAV / iCloud Kalender-Sync — zu komplex für Normalnutzer (App-spezifische Passwörter); auf spätere Version verschoben; Apple-Nutzer verwenden die manuelle Blockierung als Fallback
- Aktivitäten im Archiv reaktivieren / Status-Änderungen — `abgeschlossen` ist ein Terminalzustand
- Admin-Einsicht in fremde Profildaten (Blockierungen, Kalenderverbindung) — Verfügbarkeitsdaten sind nur via `get-group-availability` Edge Function (PROJ-7) sichtbar, nicht direkt
- Push-/E-Mail-Benachrichtigungen bei Kalender-Events → PROJ-12
- Profilbild-Zuschneiden / In-App-Bildbearbeitung
- Konto löschen / Datenschutz-Export (DSGVO-Feature — spätere Version)
- Stündliche Zeitblock-Granularität bei Blockierungen — nur Tagesebene (konsistent mit PROJ-7)
- Mehrere Google-Konten verbinden — nur ein Kalender pro Nutzer

## Acceptance Criteria

### Profil-Sheet öffnen

- [ ] Angenommen der Nutzer ist eingeloggt, wenn er auf den Avatar oben rechts in der Hauptnavigation tippt, dann öffnet sich das Profil-Sheet mit zwei Tabs: „Profil" und „Archiv".
- [ ] Angenommen das Profil-Sheet öffnet sich, dann ist der Tab „Profil" standardmäßig aktiv.
- [ ] Angenommen der Nutzer ist nicht eingeloggt, dann ist das Avatar-Icon nicht sichtbar.

### Profilbild & Anzeigename bearbeiten

- [ ] Angenommen der Nutzer ist im Profil-Tab, dann sieht er sein aktuelles Profilbild (oder einen Avatar-Platzhalter mit seinen Initialen), seinen Anzeigenamen und einen Bearbeiten-Button.
- [ ] Angenommen der Nutzer ändert seinen Anzeigenamen und speichert, dann wird der neue Name sofort in allen Gruppen-Ansichten, Mitgliederlisten und Abstimmungen der App aktualisiert.
- [ ] Angenommen der Nutzer versucht, einen leeren Anzeigenamen zu speichern, dann erscheint eine Validierungsfehlermeldung und der leere Name wird nicht gespeichert.
- [ ] Angenommen der Nutzer tippt auf sein Profilbild, dann öffnet sich der Gerätegalerie-/Kamera-Auswahldialog; nach Auswahl wird das Bild in Supabase Storage hochgeladen und erscheint sofort im Profil.
- [ ] Angenommen das ausgewählte Bild ist größer als 5 MB, dann erscheint eine Fehlermeldung vor dem Upload und kein Upload wird gestartet.
- [ ] Angenommen der Upload des Profilbilds schlägt fehl (Netzwerkfehler), dann erscheint eine Toast-Fehlermeldung und das bisherige Profilbild bleibt erhalten.

### Google Kalender verbinden

- [ ] Angenommen kein Google Kalender verbunden ist, dann zeigt der Profil-Tab im Abschnitt „Kalender-Verbindung" einen Button „Google Kalender verbinden".
- [ ] Angenommen der Nutzer tippt auf „Google Kalender verbinden", dann startet der Google OAuth 2.0 Consent-Flow (Scope: `https://www.googleapis.com/auth/calendar.readonly`).
- [ ] Angenommen der OAuth-Flow erfolgreich abgeschlossen ist, dann wird im Profil-Tab „Verbunden: [Google-E-Mail]" angezeigt und der Button wechselt zu „Kalender trennen".
- [ ] Angenommen der OAuth-Flow vom Nutzer abgebrochen oder ein Fehler auftritt, dann erscheint eine Toast-Fehlermeldung, kein Token wird gespeichert und der Verbindungsstatus bleibt unverändert.
- [ ] Angenommen der Google-Token ist abgelaufen (automatischer Refresh durch die Edge Function fehlgeschlagen), dann erscheint im Profil-Tab ein gelbes Warn-Banner: „Kalender-Verbindung abgelaufen — erneut verbinden" mit einem direkten „Erneut verbinden"-Button.

### Google Kalender trennen

- [ ] Angenommen der Nutzer tippt auf „Kalender trennen", dann erscheint ein Bestätigungs-Dialog: „Google Kalender trennen? Deine manuellen Blockierungen bleiben erhalten."
- [ ] Angenommen der Nutzer bestätigt das Trennen, dann werden die gespeicherten Google-Tokens aus der Datenbank gelöscht, der Verbindungsstatus wechselt zu „Nicht verbunden" und manuelle Blockierungen bleiben unverändert erhalten.
- [ ] Angenommen der Nutzer den Dialog abbricht, dann ändert sich nichts.

### Manuelle Blockierungen

- [ ] Angenommen der Nutzer ist im Profil-Tab, dann sieht er im Abschnitt „Meine Blockierungen" eine Liste seiner bestehenden Blockierungen und einen „+ Blockierung hinzufügen"-Button.
- [ ] Angenommen die Blockierungsliste ist leer, dann erscheint ein Leer-State: „Noch keine Blockierungen. Füge Zeiträume hinzu, wenn du nicht verfügbar bist."
- [ ] Angenommen der Nutzer tippt auf „+ Blockierung hinzufügen", dann öffnet sich ein Formular mit Pflichtfeld „Von" (Datum) und optionalem Feld „Bis" (Datum).
- [ ] Angenommen der Nutzer lässt „Bis" leer und speichert, dann wird eine eintägige Blockierung für das „Von"-Datum erstellt.
- [ ] Angenommen der Nutzer gibt ein „Bis"-Datum an, das vor dem „Von"-Datum liegt, dann erscheint eine Validierungsfehlermeldung und die Blockierung wird nicht gespeichert.
- [ ] Angenommen der Nutzer speichert eine valide Blockierung, dann erscheint sie sofort in der Liste und ist ab diesem Moment für die Terminfindung (PROJ-7) aktiv.
- [ ] Angenommen der Nutzer tippt auf eine bestehende Blockierung, dann erscheint ein Löschen-Button; ein Bestätigungs-Dialog erscheint vor dem Löschen.
- [ ] Angenommen der Nutzer bestätigt das Löschen, dann wird die Blockierung sofort aus der Liste und aus der Datenbank entfernt.

### Archiv

- [ ] Angenommen der Nutzer wechselt in den Archiv-Tab, dann sieht er alle Aktivitäten mit Status `abgeschlossen` aus allen Gruppen, in denen er Mitglied ist oder war, sortiert nach Abschlussdatum (neueste zuerst).
- [ ] Angenommen noch keine Aktivität den Status `abgeschlossen` hat, dann zeigt das Archiv einen Leer-State: „Noch keine abgeschlossenen Aktivitäten — eure erste gemeinsame Erinnerung wartet auf euch!"
- [ ] Angenommen der Nutzer ist in mehreren Gruppen, dann wird jede Archiv-Karte mit dem Gruppen-Namen als Badge gekennzeichnet.
- [ ] Angenommen der Nutzer tippt auf eine archivierte Aktivität, dann öffnet sich die ActivityDetailSheet im read-only-Modus: Status-Änderungen, Löschen und Bearbeiten sind deaktiviert; Fotos, Beschreibung und Termin bleiben sichtbar.

### Logout

- [ ] Angenommen der Nutzer tippt auf den Logout-Button im Profil-Tab, dann erscheint ein Bestätigungs-Dialog.
- [ ] Angenommen der Nutzer bestätigt den Logout, dann wird die Supabase-Session beendet und der Nutzer wird zur Login-Seite weitergeleitet.

## Edge Cases
- **Google-Token abgelaufen (nicht manuell getrennt):** Warn-Banner mit Reconnect-Button im Profil-Tab erscheint; in PROJ-7 wird dieses Mitglied als grau/unbekannt gewertet, bis der Reconnect erfolgt.
- **Start = Ende bei Blockierung:** Erlaubt — entspricht einer eintägigen Blockierung; wird identisch behandelt wie ein einzelner Tag ohne Enddatum.
- **Nutzer hat Gruppe verlassen:** Aktivitäten dieser Gruppe bleiben im Archiv sichtbar; die Erinnerung gehört dem Nutzer, nicht der Gruppe.
- **Archiv mit vielen Einträgen (50+):** Virtuelle Liste / Paginierung, um Performance zu gewährleisten.
- **Gleichzeitige Google + manuelle Blockierungen:** Beide Quellen sind unabhängig aktiv; die Edge Function (PROJ-7) kombiniert beide für die Verfügbarkeitsberechnung.
- **Kein Internet beim Profilbild-Upload:** Fehlermeldung erscheint, altes Bild bleibt erhalten, kein Datenverlust.
- **Anzeigename mit Sonderzeichen / sehr langer Name:** Maximal 50 Zeichen, alle Unicode-Zeichen erlaubt; serverseitige Validierung über RLS.
- **OAuth-Redirect in Static Export:** Callback-Seite (`/auth/google-calendar/callback`) im Static Export konfiguriert; technische Details → /architecture.

## Technical Requirements
- **Google OAuth 2.0 Scope:** `https://www.googleapis.com/auth/calendar.readonly` — nur Lese-Zugriff, kein Schreiben in den Kalender
- **Token-Speicherung:** Access Token + Refresh Token verschlüsselt in Supabase DB (Tabelle `calendar_connections`); RLS stellt sicher, dass nur der eigene Nutzer lesen/schreiben kann
- **Profilbild-Speicherung:** Supabase Storage Bucket `avatars`; öffentlicher Lese-Zugriff; Schreib-Zugriff nur für eigenen Nutzer via RLS
- **Profilbild-Größe:** Max. 5 MB; empfohlene Formate: JPEG, PNG, WebP
- **Archiv-Abfrage:** Client-seitig via Supabase JS — `activities` WHERE `status = 'abgeschlossen'` JOIN `group_members` WHERE `user_id = auth.uid()`, sortiert nach `completed_at DESC`
- **Read-only-Modus für ActivityDetailSheet:** Prop `readOnly: true` deaktiviert alle Mutationen
- **Static Export Kompatibilität:** Kein SSR, keine Server Actions; alle Datenoperationen via Supabase JS Client

## Open Questions
- [x] **OAuth-Callback in Static Export:** Gelöst — Supabase Edge Function als OAuth-Backend; `client_secret` nur server-seitig; statische Callback-Seite ruft Edge Function auf (siehe Tech Design). | 2026-06-23
- [x] **Token-Verschlüsselung:** Gelöst — RLS reicht für MVP; Google Access Tokens laufen nach 1h ab, Scope ist `calendar.readonly`; Supabase Vault für spätere Härtungssprint vorgemerkt. | 2026-06-23

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Archiv zeigt Aktivitäten gruppenübergreifend | PRD-Vision „persönliche Erinnerung" — gehört dem Nutzer, nicht der Gruppe; Nutzer sollen ihre komplette Geschichte an einem Ort sehen | 2026-06-22 |
| Archiv-Aktivitäten bei Gruppen-Austritt bleiben sichtbar | Erinnerungen gehören dem Nutzer; Rückwirkend löschen wäre destruktiv und widerspricht der Archiv-Vision | 2026-06-22 |
| Profil-Sheet mit zwei Tabs (Profil + Archiv) | Archiv ist kein eigener Navigation-Einstieg; passt zum One-Page-Sheet-Pattern der App (GroupDetailSheet, ActivityDetailSheet) | 2026-06-22 |
| Profil-Tab-Reihenfolge: Profil-Bild/Name → Kalender → Blockierungen → Logout | Primäre Identität zuerst, dann Verfügbarkeits-Tools, Logout am Ende als destruktive Aktion | 2026-06-22 |
| Google + manuelle Blockierungen koexistieren | Nutzer mit Google Kalender können zusätzliche Tage blockieren (z.B. geplante Offline-Zeit ohne Kalender-Eintrag); keine Redundanz, da unterschiedliche Datenquellen | 2026-06-22 |
| Bestätigungs-Dialog beim Kalender-Trennen | Irreversible Aktion (Token-Löschung) erfordert explizite Nutzerbestätigung; verhindert versehentliches Trennen | 2026-06-22 |
| Warn-Banner bei abgelaufenem Google-Token | Nutzer sollen jederzeit den korrekten Verbindungsstatus sehen; proaktiver Hinweis verhindert stille Fehler in der Terminfindung | 2026-06-22 |
| Nur ein Google-Konto pro Nutzer | Freundesgruppen-Use-Case: ein primärer Kalender ist ausreichend; Multi-Kalender-Support erhöht UI-Komplexität ohne klaren MVP-Nutzen | 2026-06-22 |
| Archiv read-only | `abgeschlossen` ist Terminalzustand; Reaktivierung gehört in ein explizites „Reaktivierungs"-Feature, nicht ins Archiv | 2026-06-22 |
| Profilbild max. 5 MB | Ausreichend für Kamera-Fotos; verhindert übermäßige Storage-Nutzung; entspricht gängiger Mobile-App-Praxis | 2026-06-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Google OAuth via Supabase Edge Function (nicht client-seitig) | Static Export kann `client_secret` nicht sicher im Browser-Bundle speichern; Edge Function agiert als sicheres OAuth-Backend und hält den Secret ausschließlich server-seitig | 2026-06-23 |
| RLS statt Supabase Vault für Token-Schutz (MVP) | Access Tokens laufen nach 1h ab; Scope ist `calendar.readonly` (keine Schreibrechte); RLS verhindert Zugriff durch andere Nutzer; Vault-Migration kostet Komplexität ohne MVP-Mehrwert | 2026-06-23 |
| ProfileSheet ersetzt DropdownMenu am Avatar | Bestehender Avatar öffnet nur ein DropdownMenu mit "Ausloggen"; ProfileSheet subsumiert dies — kein neuer Navigation-Einstieg, gleiche Geste, mehr Inhalt | 2026-06-23 |
| `ActivityDetailSheet` mit `readOnly` Prop wiederverwenden | Keine Duplikation; bestehende Sheet-Komponente deaktiviert via `readOnly={true}` alle Mutations; Fotos, Beschreibung und Termin bleiben sichtbar | 2026-06-23 |
| Archiv-Pagination via Supabase `.range()` + "Mehr laden" | Einfachste performante Lösung für 50+ Einträge ohne externe Library; passt zum bestehenden Supabase-Client-Muster | 2026-06-23 |
| Avatar-Upload via natives `<input type="file">` | Gibt auf Mobile sowohl Galerie als auch Kamera-Zugriff; keine Extra-Library nötig; 5-MB-Validierung client-seitig vor Upload | 2026-06-23 |

---

## Tech Design (Solution Architect)

### Einstiegspunkt & Navigation

Der bestehende **Avatar-Button** in der Hauptnavigation (`groups/page.tsx`) öffnet bisher ein DropdownMenu mit nur "Ausloggen". Dieser Button wird so angepasst, dass er stattdessen die neue **ProfileSheet** öffnet. Der Logout-Button wandert in den Profil-Tab.

### Komponentenstruktur

```
Header → Avatar Button (bestehend, angepasst → öffnet ProfileSheet)
│
└── ProfileSheet (neu — Bottom Sheet, zwei Tabs)
    │
    ├── Tab: Profil
    │   ├── ProfileSection
    │   │   ├── AvatarUpload (Bild-Tap → native Datei-Picker → Supabase Storage)
    │   │   └── DisplayNameField (inline Edit + Save, max 50 Zeichen)
    │   ├── CalendarConnectionSection
    │   │   ├── GoogleCalendarConnectButton (wenn nicht verbunden)
    │   │   ├── ConnectedCalendarBadge (Gmail-Adresse + "Trennen"-Button)
    │   │   └── ExpiredTokenWarningBanner (gelbes Banner + "Erneut verbinden")
    │   ├── DateBlocksSection
    │   │   ├── DateBlockList
    │   │   │   ├── DateBlockItem (Von–Bis + Löschen-Tap → Bestätigungs-Dialog)
    │   │   │   └── EmptyState ("Noch keine Blockierungen…")
    │   │   └── AddDateBlockForm (Von Pflichtfeld + optionales Bis)
    │   └── LogoutButton (am Ende, Bestätigungs-Dialog)
    │
    └── Tab: Archiv
        ├── ArchiveActivityCard × N (Gruppen-Badge + Name + Abschlussdatum)
        │   └── Tap → ActivityDetailSheet (readOnly=true, bestehend)
        ├── EmptyState ("Noch keine abgeschlossenen Aktivitäten…")
        └── "Mehr laden"-Button (20 Einträge pro Chunk, Supabase .range())

Neue statische Seite:
  /auth/google-calendar/callback
    └── Lädt-Spinner → ruft Edge Function auf → leitet zu /groups weiter
```

### Datenmodell

**Bestehende Tabelle `profiles` — 1 neue Spalte:**
- `avatar_url` (Text, nullable) — URL zum Bild im Storage-Bucket `avatars`

**Neue Tabelle `calendar_connections`:**
- `id` (UUID, Primary Key)
- `user_id` (referenziert auth.users, unique — max 1 pro Nutzer)
- `google_email` (Gmail-Adresse des verbundenen Kontos)
- `access_token` (kurzlebig, 1h, verschlüsselt)
- `refresh_token` (langlebig, nur `calendar.readonly`-Scope)
- `expires_at` (Zeitstempel — für Token-Ablauf-Erkennung)
- `created_at` (Zeitstempel)

**Neue Tabelle `user_date_blocks`:**
- `id` (UUID, Primary Key)
- `user_id` (referenziert auth.users)
- `start_date` (Datum, Pflicht)
- `end_date` (Datum, optional — `NULL` = eintägige Blockierung)
- `created_at` (Zeitstempel)
- DB-Constraint: `end_date >= start_date`

**Supabase Storage Bucket `avatars`:**
- Öffentlicher Lese-Zugriff (URLs direkt einbettbar)
- Schreib-Zugriff via RLS: nur eigener `user_id`-Pfad
- Datei-Pfad: `avatars/{user_id}/avatar.{ext}`
- Größenlimit: 5 MB; Formate: JPEG, PNG, WebP

### Google OAuth 2.0 Flow (Static Export-kompatibel)

Da ein Static Export den `client_secret` nicht sicher im Browser halten kann, übernimmt eine **Supabase Edge Function** den sensitiven Teil:

```
1. INITIATION (Client → Edge Function)
   ProfileSheet ruft "google-calendar-oauth/init" auf
   → Edge Function generiert PKCE-Paar + State-Token
   → Gibt Google Authorization URL zurück (mit code_challenge)
   → Client leitet Browser zur Google Consent Page weiter

2. CALLBACK (Google → statische Seite → Edge Function)
   Google leitet zurück zu /auth/google-calendar/callback?code=...&state=...
   → Statische Callback-Seite ruft "google-calendar-oauth/exchange" auf
   → Edge Function tauscht code + verifier gegen Tokens aus (mit client_secret)
   → Edge Function speichert Tokens in calendar_connections
   → Callback-Seite leitet weiter zu /groups?calendarConnected=true

3. TOKEN-REFRESH (Edge Function → PROJ-7)
   get-group-availability Edge Function (PROJ-7) prüft expires_at
   → Wenn abgelaufen: ruft google-calendar-oauth/refresh auf
   → Neues access_token wird in calendar_connections gespeichert
   → Bei Fehler: Nutzer als "nicht verfügbar" markiert + Token-Ablauf-Flag gesetzt
```

Der `client_secret` existiert ausschließlich als Supabase Edge Function Environment Variable — nie im Client-Bundle.

### Neue Dateien

| Typ | Pfad | Zweck |
|-----|------|-------|
| Component | `components/profile/ProfileSheet.tsx` | Haupt-Sheet mit Profil + Archiv Tabs |
| Component | `components/profile/ProfileSection.tsx` | Avatar-Upload + Anzeigename bearbeiten |
| Component | `components/profile/CalendarConnectionSection.tsx` | Google Kalender verbinden/trennen |
| Component | `components/profile/DateBlocksSection.tsx` | Liste + Hinzufügen + Löschen von Blockierungen |
| Component | `components/profile/ArchiveTab.tsx` | Archiv-Liste mit Pagination |
| Component | `components/profile/ArchiveActivityCard.tsx` | Einzelne Archiv-Aktivitätskarte |
| Hook | `hooks/useProfile.ts` | Profil lesen + aktualisieren, Avatar hochladen |
| Hook | `hooks/useDateBlocks.ts` | CRUD für user_date_blocks |
| Hook | `hooks/useCalendarConnection.ts` | Verbindungsstatus + verbinden + trennen |
| Hook | `hooks/useArchive.ts` | Paginierte abgeschlossene Aktivitäten |
| Page | `app/auth/google-calendar/callback/page.tsx` | OAuth-Rückruf-Handler (statisch) |
| Edge Function | `supabase/functions/google-calendar-oauth/` | OAuth init + Token-Austausch (sicher) |
| Migration | `supabase/migrations/…_profile_calendar.sql` | avatar_url, calendar_connections, user_date_blocks, RLS |

### Keine neuen npm-Pakete erforderlich

| Funktion | Lösung |
|----------|--------|
| Datei-Picker | Natives `<input type="file" accept="image/*">` |
| OAuth | Supabase Edge Function + natives `fetch` |
| Datepicker | Bestehendes shadcn `calendar.tsx` + `popover.tsx` |
| Pagination | Supabase JS `.range(from, to)` |

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

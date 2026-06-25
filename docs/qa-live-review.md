# QA Live-Review – ZUSAMMEN

| | |
|---|---|
| **Getestete URL** | https://qt-voting-app.vercel.app |
| **Datum** | 2026-06-25 |
| **Viewports** | Mobil 390×844, Desktop 1440×900 |
| **Browser** | Chrome (chrome-devtools MCP) |
| **Account** | Test-Account (Claude Tester), neu angelegt, ohne bestehende Gruppe |
| **Methodik** | Navigation, a11y-Snapshots, Screenshots, Console-/Network-Analyse, Lighthouse |

> ⚠️ **Wichtig:** Der zentrale Flow (Aktivität vorschlagen → abstimmen → planen) konnte **nicht** vollständig durchgetestet werden, weil sich in einer neuen Gruppe **kein Vorschlag anlegen lässt** (siehe BUG-2). Dadurch waren Voting (PROJ-4), Kanban-Karten & Drag-and-Drop (PROJ-5), Aktivitäts-Detail & Kommentare (PROJ-6) und Terminfindung (PROJ-7) **blockiert**. Diese Bereiche sollten nach Fix von BUG-1/BUG-2 erneut getestet werden.

---

## Bugs (nach Schweregrad)

### 🔴 BUG-1 – [Critical] Mitgliederliste lädt nicht (HTTP 400, fehlende FK-Beziehung)
- **Bereich:** Gruppe & Mitglieder (PROJ-3), Gruppen-Einstellungen
- **Beschreibung:** Die Abfrage der Gruppenmitglieder mit eingebettetem Profil schlägt mit **HTTP 400** fehl. In den Gruppen-Einstellungen erscheint **„Keine Mitglieder gefunden"**, obwohl der eingeloggte Nutzer Ersteller & Admin der Gruppe ist.
- **Request (fehlerhaft):**
  `GET /rest/v1/group_members?select=group_id,user_id,role,joined_at,profiles(id,display_name,avatar_url)&group_id=eq.<id>` → **400**
- **Response (Root Cause):**
  ```json
  {"code":"PGRST200",
   "details":"Searched for a foreign key relationship between 'group_members' and 'profiles' in the schema 'public', but no matches were found.",
   "message":"Could not find a relationship between 'group_members' and 'profiles' in the schema cache"}
  ```
- **Ursache:** Es existiert **keine direkte Foreign-Key-Beziehung** zwischen `group_members` und `profiles` (beide referenzieren vermutlich `auth.users`). PostgREST kann den `profiles(...)`-Embed daher nicht auflösen. Zum Vergleich funktioniert die Aktivitäten-Abfrage, weil sie einen expliziten FK-Hinweis nutzt: `initiator:profiles!initiator_id(...)` → **200**.
- **Repro:** Gruppe öffnen → Zahnrad „Einstellungen" → Mitglieder-Bereich zeigt „Keine Mitglieder gefunden". Tritt bei jedem Laden einer Gruppenseite auf (reproduzierbar, jeweils 2×).
- **Erwartet:** Mitgliederliste zeigt mindestens den Admin.
- **Lösungsvorschlag:** FK `group_members.user_id → profiles.id` in der DB ergänzen **oder** im Query einen Relationship-Hint setzen (z. B. `profiles!group_members_user_id_fkey(...)`) bzw. die Profile separat nachladen.

### 🔴 BUG-2 – [Critical] Kein „Vorschlag hinzufügen"-Button auf der Vorschläge-Seite
- **Bereich:** Aktivitäts-Vorschläge & Voting (PROJ-4)
- **Beschreibung:** Auf `/groups/<id>/vorschlaege` gibt es **keinerlei Bedienelement, um einen Vorschlag zu erstellen** – weder Button, FAB noch im Empty State. Der Empty State fordert „Schlag der Gruppe eine Aktivität vor", bietet aber keinen CTA.
- **Repro:** Neue Gruppe erstellen → landet auf Vorschläge-Seite → kein Add-Element (mobil **und** desktop bestätigt, voller a11y-Snapshot geprüft).
- **Erwartet:** Klar sichtbarer primärer CTA „Vorschlag hinzufügen" (z. B. im Header oder als FAB), spätestens im Empty State.
- **Vermutete Ursache:** Sehr wahrscheinlich **Folgefehler von BUG-1** – da Mitgliedschaft/Rolle des Nutzers wegen des 400 nicht aufgelöst werden kann, werden rollenabhängige Aktions-Buttons ausgeblendet. Nach Fix von BUG-1 erneut prüfen.

### 🟠 BUG-3 – [Medium] Dark Mode nicht implementiert
- **Bereich:** Quer-Schnitt / Theming
- **Beschreibung:** Bei emuliertem `prefers-color-scheme: dark` (inkl. Reload) bleibt die App im Light-Modus (Warm Cream + weiße Karten). Es gibt zudem **keinen In-App-Theme-Toggle** (im Profil-Dialog nicht vorhanden).
- **Erwartet:** `STYLEGUIDE.md` definiert eine vollständige Dark-Palette (warmes Schwarz `#15110C` etc.) – „Light + Dark Mode" ist verbindlich.
- **Lösungsvorschlag:** Dark-Theme aktivieren (System-Preference respektieren) und/oder Toggle im Profil ergänzen.

### 🟠 BUG-4 – [Medium] AGB- & Datenschutz-Links bei Signup sind tote Platzhalter
- **Bereich:** Auth / Signup (PROJ-2), Compliance
- **Beschreibung:** Auf `/signup` zeigen die Pflicht-Checkbox-Links **„AGB"** und **„Datenschutzerklärung"** auf `#` (`/signup#`) und öffnen nichts.
- **Erwartet:** Funktionierende Links zu echten Rechtstexten – Nutzer müssen zustimmen, können die Dokumente aber nicht aufrufen (rechtlich/Compliance kritisch).

### 🟡 BUG-5 – [Low] A11y-Warnung: Dialog ohne `aria-describedby`
- **Bereich:** Quer-Schnitt / Accessibility
- **Beschreibung:** Console-Warnung beim Öffnen des Ausloggen-Dialogs: *„Missing `Description` or `aria-describedby={undefined}` for {DialogContent}."* (Radix Dialog).
- **Lösungsvorschlag:** `aria-describedby` bzw. `<DialogDescription>` an den betroffenen Dialogen ergänzen.

---

## UI/UX-Empfehlungen

| # | Beobachtung | Vorschlag | Bezug |
|---|---|---|---|
| 1 | Vorschläge-Empty-State ohne primären CTA | Im Empty State Button „Ersten Vorschlag erstellen" prominent platzieren | siehe BUG-2 |
| 2 | „Einstellungen" (Zahnrad) öffnet nur Einladungscode + Mitgliederliste | Gruppenverwaltung ergänzen: umbenennen, Gruppe verlassen/löschen, Rollen/Mitglieder verwalten – oder Label anpassen | PROJ-3 |
| 3 | Gruppen-Avatar-Initialen bei Namen mit Sonderzeichen: „TEST – QA…" → „T–" | Initialen-Helper sollte Wörter ohne Buchstaben (z. B. „–") überspringen | Edge-Case Helper |
| 4 | Onboarding/Empty-Seiten vertikal stark zentriert, viel Leerraum auf großen mobilen Höhen | CTA-Block etwas höher positionieren für bessere Daumen-Erreichbarkeit | STYLEGUIDE 8pt/Layout |
| 5 | Login: Passwortfeld zeigt nach Logout teils Browser-Autofill-Punkte, E-Mail leer | Autofill-Verhalten prüfen (kein App-Bug, aber inkonsistent) | — |

---

## Lighthouse (Login-Seite, mobil, `navigation`)

| Kategorie | Score |
|---|---|
| Accessibility | **96** |
| Best Practices | **100** |
| SEO | **100** |
| Agentic Browsing | **100** |

48 Audits bestanden, 2 fehlgeschlagen (nicht aufgeschlüsselt). **Performance** wird vom Lighthouse-MCP-Audit separat behandelt und wurde hier nicht gemessen.

---

## Positiv / funktioniert gut

- **Auth-Guards** korrekt: eingeloggt → `/login` & `/signup` leiten auf `/groups`; ausgeloggt → geschützte Seiten leiten auf `/login`.
- **Login** (E-Mail/Passwort) und **Logout** (mit Bestätigungsdialog) funktionieren zuverlässig.
- **Gruppe erstellen** (RPC `create_group_with_membership`) funktioniert, inkl. sauberem Loading-State („Wird erstellt…").
- **Einladungscode** lädt korrekt (kurzer Skeleton „——————" + deaktivierter Copy-Button als Loading-State, dann z. B. `9ACP3H`).
- **Gruppen-Übersicht** zeigt Mitgliederzahl & Rolle korrekt („1 Mitglied · ADMIN") – nutzt eine count-Query ohne den fehlerhaften Embed.
- **Profil-Dialog** vollständig: Name bearbeiten, Avatar, Google-Kalender verbinden, Verfügbarkeits-Blockierungen, Logout.
- Konsistentes, sauberes Design (Archivo, Terracotta-CTA, Karten-Layout) über Auth-Seiten und App.

---

## Test-erzeugte Daten (zum Aufräumen)

- **Gruppe:** `TEST – QA 2026-06-25` (ID `109935ae-4026-449d-80bd-84538b52c76b`), erstellt vom Test-Account.
- Keine weiteren Objekte (Vorschläge/Votes konnten wegen BUG-2 nicht angelegt werden).

---

## Auflösung (2026-06-25)

| Bug | Status | Fix |
|---|---|---|
| BUG-1 | ✅ Behoben | Migration `add_group_members_profiles_fk`: paralleler FK `group_members.user_id → profiles.id`. Queries nutzen expliziten Relationship-Hint, `database.types.ts` erweitert. DB-seitig verifiziert (FK eindeutig, Admin-Join liefert „Claude Tester"). |
| BUG-2 | ✅ Behoben | Folgefehler von BUG-1 (FAB erscheint nach Rollen-Auflösung wieder). Zusätzlich primärer CTA „Ersten Vorschlag erstellen" im Empty State. |
| BUG-3 | ✅ Behoben | Theme-System (`src/hooks/useTheme.ts` + Inline-Script im Root-Layout gegen FOUC); respektiert `prefers-color-scheme`, Toggle (Hell/Dunkel/System) im Profil-Dialog (`AppearanceSection`). Im Browser auf Login-Seite verifiziert (Dark + Light). |
| BUG-4 | ⏭️ Ignoriert | AGB-/Datenschutz-Links — bewusst ausgelassen (auf Wunsch). |
| BUG-5 | ✅ Behoben | `(Responsive)Dialog/SheetDescription` bzw. sr-only-Description an ProfileSheet, ProposalFormSheet, MoveToPlanningDialog, GroupDetailSheet, DateFinderSheet ergänzt (DateFinderSheet zusätzlich `Title`). |
| UX #2 | ✅ Bereits vorhanden | Gruppenverwaltung (umbenennen/Rollen/entfernen/verlassen/löschen) war implementiert, durch BUG-1 verdeckt. |
| UX #3 | ✅ Behoben | Initialen-Helper überspringt buchstabenlose Wörter. |

> **Verifikations-Grenze:** Der authentifizierte Flow (Mitgliederliste 200, FAB-Sichtbarkeit, Theme-Toggle im Profil, Dialog-a11y zur Laufzeit) wurde **nicht** im Browser durchgetestet, da keine Test-Account-Zugangsdaten vorlagen. BUG-1 ist auf DB-Ebene, BUG-3 auf der öffentlichen Login-Seite verifiziert; Build, TypeScript-Check und Unit-Tests sind grün.

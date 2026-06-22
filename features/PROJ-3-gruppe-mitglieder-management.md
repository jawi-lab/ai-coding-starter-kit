# PROJ-3: Gruppe & Mitglieder-Management

## Status: Architected
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Datenbank, RLS, Storage
- PROJ-2 (Authentifizierung & User Accounts) — eingeloggter Nutzer, `profiles`-Tabelle mit `status = 'active'`

## User Stories
- Als neuer Nutzer ohne Gruppe möchte ich nach dem Login einen Onboarding-Screen sehen, damit ich direkt eine Gruppe erstellen oder einer bestehenden beitreten kann.
- Als Nutzer möchte ich eine Gruppe mit einem Namen erstellen, damit ich meine Freunde einladen kann.
- Als Nutzer möchte ich per Einladungs-Code einer Gruppe beitreten, damit ich an Planung und Voting teilnehmen kann.
- Als Nutzer möchte ich eine Übersicht all meiner Gruppen sehen, damit ich zwischen mehreren Gruppen wechseln kann.
- Als Admin möchte ich den Einladungs-Code neu generieren können, damit ich alten Code ungültig machen kann.
- Als Admin möchte ich den Gruppenname ändern können, damit er aktuell bleibt.
- Als Admin möchte ich die Rolle eines Mitglieds ändern (Redakteur ↔ Beobachter, oder jemanden zum Admin befördern), damit ich Berechtigungen steuern kann.
- Als Admin möchte ich ein Mitglied aus der Gruppe entfernen können, damit die Gruppe sauber bleibt.
- Als Mitglied möchte ich eine Gruppe verlassen können, damit ich nicht mehr Teil einer Gruppe bin.
- Als Admin, der die Gruppe verlassen möchte, muss ich zuerst meine Admin-Rechte an ein anderes Mitglied übertragen.

## Out of Scope
- **E-Mail-Einladungen** — Einladungs-Code reicht für MVP; E-Mail-Einladungen erfordern zusätzliche SMTP-Infrastruktur und Link-Ablauf-Logik
- **Gruppenprofilbild / Cover-Bild** — deferred to PROJ-8 (Nutzerprofil & Archiv) oder spätere Ausbaustufe
- **Gruppen-Beschreibung** — nicht im Konzept vorgesehen
- **Mitglieder-Limit-Enforcement** — Konzept nennt 3–10 Personen als Zielgröße, aber kein hartes Limit für MVP
- **Gruppe archivieren** — nicht im Konzept vorgesehen; Gruppe löschen ist ausreichend
- **Aktivitäten, Voting, Kanban** — deferred to PROJ-4 und PROJ-5
- **Benachrichtigungen bei Beitritt/Entfernung** — deferred to PROJ-10 (Push-Benachrichtigungen)
- **Gruppensuche / öffentliche Gruppen** — ZUSAMMEN ist bewusst closed-invite; kein Discovery-Feature

## Acceptance Criteria

### Onboarding-Screen (erster Login ohne Gruppe)
- [ ] Angenommen ein Nutzer mit `status = 'active'` ist eingeloggt und ist in keiner Gruppe, wenn er die App öffnet, dann wird er auf einen Onboarding-Screen geleitet mit zwei Optionen: „Gruppe erstellen" und „Gruppe beitreten"
- [ ] Angenommen der Nutzer ist bereits Mitglied in mindestens einer Gruppe, wenn er die App öffnet, dann wird er direkt zur Gruppen-Übersicht geleitet (kein Onboarding-Screen)

### Gruppe erstellen
- [ ] Angenommen der Nutzer klickt „Gruppe erstellen", wenn er einen Gruppenname eingibt und bestätigt, dann wird eine neue Gruppe angelegt, der Nutzer wird als Admin eingetragen und zur Gruppen-Detail-Ansicht weitergeleitet
- [ ] Angenommen die Gruppe erfolgreich erstellt wurde, dann wird automatisch ein Einladungs-Code generiert und in der Gruppen-Detail-Ansicht sichtbar angezeigt
- [ ] Angenommen der Nutzer versucht eine Gruppe mit leerem Namen zu erstellen, dann wird die Fehlermeldung „Gruppenname ist erforderlich" angezeigt
- [ ] Angenommen der Nutzer gibt einen Gruppenname mit mehr als 50 Zeichen ein, dann wird die Fehlermeldung „Gruppenname darf maximal 50 Zeichen lang sein" angezeigt

### Gruppe beitreten (per Code)
- [ ] Angenommen der Nutzer klickt „Gruppe beitreten", wenn er einen gültigen Einladungs-Code eingibt und bestätigt, dann wird er als Mitglied mit der Rolle „Redakteur" zur Gruppe hinzugefügt und zur Gruppen-Detail-Ansicht weitergeleitet
- [ ] Angenommen der Nutzer gibt einen ungültigen oder abgelaufenen Code ein, dann wird die Fehlermeldung „Ungültiger Einladungs-Code" angezeigt
- [ ] Angenommen der Nutzer ist bereits Mitglied der Gruppe, deren Code er eingibt, dann wird die Fehlermeldung „Du bist bereits Mitglied dieser Gruppe" angezeigt
- [ ] Angenommen der Nutzer gibt einen leeren Code ein, dann wird die Fehlermeldung „Bitte gib einen Einladungs-Code ein" angezeigt

### Gruppen-Übersicht (Home)
- [ ] Angenommen der Nutzer ist in mehreren Gruppen, wenn er die App öffnet, dann sieht er eine Liste aller seiner Gruppen mit Gruppenname und Mitgliederanzahl
- [ ] Angenommen der Nutzer klickt eine Gruppe in der Liste, dann wird er zur Gruppen-Detail-Ansicht dieser Gruppe weitergeleitet
- [ ] Angenommen der Nutzer möchte einer weiteren Gruppe beitreten oder eine neue erstellen, dann gibt es auf der Übersicht einen Button „Gruppe hinzufügen" der zum Onboarding-Dialog führt

### Gruppen-Detail-Ansicht
- [ ] Angenommen der Nutzer öffnet die Gruppen-Detail-Ansicht, dann sieht er: Gruppenname, Einladungs-Code (mit Kopier-Button), Mitgliederliste mit Avatar/Name und Rolle-Badge für jedes Mitglied
- [ ] Angenommen der Nutzer ist Admin, dann sieht er zusätzlich: Button „Code neu generieren", Inline-Edit für den Gruppenname, Aktions-Menü pro Mitglied (Rolle ändern, Entfernen)

### Admin: Gruppenname ändern
- [ ] Angenommen der Admin klickt auf den Gruppenname, dann kann er ihn inline bearbeiten und mit Enter oder einem Bestätigen-Button speichern
- [ ] Angenommen der Admin speichert einen leeren oder zu langen Namen, dann gelten dieselben Validierungsregeln wie beim Erstellen

### Admin: Einladungs-Code neu generieren
- [ ] Angenommen der Admin klickt „Code neu generieren", dann erscheint ein Bestätigungsdialog mit dem Hinweis „Der alte Code wird ungültig"
- [ ] Angenommen der Admin bestätigt, dann wird ein neuer Code generiert und der alte ist sofort ungültig

### Admin: Mitglied-Rolle ändern
- [ ] Angenommen der Admin öffnet das Aktions-Menü eines Mitglieds, wenn er eine neue Rolle auswählt, dann wird die Rolle des Mitglieds sofort aktualisiert und der Rolle-Badge in der Liste ändert sich
- [ ] Angenommen der Admin versucht seine eigene Rolle zu ändern, dann ist diese Option ausgegraut (ein Admin kann sich nicht selbst degradieren)

### Admin: Mitglied entfernen
- [ ] Angenommen der Admin klickt „Entfernen" im Aktions-Menü eines Mitglieds, dann erscheint ein Bestätigungsdialog „[Name] aus der Gruppe entfernen?"
- [ ] Angenommen der Admin bestätigt, dann wird das Mitglied aus der Gruppe entfernt und verschwindet aus der Mitgliederliste

### Gruppe verlassen
- [ ] Angenommen ein Redakteur oder Beobachter klickt „Gruppe verlassen", dann erscheint ein Bestätigungsdialog; nach Bestätigung wird das Mitglied entfernt und zur Gruppen-Übersicht weitergeleitet
- [ ] Angenommen ein Admin mit mindestens einem anderen Mitglied klickt „Gruppe verlassen", dann wird ein Dialog angezeigt: „Bitte übertrage zuerst deine Admin-Rechte" mit einer Auswahl-Liste aller Mitglieder
- [ ] Angenommen der Admin ein Mitglied aus der Liste auswählt und bestätigt, dann wird dieses Mitglied zum Admin befördert und der ehemalige Admin verlässt die Gruppe
- [ ] Angenommen der Admin das einzige Mitglied der Gruppe ist, dann ist der Button „Gruppe verlassen" ausgegraut; stattdessen ist nur „Gruppe löschen" verfügbar

### Gruppe löschen
- [ ] Angenommen der Admin (letztes Mitglied) klickt „Gruppe löschen", dann erscheint ein Bestätigungsdialog „Diese Gruppe und alle Daten unwiderruflich löschen?"
- [ ] Angenommen der Admin bestätigt, dann wird die Gruppe mit allen zugehörigen Mitgliedschaften gelöscht und der Nutzer wird zur Gruppen-Übersicht (bzw. Onboarding-Screen, falls keine weiteren Gruppen) weitergeleitet

## Edge Cases
- **Code-Kollision:** Einladungs-Codes müssen beim Generieren auf Eindeutigkeit geprüft werden (Retry bei Kollision).
- **Simultaner Beitritt mit demselben Code:** Zwei Nutzer geben gleichzeitig denselben Code ein — beide sollen erfolgreich beitreten können; kein Race-Condition-Problem da der Code nicht verbraucht wird.
- **Admin wird entfernt während er selbst aktiv ist:** Falls ein zweiter Admin das Mitglied entfernt, während der Nutzer noch aktiv ist, wird er beim nächsten Laden der Seite zur Gruppen-Übersicht weitergeleitet mit dem Hinweis „Du wurdest aus der Gruppe entfernt".
- **Letzter Admin verlässt die Gruppe (Grenzfall):** Solange es noch andere Mitglieder gibt aber kein zweiter Admin existiert, muss der Admin zuerst ein anderes Mitglied zum Admin befördern oder die Gruppe löschen. „Gruppe verlassen" bleibt solange ausgegraut bis ein anderer Admin existiert.
- **Netzwerkfehler beim Beitritt/Erstellen:** Fehlermeldung „Verbindungsfehler — bitte versuche es erneut"; Formulardaten bleiben erhalten.
- **Nutzer mit `status = 'pending'`:** Kann keiner Gruppe beitreten (Supabase RLS-Policy blockiert den Zugriff); Fehlermeldung: „Bitte bestätige zuerst deine E-Mail-Adresse".

## Technical Requirements
- Einladungs-Code: 6-stellig, alphanumerisch (Großbuchstaben + Ziffern, ohne O/0/I/1 zur Verwechslung zu vermeiden), z. B. `XJHF42`
- Code-Generierung und Eindeutigkeitsprüfung serverseitig via RLS + Supabase Edge Function oder Client-seitig mit Retry-Logik
- Alle Schreiboperationen (Mitglied hinzufügen, entfernen, Rolle ändern) über RLS-Policies abgesichert — nur Admins dürfen kritische Operationen durchführen
- Realtime-Updates der Mitgliederliste via Supabase Realtime (Subscription auf `project_members`)

## Open Questions
- [ ] Soll der Einladungs-Code eine Ablaufzeit haben (z. B. 7 Tage), oder ist er dauerhaft gültig bis er manuell neu generiert wird? — Empfehlung: dauerhaft gültig (einfacher für Freundesgruppen)
- [ ] Soll es eine maximale Mitgliederanzahl pro Gruppe geben (Konzept nennt 3–10 als Zielgröße)? — Kein hartes Limit für MVP empfohlen

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Nur Einladungs-Code, keine E-Mail-Einladungen | Einfacher zu bauen; Freundesgruppen haben ohnehin einen gemeinsamen Chat-Kanal | 2026-06-22 |
| Neue Mitglieder starten als Redakteur | "Normaler Freund" soll direkt mitmachen können; Beobachter ist Sonderfall, der manuell gesetzt wird | 2026-06-22 |
| Dedizierter Onboarding-Screen nach erstem Login | Verhindert leere Home-Seite; macht den nächsten Schritt explizit sichtbar | 2026-06-22 |
| Ein Nutzer kann in mehreren Gruppen sein | Realistisches Use-Case (Schulfreunde + Arbeitskollegen); Datenmodell unterstützt es bereits | 2026-06-22 |
| Admin muss Rechte übertragen vor dem Verlassen | Verhindert führungslose Gruppen; letzter Admin sieht nur "Gruppe löschen" | 2026-06-22 |
| Gruppenname inline editierbar (kein separater Settings-Screen) | Weniger Navigation, schnellere Änderung, ausreichend für MVP | 2026-06-22 |

### Technical Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Sheet statt dynamischer Route `/groups/[id]` | Statischer Export (`output: 'export'`) macht dynamische Routen ohne `generateStaticParams` unmöglich; Sheet ist außerdem das natürlichere mobile UX-Muster für Capacitor-Apps | 2026-06-22 |
| Supabase Edge Function für Einladungs-Code-Generierung | Eindeutigkeitsprüfung erfordert Service-Role-Zugriff auf alle Codes — das ist im Client via RLS nicht möglich; Edge Function kann das sicher und atomar durchführen | 2026-06-22 |
| Supabase Realtime auf `group_members` und `groups` | Spec verlangt Live-Updates der Mitgliederliste; Polling wäre zu träge und unnötig teuer | 2026-06-22 |
| Keine neuen npm-Packages | Sheet, AlertDialog, DropdownMenu, Avatar, Badge, Skeleton sind alle bereits in shadcn/ui installiert | 2026-06-22 |
| `group_members`-Tabelle als Verknüpfungstabelle | Erlaubt Mitgliedschaft in mehreren Gruppen (Anforderung aus Spec); Rolle ist pro Mitgliedschaft, nicht pro Nutzer | 2026-06-22 |
| Invite Code: 6 Zeichen, Großbuchstaben + Ziffern, ohne O/0/I/1 | Verhindert Verwechslung beim manuellen Eintippen; 6 Stellen bei ~30 möglichen Zeichen ergibt ~730 Mio. Kombinationen — ausreichend für MVP | 2026-06-22 |

---

## Tech Design (Solution Architect)

### Seiten / Routing

Da die App als statischer Export (Capacitor-ready) gebaut wird, werden keine dynamischen URL-Parameter (`/groups/[id]`) genutzt. Die Gruppen-Detail-Ansicht öffnet sich stattdessen als **Sheet** (einschiebendes Seitenpanel) — ein in mobilen Apps verbreitetes Navigations-Muster. Die shadcn/ui `Sheet`-Komponente ist bereits installiert.

```
/                 → Weiterleitung: keine Gruppen → /onboarding | hat Gruppen → /groups
/onboarding       → Onboarding-Screen (Gruppe erstellen ODER beitreten)
/groups           → Gruppen-Übersicht + Sheet für Gruppen-Detail
```

### Komponenten-Struktur

```
App (AuthGuard — bereits vorhanden)
│
├── /onboarding
│   └── OnboardingScreen
│       ├── CreateGroupPanel
│       │   └── CreateGroupForm  (Gruppenname eingeben)
│       └── JoinGroupPanel
│           └── JoinGroupForm    (Einladungs-Code eingeben)
│
└── /groups
    ├── GroupsHeader             ("Meine Gruppen" + Button "Gruppe hinzufügen")
    ├── GroupCard × N            (Gruppenname, Mitgliederzahl — klickbar)
    │
    └── [Sheet: Gruppen-Detail]  ← gleitet von rechts rein beim Klick
        ├── GroupDetailHeader    (Gruppenname; Inline-Edit für Admin)
        ├── InviteCodeCard       (Code anzeigen, Kopieren, Neu generieren)
        ├── MemberList
        │   └── MemberRow × N
        │       ├── Avatar + Anzeigename + RoleBadge
        │       └── [DropdownMenu: Rolle ändern, Entfernen]  (nur Admin)
        └── GroupFooter
            ├── LeaveGroupButton
            │   ├── [AlertDialog: Bestätigung verlassen]
            │   └── [Dialog: Admin-Rechte übertragen]  (wenn Admin + andere Mitglieder)
            └── DeleteGroupButton  (nur letzter Admin)
                └── [AlertDialog: Gruppe unwiderruflich löschen]
```

### Datenmodell

**Tabelle `groups`**
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `id` | UUID | Eindeutige ID der Gruppe |
| `name` | Text (max 50 Zeichen) | Anzeigename der Gruppe |
| `invite_code` | Text (6 Zeichen) | Alphanumerischer Code, global eindeutig (z.B. `XJHF42`) |
| `created_by` | UUID | Verweis auf den erstellenden Nutzer |
| `created_at` | Zeitstempel | Erstellungszeitpunkt |

**Tabelle `group_members`**
| Feld | Typ | Beschreibung |
|------|-----|--------------|
| `group_id` | UUID | Verweis auf die Gruppe |
| `user_id` | UUID | Verweis auf den Nutzer (aus `profiles`) |
| `role` | Enum | `admin`, `editor` (Redakteur), `observer` (Beobachter) |
| `joined_at` | Zeitstempel | Beitrittszeitpunkt |

Eindeutigkeits-Constraint: `(group_id, user_id)` — kein Nutzer kann zweimal in derselben Gruppe sein.

### Zugriffssteuerung (RLS Policies)

| Aktion | Wer darf das? |
|--------|--------------|
| Gruppe lesen | Nur Mitglieder der Gruppe |
| Gruppenname / Code ändern | Nur Admins der Gruppe |
| Gruppe löschen | Nur Admin, wenn er das letzte Mitglied ist |
| Mitgliederliste lesen | Nur Mitglieder der Gruppe |
| Gruppe beitreten (INSERT in group_members) | Jeder `active`-Nutzer mit gültigem Einladungs-Code |
| Rolle eines Mitglieds ändern | Nur Admin; nicht auf eigenen Eintrag |
| Mitglied entfernen | Admin kann andere entfernen; Mitglied kann sich selbst entfernen |

### Einladungs-Code-Generierung — Supabase Edge Function

Eine dedizierte Edge Function `generate-invite-code` läuft serverseitig mit Service-Role-Rechten und:
1. Erzeugt einen zufälligen 6-Zeichen-Code (Großbuchstaben + Ziffern, ohne `O`, `0`, `I`, `1`)
2. Prüft Eindeutigkeit in der Datenbank
3. Wiederholt bei Kollision (Retry-Schleife)
4. Schreibt den finalen Code in die `groups`-Tabelle und gibt ihn zurück

Diese Funktion wird sowohl beim Erstellen einer Gruppe als auch beim Neu-Generieren des Codes aufgerufen.

### Echtzeit-Updates (Realtime)

Supabase Realtime-Subscriptions auf `group_members` (Beitritte, Entfernungen, Rollen-Änderungen) und `groups` (Namens-/Code-Änderungen). Die Mitgliederliste aktualisiert sich automatisch ohne Seiten-Reload.

### Custom Hooks

| Hook | Zweck |
|------|-------|
| `useGroups` | Lädt alle Gruppen des eingeloggten Nutzers inkl. Mitgliederzahl |
| `useGroupDetail(groupId)` | Lädt Gruppendetails + Mitgliederliste; verwaltet Realtime-Subscription |

### Neue Dateien

```
src/app/onboarding/page.tsx
src/app/groups/page.tsx
src/components/groups/OnboardingScreen.tsx
src/components/groups/CreateGroupForm.tsx
src/components/groups/JoinGroupForm.tsx
src/components/groups/GroupCard.tsx
src/components/groups/GroupDetailSheet.tsx
src/components/groups/InviteCodeCard.tsx
src/components/groups/MemberList.tsx
src/components/groups/MemberRow.tsx
src/components/groups/LeaveGroupDialog.tsx
src/components/groups/DeleteGroupDialog.tsx
src/hooks/useGroups.ts
src/hooks/useGroupDetail.ts
supabase/functions/generate-invite-code/index.ts
```

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

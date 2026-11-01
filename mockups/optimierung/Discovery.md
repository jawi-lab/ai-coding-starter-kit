# Phase 1 – Discovery

Stand: 2026-11-01. Gilt für alle Dokumente unter `mockups/optimierung/`: **Personas, Interviews und Usability-Tests sind simuliert.** Sie beruhen auf Annahmen, nicht auf Gesprächen mit echten Menschen.

Weitere Discovery-Ergebnisse: [`Personas.md`](Personas.md) (simulierte Personas, Interviews, Jobs-to-be-Done) und [`Wettbewerb.md`](Wettbewerb.md).

## 1. Ist-Analyse

Gelesen: `CLAUDE.md`, `docs/PRD.md`, `features/INDEX.md`, `docs/CODEMAP.md`, `STYLEGUIDE.md`, `.claude/rules/*`, `docs/archive/konzept-freundes-planungs-app.md` (Abschnitte 1–10), `docs/architecture/mellon.architecture.json`, Specs PROJ-3, -4, -6, -7, -12, -13, -15 bis -18 (abschnittsweise), `docs/qa/2026-10-31-abarbeitung.md`, ausgewählte Komponenten unter `src/`. Notion: Seite „ZUSAMMEN – Ideen & Backlog“ und Datenbank „Ideen-Backlog“ (nur lesend, siehe Entscheidungslog E-03).

### 1.1 Produktumfang heute

Alle 18 Features stehen in `features/INDEX.md` auf „Deployed“.

| Bereich | Heute umgesetzt | Quelle |
|---|---|---|
| Konto | E-Mail mit Double-Opt-In, Google, Apple; Onboarding mit Willkommen, Profil, Gruppe | PROJ-2, PROJ-13 |
| Gruppe | Erstellen, Beitreten per 10-stelligem Code (seit 2026-10-30, vorher 6), Rollen Admin / Redakteur / Beobachter, Admin-Übergabe beim Verlassen | PROJ-3 |
| Vorschläge | Name, Dauer-Kategorie, Upvote-Schwelle, Link mit og:image, Filter nach Dauer, Herz-Vote, beliebig viele offene Vorschläge (Limit seit 2026-06-23 entfernt) | PROJ-4 |
| Board | 4 Spalten (Zu Planen, In Planung, Planung abgeschlossen, Abgeschlossen), Statuswechsel über ⋯-Menü | PROJ-5 |
| Detail | Kommentare mit Rich Text, Bildern, @-Erwähnung; abhakbare Verantwortlichkeiten; bis 5 Erinnerungsfotos | PROJ-6 |
| Termine | Verfügbarkeits-Overlay (grün/gelb/rot/grau) aus Google-Kalender + manuellen Blockern, Admin oder Initiator wählt Zeitraum, iCal-Export | PROJ-7 |
| Profil | Profil, Darstellung, Kalender-Verbindung, Datums-Blocker, Album | PROJ-8, PROJ-17 |
| Benachrichtigungen | Glocke mit Posteingang über alle Gruppen, je Ereignis Push- und E-Mail-Schalter, Master-Schalter, Abmelde-Link | PROJ-10, PROJ-12 |
| Umfragen | in Aktivitäten, sichtbar, Mehrfachauswahl | PROJ-14 |
| Gamification | Gruppen-Momentum (4 Level, kumulativ, kein Verfall), Rollen-Badges (4 Badges × 3 Stufen, ohne Rangliste), Memory Cards mit Aufdeck-Animation, Jahres-Wrapped ab 1. Dezember | PROJ-15 bis PROJ-18 |
| Plattform | Next.js Static Export, Supabase (RLS, Realtime, Storage, 4 Edge Functions), Capacitor iOS/Android, Capgo-OTA (autoUpdate aus) | Architektur-JSON |

### 1.2 Bestätigung der Vorprüfung

| Befund | Am Repo bestätigt | Beleg |
|---|---|---|
| Einladung nur per Code, kein Teilen-Link | **Ja** | `InviteCodeCard.tsx` bietet nur „Kopieren“ und „Neu generieren“; `JoinGroupForm.tsx` erwartet die manuelle Code-Eingabe („z. B. von einem Gruppenmitglied teilen lassen“). PROJ-3 nennt E-Mail-Einladungen „Out of Scope“. |
| Keine Erinnerungen (Reminder) | **Ja** | `lib/notification-types.ts` kennt 6 Ereignisse (`new_proposal`, `now_planning`, `date_set`, `mention`, `responsibility`, `umfrage_erstellt`), keines zeitgesteuert. Konzept §10 führt Reminder als spätere Ausbaustufe. „Erinnerung“ im Code meint nur Fotos und Memory Cards. |
| Kein globaler Offline-Zustand | **Ja, teilweise** | `NativeNetworkBanner.tsx` zeigt „Keine Verbindung“ nur nativ (`isNativePlatform()`), im Web bewusst nicht. Pro Ansicht gibt es keinen Offline-Zustand, Datenaufrufe scheitern dann mit Fehler-Toasts. |

### 1.3 Stärken

1. **Vollständiger Kernloop** von der Idee bis zur Erinnerung, ohne Lücke im Datenmodell.
2. **Kollektive statt kompetitive Gamification:** kein Verfall, keine Ranglisten, Stufen monoton. Das ist bereits frei von gängigen Dark Patterns.
3. **Eigenständiges, warmes Design-System** (Creme, Waldgrün, Serif für Nutzerinhalte) mit Dark Mode, Liquid Glass und Bedienungshilfen (`prefers-reduced-motion`, `-transparency`, `-contrast`).
4. **Sauberer Sicherheitsrahmen:** RLS auf allen Tabellen, Secrets nur in Edge Functions, Rate-Limit beim Code-Beitritt (`invite_code_attempts`).
5. **Datensparsam:** kein Tracking im Onboarding (PROJ-13 schließt Analytics aus), E-Mail ist Opt-in.
6. **Eine Codebasis** für Web, iOS und Android, OTA-fähig.

### 1.4 Schwächen

1. **Einladen ist umständlich:** Code abtippen statt Link antippen. Das ist der erste Kontakt neuer Gruppenmitglieder und damit die größte Wachstumsbremse.
2. **Keine Erinnerungen:** Weder vor dem Termin noch bei offenen Aufgaben oder fehlenden Votes. Gerade das „Termine fallen ins Wasser“ aus dem PRD bleibt ungelöst.
3. **Terminfindung ist Admin-zentriert:** Admin oder Initiator wählt allein; Mitglieder ohne Google-Kalender erscheinen grau. Es gibt keine Abstimmung über Terminoptionen (PROJ-7 schließt Doodle-Stil aus).
4. **Zusage fehlt:** Es gibt kein „Ich bin dabei“. Wer teilnimmt, lässt sich nur aus Votes und Aufgaben ableiten.
5. **Rollenmodell ist für 3–10 Freunde schwergewichtig:** Drei Rollen mit feinen Unterschieden (Beobachter darf voten, aber nicht vorschlagen), Admin-Übergabe beim Verlassen. Neue Mitglieder werden Redakteur.
6. **Vorschlag erstellen ist aufwendig:** Pflichtfelder Name, Dauer und Schwelle. (Korrektur durch Leitung: Das frühere Limit „offene Vorschläge = Mitgliederzahl“ wurde am 2026-06-23 entfernt, PROJ-4 „Post-Deployment Fixes“.)
7. **Board auf dem Handy:** Spalten als Tabs, immer nur eine sichtbar; der Überblick „was steht als Nächstes an“ fehlt.
8. **Kein globaler Offline-Zustand** (siehe 1.2).
9. **Status-Begriffe uneinheitlich:** „Zu Planen“ (Großschreibung), „Planung abgeschlossen“ vs. „Abgeschlossen“ sind leicht zu verwechseln.

### 1.5 Brüche zwischen Mobile und Desktop

| Thema | Mobile | Desktop | Bewertung |
|---|---|---|---|
| Navigation | Schwebende Tab-Bar mit 5 Einträgen (Home, Vorschläge, Board, Termine, Profil) | Sidebar 248 px; Profil über User-Card unten | Profil liegt an unterschiedlichen Orten |
| Board | Spalten als Tabs, eine Spalte sichtbar | 4 Spalten nebeneinander | Unterschiedliches mentales Modell |
| Plus-Button | Schwebend unten rechts, weicht beim Scrollen aus; mögliche Überlappung am Listenanfang akzeptiert (`docs/qa/2026-10-31-abarbeitung.md`, B3) | Ort laut Styleguide nicht festgelegt | Offener Kompromiss |
| Sheets | Bottom-Sheet mit Griff und Wischgeste | Dialog | Gewollt und konsistent |
| Push | Nativ (FCM/APNs) | Nur In-App und E-Mail, kein Web-Push | Web-Nutzer erfahren Neues später |
| Offline | Banner nur nativ | Nichts | Siehe 1.2 |
| Teilen | Natives Share-Sheet für Wrapped und Memory Cards | Download bzw. Browser-Share | In Ordnung |

### 1.6 Notion-Backlog

Die Datenbank „Ideen-Backlog“ enthält zwei Einträge: eine Vorlage und die Idee „Umfragen & Abstimmungen in Aktivitäten“. Diese Idee ist mit PROJ-14 bereits umgesetzt. Die Seite beschreibt noch das alte Design (Archivo, Terracotta) und einen älteren Feature-Stand; maßgeblich ist das Repo. Personenbezogene Inhalte der Seite wurden nicht übernommen.

## 2. Annahmen zur Zielgruppe (simuliert)

Belegt ist nur: Freundesgruppen mit 3–10 Personen, die regelmäßig planen und an fehlender Koordination scheitern (PRD). Alle weiteren Merkmale sind **simulierte Annahmen**:

- Alter überwiegend 22–40 Jahre; gemischte Lebensphasen (Studium, Berufseinstieg, junge Familien).
- Anlässe: Wochenendausflüge, Konzerte, Spieleabende, Geburtstage, Kurzurlaube, Sport.
- Kommunikation läuft parallel weiter in einem Messenger; Mellon ergänzt ihn, ersetzt ihn nicht.
- Pro Gruppe gibt es 1–2 „Organisator:innen“ und mehrere eher passive Mitglieder.
- Geräte: überwiegend Smartphone; Desktop für längere Planung am Abend.

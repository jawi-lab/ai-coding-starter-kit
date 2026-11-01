# Phase 2 – Definition

Stand: 2026-11-01. Verantwortlich: Leitung. Grundlage: [`Discovery.md`](Discovery.md), `docs/PRD.md`, `features/INDEX.md`, Specs PROJ-3, -4, -7, -10, -12 (abschnittsweise), `src/lib/database.types.ts`.
**Personas, Interviews und Tests sind simuliert.** Alle Zielwerte sind **Annahmen** und vor der Umsetzung mit einer Nullmessung zu prüfen.

## 1. Korrektur zur Ist-Analyse

Schwäche 6 aus `Discovery.md` („Vorschlagslimit = Mitgliederzahl“) gilt nicht mehr. Das Limit wurde am 2026-06-23 entfernt (PROJ-4, „Post-Deployment Fixes“); im Code und in den Migrationen gibt es keine Obergrenze. Es bleiben zwei kleinere Hürden beim Vorschlagen:
- Beobachter dürfen nicht vorschlagen (`canCreate`), siehe P4.
- Die Dauer-Kategorie ist Pflichtfeld, die Upvote-Schwelle muss man selbst setzen (Standard 1).

Das Backlog führt deshalb statt „Vorschlagslimit lockern“ den Eintrag BL-09 („Schnell-Vorschlag“).

## 2. Problem Statements

Die Personas sind simuliert (siehe `Discovery.md`, Abschnitt 2). „Organisator:in“ meint die 1–2 Personen, die pro Gruppe planen, „Mitläufer:in“ die eher passiven Mitglieder.

### P1 – Einladen ohne Hürde
- **Nutzer:in:** Organisator:in einer neuen Gruppe braucht einen Weg, Freund:innen mit einem Tippen in die Gruppe zu holen, weil das Abtippen eines 6-stelligen Codes aus dem Messenger Eingeladene schon beim ersten Kontakt verliert.
- **Wie könnten wir** Einladen so einfach machen wie das Teilen eines Links, ohne den Rate-Limit-Schutz des Codes aufzugeben?
- Schwäche 1. KPI: K3. Backlog: BL-01, BL-15.

### P2 – Termine fallen nicht mehr ins Wasser
- **Nutzer:in:** Mitläufer:in braucht rechtzeitige, sparsame Erinnerungen an Termine, offene Aufgaben und ausstehende Stimmen, weil sie Mellon nur öffnet, wenn etwas sie dazu anstößt. Ohne Anstoß vergisst sie Zusagen, und die Gruppe plant ins Leere.
- **Wie könnten wir** im richtigen Moment erinnern, ohne zu nerven, und dabei die bestehenden Push- und E-Mail-Schalter respektieren?
- Schwäche 2. KPI: K2, K5. Backlog: BL-02, BL-16, BL-20.

### P3 – Gemeinsam entscheiden, wann und wer
- **Nutzer:in:** Ein Gruppenmitglied ohne Admin-Rolle und ohne Google-Kalender braucht eine Möglichkeit, bei der Terminwahl mitzureden und verbindlich zuzusagen. Heute wählt der Admin allein, das Mitglied erscheint grau, und niemand weiß, wer wirklich kommt.
- **Wie könnten wir** aus dem Verfügbarkeits-Overlay wenige Terminoptionen machen, über die alle abstimmen, und am Ende eine klare Zusage („Bin dabei“) einholen?
- Schwächen 3 und 4. KPI: K1, K2. Backlog: BL-03, BL-04.
- Konflikt: PROJ-7 hat „Doodle-Style“ bewusst ausgeschlossen, weil eine zusätzliche Runde den Ablauf verlängere. **Leitung entscheidet:** Wir testen die Optionen im Mockup als optionalen Schritt. Der Admin kann weiterhin direkt festlegen.

### P4 – Mitmachen ohne Rollenkunde
- **Nutzer:in:** Ein neues Mitglied einer Gruppe von 3–10 Freund:innen braucht klare, wenige Rechte, weil drei Rollen mit feinen Unterschieden (Beobachter darf abstimmen, aber nicht vorschlagen) und eine Admin-Übergabepflicht in einem Freundeskreis eher irritieren als schützen.
- **Wie könnten wir** das Rollenmodell auf „Admin“ und „Mitglied“ reduzieren, ohne dass Gruppen ihre Inhalte schlechter schützen?
- Schwäche 5 (und Rest von 6). KPI: K2. Backlog: BL-08, BL-09.

### P5 – Auf dem Handy sehen, was ansteht
- **Nutzer:in:** Organisator:in braucht auf dem Handy auf einen Blick, was als Nächstes ansteht (nächster Termin, offene Abstimmungen, eigene Aufgaben), weil das mobile Board immer nur eine Spalte zeigt und die Status-Begriffe „Planung abgeschlossen“ und „Abgeschlossen“ leicht zu verwechseln sind.
- **Wie könnten wir** den Überblick über alle Gruppen und Spalten auf einen Bildschirm bringen, mit eindeutigen Begriffen?
- Schwächen 7 und 9. KPI: K4. Backlog: BL-05, BL-06, BL-14, BL-18.

### P6 – Verlässlich bei schlechter Verbindung
- **Nutzer:in:** Ein Mitglied unterwegs (Zug, Festival, Ausland) braucht einen klaren Hinweis, wenn keine Verbindung besteht, und den zuletzt geladenen Stand, weil Datenaufrufe heute nur mit Fehler-Toasts scheitern und im Web gar kein Offline-Hinweis erscheint.
- **Wie könnten wir** Offline-Zustände überall gleich und ehrlich zeigen, ohne eine Offline-Synchronisation zu bauen?
- Schwäche 8. KPI: keine eigene; Qualitätsziel „0 unerklärte Fehler-Toasts bei fehlender Verbindung“ im QA-Test. Backlog: BL-07, BL-17.

## 3. KPIs

**Grundsätze Datenschutz (für alle KPIs):**
- Kein Tracking-SDK, keine Klick- oder Ereignis-Analytics und keine Geräte-IDs. Die Messung nutzt nur Daten, die die App ohnehin speichert.
- Ausgewertet wird serverseitig per SQL-View oder Datenbankfunktion, die nur die Service-Rolle aufrufen darf (keine RLS-Freigabe an Clients). Sie liefert nur Aggregate: Median oder Anteil je Quartal, nie Werte einzelner Personen oder Gruppen.
- Mindestgröße: Werte erst ab 10 Gruppen ausweisen, sonst „zu wenig Daten“. So lassen sich kleine Gruppen nicht zurückrechnen.
- Fehlende Felder ergänzt BL-19 (Zeitstempel statt Ereignis-Log). Benachrichtigungen werden nach 30 Tagen gelöscht (pg_cron, PROJ-12) und taugen deshalb nicht als Messquelle.
- Hinweis in der Datenschutzerklärung: „Wir werten anonymisierte Gesamtzahlen aus, um die App zu verbessern.“ Sicherheit & QA prüft Rechtsgrundlage und Wortlaut.

| ID | KPI | Definition | Zielwert (Annahme) | Messweg (aggregiert) | Heute messbar? |
|---|---|---|---|---|---|
| K1 | Zeit bis zur Terminfindung | Median Tage von „In Planung“ bis Termin gesetzt (`start_date` nicht leer) | ≤ 5 Tage | Neue Spalten `planning_started_at`, `date_set_at` an `activities` (BL-19); Median je Quartal | Nein, Zeitstempel fehlen |
| K2 | Abstimmungsbeteiligung | Anteil der Mitglieder, die bei einem Vorschlag innerhalb von 7 Tagen nach Erstellung abstimmen; Durchschnitt je Gruppe, dann Median über alle Gruppen | ≥ 60 % | `activity_votes.created_at` im Verhältnis zur Mitgliederzahl am Erstellungstag aus `group_members.joined_at` und `group_members_history.left_at` | **Ja**, mit Vorbehalt: `reset_activity_votes` löscht Stimmen, zurückgesetzte Vorschläge zählen nicht |
| K3 | Einladungs-Annahmequote | Beitritte über Link oder Code geteilt durch erzeugte Einladungen je Quartal | ≥ 50 % | Neuer Zähler je Einladung (erzeugt, eingelöst) in der Einladungstabelle von BL-01; keine Erfassung von Link-Aufrufen | Nein, erst mit BL-01 |
| K4 | Idee → Abgeschlossen < 2 Wochen | Anteil der Aktivitäten mit `completed_at − created_at` < 14 Tage an allen im Quartal abgeschlossenen Aktivitäten | ≥ 40 % (Erfolgsmetrik aus PRD) | `activities.created_at`, `activities.completed_at` | **Ja** |
| K5 | Verantwortlichkeiten erledigt vor Termin | Anteil der Aufgaben mit `completed_at` vor `activities.start_date` an allen Aufgaben von Aktivitäten mit Termin im Quartal | ≥ 80 % | `activity_responsibilities.completed_at`, `activities.start_date` | **Ja** |
| K6 | Zusagequote (ergänzend) | Anteil der Mitglieder mit Antwort (Ja, Vielleicht oder Nein) bis 24 h vor Termin | ≥ 70 % | Neue RSVP-Tabelle (BL-03), nur Zählung je Status | Nein, erst mit BL-03 |

**Lesart:** K4 ist die Nordstern-Metrik aus dem PRD. K1, K2 und K5 erklären, warum sie steigt oder sinkt. K3 misst Wachstum, K6 Verbindlichkeit. Nullmessung: K2, K4 und K5 sofort aus dem Bestand erheben, die übrigen ab Release von BL-19, BL-01 und BL-03.

## 4. Abgrenzung für die Mockups

- **A Evolution:** löst P1, P2, P3 (nur RSVP), P5 (Startseite, Begriffe, Board-Überblick) und P6 innerhalb der heutigen Navigation, streng nach `STYLEGUIDE.md`.
- **B Spielerisch:** wie A, zusätzlich kollektive Gruppen-Ziele (BL-11) und sichtbarer Fortschritt bei Erinnerungen und Zusagen. Keine Ranglisten, keine Streaks mit Verlust, kein Verfall (Stärke 2 bleibt).
- **C Mutig:** neue Informationsarchitektur mit „Anstehend“ als Start (BL-18), Terminabstimmung mit Optionen (BL-04) und vereinfachtem Rollenmodell (BL-08).
- **Nicht in den Mockups:** Web-Push (BL-13; PROJ-10 und PROJ-12 schließen es aus) und der Offline-Lesecache (BL-17). Beide bleiben im Backlog nur als Annahme.

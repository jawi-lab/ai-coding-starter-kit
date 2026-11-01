# Backlog

Stand: 2026-11-01. Verantwortlich: Leitung. Finale Fassung nach Phase 4. Eingeflossen sind [`Definition.md`](Definition.md), [`Richtungen.md`](Richtungen.md) (Review), [`Anforderungen.md`](Anforderungen.md), [`Anforderungen-Technik.md`](Anforderungen-Technik.md) und [`Entscheidungslog.md`](Entscheidungslog.md) (E-18 bis E-27).
**Personas und Tests sind simuliert, alle Werte für Reach, Impact, Confidence und Effort sind Annahmen.**

## Methode

**RICE = R × I × C / E**

| Faktor | Bedeutung | Skala |
|---|---|---|
| R – Reach | Anteil aktiver Gruppen bzw. Nutzer:innen, die das Feature **je Quartal** berührt, in % (**Annahme**, keine Messdaten) | 0–100 |
| I – Impact | Wirkung je berührter Person | 0,25 minimal · 0,5 gering · 1 mittel · 2 hoch · 3 sehr hoch |
| C – Confidence | Sicherheit der Schätzung | 30–100 % (als Dezimalzahl gerechnet) |
| E – Effort | Personentage für Design, Umsetzung, Tests und Specs; wo vorhanden die Obergrenze aus `Anforderungen-Technik.md` | PT |

- Aufwand im Stack: **S** ≤ 2 PT · **M** 3–5 PT · **L** ≥ 6 PT.
- Varianten: A Evolution, B Spielerisch, C Mutig; „–“ = nicht im Mockup.
- **Pflicht** = Store-Richtlinie, DSGVO oder Sicherheitsregel. Pflicht-Einträge kommen vor alle Feature-Pakete, egal wie hoch ihr RICE-Wert ist. Bei ihnen zeigt RICE nur den Nutzerwert, nicht die Dringlichkeit.

**Änderungen gegenüber dem Entwurf:**
- Neu: BL-21 bis BL-27.
- Neue Aufwände: BL-01 +1,5 PT für die eigene Link-Tabelle. BL-02, BL-03, BL-04, BL-05, BL-10 und BL-11 übernehmen die Schätzung von Technik. BL-08 +1 PT für `host_id`.
- BL-14, BL-18 und BL-07 an E-18, E-21/E-22 und E-26 angepasst.

## 1. Pflichten (vor allen Feature-Paketen)

Reihenfolge nach Risiko: zuerst, was eine Store-Einreichung blockiert.

| Rang | ID | Titel | Pflicht aus | R | I | C | E | RICE | Varianten | Stack | Begründung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P1 | BL-21 | Konto löschen in der App + Web-Seite | Apple 5.1.1(v), Google Play Account Deletion, DSGVO Art. 17 | 5 | 3 | 90 % | 4 | **3,4** | A B C | M | Fehlt im Repo (Befund B-1, PROJ-8 „Out of Scope“). Nötig sind: eine Edge Function mit Service-Rolle (Auth-Nutzer, Profil, eigene Inhalte, Storage-Dateien, Google- und Gerätetoken), der Widerruf des Sign-in-with-Apple-Tokens, Bestätigung, Dauer und Erfolgsmeldung. Für Google zusätzlich eine statische Web-Seite (z. B. `/konto-loeschen/`), die ohne App erreichbar ist. Ein Admin, der löscht, gibt die Admin-Rolle vorher ab (PROJ-3-Logik). |
| P2 | BL-23 | Melden, Ausblenden, Blockieren + Admin „Inhalt entfernen“ | Apple 1.2, Google Play UGC | 20 | 1 | 70 % | 6 | **2,3** | A B C | L | Fehlt (B-3). „Melden“ im ⋯-Menü von Kommentar, Foto, Vorschlag, Umfrage und Mitglied. „Ausblenden“ wirkt nur für dich, „Blockieren“ blendet alle Inhalte eines Mitglieds aus; die Gruppe zu verlassen bleibt möglich. Admin darf Inhalte entfernen. Dazu zwei neue Tabellen (Meldungen, Blockierungen) mit RLS, gefilterte Abfragen, Kontakt in „Hilfe“ und ein Prozess für zeitnahe Reaktion (Annahme: Postfach). |
| P3 | BL-24 | Rechtliche Links + „Hilfe & Kontakt“ im Profil und bei der Registrierung | Apple 5.1.1(i), Apple 1.2 (Kontakt), WCAG 3.2.6 | 100 | 0,25 | 100 % | 1 | **25,0** | A B C | S | Die Links auf AGB und Datenschutz zeigen heute auf `#` (B-2). Datenschutz, Impressum und Nutzungsbedingungen kommen ins Profil unter „Konto & Datenschutz“, dazu eine Kontaktadresse als Platzhalter. Die Texte selbst brauchen eine rechtliche Prüfung; dieser Aufwand steckt nicht im Effort. |
| P4 | BL-22 | Meine Daten exportieren (JSON) | DSGVO Art. 15, 20 | 3 | 2 | 80 % | 3 | **1,6** | A B C | M | Edge Function erzeugt JSON mit Profil, Mitgliedschaften, eigenen Vorschlägen, Kommentaren, Stimmen, Blockern und Einstellungen; Fotos als signierte Links mit kurzer Laufzeit. Nur die eigene Person, kein Export fremder Inhalte. |
| P5 | BL-25 | Security-Header über `vercel.json` | `.claude/rules/security.md`, Anforderungen §e.5 | 100 | 0,5 | 80 % | 1 | **40,0** | – | S | `headers()` wirkt im Static Export nicht (B-4). Zu setzen: `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, HSTS und die CSP zuerst als Report-Only (`docs/production/security-headers.md`). Dieselbe Datei liefert den `Content-Type` für die AASA-Datei aus BL-01. Danach live prüfen. |
| P6 | BL-26 | Kalender-Scope auf `calendar.freebusy` senken | DSGVO Art. 25, Google „minimum scope“ | 40 | 0,5 | 80 % | 1 | **16,0** | A B C | S | Heute ist der Scope `calendar.readonly` (B-5). Bestehende Verbindungen behalten das alte Token, bis die Person neu verbindet; deshalb ein Hinweis „Kalender neu verbinden“, kein Zwang. Annahme: Die Google-Verifizierung muss für den neuen Scope nicht neu laufen; prüfen. |

## 2. Feature-Backlog nach RICE

| Rang | ID | Titel | Bereich | R | I | C | E | RICE | Varianten | Stack | Begründung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BL-03 | Zusage / RSVP („Bin dabei“, „Vielleicht“, „Kann nicht“) | Aktivität | 80 | 2 | 80 % | 3 | **42,7** | A B C | M | Schließt Schwäche 4 (P3). Neue Tabelle mit RLS (nur Gruppenmitglieder) und Zählern per Join. Fehlende Zusagen erscheinen nur als Zahl, nie als Namensliste. Basis für K6 und gezielte Erinnerungen. In C getrennt von der Terminabstimmung. |
| 2 | BL-05 | „Was steht an“-Startseite (gruppenübergreifend) | Navigation | 90 | 2 | 70 % | 3 | **42,0** | A B C | M | P5 ohne neue Daten: nächster Termin, offene Abstimmungen, eigene Aufgaben, fehlende Zusagen. In A ein Abschnitt auf Start, in B Teil von „Lagerfeuer“, in C der Tab „Anstehend“. |
| 3 | BL-01 | Teilen-Link + Deep Link | Gruppe / Wachstum | 60 | 3 | 80 % | 5,5 | **26,2** | A B C | M | Größte Wachstumsbremse (P1), Marke „Vorschlag“ (E-25). Neue Tabelle `group_invite_links` mit 128-Bit-Token, Ablauf nach 7 Tagen und Widerruf, dazu eine RPC zum Einlösen mit Rate-Limit; das sind +1,5 PT. Das Token steht im URL-Fragment, damit es nicht in Server-Logs landet (E-27). Statische Seite `/join/`. Universal Links und App Links über `public/.well-known/`, `Content-Type` über BL-25. `appUrlOpen` ist für Auth schon verdrahtet (`lib/native/deep-link.ts`). Der Code bleibt Fallback. Fragment und Universal Links müssen nativ getestet werden. |
| 4 | BL-20 | Impuls nach dem Termin („Wie war’s?“: abschließen, Fotos, Memory Card) | Erinnerungen | 60 | 1 | 60 % | 1,5 | **24,0** | A B C | S | Zahlt auf K4 ein. In allen drei Varianten Pflicht (E-19). Der Aufwand gilt nur mit der Infrastruktur aus BL-02. |
| 5 | BL-14 | Einheitliche Status-Begriffe | Board / Writing | 100 | 0,5 | 70 % | 1,5 | **23,3** | A B C | S | Laut E-18: A „Zu planen · In Planung · Termin steht · Abgeschlossen“, B und C enden mit „Erlebt“. Für die Umsetzung gilt das Ergebnis des simulierten Tests; bis dahin A. Betrifft nur Texte, Tests und Specs. |
| 6 | BL-02 | Termin-Erinnerungen und offene Aufgaben (Infrastruktur) | Erinnerungen | 70 | 2 | 70 % | 5 | **19,6** | A B C | M | Kern von P2, Marke „Vorschlag“. Täglich per pg_cron eine Funktion `dispatch_due_reminders()`, die `notifications` füllt und `send-push` aufruft; E-Mail nur bei Opt-in. Nur tagesgenau, denn für eine Uhrzeit fehlt das Schema. Standard aus, höchstens 1 pro Aktivität und Tag, direkt abschaltbar (Anforderungen §b.7). Name in C „Vorab-Hinweise“ (E-22). Der neue Event-Typ muss in `send-push/logic.ts` **und** `lib/notification-types.ts` gepflegt werden. |
| 7 | BL-16 | Sanfte Abstimmungs-Erinnerung | Erinnerungen | 60 | 1 | 60 % | 2 | **18,0** | A B C | S | Hebt K2. Höchstens 1 je Vorschlag, nur an Mitglieder ohne Stimme, eigener Schalter. Technik sieht ein Risiko, dass sie nervt; deshalb zuletzt im Paket und nur mit Opt-in. Braucht BL-02. |
| 8 | BL-06 | Mobiler Board-Überblick | Board | 70 | 1 | 70 % | 3 | **16,3** | A B | M | Status-Leiste mit Zählern über allen Spalten, „Weiter“-Buttons mit Ziel („Weiter: Termin finden“) auch mobil. C ersetzt das Board durch den Fluss (BL-18). |
| 9 | BL-04 | Terminabstimmung mit Optionen | Termine | 60 | 2 | 60 % | 4,5 | **16,0** | C | M | Umsetzung über Umfragen aus PROJ-14 (`activity_polls.kind = 'date'`, Optionen mit Zeitraum). Neue Spalte `answer` in `activity_poll_votes` für Passt, Passt vielleicht und Passt nicht. Der Admin kann weiter direkt festlegen. Der Score ist gestiegen, die Einschränkung auf C bleibt aber, weil PROJ-7 das als Produktentscheidung ausschließt; nach dem Test von C neu bewerten. |
| 10 | BL-15 | Beitritt über Link ohne Konto fortsetzen + Gruppenvorschau | Gruppe / Onboarding | 40 | 2 | 60 % | 3 | **16,0** | A B C | M | Marke „Vorschlag“. Eine RPC mit SECURITY DEFINER liefert zum Token nur Gruppenname und Mitgliederzahl, keine Namen. Eine Link-Vorschau im Messenger mit Gruppenname geht im Static Export nicht. Der Code wird über Login und Double-Opt-In hinweg gesichert (`next` nur als relativer Pfad aus einer Positivliste). |
| 11 | BL-27 | Aufgabe übernehmen + Fälligkeit | Aktivität | 60 | 1 | 70 % | 3 | **14,0** | A B C | M | Ist im Mockup als „Neu“ markiert (E-25). Im Schema ist `assigned_user_id` NOT NULL, ein Fälligkeitsfeld fehlt. Nötig: Migration (nullable, neue Spalte `due_date`) und eine UPDATE-RLS, die Mitgliedern nur erlaubt, freie Aufgaben auf sich selbst zu setzen. Zahlt auf K5 ein und liefert BL-02 das Fälligkeitsdatum. |
| 12 | BL-07 | Globaler Offline-Zustand (Web + nativ) | Plattform | 30 | 1 | 90 % | 2 | **13,5** | A B C | S | P6. Banner auch im Web. Inhalte bleiben lesbar, Schreibaktionen sind gesperrt und erklären sich. Laut E-26 verspricht der Text keine Warteschlange („geht wieder, sobald die Verbindung zurück ist“); der Offline-Text in Anforderungen §f.3 ist damit überholt. |
| 13 | BL-10 | Reaktionen auf Kommentare | Aktivität | 60 | 0,5 | 80 % | 2 | **12,0** | B C | S | Fester Emoji-Satz ohne Zähler je Person. RLS über die Helper-Funktion `is_comment_group_member()`. |
| 14 | BL-19 | Datensparsame KPI-Auswertung | Daten | 100 | 0,25 | 90 % | 2 | **11,3** | – | S | Zeitstempel `planning_started_at` und `date_set_at` sowie eine Aggregat-View nur für die Service-Rolle, ausgewiesen erst ab 10 Gruppen. **Kommt unabhängig vom Score ins erste Feature-Paket**, sonst gibt es keine Nullmessung. |
| 15 | BL-09 | Schnell-Vorschlag | Vorschläge | 60 | 0,5 | 50 % | 1,5 | **10,0** | A B C | S | Das Vorschlagslimit ist seit 2026-06-23 entfernt (PROJ-4). Nur noch der Titel ist Pflicht, die Schwelle wird mit einem Satz erklärt („Mehrheit: 4 von 6 Stimmen“). |
| 16 | BL-12 | Barrierefreiheit (WCAG 2.2 AA) | Qualität | 100 | 0,5 | 80 % | 4 | **10,0** | A B C | M | Kontrast-Korrekturen am Styleguide, Statuswechsel per Button, Touch-Ziele ≥ 44 px, Fokus-Regeln (siehe „Umsetzungshinweise“). **Läuft in jedem Paket mit**; der Rang ändert daran nichts. |
| 17 | BL-11 | Gemeinsame Gruppen-Ziele (kollektiv) | Gamification | 50 | 1 | 50 % | 5 | **5,0** | B | M | Erweitert das Momentum (PROJ-15). Kein Countdown, kein Scheitern-Zustand, keine Push-Nachrichten für Ziele (E-24). |
| 18 | BL-08 | Vereinfachtes Rollenmodell (Admin + Mitglied + Gastgeber:in) | Gruppe | 40 | 1 | 60 % | 6 | **4,0** | C | L | Neue Spalte `activities.host_id`. Gastgeber:in wird man nur bei einer freien Aktivität oder per Zuweisung, mit Verlaufseintrag; mindestens ein Admin bleibt erzwungen (E-23). Bei der Migration müssen alte Store-Builds weiter `editor` und `observer` senden dürfen, sie braucht also eine Übergangsphase. |
| 19 | BL-18 | Neue Navigation „Anstehend · Gruppe · Album“ mit Fluss statt Board | Navigation / IA | 100 | 1 | 40 % | 10 | **4,0** | C | L | Die Fluss-Stufen bilden genau die Status ab, dazu „Ideen“ (E-21). Das Archiv heißt „Album“ (E-22). Auf dem Desktop drei Spalten, Tastenkürzel abschaltbar. Großer Umbau mit geringer Sicherheit. |
| 20 | BL-13 | Web-Push (nur Annahme) | Benachrichtigungen | 30 | 1 | 30 % | 6 | **1,5** | – | L | PROJ-10 und PROJ-12 schließen Web-Push aus. iOS liefert ihn nur an installierte Web-Apps, und ein Manifest fehlt. Neu bewerten nach BL-02. |
| 21 | BL-17 | Offline-Lesecache (letzter Stand) | Plattform | 30 | 1 | 50 % | 10 | **1,5** | – | L | Gilt nur für das Lesen, eine Synchronisation gibt es nicht. Erst nach BL-07 und mit Daten über tatsächliche Offline-Nutzung. |

**Ohne RICE, aus `Anforderungen.md` übernommen (Muss bzw. Soll, Aufwand je ≤ 1 PT, Annahme):**
- EXIF- und GPS-Daten vor dem Foto-Upload entfernen (§b.10, Muss).
- Platzhalterbild und og:image selbst ausliefern statt von fremden Servern (B-7, Soll).
- Mindestalter 16 bei der Registrierung bestätigen lassen, ohne ein Geburtsdatum zu speichern (§b.8, Annahme).

Diese Punkte kommen mit in Paket 0.

## 3. Release-Pakete (Leitung)

| Paket | Inhalt | Aufwand (PT, Summe E) | Ziel |
|---|---|---|---|
| **0 „Store & Recht“** | BL-21, BL-23, BL-24, BL-22, BL-25, BL-26 + Muss-Punkte ohne RICE | ca. 16 + 2 | Pflicht vor jeder weiteren Store-Einreichung |
| **1 „Einladen“** | BL-01, BL-15, BL-19 | 10,5 | P1, K3, Nullmessung |
| **2 „Verbindlich“** | BL-03, BL-27, BL-02, BL-20, BL-16 | 14,5 | P2, P3; K1, K5, K6 |
| **3 „Überblick“** | BL-05, BL-14, BL-06, BL-07, BL-09 | 11 | P5, P6; K4 |
| **4 „Nach Test“** | C: BL-04, BL-08, BL-18 · B: BL-10, BL-11 | je nach gewählter Richtung | Erst nach dem simulierten Test und der Entscheidung für eine Richtung |
| nicht geplant | BL-13, BL-17 | – | Nur Annahmen |

BL-12 läuft in allen Paketen mit. Paket 0 lässt sich teilweise parallel bauen; BL-25 hilft schon Paket 1.

## 4. Umsetzungshinweise aus den Mockups

Diese Regeln gelten für jede Umsetzung und sind keine eigenen Backlog-Einträge.

- **Animation:** Fortschrittsbalken und Ringe über `transform` (z. B. `scaleX`) statt `width` animieren. Insgesamt nur `transform` und `opacity`, höchstens 400 ms. Feiern dauern ≤ 1 s, ohne Ton, mit ≤ 3 Blitzen pro Sekunde. Bei `prefers-reduced-motion` gibt es nur eine Überblendung (E-24).
- **Dialoge und Drawer:** Der Hintergrund muss `inert` sein, also weder mit Fokus noch mit Screenreader erreichbar. Radix bzw. `responsive-modal` (shadcn) erledigen das; keine eigenen Modals bauen.
- **Fokus:** Ein fokussiertes Element liegt nie unter Tab-Bar oder FAB. Dafür `scroll-padding-bottom` in Höhe von Tab-Bar und Safe Area setzen, beim Fokuswechsel `scrollIntoView({ block: 'nearest' })` (WCAG 2.4.11). Nach dem Öffnen einer Detailansicht springt der Fokus auf deren Überschrift.
- **Kontrast-Korrekturen am Styleguide** (E-Log, Anforderungen §c):
  - Der Fokusring bekommt eine dunkle Innenkante (≥ 3:1).
  - `ink-3` nur für Platzhalter und Deko, nicht für Text.
  - Gold-Text nur auf Gold-Tint oder in großer Schrift; Kategorien als Goldfläche mit dunklem Text.
  - Weiß auf Dark-Primary nur mit dunklerem Grün wie `#3A7756` (≈ 5,3:1) oder mit dunkler Schrift `#14110D`.
  - Status und Verfügbarkeit nie nur über Farbe zeigen.
- **Gesten:** Jede Wisch- oder Ziehgeste hat eine Alternative per Button (WCAG 2.5.7).
- **Rechte:** Wer etwas nicht darf, sieht einen kurzen Grund statt eines stumm fehlenden Buttons.
- **Datensparsam:** Fehlende Stimmen, Zusagen und Absagen nur als Zahl zeigen. Die Link-Vorschau zeigt keine Mitgliedernamen.
- **Marken:** „Vorschlag“ bzw. „Neu“ bleiben, bis das Feature live ist (E-25).
- **Bundle:** Tiptap, `canvas-confetti` und `html-to-image` erst bei Bedarf laden (`dynamic()` bzw. `await import()`).

## 5. Abhängigkeiten und Annahmen

**Abhängigkeiten**
- **Infrastruktur:**
  - BL-16 und BL-20 bauen auf BL-02 auf. Als Paket gerechnet (R 70, I 2, C 0,65, E 8,5) liegt es bei rund 10,7.
  - BL-02 nutzt die Fälligkeit aus BL-27 für Erinnerungen an Aufgaben.
  - BL-01 braucht BL-25 (`Content-Type` der AASA). BL-15 braucht BL-01 und PROJ-13.
- **KPIs:** K1 braucht BL-19, K3 braucht BL-01 (`group_invite_links`), K6 braucht BL-03.
- **Specs:**
  - BL-04 und BL-08 ändern frühere Spec-Entscheidungen (PROJ-7, PROJ-3). BL-21 und BL-22 heben „Out of Scope“ in PROJ-8 auf. Umsetzung nur über `/refine` bzw. `/write-spec` mit Freigabe der Nutzer:in.
  - BL-18 berührt alle Routen; erst nach einer Entscheidung für Variante C.
- **Native Builds:** BL-01 (Associated Domains, Intent-Filter) und BL-21 (Apple-Token-Widerruf) brauchen Store-Builds. Alles andere geht per Push auf `main` live und nativ per Capgo-OTA (`autoUpdate` ist aus).

**Technische Rahmenbedingungen**
- Static Export: keine API-Routen und keine Pfad-Parameter. Neue Seiten sind statische Ordner mit Query-Parametern oder Fragment. Header über `vercel.json`.
- Zeitgesteuerte Logik nur über pg_cron und Edge Functions. Push nur nativ über `send-push`.
- Jede neue Tabelle braucht RLS für SELECT, INSERT, UPDATE und DELETE (`.claude/rules/backend.md`): `group_invite_links`, RSVP, Meldungen, Blockierungen, Reaktionen.

**Annahmen**
- Reach-Werte sind geschätzte Anteile je Quartal; Nutzungsdaten gibt es keine. Erst BL-19 liefert Aggregate.
- Bei Pflicht-Einträgen ist R bewusst niedrig, weil wenige Personen ihr Konto löschen oder etwas melden. Die Priorität folgt aus der Pflicht, nicht aus dem Score.
- Effort gilt für eine Person mit KI-Unterstützung (Solo-Entwicklung laut PRD). Rechtstexte, AVV-Prüfung und die Store-Fragebögen sind nicht eingerechnet.
- Impact und Confidence beruhen auf der Ist-Analyse und simulierten Personas, nicht auf Interviews mit echten Menschen.

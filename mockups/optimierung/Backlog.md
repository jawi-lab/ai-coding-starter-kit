# Backlog (Entwurf)

Stand: 2026-11-01. Verantwortlich: Leitung. Wird in späteren Phasen ergänzt (Prüfung durch Design, Technik, Sicherheit & QA).
Herleitung der Probleme und KPIs: [`Definition.md`](Definition.md). **Personas und Tests sind simuliert, alle Werte für Reach, Impact, Confidence und Effort sind Annahmen.**

## Methode

**RICE = R × I × C / E**

| Faktor | Bedeutung | Skala |
|---|---|---|
| R – Reach | Anteil aktiver Gruppen bzw. Nutzer:innen, die das Feature **je Quartal** berührt, in % (**Annahme**, keine Messdaten) | 0–100 |
| I – Impact | Wirkung je berührter Person | 0,25 minimal · 0,5 gering · 1 mittel · 2 hoch · 3 sehr hoch |
| C – Confidence | Sicherheit der Schätzung | 30–100 % (als Dezimalzahl gerechnet) |
| E – Effort | Personentage für Design, Umsetzung, Tests und Specs | PT |

Aufwand im Stack: **S** ≤ 2 PT · **M** 3–5 PT · **L** ≥ 6 PT. Varianten: A Evolution, B Spielerisch, C Mutig; „–“ = nicht im Mockup.

## Priorisiertes Backlog

| Rang | ID | Titel | Bereich | R | I | C | E | RICE | Varianten | Stack | Begründung |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BL-01 | Teilen-Link + Deep Link | Gruppe / Wachstum | 60 | 3 | 80 % | 4 | **36,0** | A B C | M | Größte Wachstumsbremse (P1). Statische Seite `/join?code=…` statt dynamischer Route; Universal Links / App Links über `public/.well-known/apple-app-site-association` und `assetlinks.json` (AASA ohne Dateiendung braucht einen `Content-Type`-Header in der Vercel-Konfiguration). `@capacitor/app` und `appUrlOpen` sind für Auth schon verdrahtet (`lib/native/deep-link.ts`). Beitritt läuft weiter über `join_group_by_invite_code` mit Rate-Limit. Natives Share-Sheet über `@capacitor/share`. |
| 2 | BL-03 | Zusage / RSVP („Bin dabei“, „Vielleicht“, „Kann nicht“) | Aktivität | 80 | 2 | 80 % | 4 | **32,0** | A B C | M | Schließt Schwäche 4 (P3). Neue Tabelle mit RLS (nur Gruppenmitglieder), Anzeige im Detail und auf der Karte, Basis für K6 und gezielte Erinnerungen. |
| 3 | BL-05 | „Was steht an“-Startseite (gruppenübergreifend) | Navigation | 90 | 2 | 70 % | 5 | **25,2** | A B C | M | Löst P5 ohne neue Daten: nächster Termin, offene Abstimmungen, eigene Aufgaben, fehlende Zusagen. A: Abschnitt auf Home; C: eigener Start-Tab. |
| 4 | BL-20 | Impuls nach dem Termin (abschließen, Fotos, Memory Card) | Erinnerungen | 60 | 1 | 60 % | 1,5 | **24,0** | A B C | S | Zahlt direkt auf K4 ein: Aktivitäten bleiben heute nach dem Termin oft offen (Annahme). Aufwand gilt nur mit der Infrastruktur aus BL-02. |
| 5 | BL-14 | Einheitliche Status-Begriffe | Board / Writing | 100 | 0,5 | 70 % | 1,5 | **23,3** | A B C | S | „Planung abgeschlossen“ und „Abgeschlossen“ sind leicht zu verwechseln (Schwäche 9). Nur Texte, Tests und Specs. Vorschlag (Design prüft): Ideen · In Planung · Steht fest · Erlebt. |
| 6 | BL-16 | Sanfte Abstimmungs-Erinnerung | Erinnerungen | 60 | 1 | 60 % | 2 | **18,0** | A B C | S | Hebt K2. Höchstens 1 Erinnerung je Vorschlag, nur an Mitglieder ohne Stimme, über eigenen Schalter in `notification_preferences`. Braucht BL-02. |
| 7 | BL-02 | Erinnerungen vor Termin und bei offenen Aufgaben (Infrastruktur) | Erinnerungen | 70 | 2 | 70 % | 6 | **16,3** | A B C | L | Kern von P2. pg_cron (in PROJ-12 schon im Einsatz) ruft eine neue Edge Function auf, die neue Ereignistypen in `notifications` schreibt und über das bestehende `send-push` sowie per E-Mail ausliefert. Neue Schalter je Ereignis, Abmelde-Link bleibt. **Leitung zieht BL-02 vor BL-16 und BL-20, weil beide darauf aufbauen.** |
| 8 | BL-06 | Mobiler Board-Überblick | Board | 70 | 1 | 70 % | 3 | **16,3** | A B C | M | Spalten-Tabs zeigen Zähler, dazu eine kompakte Übersicht aller vier Spalten. Behebt den Bruch zwischen Mobile und Desktop (Discovery 1.5). |
| 9 | BL-15 | Beitritt über Link ohne Konto fortsetzen + Gruppenvorschau | Gruppe / Onboarding | 40 | 2 | 60 % | 3 | **16,0** | A B C | M | Ergänzt BL-01: Eingeladene sehen Gruppenname und Mitgliederzahl, registrieren sich und treten danach automatisch bei. Die Vorschau zeigt nur Name und Anzahl, keine Mitgliedernamen (Datensparsamkeit). Braucht BL-01 und PROJ-13. |
| 10 | BL-07 | Globaler Offline-Zustand (Web + nativ) | Plattform | 30 | 1 | 90 % | 2 | **13,5** | A B C | S | P6. `NativeNetworkBanner` auch im Web (`navigator.onLine` und `online`/`offline`-Ereignisse), Schreibaktionen offline sperren mit Hinweis statt Fehler-Toast, „Erneut versuchen“. |
| 11 | BL-19 | Datensparsame KPI-Auswertung | Daten | 100 | 0,25 | 90 % | 2 | **11,3** | – | S | Voraussetzung für K1, K3 und K6: Zeitstempel `planning_started_at` und `date_set_at` sowie eine Aggregat-View nur für die Service-Rolle, Mindestgröße 10 Gruppen. **Leitung plant BL-19 unabhängig vom Score mit dem ersten Release ein**, sonst gibt es keine Nullmessung. |
| 12 | BL-09 | Schnell-Vorschlag (ersetzt „Vorschlagslimit lockern“) | Vorschläge | 60 | 0,5 | 50 % | 1,5 | **10,0** | A B C | S | Das Limit ist seit 2026-06-23 entfernt (PROJ-4). Rest-Reibung: nur der Titel wird Pflichtfeld, Dauer optional, Schwelle mit Standardwert (Mehrheit der Gruppe, Annahme). |
| 13 | BL-12 | Barrierefreiheits-Fixes | Qualität | 100 | 0,5 | 80 % | 4 | **10,0** | A B C | M | Statuswechsel nicht nur über das ⋯-Menü, Touch-Ziele ≥ 44 px, Fokusreihenfolge in Sheets, Labels für Icon-Buttons, Kontraste in Liquid Glass. **Läuft als Qualitätsbasis in jeder Variante mit, unabhängig vom Rang.** Design und Sicherheit & QA legen die Liste fest. |
| 14 | BL-04 | Terminabstimmung mit Optionen | Termine | 60 | 2 | 60 % | 8 | **9,0** | C | L | P3: Initiator:in wählt 2–5 Optionen aus dem Overlay, alle stimmen ab, auch Mitglieder ohne Google-Kalender. Widerspricht der Entscheidung in PROJ-7 („kein Doodle-Style“), deshalb nur in C als optionaler Schritt; der Admin kann weiter direkt festlegen. Neue Tabellen, RLS, Realtime. |
| 15 | BL-10 | Reaktionen auf Kommentare | Aktivität | 60 | 0,5 | 80 % | 3 | **8,0** | B C | M | Leichte Beteiligung für Mitläufer:innen ohne eigenen Kommentar. Kleiner fester Emoji-Satz, keine Zähler je Person. |
| 16 | BL-08 | Vereinfachtes Rollenmodell (Admin + Mitglied) | Gruppe | 40 | 1 | 60 % | 5 | **4,8** | C | M | P4. „Beobachter“ entfällt, mehrere Admins erlaubt, keine Pflicht zur Übergabe beim Verlassen, solange ein Admin bleibt. Migration bestehender Rollen und Anpassung vieler RLS-Policies, deshalb hoher Aufwand und Risiko. |
| 17 | BL-11 | Gemeinsame Gruppen-Ziele (kollektiv) | Gamification | 50 | 1 | 50 % | 6 | **4,2** | B | L | Erweitert das Gruppen-Momentum (PROJ-15), z. B. „3 Unternehmungen bis Ende März“. Nur kollektiv: kein Verfall, keine Rangliste, kein Verlust bei verfehltem Ziel. Wirkung unsicher, deshalb nur in B. |
| 18 | BL-18 | Neue Navigation mit „Anstehend“ als Start | Navigation / IA | 100 | 1 | 40 % | 10 | **4,0** | C | L | Vier Tabs (z. B. Anstehend · Ideen · Plan · Ich), Termine in die Aktivität verlegt, Profil mobil und am Desktop am gleichen Ort. Großer Umbau mit geringer Sicherheit; wird nur in C erprobt. |
| 19 | BL-13 | Web-Push (nur Annahme) | Benachrichtigungen | 30 | 1 | 30 % | 6 | **1,5** | – | L | **Nur Annahme:** PROJ-10 und PROJ-12 schließen Web-Push aus. Service Worker, VAPID-Schlüssel und Browser-Unterschiede bringen viel Aufwand. Neu bewerten, wenn die Erinnerungen Web-Nutzer:innen per E-Mail zu spät erreichen. |
| 20 | BL-17 | Offline-Lesecache (letzter Stand) | Plattform | 30 | 1 | 50 % | 10 | **1,5** | – | L | Nur lesen, keine Synchronisation. Cache, Invalidierung und Datenschutz auf geteilten Geräten machen es aufwendig. Erst nach BL-07 und mit Daten über tatsächliche Offline-Nutzung. |

## Release-Vorschlag (Leitung, vorläufig)

1. **Paket „Einladen“:** BL-01, BL-15, BL-19.
2. **Paket „Verbindlich“:** BL-03, BL-02, BL-16, BL-20.
3. **Paket „Überblick“:** BL-05, BL-14, BL-06, BL-07, BL-09.
4. **Danach je nach Mockup-Test (simuliert):** BL-04, BL-08, BL-18 (C) und BL-10, BL-11 (B).

BL-12 läuft in allen Paketen mit.

## Abhängigkeiten und Annahmen

**Abhängigkeiten**
- BL-16 und BL-20 bauen auf BL-02 auf; ihr niedriger Aufwand gilt nur danach. Als Paket gerechnet (R 70, I 2, C 0,65, E 9,5) liegt das Paket bei rund 9,6.
- BL-15 braucht BL-01 und das Onboarding (PROJ-13).
- K3 braucht BL-01, K6 braucht BL-03, K1 braucht BL-19.
- BL-05 profitiert von BL-03 (fehlende Zusagen) und BL-02 (anstehende Erinnerungen), funktioniert aber auch ohne.
- BL-04 und BL-08 ändern frühere Spec-Entscheidungen (PROJ-7, PROJ-3). Umsetzung nur über `/refine` mit Freigabe der Nutzer:in.
- BL-18 berührt alle Routen und die Navigation; erst nach einer Entscheidung zu Variante C.

**Technische Rahmenbedingungen**
- Static Export: keine API-Routen. Deep Links über statische Seiten mit Query-Parametern (wie heute `/groups/view?id=`) und `.well-known`-Dateien in `public/`.
- Zeitgesteuerte Logik nur über pg_cron und Edge Functions. Push nur nativ über `send-push`.
- Jede neue Tabelle braucht RLS für SELECT, INSERT, UPDATE und DELETE (`.claude/rules/backend.md`).

**Annahmen**
- Reach-Werte sind geschätzte Anteile aktiver Gruppen bzw. Nutzer:innen je Quartal. Es gibt keine Nutzungsdaten; erst BL-19 liefert Aggregate.
- Effort umfasst Design, Umsetzung, Unit- und E2E-Tests sowie Spec-Pflege für eine Person mit KI-Unterstützung (Solo-Entwicklung laut PRD).
- Impact und Confidence beruhen auf der Ist-Analyse und simulierten Personas, nicht auf Interviews mit echten Menschen.
- Ein Store-Review ist nur für native Änderungen nötig (BL-01: Associated Domains / Intent-Filter). Web-Änderungen gehen per Push auf `main` live; OTA über Capgo ist möglich, `autoUpdate` ist aus.

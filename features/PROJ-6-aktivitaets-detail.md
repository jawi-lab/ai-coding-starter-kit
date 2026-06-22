# PROJ-6: Aktivitäts-Detail

## Status: Planned
**Created:** 2026-06-22
**Last Updated:** 2026-06-22

## Dependencies
- PROJ-1 (Supabase Infrastructure Setup) — Datenbank, Storage, RLS
- PROJ-2 (Authentifizierung & User Accounts) — eingeloggter Nutzer
- PROJ-3 (Gruppe & Mitglieder-Management) — Rollen (admin / editor / observer), Mitgliederliste für @-Mentions
- PROJ-4 (Aktivitäts-Vorschläge & Voting) — `activities`-Tabelle, Vorschläge-Tab als Zugangspunkt
- PROJ-5 (Kanban-Board) — Kanban-Karten als Zugangspunkt, Status-Modell

## User Stories
- Als Gruppenmitglied möchte ich durch Tippen auf eine Aktivitätskarte (Vorschlags-Tab oder Kanban) eine Detailansicht öffnen, damit ich alle Informationen auf einen Blick sehe.
- Als Initiator oder Admin möchte ich Name, Beschreibung, Ort und Link einer Aktivität bearbeiten, damit die Gruppe immer aktuelle Infos hat.
- Als Gruppenmitglied möchte ich Kommentare schreiben und andere Mitglieder mit @ erwähnen, damit wir uns direkt zur Aktivität abstimmen können.
- Als Gruppenmitglied möchte ich ab Status `in_planung` Verantwortlichkeiten hinzufügen und jemandem aus der Gruppe zuweisen, damit klar ist, wer was organisiert.
- Als Gruppenmitglied möchte ich nach Abschluss bis zu 5 Erinnerungsfotos hochladen, damit wir eine gemeinsame Galerie der Aktivität haben.

## Out of Scope
- @-Erwähnungs-Benachrichtigungen (Push, E-Mail, In-App-Badge) → PROJ-12
- Kalender-Export-Button in der Detailansicht → PROJ-7
- Archivierung der Aktivität und Fotos im Nutzerprofil → PROJ-8
- Kommentar bearbeiten (nur löschen ist vorgesehen)
- Reaktionen / Emojis auf Kommentare
- Video-Upload (nur Bilder)
- Bild-Upload vor Status `abgeschlossen`
- Unteraufgaben mit Erledigt-Status auf Verantwortlichkeiten (nur Label + Person)
- Statuswechsel aus der Detailansicht heraus (bleibt Aufgabe des Kanban-Boards, PROJ-5)

## Acceptance Criteria

### Öffnen der Detailansicht
- [ ] Angenommen der Nutzer ist Gruppenmitglied, wenn er auf eine Vorschlags-Karte (Vorschläge-Tab) oder eine Kanban-Karte tippt, dann öffnet sich die Detailansicht als Bottom Sheet über dem aktuellen Screen.
- [ ] Angenommen die Detailansicht öffnet sich, dann zeigt der Hero-Bereich oben: großes Titelbild (og_image_url oder Platzhalterbild), Name der Aktivität, Status-Badge, Zeitraum (Start–Ende, wenn gesetzt), Initiator-Name.
- [ ] Angenommen die Aktivität hat Status `vorschlag` oder `zu_planen`, dann fehlen die Sektionen „Verantwortlichkeiten" und „Fotos" im Sheet komplett (nicht disabled, sondern ausgeblendet).

### Scrollbarer Feed (Details-Sektion)
- [ ] Angenommen die Aktivität hat eine Beschreibung, dann wird sie unterhalb des Heroes angezeigt; fehlt sie, wird der Abschnitt ausgeblendet.
- [ ] Angenommen die Aktivität hat einen Ort, dann wird er als Freitext unterhalb der Beschreibung angezeigt; fehlt er, wird der Abschnitt ausgeblendet.
- [ ] Angenommen die Aktivität hat eine URL, dann wird sie als klickbarer Link angezeigt; fehlt sie, wird der Abschnitt ausgeblendet.

### Aktivität bearbeiten
- [ ] Angenommen der Nutzer ist Initiator oder Admin, dann sieht er ein Bearbeiten-Icon (Stift) im Header des Bottom Sheets.
- [ ] Angenommen er tippt auf das Stift-Icon, dann öffnet sich ein Formular mit den Feldern: Name (Pflicht), Beschreibung (optional), Ort (optional, Freitext), Link/URL (optional).
- [ ] Angenommen er speichert gültige Änderungen, dann werden sie sofort in der Detailansicht und auf der Kanban-/Vorschlags-Karte sichtbar.
- [ ] Angenommen er versucht zu speichern ohne den Pflichtfeldname, dann erscheint eine Validierungsfehlermeldung.
- [ ] Angenommen der Nutzer ist Redakteur oder Beobachter, dann sieht er kein Bearbeiten-Icon — die Ansicht ist rein lesend.

### Verantwortlichkeiten (ab Status `in_planung`)
- [ ] Angenommen die Aktivität hat Status `in_planung` oder `planung_abgeschlossen`, wenn der Nutzer „Verantwortlichkeit hinzufügen" tippt, dann öffnet sich ein Eingabefeld für das Label (Freitext, Pflicht) und ein Dropdown zur Auswahl eines Gruppenmitglieds (Pflicht).
- [ ] Angenommen alle Felder sind ausgefüllt, wenn er speichert, dann erscheint der Eintrag in der Verantwortlichkeiten-Liste mit Label und Mitglieds-Avatar/Name.
- [ ] Angenommen die Aktivität hat Status `abgeschlossen`, dann ist die Liste nur lesbar — kein Hinzufügen, kein Löschen.
- [ ] Angenommen der Nutzer ist der Ersteller eines Eintrags oder Admin, dann sieht er ein Löschen-Icon neben dem Eintrag; andere Mitglieder sehen es nicht.
- [ ] Angenommen er tippt auf Löschen, dann erscheint ein Bestätigungsdialog; nach Bestätigung wird der Eintrag entfernt.

### Kommentare
- [ ] Angenommen der Nutzer ist Gruppenmitglied, dann sieht er unten im Sheet ein Kommentar-Eingabefeld und die chronologisch sortierte Kommentarliste (älteste oben).
- [ ] Angenommen der Nutzer gibt einen Kommentar ein und tippt Senden, dann erscheint der Kommentar sofort in der Liste mit seinem Avatar, Namen und Zeitstempel.
- [ ] Angenommen der Nutzer tippt `@` im Kommentarfeld, dann öffnet sich ein Autocomplete-Dropdown mit den Mitgliedern der Gruppe; er wählt ein Mitglied und der Name wird als @-Mention im Text eingebettet.
- [ ] Angenommen ein anderes Mitglied schreibt einen Kommentar, während das Sheet offen ist, dann erscheint der neue Kommentar automatisch ohne Reload (Supabase Realtime).
- [ ] Angenommen der Nutzer ist Verfasser eines Kommentars oder Admin, dann sieht er ein Löschen-Icon am Kommentar; nach Bestätigung wird der Kommentar entfernt.
- [ ] Angenommen es gibt noch keine Kommentare, dann wird der Text „Noch keine Kommentare – schreib den ersten!" angezeigt.

### Foto-Galerie (nur Status `abgeschlossen`)
- [ ] Angenommen die Aktivität hat Status `abgeschlossen`, dann erscheint die Sektion „Erinnerungsfotos" im scrollbaren Feed.
- [ ] Angenommen der Nutzer hat noch weniger als 5 eigene Fotos hochgeladen, wenn er „Foto hinzufügen" tippt, dann öffnet sich der native Dateiauswahl-Dialog (Bilder).
- [ ] Angenommen er wählt ein Bild aus, dann wird es zu Supabase Storage hochgeladen und erscheint in der Galerie-Ansicht des Sheets.
- [ ] Angenommen der Nutzer hat bereits 5 Fotos hochgeladen, dann ist der Upload-Button deaktiviert mit dem Hinweis „Du hast dein Limit von 5 Fotos erreicht".
- [ ] Angenommen der Nutzer ist Uploader eines Fotos oder Admin, dann sieht er ein Löschen-Icon auf dem Foto; nach Bestätigung wird das Foto aus Storage und DB entfernt.
- [ ] Angenommen es gibt noch keine Fotos, dann wird der Text „Noch keine Erinnerungsfotos – lad das erste hoch!" angezeigt.

### Fehlerverhalten
- [ ] Angenommen die API ist beim Speichern eines Kommentars/einer Verantwortlichkeit nicht erreichbar, dann erscheint eine Toast-Fehlermeldung und die Eingabe bleibt erhalten.
- [ ] Angenommen der Foto-Upload schlägt fehl, dann erscheint eine Toast-Fehlermeldung und das Foto wird nicht in der Galerie angezeigt.
- [ ] Angenommen das Bearbeiten-Formular kann nicht gespeichert werden (API-Fehler), dann bleibt das Formular offen und zeigt eine Fehlermeldung.

## Edge Cases
- **Sehr langer Aktivitätsname:** Im Hero vollständig angezeigt (kein line-clamp), da das Bottom Sheet genug Platz bietet.
- **Viele Kommentare:** Liste scrollt innerhalb des Feeds; Eingabefeld bleibt am unteren Rand fixiert, sodass der Nutzer immer tippen kann.
- **Mitglied verlässt Gruppe:** Sein Avatar/Name in Kommentaren und Verantwortlichkeiten bleibt sichtbar (gelöschter Account: „Ehemaliges Mitglied"); er erscheint nicht mehr im @-Autocomplete-Dropdown.
- **Gleichzeitiger Kommentar von zwei Mitgliedern:** Realtime synchronisiert; beide Kommentare erscheinen in Chronologie.
- **Foto-Upload > 5 MB:** Client-seitige Validierung zeigt Fehlermeldung „Datei zu groß (max. 5 MB)" bevor Upload startet.
- **Kein og_image_url:** Platzhalterbild (wie in PROJ-4/5) als Hero-Bild.
- **Aktivität im Status `vorschlag`:** Verantwortlichkeiten- und Foto-Sektionen werden ausgeblendet; Kommentare und Basis-Infos sind sichtbar.
- **@-Mention für Mitglied ohne Profilbild:** Nur Name wird im Autocomplete angezeigt; kein Avatar-Slot nötig.

## Technical Requirements
- Supabase Realtime auf `activity_comments` (gefiltert nach `activity_id`) für Live-Kommentare
- Supabase Storage Bucket `activity-photos` (Bilder pro Aktivität/Mitglied, max. 5 MB/Datei)
- RLS auf allen neuen Tabellen: nur Gruppenmitglieder dürfen lesen/schreiben
- Neues Feld `location` (text, nullable) auf `activities`-Tabelle
- Neue Tabellen: `activity_comments`, `activity_responsibilities`, `activity_photos`

## Open Questions
- [ ] Sollen @-Mentions als strukturierte Referenzen gespeichert werden (z.B. JSON-Array mit user_ids) oder als reiner Text mit @Name? Empfehlung: strukturiert (content_text + mentions_array), um spätere PROJ-12-Benachrichtigungen zu ermöglichen.
- [ ] Maximale Kommentarlänge? (Empfehlung: 1000 Zeichen — ausreichend für Absprachen, verhindert Spam)

## Decision Log

### Product Decisions
| Decision | Rationale | Date |
|----------|-----------|------|
| Bottom Sheet statt eigener Route für die Detailansicht | Konsistent mit dem GroupMainSheet-Pattern (PROJ-3/4); kein Seitenwechsel auf Mobile, Kontext bleibt sichtbar | 2026-06-22 |
| Einziger scrollbarer Feed statt Tabs im Detail-Sheet | Wenig Inhalt pro Sektion macht Tabs überdimensioniert; vertikales Scrollen auf Mobile natürlicher | 2026-06-22 |
| Alle Mitglieder dürfen kommentieren (inkl. Beobachter) | Kommentare sind Absprachen, nicht Planungsaktionen; Beobachter sollen mitdiskutieren können | 2026-06-22 |
| Kommentar nur löschen, nicht bearbeiten | Editierbarkeit von Kommentaren erhöht Komplexität stark; für MVP-Absprachen reicht Löschen | 2026-06-22 |
| Alle Mitglieder dürfen Verantwortlichkeiten hinzufügen | Jeder soll sich selbst eine Aufgabe nehmen können; demokratisches Prinzip der App | 2026-06-22 |
| Verantwortlichkeiten ab `in_planung`, readonly ab `abgeschlossen` | Vorher keine konkrete Planung; nach Abschluss soll der Zustand unveränderlich als Erinnerung dienen | 2026-06-22 |
| 5 Fotos pro Mitglied (nicht gesamt) | Pro-Kopf-Limit ist fairer als ein geteiltes Gesamtlimit; vermeidet Dominanz eines einzelnen Mitglieds; 5 Mitglieder = max. 25 Fotos pro Aktivität | 2026-06-22 |
| Foto-Upload nur im Status `abgeschlossen` | Fotos sind Erinnerungen, keine Planungsdokumente; verhindert Missbrauch als allgemeiner File-Store | 2026-06-22 |
| @-Mention-Benachrichtigungen nach PROJ-12 verschoben | Benachrichtigungs-Infrastruktur (Push, E-Mail, In-App) ist Aufgabe von PROJ-12; PROJ-6 implementiert nur das UI und die Datenspeicherung | 2026-06-22 |
| Detailansicht von beiden Zugangspunkten erreichbar (Vorschläge-Tab + Kanban) | Einheitlicher Einstiegspunkt; Nutzer sollen Details auch bei Vorschlägen sehen können (Beschreibung, URL, Kommentare) | 2026-06-22 |
| `location` als optionaler Freitext | Nicht alle Aktivitäten haben einen Ort (z.B. Online-Events); Freitext ist flexibler als strukturierte Adresse für MVP | 2026-06-22 |

### Technical Decisions
_To be added by /architecture_

---

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_

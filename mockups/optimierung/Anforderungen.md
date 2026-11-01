# Anforderungen – Sicherheit, Datenschutz, Barrierefreiheit, Stores, Support

Stand: 2026-11-01. Team Sicherheit & QA. Gilt für die Mockups A, B, C und für eine spätere Umsetzung.
Kennzeichnung: **Muss** = Pflicht (Recht, Store, AA-Kriterium). **Soll** = dringende Empfehlung. **[Befund]** = am Repo festgestellt, Produktion nicht geprüft. **Annahme** = ohne Quelle, vor Umsetzung klären.

## Repo-Befunde vorab

| # | Befund | Beleg | Folge |
|---|---|---|---|
| B-1 | **Keine Konto-Löschung in der App.** PROJ-8 führt „Konto löschen / Datenschutz-Export“ als Out of Scope; im Code gibt es keinen Lösch-Weg. | `features/PROJ-8-*.md` Out of Scope; Suche in `src/`, `supabase/functions/` | **Store-Blocker** Apple 5.1.1(v) und Google Play (siehe §d) |
| B-2 | AGB- und Datenschutz-Links bei der Registrierung zeigen auf `#`. | `src/components/auth/SignupForm.tsx` | Apple 5.1.1(i) verlangt einen leicht erreichbaren Link zur Datenschutzerklärung in der App |
| B-3 | Kein „Melden“ und kein „Blockieren“ für Kommentare, Fotos, Vorschläge. | Suche in `src/components/` | Apple 1.2, Google Play UGC (siehe §d) |
| B-4 | Security-Header aus `.claude/rules/security.md` sind nicht konfiguriert: `next.config.ts` setzt keine `headers()`, und `headers()` wird bei `output: 'export'` ohnehin nicht unterstützt; ein `vercel.json` fehlt. | `next.config.ts`; https://nextjs.org/docs/app/guides/static-exports (Unsupported Features: Headers) | Header über `vercel.json` setzen (Technik), danach in Produktion prüfen |
| B-5 | Google-Kalender nutzt Scope `calendar.readonly`, obwohl `freeBusy` auch `calendar.freebusy` akzeptiert. | `features/PROJ-8-*.md` Z. 64/109; https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query | Datensparsamkeit (Art. 25 DSGVO) und Google „minimum scope“ (siehe §b) |
| B-6 | Einladungs-Code hat seit 2026-10-30 **10 Zeichen** (nicht 6) aus `gen_random_bytes`, mit Limit 10 Fehlversuche/Stunde. | `features/PROJ-3-*.md` „Security-Fixes“, Fall 11 | `Discovery.md` 1.1 nennt noch 6 Stellen → Leitung bitte korrigieren |
| B-7 | Platzhalterbild wird von einem fremden CDN geladen; og:image-URLs fremder Seiten werden angezeigt. | `src/lib/activity-types.ts` Z. 205; `src/hooks/useOgImage.ts` | Jeder Abruf überträgt die IP an Dritte; Bilder selbst hosten oder über eigenen Speicher ausliefern |
| Positiv | Kommentare werden aus Tiptap-JSON mit Positivliste gerendert (kein HTML), Bilder nur aus eigenem Bucket per signierter URL; Buckets privat; Code-Beitritt mit Rate-Limit; Admin-Sperre nach Entfernen. | `ActivityDetailSheet.tsx` (`TiptapRenderer`), PROJ-3/PROJ-6 Security-Fixes | Beibehalten |

## (a) Rechte, Rollen und Autorisierung

**Grundsatz (Muss):** RLS, SECURITY-DEFINER-RPCs und Edge Functions sind die einzige Autorisierungsgrenze. Das UI blendet nur aus, was verboten ist; es erlaubt nie etwas, das die Datenbank nicht erlaubt. Jede Änderung an RLS oder Auth braucht die ausdrückliche Freigabe des Nutzers (`.claude/rules/security.md`).

### Ist-Matrix (aus PROJ-3 bis PROJ-7, PROJ-14)

| Aktion | Admin | Redakteur | Beobachter | Initiator (zusätzlich) |
|---|---|---|---|---|
| Gruppe lesen, Kommentieren, Umfrage erstellen/abstimmen, eigene löschen | ✓ | ✓ | ✓ | – |
| Für Vorschläge stimmen | ✓ | ✓ | ✓ | eigener zählt mit |
| Vorschlag erstellen | ✓ | ✓ | ✗ | – |
| Vorschlag bearbeiten/löschen/neu abstimmen (Status `vorschlag`) | ✓ | ✗ | ✗ | ✓ |
| Board-Status wechseln, Termin finden/anpassen, Details bearbeiten | ✓ | ✗ | ✗ | ✓ |
| Code neu erzeugen, Name ändern, Rollen ändern, Mitglied entfernen | ✓ | ✗ | ✗ | – |
| Gruppe löschen | nur als letztes Mitglied | ✗ | ✗ | – |

### Anforderungen, falls Rollen vereinfacht werden (z. B. Admin + Mitglied)

1. **Muss:** UI-Änderung und RLS-Migration kommen gemeinsam; nie nur das UI vereinfachen.
2. **Muss:** Invariante „jede Gruppe mit Mitgliedern hat mindestens einen Admin“ bleibt in der Datenbank erzwungen.
3. **Muss:** Bisherige Beobachter werden ausdrücklich zugeordnet (Vorschlag: Mitglied). Rechte-Erweiterung wird den Betroffenen in der App einmal angezeigt.
4. **Muss:** Initiator-Rechte bleiben an `initiator_id` gebunden und gelten nur, solange der Initiator Mitglied ist (wie `reset_activity_votes`).
5. **Soll:** Wenn alle Mitglieder Board-Status ändern dürfen: Rückgängig-Möglichkeit und Verlauf „wer hat was verschoben“, Bestätigung bei nicht umkehrbaren Schritten (Abschließen).
6. **Muss:** Nur Admins entfernen Mitglieder; die Sperre `removed_by_admin` gilt auch für den Einladungs-Link.
7. **Soll:** Admin darf Inhalte anderer in der eigenen Gruppe entfernen (Kommentar, Foto, Vorschlag) – nötig für die Moderation (§d).

### Einladungs-Link

| Punkt | Anforderung |
|---|---|
| Token | **Muss:** eigenes Zufalls-Token mit mindestens 128 Bit (`gen_random_bytes(16)` o. ä.), getrennt vom 10-stelligen Code; in der DB nur als Hash gespeichert. |
| Form | **Soll:** `https://<web-domain>/join/#<token>`. Das Fragment geht nicht an den Server und nicht in Logs oder Referrer. Statischer Export: keine dynamische Route nötig. Nativ über Universal Links/App Links, nicht über das eigene URL-Schema. |
| Ablauf | **Muss:** Standard 7 Tage; Admin wählt 1, 7 oder 30 Tage. **Soll:** optional maximale Zahl an Beitritten. Ablauf wird neutral angezeigt („gültig bis 8. Nov.“). |
| Widerruf | **Muss:** Admin widerruft mit einem Tippen; „Neuen Link erzeugen“ macht den alten sofort ungültig (wie beim Code). Entfernen eines Mitglieds widerruft nicht den Link, die Sperre greift trotzdem. |
| Wer darf teilen | **Soll:** alle Mitglieder dürfen den aktuellen Link teilen (wie heute den Code); erzeugen und widerrufen nur Admins. |
| Rate-Limit | **Muss:** Einlösen nur über RPC/Edge Function; höchstens 10 Fehlversuche pro Nutzer und Stunde (wie `invite_code_attempts`), zusätzlich Limit für die Vorschau ohne Login pro IP. |
| Kein Erraten | **Muss:** gleiche Fehlermeldung für ungültig, abgelaufen und widerrufen („Dieser Link gilt nicht mehr. Bitte um einen neuen.“); keine Unterscheidung, ob die Gruppe existiert. |
| Vorschau | **Muss:** vor dem Login nur Gruppenname und „Du wurdest eingeladen“; keine Mitgliedernamen, keine Inhalte. Beitritt erst nach Login und ausdrücklichem Tippen auf „Beitreten“. |
| Status `pending` | **Muss:** wer die E-Mail noch nicht bestätigt hat, tritt nicht bei; der Link bleibt bis nach der Bestätigung gemerkt (WCAG 3.3.7). |

## (b) DSGVO

1. **Datensparsamkeit (Art. 5 Abs. 1 lit. c, Art. 25):** Profil nur Anzeigename (kein Klarnamen-Zwang) und optionaler Avatar. Kein Adressbuch, kein Standort, keine Analytics, keine Werbe-SDKs, Schriften lokal. Mockups zeigen keine Felder, die nicht gebraucht werden. Art. 25 verlangt datenschutzfreundliche Voreinstellungen (https://www.datenschutz-grundverordnung.eu/grundverordnung/art-25-ds-gvo/).
2. **Rechtsgrundlagen (Vorschlag, Annahme bis zur rechtlichen Prüfung):**

   | Verarbeitung | Grundlage |
   |---|---|
   | Konto, Gruppen, Vorschläge, Kommentare, Fotos, In-App-Benachrichtigungen | Art. 6 Abs. 1 lit. b (Vertrag/Nutzung) |
   | E-Mail-Benachrichtigungen | Einwilligung Art. 6 Abs. 1 lit. a, Standard aus (so umgesetzt, PROJ-12) |
   | Push-Benachrichtigungen | Systemerlaubnis + Schalter in der App; Gerätetoken nur für den gewünschten Dienst (§ 25 Abs. 2 TDDDG „unbedingt erforderlich“, https://www.gesetze-im-internet.de/ttdsg/__25.html, nur per Suche gesehen) |
   | Google-Kalender | Einwilligung Art. 6 Abs. 1 lit. a, jederzeit trennbar |
   | Sicherheitsprotokolle, Rate-Limit-Tabellen | Art. 6 Abs. 1 lit. f, kurze Speicherfrist |

3. **Einwilligung E-Mail/Push (Muss):** nie vorausgewählt, nicht an den Beitritt gekoppelt, einzeln widerrufbar (Profil → Benachrichtigungen), Abmelde-Link in jeder E-Mail (vorhanden). Push-Soft-Ask nur im Kontext, nicht beim ersten Start.
4. **Kalenderdaten nur frei/belegt (Muss):** Scope auf `calendar.freebusy` senken (B-5). Andere Mitglieder sehen pro Tag nur frei/belegt bzw. die Ampelfarbe, nie Titel, Orte oder Uhrzeiten. „Kein Kalender verbunden“ erscheint als „keine Angabe“, nicht als „belegt“. Cache höchstens 30 Minuten (PROJ-7). Google verlangt minimale Scopes und verbietet Werbenutzung und menschliches Mitlesen (https://developers.google.com/terms/api-services-user-data-policy). Vorbild für die Formulierung: Google-Freigabestufe „nur frei/belegt“ (https://support.google.com/calendar/answer/37082).
5. **Löschung (Art. 17) und Export (Art. 15, 20) – Muss:** Profil → „Konto löschen“ (siehe §d) und „Meine Daten exportieren“ (JSON: Profil, Mitgliedschaften, eigene Vorschläge, Kommentare, Stimmen, Blocker, Benachrichtigungs-Einstellungen; Fotos als Links oder ZIP). Vor dem Löschen klar sagen, was mit eigenen Kommentaren und Fotos passiert (Vorschlag: werden gelöscht; Stimmen fließen nur anonym in Zähler ein; Archiv anderer behält die Aktivität ohne Namen). Google-Token und Gerätetoken werden mitgelöscht.
6. **Auftragsverarbeiter (Art. 28, Vertrag nötig, https://www.datenschutz-grundverordnung.eu/grundverordnung/art-28-ds-gvo/):** laut `docs/architecture/mellon.architecture.json` Supabase (DB, Auth, Storage, Realtime, Functions), Vercel (Web-Hosting), Resend (E-Mail), Firebase Cloud Messaging/APNs (Push), Capgo (OTA). **Annahme, prüfen:** Serverregionen, AVV-Abschluss und Drittlandgrundlage je Anbieter. Google Calendar API ist kein Auftragsverarbeiter von Mellon, sondern Quelle auf Wunsch der Person; trotzdem in der Datenschutzerklärung nennen.
7. **Erinnerungen opt-in (Muss für ein neues Feature):** Standard aus; einschalten pro Person und Kanal; Häufigkeit begrenzt (z. B. höchstens eine Erinnerung pro Aktivität und Tag); nie an Nicht-Mitglieder; abschaltbar direkt aus der Erinnerung.
8. **Altersgrenze (Annahme, prüfen):** Art. 8 DSGVO setzt 16 Jahre für Einwilligungen, Mitgliedstaaten dürfen bis 13 senken (https://www.datenschutz-grundverordnung.eu/grundverordnung/art-8-ds-gvo/). Für Deutschland wird 16 angenommen. Vorschlag: Mindestalter 16 in den Nutzungsbedingungen und eine Bestätigung bei der Registrierung, ohne Geburtsdatum zu speichern.
9. **Speicherfristen:** In-App-Benachrichtigungen 30 Tage (vorhanden), Verfügbarkeits-Cache 30 Minuten, Rate-Limit-Einträge und Einladungs-Versuche höchstens 30 Tage (Annahme), Link-Tokens nach Ablauf löschen.
10. **Fotos:** EXIF/GPS-Daten vor dem Upload entfernen (Muss), damit kein Standort geteilt wird.

## (c) WCAG 2.2 AA – prüfbare Kriterien für die Mockups

Neue 2.2-Kriterien und Stufen laut W3C: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/. Kriterientexte: https://www.w3.org/TR/WCAG22/.

| Kriterium | Prüfung im Mockup | Bekannte Risiken aus `STYLEGUIDE.md` (berechnet) |
|---|---|---|
| **1.4.3 Kontrast** 4.5:1 Text, 3:1 große Schrift (≥ 18 pt bzw. 14 pt fett) | Alle Texttokens gegen ihren Hintergrund messen, hell und dunkel | `--ink-3 #8E8578` auf Cream 3,43:1 → nur für große Schrift oder Dekor. Honiggold `#C08A2E` als Text auf Cream 2,87:1 und Blush `#DC9C88` 2,17:1 → nur als Fläche mit Ink-Text (5,46:1 bzw. 7,22:1). **Dunkel: Weiß auf Primary `#468B67` nur 4,08:1** → dunkle Schrift (`#14110D`, 4,62:1) oder dunkleres Grün |
| **1.4.11 Nicht-Text-Kontrast** 3:1 | Input-Rahmen, Schalter, Fokusring, Ampel-Kacheln, Icons ohne Text | `--line-strong #D8CDBA` auf Weiß 1,57:1 → Eingabefeld braucht anderes Merkmal (Fläche, Label) oder dunkleren Rahmen. **Gold-Fokusring `#D9A24B` auf Cream nur 2,15:1** → Ring mit dunkler Innenkontur oder Primary-Ring (10:1) im Light Mode |
| Ampel-Farben (1.4.1 Farbe allein) | Verfügbarkeit grün/gelb/rot/grau zusätzlich mit Symbol oder Text | – |
| **2.4.7 Fokus sichtbar** | Tab durch jede Ansicht; jedes Element zeigt Fokus | – |
| **2.4.11 Fokus nicht verdeckt** | Fokussiertes Element nie ganz unter Tab-Bar, schwebendem Plus-Button, Sticky-Header oder Kommentar-Eingabe; `scroll-padding` passend setzen | Schwebende Tab-Bar und Plus-Button (Discovery 1.5) |
| **2.5.8 Zielgröße** mind. 24×24 CSS-px oder ausreichender Abstand; **App-Ziel 44×44** (`STYLEGUIDE.md`) | Messen: Herz-Vote, ⋯-Menü, Schließen-X, Chips, Kalendertage, Avatare | Kalendertage im Monatsraster auf 375 px |
| **2.5.7 Ziehbewegungen** | Jede Drag-Aktion (Board-Karten, Sheet-Griff, Sortieren) hat eine Ein-Tipp-Alternative (Menü „Verschieben nach…“, Schließen-Knopf) | Variante C mit neuer Board-Interaktion |
| **3.3.7 Redundante Eingabe** | Einladungs-Token, Gruppenwahl, E-Mail bleiben über Login/Registrierung erhalten; keine Doppel-Eingaben | Beitritt per Link nach Registrierung |
| **3.3.8 Barrierearme Anmeldung** | Kein Rätsel/CAPTCHA ohne Alternative; Einfügen in Passwort- und Code-Felder erlaubt; `autocomplete` (`email`, `current-password`, `one-time-code`); Google/Apple-Login | Code-Eingabe muss Einfügen zulassen |
| **3.2.6 Einheitliche Hilfe** (A) | Hilfe-Eintrag in allen Ansichten am selben Ort | §f |
| **4.1.3 Statusmeldungen** | Toasts, „Gespeichert“, Vote-Zähler, Fehler per `role="status"` bzw. `role="alert"` ohne Fokuswechsel; `alert` nur für Wichtiges | – |
| **Reduced Motion** (2.3.3 ist AAA; Projektstandard `prefers-reduced-motion`) | Memory-Card-Aufdecken, Konfetti, Momentum-Level, Spring-Votes: bei reduzierter Bewegung Überblenden statt Bewegung; nichts blinkt mehr als 3× pro Sekunde (2.3.1) | Variante B (mehr Animation) |
| **1.4.10 Reflow / 1.4.4 Text 200 %** | 320 px Breite ohne horizontales Scrollen; Text auf 200 % ohne Verlust | Board-Spalten, Tabellen |
| Namen und Rollen (4.1.2) | Icon-Buttons haben zugängliche Namen; Schalter melden Zustand; Sheets/Dialoge fangen den Fokus und geben ihn zurück | – |

## (d) Store-Richtlinien

Quellen: Apple App Review Guidelines https://developer.apple.com/app-store/review/guidelines/, Apple Konto-Löschung https://developer.apple.com/support/offering-account-deletion-in-your-app/, Apple Altersfreigaben https://developer.apple.com/help/app-store-connect/reference/age-ratings-values-and-definitions/, Google Play Konto-Löschung https://support.google.com/googleplay/android-developer/answer/13327111, Google Play UGC https://support.google.com/googleplay/android-developer/answer/9876937, Google Play Data safety https://support.google.com/googleplay/android-developer/answer/10144311.

| Regel | Inhalt | Mellon heute | Pflicht für die Mockups |
|---|---|---|---|
| **Apple 5.1.1(v)** Konto-Löschung | Wer Konten anlegen lässt, muss das Löschen in der App anbieten; ganz löschen, nicht nur deaktivieren; kein Zwang zu E-Mail/Anruf; Dauer nennen; bei Sign in with Apple Token widerrufen | **Fehlt (B-1)** | Profil → Konto → „Konto löschen“ mit Erklärung, Bestätigung (ggf. erneute Anmeldung), Erfolgsmeldung |
| **Google Play** Konto-Löschung | In-App-Weg **und** Web-Seite zum Löschen ohne Neuinstallation; Daten aus dem Data-safety-Formular löschen; Aufbewahrung offenlegen | Fehlt | wie oben + Web-Link „Konto löschen“ (z. B. auf der Website) |
| **Apple 5.1.1(i)** Datenschutzerklärung | Link in den Store-Metadaten und leicht erreichbar in der App | Links auf `#` (B-2) | Datenschutz und Impressum im Profil und bei der Registrierung |
| **Apple 4.8** Login-Dienste | Bei Drittanbieter-Login eine gleichwertige Option, die nur Name und E-Mail nimmt und E-Mail verbergen lässt | E-Mail, Google **und Apple** vorhanden | Apple-Login in allen Login-Screens gleichwertig zeigen (nicht kleiner als Google) |
| **Apple 1.2 / Google UGC** Nutzerinhalte | Filter, Melden mit zeitnaher Reaktion, Blockieren, veröffentlichte Kontaktdaten; Google: Nutzungsbedingungen vor UGC akzeptieren, Melden und Blockieren in der App, Moderation | Fehlt (B-3) | „Melden“ im ⋯-Menü von Kommentar, Foto, Vorschlag, Umfrage und Mitglied; „Mitglied blockieren“ (blendet dessen Inhalte aus, Gruppe verlassen bleibt möglich); Admin kann Inhalte entfernen; Kontakt in „Hilfe“ |
| **Apple 4.5.4** Push | Keine Werbung per Push ohne ausdrückliches Opt-in, Abmeldung in der App | Nur Gruppenereignisse | Push nur für Gruppenereignisse und opt-in-Erinnerungen; keine „Komm zurück“-Push |
| **Apple 2.3.6 / Altersfreigabe** | Fragebogen ehrlich beantworten; Stufen 4+, 9+, 13+, 16+, 18+; „Messaging and Chat“ und UGC stehen bei 4+, „Social Media“ bei 13+ | Private Gruppen, keine öffentliche Reichweite | Annahme: Einstufung nach Fragebogen; Nutzungsmindestalter 16 (§b.8) unabhängig davon |
| **Apple 1.3 / Google Families** | Kids-Kategorie: keine Links nach außen ohne Elternschranke, keine Dritt-Analytics | Nicht Zielgruppe | Nicht für Kinder ausrichten; keine Kids-Kategorie |
| **Apple 4.2** Mindestfunktion | Mehr als eine verpackte Website | Native Push, Teilen, Kamera | Native Funktionen sichtbar nutzen (Teilen-Menü, Push, Haptik) |
| **Apple 5.1.2 / Google Data safety** | Daten nur mit Erlaubnis teilen; Data-safety-Angaben vollständig und passend zur Datenschutzerklärung; HTTPS | Kein Tracking | Store-Texte versprechen nur, was die Datenschutz-Angaben decken |

## (e) Sicherheit

1. **XSS bei Rich-Text-Kommentaren (Muss):** Speichern nur als Tiptap-JSON; Rendern nur über die Positivliste (`doc`, `paragraph`, `text` mit `bold`/`italic`, Listen, `mention`, `image`). Kein `dangerouslySetInnerHTML`, kein `generateHTML` für Nutzerinhalte. Falls Links in Kommentaren kommen: nur `https:`, `rel="noopener noreferrer"`, sichtbare Ziel-Domain. Längen-Check in der DB (5.000 Zeichen, vorhanden). CSP über `vercel.json` (B-4), zuerst `Content-Security-Policy-Report-Only` (`docs/production/security-headers.md`).
2. **Bild-Uploads (Muss):** Typen-Positivliste JPEG, PNG, WebP, HEIC (HEIC nach JPEG wandeln), **kein SVG**; 5 MB auch serverseitig über Bucket-Einstellungen (`file_size_limit`, `allowed_mime_types`); zufällige Dateinamen unter `<activity_id>/<user_id>/`; EXIF/GPS entfernen; Buckets privat mit signierten URLs (vorhanden). `avatars` ist öffentlich: nur zufällige Pfade, kein Name im Pfad.
3. **Deep-Link-Validierung (Muss):** Links und Push-Ziele mit `URL()` parsen; nur eigene Hosts und eine feste Liste interner Pfade (`/groups`, `/join`, Aktivität per ID); IDs als UUID prüfen; `javascript:`, fremde Hosts und offene Weiterleitungen verwerfen. Universal Links (`apple-app-site-association`) und App Links (`assetlinks.json`) statt eigenem URL-Schema für Einladungen, weil fremde Apps ein eigenes Schema belegen können. Ziel nach Login nur aus der Positivliste.
4. **og:image-Abruf (Soll):** Die Edge Function `fetch-og-image` lädt nur `https:`, blockiert private und interne Adressen (SSRF), folgt höchstens wenigen Weiterleitungen, begrenzt Größe und Zeit. Ergebnisbild in eigenen Speicher übernehmen statt Fremd-URL anzeigen (B-7).
5. **Header (Muss):** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security` über `vercel.json` setzen und live prüfen (B-4).
6. **Abmelde- und Einladungs-Tokens:** signiert bzw. zufällig, nicht erratbar, nicht in Logs (Fragment statt Query, siehe §a).

## (f) Support

1. **Muss:** Eintrag „Hilfe & Feedback“ im Profil, auf allen Plattformen am selben Ort (WCAG 3.2.6): kurze FAQ (Einladen, Rollen, Kalender, Benachrichtigungen, Konto löschen), Kontakt-E-Mail als Platzhalter, „Problem melden“. Apple 1.2 verlangt veröffentlichte Kontaktdaten.
2. **Soll:** „Problem melden“ öffnet eine vorausgefüllte E-Mail mit App-Version und Plattform, **ohne** Gruppeninhalte, Namen oder Tokens. Kein eingebautes Tracking-SDK.
3. **Muss:** Jede Fehlermeldung sagt, was passiert ist und was als Nächstes zu tun ist, mit einer Aktion:
   - Offline: „Keine Verbindung. Deine Änderung wird gesendet, sobald du wieder online bist.“ + „Erneut versuchen“
   - Link ungültig: „Dieser Link gilt nicht mehr. Bitte die Person, die dich eingeladen hat, um einen neuen.“
   - Rate-Limit: „Zu viele Versuche. Bitte versuch es in einer Stunde erneut.“
   - Keine Berechtigung: „Das darf nur der Admin oder wer die Idee eingebracht hat.“ (statt stillem Ausblenden, wo es Verwirrung stiftet)
   - Upload zu groß: „Das Bild ist größer als 5 MB. Wähle ein kleineres oder verkleinere es.“
4. **Soll:** Leere Zustände erklären den nächsten Schritt (z. B. „Noch keine Ideen. Schlag die erste vor.“), ohne Druck.

## Prüfpunkte für die Mockups (Phase 4/5)

| # | Prüfpunkt | Quelle |
|---|---|---|
| P1 | „Konto löschen“ im Profil erreichbar, mit Erklärung (was wird gelöscht, wie lange), Bestätigung und Erfolgsmeldung; „Daten exportieren“ daneben | §b.5, §d |
| P2 | Datenschutz, Impressum und Nutzungsbedingungen bei Registrierung und im Profil verlinkt (kein `#`) | §d, B-2 |
| P3 | „Melden“ an Kommentar, Foto, Vorschlag, Umfrage, Mitglied; „Blockieren“; Admin kann Inhalte entfernen | §d, B-3 |
| P4 | Einladungs-Link: Teilen-Menü, QR, Ablaufdatum sichtbar, Admin-Widerruf, Vorschau ohne Mitgliedernamen, einheitliche Fehlermeldung | §a |
| P5 | Kein Dark Pattern im Einladen und in der Gamification: keine Belohnung fürs Einladen, kein Adressbuch, keine künstliche Dringlichkeit, keine vorausgewählten Einwilligungen | Wettbewerb §5, §b.3 |
| P6 | Kalender-Verbindung erklärt „nur frei/belegt“; andere sehen keine Termintitel; „keine Angabe“ ≠ „belegt“; Ampel zusätzlich mit Symbol/Text | §b.4, §c |
| P7 | Erinnerungen und E-Mail standardmäßig aus, pro Kanal schaltbar, direkt abbestellbar | §b.3, §b.7, §d |
| P8 | Kontrast: Text ≥ 4.5:1 (groß 3:1), UI und Fokusring ≥ 3:1, hell und dunkel; insbesondere Gold-/Blush-Text, `--ink-3`, Weiß auf Dark-Primary, Gold-Ring | §c |
| P9 | Fokus sichtbar und nie ganz von Tab-Bar, Plus-Button oder Eingabeleiste verdeckt | §c 2.4.7, 2.4.11 |
| P10 | Ziele ≥ 24 px (Ziel 44 px), gemessen an Vote, ⋯, X, Chips, Kalendertagen | §c 2.5.8 |
| P11 | Jede Drag-Aktion hat eine Tipp-Alternative | §c 2.5.7 |
| P12 | Beitritt per Link übersteht Registrierung ohne erneute Eingabe; Einfügen in Code-/Passwortfeldern möglich | §c 3.3.7, 3.3.8 |
| P13 | Statusmeldungen mit `role="status"`/`alert`; Animationen bei `prefers-reduced-motion` ersetzt | §c 4.1.3 |
| P14 | „Hilfe & Feedback“ an gleicher Stelle in allen Varianten; Fehlermeldungen mit nächstem Schritt und Aktion; Offline-Zustand vorhanden | §f |
| P15 | Demodaten ohne echte Namen, Konten, Codes; kein externer Bild- oder Schrift-Abruf im Mockup | Projektregel, B-7 |

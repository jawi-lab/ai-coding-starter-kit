# Usability-Tests (SIMULIERT)

Stand: 2026-11-01 · Rolle: Design

> **SIMULIERT.** Niemand aus der Zielgruppe hat diese Tests gemacht. Die vier Personas aus [`Personas.md`](Personas.md) sind fiktiv. Ihre Zitate sind erfunden und zeigen nur, wie die Persona vermutlich reagieren würde. Belastbar sind nur die **Messwerte**: Klicks, Tab-Schritte, Größen und Fokus. Sie stammen aus automatisierten Durchläufen im Browser. Vor einer Umsetzung müssen echte Tests mit Menschen folgen.

## 1. Methode

- **Prüfling:** `mockup-a.html`, `mockup-b.html`, `mockup-c.html` (Build vom 2026-11-01, 00:52), geöffnet per `file://`.
- **Werkzeug:** Playwright mit dem vorinstallierten Chromium. Skripte lagen nur im Arbeitsordner, der Browser wurde danach geschlossen.
- **Geräte:** Mobil 390 × 844 px, Desktop 1440 × 900 px. Die Tastatur-Durchläufe für Jonas liefen auf beiden.
- **Barrierefreiheit:**
  - Jonas: nur `Tab`, `Enter`, `Leertaste` und `Esc`. Geprüft wurden Fokus, Beschriftung und Live-Region.
  - Tobias: Rot-Grün-Schwäche simuliert (Chromium-Emulation „deuteranopia“). Dazu Schriftgröße 200 % am Wurzelelement, Browser-Zoom 200 % und Reflow bei 320 px.
  - Zusätzlich lief ein Durchlauf mit „Bewegung reduzieren“.
- **Konto:** Alle Personas nutzen das Demo-Konto „Mara“, die Rolle wird über die Steuerung gesetzt. Lena und Jonas sind Admin. Tobias ist in A/B Beobachter und in C Mitglied. Mira ist Admin.
- **Aufgaben an die Demodaten angepasst:**

| Aufgabe in `Personas.md` | Im Test |
|---|---|
| T1 „Wanderung im Elbsandstein“ | „Kanutour auf der Lahn“, Zustand „Zu planen“ |
| T2 „Zugtickets“, „Proviant“ | gleich, in „Hüttenwochenende im Harz“ |
| T3 Code `K7M2QX` | Demo-Code `LAUFNORD24`, zuerst mit Tippfehler |
| T4 „Spieleabend bei Mira“ | „Bouldern in der Kletterhalle“ (3/4 Stimmen; die eigene Stimme löst die Schwelle aus) |
| T6 „Sommerfest am See“ | „Herbstwanderung zum Aussichtsturm“ |
| T8 „Getränke mitbringen“ | „Tickets reservieren“ auf der Startseite |

> **Wichtiger Vorbefund:** In allen drei Mockups lässt sich der Inhalt **weder per Touch noch per Mausrad scrollen**. Das gilt mobil und am Desktop. Alles unterhalb des ersten Bildschirms ist dann nur per Tastatur erreichbar, weil der Browser dem Fokus nachscrollt (Details unter K-1). Damit die Aufgaben überhaupt prüfbar waren, liefen alle Durchläufe mit einer nachträglich eingefügten CSS-Korrektur. Ohne Korrektur scheitern T1 (A/B), T2, T6 und T8 für alle, die per Touch oder Maus bedienen.

## 2. Ergebnisse je Aufgabe

Erfolg: **ja** = Erfolgskriterium aus `Personas.md` erfüllt · **teilweise** = Aufgabe geschafft, ein Kriterium verfehlt · **nein**. Klicks gemessen, Zitate simuliert.

| Aufgabe | Persona | Var. | Erfolg | Klicks / Schritte | Beobachtung (Zitat simuliert) |
|---|---|---|---|---|---|
| T1 Termin finden und festlegen | Lena | A | teilweise | 5 (Termine → Termin finden → 2 Tage → Festlegen) | Tage mit Symbol und Text, aber keine Empfehlung. „Alle frei“ zählt die 2 Mitglieder ohne Kalender nicht mit. „Ich muss 30 Kästchen lesen, um den besten Samstag zu finden.“ |
| T1 | Lena | B | teilweise | 5 | Wie A. Die Feier „Termin steht!“ funktioniert. |
| T1 | Lena | C | ja | 3 (Gruppe → Termin abstimmen → Diesen Termin festlegen) | Summen pro Option (✓3 ?1 ×0). Gleichstand 21./22. Nov. und 5./6. Dez. ohne Entscheidungshilfe. „Endlich sehe ich Zahlen. Aber welchen nehme ich jetzt?“ |
| T2 Zwei Aufgaben verteilen, Stand prüfen | Lena | A | ja | 8 | Formular mit Person-Auswahl; Stand „1 von 7 erledigt“ direkt sichtbar. |
| T2 | Lena | B | ja | 8 | Wie A, Überschrift „Missionen“, der Button heißt aber „Aufgabe hinzufügen“. |
| T2 | Lena | C | ja | 8 | Wie A, Einstieg über den Fluss. |
| T3 Beitritt per Code, nur Tastatur | Jonas | A | ja | 2 Tabs, Eingabe, Enter | Feld beschriftet, Hinweis verknüpft. Tippfehler: Fokus bleibt im Feld, `aria-invalid` und Fehlertext werden angesagt. Kleinschreibung wird angenommen. Erfolg in der Live-Region, Fokus auf der Überschrift. „Das hat einfach funktioniert.“ |
| T3 | Jonas | B | ja | 2 Tabs | Wie A. |
| T3 | Jonas | C | ja | 2 Tabs | Wie A. Der Fokusring am Feld hat keine dunkle Innenkante (gilt für alle drei). |
| T4 Abstimmen, nur Tastatur | Jonas | A | teilweise | 9 Tabs mobil / 17 Desktop (7 nach „Zum Inhalt springen“) | Button nennt Vorschlag und Stand („Für … stimmen, 3 von 4“, `aria-pressed`). Die Feier fängt den Fokus. **Nach `Esc` landet der Fokus auf `body`.** „Wo bin ich jetzt? Mein Screenreader sagt nichts mehr.“ |
| T4 | Jonas | B | teilweise | 10 / 18 Tabs; im Stapel 6 Tabs + 1× Enter | Der Stapel ist per Tastatur gut bedienbar. Fokusverlust nach der Feier wie in A. |
| T4 | Jonas | C | teilweise | 8 / 12 Tabs | Kürzeste Wege. Tastenkürzel 1/2/3/N lassen sich abschalten (WCAG 2.1.4 erfüllt). Fokusverlust wie in A. |
| T5 Vorschlag mit Link | Mira | A | teilweise | 2 (Vorschlag erstellen → Teilen) | Nur der Titel ist Pflicht, Dauer und Schwelle sind vorbelegt. **Es gibt kein Link-Feld.** „Wo kommt mein Link hin? In die Beschreibung?“ |
| T5 | Mira | B | teilweise | 2 | Wie A. |
| T5 | Mira | C | teilweise | 3 (Erstellen → Idee teilen → Teilen) | Kein Link-Feld. Danach landet Mira auf „Anstehend“ und sieht ihre Idee nicht. Die Meldung sagt „Vorschlag ist online“, obwohl C sonst „Idee“ sagt. |
| T6 Erinnerung öffnen, Foto, teilen | Mira | A | teilweise | 4 (Profil → Album → Karte → Fotos hinzufügen) | Foto-Auswahl (Demo) klappt. **Kein „Teilen“ für die Memory Card.** Das Zitat aus dem Album fehlt im Detail. „Ich will die Karte in meine Story packen, aber wie?“ |
| T6 | Mira | B | teilweise | 4 | Wie A. |
| T6 | Mira | C | teilweise | 3 (Album → Karte → Fotos) | Ein Schritt weniger dank eigenem Album-Tab. Teilen fehlt auch hier. |
| T7 Verfügbarkeit angeben, Gewinner-Tag finden (Farbsehschwäche, große Schrift) | Tobias | A | teilweise | 3 („Kann nicht“-Tage → 2 Tage) | Eintragen ohne Kalender klappt. Mit Farbsehschwäche-Simulation bleibt alles lesbar: Symbole ✓ ? × in jedem Tag und in der Legende. Den Gewinner-Tag gibt es aber nur durch Absuchen. Tagesfelder sind 36 × 44 px. Die Leiste „Gewählt“ und die Tab-Bar verdecken mobil eine Kalenderzeile. |
| T7 | Tobias | B | teilweise | 3 | Wie A. |
| T7 | Tobias | C | ja | 3 (Passt / Passt nicht / Vielleicht) | Antwort-Buttons 100 × 66 px mit Symbol und Text, Summen mit Symbol und Zahl. „So kann ich das mit dem Daumen machen.“ Nach dem Antippen kommt keine Meldung, nur der gedrückte Zustand. |
| T8 Aufgabe abhaken, einhändig | Tobias | A | teilweise | 1 Tap nach Scrollen | Die Aufgabe liegt bei y ≈ 869 px, also unter der Tab-Bar (Oberkante 768 px). Die Checkbox misst 32 × 32 px. **Die Zeile verschwindet sofort, es gibt kein Rückgängig.** „Ups, falsch getippt – und weg ist sie.“ |
| T8 | Tobias | B | teilweise | 1 Tap nach langem Scrollen | Die Aufgabe liegt bei y ≈ 1432 px, unter Lagerfeuer, Saison-Ziel, Rückblick und Stapel. „Ich muss erst am Lagerfeuer vorbei, bevor ich sehe, was ich tun soll.“ |
| T8 | Tobias | C | teilweise | 1 Tap nach kurzem Scrollen | Die Aufgabe liegt bei y ≈ 811 px, knapp unter der Tab-Bar. Sonst wie A. |

Weitere Messwerte:

- Reflow bei 320 px und Zoom 200 %: in allen drei Mockups ohne horizontales Scrollen.
- Mit „Bewegung reduzieren“ entfällt das Konfetti, die Feier bleibt als Dialog.
- Keine Konsolenfehler.

## 3. Probleme und Fixes

Schweregrad: **kritisch** (blockiert) · **hoch** (Aufgabe gefährdet oder WCAG-AA-Verstoß) · **mittel** · **gering**.

### Variantenübergreifend (gilt für A, B und C)

| ID | Schwere | Problem | Fix (Datei / Screen) |
|---|---|---|---|
| K-1 | kritisch | Kein Scrollen per Touch oder Maus. `.app` ist ein Grid ohne Zeilenbegrenzung, deshalb wird `.col` so hoch wie der Inhalt (z. B. 1779 px statt 796 px). `main[data-scroll]` scrollt nie, `#frame` schneidet ab. Tastatur funktioniert nur, weil der Browser dem Fokus nachscrollt. | `src/a.css`, `src/b.css`, `src/c.css`: `.app{grid-template-rows:minmax(0,1fr)}` und `.col{min-height:0}`, danach neu bauen. Im Browser geprüft: Scrollen funktioniert dann in allen Varianten. Ergänzend in `tests/dod.cjs` eine Prüfung „vertikal scrollbar“ (Mausrad auf `main`). |
| H-1 | hoch | Fokusverlust auf `body`, sobald das fokussierte Element verschwindet: nach `Esc` oder „Weiter“ in der Schwellen-Feier (T4), nach dem Abhaken auf der Startseite (T8) und nach „Bin dabei“ bzw. „Zusagen“ auf der Startseite. Verstößt gegen WCAG 2.4.3; Screenreader verlieren die Position. | `src/core.js`, `render()` und `closeCelebrate`: Wird `keepKey` nicht gefunden, den Fokus auf das nächste Element derselben Liste setzen, sonst auf die Abschnittsüberschrift (`tabindex="-1"`). Betrifft die Screens Start bzw. Anstehend sowie Vorschläge bzw. Fluss. |
| H-2 | hoch | Abhaken ohne Rückgängig: Die Zeile verschwindet aus „Deine Aufgaben“, erneutes Tippen ist nicht möglich. Das ist kritisch bei einhändiger Bedienung (Tobias, Kriterium T8). | `src/core.js` `toggleTask` und `toast()`: Meldung mit Button „Rückgängig“ (5 s, bei Fokus pausierend). Die erledigte Zeile bleibt bis zum nächsten Screenwechsel durchgestrichen stehen. |
| M-1 | mittel | Die Checkbox zum Abhaken misst 32 × 32 px. WCAG 2.5.8 ist erfüllt, Styleguide und Insight 4 verlangen aber mindestens 44 px. | `src/*.css`, `.check`: Trefferfläche 44 × 44 px (Pseudo-Element oder Padding), Optik darf 28–32 px bleiben. |
| M-2 | mittel | Kein Link-Feld im Vorschlag (T5, Job J1). | Modal `proposal` in `src/a.js`, `b.js`, `c.js` sowie `forms.proposal` in `core.js`: optionales Feld „Link (optional)“, `type="url"`, `inputmode="url"`, Vorschau-Chip. |
| M-3 | mittel | Die Memory Card lässt sich nicht teilen, das Zitat fehlt im Detail (T6, Job J10). | Aktivitäts-Detail im Status Abgeschlossen bzw. Erlebt: Memory-Card-Kopf mit Zitat (Serif) und Button „Karte teilen“ (Demo-Meldung); dazu in der Feier „Neue Memory Card“ den Button „Teilen“. |
| M-4 | mittel | Text wächst nicht mit der Schriftgröße am Wurzelelement, weil Größen in px angegeben sind. Browser-Zoom funktioniert, Tobias’ System-Schriftgröße greift in der App aber nicht. | Typo-Tokens in `src/*.css` auf `rem` umstellen. Für die echte App in Technik prüfen, ob Android-WebView `textZoom` die Systemschrift übernimmt. |

### A – Evolution

| Schwere | Problem | Fix |
|---|---|---|
| hoch | Terminfindung ohne Empfehlung. Lena und Tobias müssen 30 Felder absuchen; „Alle frei“ verschweigt die 2 Mitglieder ohne Kalender (T1, T7). | `src/a.js` Screen `datefinder`: über dem Kalender „Beste Zeiträume“ (Top 3) als Liste mit Text, z. B. „Sa. 21.–So. 22. Nov. · 4 von 4 mit Kalender frei · 2 unbekannt“; jede Zeile wählt den Zeitraum per Tipp. |
| mittel | Die Leiste „Gewählt / Noch nichts“ und die Tab-Bar verdecken mobil eine ganze Kalenderzeile. | `src/a.css` Screen `datefinder`: Leiste erst nach der ersten Auswahl einblenden und auf eine Zeile mit „Termin festlegen“ verkleinern; `scroll-padding-bottom` für die Kalenderfelder. |
| mittel | Die eigene Aufgabe liegt auf Start unter dem ersten Bildschirm, hinter dem Rückblick „Wie war der Escape Room?“ und „Als Nächstes“ (T8). | `src/a.js` Screen `home`: „Deine Aufgaben“ und „Deine Stimme fehlt“ als kompakte Zeilen direkt unter die Begrüßung; den Rückblick auf eine Zeile mit Button verkürzen. |

### B – Spielerisch

| Schwere | Problem | Fix |
|---|---|---|
| hoch | „Was steht an“ rutscht weit nach unten: Die Mission liegt bei y ≈ 1432 px, hinter Lagerfeuer, Saison-Ziel, Rückblick und Stapel. Widerspricht Insight 1 (Pflicht für alle Richtungen). | `src/b.js` Screen `home`: Reihenfolge Begrüßung → „Deine Missionen“ und Zusage → Stapel-Einstieg → Lagerfeuer und Saison-Ziel als kompakte Kopfzeile, Details aufklappbar. |
| hoch | Terminfindung ohne Empfehlung, wie in A. | `src/b.js` Screen `datefinder`: Liste „Beste Zeiträume“ wie in A, gern mit Sticker „Meiste können“ (Symbol und Text). |
| gering | Uneinheitliche Begriffe: Überschrift „Missionen“, Button „Aufgabe hinzufügen“, Meldung „Erledigt! Noch 0 offen“ bzw. „Alles erledigt. Stark, Team!“. | `src/b.js` Screen `activity`: Button „Mission hinzufügen“ oder Überschrift „Missionen (Aufgaben)“. Einen Begriff durchziehen. |

### C – Mutig

| Schwere | Problem | Fix |
|---|---|---|
| mittel | Nach „Idee teilen“ springt C auf „Anstehend“: `go('proposals')` gibt es in C nicht und fällt auf den Start zurück. Mira sieht ihre Idee nicht. Die Meldung sagt „Vorschlag“ statt „Idee“. | `src/core.js` `forms.proposal`: `go(V.groupHome)` statt `'proposals'`, danach zur neuen Karte scrollen und sie hervorheben. Meldungstext über `V.labels.proposal` je Variante. |
| mittel | Terminabstimmung: Gleichstand (✓3 ?1 ×0 bei zwei Optionen) ohne Hinweis, welche vorn liegt (T1). | `src/c.js` Screen `datepoll`: Marke „Meiste Zusagen“ als Text und Symbol, bei Gleichstand „Gleichstand – Kalender-Hinweis: frei“ bzw. die frühere Option vorschlagen. |
| mittel | Auf „Anstehend“ gibt es zur Zusage nur „Zusagen“, ohne „Vielleicht“ oder „Kann nicht“. Nach dem Tipp verschwindet der Button (Fokusverlust, siehe H-1). In der Terminabstimmung fehlt eine Rückmeldung zur Antwort. | `src/c.js` Screen `agenda`: drei kompakte Antwort-Buttons wie im Detail. Screen `datepoll`: kurze Meldung „Gespeichert: Passt“ über die Live-Region. |

## 4. Fazit (simuliert)

| Persona | Beste Variante | Begründung |
|---|---|---|
| Lena (Organisatorin) | **C**, dann A | Terminabstimmung mit Summen in 3 Klicks statt Kalender-Absuchen in 5; der Fluss zeigt alle Stufen auf einen Blick. A wirkt vertraut, braucht aber die Empfehlung „Beste Zeiträume“. |
| Jonas (Screenreader und Tastatur) | **C**, knapp vor A | Kürzeste Tab-Wege (8 mobil / 12 Desktop), abschaltbare Kürzel. Beschriftungen und Fehlermeldungen sind in allen drei gleich gut. H-1 (Fokusverlust) betrifft alle und muss vor jedem Test mit echten Screenreader-Nutzer:innen behoben sein. |
| Mira (Spontane) | **B** | Mit dem Stapel stimmt sie pro Karte mit einem Tipp ab, und die Feier-Momente passen zu ihr. Link-Feld und Teilen fehlen in allen Varianten; ohne M-2 und M-3 bleibt ihr Lieblingsteil unvollständig. |
| Tobias (Elternteil, Farbsehschwäche) | **C**, dann A | Große Antwort-Buttons, Zahlen mit Symbolen, keine Farbabhängigkeit. In B steht seine Aufgabe zu weit unten. Für alle gilt: Rückgängig (H-2) und 44 px (M-1) nachrüsten. |

**Gesamt:** C löst die Kernaufgaben am schnellsten, A ist das risikoärmste Fundament, B liefert die besten Erfolgsmomente, aber die schwächste Ordnung auf der Startseite. Vor der nächsten Testrunde K-1, H-1 und H-2 in allen drei Mockups beheben.

## 5. Nachtest nach Korrekturrunde 2 (simuliert)

> **SIMULIERT.** Gleiche Methode wie in Abschnitt 1, Build vom 2026-11-01 01:12. **Diesmal ohne eingefügte CSS-Korrektur.** Zitate sind erfunden, die Messwerte sind gemessen.

| Punkt | A | B | C | Ergebnis |
|---|---|---|---|---|
| 1 Scrollen per Mausrad und Touch (390 px und 1440 px) | ✓ | ✓ | ✓ | **Behoben** (K-1). Mausrad bewegt `main` (z. B. A: 983 px), Touch-Wischen ebenso (≈ 550 px). |
| 2 Fokus nach `Esc` aus Feiern, nach Abhaken und nach Zusage | ✓ | ✓ | ✓ | **Behoben** (H-1). Die Schwellen-Feier fängt den Fokus, nach `Esc` landet er auf der H1 (A/B „Vorschläge“, C „Feierabend-Crew“). Nach „Termin steht“ auf der H1 der Aktivität. Nach dem Abhaken bleibt er auf der Checkbox, nach der Zusage auf der H1. |
| 3 „Rückgängig“ beim Abhaken | ✓ | ✓ | ✓ | **Behoben** (H-2). Die Meldung zeigt „Rückgängig“ (6 s), klickbar; danach ist die Aufgabe wieder offen, Meldung „Wieder offen.“, Fokus auf der Checkbox. Die erledigte Zeile bleibt stehen. **Rest:** Per Tastatur liegt der Button 13 (A), 14 (B) bzw. 8 (C) Tabs entfernt und ist bei 6 s kaum erreichbar (WCAG 2.2.1). |
| 4 „Beste Zeiträume“ über dem Kalender | ✓ | ✓ | ✓ | **Behoben** (A/B hoch). Top 3 als Text mit Zahl („4 von 4 mit Kalender frei“), Hinweis „2 ohne Kalender sind nicht eingerechnet“. Liegt vor dem Kalender (y ≈ 470 statt ≈ 930). T1 jetzt in 2 Klicks ab Terminfindung. |
| 5 B-Start: Missionen oben, Lagerfeuer kompakt | – | ✓ | – | **Größtenteils behoben.** Die Mission liegt bei y ≈ 734 statt 1432, also im ersten Bildschirm (Tab-Bar bei 768). Saison-Ziel jetzt unten. **Rest:** „Als Nächstes“ mit der Zusage steht erst bei y ≈ 1041, hinter „Deine Stimme fehlt“. |
| 6a Checkbox 44 px | ✓ | ✓ | ✓ | **Behoben** (M-1). Gemessen 44 × 44 px. |
| 6b Link-Feld im Vorschlag | ✓ | ✓ | ✓ | **Behoben** (M-2). Das Feld „Link (optional)“ (`type="url"`) wird gespeichert. **Rest:** Der Link erscheint weder auf der Karte noch im Detail. |
| 6c C: nach „Idee teilen“ in den Fluss | – | – | ✓ | **Behoben.** Die neue Idee steht oben unter „Ideen“. **Rest:** Die Meldung sagt weiter „Vorschlag ist online“ statt „Idee“. |

Kurz wiederholt:

| Aufgabe | A | B | C | Beobachtung (simuliert) |
|---|---|---|---|---|
| T1 Lena, Termin finden | ja, 4 Klicks (Termine → Termin finden → Bester Zeitraum → Festlegen) | ja, 4 | ja, 3 per Abstimmung oder 2 ab „Termin direkt festlegen“ | „Jetzt sagt mir die App, welcher Samstag passt.“ In C bleibt der Gleichstand in der Terminabstimmung ohne Marke. |
| T2 Lena, Aufgaben verteilen | ja, 6 Klicks ab Detail | ja, 6 | ja, 6 | Unverändert gut, „1 von 7 erledigt“. |
| T6 Mira, Erinnerung teilen | teilweise | teilweise | teilweise | **Offen** (M-3): Im Detail einer erlebten Aktivität fehlen weiterhin Zitat und „Karte teilen“. |
| T8 Tobias, abhaken | ja | ja | ja (knapp: y ≈ 805, Tab-Bar ab 775) | 44 px und Rückgängig erfüllen das Kriterium. In A (y ≈ 873) und C liegt die Aufgabe noch unter der Tab-Bar, ein kurzes Scrollen ist nötig. |

**Noch offen (als Mängel ins Entscheidungslog):**

1. T6 und M-3: Memory Card ohne Teilen, Zitat fehlt im Detail (A/B/C).
2. Der Link aus dem Vorschlag wird nicht angezeigt (A/B/C).
3. Der Rückgängig-Button ist per Tastatur in 6 s praktisch nicht erreichbar. Vorschlag: Zeit bei Fokus oder Hover anhalten oder ein Kürzel anbieten.
4. Ab Korrekturrunde 2 nicht nachgeprüft:
   - C: kein Hinweis bei Gleichstand in der Terminabstimmung
   - C: „Zusagen“ ohne „Vielleicht“ oder „Kann nicht“
   - C: Meldung „Vorschlag“ statt „Idee“
5. A/C: Die eigene Aufgabe liegt knapp unter der Tab-Bar. B: „Als Nächstes“ steht spät.
6. M-4: Schrift in px, wächst nicht mit der Systemschrift (nicht erneut geprüft).

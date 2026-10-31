# QA: Apple-Design-Optimierung (2026-10-30)

Getestet wurde der nicht committete Stand auf Basis von `8b1be88`. Es gibt keine Feature-Spec, Maßstab war das beschriebene Verhalten.

**Ergebnis: Kein offener High-Bug.** Die App startet auf iOS 27, die Sheet-Gesten funktionieren dort. Offen sind ein Low-Bug und die Punkte unter „Nicht getestet“. Die gesamte E2E-Suite wurde nach den Korrekturen nicht wiederholt.

## Bugs

| # | Schwere | Befund | Status |
|---|---------|--------|--------|
| 1 | High | „Bewegung reduzieren“ griff bei Sheets und Dialogen nicht, weil der Selektor `.animate-in` nicht auf `data-[state=open]:animate-in` passte. | behoben, im Browser bestätigt |
| 2 | Medium | Wegwischen verwarf Formular-Entwürfe ohne Rückfrage. | behoben: Rückfrage bei geänderten Eingaben im Vorschlags- und Umfrage-Formular |
| 3 | Medium | Im Build fehlte das unprefixte `backdrop-filter` bei `.glass`, Chrome zeigte keine Unschärfe. | behoben durch geänderte Reihenfolge, Unschärfe in Chrome bestätigt |
| 4 | Low | `tailwindcss-animate` stand in `dependencies`. | behoben: jetzt `devDependencies`, Audit wieder auf altem Stand |
| 5 | Low | Das Zurückfedern glitt auch bei „Bewegung reduzieren“. | behoben: springt direkt zurück |
| 6 | Low | Beim Öffnen zeigen der Schließen-Button im Aktivitäts-Sheet und „Weiter bearbeiten“ in der Rückfrage sofort den Fokusring. Herkunft nicht mit dem alten Stand verglichen. | offen |
| 7 | Critical | Mit dem iOS-27-SDK gebaut, startete die App auf iOS 27 nicht: „UIScene life cycle is required for apps built with this SDK“. Nicht durch die Design-Änderungen verursacht. | behoben: Capacitor 8.6.0 und `SceneDelegate`, auf iOS 27 und 26.5 bestätigt |
| 8 | High | Die Tastatur verdeckte in der iOS-App Formularfelder und den Absende-Button, weil das Keyboard-Plugin `visualViewport` außer Kraft setzt (`Keyboard.m:196-197`). Auch auf iOS 26.5, nicht durch die Design-Änderungen verursacht. | behoben in `useKeyboardInset` für alle drei Nutzer; im Vorschlags-Formular auf iOS 27 bestätigt |
| 9 | Medium | Vier Bestätigungsdialoge saßen wegen `mx-4` zu weit rechts und wurden am Rand abgeschnitten. Drei davon bestanden schon vorher. | behoben; nur die Rückfrage im Simulator bestätigt |

Der ausdrückliche Button „Abbrechen“ im Umfrage-Formular schließt weiterhin ohne Rückfrage, weil er eine bewusste Entscheidung ist.

## Native Tests

**iOS-Simulator (iPhone 18 Pro, iOS 27.0), mit QA-Konto:** Start und Login, Griff ziehen, Zurückfedern (5 von 5), Wisch und Tipp schließen, Rückfrage mit beiden Buttons, Formular bei offener Tastatur bis zum Absende-Button scrollbar, Wegziehen bei offener Tastatur. Nach dem Tastatur-Fix wurde nur der Tastatur-Ablauf wiederholt. Im allerersten Griff-Versuch stand das Sheet 1,5 s nach dem Loslassen noch verschoben, danach nicht mehr.

**Deep Link (iOS 27):** `com.zusammen.app://auth/callback?error=access_denied` führt mit angemeldeter Sitzung auf „Meine Gruppen“. Ein Login-Rückweg mit echtem Code und ein Kaltstart wurden nicht getestet.

**iOS-Simulator (iPhone 17 Pro, iOS 26.5):** Start, Login und Tastatur-Fehler nachgestellt, Tastatur-Fix angewendet. Die Korrektur des oberen Abstands wurde nur auf iOS 27 geprüft. Die frühere Angabe „iOS 27.0“ für dieses Gerät war falsch.

**Android-Emulator (Pixel 7, Debug-Build):** Touch-Gesten im Profil-Sheet bestanden, vor dem Capacitor-Update. Mit 8.6.0 startet die App und zeigt die Startseite. Der Endstand baut, wurde aber nicht mehr gestartet. Formulare und Bedienungshilfen wurden nicht geprüft, weil der Emulator mit einem echten Konto angemeldet ist.

## Browser (Chromium, Produktions-Build)

- Touch bei 375 px, Maus für Widerstand und Greifen beim Öffnen: alles wie vorgesehen.
- 768 und 1440 px: Dialog bleibt beim Öffnen und Schließen zentriert, kein Griff sichtbar.
- Griff überdeckt in Vorschlag-Formular, Aktivitäts-Detail und Benachrichtigungen keine Bedienelemente und ist im Dark Mode sichtbar.
- „Bewegung reduzieren“: Sheet blendet ein (y bleibt 0), Schließen nach dem Ziehen springt nicht.
- „Transparenz reduzieren“ und „Kontrast erhöhen“ ändern Glasfläche, Rahmen und `--ink-3` wie vorgesehen. Diese Prüfung lief vor Fix #3 und wurde danach nicht wiederholt.
- Rückfrage: leeres Formular schließt direkt. Mit Eingabe erscheint sie, das Sheet federt zurück, „Weiter bearbeiten“ behält den Text, „Verwerfen“ schließt.

## Automatisierte Tests

- Endstand: Unit 440 von 440 bestanden, Typprüfung und ESLint für `src`, `tests` und `scripts` ohne Fehler.
- Endstand: `tests/apple-design-sheets.spec.ts` mit QA-Konto, 5 von 5 bestanden in 25 s.
- Gesamtsuite E2E Chromium, vor den Korrekturen: 89 bestanden, 15 fehlgeschlagen, 79 übersprungen.
- Vergleich der 15 Fehlschläge mit `8b1be88`: auf beiden Ständen identisch 8 fehlgeschlagen, 6 übersprungen, 1 bestanden. Die 8 sind also keine Regression dieser Änderung, ihre Ursache wurde nicht untersucht:
  - PROJ-16: AC-PROFIL-1, -2, -3
  - PROJ-3: AC-JOIN-VAL-2, AC-JOIN-VAL-4, AC-DETAIL-1, -2, -3
- Die übrigen 7 waren Login-Zeitüberschreitungen im langen Lauf. 6 davon wurden im Vergleich übersprungen, sind also nicht erneut geprüft.

## Betrieb

Am 2026-10-30 stürzte der Entwicklungsrechner ab: `next dev` hatte 809 PostCSS-Worker gestartet (rund 60 GB). Mit dem alten `.next/dev`-Cache nachgestellt, mit frischem Cache nicht. Gegenmaßnahmen: Turbopack-Dateicache im Dev-Modus aus, `scripts/dev-guard.mjs` hinter `npm run dev`, Playwright ohne Report-Server und mit Gesamt-Zeitlimit.

## Sicherheit

Die Design-Änderung ist reines Frontend ohne neue Datenwege oder Eingaben. Der `SceneDelegate` leitet Deep Links an denselben Capacitor-Weg wie zuvor. Einen Pen-Test der gesamten App gab es nicht. `npm audit --omit=dev` meldet nach dem Capacitor-Update 44 Schwachstellen, davon 1 kritische (`next`, Bereich bis 16.4.0), die schon vorher bestand und nicht behoben wurde.

## Nicht getestet

- Echte Geräte, Safari und Firefox.
- Tastatur-Fix im Umfrage-Formular und im Aktivitäts-Detail.
- Push und Kamera nach dem Umstieg auf UIScene und Capacitor 8.6.0.
- Die 79 übersprungenen E2E-Tests und der Mobile-Safari-Testlauf der Suite.

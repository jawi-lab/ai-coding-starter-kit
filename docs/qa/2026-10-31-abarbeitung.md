# Abarbeitung der offenen Punkte (2026-10-31)

Commit-Bereich `24a55b5` bis zum Commit dieses Berichts. Jedes Paket hat ein neu gestarteter Prüfer (Modell Sonnet) geprüft, der die Begründung der Umsetzung nicht kannte.

## Ergebnis

Alle umgesetzten Fixes sind live und unabhängig bestätigt. Offen bleiben die instabile Gesamt-E2E-Suite (Login-Rate-Limit), 41 übersprungene E2E-Tests, Firefox und die Punkte, die Logins oder Signing brauchen.

## Testzahlen

| Prüfung | Ergebnis | Geprüft von |
|---|---|---|
| `npm run lint` | 0 Fehler, 105 Warnungen | Gesamtprüfer |
| `npm test` | 488 von 488 bestanden | Gesamtprüfer |
| `npm run build` | Erfolgreich | Gesamtprüfer |
| Gesamte E2E-Suite, letzter Lauf | **156 bestanden, 2 fehlgeschlagen, 41 übersprungen** | Zweiter Gesamtprüfer |
| Gesamte E2E-Suite, Läufe davor | 155/2/42 und 154/4/41 | Erster Gesamtprüfer |
| PROJ-4 und PROJ-6 E2E | 47 von 47, 0 übersprungen (vorher 4 bestanden, 43 übersprungen) | Prüfer Paket A |
| Fix-Specs gegen die Live-Seite | 11 von 11 | Umsetzung; Live-Stichprobe separat vom Gesamtprüfer bestanden |

Alle fehlgeschlagenen E2E-Tests scheitern im Login, in jedem Lauf andere. In den zuletzt ausgewerteten Läufen zeigt die Seite „Zu viele Login-Versuche" (Supabase-Auth-Rate-Limit). Die Suite ist damit nicht grün, ein Funktionsfehler wurde aber nicht gefunden.

## Status je Punkt

### Paket A

| Punkt | Status | Beleg |
|---|---|---|
| A1 E2E-Selektoren | Behoben, bestätigt | 47 von 47. Die Specs warteten nicht aufs Laden; dazu veraltete Navigation |
| A2 Schrift-Fehler | Behoben, bestätigt | Google liefert zeitweise `…/l/font?kit=…&skey=…`, das `&` bricht die Turbopack-Query. Traf auch `npm run build` (1 von 4). Jetzt `next/font/local`: 8 von 8 Builds. iCloud-Duplikate ausgeschlossen. Der Prüfer konnte das Beheben belegen, die Ursache steht im Build-Log des Fehlschlags |
| A3 Befund P2 | Geklärt, bestätigt | Im Repo nicht erklärt, Wortlaut im lokalen Sitzungsprotokoll: Fokusring beim Öffnen von Dialogen. Behoben mit B5 |
| A4 PROJ-1 | Korrigiert, bestätigt | Beide High-Bugs seit `6406065` behoben. BUG-3 (Low) offen, siehe unten |

**Dabei aufgedeckt und behoben (PROJ-4):** Das Aktionsmenü einer Vorschlagskarte öffnete das Detail-Sheet mit.

### Paket B

| Punkt | Status | Beleg |
|---|---|---|
| B1 Löschen per Realtime | Behoben, bestätigt | Migration `20261031212758`, E2E mit zwei Konten. Typen unverändert |
| B2 RLS-Absage | Behoben, bestätigt | Editor löscht fremden Kommentar: 0 Zeilen, Kommentar bleibt, Fehlermeldung. Bilder werden erst nach erfolgreichem Löschen entfernt |
| B3 Plus-Button | Behoben, bestätigt | Mobil neben den Filtern, keine Überlappung an allen geprüften Scroll-Positionen. Schwebender Button und `useHideOnScrollDown` samt Unit-Test entfallen |
| B4 Statusleiste | Behoben, bestätigt | Simulator: hell auf Grün und Gold, dunkel auf Cream und Blush, danach App-Theme. Nur im Light-Modus geprüft |
| B5 Fokusring | Behoben, bestätigt, mit Lücke | Chromium mit Touch-Emulation: kein Ring nach Tippen, Ring und Bedienung per Tab bleiben. WebKit im Simulator: am Sheet-X kein Ring. „Weiter bearbeiten" in echtem WebKit nicht geprüft |
| Sicherheit | Bestanden | RLS unverändert. Hinweis unten |

### Paket C

| Punkt | Status | Beleg |
|---|---|---|
| Dark Mode | Bestätigt | 402 und 1440 px |
| Desktop-Layout | Bestätigt | Detail und Board bei 1440 px |
| Kommentar mit neuem Bild | Fehler gefunden, behoben, bestätigt | Bild lag 168 px hinter dem Kommentarfeld |
| Zwei Mitglieder, Realtime | Bestätigt | `tests/PROJ-6-kommentare-realtime.spec.ts`, 2 von 2 |
| Listen mit Einträgen | Bestätigt, ein Fehler behoben | Teilen-Button verdeckte den Wrapped-Fuß |
| Firefox | Blockiert | Start scheitert an der Sandbox der Arbeitsumgebung (`Operation not permitted`). Sandbox bewusst nicht abgeschaltet |
| Safari | Teilweise | App-WebKit im Simulator wie bei B4, B5. Safari.app nur Login-Seite, kein eingeloggter Lauf |
| Live-Seite | Bestätigt | Login, Plus, Wrapped-Fuß, lokale Schriften |

**Dabei aufgedeckt und behoben:** Das Tippen auf „Kommentar löschen" ging verloren, wenn das Kommentarfeld den Fokus hatte.

### Paket D

| Punkt | Status | Beleg |
|---|---|---|
| D1 Schlüssel | Erledigt, bestätigt | `publicKey` gesetzt, in beiden Builds enthalten, `autoUpdate` bleibt `false` |
| D1 App-ID | Blockiert | Kein Capgo-Login |
| D2 Privater Schlüssel | Erledigt, bestätigt | `_local/capgo/.capgo_key_v2`, ignoriert, nie in der Git-Historie |
| D3 Android | Gebaut und signiert, Upload blockiert | `_local/builds/Mellon-release-signed.aab`, Signatur passt zum neuen Upload-Schlüssel. Kein Play-Zugang |
| D3 iOS | Archiv unsigniert, Upload blockiert | `_local/builds/Mellon-unsigned.xcarchive`. Keine Signing-Identität, kein Team |

## Offen

1. **Gesamt-E2E nicht grün:** Jeder Test loggt sich neu ein, das löst das Auth-Rate-Limit aus. Nächster Schritt: einmal in `global-setup` einloggen und `storageState` wiederverwenden. Nach zwei Prüfrunden als offen eingetragen.
2. **41 übersprungene E2E-Tests:** PROJ-7 (17), PROJ-5 (14), PROJ-14 (4), PROJ-12 (2), PROJ-3 (2), PROJ-17 (1), PROJ-8 (1). In PROJ-5 und PROJ-7 nutzt `openFirstGroup` noch `button.rounded-[18px]`, derselbe Fehler wie bei A1. Der Auftrag nannte nur PROJ-4 und PROJ-6. Die Gründe in den übrigen Specs sind nicht einzeln geprüft.
3. **Firefox:** Lauf außerhalb der Sandbox nötig.
4. **PROJ-1 BUG-3:** `.env.local.example` ist per Projektregel für Claude gesperrt und wurde nicht geprüft.
5. **Realtime-Hinweis (niedrig):** Supabase wendet auf DELETE-Ereignisse kein RLS an. Ein anonymer Client bekam die UUID gelöschter Kommentare und den Zeitpunkt, keine Inhalte. Das ist dokumentiertes Verhalten. Ob es vor der Migration genauso war, ist nicht geprüft.
6. **Advisors:** Keine neue Warnung durch die Migration. Bestehend sind unter anderem `Leaked Password Protection` aus, `pg_net` im Schema `public` und per `anon` aufrufbare `SECURITY DEFINER`-Funktionen.

## Testdaten

Das Konto `qa-bot-2@zusammen.test` bleibt bewusst als Redakteur in der QA-Testgruppe, weil die Realtime-Spec es braucht. Testkommentare sind entfernt; der Gesamtprüfer fand keine Reste.

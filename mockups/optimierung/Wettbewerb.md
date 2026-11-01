# Wettbewerbsanalyse – Gruppenplanung unter Freunden

Stand: 2026-11-01. Team Sicherheit & QA (Markt, ASO, Growth).

**Methode:** Jede Aussage über ein fremdes Produkt stützt sich auf die genannte Quelle, die am Stichtag abgerufen wurde. Steht dort **(Suche)**, wurde die Aussage nur im Suchergebnis-Auszug gesehen, weil die Seite selbst nicht vollständig lud. **Annahme** heißt: ohne Quelle, muss vor einer Entscheidung geprüft werden. Preise und Funktionen ändern sich. Vergleiche mit Konkurrenten gehören nicht in Store-Texte (siehe ASO).

## 1. Marktüberblick

| Produkt | Kernfunktion | Stärke | Lücke (aus Sicht Freundesgruppe) | Relevanz für Mellon | Quelle |
|---|---|---|---|---|---|
| **Doodle** | Gruppen-Umfrage für Termine, Buchungsseite, Sign-up-Sheet | Etablierter Terminfinder, ein Link für alle | Zielt auf Unternehmen, Schulen, Gesundheitswesen; abgestimmt wird nur über Zeiten, nicht über Ideen; keine Aufgaben, keine Erinnerungsfotos | Mittel: Maßstab für „Termin per Abstimmung“, den PROJ-7 bewusst ausschließt | https://doodle.com/en/ |
| **WhatsApp Umfragen** | Umfragen im Gruppenchat; neu: Endzeit, verdeckte Abstimmende, Frage 15 Min. editierbar | Null Hürde: alle sind schon im Chat | Umfragen gehen im Chatverlauf unter; kein Status „Idee → geplant → erledigt“ | **Hoch**: der eigentliche Konkurrent ist „wir machen das im Chat“ | https://blog.whatsapp.com/your-group-chats-upgraded-introducing-better-polls-all-and-more |
| **WhatsApp Events** | Event im Chat mit Datum, Ort, Antwort „Dabei / Vielleicht / Nicht dabei“ | Zusage direkt im Chat | Nur ein Host, kein Co-Host; neue Mitglieder sehen ältere Events nicht **(Suche)** | Hoch: zeigt, dass eine einfache Zusage erwartet wird (Discovery 1.4, Punkt 4) | https://faq.whatsapp.com/3313983622238973/ (Suche) |
| **Google Kalender** | Kalender teilen mit Stufen bis „nur frei/belegt (Details ausblenden)“ | Bewährtes Freigabemodell, frei/belegt ohne Termindetails | Kein Abstimmen über Ideen; Freigabe pro Person per E-Mail, für Freundesgruppen umständlich | Mittel: Vorbild für die Datenschutzstufe „nur frei/belegt“ | https://support.google.com/calendar/answer/37082 |
| **TimeTree** | Geteilte Kalender für Gruppen, mehrere Kalender filterbar | Gute Mehrkalender-Ansicht für Familien, Hobby- und Schulgruppen | Premium (4,49 USD/Monat) nennt „werbefrei“ als Vorteil, die Gratis-Version zeigt also vermutlich Werbung | Mittel: Kalender-zentriert statt Ideen-zentriert | https://timetreeapp.com/intl/en |
| **Howbout** | Sozialer Kalender: geteilte Kalender, Verfügbarkeit frei/belegt, Event-Chat, Zusage-Tracker, Erinnerungen | Synchronisiert Google, Outlook, Apple; Abstimmung über Termine mit Verfügbarkeit verknüpft; laut Blog kostenlos und werbefrei | Kalender-Sync als Kern setzt viel Datenfreigabe voraus; Ideen-Voting und Aufgaben nicht belegt | **Hoch**: direktester Konkurrent für Freundesgruppen | https://howbout.app/groups, https://howbout.app/blog/group-planning/how-to-find-a-date-that-works-for-everyone-/ |
| **Partiful** | Einladung per Link, Zusage ohne App, Event-Seite mit Kommentaren und Fotos, Erinnerungen | Einladen ohne Installationshürde; kostenlos erstellbar | Auf einzelne Partys mit Host fokussiert, nicht auf wiederkehrende demokratische Planung; Ticketverkauf | **Hoch** für Growth: Vorbild für den Einladungs-Link | https://partiful.com/ |
| **Apple Einladungen** | Event erstellen, Zusage, geteiltes Album und Playlist | Zusage auch ohne Apple-Konto über iCloud.com | Erstellen nur mit iCloud+-Abo; Playlist mit Apple Music; nur Apple-Ökosystem | Mittel: setzt den Standard „geteiltes Album zum Event“ | https://support.apple.com/guide/apple-invites/create-an-event-dev1d1c7cb6b/ios |
| **Spond** | Events, Einladungen, Anwesenheit, Nachrichten für Gruppen, Teams, Vereine | Kostenlos herunterladbar, App und Web | Auf Vereine und Teams mit Organisator ausgerichtet; Verfügbarkeitsabfrage laut Hilfe nur UK **(Suche)** | Niedrig bis mittel: zeigt das Muster „Verfügbarkeit abfragen, dann Termin“ | https://help.spond.com/en/articles/25730-what-is-spond, https://www.spond.com/availability-requests/ (Suche) |
| **Splitwise** (Nachbar) | Ausgaben in Gruppen teilen, Salden, Schulden vereinfachen | Klarer Einzweck, Offline-Modus | Keine Planung; Pro-Abo für werbefreie Nutzung | Niedrig: denkbarer späterer Anschluss („Kosten“) – Non-Goal | https://www.splitwise.com/ |

Weitere Annahmen ohne Quelle: Viele Gruppen nutzen zusätzlich geteilte Notizen oder Tabellen. Ob Doodle in der Gratis-Version Werbung zeigt, war nicht belegbar (Preisseite lieferte 404).

## 2. Muster im Markt

1. **Zusage ist Standard.** WhatsApp Events, Partiful, Apple Einladungen, Howbout und Spond haben sie. Mellon nicht (Discovery 1.4/4).
2. **Einladen per Link ohne Hürde.** Partiful und Apple Einladungen erlauben die Zusage ohne App bzw. ohne Konto. Mellon verlangt Code abtippen und Konto (Discovery 1.4/1).
3. **Termin per Abstimmung.** Doodle, WhatsApp-Umfragen und Howbout setzen darauf. Mellon lässt Admin oder Initiator allein wählen.
4. **Erinnerungen** bewirbt Partiful und Howbout. Mellon hat keine (Discovery 1.2).
5. **Monetarisierung über Werbung oder Abo** (TimeTree, Splitwise). Mellon ist kostenlos und werbefrei. Das ist ein echtes Unterscheidungsmerkmal, aber kein exklusives (Howbout gibt im Blog „kostenlos, werbefrei“ an).

## 3. Positionierung und Differenzierung

**Positionierung (Vorschlag):** *Mellon ist der ruhige Ort neben dem Gruppenchat, an dem aus Ideen gemeinsame Erlebnisse werden: abstimmen, planen, Termin finden, erinnern.*

| Merkmal | Mellon | Abgrenzung |
|---|---|---|
| Ideen zuerst | Vorschlag mit Upvote-Schwelle → Board | Kalender-Apps starten beim Termin, Chat-Umfragen verschwinden im Verlauf |
| Ganzer Lebenszyklus | Idee → Planung → Termin → Erinnerung (Album, Memory Cards, Wrapped) | Partiful und Apple Einladungen decken nur ein einzelnes Event ab |
| Kollektive Gamification | Gruppen-Momentum ohne Verfall, Badges ohne Rangliste | Kein Streak-Druck, keine Konkurrenz unter Freunden |
| Datenschutz als Produkt | Kein Tracking, kein Werbe-SDK, Kalender nur frei/belegt, E-Mail opt-in, EU-Recht | Gegen werbefinanzierte Gratismodelle. Nur behaupten, was belegt ist (Anforderungen §b) |
| Kostenlos ohne Abo | Keine Monetarisierung (PRD Non-Goal) | Gegen Premium-Stufen bei TimeTree und Splitwise |

**Zu schließende Lücken (Priorität aus Marktsicht):** 1. Einladungs-Link, 2. Zusage „Ich bin dabei“, 3. Erinnerungen (opt-in), 4. Termin-Abstimmung als Option neben der Admin-Wahl.

## 4. ASO-Hinweise (Vorschlag, Deutsch)

Regeln laut Apple: Name und Untertitel je höchstens 30 Zeichen, Keywords höchstens 100 Zeichen, Komma ohne Leerzeichen, keine Namen von Konkurrenz-Apps, keine Plural-Dopplungen, nicht das Wort „App“ (https://developer.apple.com/app-store/product-page/). Google Play: Titel höchstens 30 Zeichen, keine Emojis, keine Rang- oder Preisangaben („#1“, „gratis“-Aktionen), kein Keyword-Stuffing, keine anonymen Testimonials (https://support.google.com/googleplay/android-developer/answer/9898842).

| Feld | Vorschlag | Zeichen |
|---|---|---|
| App-Name (beide Stores) | Mellon – Pläne mit Freunden | 27 |
| Untertitel (Apple) | Abstimmen, planen, erinnern | 27 |
| Alternative Untertitel | Ideen abstimmen, Termin finden | 30 |
| Keywords (Apple) | `freunde,gruppe,planen,abstimmung,umfrage,terminfinder,ausflug,unternehmung,kalender,erinnerung` | 94 |
| Kurzbeschreibung (Google) | Ideen sammeln, gemeinsam abstimmen, Termin finden und Erinnerungen teilen. | 74 (Grenze 80 = Annahme, auf der Quellseite nicht genannt) |

Hinweise:
- Wörter aus Name und Untertitel nicht im Keyword-Feld wiederholen (Apple wertet sie bereits).
- „Kostenlos, ohne Werbung, ohne Tracking“ gehört in die Beschreibung, nicht in den Titel. Nur zusagen, was die Datenschutz-Angaben im Store (App Privacy / Data safety) decken.
- Screenshots: Kernloop in 5 Bildern (Idee → Abstimmen → Board → Termin → Erinnerung), mit Demodaten ohne echte Namen.
- **Annahme, prüfen:** Ob der Name „Mellon“ in den Stores schon belegt ist und ob Markenrechte bestehen. Keine Recherche dazu in dieser Phase.

## 5. Growth über Einladungs-Link (ohne Dark Patterns)

Ziel: Neue Mitglieder kommen mit einem Tippen in die Gruppe. Wachstum entsteht nur durch echten Nutzen für die Gruppe, nicht durch Druck.

**Erlaubt und empfohlen**
1. „Freunde einladen“ öffnet das native Teilen-Menü mit Link und kurzem, neutralem Text, den die Person vor dem Senden sieht und ändern kann.
2. Link-Vorschau vor dem Beitritt zeigt nur Gruppenname und „Du wurdest eingeladen“, keine Mitgliederliste (Datensparsamkeit, siehe Anforderungen §a).
3. Nach Login/Registrierung landet die Person direkt in der Gruppe (kein erneutes Eintippen, WCAG 3.3.7).
4. QR-Code für das Treffen vor Ort als Alternative zum Link.
5. Leerer Zustand in einer neuen Gruppe schlägt einmal „Lade deine Leute ein“ vor, ohne Wiederholung bei jedem Öffnen.
6. Teilen von Wrapped und Memory Cards bleibt freiwillig; ein kleines Wortlogo ist in Ordnung, ein Pflicht-Werbebanner nicht.

**Ausgeschlossen (Dark Patterns)**
- Kein Upload oder Abgleich des Adressbuchs, keine automatischen SMS/E-Mails an Kontakte.
- Keine Belohnung oder Freischaltung für Einladungen („lade 3 Freunde ein, um …“), keine Ranglisten der Einladenden.
- Keine künstliche Dringlichkeit („Link läuft in 10 Min. ab!“) außer der echten Ablaufzeit in neutraler Sprache.
- Keine vorausgewählten Einwilligungen (E-Mail, Push) im Beitritts-Flow.
- Kein Zwang zur App-Installation, bevor man sieht, wohin der Link führt.
- Keine Erinnerungs-Push an Personen, die noch kein Mitglied sind.

**Messung ohne Tracking (Annahme, mit Technik klären):** nur aggregierte, serverseitige Zähler pro Gruppe (z. B. „Beitritte über Link“), keine geräte- oder personenbezogenen Analytics, keine Attribution-SDKs.

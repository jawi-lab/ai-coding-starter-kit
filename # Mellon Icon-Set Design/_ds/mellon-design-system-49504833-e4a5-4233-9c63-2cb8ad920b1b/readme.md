# Mellon Design System

**Mellon** ist eine Freundes-Planungs-App (iOS, Android, Web): Freundesgruppen schlagen Aktivitäten vor, stimmen demokratisch ab, planen über ein Kanban-Board, finden Termine per Kalender-Sync — und archivieren die schönsten Momente als Erinnerungen im Profil. Mellon löst das "im Gruppenchat versanden"-Problem: Ideen gehen nicht mehr verloren, weil sich niemand verantwortlich fühlt.

Dieses Design System ist das **Redesign** (v2): freundlich und trotzdem clean, inspiriert von Hinges editorialem Look (warme Off-White-Flächen, große Serif-Statements, fotozentrierte Karten, ruhiges UI-Chrome) — **ohne Lila**. Stattdessen: die Mellon-Markenfarben Waldgrün, Honiggold und Blush auf Creme. Auf iOS werden schwebende Chrome-Elemente (Tab-Bar, FAB, Header) als **Liquid Glass** ausgeführt. Alles ist großzügig abgerundet; alles mit Bildern wirkt hochwertig (großer Radius, Schutzverlauf, kein Rahmen). Pixelart-Gamification-Elemente sind für später geplant (noch nicht Teil dieses Systems).

## Quellen

- **Codebase** (read-only mount): `ai-coding-starter-kit/` — Next.js 16 + Capacitor (iOS/Android) + Supabase. Enthält das *alte* Design ("ZUSAMMEN", Archivo/Terracotta — von diesem Redesign bewusst abgelöst), `docs/PRD.md`, `docs/UI-INVENTORY.md` (Screen-Inventar), `STYLEGUIDE.md` (alte Tokens + **Komponenten-Inventar**, das dieses System 1:1 neu einkleidet), `Konzept_Freundes-Planungs-App.md`, `features/PROJ-*.md`.
- **Hinge-Referenz-Screenshots**: `uploads/1.–8. Hinge *.jpg/png` (Ästhetik-Referenz; nichts davon wird nachgebaut).
- **Mellon-Logos**: `uploads/` + `ai-coding-starter-kit/assets/` → kopiert nach `assets/`.

## Produkte

1. **Mellon App** (iOS/Android, mobile-first) — Gruppen, Vorschläge + Voting, Kanban-Planung, Aktivitäts-Detail, Termine, Profil/Archiv.
2. **Mellon Web** (Desktop, responsive) — gleiche App mit Sidebar statt Tab-Bar.
3. **Marketing-Landingpage** (`marketing/mellon-landing.html` im Mount, noch altes Design).

## CONTENT FUNDAMENTALS

- **Sprache:** Durchgängig Deutsch, konsequent **Du-Form** ("Verbinde deinen Kalender", "dein Archiv").
- **Ton:** Freundlich-direkt, aktivierend, nie bürokratisch. Empty States motivieren mit Imperativ + Ausrufezeichen: *"Noch keine Erinnerungsfotos – lad das erste hoch!"*, *"Noch keine Kommentare – schreib den ersten!"*
- **Casing:** Satzcase überall. Keine SHOUTY-Caps in Fließtext; Overlines dezent (nur leichtes Tracking, 12px/600).
- **Platzhalter zeigen Beispiele:** *"z. B. Schulfreunde, WG-Crew…"*, *"z. B. Klettern im Kletterzentrum"*, *"Optional – z.B. Biergarten Englischer Garten"*.
- **Serif = Inhalt der Nutzer:innen, Sans = Interface.** Aktivitätsnamen, Erinnerungs-Zitate und große Statements stehen in der Display-Serif ("Silvester am Meer in Dänemark."); Labels, Buttons, Meta in der Sans.
- **Emoji:** Nicht Teil der UI-Sprache (kein Emoji in Buttons/Labels). Nutzergenerierter Inhalt darf natürlich Emoji enthalten.
- **Zahlenformate:** "3/5" für Vote-Fortschritt, "12.–14. Sep" für Zeiträume.

## VISUAL FOUNDATIONS

- **Canvas:** Warmes Off-White `--bg #FBF8F3` statt reinem Weiß; Karten sind reines Weiß und heben sich nur minimal ab. Kein reines `#000` — warmes Schwarz `#221E19`.
- **Farbe:** Grün `#1E4634` ist die einzige Aktionsfarbe (CTAs, aktive Zustände). Gold = Akzent/Highlight/Fokusring, Blush = Wärme (Erinnerungen, Archiv). Semantik: Success-Grün, Gold-Warnung, warmes Rot für Fehler. Farbe sparsam — der Look lebt von Creme, Weiß und Fotos.
- **Typo:** Hanken Grotesk (UI) + Source Serif 4 (Display) — **Substitute**, siehe unten. Chrome klein und neutral, Inhalte groß und serifig.
- **Radii:** Großzügig — 10/16/22/30/pill. Karten 22px, Sheets & Fotos 30px, Buttons & Chips Pill.
- **Borders:** Hairlines `1px --line` für Trenner; Inputs `1.5px --line-strong`; interaktive Elemente lieber Fläche + Schatten als Rahmen.
- **Schatten:** Weich, warm, niedrig (`--shadow-sm/md/lg`); schwebende runde Buttons `--shadow-float`. Nie harte Kanten.
- **Fotos:** Immer randlos in 30px-Radius-Containern, `--photo-protect`-Verlauf für Text auf Bild, kein Border. Fallback ohne Foto: Marken-Cover-Gradients (`--cover-green/gold/blush/ink`).
- **Liquid Glass (iOS):** Schwebende Tab-Bar, FAB und Über-Foto-Chrome nutzen `--glass-fill` + `backdrop-filter: var(--glass-blur)` + `--glass-stroke`-Innenlinie. Auf Fotos die dunkle Variante `--glass-fill-dark`. Web/Android: gleiche Optik, statisch erlaubt.
- **Hintergründe:** Flächig Creme; keine Muster, keine lauten Verläufe. Dunkelgrüne Invert-Blöcke (`--surface-ink`) für Hero-/Feiermomente.
- **Animation:** Ruhig und entschieden — `--ease-out` 140–240ms für Hover/Fades; `--ease-spring` 420ms für Sheets und Vote-/Herz-Feedback. Keine Endlos-Loops.
- **Hover:** Flächen dunkeln minimal ab (`--cream-200` auf Creme, `--primary-hover` auf Grün). **Press:** `scale(0.97)`.
- **Fokus:** 3px Gold-Ring (`--focus-ring`), 2px Offset.
- **Bildsprache:** Warm, natürlich, echte Momente (Lachen, draußen, Essen) — nie Stock-steril. Illustration: die Mellon-Strichfiguren (Creme/Grün/Gold/Rosa) für Empty States und Onboarding.
- **Layout:** Mobile-first, 20px-Gutter, Tab-Bar schwebt unten (Safe-Area beachten), Sheets slide von unten mit 30px-Top-Radius und Grabber.

## ICONOGRAPHY

- Die Codebase nutzt **lucide-react** (shadcn/ui-Stack) — dünne 2px-Stroke-Linienicons, passend zum cleanen Look. Dieses System lädt Lucide per CDN (`https://unpkg.com/lucide@latest`); in Produktion weiter `lucide-react` verwenden. Stroke 2px, Größe 20–24px, Farbe `currentColor`.
- Kein Icon-Font, keine Emoji als Icons, keine Unicode-Zeichen als Icons.
- **Logos** (in `assets/`): `mellon-logo-clean.png` (schwarze Bubble-Wortmarke), `mellon-logo-startseite.png` (Wortmarke + Gruppen-Illustration), `mellon-app-icon.png` ("ZSMN"-Icon auf Creme, alt), `mellon-logo.png`, `mellon-logo-login.png`. Die Wortmarke ist gezeichnet — **nie in Type nachsetzen**; wo kein Logo-Asset passt, "Mellon" in Sans 800 schreiben.
- Hinge-Logo-Dateien in `uploads/` sind nur Referenz — **nie in Mellon-Designs verwenden**.

## Font-Substitution (bitte prüfen!)

Hinges Originalschriften (Modern Era, Tiempos Headline) sind proprietär. Ersetzt durch die nächsten Google-Fonts-Matches:
- **UI Sans:** Hanken Grotesk (400/500/600/700/800)
- **Display Serif:** Source Serif 4 (400/500/600)

→ Wenn ihr lizenzierte Brand-Fonts habt, `tokens/fonts.css` austauschen.

## Index

- `styles.css` — Einstiegspunkt (nur `@import`s) → `tokens/{fonts,colors,typography,spacing,effects}.css`
- `guidelines/` — Specimen-Karten (Farben, Typo, Radii, Schatten, Glass, Motion, Brand)
- `assets/` — Mellon-Logos & Illustration
- `components/forms/` — Button, CalendarExportButton, Input, Checkbox, Switch, SegmentedControl, Stepper, Chip
- `components/display/` — Card, Badge, Avatar (+ AvatarStack), DateRangePill, VoteCard, KanbanCard
- `components/navigation/` — TabBar (Liquid Glass), Sidebar (Desktop)
- `ui_kits/mellon-app/` — Mobile-App-Screens (interaktiv): Gruppen, Vorschläge, Planung, Detail, Profil
- `ui_kits/mellon-web/` — Desktop-Ansicht mit Sidebar
- `SKILL.md` — Agent-Skill-Einstieg

**Komponenten-Inventar** = `STYLEGUIDE.md` §7 der Codebase (Button, Input, Checkbox, Segmented, Stepper, Card, Chip, Badge, Avatar, Switch, Vote-Card, Kanban-Card, Daterange-Pill, Kalender-Export-Button, Bottom-Tab-Bar, Sidebar) — vollständig neu eingekleidet, nichts erfunden. **Intentional additions:** keine.

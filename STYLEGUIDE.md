# Mellon – Design System / Style Guide (v2)

Referenz für Claude Code. Stack: Next.js 16 + TypeScript, Tailwind CSS, shadcn/ui.
Mobile-First, responsive Desktop-Erweiterung (Sidebar). Light + Dark Mode.

**Quelle der Wahrheit:** Claude-Design-Projekt „Mellon Design System"
(`https://claude.ai/design/p/49504833-e4a5-4233-9c63-2cb8ad920b1b`) — Tokens, Komponenten,
UI-Kits (mellon-app / mellon-web). Dieses Dokument spiegelt den implementierten Stand.
Das v1-Design („ZUSAMMEN", Archivo/Terracotta/Navy) ist vollständig abgelöst.

---

## 1. Design-Prinzipien

- **Freundlich und trotzdem clean**, inspiriert von Hinges editorialem Look: warme
  Off-White-Flächen, große Serif-Statements, fotozentrierte Karten, ruhiges UI-Chrome.
- **Zwei Stimmen:** Sans (Hanken Grotesk) für Interface-Chrome — klein und neutral.
  Serif (Source Serif 4) für Inhalte der Nutzer:innen — Aktivitätsnamen, Gruppennamen,
  Erinnerungs-Zitate, große Statements.
- **Grün ist die einzige Aktionsfarbe.** Gold = Akzent/Hinweis/Fokusring, Blush = Wärme
  (Erinnerungen, Archiv, „Zu Planen"). Farbe sparsam — der Look lebt von Creme, Weiß und Fotos.
- **Satzcase überall.** Keine SHOUTY-Caps; Overlines dezent (12px/600, Tracking 0.06em).
  Ausnahme: Einladungscodes (funktional uppercase).
- Großzügige Radien (10/16/22/30/pill), weiche warme Schatten, nie harte Kanten.
- Schwebendes Chrome (Tab-Bar, FAB) als **Liquid Glass** (`.glass`-Utility).
- Dark Mode: warmes Schwarz (kein reines `#000`), aufgehellte Grün-/Goldtöne, kein Neon.

---

## 2. Farben (Tokens)

### Light (Raw-Tokens in `globals.css`)

| Token | Hex | Verwendung |
|---|---|---|
| `--bg` | `#FBF8F3` | App-Hintergrund (Cream 50) |
| `--cream-100` | `#F6F0E6` | Vertiefte Flächen, Segmented-Tracks (= `--surface-2`) |
| `--cream-200` | `#EDE4D4` | Pressed/Hover auf Creme |
| `--surface` | `#FFFFFF` | Karten, Sheets, Inputs |
| `--surface-ink` | `#173829` | Invertierte Hero-/Feier-Blöcke |
| `--ink` | `#221E19` | Primärtext (warmes Schwarz) |
| `--ink-2` | `#575046` | Sekundärtext |
| `--ink-3` | `#8E8578` | Tertiär/Placeholder |
| `--line` | `#E9E1D3` | Hairline-Borders, Divider |
| `--line-strong` | `#D8CDBA` | Input-Borders (1.5px) |
| `primary` | `#1E4634` | Waldgrün — CTAs, aktive Zustände (shadcn-HSL) |
| `--primary-soft` | `#DFE9DF` | Grün-Tint |
| `secondary` | `#C08A2E` | Honiggold (deep) — Akzente, Warnungen, Rolle Redakteur |
| `--accent-soft` / `--secondary-soft` | `#F5E7CB` | Gold-Tint |
| `--blush` | `#DC9C88` | Blush — Erinnerungen, Rolle Beobachter, „Zu Planen" |
| `--blush-soft` | `#F7E7DF` | Blush-Tint |
| `--success` | `#2E7D51` | Erfolg (+ `--success-soft #DEEDE2`) |
| `--error` | `#BF3A2B` | Fehler/Destruktiv (+ `--error-soft #F6DFD9`) |
| `ring` | Gold `#D9A24B` | 3px Gold-Fokusring |

shadcn-`accent` = Creme-Hover-Fläche (Dropdowns/Menüs), **nicht** Gold.

### Cover-Gradients (Foto-Fallbacks) & Status-Dots

```css
--cover-green / --cover-gold / --cover-blush / --cover-ink   /* bg-cover-green etc. */
--status-zu-planen: Blush · --status-in-planung: Gold ·
--status-abgestimmt: Grün 600 · --status-abgeschlossen: Success
--photo-protect: Schutzverlauf für Text auf Fotos (bg-photo-protect)
```

### Dark (abgeleitet, warm)

`--bg #14110D`, `--surface #201C17`, `--surface-2 #2B2620`, `--ink #F1EDE5`,
`--line #37312A`, Primary aufgehellt `#468B67`, Gold `#D9A24B/#E0AC58`, Soft-Tints als
`rgba(...,.18)`. Glass-Tokens dunkel. Schatten stärker (schwarzbasiert).

---

## 3. Typografie

**Hanken Grotesk** (UI, 400/500/600/700/800) + **Source Serif 4** (Display, 400/500/600),
beide via `next/font` in `layout.tsx` (`--font-hanken`, `--font-source-serif`).
Tailwind: `font-sans` (Default) / `font-serif`.

| Style | Font | Größe/Weight | Einsatz |
|---|---|---|---|
| Display XL | Serif 500 | 38px / 1.15, Tracking −0.015em | Hero-Statements |
| Display | Serif 500 | 28px / 1.2 | Große Titel |
| Display S | Serif 500 | 22px / 1.3 | Aktivitätsnamen (Detail-Hero) |
| Card-Titel | Serif 500 | 16–17px | Aktivitäts-/Gruppennamen in Karten |
| Screen-Titel | Sans 700 | 22–24px | „Meine Gruppen" etc. |
| Heading | Sans 700 | 17px | Karten-Header |
| Body | Sans 400 | 15.5px / 1.55 | Standard |
| Label/Button | Sans 600 | 15.5px, Tracking 0.005em | Interaktiv |
| Caption | Sans 500 | 13px | Meta |
| Overline | Sans 600 | 12px, Tracking 0.06em, Satzcase | Sektions-Labels |

**Regel:** Serif = Inhalt der Nutzer:innen, Sans = Interface.

---

## 4. Spacing, Radien, Schatten, Motion

- **Spacing:** 8pt-Raster mit 4px-Halbschritt; mobiler Gutter 20px; Tap-Ziel ≥ 44px.
- **Radien (Tailwind):** `sm` 10px (Thumbs, kleine Flächen) · `md` 16px (Inputs, Rows)
  · `lg` 22px (Karten, Listen) · `xl`/`2xl` 30px (Sheets, Fotos, Modals) · `pill` (Buttons, Chips, Avatare).
- **Schatten:** `--shadow-sm/md/lg` warm und niedrig; `--shadow-float` (`shadow-float`)
  für schwebende runde Buttons (FAB, Herz-Vote).
- **Liquid Glass:** `.glass` / `.glass-strong` / `.glass-dark` Utilities
  (`--glass-fill`, `--glass-blur`, `--glass-stroke`, `--glass-shadow`). Tab-Bar, FAB, Über-Foto-Chrome.
- **Motion:** `--ease-out` 140–240ms (Hover/Fades), `--ease-spring` 420ms (Sheets, Votes).
  Press: `scale(0.97)` (im Button eingebaut). Keine Endlos-Loops.
- **Fotos:** randlos in 30px-Containern, `--photo-protect`-Verlauf, kein Border;
  Fallback = Cover-Gradients.

---

## 5. Komponenten (implementierter Stand)

### Button (`components/ui/button.tsx`)
- **Pill-Radius**, Font 600, Press-Scale 0.97, Fokus 3px Gold-Ring, Disabled `opacity-40`.
- `default`: Grün gefüllt, Hover `primary/90`. `outline`: Weiß + 1.5px `line-strong`, Hover `surface-2`.
- `secondary`: `surface-2`, Hover `cream-200`. `ghost`: transparent, `text-primary`, Hover `primary-soft`.
- `destructive`: Rot gefüllt. Größen: sm h-9 / default h-11 / lg h-12 / icon 10×10.

### Input / Textarea
- `rounded-md` (16px), Border 1.5px `line-strong`, h-12, Placeholder `ink-3`.
- Fokus: Border `primary` + `0 0 0 3px var(--primary-soft)`. Error analog mit `error`.

### Card — `rounded-lg` (22px), Border `line`, `shadow-sm`; Titel Sans 17/700.
### Badge — Pill; `default` grün-soft, `secondary` gold-soft, `destructive` rot-soft, `outline` Border `line`.
### Tabs (Segmented) — Track `surface-2` als Pill, aktives Segment weiß + `shadow-sm`.
### Dialog/Sheet/ResponsiveModal — 30px-Radius (Bottom-Sheets `rounded-t-[30px]`), Overlay warm getönt + Blur.
### Switch — Track `pill`, On = `primary`.

### Vote-/Proposal-Card
- Cover-Thumb links, **Serif-Titel**, Gold-Kategorie-Chip, grüner Fortschrittsbalken „X/Y",
  Herz-Button rund mit `shadow-float`: unvoted weiß/Blush-Herz, voted grün/weiß.

### Kanban-Card
- Cover-Strip oben, **Serif-Titel**, Initiator, Datums-Pill (`primary-soft`/`primary`).
- Spalten-Header: Status-Dot (Blush/Gold/Grün/Success) + Label + Count.

### Rollen-Farben
`admin` → Grün (`primary-soft`/`primary`) · `editor` → Gold (`accent-soft`/`secondary`)
· `observer` → Blush (`blush-soft`/`blush`).

### Bottom-Tab-Bar (Mobile, `GroupBottomNav`)
- Schwebende **Liquid-Glass-Pill** (`.glass`, `rounded-pill`, 64px) mit Safe-Area-Abstand.
- 5 Items: Home · Vorschläge · Board · Termine · Profil. Aktiv `primary`.

### Sidebar (Desktop, `DesktopSidebar`)
- 248px, `surface`, Border-right `line`. Mellon-Wortmarke oben (`/logo-wordmark.png`,
  im Dark Mode invertiert), Gruppen-Kontext, Nav (aktiv `primary-soft`/`primary`),
  User-Card unten (öffnet Profil-Sheet). Ersetzt die früheren Desktop-Top-Tabs.

### FAB — 56px rund, `primary`, `shadow-float`, unten rechts (mobil über der Tab-Bar).

---

## 6. Board-Status-Mapping (Datenmodell)

| DB-Status | Label | Dot/Chip |
|---|---|---|
| `zu_planen` | Zu Planen | Blush |
| `in_planung` | In Planung | Gold |
| `planung_abgeschlossen` | Planung abgeschlossen | Grün/Success |
| `abgeschlossen` | Abgeschlossen | Success |

---

## 7. Plattform-Hinweise

- **iOS/Android:** Safe-Areas (`pt-safe`, `pb-safe`, `h-bar-safe`); Tab-Bar schwebt über dem
  Home-Indicator. App-Name überall **Mellon** (Bundle-ID bleibt `com.zusammen.app` —
  Signing/Deep-Links).
- **Web/Desktop:** Sidebar statt Tab-Bar; Board zeigt alle 4 Spalten.
- Dark Mode über `.dark`-Klasse am `<html>` (Storage-Key `mellon-theme`,
  Legacy-Fallback `zusammen-theme`).

---

## 8. Do / Don't

- **Do:** Grün nur für Aktionen. Serif für Nutzer-Inhalte, Sans fürs Chrome. Warme
  Neutraltöne, Fotos randlos mit Schutzverlauf, Empty States motivierend im Imperativ.
- **Don't:** Reines `#000`/`#FFF`, Uppercase-Labels, Neon im Dark Mode, Emoji als Icons
  (lucide-react verwenden), die Wortmarke in Type nachsetzen (Logo-Asset nutzen),
  mehr als die zwei Schriftfamilien.

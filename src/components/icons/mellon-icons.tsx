import type { SVGProps } from 'react'

/**
 * Mellon Icon-Set (Claude Design „Mellon Icons – Level-Serien", Entwurf 1).
 *
 * Alle Stroke-Icons: viewBox 0 0 24 24 · fill none · stroke currentColor ·
 * Stroke 2 · round/round — Größe via className (analog lucide-react).
 * Ausnahme Medaillen: flache Metall-Fills (feste Farben, kein currentColor).
 */

type IconProps = SVGProps<SVGSVGElement>

function StrokeIcon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* A1 · Momentum-Master — Signet für Schwung & Aufwärtstrend           */
/* ------------------------------------------------------------------ */

export function MomentumIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M4.5 17.5c4.4-1 7.8-3.7 10-8.2" />
      <path d="M10.8 9.9l3.7-.6.6 3.7" />
      <path d="M18 3.5v4" />
      <path d="M16 5.5h4" />
    </StrokeIcon>
  )
}

/* ------------------------------------------------------------------ */
/* A2 · Wachstums-Serie — die 4 Momentum-Level                         */
/* Serienlogik: gleiche geschwungene Bodenlinie, alles wächst aus      */
/* demselben Punkt — Keimling → Sonnenblume → junger Baum → Krone.     */
/* ------------------------------------------------------------------ */

/** Level 1 · Keimling (Neue Gruppe) */
export function LevelKeimlingIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20.1c2.3-.8 4.6-1.2 7-1.2s4.7.4 7 1.2" />
      <path d="M12 18.9v-4.9" />
      <path d="M12 14c-.2-2.9-2.2-4.7-5.6-5.1.2 2.9 2.2 4.7 5.6 5.1z" />
      <path d="M12 14c.2-2.3 1.8-3.7 4.5-4-.2 2.3-1.8 3.7-4.5 4z" />
    </StrokeIcon>
  )
}

/** Level 2 · Sonnenblume (Gruppe) */
export function LevelSonnenblumeIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20.1c2.3-.8 4.6-1.2 7-1.2s4.7.4 7 1.2" />
      <path d="M12 18.9V9.7" />
      <circle cx="12" cy="7.8" r="1.9" />
      <path d="M12 4.5V2.8" />
      <path d="M14.3 5.5l1.2-1.2" />
      <path d="M15.3 7.8H17" />
      <path d="M14.3 10.1l1.2 1.2" />
      <path d="M9.7 10.1l-1.2 1.2" />
      <path d="M8.7 7.8H7" />
      <path d="M9.7 5.5L8.5 4.3" />
      <path d="M12 16.4c-.2-1.7-1.3-2.7-3.2-3 .2 1.7 1.3 2.7 3.2 3z" />
    </StrokeIcon>
  )
}

/** Level 3 · Junger Baum (Eingespielte Gruppe) */
export function LevelJungerBaumIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20.1c2.3-.8 4.6-1.2 7-1.2s4.7.4 7 1.2" />
      <path d="M12 18.9V5.2" />
      <path d="M12 5.2c.2-1.6 1.2-2.5 3-2.8-.2 1.6-1.2 2.5-3 2.8z" />
      <path d="M12 12.6L9.6 10.4" />
      <path d="M9.6 10.4c-.2-1.6-1.2-2.5-3-2.8.2 1.6 1.2 2.5 3 2.8z" />
      <path d="M12 15.2L14.6 12.9" />
      <path d="M14.6 12.9c.2-1.6 1.2-2.5 3-2.8-.2 1.6-1.2 2.5-3 2.8z" />
    </StrokeIcon>
  )
}

/** Level 4 · Großer Baum (Legendäre Gruppe) */
export function LevelGrosserBaumIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M5 20.1c2.3-.8 4.6-1.2 7-1.2s4.7.4 7 1.2" />
      <path d="M12 18.9v-4.2" />
      <path d="M15.9 14.7H9.8a5 5 0 1 1 4.8-6.5h1.3a3.25 3.25 0 1 1 0 6.5z" />
    </StrokeIcon>
  )
}

/** Wachstums-Icon je Momentum-Level (1–4). Unbekannte Level → Keimling. */
export const MOMENTUM_LEVEL_ICONS: Record<number, (props: IconProps) => React.JSX.Element> = {
  1: LevelKeimlingIcon,
  2: LevelSonnenblumeIcon,
  3: LevelJungerBaumIcon,
  4: LevelGrosserBaumIcon,
}

export function MomentumLevelIcon({ level, ...props }: IconProps & { level: number }) {
  const Icon = MOMENTUM_LEVEL_ICONS[level] ?? LevelKeimlingIcon
  return <Icon {...props} />
}

/* ------------------------------------------------------------------ */
/* A3 · Medaillen-Serie — gleiche Grundform, Metallton + Sterne = Rang */
/* Flache Metalltöne statt Verlauf, keine IDs im SVG.                  */
/* ------------------------------------------------------------------ */

export type MedalRank = 'bronze' | 'silber' | 'gold' | 'platin'

const STAR_PATH =
  'M0 -3 L0.88 -1.21 2.85 -0.93 1.43 0.46 1.76 2.43 0 1.5 -1.76 2.43 -1.43 0.46 -2.85 -0.93 -0.88 -1.21 Z'

interface MedalSpec {
  /** Dunkler Ton (linkes Band, Sterne, Innenring). */
  dark: string
  /** Mittlerer Ton (rechtes Band, Scheiben-Kontur). */
  mid: string
  /** Heller Ton (Medaillen-Scheibe). */
  face: string
  /** Stern-Positionen (transform-Attribute) — Anzahl = Rang 1–4. */
  stars: string[]
}

const MEDALS: Record<MedalRank, MedalSpec> = {
  bronze: {
    dark: '#7E4F26',
    mid: '#A96F3E',
    face: '#C08552',
    stars: ['translate(12 14.7)'],
  },
  silber: {
    dark: '#78838E',
    mid: '#A9B2BB',
    face: '#CDD3D9',
    stars: ['translate(9.85 14.7) scale(0.72)', 'translate(14.15 14.7) scale(0.72)'],
  },
  gold: {
    dark: '#91621A',
    mid: '#C08A2E',
    face: '#DFA94E',
    stars: [
      'translate(12 12.8) scale(0.62)',
      'translate(9.85 16) scale(0.62)',
      'translate(14.15 16) scale(0.62)',
    ],
  },
  platin: {
    dark: '#0C3C31',
    mid: '#3E7A64',
    face: '#A9C6B8',
    stars: [
      'translate(12 12.4) scale(0.56)',
      'translate(9.7 14.7) scale(0.56)',
      'translate(14.3 14.7) scale(0.56)',
      'translate(12 17) scale(0.56)',
    ],
  },
}

export function MedalIcon({ rank, ...props }: IconProps & { rank: MedalRank }) {
  const m = MEDALS[rank]
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M7.2 2.7h3.5l2.7 7.5-3.9 1.2z"
        fill={m.dark}
        stroke={m.dark}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M16.8 2.7h-3.5l-2.7 7.5 3.9 1.2z"
        fill={m.mid}
        stroke={m.mid}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="14.6" r="6.2" fill={m.face} stroke={m.mid} strokeWidth="1" />
      <circle cx="12" cy="14.6" r="4.7" stroke={m.dark} strokeWidth="1" opacity=".45" />
      {m.stars.map((transform) => (
        <path key={transform} transform={transform} d={STAR_PATH} fill={m.dark} />
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/* A4 · Rollen-Badge-Serie (PROJ-16) — ersetzt die Emoji-Icons.        */
/* Gleicher Stroke-Stil wie das restliche Set, currentColor.           */
/* ------------------------------------------------------------------ */

export type BadgeRole = 'ideengeber' | 'entscheider' | 'planer' | 'immer_dabei'

/** Ideengeber · Glühbirne */
export function BadgeIdeengeberIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M15 14.2c.2-1 .7-1.8 1.5-2.6 1-.9 1.6-2.2 1.6-3.5a6.1 6.1 0 0 0-12.2 0c0 1.3.6 2.6 1.6 3.5.8.8 1.3 1.6 1.5 2.6" />
      <path d="M9.4 17.6h5.2" />
      <path d="M10.4 20.6h3.2" />
    </StrokeIcon>
  )
}

/** Entscheider · Blitz */
export function BadgeEntscheiderIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M13.2 2.8L5.6 13.1h5.2l-1.4 8.1 7.6-10.3h-5.2z" />
    </StrokeIcon>
  )
}

/** Planer · Kalender mit Häkchen */
export function BadgePlanerIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M17 5.5H7A3.5 3.5 0 0 0 3.5 9v7A3.5 3.5 0 0 0 7 19.5h10a3.5 3.5 0 0 0 3.5-3.5V9A3.5 3.5 0 0 0 17 5.5z" />
      <path d="M8.5 3.5v3.5" />
      <path d="M15.5 3.5v3.5" />
      <path d="M3.5 10.5h17" />
      <path d="M9.3 15l1.9 1.9 3.5-3.7" />
    </StrokeIcon>
  )
}

/** Immer dabei · Check im Kreis */
export function BadgeImmerDabeiIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.4 12.3l2.5 2.5 4.7-5" />
    </StrokeIcon>
  )
}

const BADGE_ROLE_ICONS: Record<BadgeRole, (props: IconProps) => React.JSX.Element> = {
  ideengeber: BadgeIdeengeberIcon,
  entscheider: BadgeEntscheiderIcon,
  planer: BadgePlanerIcon,
  immer_dabei: BadgeImmerDabeiIcon,
}

export function BadgeRoleIcon({ badge, ...props }: IconProps & { badge: BadgeRole }) {
  const Icon = BADGE_ROLE_ICONS[badge]
  return <Icon {...props} />
}

/* ------------------------------------------------------------------ */
/* B · Empty-State-Familie — gedämpft, currentColor, ~28 px            */
/* ------------------------------------------------------------------ */

/** Idee / Vorschlag — „Noch keine Vorschläge" */
export function EmptyIdeaIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M15 14.2c.2-1 .7-1.8 1.5-2.6 1-.9 1.6-2.2 1.6-3.5a6.1 6.1 0 0 0-12.2 0c0 1.3.6 2.6 1.6 3.5.8.8 1.3 1.6 1.5 2.6" />
      <path d="M9.4 17.6h5.2" />
      <path d="M10.4 20.6h3.2" />
    </StrokeIcon>
  )
}

/** Suche / Filter — „Keine Treffer" */
export function EmptySearchIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <circle cx="10.8" cy="10.8" r="6" />
      <path d="M15.1 15.1l4.4 4.4" />
      <path d="M7.6 9.6a3.8 3.8 0 0 1 2.6-2.1" />
    </StrokeIcon>
  )
}

/** Kalender / Termine — „Noch keine Termine" */
export function EmptyCalendarIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M17 5.5H7A3.5 3.5 0 0 0 3.5 9v7A3.5 3.5 0 0 0 7 19.5h10a3.5 3.5 0 0 0 3.5-3.5V9A3.5 3.5 0 0 0 17 5.5z" />
      <path d="M8.5 3.5v3.5" />
      <path d="M15.5 3.5v3.5" />
      <path d="M3.5 10.5h17" />
      <path d="M8.5 14.5h.01" />
      <path d="M12 14.5h.01" />
      <path d="M15.5 14.5h.01" />
    </StrokeIcon>
  )
}

/** Nicht gefunden (Ortsmarke) — „Gruppe nicht gefunden" */
export function EmptyNotFoundIcon(props: IconProps) {
  return (
    <StrokeIcon {...props}>
      <path d="M12 21c-4.2-3.4-6.3-6.5-6.3-9.4a6.3 6.3 0 1 1 12.6 0c0 2.9-2.1 6-6.3 9.4z" />
      <circle cx="12" cy="11.4" r="2.2" />
    </StrokeIcon>
  )
}

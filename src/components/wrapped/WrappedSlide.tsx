'use client'

import { CalendarHeart, Heart, Sparkles, TrendingUp, PartyPopper, Lightbulb, Vote } from 'lucide-react'
import { getInitials } from '@/lib/avatar'
import { monthNameDe, type WrappedSlide as Slide, type ShoutoutPerson } from '@/lib/wrapped'

/**
 * Eine einzelne Rückblick-Slide (PROJ-18) — dasselbe Design für Anzeige und
 * Bild-Export (Technical Decision: ein Design statt doppelter Canvas-Pflege).
 *
 * Farben sind bewusst hart kodiert (nicht die App-Theme-Tokens): die Slides sind
 * ein immersiver, eigenständiger Look, der in Light/Dark und im geteilten PNG
 * identisch aussehen soll — genauso wie die PROJ-15-Feier und der PROJ-17-Reveal.
 * Nutzer-Inhalte (Zahlen, Namen, Gruppenname) stehen in der Display-Serif, das
 * Chrome (Labels) in der Sans (Styleguide „zwei Stimmen").
 */

/** Warme Mellon-Paletten je Slide — Wechsel schafft den Wrapped-Rhythmus. */
interface Theme {
  bg: string
  fg: string
  /** Gedämpfte Vordergrundfarbe für Sub-Text. */
  fgMuted: string
  /** Akzentfarbe für Overlines, Icons, Medaillons. */
  accent: string
  /** Textfarbe auf dem Akzent-Medaillon. */
  onAccent: string
}

const CREAM: Theme = { bg: '#FBF8F3', fg: '#221E19', fgMuted: 'rgba(34,30,25,0.62)', accent: '#1E4634', onAccent: '#FBF8F3' }
const GREEN: Theme = { bg: '#173829', fg: '#FBF8F3', fgMuted: 'rgba(251,248,243,0.72)', accent: '#D9A24B', onAccent: '#173829' }
const GOLD: Theme = { bg: '#B77F27', fg: '#FBF8F3', fgMuted: 'rgba(251,248,243,0.82)', accent: '#FBF8F3', onAccent: '#B77F27' }
const BLUSH: Theme = { bg: '#DC9C88', fg: '#3A2118', fgMuted: 'rgba(58,33,24,0.66)', accent: '#3A2118', onAccent: '#F7E7DF' }

const THEME_BY_TYPE: Record<Slide['type'], Theme> = {
  intro: GREEN,
  count: CREAM,
  'top-month': GOLD,
  'top-activity': BLUSH,
  votes: GREEN,
  momentum: CREAM,
  'shoutout-ideas': GOLD,
  'shoutout-votes': BLUSH,
  outro: GREEN,
}

interface WrappedSlideProps {
  slide: Slide
  /** 'share' erzwingt die volle Bühne fürs PNG; 'view' füllt den Viewer. */
  variant?: 'view' | 'share'
}

export function WrappedSlide({ slide, variant = 'view' }: WrappedSlideProps) {
  const theme = THEME_BY_TYPE[slide.type]

  return (
    <div
      className="relative h-full w-full overflow-hidden flex flex-col"
      style={{ backgroundColor: theme.bg, color: theme.fg }}
    >
      {/* Dezente Ecken-Deko: großer, weicher Akzent-Kreis oben rechts. */}
      <div
        aria-hidden
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-[0.12]"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="relative flex-1 min-h-0 flex flex-col items-center justify-center px-8 text-center">
        <SlideBody slide={slide} theme={theme} />
      </div>

      {/* Branding-Fuß — auf dem geteilten Bild verpflichtend (dezent). */}
      <div
        className="relative flex-shrink-0 pb-9 pt-2 text-center"
        style={{ paddingBottom: variant === 'share' ? '2.75rem' : undefined }}
      >
        <p className="text-[11px] font-[700] tracking-[0.14em]" style={{ color: theme.fgMuted }}>
          MELLON RÜCKBLICK · {slideYear(slide)}
        </p>
      </div>
    </div>
  )
}

function slideYear(slide: Slide): number | string {
  if (slide.type === 'intro' || slide.type === 'outro') return slide.year
  return ''
}

function SlideBody({ slide, theme }: { slide: Slide; theme: Theme }) {
  switch (slide.type) {
    case 'intro':
      return (
        <>
          <SlideIcon theme={theme}><Sparkles /></SlideIcon>
          <Overline theme={theme}>Euer Jahr</Overline>
          <BigStatement theme={theme}>{slide.year}</BigStatement>
          <GroupLine theme={theme} name={slide.groupName} />
          <Sub theme={theme}>Ein Rückblick auf alles, was ihr zusammen erlebt habt.</Sub>
        </>
      )

    case 'count':
      return (
        <>
          <Overline theme={theme}>Gemeinsam abgeschlossen</Overline>
          <BigNumber theme={theme}>{slide.count}</BigNumber>
          <Sub theme={theme}>
            {slide.count === 1 ? 'Aktivität' : 'Aktivitäten'}, die ihr zusammen erlebt habt.
          </Sub>
        </>
      )

    case 'top-month':
      return (
        <>
          <SlideIcon theme={theme}><CalendarHeart /></SlideIcon>
          <Overline theme={theme}>Euer aktivster Monat</Overline>
          <BigStatement theme={theme}>{monthNameDe(slide.monthIndex)}</BigStatement>
          <Sub theme={theme}>
            {slide.count} {slide.count === 1 ? 'Aktivität' : 'Aktivitäten'} in einem Monat — was für ein Lauf!
          </Sub>
        </>
      )

    case 'top-activity':
      return (
        <>
          <SlideIcon theme={theme}><Heart /></SlideIcon>
          <Overline theme={theme}>Aktivität des Jahres</Overline>
          <BigStatement theme={theme} clamp>{slide.name}</BigStatement>
          <Sub theme={theme}>
            Eure Nummer eins mit {slide.votes} {slide.votes === 1 ? 'Stimme' : 'Stimmen'}.
          </Sub>
        </>
      )

    case 'votes':
      return (
        <>
          <SlideIcon theme={theme}><Vote /></SlideIcon>
          <Overline theme={theme}>Demokratisch entschieden</Overline>
          <BigNumber theme={theme}>{slide.count}</BigNumber>
          <Sub theme={theme}>Mal habt ihr abgestimmt — jede Stimme zählte.</Sub>
        </>
      )

    case 'momentum':
      return (
        <>
          <SlideIcon theme={theme}><TrendingUp /></SlideIcon>
          <Overline theme={theme}>Euer Momentum</Overline>
          <BigStatement theme={theme}>{slide.levelName}</BigStatement>
          {slide.milestones.length > 0 ? (
            <Sub theme={theme}>
              {slide.milestones.length === 1
                ? `Meilenstein ${slide.milestones[0]} in diesem Jahr geknackt.`
                : `Meilensteine ${slide.milestones.join(' & ')} in diesem Jahr geknackt.`}
            </Sub>
          ) : (
            <Sub theme={theme}>Euer gemeinsames Level — weiter so!</Sub>
          )}
        </>
      )

    case 'shoutout-ideas':
      return (
        <ShoutoutBody
          theme={theme}
          icon={<Lightbulb />}
          overline="Ideengeber:in des Jahres"
          people={slide.people}
          note={`${slide.count} ${slide.count === 1 ? 'Idee' : 'Ideen'} eingebracht 💡`}
        />
      )

    case 'shoutout-votes':
      return (
        <ShoutoutBody
          theme={theme}
          icon={<Vote />}
          overline="Fleißigste:r Abstimmer:in"
          people={slide.people}
          note={`${slide.count}× abgestimmt 🗳️`}
        />
      )

    case 'outro':
      return (
        <>
          <SlideIcon theme={theme}><PartyPopper /></SlideIcon>
          <Overline theme={theme}>{slide.year} in Zahlen</Overline>
          <GroupLine theme={theme} name={slide.groupName} />
          <div className="mt-5 flex items-center justify-center gap-7">
            <Stat theme={theme} value={slide.count} label={slide.count === 1 ? 'Aktivität' : 'Aktivitäten'} />
            <Stat theme={theme} value={slide.voteCount} label={slide.voteCount === 1 ? 'Stimme' : 'Stimmen'} />
          </div>
          <Sub theme={theme}>Auf ein neues gemeinsames Jahr! 🥂</Sub>
        </>
      )
  }
}

// --- Bausteine --------------------------------------------------------------

function SlideIcon({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <div
      className="mb-5 flex h-14 w-14 items-center justify-center rounded-full [&>svg]:h-7 [&>svg]:w-7"
      style={{ backgroundColor: theme.accent, color: theme.onAccent }}
      aria-hidden
    >
      {children}
    </div>
  )
}

function Overline({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <p className="text-[13px] font-[700] tracking-[0.08em]" style={{ color: theme.accent }}>
      {children}
    </p>
  )
}

function BigStatement({ theme, children, clamp }: { theme: Theme; children: React.ReactNode; clamp?: boolean }) {
  return (
    <h2
      className={`mt-3 font-serif font-medium leading-[1.08] tracking-[-0.02em] text-[44px] break-words ${clamp ? 'line-clamp-4' : ''}`}
      style={{ color: theme.fg }}
    >
      {children}
    </h2>
  )
}

function BigNumber({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <span
      className="mt-2 font-serif font-medium leading-none tracking-[-0.03em] text-[120px]"
      style={{ color: theme.fg }}
    >
      {children}
    </span>
  )
}

function GroupLine({ theme, name }: { theme: Theme; name: string }) {
  return (
    <p className="mt-2 font-serif font-medium text-[24px] leading-tight break-words line-clamp-2" style={{ color: theme.fg }}>
      {name}
    </p>
  )
}

function Sub({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return (
    <p className="mt-4 max-w-[280px] text-[15.5px] leading-relaxed" style={{ color: theme.fgMuted }}>
      {children}
    </p>
  )
}

function Stat({ theme, value, label }: { theme: Theme; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-serif font-medium text-[52px] leading-none" style={{ color: theme.fg }}>
        {value}
      </span>
      <span className="mt-1.5 text-[13px] font-[600]" style={{ color: theme.fgMuted }}>
        {label}
      </span>
    </div>
  )
}

function ShoutoutBody({
  theme,
  icon,
  overline,
  people,
  note,
}: {
  theme: Theme
  icon: React.ReactNode
  overline: string
  people: ShoutoutPerson[]
  note: string
}) {
  return (
    <>
      <SlideIcon theme={theme}>{icon}</SlideIcon>
      <Overline theme={theme}>{overline}</Overline>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {people.map((p) => (
          <div
            key={p.id}
            className="flex h-16 w-16 items-center justify-center rounded-full text-[22px] font-[800]"
            style={{ backgroundColor: theme.accent, color: theme.onAccent }}
            aria-hidden
          >
            {getInitials(p.name)}
          </div>
        ))}
      </div>

      <h2
        className="mt-4 font-serif font-medium leading-[1.1] tracking-[-0.02em] text-[32px] break-words line-clamp-3"
        style={{ color: theme.fg }}
      >
        {people.map((p) => p.name).join(' & ')}
      </h2>
      <Sub theme={theme}>{note}</Sub>
    </>
  )
}

'use client'

import { Sparkles, ChevronRight } from 'lucide-react'

interface WrappedBannerProps {
  year: number
  /** Antippen öffnet den Story-Viewer des laufenden Jahres. */
  onOpen: () => void
}

/**
 * Rückblick-Teaser-Banner (PROJ-18) — erscheint saisonal (ab 1.12., nur bei
 * ≥ 3 Abschlüssen) ganz oben im Vorschläge-Tab, unter dem Momentum-Banner.
 * Bewusst festlicher Look (invertierter Grün-Block wie die Feier-Momente),
 * damit der Event-Charakter sofort spürbar ist.
 */
export function WrappedBanner({ year, onOpen }: WrappedBannerProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Mellon Rückblick ${year} ansehen`}
      className="relative w-full overflow-hidden rounded-lg p-4 text-left shadow-sm
                 transition active:scale-[0.99]"
      style={{ backgroundColor: '#173829' }}
    >
      <div
        aria-hidden
        className="absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-15"
        style={{ backgroundColor: '#D9A24B' }}
      />
      <div className="relative flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-pill"
          style={{ backgroundColor: '#D9A24B' }}
        >
          <Sparkles className="h-5 w-5" style={{ color: '#173829' }} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-[700] tracking-[0.08em]" style={{ color: '#D9A24B' }}>
            NEU · MELLON RÜCKBLICK
          </p>
          <p className="truncate text-[16px] font-[800] leading-snug" style={{ color: '#FBF8F3' }}>
            Euer {year} ist da 🎉
          </p>
        </div>

        <ChevronRight className="h-4 w-4 flex-shrink-0" strokeWidth={2} style={{ color: 'rgba(251,248,243,0.6)' }} />
      </div>
    </button>
  )
}

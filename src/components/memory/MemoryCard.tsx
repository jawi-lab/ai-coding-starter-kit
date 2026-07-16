'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { memoryAccent } from '@/lib/memory-card'

interface MemoryCardProps {
  title: string
  dateLabel: string
  groupName: string
  durationCategory: string
  /** Aufgelöstes Cover (ältestes Foto → og_image_url); null = Platzhalter. */
  coverUrl: string | null
  isNew?: boolean
  /** Ohne onClick rendert die Karte nicht-interaktiv (Reveal-Overlay). */
  onClick?: () => void
}

/**
 * Memory Card (PROJ-17) — Sammelkarten-Ansicht einer abgeschlossenen
 * Aktivität. Identisch im Album-Grid und im Reveal-Overlay: Cover (lazy),
 * Farbakzent-Balken je Dauer-Kategorie, Serif-Titel (max. 2 Zeilen), Datum,
 * Gruppen-Badge, optional „Neu". Lädt das Cover nicht oder fehlt es, zeigt
 * ein Cover-Gradient mit Serif-Initiale den Styleguide-Platzhalter — nie ein
 * gebrochenes Bild.
 */
export function MemoryCard({
  title,
  dateLabel,
  groupName,
  durationCategory,
  coverUrl,
  isNew = false,
  onClick,
}: MemoryCardProps) {
  const accent = memoryAccent(durationCategory)
  const [imgFailed, setImgFailed] = useState(false)
  const showImage = Boolean(coverUrl) && !imgFailed

  const Comp = onClick ? 'button' : 'div'

  return (
    <Comp
      {...(onClick ? { type: 'button' as const, onClick } : {})}
      className={`w-full text-left bg-surface border border-line rounded-lg overflow-hidden shadow-sm
                  ${onClick ? 'hover:border-primary/30 transition-colors active:scale-[0.98]' : ''}`}
    >
      {/* Cover */}
      <div className="relative aspect-[4/5]">
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl as string}
            alt=""
            aria-hidden
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className={`absolute inset-0 ${accent.gradient} flex items-center justify-center`}
          >
            <span className="font-serif font-medium text-[42px] text-white/30 select-none">
              {(title.trim().charAt(0) || '•').toUpperCase()}
            </span>
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between gap-1.5">
          <Badge className="bg-black/50 text-white text-[10px] font-[700] border-0 px-2 py-0.5 rounded-pill backdrop-blur-sm min-w-0">
            <span className="truncate">{groupName}</span>
          </Badge>
          {isNew && (
            <Badge className="bg-secondary text-white text-[10px] font-[800] border-0 px-2 py-0.5 rounded-pill flex-shrink-0">
              Neu
            </Badge>
          )}
        </div>
      </div>

      {/* Farbakzent je Dauer-Kategorie (spontan/Wochenende/länger) */}
      <div className={`h-[3px] ${accent.bar}`} aria-hidden />

      <div className="px-2.5 pt-2 pb-2.5">
        <p className="font-serif font-medium text-[14.5px] tracking-[-0.01em] leading-snug text-ink line-clamp-2 min-h-[2.6em]">
          {title}
        </p>
        <p className="mt-1 text-[11px] font-[600] text-ink-3">{dateLabel}</p>
      </div>
    </Comp>
  )
}

'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useArchive } from '@/hooks/useArchive'
import { useMemoryCovers } from '@/hooks/useMemoryCovers'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { ActivityDetailSheet } from '@/components/groups/ActivityDetailSheet'
import { useAuth } from '@/contexts/AuthContext'
import { memoryCardDate, isCardNew } from '@/lib/memory-card'
import { Images } from 'lucide-react'

interface AlbumTabProps {
  /**
   * Snapshot von „Album zuletzt geöffnet" VOR dem markSeen dieses Besuchs —
   * dagegen werden die „Neu"-Badges im Grid berechnet (ProfileSheet hält den
   * Snapshot, damit das sofortige Hochsetzen die Badges nicht auslöscht).
   */
  lastSeenAt: string | null
}

/**
 * Album (PROJ-17) — ersetzt die Archiv-Liste im Profil-Sheet durch ein
 * 2-spaltiges Memory-Card-Grid: gruppenübergreifend (aktive + ehemalige
 * Mitgliedschaften), neueste zuerst, Filter-Chips ab 2 Gruppen, Pagination
 * à 20 (bestehendes Muster). Tap auf eine Karte öffnet das bestehende
 * ActivityDetailSheet im read-only-Modus.
 */
export function AlbumTab({ lastSeenAt }: AlbumTabProps) {
  const { user } = useAuth()
  const [groupFilter, setGroupFilter] = useState<string | null>(null)
  const { activities, groups, loading, loadingMore, hasMore, loadMore } = useArchive(groupFilter)
  const covers = useMemoryCovers(activities.map((a) => a.id))

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  function handleClose() {
    setSelectedActivityId(null)
    setSelectedGroupId('')
  }

  const showChips = groups.length > 1

  const filterChips = showChips && (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-5 px-5">
      <FilterChip active={groupFilter === null} onClick={() => setGroupFilter(null)}>
        Alle
      </FilterChip>
      {groups.map((g) => (
        <FilterChip
          key={g.id}
          active={groupFilter === g.id}
          onClick={() => setGroupFilter(g.id)}
        >
          {g.name}
        </FilterChip>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div className="px-5 pt-4 grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="aspect-[4/6] w-full rounded-lg bg-surface" />
        ))}
      </div>
    )
  }

  if (activities.length === 0 && !groupFilter) {
    return (
      <div className="flex flex-col items-center justify-center px-5 pt-12 pb-8 text-center">
        <div className="h-14 w-14 rounded-full bg-surface-2 flex items-center justify-center mb-4">
          <Images className="h-7 w-7 text-ink-3" />
        </div>
        <p className="text-[15px] font-[700] text-ink mb-1">Noch keine Erinnerungen</p>
        <p className="text-[13px] text-ink-3 leading-relaxed max-w-[240px]">
          Schließt eure erste Aktivität ab und eure erste Karte erscheint hier!
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="px-5 pt-4 pb-6 space-y-3">
        {filterChips}

        {activities.length === 0 ? (
          <p className="pt-8 text-center text-[13px] text-ink-3">
            Keine Erinnerungen in dieser Gruppe.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {activities.map((activity) => (
              <MemoryCard
                key={activity.id}
                title={activity.name}
                dateLabel={memoryCardDate(activity)}
                groupName={activity.group_name}
                durationCategory={activity.duration_category}
                coverUrl={covers[activity.id] ?? activity.og_image_url}
                isNew={isCardNew(activity.completed_at, lastSeenAt)}
                onClick={() => {
                  setSelectedActivityId(activity.id)
                  setSelectedGroupId(activity.group_id)
                }}
              />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="pt-1">
            <Button
              variant="outline"
              className="w-full border-line text-ink-2 text-[13px] font-[700] rounded-md"
              onClick={loadMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Wird geladen…' : 'Mehr laden'}
            </Button>
          </div>
        )}
      </div>

      {selectedActivityId && (
        <ActivityDetailSheet
          activityId={selectedActivityId}
          groupId={selectedGroupId}
          currentUserId={user?.id ?? ''}
          isAdmin={false}
          onClose={handleClose}
          readOnly={true}
        />
      )}
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-shrink-0 whitespace-nowrap text-[12.5px] font-[700] px-3.5 py-1.5 rounded-pill
                  border-[1.5px] transition-all active:scale-[0.97]
                  ${active
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface text-ink-2 border-line hover:border-primary/40'}`}
    >
      {children}
    </button>
  )
}

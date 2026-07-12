'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { groupHref } from '@/lib/group-routes'
import { useMyOpenResponsibilities } from '@/hooks/useMyOpenResponsibilities'

/**
 * "Meine Aufgaben" auf Home: gruppenübergreifend alle offenen Verantwortlichkeiten,
 * die dem User zugewiesen sind. Abhaken erledigt die Aufgabe (verschwindet),
 * ein Klick auf die Zeile öffnet die zugehörige Aktivität.
 */
export function MyTasksSection({ userId }: { userId: string | null }) {
  const router = useRouter()
  const { responsibilities, loading, markDone } = useMyOpenResponsibilities(userId)

  // Nichts anzeigen, solange leer & fertig geladen — Home bleibt aufgeräumt.
  if (!loading && responsibilities.length === 0) return null

  function openActivity(groupId: string, activityId: string) {
    router.push(`${groupHref(groupId)}&activity=${activityId}`)
  }

  async function handleToggle(id: string) {
    const ok = await markDone(id)
    if (!ok) toast.error('Aufgabe konnte nicht aktualisiert werden')
  }

  return (
    <section className="mb-6">
      <h2 className="text-[13px] font-[800] text-ink-2 tracking-[0.06em] mb-2.5">
        Meine Aufgaben
      </h2>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-[52px] w-full rounded-md bg-surface" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {responsibilities.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 bg-surface border border-line rounded-md px-3.5 py-3"
            >
              <Checkbox
                checked={r.done}
                onCheckedChange={() => handleToggle(r.id)}
                aria-label={`"${r.label}" als erledigt markieren`}
                className="flex-shrink-0"
              />
              <button
                onClick={() => openActivity(r.activity.group_id, r.activity_id)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-[14px] font-[700] text-ink truncate">{r.label}</p>
                <p className="text-[12px] text-ink-3 truncate">{r.activity.name}</p>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

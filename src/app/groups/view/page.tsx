'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Users } from 'lucide-react'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useGroupDetail } from '@/hooks/useGroupDetail'
import { GroupDetailSheet } from '@/components/groups/GroupDetailSheet'
import { ActivityDetailSheet } from '@/components/groups/ActivityDetailSheet'
import { ProposalFormSheet } from '@/components/groups/ProposalFormSheet'
import { GroupBottomNav } from '@/components/groups/GroupBottomNav'
import { DesktopSidebar } from '@/components/groups/DesktopSidebar'
import { ProfileSheet } from '@/components/profile/ProfileSheet'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GroupShellProvider } from '@/components/groups/GroupShellContext'
import { groupHref, resolveGroupTab } from '@/lib/group-routes'
import { truncateName } from '@/lib/group-types'
import { setLastGroupId } from '@/lib/last-group'
import { VorschlaegeTab } from '@/components/groups/tabs/VorschlaegeTab'
import { PlanungTab } from '@/components/groups/tabs/PlanungTab'
import { TermineTab } from '@/components/groups/tabs/TermineTab'

function GroupView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const groupId = searchParams.get('id') ?? ''
  const activeSeg = resolveGroupTab(searchParams.get('tab'))
  const activityParam = searchParams.get('activity')
  const { user } = useAuth()

  const { group, members, myRole, isAdmin, loading, error, refetch } = useGroupDetail(groupId)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailActivityId, setDetailActivityId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Die Übersicht (VorschlaegeTab) registriert hier ihren refetch, damit das
  // zentral gerenderte Create-Sheet die Liste nach dem Erstellen aktualisiert.
  const proposalsRefetchRef = useRef<(() => void) | null>(null)
  const registerProposalsRefetch = useCallback((fn: (() => void) | null) => {
    proposalsRefetchRef.current = fn
  }, [])

  // Einziger Erstellen-Einstieg (Bottom-Nav-+ wie Desktop-FAB): immer zur
  // Übersicht wechseln und das Sheet öffnen — so gibt es nie zwei Eingaben.
  const openCreateProposal = useCallback(() => {
    router.replace(groupHref(groupId, 'vorschlaege'))
    setCreateOpen(true)
  }, [router, groupId])

  // Keine Gruppen-ID in der URL → zurück zur Gruppenliste.
  useEffect(() => {
    if (!groupId) router.replace('/groups')
  }, [groupId, router])

  // Zuletzt geöffnete Gruppe merken, damit die persistente Bottom-Nav auf Home
  // sinnvolle Tab-Ziele hat (Vorschläge/Board/Termine → diese Gruppe).
  useEffect(() => {
    if (groupId) setLastGroupId(groupId)
  }, [groupId])

  // Deep-Link aus einem Push-Tap (PROJ-10): `?activity=<id>` öffnet direkt das
  // Detail-Sheet dieser Aktivität. Danach strippen wir den Param, damit das
  // Schließen des Sheets es nicht erneut öffnet. Ein nicht mehr existierender
  // Inhalt wird vom ActivityDetailSheet abgefangen (kein leerer Screen).
  useEffect(() => {
    if (!activityParam || !groupId) return
    setDetailActivityId(activityParam)
    router.replace(groupHref(groupId, activeSeg))
  }, [activityParam, groupId, activeSeg, router])

  const canCreate = myRole === 'admin' || myRole === 'editor'
  const memberCount = members.length || 1

  if (!groupId) return null

  return (
    <div className="h-[100dvh] overflow-hidden bg-bg flex">
      {/* Desktop-Sidebar (Mellon) — mobil übernimmt die Bottom-Nav. */}
      <DesktopSidebar
        active={activeSeg}
        targetGroupId={groupId}
        groupName={group?.name ?? null}
        onProfile={() => setProfileOpen(true)}
      />

      <div className="flex-1 min-w-0 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-bg pt-safe">
        <div className="max-w-5xl mx-auto w-full px-4 h-14 flex items-center relative">
          {/* Gruppenname mittig, klickbar → öffnet die Gruppen-Einstellungen
              (ersetzt den früheren „Gruppe"-Button in der Vorschläge-Liste).
              Hart auf 20 Zeichen gekürzt (siehe truncateName). Kein Zurück-Pfeil
              mehr — „Home" in der Bottom-Nav ersetzt ihn. Nutzer-Inhalt →
              Display-Serif (Mellon). */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            disabled={!group}
            aria-label="Gruppen-Einstellungen öffnen"
            className="absolute left-1/2 -translate-x-1/2 max-w-[62%] flex items-center gap-1.5
                       px-2 py-1 rounded-pill text-ink transition
                       hover:bg-surface-2 active:scale-[0.98] disabled:pointer-events-none"
          >
            <Users className="h-[18px] w-[18px] flex-shrink-0 text-ink-3" strokeWidth={2} />
            <span className="font-serif font-medium text-[19px] tracking-[-0.015em] truncate leading-tight">
              {loading && !group ? '…' : group ? truncateName(group.name) : 'Gruppe'}
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0 flex flex-col">
        {error && !group ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[28px]">🚫</p>
            <p className="text-[16px] font-[800] text-ink">Gruppe nicht gefunden</p>
            <p className="text-[13px] text-ink-3 max-w-[260px]">
              Diese Gruppe existiert nicht mehr oder du bist kein Mitglied.
            </p>
            <Button onClick={() => router.push('/groups')} className="mt-1">
              Zu meinen Gruppen
            </Button>
          </div>
        ) : loading && !group ? (
          <div className="max-w-5xl mx-auto w-full px-4 py-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-lg bg-surface" />
            ))}
          </div>
        ) : (
          <GroupShellProvider
            value={{
              groupId,
              group,
              myRole,
              isAdmin,
              canCreate,
              memberCount,
              loading,
              openActivityDetail: setDetailActivityId,
              refetchGroup: refetch,
              openCreateProposal,
              openGroupSettings: () => setSettingsOpen(true),
              registerProposalsRefetch,
            }}
          >
            {activeSeg === 'vorschlaege' && <VorschlaegeTab />}
            {activeSeg === 'planung' && <PlanungTab />}
            {activeSeg === 'termine' && <TermineTab />}
          </GroupShellProvider>
        )}
      </div>

      </div>

      {/* Persistente Bottom-Navigation — nur mobil/nativ, fixiert am Viewport-Rand
          (identisch zu Home, damit sie sich auf Mobile/Android/iOS überall gleich
          verhält). Desktop nutzt die Sidebar. */}
      {group && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-20">
          <GroupBottomNav
            active={activeSeg}
            targetGroupId={groupId}
            onProfile={() => setProfileOpen(true)}
          />
        </div>
      )}

      {/* Zentrales „neuer Vorschlag"-Sheet (einziger Erstellen-Einstieg) */}
      <ProposalFormSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        groupId={groupId}
        memberCount={memberCount}
        onSuccess={() => {
          toast.success('Vorschlag erstellt')
          proposalsRefetchRef.current?.()
          setCreateOpen(false)
        }}
      />

      {/* Profil-Sheet (aus der Bottom-Nav) */}
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />

      {/* Shared settings sheet */}
      <GroupDetailSheet
        groupId={settingsOpen ? groupId : null}
        onClose={() => setSettingsOpen(false)}
        onGroupLeft={() => { setSettingsOpen(false); router.push('/groups') }}
        onGroupDeleted={() => { setSettingsOpen(false); router.push('/groups') }}
      />

      {/* Shared activity detail sheet */}
      <ActivityDetailSheet
        activityId={detailActivityId}
        groupId={groupId}
        currentUserId={user?.id ?? ''}
        isAdmin={isAdmin}
        onClose={() => setDetailActivityId(null)}
        onActivityUpdated={() => refetch()}
      />
    </div>
  )
}

function GroupViewFallback() {
  return (
    <div className="h-[100dvh] bg-bg flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-5 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[88px] w-full rounded-lg bg-surface" />
        ))}
      </div>
    </div>
  )
}

export default function GroupViewPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<GroupViewFallback />}>
        <GroupView />
      </Suspense>
    </AuthGuard>
  )
}

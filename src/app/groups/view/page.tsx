'use client'

import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
import { ProfileSheet } from '@/components/profile/ProfileSheet'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GroupShellProvider } from '@/components/groups/GroupShellContext'
import { GROUP_TABS, groupHref, resolveGroupTab } from '@/lib/group-routes'
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
    <div className="h-[100dvh] overflow-hidden bg-bg flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-bg border-b border-line pt-safe">
        <div className="max-w-5xl mx-auto w-full px-4 h-14 flex items-center relative">
          {/* Gruppenname mittig — hart auf 20 Zeichen gekürzt (siehe truncateName).
              Kein Zurück-Pfeil mehr — „Home" in der Bottom-Nav ersetzt ihn. */}
          <h1 className="absolute left-1/2 -translate-x-1/2 max-w-[45%] text-center text-[18px] font-[800] text-ink truncate leading-tight">
            {loading && !group ? '…' : group ? truncateName(group.name) : 'Gruppe'}
          </h1>

          <div className="ml-auto flex items-center gap-1">
            <NotificationBell />
          </div>
        </div>

        {/* Top-Tab-Navigation — nur Desktop. Mobil übernimmt die Bottom-Nav. */}
        <nav className="max-w-5xl mx-auto w-full px-4 hidden md:flex gap-1">
          {GROUP_TABS.map((tab) => {
            const active = activeSeg === tab.seg
            return (
              <Link
                key={tab.seg}
                href={groupHref(groupId, tab.seg)}
                replace
                className={`pb-2.5 px-1 mr-3 text-[14px] border-b-2 transition-colors
                  ${active
                    ? 'font-[700] text-primary border-primary'
                    : 'font-[600] text-ink-3 border-transparent hover:text-ink-2'
                  }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
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
            <Button
              onClick={() => router.push('/groups')}
              className="mt-1 bg-primary hover:bg-primary-600 text-white rounded-[12px]"
            >
              Zu meinen Gruppen
            </Button>
          </div>
        ) : loading && !group ? (
          <div className="max-w-5xl mx-auto w-full px-4 py-5 space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[88px] w-full rounded-[18px] bg-surface" />
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

      {/* Bottom-Navigation — nur mobil/nativ. Desktop nutzt die oberen Tabs. */}
      {group && (
        <GroupBottomNav
          active={activeSeg}
          targetGroupId={groupId}
          onProfile={() => setProfileOpen(true)}
        />
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
          <Skeleton key={i} className="h-[88px] w-full rounded-[18px] bg-surface" />
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

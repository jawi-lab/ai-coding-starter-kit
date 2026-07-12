'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useGroups } from '@/hooks/useGroups'
import { useAuth } from '@/contexts/AuthContext'
import { GroupCard } from '@/components/groups/GroupCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from '@/components/ui/responsive-modal'
import { OnboardingScreen } from '@/components/groups/OnboardingScreen'
import { ProfileSheet } from '@/components/profile/ProfileSheet'
import { NotificationBell } from '@/components/notifications/NotificationBell'
import { GroupBottomNav } from '@/components/groups/GroupBottomNav'
import { DesktopSidebar } from '@/components/groups/DesktopSidebar'
import { MyTasksSection } from '@/components/profile/MyTasksSection'
import { groupHref } from '@/lib/group-routes'
import { getLastGroupId } from '@/lib/last-group'

function GroupsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { groups, loading, error } = useGroups()

  const [addSheetOpen, setAddSheetOpen] = useState(false)
  const [profileSheetOpen, setProfileSheetOpen] = useState(false)
  const [scrollToNotifications, setScrollToNotifications] = useState(false)

  // Zielgruppe für die persistenten Bottom-Nav-Tabs: zuletzt geöffnete Gruppe
  // (localStorage, erst nach Mount lesbar), Fallback = erste Gruppe.
  const [lastGroupId, setLastGroupId] = useState<string | null>(null)
  useEffect(() => {
    setLastGroupId(getLastGroupId())
  }, [])
  const navTargetGroupId = lastGroupId ?? groups[0]?.id ?? null

  // Open group from query param (e.g., after creation/join) → navigate to its page
  useEffect(() => {
    const groupParam = searchParams.get('group')
    if (groupParam) {
      router.replace(groupHref(groupParam))
    }
  }, [searchParams, router])

  // Email "Benachrichtigungen verwalten" deep-link (BUG-12-1): open the profile
  // sheet and scroll to the notification settings section, then clear the param.
  useEffect(() => {
    if (searchParams.get('settings') === 'notifications') {
      setProfileSheetOpen(true)
      setScrollToNotifications(true)
      router.replace('/groups')
    }
  }, [searchParams, router])

  // Show toast after successful Google Calendar OAuth
  useEffect(() => {
    if (searchParams.get('calendarConnected') === 'true') {
      toast.success('Google Kalender erfolgreich verbunden')
      router.replace('/groups')
    }
  }, [searchParams, router])

  // Redirect to onboarding only when the user genuinely has no groups.
  // Never redirect on a fetch error — that would silently bounce the user
  // away (and hide the error) instead of surfacing the problem.
  useEffect(() => {
    if (!loading && !error && groups.length === 0) {
      router.replace('/onboarding')
    }
  }, [loading, error, groups.length, router])

  function handleAddGroupSuccess(groupId: string) {
    setAddSheetOpen(false)
    router.push(groupHref(groupId))
  }

  return (
    <div className="min-h-screen bg-bg md:flex">
      {/* Desktop-Sidebar (Mellon) — mobil übernimmt die Bottom-Nav. */}
      <div className="hidden md:block md:sticky md:top-0 md:h-screen">
        <DesktopSidebar
          active="home"
          targetGroupId={navTargetGroupId}
          onProfile={() => setProfileSheetOpen(true)}
        />
      </div>

      <div className="flex-1 min-w-0">
      {/* Header */}
      <header className="bg-bg px-4 h-bar-safe flex items-center justify-end sticky top-0 z-10">
        <NotificationBell />
      </header>

      {/* Main content */}
      <main className="px-4 py-6 max-w-6xl mx-auto pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6">
        <MyTasksSection userId={user?.id ?? null} />

        <div className="mb-5">
          <h1 className="text-[24px] font-extrabold text-ink">Meine Gruppen</h1>
          <p className="text-[14px] text-ink-2 mt-0.5">
            {loading ? ' ' : `${groups.length} ${groups.length === 1 ? 'Gruppe' : 'Gruppen'}`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[74px] w-full rounded-lg bg-surface" />
            ))}
          </div>
        ) : (
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => router.push(groupHref(group.id))}
              />
            ))}
          </div>
        )}

        {/* Gruppe erstellen/beitreten — unter der Gruppenliste (statt im Header). */}
        {!loading && (
          <Button
            variant="outline"
            onClick={() => setAddSheetOpen(true)}
            className="mt-3 w-full md:w-auto h-12 px-5 border-dashed border-line text-ink-2
                       gap-1.5 font-semibold hover:bg-surface-2 hover:text-ink"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>
        )}
      </main>

      {/* Persistente Bottom-Navigation — nur mobil. Home ist aktiv; die Gruppen-Tabs
          zeigen auf die zuletzt geöffnete Gruppe. */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-20">
        <GroupBottomNav
          active="home"
          targetGroupId={navTargetGroupId}
          onProfile={() => setProfileSheetOpen(true)}
        />
      </div>

      {/* Profile Sheet */}
      <ProfileSheet
        open={profileSheetOpen}
        onOpenChange={(open) => {
          setProfileSheetOpen(open)
          if (!open) setScrollToNotifications(false)
        }}
        scrollToNotifications={scrollToNotifications}
      />

      {/* Add group modal (inline onboarding) */}
      <ResponsiveModal open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <ResponsiveModalContent
          size="md"
          className="bg-bg border-line p-0 max-h-[90dvh]"
        >
          <ResponsiveModalHeader className="px-5 pt-5 pb-4 border-b border-line flex-shrink-0">
            <ResponsiveModalTitle className="text-[18px] font-[800] text-ink">Gruppe hinzufügen</ResponsiveModalTitle>
          </ResponsiveModalHeader>
          <div className="overflow-y-auto">
            <OnboardingScreen onSuccess={handleAddGroupSuccess} />
          </div>
        </ResponsiveModalContent>
      </ResponsiveModal>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  return (
    <AuthGuard>
      <GroupsContent />
    </AuthGuard>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { useGroups } from '@/hooks/useGroups'
import { useAuth } from '@/contexts/AuthContext'
import { GroupCard } from '@/components/groups/GroupCard'
import { GroupMainSheet } from '@/components/groups/GroupMainSheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { OnboardingScreen } from '@/components/groups/OnboardingScreen'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, LogOut, User } from 'lucide-react'

function GroupsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, signOut } = useAuth()
  const { groups, loading, refetch } = useGroups()

  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null
  const [addSheetOpen, setAddSheetOpen] = useState(false)

  // Open group from query param (e.g., after creation/join)
  useEffect(() => {
    const groupParam = searchParams.get('group')
    if (groupParam) {
      setActiveGroupId(groupParam)
      router.replace('/groups')
    }
  }, [searchParams, router])

  // Redirect to onboarding if no groups and done loading
  useEffect(() => {
    if (!loading && groups.length === 0) {
      router.replace('/onboarding')
    }
  }, [loading, groups.length, router])

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  function handleGroupLeft() {
    refetch()
  }

  function handleGroupDeleted() {
    refetch()
  }

  function handleAddGroupSuccess(groupId: string) {
    setAddSheetOpen(false)
    refetch()
    setActiveGroupId(groupId)
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="bg-bg border-b border-line px-4 h-14 flex items-center justify-between sticky top-0 z-10">
        <span className="text-[18px] font-[900] uppercase tracking-[0.18em] text-ink">
          ZUSAMMEN
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAddSheetOpen(true)}
            className="h-8 px-3 rounded-md text-[13px] font-semibold text-ink-2 hover:text-ink hover:bg-surface-2 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Hinzufügen
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs font-[800]">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-[12px] bg-surface border-line">
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-sm truncate">
                    {profile?.display_name ?? 'Mein Konto'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-line" />
              <DropdownMenuItem
                onClick={signOut}
                className="text-error focus:text-error cursor-pointer text-[14px]"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Ausloggen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 max-w-lg mx-auto">
        <div className="mb-5">
          <h1 className="text-[24px] font-[900] text-ink">Meine Gruppen</h1>
          <p className="text-[14px] text-ink-2 mt-0.5">
            {loading ? ' ' : `${groups.length} ${groups.length === 1 ? 'Gruppe' : 'Gruppen'}`}
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-[74px] w-full rounded-[18px] bg-surface" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onClick={() => setActiveGroupId(group.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Group Main Sheet */}
      <GroupMainSheet
        group={activeGroup}
        onClose={() => setActiveGroupId(null)}
        onGroupLeft={handleGroupLeft}
        onGroupDeleted={handleGroupDeleted}
      />

      {/* Add group sheet (inline onboarding) */}
      <Sheet open={addSheetOpen} onOpenChange={setAddSheetOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-[24px] bg-bg border-t border-line p-0 max-h-[90vh]"
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-line">
            <SheetTitle className="text-[18px] font-[800] text-ink">Gruppe hinzufügen</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            <OnboardingScreen onSuccess={handleAddGroupSuccess} />
          </div>
        </SheetContent>
      </Sheet>
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

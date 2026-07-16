'use client'

import {
  ResponsiveModal, ResponsiveModalContent, ResponsiveModalHeader, ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProfileSection } from './ProfileSection'
import { BadgeSection } from './BadgeSection'
import { AppearanceSection } from './AppearanceSection'
import { NotificationPreferencesSection } from './NotificationPreferencesSection'
import { CalendarConnectionSection } from './CalendarConnectionSection'
import { DateBlocksSection } from './DateBlocksSection'
import { AlbumTab } from './AlbumTab'
import { useAlbumBadge } from '@/hooks/useAlbumBadge'

interface ProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When opened via the email "Benachrichtigungen verwalten" deep-link, scroll the
      Profil tab to the notification settings section. */
  scrollToNotifications?: boolean
}

export function ProfileSheet({ open, onOpenChange, scrollToNotifications }: ProfileSheetProps) {
  const { signOut, profile } = useAuth()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  // Album (PROJ-17): Punkt-Indikator am Tab + Gesehen-Logik. Beim ersten
  // Öffnen des Album-Tabs pro Sheet-Besuch: alten Zeitstempel als Snapshot
  // sichern (für die „Neu"-Badges im Grid) und dann auf jetzt setzen.
  const { hasNew, markSeen } = useAlbumBadge(open)
  const [tab, setTab] = useState('profil')
  const [albumSeenSnapshot, setAlbumSeenSnapshot] = useState<string | null>(null)
  const [albumVisited, setAlbumVisited] = useState(false)

  function handleTabChange(value: string) {
    setTab(value)
    if (value === 'album' && !albumVisited) {
      setAlbumVisited(true)
      setAlbumSeenSnapshot(profile?.album_last_seen_at ?? null)
      markSeen()
    }
  }

  // Pro Sheet-Öffnung frisch starten (Tabs waren zuvor uncontrolled und
  // setzten sich durch das Unmounten des Sheets automatisch zurück).
  useEffect(() => {
    if (open) {
      setTab('profil')
      setAlbumVisited(false)
      setAlbumSeenSnapshot(null)
    }
  }, [open])

  // Deep-link target (BUG-12-1): once the sheet has animated open, bring the
  // "Benachrichtigungen" section into view. Profil is the default tab, so the anchor
  // is already mounted.
  useEffect(() => {
    if (!open || !scrollToNotifications) return
    const timer = setTimeout(() => {
      document
        .getElementById('notification-settings')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 350)
    return () => clearTimeout(timer)
  }, [open, scrollToNotifications])

  async function handleLogout() {
    setLogoutDialogOpen(false)
    await signOut()
  }

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={onOpenChange}>
        <ResponsiveModalContent
          size="md"
          className="h-[90dvh] md:h-auto bg-bg border-line p-0 rounded-t-[30px]"
        >
          <ResponsiveModalHeader className="px-5 pt-5 pb-0 flex-shrink-0">
            <ResponsiveModalTitle className="text-[18px] font-[800] text-ink text-left">
              Mein Konto
            </ResponsiveModalTitle>
            <ResponsiveModalDescription className="sr-only">
              Profil, Darstellung, Kalender, Verfügbarkeit und Album verwalten.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          <Tabs value={tab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0 mt-3">
            <TabsList className="flex-shrink-0 mx-5 bg-surface-2 rounded-pill p-0.5 h-9">
              <TabsTrigger
                value="profil"
                className="flex-1 text-[13px] font-[700] rounded-[8px] data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm text-ink-3"
              >
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="album"
                className="relative flex-1 text-[13px] font-[700] rounded-[8px] data-[state=active]:bg-surface data-[state=active]:text-ink data-[state=active]:shadow-sm text-ink-3"
              >
                Album
                {/* Punkt-Indikator (PROJ-17): ungesehene Karten warten im Album */}
                {hasNew && (
                  <span
                    aria-label="Neue Karten im Album"
                    className="absolute top-1 right-2 h-2 w-2 rounded-full bg-secondary"
                  />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Profil Tab */}
            <TabsContent value="profil" className="flex-1 overflow-y-auto mt-0">
              <div className="px-5 pt-4 pb-6 space-y-5">
                <ProfileSection />

                <Separator className="bg-line" />

                {/* Rollen-Badges (PROJ-16): Haupt-Anzeigeort mit Stufe + Fortschritt */}
                <BadgeSection />

                <Separator className="bg-line" />

                <AppearanceSection />

                <Separator className="bg-line" />

                {/* Notifications (PROJ-12): OS push activation (native) + the
                    per-type Push/E-Mail matrix. E-Mail switches work on web too.
                    Anchor id is the email "verwalten" deep-link target (BUG-12-1). */}
                <div id="notification-settings" className="scroll-mt-4">
                  <NotificationPreferencesSection />
                </div>

                <Separator className="bg-line" />

                <CalendarConnectionSection />

                <Separator className="bg-line" />

                <DateBlocksSection />

                <Separator className="bg-line" />

                {/* Logout */}
                <Button
                  variant="outline"
                  onClick={() => setLogoutDialogOpen(true)}
                  className="w-full border-error/30 text-error hover:text-error hover:bg-error-soft text-[14px] font-[700] rounded-md gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Ausloggen
                </Button>
              </div>
            </TabsContent>

            {/* Album Tab (PROJ-17, ehemals Archiv) */}
            <TabsContent value="album" className="flex-1 overflow-y-auto mt-0">
              <AlbumTab lastSeenAt={albumSeenSnapshot} />
            </TabsContent>
          </Tabs>
        </ResponsiveModalContent>
      </ResponsiveModal>

      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="bg-surface border-line rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-ink">Ausloggen?</AlertDialogTitle>
            <AlertDialogDescription className="text-ink-3">
              Du wirst von deinem Konto abgemeldet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-line text-ink-2">Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-error hover:bg-error text-white"
            >
              Ausloggen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

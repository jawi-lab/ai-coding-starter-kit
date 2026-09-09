'use client'

import {
  ResponsiveModal, ResponsiveModalContent, ResponsiveModalHeader, ResponsiveModalTitle,
  ResponsiveModalDescription,
} from '@/components/ui/responsive-modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getInitials } from '@/lib/avatar'
import { ProfileSection } from './ProfileSection'
import { BadgeSection } from './BadgeSection'
import { AppearanceSection } from './AppearanceSection'
import { NotificationPreferencesSection } from './NotificationPreferencesSection'
import { CalendarConnectionSection } from './CalendarConnectionSection'
import { DateBlocksSection } from './DateBlocksSection'
import { AlbumTab } from './AlbumTab'
import { useAlbumBadge } from '@/hooks/useAlbumBadge'

// ─── Drill-down views ─────────────────────────────────────────────────────────

type ProfileView =
  | 'root'
  | 'profile'
  | 'notifications'
  | 'appearance'
  | 'badges'
  | 'calendar'
  | 'dateblocks'

type SubView = Exclude<ProfileView, 'root'>

const SUBVIEWS: Record<SubView, { title: string; render: () => ReactNode }> = {
  profile: { title: 'Profil-Infos', render: () => <ProfileSection /> },
  notifications: { title: 'Benachrichtigungen', render: () => <NotificationPreferencesSection /> },
  appearance: { title: 'Darstellung', render: () => <AppearanceSection /> },
  badges: { title: 'Meine Badges', render: () => <BadgeSection /> },
  calendar: { title: 'Google Kalender', render: () => <CalendarConnectionSection /> },
  dateblocks: { title: 'Blockierte Zeiträume', render: () => <DateBlocksSection /> },
}

const ACCOUNT_ROWS: { view: SubView; label: string }[] = [
  { view: 'profile', label: 'Profil-Infos' },
  { view: 'notifications', label: 'Benachrichtigungen' },
  { view: 'appearance', label: 'Darstellung' },
  { view: 'badges', label: 'Meine Badges' },
]

const CONNECTION_ROWS: { view: SubView; label: string }[] = [
  { view: 'calendar', label: 'Google Kalender' },
  { view: 'dateblocks', label: 'Blockierte Zeiträume' },
]

interface ProfileSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When opened via the email "Benachrichtigungen verwalten" deep-link, jump
      straight to the notification settings sub-view. */
  scrollToNotifications?: boolean
}

export function ProfileSheet({ open, onOpenChange, scrollToNotifications }: ProfileSheetProps) {
  const { signOut, profile, user } = useAuth()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [view, setView] = useState<ProfileView>('root')

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

  // Pro Sheet-Öffnung frisch starten. Der E-Mail-Deep-Link (BUG-12-1) springt
  // direkt in die Benachrichtigungs-Unterseite.
  useEffect(() => {
    if (open) {
      setTab('profil')
      setView(scrollToNotifications ? 'notifications' : 'root')
      setAlbumVisited(false)
      setAlbumSeenSnapshot(null)
    }
  }, [open, scrollToNotifications])

  async function handleLogout() {
    setLogoutDialogOpen(false)
    await signOut()
  }

  const subview = view !== 'root' ? SUBVIEWS[view] : null
  const initials = getInitials(profile?.display_name)

  return (
    <>
      <ResponsiveModal open={open} onOpenChange={onOpenChange}>
        <ResponsiveModalContent
          size="md"
          className="h-[90dvh] md:h-auto md:min-h-[70vh] bg-bg border-line p-0 rounded-t-[30px]"
        >
          <ResponsiveModalHeader className="px-5 pt-5 pb-0 flex-shrink-0">
            {subview ? (
              <div className="flex items-center gap-1.5 -ml-2">
                <button
                  onClick={() => setView('root')}
                  className="h-8 w-8 flex items-center justify-center rounded-[8px] text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
                  aria-label="Zurück"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <ResponsiveModalTitle className="text-[18px] font-[800] text-ink text-left">
                  {subview.title}
                </ResponsiveModalTitle>
              </div>
            ) : (
              <ResponsiveModalTitle className="text-[18px] font-[800] text-ink text-left">
                Mein Konto
              </ResponsiveModalTitle>
            )}
            <ResponsiveModalDescription className="sr-only">
              Profil, Darstellung, Kalender, Verfügbarkeit und Album verwalten.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>

          {subview ? (
            /* ── Sub-view (drill-down) ── */
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="px-5 pt-4 pb-8">{subview.render()}</div>
            </div>
          ) : (
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

              {/* Profil Tab — grouped settings list */}
              <TabsContent value="profil" className="flex-1 overflow-y-auto mt-0">
                <div className="px-5 pt-5 pb-8 space-y-6">
                  {/* Identity header */}
                  <div className="flex items-center gap-4 px-1">
                    <Avatar className="h-14 w-14 flex-shrink-0">
                      {profile?.avatar_url && (
                        <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                      )}
                      <AvatarFallback className="bg-primary text-white text-lg font-[800]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-[20px] font-[500] text-ink truncate">
                        {profile?.display_name ?? ''}
                      </p>
                      {user?.email && (
                        <p className="text-[12.5px] text-ink-3 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Konto */}
                  <SettingsGroup label="Konto">
                    {ACCOUNT_ROWS.map(({ view: v, label }) => (
                      <SettingsRow key={v} label={label} onClick={() => setView(v)} />
                    ))}
                  </SettingsGroup>

                  {/* Verbindungen */}
                  <SettingsGroup label="Verbindungen">
                    {CONNECTION_ROWS.map(({ view: v, label }) => (
                      <SettingsRow key={v} label={label} onClick={() => setView(v)} />
                    ))}
                  </SettingsGroup>

                  {/* Logout */}
                  <div className="rounded-[16px] border border-line bg-surface overflow-hidden">
                    <button
                      onClick={() => setLogoutDialogOpen(true)}
                      className="w-full flex items-center px-4 min-h-[52px] text-[15px] font-[600] text-error hover:bg-error-soft transition-colors"
                    >
                      Ausloggen
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Album Tab (PROJ-17, ehemals Archiv) */}
              <TabsContent value="album" className="flex-1 overflow-y-auto mt-0">
                <AlbumTab lastSeenAt={albumSeenSnapshot} />
              </TabsContent>
            </Tabs>
          )}
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

// ─── Settings list building blocks ────────────────────────────────────────────

function SettingsGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-1 text-[12px] font-[600] tracking-[0.06em] text-ink-3">{label}</p>
      <div className="rounded-[16px] border border-line bg-surface overflow-hidden divide-y divide-line">
        {children}
      </div>
    </div>
  )
}

function SettingsRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 px-4 min-h-[52px] text-left hover:bg-surface-2 transition-colors"
    >
      <span className="text-[15px] font-[600] text-ink">{label}</span>
      <ChevronRight className="h-4 w-4 flex-shrink-0 text-ink-3" />
    </button>
  )
}

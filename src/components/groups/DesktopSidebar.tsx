'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  CalendarDays,
  Columns3,
  Home,
  List,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { groupHref } from '@/lib/group-routes'
import type { GroupTab } from '@/lib/group-routes'
import type { BottomNavActive } from '@/components/groups/GroupBottomNav'

interface DesktopSidebarProps {
  /** Aktiver Eintrag: `home` = Gruppenliste, sonst der Gruppen-Tab. */
  active: BottomNavActive
  /** Gruppe, auf die Vorschläge/Board/Termine zeigen (null = deaktiviert). */
  targetGroupId: string | null
  onProfile: () => void
}

function SidebarLink({
  href,
  icon: Icon,
  label,
  active,
  disabled,
}: {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
  disabled?: boolean
}) {
  const base =
    'flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm transition-colors'
  if (disabled) {
    return (
      <span className={`${base} font-semibold text-ink-3 opacity-40`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        {label}
      </span>
    )
  }
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`${base} ${
        active
          ? 'bg-primary-soft font-bold text-primary'
          : 'font-semibold text-ink-2 hover:bg-surface-2 hover:text-ink'
      }`}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  )
}

/**
 * Desktop-Sidebar (Mellon-Redesign): ersetzt die oberen Gruppen-Tabs auf md+.
 * Logo oben, Gruppen-Kontext, Hauptnavigation, User-Card unten (öffnet das
 * Profil-Sheet). Mobil übernimmt weiterhin die GroupBottomNav.
 */
export function DesktopSidebar({
  active,
  targetGroupId,
  onProfile,
}: DesktopSidebarProps) {
  const { user } = useAuth()
  const tabsDisabled = !targetGroupId
  const displayName =
    (user?.user_metadata?.display_name as string | undefined) ??
    user?.email ??
    'Du'
  const tab = (seg: GroupTab) => (targetGroupId ? groupHref(targetGroupId, seg) : '#')

  return (
    <aside className="hidden md:flex h-full w-[248px] flex-none flex-col bg-surface border-r border-line p-4">
      <Link href="/groups" className="px-2 pt-2 pb-5">
        <Image
          src="/logo-wordmark.png"
          alt="Mellon"
          width={1558}
          height={421}
          className="h-7 w-auto dark:invert"
          priority
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        <SidebarLink href="/groups" icon={Home} label="Home" active={active === 'home'} />
        <SidebarLink
          href={tab('vorschlaege')}
          icon={List}
          label="Vorschläge"
          active={active === 'vorschlaege'}
          disabled={tabsDisabled}
        />
        <SidebarLink
          href={tab('planung')}
          icon={Columns3}
          label="Board"
          active={active === 'planung'}
          disabled={tabsDisabled}
        />
        <SidebarLink
          href={tab('termine')}
          icon={CalendarDays}
          label="Termine"
          active={active === 'termine'}
          disabled={tabsDisabled}
        />
      </nav>

      <button
        onClick={onProfile}
        className="flex items-center gap-3 border-t border-line pt-4 mt-4 px-2 text-left
                   transition-colors hover:opacity-80"
      >
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-accent-soft">
          <User className="h-[18px] w-[18px] text-secondary" strokeWidth={2.2} />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] font-bold text-ink">{displayName}</span>
          <span className="block text-[11.5px] font-medium text-ink-3">Profil & Archiv</span>
        </span>
      </button>
    </aside>
  )
}

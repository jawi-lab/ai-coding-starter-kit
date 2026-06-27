'use client'

import Link from 'next/link'
import { CalendarDays, Columns3, List, Plus, User, type LucideIcon } from 'lucide-react'
import { groupHref } from '@/lib/group-routes'
import type { GroupTab } from '@/lib/group-routes'

interface GroupBottomNavProps {
  groupId: string
  activeSeg: GroupTab
  canCreate: boolean
  onCreate: () => void
  onProfile: () => void
}

/**
 * Native-feeling bottom navigation for the group view (PROJ-9). Mobile only —
 * the desktop layout keeps the top tab bar (`md:hidden` here / `hidden md:flex`
 * there), so a screen never shows both. Five slots:
 *
 *   Übersicht · Board · ( + ) · Termine · Profil
 *
 * The centre `+` is the single "neuer Vorschlag" entry point on mobile (the
 * per-tab FAB is hidden on mobile), Profil opens the account sheet, and Übersicht/
 * Board/Termine switch the group tab via soft navigation (next/link).
 */
function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string
  icon: LucideIcon
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      replace
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-colors
        ${active ? 'text-primary' : 'text-ink-3 hover:text-ink-2'}`}
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
      <span className={`text-[10.5px] leading-none ${active ? 'font-[800]' : 'font-[600]'}`}>
        {label}
      </span>
    </Link>
  )
}

function NavButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-ink-3 hover:text-ink-2 transition-colors"
    >
      <Icon className="h-[22px] w-[22px]" strokeWidth={2} />
      <span className="text-[10.5px] leading-none font-[600]">{label}</span>
    </button>
  )
}

export function GroupBottomNav({
  groupId,
  activeSeg,
  canCreate,
  onCreate,
  onProfile,
}: GroupBottomNavProps) {
  return (
    <nav className="md:hidden flex-shrink-0 bg-surface border-t border-line pb-safe">
      <div className="max-w-md mx-auto w-full h-16 px-1 flex items-stretch">
        <NavLink
          href={groupHref(groupId, 'vorschlaege')}
          icon={List}
          label="Übersicht"
          active={activeSeg === 'vorschlaege'}
        />
        <NavLink
          href={groupHref(groupId, 'planung')}
          icon={Columns3}
          label="Board"
          active={activeSeg === 'planung'}
        />

        {/* Zentraler „neuer Vorschlag"-Button — schwebt über der Leiste */}
        <div className="flex-1 flex items-start justify-center">
          <button
            onClick={onCreate}
            disabled={!canCreate}
            aria-label="Neuer Vorschlag"
            className="-mt-5 h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center
                       border border-primary-600 ring-4 ring-surface shadow-lg
                       active:scale-95 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="h-7 w-7" strokeWidth={2.5} />
          </button>
        </div>

        <NavLink
          href={groupHref(groupId, 'termine')}
          icon={CalendarDays}
          label="Termine"
          active={activeSeg === 'termine'}
        />
        <NavButton icon={User} label="Profil" onClick={onProfile} />
      </div>
    </nav>
  )
}

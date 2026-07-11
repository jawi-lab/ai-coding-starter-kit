'use client'

import Link from 'next/link'
import { CalendarDays, Columns3, Home, List, User, type LucideIcon } from 'lucide-react'
import { groupHref } from '@/lib/group-routes'
import type { GroupTab } from '@/lib/group-routes'

export type BottomNavActive = 'home' | GroupTab

interface GroupBottomNavProps {
  /** Which item is highlighted. `home` = Gruppenliste, sonst der aktive Gruppen-Tab. */
  active: BottomNavActive
  /**
   * Gruppe, auf die die Tabs (Vorschläge/Board/Termine) zeigen. Innerhalb einer
   * Gruppe ist das die aktuelle Gruppe; auf Home die zuletzt geöffnete (bzw.
   * erste) Gruppe. Ist keine Gruppe verfügbar, sind die Tabs deaktiviert.
   */
  targetGroupId: string | null
  onProfile: () => void
}

/**
 * Persistente Bottom-Navigation der App (PROJ-9). Mobil/nativ sichtbar
 * (`md:hidden`) — Desktop nutzt die oberen Tabs. Fünf Slots, ohne schwebenden
 * FAB (der "neuer Vorschlag"-+ sitzt jetzt in der Top-Bar der Vorschläge-Seite):
 *
 *   Home · Vorschläge · Board · Termine · Profil
 *
 * Home führt zur Gruppenliste (`/groups`), die Gruppen-Tabs navigieren in die
 * Zielgruppe, Profil öffnet das Konto-Sheet.
 */
function NavLink({
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
  const inner = (
    <>
      <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.4 : 2} />
      <span className={`text-[10.5px] leading-none ${active ? 'font-[800]' : 'font-[600]'}`}>
        {label}
      </span>
    </>
  )

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="flex flex-1 flex-col items-center justify-center gap-1 h-full text-ink-3 opacity-40 pointer-events-none"
      >
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={href}
      replace
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-colors
        ${active ? 'text-primary' : 'text-ink-3 hover:text-ink-2'}`}
    >
      {inner}
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

export function GroupBottomNav({ active, targetGroupId, onProfile }: GroupBottomNavProps) {
  const tabsDisabled = !targetGroupId
  return (
    <nav className="md:hidden flex-shrink-0 bg-surface border-t border-line pb-safe">
      <div className="max-w-md mx-auto w-full h-16 px-1 flex items-stretch">
        <NavLink
          href="/groups"
          icon={Home}
          label="Home"
          active={active === 'home'}
        />
        <NavLink
          href={targetGroupId ? groupHref(targetGroupId, 'vorschlaege') : '#'}
          icon={List}
          label="Vorschläge"
          active={active === 'vorschlaege'}
          disabled={tabsDisabled}
        />
        <NavLink
          href={targetGroupId ? groupHref(targetGroupId, 'planung') : '#'}
          icon={Columns3}
          label="Board"
          active={active === 'planung'}
          disabled={tabsDisabled}
        />
        <NavLink
          href={targetGroupId ? groupHref(targetGroupId, 'termine') : '#'}
          icon={CalendarDays}
          label="Termine"
          active={active === 'termine'}
          disabled={tabsDisabled}
        />
        <NavButton icon={User} label="Profil" onClick={onProfile} />
      </div>
    </nav>
  )
}

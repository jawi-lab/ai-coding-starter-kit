'use client'

import { createContext, useContext } from 'react'
import type { Group, GroupRole } from '@/lib/group-types'
import type { GroupMomentum } from '@/hooks/useGroupMomentum'
import type { RevealActivity } from '@/components/memory/MemoryCardReveal'

export interface GroupShell {
  groupId: string
  group: Group | null
  myRole: GroupRole | null
  isAdmin: boolean
  canCreate: boolean
  memberCount: number
  loading: boolean
  /**
   * Gruppen-Momentum (PROJ-15) — vom Layout einmal via useGroupMomentum
   * geladen (eine Realtime-Subscription für Banner UND Feier). `null` solange
   * die Akte lädt oder noch nicht existiert → Banner blendet sich still aus.
   */
  momentum: GroupMomentum | null
  /** Open the shared activity detail sheet (rendered once in the group layout). */
  openActivityDetail: (activityId: string) => void
  /** Re-fetch the group + member data held by the layout. */
  refetchGroup: () => void
  /**
   * Open the shared "neuer Vorschlag" sheet (rendered once in the group layout).
   * Used by both the bottom-nav `+` (any tab) and the desktop FAB, so there is
   * only ever one create entry point per screen. Navigates to the Übersicht tab.
   */
  openCreateProposal: () => void
  /**
   * The Übersicht tab registers its proposals refetch here so the lifted create
   * sheet can refresh the list after a successful create. Pass `null` to clear.
   */
  registerProposalsRefetch: (fn: (() => void) | null) => void
  /**
   * Karten-Reveal (PROJ-17): zeigt dem Abschließenden direkt nach dem
   * Statuswechsel auf `abgeschlossen` die neue Memory Card als Vollbild-Flip.
   * Auf Shell-Ebene gerendert und hinter der PROJ-15-Feier eingereiht.
   */
  showCardReveal: (activity: RevealActivity) => void
  /**
   * Mellon Rückblick (PROJ-18): öffnet den Vollbild-Story-Viewer für ein Jahr.
   * Auf Shell-Ebene gerendert (z-[70]) — aufgerufen vom Teaser-Banner
   * (laufendes Jahr) und aus dem Rückblick-Archiv (beliebiges Jahr).
   */
  openWrapped: (year: number) => void
}

const GroupShellCtx = createContext<GroupShell | null>(null)

export const GroupShellProvider = GroupShellCtx.Provider

export function useGroupShell(): GroupShell {
  const value = useContext(GroupShellCtx)
  if (!value) {
    throw new Error('useGroupShell must be used within a group layout')
  }
  return value
}

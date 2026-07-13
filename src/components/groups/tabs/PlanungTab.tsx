'use client'

import { KanbanBoard } from '@/components/groups/KanbanBoard'
import { useAuth } from '@/contexts/AuthContext'
import { useGroupShell } from '@/components/groups/GroupShellContext'

export function PlanungTab() {
  const { user } = useAuth()
  const { groupId, isAdmin, openActivityDetail } = useGroupShell()

  return (
    <div className="flex-1 min-h-0">
      {/* Mobil randlos, damit die Kategorie-Chips + Trennlinie wie auf
          „Vorschläge" über die volle Breite gehen. Desktop behält Padding. */}
      <div className="max-w-5xl mx-auto w-full h-full md:px-4 md:py-4">
        <KanbanBoard
          groupId={groupId}
          currentUserId={user?.id ?? ''}
          isAdmin={isAdmin}
          onOpenDetail={(a) => openActivityDetail(a.id)}
        />
      </div>
    </div>
  )
}

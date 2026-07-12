'use client'

import { useState } from 'react'
import { CreateGroupForm } from '@/components/groups/CreateGroupForm'
import { JoinGroupForm } from '@/components/groups/JoinGroupForm'
import { Users, KeyRound, ArrowRight } from 'lucide-react'

type Panel = 'choose' | 'create' | 'join'

interface GroupStepProps {
  onSuccess: (groupId: string) => void
}

export function GroupStep({ onSuccess }: GroupStepProps) {
  const [panel, setPanel] = useState<Panel>('choose')

  return (
    <div className="flex flex-1 flex-col">
      <div className="text-center">
        <h1 className="text-[28px] font-extrabold text-ink">
          {panel === 'choose'
            ? 'Wie möchtest du starten?'
            : panel === 'create'
            ? 'Neue Gruppe'
            : 'Gruppe beitreten'}
        </h1>
        <p className="mt-1.5 text-[15px] text-ink-2">
          {panel === 'choose'
            ? 'Erstelle eine Gruppe oder tritt einer bestehenden bei.'
            : panel === 'create'
            ? 'Wähle einen Namen für deine Gruppe.'
            : 'Gib den Code ein, den du von der Gruppe erhalten hast.'}
        </p>
      </div>

      <div className="mt-8 flex-1">
        {panel === 'choose' && (
          <div className="space-y-3">
            <button
              onClick={() => setPanel('create')}
              className="group flex w-full items-center gap-4 rounded-lg border border-line bg-surface p-5 text-left transition-all duration-150 hover:border-primary hover:shadow-md active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-pill bg-primary-soft transition-colors group-hover:bg-primary">
                <Users className="h-5 w-5 text-primary transition-colors group-hover:text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-[800] text-ink">Gruppe gründen</p>
                <p className="mt-0.5 text-[13px] text-ink-2">
                  Starte eine neue Gruppe und lade Freunde ein
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-3" />
            </button>

            <button
              onClick={() => setPanel('join')}
              className="group flex w-full items-center gap-4 rounded-lg border border-line bg-surface p-5 text-left transition-all duration-150 hover:border-secondary hover:shadow-md active:scale-[0.98]"
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-pill bg-secondary-soft transition-colors group-hover:bg-secondary">
                <KeyRound className="h-5 w-5 text-secondary transition-colors group-hover:text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-[800] text-ink">Code eingeben</p>
                <p className="mt-0.5 text-[13px] text-ink-2">
                  Tritt mit einem Einladungs-Code bei
                </p>
              </div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-ink-3" />
            </button>
          </div>
        )}

        {panel === 'create' && (
          <div className="rounded-lg border border-line bg-surface p-6">
            <CreateGroupForm onSuccess={onSuccess} />
          </div>
        )}

        {panel === 'join' && (
          <div className="rounded-lg border border-line bg-surface p-6">
            <JoinGroupForm onSuccess={onSuccess} />
          </div>
        )}
      </div>

      {panel !== 'choose' && (
        <button
          onClick={() => setPanel('choose')}
          className="w-full py-2 text-center text-[13px] text-ink-3 transition-colors hover:text-ink-2"
        >
          ← Zurück zur Auswahl
        </button>
      )}
    </div>
  )
}

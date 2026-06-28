'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowRight, Bell, ThumbsUp, CalendarCheck, AtSign } from 'lucide-react'
import { requestPushPermission } from '@/lib/native/push'

interface PushStepProps {
  onNext: () => void
  onSkip: () => void
}

const BENEFITS = [
  { icon: ThumbsUp, text: 'Neue Vorschläge zum Abstimmen' },
  { icon: CalendarCheck, text: 'Bestätigte Termine zum Freihalten' },
  { icon: AtSign, text: 'Wenn dich jemand erwähnt oder dir etwas zuweist' },
] as const

/**
 * Onboarding soft-ask for push permission (PROJ-10). Explains the value *before*
 * the hard OS dialog — this protects the one-shot iOS system prompt and improves
 * opt-in. "Erlauben" triggers the OS dialog and registers the token; "Später"
 * skips. Either way the flow continues (push can be enabled later in the profile).
 */
export function PushStep({ onNext, onSkip }: PushStepProps) {
  const [requesting, setRequesting] = useState(false)

  async function handleAllow() {
    setRequesting(true)
    // The OS dialog outcome doesn't change where we go next — granted or denied,
    // onboarding continues. A denial can be retried later from the profile.
    await requestPushPermission()
    setRequesting(false)
    onNext()
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        <div className="mt-4 flex justify-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-[24px] bg-primary-soft">
            <Bell className="h-9 w-9 text-primary" />
          </span>
        </div>

        <div className="mt-6 text-center">
          <h1 className="text-[28px] font-[900] text-ink">Bleib auf dem Laufenden</h1>
          <p className="mt-1.5 text-[15px] text-ink-2">
            Wir benachrichtigen dich nur bei dem, was in deinen Gruppen wirklich
            zählt.
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {BENEFITS.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-[14px] bg-surface-2 px-3.5 py-3"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-pill bg-surface text-primary">
                <Icon className="h-4.5 w-4.5" />
              </span>
              <span className="text-[14px] leading-snug text-ink-2">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleAllow}
          disabled={requesting}
          className="h-12 w-full rounded-[14px] bg-primary text-[15px] font-[700] text-white hover:bg-primary-600"
        >
          {requesting ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Benachrichtigungen erlauben
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <button
          onClick={onSkip}
          className="w-full py-2 text-center text-[13px] text-ink-3 transition-colors hover:text-ink-2"
        >
          Später
        </button>
      </div>
    </div>
  )
}

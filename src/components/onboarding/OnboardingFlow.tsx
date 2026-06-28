'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useProfile } from '@/hooks/useProfile'
import { isNativePlatform } from '@/lib/native/platform'
import { WelcomeStep } from './WelcomeStep'
import { ProfileStep } from './ProfileStep'
import { PushStep } from './PushStep'
import { GroupStep } from './GroupStep'

type Step = 'welcome' | 'profile' | 'push' | 'group'

interface OnboardingFlowProps {
  onComplete?: (groupId: string) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { profile, signOut } = useAuth()
  const { markOnboarded } = useProfile()

  // First login → full intro (welcome + profile + push + group). A returning user
  // who already finished onboarding but currently has no group (e.g. left their
  // last one) only needs the group step. The push soft-ask (PROJ-10) only appears
  // on native, where push exists — on the web it is omitted entirely.
  const isFirstLogin = profile ? !profile.onboarded : true
  const steps: Step[] = isFirstLogin
    ? isNativePlatform()
      ? ['welcome', 'profile', 'push', 'group']
      : ['welcome', 'profile', 'group']
    : ['group']

  const [index, setIndex] = useState(0)
  const step = steps[index]

  const next = () => setIndex(i => Math.min(i + 1, steps.length - 1))
  const back = () => setIndex(i => Math.max(i - 1, 0))

  async function handleGroupReady(groupId: string) {
    if (isFirstLogin) await markOnboarded()
    onComplete?.(groupId)
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Top bar: back arrow + progress dots */}
      <header className="flex items-center justify-between px-5 pt-safe">
        <div className="flex h-14 w-full items-center justify-between">
          {index > 0 ? (
            <button
              onClick={back}
              className="-ml-2 flex h-10 w-10 items-center justify-center rounded-pill text-ink-2 transition-colors hover:bg-surface-2"
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <span className="text-[13px] font-[800] uppercase tracking-[0.14em] text-primary">
              Zusammen
            </span>
          )}

          {steps.length > 1 && (
            <div className="flex items-center gap-1.5" aria-hidden>
              {steps.map((s, i) => (
                <span
                  key={s}
                  className={`h-1.5 rounded-pill transition-all ${
                    i === index ? 'w-5 bg-primary' : 'w-1.5 bg-line'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Step content */}
      <main className="flex flex-1 flex-col px-5 pb-8 pt-2">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          {step === 'welcome' && <WelcomeStep onNext={next} />}
          {step === 'profile' && <ProfileStep onNext={next} onSkip={next} />}
          {step === 'push' && <PushStep onNext={next} onSkip={next} />}
          {step === 'group' && <GroupStep onSuccess={handleGroupReady} />}

          <button
            onClick={signOut}
            className="mt-6 w-full py-1 text-center text-[12px] text-ink-3 transition-colors hover:text-ink-2 pb-safe"
          >
            Abmelden
          </button>
        </div>
      </main>
    </div>
  )
}

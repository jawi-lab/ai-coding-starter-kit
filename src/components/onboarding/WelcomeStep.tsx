'use client'

import { Button } from '@/components/ui/button'
import { ArrowRight, CalendarHeart, ThumbsUp } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

// A small, on-brand illustration built from the design tokens instead of a
// bitmap asset: a tilted "polaroid" card holding a cluster of friend avatars,
// with a couple of floating accents to hint at voting + planning.
function FriendsIllustration() {
  const friends = [
    { initials: 'A', className: 'bg-primary text-white' },
    { initials: 'B', className: 'bg-secondary text-white' },
    { initials: 'C', className: 'bg-[#DC973A] text-white' },
    { initials: 'M', className: 'bg-primary-soft text-primary' },
  ]

  return (
    <div className="relative mx-auto mb-12 h-52 w-60">
      <div className="absolute inset-0 rotate-[-4deg] rounded-[24px] bg-primary-soft" />
      <div className="absolute inset-0 flex items-center justify-center rotate-[3deg] rounded-[24px] border border-line bg-surface shadow-[0_12px_28px_-12px_rgba(27,23,20,0.25)]">
        <div className="flex -space-x-4">
          {friends.map(f => (
            <span
              key={f.initials}
              className={`flex h-14 w-14 items-center justify-center rounded-pill border-[3px] border-surface text-[18px] font-[800] ${f.className}`}
            >
              {f.initials}
            </span>
          ))}
        </div>
      </div>

      {/* Floating accents */}
      <span className="absolute -right-3 -top-3 flex h-11 w-11 rotate-[8deg] items-center justify-center rounded-pill bg-secondary text-white shadow-md">
        <ThumbsUp className="h-5 w-5" />
      </span>
      <span className="absolute -bottom-4 -left-3 flex h-11 w-11 rotate-[-6deg] items-center justify-center rounded-pill bg-[#DC973A] text-white shadow-md">
        <CalendarHeart className="h-5 w-5" />
      </span>
      <span className="absolute -bottom-2 right-6 inline-flex rotate-[-4deg] items-center rounded-pill border border-line bg-surface px-3 py-1 text-[11px] font-[800] uppercase tracking-[0.12em] text-ink-2 shadow-sm">
        Gemeinsam
      </span>
    </div>
  )
}

export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <FriendsIllustration />
        <h1 className="text-[32px] font-[900] leading-[1.1] text-ink">
          Willkommen bei
          <br />
          <span className="text-primary">ZUSAMMEN</span>
        </h1>
        <p className="mt-3 max-w-[18rem] text-[15px] leading-relaxed text-ink-2">
          Plane gemeinsame Erlebnisse mit deinen Freunden — einfach und
          demokratisch.
        </p>
      </div>

      <Button
        onClick={onNext}
        className="h-12 w-full rounded-[14px] bg-primary text-[15px] font-[700] text-white hover:bg-primary-600"
      >
        Los geht&apos;s
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

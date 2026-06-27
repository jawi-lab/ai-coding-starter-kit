'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { useRouter } from 'next/navigation'

function OnboardingContent() {
  const router = useRouter()

  function handleComplete(groupId: string) {
    router.push(`/groups?group=${groupId}`)
  }

  return <OnboardingFlow onComplete={handleComplete} />
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  )
}

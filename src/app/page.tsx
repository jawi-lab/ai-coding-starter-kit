'use client'

import { AuthGuard } from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

function HomeContent() {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-3">
        <span className="text-3xl font-black uppercase tracking-[0.2em] text-foreground">
          ZUSAMMEN
        </span>
        <p className="text-muted-foreground">
          Hallo, {profile?.display_name ?? 'du'}! Weitere Features folgen bald.
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  )
}

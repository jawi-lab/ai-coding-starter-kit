'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          subscription.unsubscribe()
          window.location.href = '/reset-password'
          return
        }

        if (event === 'SIGNED_IN' && session) {
          // Mark profile as active after email verification
          await supabase
            .from('profiles')
            .update({ status: 'active' })
            .eq('id', session.user.id)

          subscription.unsubscribe()
          window.location.href = '/'
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div
        className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Wird verarbeitet…"
      />
    </div>
  )
}

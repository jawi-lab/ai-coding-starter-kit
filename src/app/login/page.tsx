'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Messages for a failed/cancelled native auth deep link (PROJ-9). The native
// listener redirects to `/login/?auth_error=<kind>` when exchangeCodeForSession
// fails, so the user lands back on the login screen with a clear explanation.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  expired: 'Der Login-Link ist abgelaufen. Bitte fordere einen neuen an.',
  used: 'Der Login wurde abgebrochen. Bitte versuche es erneut.',
  generic: 'Der Login konnte nicht abgeschlossen werden. Bitte versuche es erneut.',
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/'
    }
  }, [user, loading])

  useEffect(() => {
    const kind = new URLSearchParams(window.location.search).get('auth_error')
    if (kind) setAuthError(AUTH_ERROR_MESSAGES[kind] ?? AUTH_ERROR_MESSAGES.generic)
  }, [])

  if (loading || user) return null

  return (
    <AuthLayout
      title="Willkommen zurück"
      subtitle="Logge dich mit deiner E-Mail-Adresse ein."
      footer={
        <>
          Noch kein Konto?{' '}
          <Link href="/signup" className="font-semibold text-primary hover:underline">
            Registrieren
          </Link>
        </>
      }
    >
      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      )}
      <LoginForm />
    </AuthLayout>
  )
}

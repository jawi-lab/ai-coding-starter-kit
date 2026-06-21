'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle } from 'lucide-react'

type PageState = 'loading' | 'error'
type ErrorKind = 'expired' | 'used' | 'network' | 'generic'

const ERROR_MESSAGES: Record<ErrorKind, { title: string; body: string }> = {
  expired: {
    title: 'Link abgelaufen',
    body: 'Dieser Bestätigungs-Link ist nicht mehr gültig (24 Stunden überschritten). Fordere einen neuen Link an.',
  },
  used: {
    title: 'Account bereits bestätigt',
    body: 'Dein Account wurde bereits aktiviert. Du kannst dich jetzt einloggen.',
  },
  network: {
    title: 'Verbindungsfehler',
    body: 'Die Bestätigung war erfolgreich, aber ein Netzwerkfehler ist aufgetreten. Bitte logge dich ein — dein Account sollte aktiv sein.',
  },
  generic: {
    title: 'Bestätigung fehlgeschlagen',
    body: 'Der Link ist ungültig oder ein Fehler ist aufgetreten. Bitte fordere einen neuen Bestätigungs-Link an.',
  },
}

function parseUrlError(): ErrorKind | null {
  // Supabase sends errors in the hash fragment for PKCE flow
  const hash = typeof window !== 'undefined' ? window.location.hash.substring(1) : ''
  const search = typeof window !== 'undefined' ? window.location.search.substring(1) : ''
  const hashParams = new URLSearchParams(hash)
  const searchParams = new URLSearchParams(search)

  const error = hashParams.get('error') ?? searchParams.get('error')
  const errorCode = hashParams.get('error_code') ?? searchParams.get('error_code')

  if (!error) return null

  if (errorCode === 'otp_expired') return 'expired'
  if (error === 'access_denied') return 'used'
  return 'generic'
}

export default function AuthCallbackPage() {
  const [state, setState] = useState<PageState>('loading')
  const [errorKind, setErrorKind] = useState<ErrorKind>('generic')

  useEffect(() => {
    // Check for Supabase error parameters in URL (expired / already-used links)
    const urlError = parseUrlError()
    if (urlError) {
      setErrorKind(urlError)
      setState('error')
      return
    }

    // Timeout: if no auth event fires within 10 seconds, the link is likely invalid
    const timeout = setTimeout(() => {
      setErrorKind('generic')
      setState('error')
    }, 10_000)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        clearTimeout(timeout)
        subscription.unsubscribe()
        window.location.href = '/reset-password'
        return
      }

      if (event === 'SIGNED_IN' && session) {
        const { error } = await supabase
          .from('profiles')
          .update({ status: 'active' })
          .eq('id', session.user.id)

        clearTimeout(timeout)
        subscription.unsubscribe()

        if (error) {
          // BUG-03: profile update failed — show error instead of silent redirect
          setErrorKind('network')
          setState('error')
        } else {
          window.location.href = '/'
        }
      }
    })

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  if (state === 'error') {
    const msg = ERROR_MESSAGES[errorKind]
    const isUsed = errorKind === 'used'
    const isNetwork = errorKind === 'network'

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center space-y-6">
          {isUsed ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          ) : (
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          )}
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">{msg.title}</h1>
            <p className="text-sm text-muted-foreground">{msg.body}</p>
          </div>
          <div className="flex flex-col gap-3">
            {!isUsed && !isNetwork && (
              <Button asChild>
                <a href="/signup/pending">Neuen Link anfordern</a>
              </Button>
            )}
            <Button variant={isUsed || isNetwork ? 'default' : 'outline'} asChild>
              <a href="/login">Zum Login</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

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

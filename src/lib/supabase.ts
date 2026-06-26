import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Inside the native Capacitor shell (PROJ-9) the auth session is persisted via
// @capacitor/preferences instead of WebView localStorage, which is more reliable
// across app resume / cold start. The URL is never auto-scanned natively
// (detectSessionInUrl: false) — the deep-link listener exchanges the PKCE code
// explicitly (see src/lib/native/deep-link.ts).
const isNative = Capacitor.isNativePlatform()

const nativeAuthStorage = {
  getItem: (key: string) => Preferences.get({ key }).then(({ value }) => value),
  setItem: (key: string, value: string) =>
    Preferences.set({ key, value }).then(() => undefined),
  removeItem: (key: string) => Preferences.remove({ key }).then(() => undefined),
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow: auth links arrive as `?code=…` and are exchanged via
    // exchangeCodeForSession(). Required for the native Capacitor deep-link
    // redirect (com.zusammen.app://auth/callback) — see PROJ-9 — and more
    // secure than the implicit (hash-token) flow on the web as well.
    flowType: 'pkce',
    ...(isNative
      ? { storage: nativeAuthStorage, detectSessionInUrl: false }
      : {}),
  },
})

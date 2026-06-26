import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL')
if (!supabaseAnonKey) throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_ANON_KEY')

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // PKCE flow: auth links arrive as `?code=…` and are exchanged via
    // exchangeCodeForSession(). Required for the native Capacitor deep-link
    // redirect (com.zusammen.app://auth/callback) — see PROJ-9 — and more
    // secure than the implicit (hash-token) flow on the web as well.
    flowType: 'pkce',
  },
})

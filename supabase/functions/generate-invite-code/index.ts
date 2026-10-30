// Stillgelegt (Security audit run-1, Fall 3): Die Funktion hat den Aufrufer nicht
// geprüft. Codes erneuert jetzt die RPC regenerate_invite_code mit Admin-Check.
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(JSON.stringify({ error: 'Diese Funktion wurde stillgelegt' }), {
    status: 410,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

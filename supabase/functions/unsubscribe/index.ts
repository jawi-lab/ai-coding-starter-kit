// PROJ-12 unsubscribe — the login-free target of the email `List-Unsubscribe` header.
//
// Deliverability for opt-in transactional mail (Gmail/Apple Mail) effectively requires a
// one-click, no-login unsubscribe. The visible "Benachrichtigungen verwalten" link in the
// email body goes into the app for granular control; THIS endpoint is the header target
// that flips every email switch for one user off — nothing else.
//
// Auth model: no JWT (verify_jwt is disabled at deploy). Authority comes solely from the
// signed token = HMAC-SHA256(user_id) with UNSUBSCRIBE_SIGNING_SECRET. Without a valid
// token the request is rejected; with one it can only disable email for that user.
//
//   GET  ?uid=&token=  → verify, disable email, return a German HTML confirmation page.
//   POST ?uid=&token=  → the RFC 8058 one-click path mail clients call; verify, disable,
//                        return 200 (no body needed).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { verifyUserId } from '../_shared/unsubscribe.ts';

const NOTIFICATION_EVENTS = [
  'new_proposal',
  'now_planning',
  'date_set',
  'mention',
  'responsibility',
] as const;

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Benachrichtigungen</title></head><body style="margin:0;padding:48px 24px;background:#faf6f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;text-align:center;">${body}</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
}

const confirmationPage = html(
  `<div style="max-width:420px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;">
    <h1 style="font-size:20px;margin:0 0 12px;">Abgemeldet ✓</h1>
    <p style="font-size:16px;line-height:1.5;margin:0;">Du erhältst keine E-Mail-Benachrichtigungen mehr. In-App-Benachrichtigungen und Push bleiben unverändert — du kannst alles jederzeit in der App unter „Benachrichtigungen" wieder anpassen.</p>
  </div>`,
);

async function disableEmail(uid: string): Promise<boolean> {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Turn off email on any existing rows. Missing rows already mean "email off"
  // (the default), so no insert is needed — this leaves push untouched.
  const { error: updateError } = await supabase
    .from('notification_preferences')
    .update({ email_enabled: false, updated_at: new Date().toISOString() })
    .eq('user_id', uid);
  if (updateError) {
    console.error(`unsubscribe update failed: ${updateError.message}`);
    return false;
  }

  // Also insert explicit email-off rows for events that had no row yet, so the choice
  // is durable and visible in the settings matrix (push stays at its default: on).
  const existingRes = await supabase
    .from('notification_preferences')
    .select('event')
    .eq('user_id', uid);
  const existing = new Set((existingRes.data ?? []).map((r) => r.event as string));
  const missing = NOTIFICATION_EVENTS.filter((e) => !existing.has(e)).map((event) => ({
    user_id: uid,
    event,
    push_enabled: true,
    email_enabled: false,
  }));
  if (missing.length > 0) {
    await supabase.from('notification_preferences').insert(missing);
  }
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return html('<p>Methode nicht erlaubt.</p>', 405);
  }

  const url = new URL(req.url);
  const uid = url.searchParams.get('uid') ?? '';
  const token = url.searchParams.get('token') ?? '';

  const secret = Deno.env.get('UNSUBSCRIBE_SIGNING_SECRET');
  if (!secret) {
    // Not configured yet — fail closed but explain (no state change possible).
    return html('<p>Abmeldung derzeit nicht verfügbar.</p>', 503);
  }

  if (!(await verifyUserId(uid, token, secret))) {
    return html('<p>Ungültiger oder abgelaufener Abmelde-Link.</p>', 403);
  }

  const ok = await disableEmail(uid);
  if (!ok) {
    return html('<p>Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.</p>', 500);
  }

  // One-click (POST) clients don't render a body; a browser GET shows the page.
  if (req.method === 'POST') {
    return new Response('OK', { status: 200 });
  }
  return confirmationPage;
});

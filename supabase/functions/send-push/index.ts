// PROJ-10 send-push — server-side push delivery (Supabase Edge Function).
//
// Triggered by DB webhooks (see migration 20260628_proj10_push_webhooks.sql) on
// five group events. It classifies the event, resolves the recipients among the
// CURRENT group members (excluding the actor), loads their FCM tokens and sends a
// German push via the FCM v1 HTTP API. Tokens FCM reports as unregistered are
// deleted so future sends don't run into the void.
//
// Auth: this is not a user call, so verify_jwt is disabled at deploy time; we
// instead require the `x-webhook-secret` header to match PUSH_WEBHOOK_SECRET (the
// same value the trigger reads from Vault). FCM credentials come from the
// FCM_SERVICE_ACCOUNT secret (the service-account JSON) and never touch the client.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  buildMessage,
  buildPushTarget,
  classifyEvent,
  resolveRecipients,
  type WebhookPayload,
} from './logic.ts';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
  project_id: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function base64url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return base64url(bin);
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

/** Mints a short-lived OAuth access token for the FCM scope from the service account. */
async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToPkcs8(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${bytesToBase64url(new Uint8Array(sig))}`;

  const resp = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error(`FCM token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

interface FcmResult {
  ok: boolean;
  /** Token rejected as unregistered/invalid → safe to delete. */
  unregistered: boolean;
}

async function sendFcm(
  projectId: string,
  accessToken: string,
  token: string,
  title: string,
  body: string,
  data: Record<string, string>,
): Promise<FcmResult> {
  const resp = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token,
          notification: { title, body },
          data,
          android: { priority: 'HIGH', notification: { sound: 'default' } },
          apns: { payload: { aps: { sound: 'default' } } },
        },
      }),
    },
  );

  if (resp.ok) return { ok: true, unregistered: false };

  let errorCode = '';
  try {
    const err = await resp.json();
    errorCode =
      err?.error?.details?.find(
        (d: { '@type'?: string; errorCode?: string }) =>
          d['@type']?.includes('fcm.v1.FcmError'),
      )?.errorCode ?? err?.error?.status ?? '';
  } catch {
    // ignore parse failure
  }

  // Only delete on signals that unambiguously mean "this token is dead". We do
  // NOT treat INVALID_ARGUMENT as deletable: FCM also returns it for a malformed
  // *message* (a bug on our side), which would otherwise wipe every recipient's
  // valid token in the same send. Such cases are surfaced via the error log below.
  const unregistered =
    resp.status === 404 || errorCode === 'UNREGISTERED' || errorCode === 'NOT_FOUND';

  if (!unregistered) {
    console.error(`FCM send failed (status ${resp.status}, code ${errorCode || 'unknown'})`);
  }

  return { ok: false, unregistered };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  // Authenticate the webhook via the shared secret.
  const expected = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (!expected || req.headers.get('x-webhook-secret') !== expected) {
    return json({ error: 'Unauthorized' }, 401);
  }

  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const desc = classifyEvent(payload);
  if (!desc) return json({ skipped: 'not a push event' });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Resolve group + activity name when the payload didn't carry them
  // (comment/responsibility events reference the activity only by id).
  let groupId = desc.groupId;
  let activityName = desc.activityName;
  if (!groupId || !activityName) {
    const { data: activity } = await supabase
      .from('activities')
      .select('group_id, name')
      .eq('id', desc.activityId)
      .maybeSingle();
    if (!activity) return json({ skipped: 'activity gone' });
    groupId = activity.group_id as string;
    activityName = activity.name as string;
  }

  // Current group members → recipient set (actor excluded inside resolveRecipients).
  const { data: members } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  const recipientIds = resolveRecipients(desc, memberIds);
  if (recipientIds.length === 0) return json({ recipients: 0 });

  // Actor display name for the message text.
  let actorName = 'Jemand';
  if (desc.actorId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', desc.actorId)
      .maybeSingle();
    if (profile?.display_name) actorName = profile.display_name as string;
  }

  // Recipients without a token are silently skipped.
  const { data: tokenRows } = await supabase
    .from('device_tokens')
    .select('token')
    .in('user_id', recipientIds);
  const tokens = (tokenRows ?? []).map((t) => t.token as string);
  if (tokens.length === 0) return json({ recipients: recipientIds.length, tokens: 0 });

  // FCM credentials — absent until the manual Firebase setup is done; degrade
  // gracefully so the webhook never errors before then.
  const saRaw = Deno.env.get('FCM_SERVICE_ACCOUNT');
  if (!saRaw) return json({ recipients: recipientIds.length, sent: 0, note: 'FCM not configured' });

  let sa: ServiceAccount;
  let accessToken: string;
  try {
    sa = JSON.parse(saRaw);
    accessToken = await getAccessToken(sa);
  } catch (err) {
    return json({ error: `FCM auth failed: ${String(err)}` }, 500);
  }

  const { title, body } = buildMessage(desc.event, {
    actorName,
    activityName: activityName!,
    responsibilityLabel: desc.responsibilityLabel,
    startDate: desc.startDate,
  });
  const data = buildPushTarget(desc.event, groupId!, desc.activityId) as unknown as Record<
    string,
    string
  >;

  let sent = 0;
  const staleTokens: string[] = [];
  await Promise.all(
    tokens.map(async (token) => {
      const result = await sendFcm(sa.project_id, accessToken, token, title, body, data);
      if (result.ok) sent++;
      else if (result.unregistered) staleTokens.push(token);
    }),
  );

  if (staleTokens.length > 0) {
    await supabase.from('device_tokens').delete().in('token', staleTokens);
  }

  return json({
    event: desc.event,
    recipients: recipientIds.length,
    sent,
    cleaned: staleTokens.length,
  });
});

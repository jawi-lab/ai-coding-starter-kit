// PROJ-12 unsubscribe token — a forgery-proof, login-free handle on a user's email
// switches, used by the `List-Unsubscribe` one-click header.
//
// The token is HMAC-SHA256(user_id) with UNSUBSCRIBE_SIGNING_SECRET (server-only). It
// is not guessable and, on its own, can do exactly one thing: turn every email switch
// for that user off. Push and in-app are untouched. send-push mints it when adding the
// header; the unsubscribe function verifies it. Constant-time compare avoids leaking
// validity through timing.

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** HMAC-SHA256(userId) as lowercase hex, keyed by the server-only secret. */
export async function signUserId(userId: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(userId));
  return toHex(sig);
}

/** True iff `token` is a valid signature for `userId`. Constant-time comparison. */
export async function verifyUserId(
  userId: string,
  token: string,
  secret: string,
): Promise<boolean> {
  if (!userId || !token) return false;
  const expected = await signUserId(userId, secret);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return diff === 0;
}

// PROJ-10 send-push — pure event logic (no Deno/network imports so it is unit
// testable with Vitest). index.ts handles I/O (DB lookups + FCM); everything
// here is deterministic data transformation.

export type PushEvent =
  | 'new_proposal'
  | 'now_planning'
  | 'date_set'
  | 'mention'
  | 'responsibility'
  | 'umfrage_erstellt';

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  schema?: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

/**
 * What classifyEvent extracts from a webhook payload. `groupId`/`activityName`
 * are present for `activities` events; for comment/responsibility events they are
 * unknown here and index.ts fetches them from the activity row.
 */
export interface EventDescriptor {
  event: PushEvent;
  activityId: string;
  groupId?: string;
  activityName?: string;
  /** User to exclude from recipients (the trigger's actor). */
  actorId: string | null;
  /** mention: the mentioned users (still filtered against current members). */
  mentionedUserIds?: string[];
  /** responsibility: the assigned user. */
  assignedUserId?: string;
  responsibilityLabel?: string;
  /** date_set: the newly set start_date (YYYY-MM-DD). */
  startDate?: string;
  /** umfrage_erstellt: the poll question shown in the notification body. */
  pollQuestion?: string;
}

/** Deep-link data attached to every push (all values become strings for FCM). */
export interface PushTargetData {
  group_id: string;
  activity_id: string;
  tab: string;
}

function str(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Classifies a DB webhook payload into one of the five push events, or null if
 * the change is not push-worthy. Mirrors the WHEN clauses on the SQL triggers but
 * re-validates independently (the function must never trust that it was woken
 * only for relevant rows).
 */
export function classifyEvent(p: WebhookPayload): EventDescriptor | null {
  const rec = p.record;
  if (!rec) return null;

  if (p.table === 'activities') {
    const activityId = str(rec.id);
    const groupId = str(rec.group_id);
    const activityName = str(rec.name);
    if (!activityId || !groupId) return null;

    if (p.type === 'INSERT') {
      if (rec.status !== 'vorschlag') return null;
      return {
        event: 'new_proposal',
        activityId,
        groupId,
        activityName,
        actorId: str(rec.initiator_id) ?? str(rec.last_changed_by) ?? null,
      };
    }

    if (p.type === 'UPDATE') {
      const old = p.old_record ?? {};
      const actorId = str(rec.last_changed_by) ?? null;
      // Precedence is deliberate: a single UPDATE that both moves the proposal into
      // planning AND sets the date emits exactly one push (now_planning wins). In
      // practice these are separate user actions (Kanban move, then date finder),
      // so each fires its own webhook; the precedence only matters for the rare
      // combined write and avoids a double notification for one change.
      if (old.status === 'vorschlag' && rec.status === 'zu_planen') {
        return { event: 'now_planning', activityId, groupId, activityName, actorId };
      }
      if (!str(old.start_date) && str(rec.start_date)) {
        return {
          event: 'date_set',
          activityId,
          groupId,
          activityName,
          actorId,
          startDate: str(rec.start_date),
        };
      }
      return null;
    }
    return null;
  }

  if (p.table === 'activity_comments' && p.type === 'INSERT') {
    const activityId = str(rec.activity_id);
    if (!activityId) return null;
    const mentionedUserIds = Array.isArray(rec.mentioned_user_ids)
      ? rec.mentioned_user_ids.filter((v): v is string => typeof v === 'string' && v.length > 0)
      : [];
    if (mentionedUserIds.length === 0) return null;
    return {
      event: 'mention',
      activityId,
      actorId: str(rec.user_id) ?? null,
      mentionedUserIds,
    };
  }

  if (p.table === 'activity_responsibilities' && p.type === 'INSERT') {
    const activityId = str(rec.activity_id);
    const assignedUserId = str(rec.assigned_user_id);
    if (!activityId || !assignedUserId) return null;
    return {
      event: 'responsibility',
      activityId,
      actorId: str(rec.created_by) ?? null,
      assignedUserId,
      responsibilityLabel: str(rec.label),
    };
  }

  // PROJ-14: a new poll notifies every activity member except its creator. group_id
  // + activity name aren't in the poll row → index.ts resolves them from the activity.
  if (p.table === 'activity_polls' && p.type === 'INSERT') {
    const activityId = str(rec.activity_id);
    if (!activityId) return null;
    return {
      event: 'umfrage_erstellt',
      activityId,
      actorId: str(rec.created_by) ?? null,
      pollQuestion: str(rec.question),
    };
  }

  return null;
}

const TAB_BY_EVENT: Record<PushEvent, string> = {
  new_proposal: 'vorschlaege',
  now_planning: 'planung',
  date_set: 'termine',
  mention: 'planung',
  responsibility: 'planung',
  // Polls live in the activity detail, opened from the planning board.
  umfrage_erstellt: 'planung',
};

/** Builds the deep-link target the tap handler navigates to. */
export function buildPushTarget(
  event: PushEvent,
  groupId: string,
  activityId: string,
): PushTargetData {
  return { group_id: groupId, activity_id: activityId, tab: TAB_BY_EVENT[event] };
}

/** Formats a YYYY-MM-DD date as German DD.MM.YYYY; passes other strings through. */
export function formatGermanDate(date: string | undefined): string {
  if (!date) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(date);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : date;
}

export interface MessageContext {
  actorName: string;
  activityName: string;
  responsibilityLabel?: string;
  startDate?: string;
  pollQuestion?: string;
}

/** Builds the German notification title + body for an event. */
export function buildMessage(
  event: PushEvent,
  ctx: MessageContext,
): { title: string; body: string } {
  const actor = ctx.actorName || 'Jemand';
  const name = ctx.activityName || 'einer Aktivität';

  switch (event) {
    case 'new_proposal':
      return { title: 'Neuer Vorschlag', body: `${actor} hat „${name}" vorgeschlagen` };
    case 'now_planning':
      return { title: 'Jetzt in Planung', body: `„${name}" wird jetzt geplant` };
    case 'date_set':
      return {
        title: 'Termin steht',
        body: `Der Termin für „${name}" steht: ${formatGermanDate(ctx.startDate)}`,
      };
    case 'mention':
      return { title: 'Erwähnung', body: `${actor} hat dich in „${name}" erwähnt` };
    case 'responsibility':
      return {
        title: 'Neue Aufgabe',
        body: ctx.responsibilityLabel
          ? `Du bist jetzt verantwortlich für „${ctx.responsibilityLabel}" (${name})`
          : `Du hast eine neue Aufgabe in „${name}"`,
      };
    case 'umfrage_erstellt':
      return {
        title: 'Neue Umfrage',
        body: ctx.pollQuestion
          ? `${actor} hat eine Umfrage in „${name}" gestartet: ${ctx.pollQuestion}`
          : `${actor} hat eine Umfrage in „${name}" gestartet`,
      };
  }
}

// --- PROJ-12 three-channel fan-out ------------------------------------------------
// The same event that fired a push in PROJ-10 now fans out to three channels per
// recipient: an in-app inbox row (always), a push (only if the push switch is on and a
// device token exists) and an email (only if the email switch is on). Everything below
// is pure data transformation; index.ts does the DB writes / Resend HTTP call.

/** The two per-type switches for one (user × event) row. */
export interface ChannelPreference {
  push_enabled: boolean;
  email_enabled: boolean;
}

/**
 * Default when a user has no preference row for an event yet. Mirrors
 * DEFAULT_PREFERENCE in src/lib/notification-types.ts: push on (keeps PROJ-10
 * behaviour for existing users), email off (opt-in). "No row" is treated identically.
 */
export const DEFAULT_CHANNEL_PREFERENCE: ChannelPreference = {
  push_enabled: true,
  email_enabled: false,
};

/**
 * Splits recipients into the push- and email-eligible subsets by consulting each
 * recipient's stored preference (missing → default). In-app is not gated here — it is
 * always written for every recipient by the caller (verlustfreie Historie).
 */
export function resolveChannels(
  recipientIds: string[],
  prefsByUser: Map<string, ChannelPreference>,
): { pushUserIds: string[]; emailUserIds: string[] } {
  const pushUserIds: string[] = [];
  const emailUserIds: string[] = [];
  for (const id of recipientIds) {
    const pref = prefsByUser.get(id) ?? DEFAULT_CHANNEL_PREFERENCE;
    if (pref.push_enabled) pushUserIds.push(id);
    if (pref.email_enabled) emailUserIds.push(id);
  }
  return { pushUserIds, emailUserIds };
}

/**
 * Builds the in-app path for a deep-link target, matching pushTargetToPath in
 * src/lib/native/push.ts (trailing slash before the query for the static export).
 * Used to turn the push target into an absolute email link.
 */
export function targetToPath(target: PushTargetData): string {
  const params = new URLSearchParams();
  params.set('id', target.group_id);
  if (target.tab) params.set('tab', target.tab);
  if (target.activity_id) params.set('activity', target.activity_id);
  return `/groups/view/?${params.toString()}`;
}

const HTML_ESCAPE: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Minimal HTML-escape so a frozen title/body can never break the email markup. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => HTML_ESCAPE[ch]);
}

/**
 * Builds the German transactional email for one notification. `deepLink` opens the
 * right context (App/Web); `manageUrl` is the visible "Benachrichtigungen verwalten"
 * link (into the app's settings). The login-free one-click unsubscribe lives in the
 * List-Unsubscribe header (index.ts), not in the visible body.
 */
export function buildEmail(opts: {
  title: string;
  body: string;
  deepLink: string;
  manageUrl: string;
}): { subject: string; html: string; text: string } {
  const title = escapeHtml(opts.title);
  const body = escapeHtml(opts.body);
  const subject = `ZUSAMMEN: ${opts.title}`;

  const html = `<!doctype html>
<html lang="de">
  <body style="margin:0;padding:24px;background:#faf6f0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
      <tr><td>
        <h1 style="margin:0 0 12px;font-size:20px;color:#1f2937;">${title}</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.5;">${body}</p>
        <a href="${opts.deepLink}" style="display:inline-block;background:#c15f3c;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;">In ZUSAMMEN öffnen</a>
        <p style="margin:32px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
          Du erhältst diese E-Mail, weil du Benachrichtigungen für dieses Ereignis aktiviert hast.<br>
          <a href="${opts.manageUrl}" style="color:#6b7280;">Benachrichtigungen verwalten</a>
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const text = `${opts.title}\n\n${opts.body}\n\nIn ZUSAMMEN öffnen: ${opts.deepLink}\n\nBenachrichtigungen verwalten: ${opts.manageUrl}`;

  return { subject, html, text };
}

/**
 * Computes the final recipient set for an event from the current group members.
 * The actor is always removed (self-notification rule). For mention/responsibility
 * the explicit targets are intersected with current membership (RLS-konform: who
 * left the group gets nothing).
 */
export function resolveRecipients(
  desc: EventDescriptor,
  currentMemberIds: string[],
): string[] {
  const members = new Set(currentMemberIds);
  let recipients: string[];

  if (desc.event === 'mention') {
    recipients = (desc.mentionedUserIds ?? []).filter((id) => members.has(id));
  } else if (desc.event === 'responsibility') {
    recipients = desc.assignedUserId && members.has(desc.assignedUserId)
      ? [desc.assignedUserId]
      : [];
  } else {
    recipients = [...members];
  }

  if (desc.actorId) recipients = recipients.filter((id) => id !== desc.actorId);
  // De-duplicate (mentioned_user_ids could contain repeats).
  return [...new Set(recipients)];
}

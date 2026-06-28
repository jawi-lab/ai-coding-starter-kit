// PROJ-10 send-push — pure event logic (no Deno/network imports so it is unit
// testable with Vitest). index.ts handles I/O (DB lookups + FCM); everything
// here is deterministic data transformation.

export type PushEvent =
  | 'new_proposal'
  | 'now_planning'
  | 'date_set'
  | 'mention'
  | 'responsibility';

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

  return null;
}

const TAB_BY_EVENT: Record<PushEvent, string> = {
  new_proposal: 'vorschlaege',
  now_planning: 'planung',
  date_set: 'termine',
  mention: 'planung',
  responsibility: 'planung',
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
  }
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

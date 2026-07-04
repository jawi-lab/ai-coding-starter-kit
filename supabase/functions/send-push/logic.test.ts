import { describe, it, expect } from 'vitest';
import {
  buildEmail,
  buildMessage,
  buildPushTarget,
  type ChannelPreference,
  classifyEvent,
  escapeHtml,
  formatGermanDate,
  resolveChannels,
  resolveRecipients,
  targetToPath,
  type WebhookPayload,
} from './logic';

const ACTOR = '11111111-1111-1111-1111-111111111111';
const OTHER = '22222222-2222-2222-2222-222222222222';
const THIRD = '33333333-3333-3333-3333-333333333333';
const GROUP = 'gggggggg-gggg-gggg-gggg-gggggggggggg';
const ACTIVITY = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

function payload(over: Partial<WebhookPayload>): WebhookPayload {
  return { type: 'INSERT', table: 'activities', record: {}, old_record: null, ...over };
}

describe('classifyEvent — activities', () => {
  it('detects a new proposal on INSERT with status vorschlag', () => {
    const desc = classifyEvent(
      payload({
        type: 'INSERT',
        table: 'activities',
        record: {
          id: ACTIVITY,
          group_id: GROUP,
          name: 'Kino',
          status: 'vorschlag',
          initiator_id: ACTOR,
        },
      }),
    );
    expect(desc).toMatchObject({
      event: 'new_proposal',
      activityId: ACTIVITY,
      groupId: GROUP,
      activityName: 'Kino',
      actorId: ACTOR,
    });
  });

  it('ignores INSERT with a non-vorschlag status', () => {
    const desc = classifyEvent(
      payload({ record: { id: ACTIVITY, group_id: GROUP, status: 'geplant' } }),
    );
    expect(desc).toBeNull();
  });

  it('detects the vorschlag→zu_planen transition', () => {
    const desc = classifyEvent(
      payload({
        type: 'UPDATE',
        record: { id: ACTIVITY, group_id: GROUP, name: 'Kino', status: 'zu_planen', last_changed_by: ACTOR },
        old_record: { status: 'vorschlag' },
      }),
    );
    expect(desc).toMatchObject({ event: 'now_planning', actorId: ACTOR });
  });

  it('detects start_date going from empty to set', () => {
    const desc = classifyEvent(
      payload({
        type: 'UPDATE',
        record: { id: ACTIVITY, group_id: GROUP, name: 'Kino', start_date: '2026-07-15', last_changed_by: ACTOR },
        old_record: { start_date: null },
      }),
    );
    expect(desc).toMatchObject({ event: 'date_set', startDate: '2026-07-15' });
  });

  it('ignores an UPDATE that changes neither status nor start_date', () => {
    const desc = classifyEvent(
      payload({
        type: 'UPDATE',
        record: { id: ACTIVITY, group_id: GROUP, name: 'Neu', status: 'vorschlag' },
        old_record: { name: 'Alt', status: 'vorschlag' },
      }),
    );
    expect(desc).toBeNull();
  });

  it('does not re-fire date_set when start_date was already set', () => {
    const desc = classifyEvent(
      payload({
        type: 'UPDATE',
        record: { id: ACTIVITY, group_id: GROUP, start_date: '2026-07-20' },
        old_record: { start_date: '2026-07-15' },
      }),
    );
    expect(desc).toBeNull();
  });
});

describe('classifyEvent — comments & responsibilities', () => {
  it('detects a mention and carries the mentioned ids', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_comments',
        record: { activity_id: ACTIVITY, user_id: ACTOR, mentioned_user_ids: [OTHER, THIRD] },
      }),
    );
    expect(desc).toMatchObject({
      event: 'mention',
      activityId: ACTIVITY,
      actorId: ACTOR,
      mentionedUserIds: [OTHER, THIRD],
    });
    // group/name unknown at classify time — resolved from the activity row later.
    expect(desc?.groupId).toBeUndefined();
  });

  it('ignores a comment without mentions', () => {
    const desc = classifyEvent(
      payload({ table: 'activity_comments', record: { activity_id: ACTIVITY, user_id: ACTOR, mentioned_user_ids: [] } }),
    );
    expect(desc).toBeNull();
  });

  it('detects a responsibility assignment', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_responsibilities',
        record: { activity_id: ACTIVITY, created_by: ACTOR, assigned_user_id: OTHER, label: 'Tickets kaufen' },
      }),
    );
    expect(desc).toMatchObject({
      event: 'responsibility',
      assignedUserId: OTHER,
      actorId: ACTOR,
      responsibilityLabel: 'Tickets kaufen',
    });
  });

  it('returns null for unhandled tables/operations', () => {
    expect(classifyEvent(payload({ table: 'activity_votes', record: { id: '1' } }))).toBeNull();
    expect(classifyEvent(payload({ type: 'DELETE', record: null }))).toBeNull();
  });
});

describe('resolveRecipients', () => {
  const members = [ACTOR, OTHER, THIRD];

  it('sends group-wide events to all members except the actor', () => {
    const desc = classifyEvent(
      payload({ record: { id: ACTIVITY, group_id: GROUP, status: 'vorschlag', initiator_id: ACTOR } }),
    )!;
    expect(resolveRecipients(desc, members).sort()).toEqual([OTHER, THIRD].sort());
  });

  it('limits mentions to mentioned members and drops the author even if self-mentioned', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_comments',
        record: { activity_id: ACTIVITY, user_id: ACTOR, mentioned_user_ids: [ACTOR, OTHER] },
      }),
    )!;
    expect(resolveRecipients(desc, members)).toEqual([OTHER]);
  });

  it('drops mentioned users who are no longer group members', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_comments',
        record: { activity_id: ACTIVITY, user_id: ACTOR, mentioned_user_ids: [OTHER, 'ex-member'] },
      }),
    )!;
    expect(resolveRecipients(desc, members)).toEqual([OTHER]);
  });

  it('sends a responsibility only to the assignee', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_responsibilities',
        record: { activity_id: ACTIVITY, created_by: ACTOR, assigned_user_id: THIRD, label: 'x' },
      }),
    )!;
    expect(resolveRecipients(desc, members)).toEqual([THIRD]);
  });

  it('returns empty when the assignee assigned themselves', () => {
    const desc = classifyEvent(
      payload({
        table: 'activity_responsibilities',
        record: { activity_id: ACTIVITY, created_by: ACTOR, assigned_user_id: ACTOR, label: 'x' },
      }),
    )!;
    expect(resolveRecipients(desc, members)).toEqual([]);
  });
});

describe('buildMessage', () => {
  it('names actor and activity for a new proposal', () => {
    expect(buildMessage('new_proposal', { actorName: 'Lea', activityName: 'Kino' })).toEqual({
      title: 'Neuer Vorschlag',
      body: 'Lea hat „Kino" vorgeschlagen',
    });
  });

  it('formats the German date for a confirmed date', () => {
    expect(buildMessage('date_set', { actorName: 'Lea', activityName: 'Kino', startDate: '2026-07-15' }).body).toBe(
      'Der Termin für „Kino" steht: 15.07.2026',
    );
  });

  it('falls back gracefully when actor name is missing', () => {
    expect(buildMessage('mention', { actorName: '', activityName: 'Kino' }).body).toBe(
      'Jemand hat dich in „Kino" erwähnt',
    );
  });

  it('includes the responsibility label when present', () => {
    expect(buildMessage('responsibility', { actorName: 'Lea', activityName: 'Kino', responsibilityLabel: 'Tickets' }).body).toBe(
      'Du bist jetzt verantwortlich für „Tickets" (Kino)',
    );
  });
});

describe('buildPushTarget', () => {
  it('routes each event to the right tab', () => {
    expect(buildPushTarget('new_proposal', GROUP, ACTIVITY)).toEqual({ group_id: GROUP, activity_id: ACTIVITY, tab: 'vorschlaege' });
    expect(buildPushTarget('date_set', GROUP, ACTIVITY).tab).toBe('termine');
    expect(buildPushTarget('mention', GROUP, ACTIVITY).tab).toBe('planung');
  });
});

describe('formatGermanDate', () => {
  it('converts ISO dates and passes through anything else', () => {
    expect(formatGermanDate('2026-12-01')).toBe('01.12.2026');
    expect(formatGermanDate(undefined)).toBe('');
    expect(formatGermanDate('später')).toBe('später');
  });
});

describe('resolveChannels (PROJ-12 fan-out)', () => {
  it('defaults a recipient with no preference row to push-on / email-off', () => {
    const { pushUserIds, emailUserIds } = resolveChannels([OTHER], new Map());
    expect(pushUserIds).toEqual([OTHER]);
    expect(emailUserIds).toEqual([]);
  });

  it('honours per-recipient switches independently', () => {
    const prefs = new Map<string, ChannelPreference>([
      [OTHER, { push_enabled: false, email_enabled: true }],
      [THIRD, { push_enabled: true, email_enabled: true }],
    ]);
    const { pushUserIds, emailUserIds } = resolveChannels([OTHER, THIRD, ACTOR], prefs);
    // OTHER: push off, email on. THIRD: both on. ACTOR: no row → push on, email off.
    expect(pushUserIds.sort()).toEqual([THIRD, ACTOR].sort());
    expect(emailUserIds.sort()).toEqual([OTHER, THIRD].sort());
  });

  it('never sends push nor email when both switches are off', () => {
    const prefs = new Map<string, ChannelPreference>([
      [OTHER, { push_enabled: false, email_enabled: false }],
    ]);
    const { pushUserIds, emailUserIds } = resolveChannels([OTHER], prefs);
    expect(pushUserIds).toEqual([]);
    expect(emailUserIds).toEqual([]);
  });
});

describe('targetToPath', () => {
  it('mirrors pushTargetToPath: trailing slash, id + tab + activity params', () => {
    expect(targetToPath({ group_id: GROUP, activity_id: ACTIVITY, tab: 'termine' })).toBe(
      `/groups/view/?id=${GROUP}&tab=termine&activity=${ACTIVITY}`,
    );
  });
});

describe('escapeHtml', () => {
  it('neutralises markup-breaking characters in frozen strings', () => {
    expect(escapeHtml('A & B <c> "d" \'e\'')).toBe('A &amp; B &lt;c&gt; &quot;d&quot; &#39;e&#39;');
  });
});

describe('buildEmail', () => {
  const email = buildEmail({
    title: 'Neuer Vorschlag',
    body: 'Lea hat „Kino" vorgeschlagen',
    deepLink: 'https://app.example/groups/view/?id=g',
    manageUrl: 'https://app.example/groups/',
  });

  it('prefixes the subject and keeps the German body', () => {
    expect(email.subject).toBe('ZUSAMMEN: Neuer Vorschlag');
    expect(email.text).toContain('Lea hat „Kino" vorgeschlagen');
  });

  it('links both the deep-link and the manage URL', () => {
    expect(email.html).toContain('https://app.example/groups/view/?id=g');
    expect(email.html).toContain('https://app.example/groups/');
    expect(email.html).toContain('Benachrichtigungen verwalten');
  });

  it('escapes untrusted content in the HTML body', () => {
    const evil = buildEmail({
      title: '<script>',
      body: 'x & y',
      deepLink: 'https://x',
      manageUrl: 'https://y',
    });
    expect(evil.html).toContain('&lt;script&gt;');
    expect(evil.html).toContain('x &amp; y');
    expect(evil.html).not.toContain('<script>');
  });
});

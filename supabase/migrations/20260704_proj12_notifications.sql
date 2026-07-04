-- PROJ-12: Benachrichtigungen & Einstellungen — the two new tables the send-push
-- fan-out writes into, plus Realtime and a daily prune job.
--
-- We do NOT touch the PROJ-10 webhooks or triggers: the same five events keep firing
-- proj10_dispatch_push → send-push. That function is extended (in code) from "push only"
-- to a three-channel fan-out (in-app + push + email); these tables are its targets.
--
--   notifications            → the cross-group in-app inbox (one row per recipient
--                              per event; title/body frozen server-side).
--   notification_preferences → the per-type Push/E-Mail switches (≤5 rows per user).
--
-- Column shapes match src/lib/database.types.ts (frontend-first) exactly.

-- 1) In-app inbox ---------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event       text not null check (event in
                ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility')),
  title       text not null,
  body        text not null,
  -- Deep-link target, same shape as the PROJ-10 push payload ({group_id, activity_id, tab}).
  -- group_id is NOT a FK: the entry must survive as history even if the group/activity
  -- is later deleted (Edge Case "Benachrichtigung zu nicht mehr zugänglichem Inhalt").
  group_id    uuid not null,
  activity_id uuid,
  tab         text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notifications is
  'PROJ-12: in-app inbox. One row per recipient per event, written only by the send-push service role. Title/body are frozen German strings; group_id/activity_id/tab mirror the PROJ-10 deep-link target (no FK so history survives deletion).';

-- The center loads a user''s rows newest-first (.eq(user_id).order(created_at desc)).
create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

-- The prune job scans by age.
create index if not exists idx_notifications_created_at
  on public.notifications (created_at);

alter table public.notifications enable row level security;

-- A user may read only their own inbox.
create policy "Users see own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

-- A user may mark their own entries read (the client only ever flips `read`).
-- WITH CHECK pins the row to the same owner so an update can''t reassign it.
create policy "Users update own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No INSERT/DELETE policy on purpose: rows are written exclusively by the send-push
-- Edge Function (service role, bypasses RLS) and removed only by the prune job.

-- 2) Per-type channel preferences ----------------------------------------------
create table if not exists public.notification_preferences (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  event         text not null check (event in
                  ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility')),
  push_enabled  boolean not null default true,
  email_enabled boolean not null default false,
  updated_at    timestamptz not null default now(),
  primary key (user_id, event)
);

comment on table public.notification_preferences is
  'PROJ-12: per-type Push/E-Mail switches. Up to 5 rows per user (one per event). A missing row = default (push on, email off); the send-push fan-out treats "no row" identically, so no backfill is needed.';

alter table public.notification_preferences enable row level security;

-- A user fully manages only their own preference rows (client upserts on (user_id,event)).
create policy "Users see own notification preferences"
  on public.notification_preferences for select to authenticated
  using (auth.uid() = user_id);

create policy "Users insert own notification preferences"
  on public.notification_preferences for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Users update own notification preferences"
  on public.notification_preferences for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3) Realtime -------------------------------------------------------------------
-- The client subscribes to its own notification rows (filter user_id=eq.…) so new
-- entries appear live and the badge counts up without a reload. Add the table to the
-- supabase_realtime publication (idempotent — skip if already a member).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;

-- 4) Retention: prune entries older than 30 days, once a day (pg_cron) -----------
-- Reine Zeitgrenze als täglicher Job (Decision Log): trivial und belastet den
-- Versand-Pfad nicht. Tolerant gebaut — fehlt pg_cron (nicht aktiviert), ruht nur
-- der Prune-Job; Tabellen + Fan-out laufen weiter (sauberes Degradieren).
do $$
begin
  create extension if not exists pg_cron;

  -- pg_cron ≥1.4 upserts by job name, so re-running this migration just refreshes it.
  perform cron.schedule(
    'proj12-prune-notifications',
    '0 3 * * *',
    $job$delete from public.notifications where created_at < now() - interval '30 days'$job$
  );
exception when others then
  raise notice 'PROJ-12: pg_cron prune not scheduled (%). Enable the pg_cron extension and re-run to activate 30-day retention.', sqlerrm;
end;
$$;

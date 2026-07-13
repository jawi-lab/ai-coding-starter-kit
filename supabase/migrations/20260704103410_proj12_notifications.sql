-- PROJ-12: notifications + notification_preferences tables, RLS, Realtime, pg_cron prune.

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  event       text not null check (event in
                ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility')),
  title       text not null,
  body        text not null,
  group_id    uuid not null,
  activity_id uuid,
  tab         text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

comment on table public.notifications is
  'PROJ-12: in-app inbox. One row per recipient per event, written only by the send-push service role. Title/body are frozen German strings; group_id/activity_id/tab mirror the PROJ-10 deep-link target (no FK so history survives deletion).';

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

create index if not exists idx_notifications_created_at
  on public.notifications (created_at);

alter table public.notifications enable row level security;

create policy "Users see own notifications"
  on public.notifications for select to authenticated
  using (auth.uid() = user_id);

create policy "Users update own notifications"
  on public.notifications for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

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

do $$
begin
  create extension if not exists pg_cron;
  perform cron.schedule(
    'proj12-prune-notifications',
    '0 3 * * *',
    $job$delete from public.notifications where created_at < now() - interval '30 days'$job$
  );
exception when others then
  raise notice 'PROJ-12: pg_cron prune not scheduled (%). Enable the pg_cron extension and re-run to activate 30-day retention.', sqlerrm;
end;
$$;

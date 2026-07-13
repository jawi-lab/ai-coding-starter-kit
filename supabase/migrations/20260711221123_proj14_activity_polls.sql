-- PROJ-14: Umfragen in Aktivitäten — three linked tables, RLS, Realtime, and the
-- `umfrage_erstellt` notification wired onto the existing PROJ-10/12 push pipeline.

create or replace function public.is_activity_group_member(aid uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
    select 1
    from public.activities a
    join public.group_members gm on gm.group_id = a.group_id
    where a.id = aid and gm.user_id = auth.uid()
  );
$$;

create or replace function public.is_activity_polls_writable(aid uuid)
returns boolean
language sql
stable
security definer
set search_path = 'public'
as $$
  select exists (
    select 1
    from public.activities a
    join public.group_members gm on gm.group_id = a.group_id
    where a.id = aid
      and gm.user_id = auth.uid()
      and a.status not in ('vorschlag', 'abgeschlossen')
  );
$$;

create table if not exists public.activity_polls (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  created_by  uuid not null references public.profiles(id) on delete cascade,
  question    text not null check (char_length(question) between 1 and 255),
  created_at  timestamptz not null default now()
);

comment on table public.activity_polls is
  'PROJ-14: a poll inside an activity. Not editable after creation (fix = delete + recreate). Deleted by creator or group admin; cascades to options + votes.';

create index if not exists idx_activity_polls_activity_created
  on public.activity_polls (activity_id, created_at desc);
create index if not exists idx_activity_polls_created_by
  on public.activity_polls (created_by);

alter table public.activity_polls enable row level security;

create policy "Group members can view polls"
  on public.activity_polls for select to authenticated
  using (public.is_activity_group_member(activity_id));

create policy "Group members can create polls"
  on public.activity_polls for insert to authenticated
  with check (
    auth.uid() = created_by
    and public.is_activity_polls_writable(activity_id)
  );

create policy "Creators and admins can delete polls"
  on public.activity_polls for delete to authenticated
  using (
    auth.uid() = created_by
    or public.is_group_admin((select group_id from public.activities where id = activity_id))
  );

create table if not exists public.activity_poll_options (
  id          uuid primary key default gen_random_uuid(),
  poll_id     uuid not null references public.activity_polls(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  option_text text not null check (char_length(option_text) between 1 and 100),
  position    integer not null
);

comment on table public.activity_poll_options is
  'PROJ-14: one answer option of a poll. activity_id is denormalised so Realtime can filter without a join. Ordered client-side by position.';

create index if not exists idx_activity_poll_options_poll on public.activity_poll_options (poll_id);
create index if not exists idx_activity_poll_options_activity on public.activity_poll_options (activity_id);

alter table public.activity_poll_options enable row level security;

create policy "Group members can view poll options"
  on public.activity_poll_options for select to authenticated
  using (public.is_activity_group_member(activity_id));

create policy "Poll creators can add options"
  on public.activity_poll_options for insert to authenticated
  with check (
    public.is_activity_polls_writable(activity_id)
    and exists (
      select 1 from public.activity_polls p
      where p.id = poll_id
        and p.created_by = auth.uid()
        and p.activity_id = activity_poll_options.activity_id
    )
  );

create table if not exists public.activity_poll_votes (
  id          uuid primary key default gen_random_uuid(),
  option_id   uuid not null references public.activity_poll_options(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (option_id, user_id)
);

comment on table public.activity_poll_votes is
  'PROJ-14: one vote = one (option, voter) row. Multi-select without a cap: a member can hold a row on any number of options. Toggle = insert/delete. unique(option_id,user_id) blocks doubles.';

create index if not exists idx_activity_poll_votes_option on public.activity_poll_votes (option_id);
create index if not exists idx_activity_poll_votes_activity on public.activity_poll_votes (activity_id);
create index if not exists idx_activity_poll_votes_user on public.activity_poll_votes (user_id);

alter table public.activity_poll_votes enable row level security;

create policy "Group members can view poll votes"
  on public.activity_poll_votes for select to authenticated
  using (public.is_activity_group_member(activity_id));

create policy "Group members can cast votes"
  on public.activity_poll_votes for insert to authenticated
  with check (
    auth.uid() = user_id
    and public.is_activity_polls_writable(activity_id)
  );

create policy "Members can remove own votes"
  on public.activity_poll_votes for delete to authenticated
  using (auth.uid() = user_id);

do $$
declare
  t text;
begin
  foreach t in array array['activity_polls', 'activity_poll_options', 'activity_poll_votes']
  loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
    ) then
      execute format('alter publication supabase_realtime add table public.%I', t);
    end if;
  end loop;
end;
$$;

alter table public.notifications drop constraint if exists notifications_event_check;
alter table public.notifications add constraint notifications_event_check
  check (event in ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility', 'umfrage_erstellt'));

alter table public.notification_preferences drop constraint if exists notification_preferences_event_check;
alter table public.notification_preferences add constraint notification_preferences_event_check
  check (event in ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility', 'umfrage_erstellt'));

drop trigger if exists trg_push_poll_insert on public.activity_polls;
create trigger trg_push_poll_insert
  after insert on public.activity_polls
  for each row
  execute function public.proj10_dispatch_push();

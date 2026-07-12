-- PROJ-14: Umfragen in Aktivitäten — three linked tables, RLS, Realtime, and the
-- `umfrage_erstellt` notification wired onto the existing PROJ-10/12 push pipeline.
--
--   activity_polls         → one poll per row (question, creator, activity).
--   activity_poll_options  → 2–12 options per poll (carries activity_id for Realtime).
--   activity_poll_votes    → one row per (option, voter); toggle = insert/delete.
--
-- Column shapes + FK names match the frontend contract (useActivityPolls POLL_SELECT
-- and src/lib/database.types.ts bridge). Options/votes denormalise activity_id so the
-- Realtime filter (activity_id=eq.…) works without a join — consistent with PROJ-6.

-- 1) Membership + status helpers (SECURITY DEFINER, mirror is_group_member) --------
-- Resolves group membership via the owning activity, so the poll policies can gate on
-- an activity_id alone. `writable` additionally blocks the read-only/hidden statuses
-- (Decision Log: `vorschlag` unsichtbar, `abgeschlossen` read-only — enforced in RLS on
-- top of the client-side UI gate so a manipulated client can't write into them).

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

-- 2) activity_polls -------------------------------------------------------------
create table if not exists public.activity_polls (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  created_by  uuid not null references public.profiles(id) on delete cascade,
  question    text not null check (char_length(question) between 1 and 255),
  created_at  timestamptz not null default now()
);

comment on table public.activity_polls is
  'PROJ-14: a poll inside an activity. Not editable after creation (fix = delete + recreate). Deleted by creator or group admin; cascades to options + votes.';

-- Fetch is .eq(activity_id).order(created_at desc).
create index if not exists idx_activity_polls_activity_created
  on public.activity_polls (activity_id, created_at desc);
-- SELECT/DELETE policies reference created_by.
create index if not exists idx_activity_polls_created_by
  on public.activity_polls (created_by);

alter table public.activity_polls enable row level security;

create policy "Group members can view polls"
  on public.activity_polls for select to authenticated
  using (public.is_activity_group_member(activity_id));

-- Creation is gated on writable status (not `vorschlag`/`abgeschlossen`) AND self-authorship.
create policy "Group members can create polls"
  on public.activity_polls for insert to authenticated
  with check (
    auth.uid() = created_by
    and public.is_activity_polls_writable(activity_id)
  );

-- Delete: creator OR group admin. No status gate — a poll on an `abgeschlossen`
-- activity is read-only for voting but must remain removable for cleanup.
create policy "Creators and admins can delete polls"
  on public.activity_polls for delete to authenticated
  using (
    auth.uid() = created_by
    or public.is_group_admin((select group_id from public.activities where id = activity_id))
  );

-- No UPDATE policy on purpose: polls are immutable after creation.

-- 3) activity_poll_options ------------------------------------------------------
create table if not exists public.activity_poll_options (
  id          uuid primary key default gen_random_uuid(),
  poll_id     uuid not null references public.activity_polls(id) on delete cascade,
  -- Denormalised for the Realtime filter (activity_id=eq.…) — no join needed.
  activity_id uuid not null references public.activities(id) on delete cascade,
  option_text text not null check (char_length(option_text) between 1 and 100),
  position    integer not null
);

comment on table public.activity_poll_options is
  'PROJ-14: one answer option of a poll. activity_id is denormalised so Realtime can filter without a join. Ordered client-side by position.';

-- Nested select loads options via poll_id; Realtime filters via activity_id.
create index if not exists idx_activity_poll_options_poll on public.activity_poll_options (poll_id);
create index if not exists idx_activity_poll_options_activity on public.activity_poll_options (activity_id);

alter table public.activity_poll_options enable row level security;

create policy "Group members can view poll options"
  on public.activity_poll_options for select to authenticated
  using (public.is_activity_group_member(activity_id));

-- Options are inserted by the poll creator immediately after the poll row. Requires:
-- writable status, matching denormalised activity_id, and ownership of the parent poll.
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

-- No UPDATE/DELETE policy: options are immutable and removed only via poll cascade.

-- 4) activity_poll_votes --------------------------------------------------------
create table if not exists public.activity_poll_votes (
  id          uuid primary key default gen_random_uuid(),
  option_id   uuid not null references public.activity_poll_options(id) on delete cascade,
  -- Denormalised for the Realtime filter, same reason as options.
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- One vote per (option, user): DB-side guard against double votes on the same
  -- option even under concurrent taps (Decision Log).
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

-- Casting a vote: self-authored + writable status (blocks voting on `abgeschlossen`).
create policy "Group members can cast votes"
  on public.activity_poll_votes for insert to authenticated
  with check (
    auth.uid() = user_id
    and public.is_activity_polls_writable(activity_id)
  );

-- Removing a vote (toggle off): own vote only.
create policy "Members can remove own votes"
  on public.activity_poll_votes for delete to authenticated
  using (auth.uid() = user_id);

-- No UPDATE policy: a vote is either present or not (insert/delete), never updated.

-- 5) Realtime -------------------------------------------------------------------
-- One channel per activity subscribes to all three tables (filtered by activity_id)
-- for live votes and live poll add/remove. Add each to the publication (idempotent).
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

-- 6) Notification event `umfrage_erstellt` --------------------------------------
-- Register the new event value everywhere it is enumerated so the CHECK constraints
-- accept the in-app inbox / preference rows the send-push fan-out writes.
alter table public.notifications drop constraint if exists notifications_event_check;
alter table public.notifications add constraint notifications_event_check
  check (event in ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility', 'umfrage_erstellt'));

alter table public.notification_preferences drop constraint if exists notification_preferences_event_check;
alter table public.notification_preferences add constraint notification_preferences_event_check
  check (event in ('new_proposal', 'now_planning', 'date_set', 'mention', 'responsibility', 'umfrage_erstellt'));

-- 7) Push webhook on new polls --------------------------------------------------
-- Reuses the PROJ-10 dispatch function → send-push classifies table `activity_polls`
-- INSERT as `umfrage_erstellt`, fans out to all activity members except the creator.
drop trigger if exists trg_push_poll_insert on public.activity_polls;
create trigger trg_push_poll_insert
  after insert on public.activity_polls
  for each row
  execute function public.proj10_dispatch_push();

-- NOTE: is_activity_group_member / is_activity_polls_writable keep the default
-- EXECUTE grant — they are evaluated inside RLS policies as the querying role, so
-- revoking it (as we do for the trigger-only dispatch fn) would break every policy.

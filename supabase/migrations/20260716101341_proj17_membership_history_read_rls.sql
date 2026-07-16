-- PROJ-17 Baustein 3: Ehemalige Mitgliedschaften — schließt die PROJ-8-Lücke
-- „Erinnerung gehört dem Nutzer". Beim Austritt/Entfernen schreibt ein Trigger
-- automatisch einen Historien-Eintrag; die LESE-Policies der Gruppen-Inhalte
-- werden von „ist Mitglied" auf „ist ODER war Mitglied" erweitert.
-- Schreibrechte bleiben unverändert bei aktiven Mitgliedern.
-- Gruppenlöschung kaskadiert wie bisher (Historie hängt an groups).

-- 1) Historie-Tabelle ---------------------------------------------------------

create table public.group_members_history (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  left_at  timestamptz not null default now(),
  primary key (group_id, user_id)
);

comment on table public.group_members_history is
  'PROJ-17: written automatically by trigger when a membership row is deleted (leave or admin removal). Grants read-only access to former groups. Cascades away with group or user deletion.';

create index idx_group_members_history_user on public.group_members_history(user_id);

alter table public.group_members_history enable row level security;

-- Nur die eigenen Historien-Zeilen lesen (Album-Filter-Chips ehemaliger Gruppen).
-- KEINE Schreib-Policies: schreiben kann nur die SECURITY-DEFINER-Automatik.
create policy "Users read own membership history"
  on public.group_members_history for select to authenticated
  using (user_id = (select auth.uid()));

-- 2) Trigger: Austritt/Entfernen → Historie ----------------------------------

create or replace function public.handle_member_left_history()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Kaskaden-Schutz: läuft die Löschung der Gruppe bzw. des Nutzer-Accounts,
  -- ist die Elternzeile bereits weg — dann keinen Historien-Eintrag anlegen
  -- (FK würde sonst die Kaskade abbrechen).
  if exists (select 1 from public.groups where id = old.group_id)
     and exists (select 1 from auth.users where id = old.user_id) then
    insert into public.group_members_history (group_id, user_id)
    values (old.group_id, old.user_id)
    on conflict (group_id, user_id) do update set left_at = now();
  end if;
  return null;
end;
$$;

create trigger trg_member_left_history
  after delete on public.group_members
  for each row execute function public.handle_member_left_history();

-- 3) Helper: „ist oder war Mitglied" ------------------------------------------

create or replace function public.is_or_was_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  ) or exists (
    select 1 from public.group_members_history
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_or_was_activity_group_member(aid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_or_was_group_member(
    (select group_id from public.activities where id = aid)
  );
$$;

-- 4) Lese-Policies erweitern (nur SELECT, freigegebener Umfang) ----------------

-- groups: Gruppenname für Karten-Badge + Filter-Chips
drop policy "members_read_group" on public.groups;
create policy "members_read_group"
  on public.groups for select
  using (public.is_or_was_group_member(id));

-- group_members: Mitglieder-Anzeige im read-only-Detail
drop policy "members_read_memberships" on public.group_members;
create policy "members_read_memberships"
  on public.group_members for select
  using (public.is_or_was_group_member(group_id));

-- activities: die Karten selbst
drop policy "activities_select_members" on public.activities;
create policy "activities_select_members"
  on public.activities for select
  using (public.is_or_was_group_member(group_id));

-- activity_votes
drop policy "activity_votes_select_members" on public.activity_votes;
create policy "activity_votes_select_members"
  on public.activity_votes for select
  using (public.is_or_was_activity_group_member(activity_id));

-- activity_comments
drop policy "Group members can view comments" on public.activity_comments;
create policy "Group members can view comments"
  on public.activity_comments for select
  using (public.is_or_was_activity_group_member(activity_id));

-- activity_responsibilities
drop policy "Group members can view responsibilities" on public.activity_responsibilities;
create policy "Group members can view responsibilities"
  on public.activity_responsibilities for select
  using (public.is_or_was_activity_group_member(activity_id));

-- activity_photos (Tabelle)
drop policy "Group members can view photos" on public.activity_photos;
create policy "Group members can view photos"
  on public.activity_photos for select
  using (public.is_or_was_activity_group_member(activity_id));

-- Umfragen (PROJ-14)
drop policy "Group members can view polls" on public.activity_polls;
create policy "Group members can view polls"
  on public.activity_polls for select to authenticated
  using (public.is_or_was_activity_group_member(activity_id));

drop policy "Group members can view poll options" on public.activity_poll_options;
create policy "Group members can view poll options"
  on public.activity_poll_options for select to authenticated
  using (public.is_or_was_activity_group_member(activity_id));

drop policy "Group members can view poll votes" on public.activity_poll_votes;
create policy "Group members can view poll votes"
  on public.activity_poll_votes for select to authenticated
  using (public.is_or_was_activity_group_member(activity_id));

-- Storage: Cover-/Erinnerungsfotos + Kommentar-Bilder
drop policy if exists activity_photos_select on storage.objects;
create policy activity_photos_select on storage.objects
  for select to public
  using (
    bucket_id = 'activity-photos'
    and public.is_or_was_group_member((
      select a.group_id from public.activities a
      where a.id = ((storage.foldername(storage.objects.name))[1])::uuid
    ))
  );

drop policy if exists comment_images_select on storage.objects;
create policy comment_images_select on storage.objects
  for select to public
  using (
    bucket_id = 'activity-comment-images'
    and public.is_or_was_group_member((
      select a.group_id from public.activities a
      where a.id = ((storage.foldername(storage.objects.name))[1])::uuid
    ))
  );

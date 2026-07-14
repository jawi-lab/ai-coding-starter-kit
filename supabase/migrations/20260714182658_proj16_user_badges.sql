-- PROJ-16: Persönliche Rollen-Badges ----------------------------------------
-- Eine „Badge-Akte" je Nutzer+Badge (Zähler, verdiente Stufe, angesehene Stufe).
-- Zähllogik lebt als Trigger-Automatik in der DB (Recount aus Originaldaten:
-- fälschungssicher, dedupliziert von Natur aus, korrekt bei Löschungen);
-- Clients lesen nur die eigene Akte und markieren sie per RPC als angesehen.
-- Muster analog PROJ-15 (group_momentum).

-- 1) Tabelle ------------------------------------------------------------------

create table public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge text not null check (badge in ('ideengeber', 'entscheider', 'planer', 'immer_dabei')),
  action_count integer not null default 0 check (action_count >= 0),
  -- Stufen als Schwellenwerte (wie PROJ-15-Meilensteine): 0=keine, 5=Bronze, 15=Silber, 30=Gold.
  highest_earned_tier integer not null default 0 check (highest_earned_tier in (0, 5, 15, 30)),
  highest_seen_tier integer not null default 0 check (highest_seen_tier in (0, 5, 15, 30)),
  updated_at timestamptz not null default now(),
  primary key (user_id, badge)
);

-- Beschleunigt die Recounts (Ideengeber bzw. Planer je Nutzer).
create index idx_activities_initiator on public.activities (initiator_id);
create index idx_activity_responsibilities_assigned
  on public.activity_responsibilities (assigned_user_id);

-- 2) Automatik (Functions + Trigger) -------------------------------------------

-- Stufen-Schwellen 0/5/15/30 — muss zu src/lib/badges.ts passen.
create or replace function public.badge_tier_for(p_count integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_count >= 30 then 30
    when p_count >= 15 then 15
    when p_count >= 5 then 5
    else 0
  end;
$$;

-- Zählt die Aktionen eines Nutzers für ein Badge frisch aus den Originaldaten.
-- Deduplizierung pro Ziel steckt in den Queries selbst:
--   Entscheider: distinct pro Aktivität bzw. pro Umfrage (Mehrfachauswahl = 1)
--   Immer dabei: pro abgeschlossener Aktivität mit Mitwirkung (Vote/Aufgabe/Vorschlag)
create or replace function public.badge_count_for(p_user_id uuid, p_badge text)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select case p_badge
    when 'ideengeber' then (
      select count(*) from activities where initiator_id = p_user_id
    )
    when 'entscheider' then (
      (select count(distinct activity_id) from activity_votes where user_id = p_user_id)
      + (select count(distinct o.poll_id)
         from activity_poll_votes v
         join activity_poll_options o on o.id = v.option_id
         where v.user_id = p_user_id)
    )
    when 'planer' then (
      (select count(*) from activity_responsibilities where assigned_user_id = p_user_id)
      + (select count(*) from activity_polls where created_by = p_user_id)
    )
    when 'immer_dabei' then (
      select count(*)
      from activities a
      where a.status = 'abgeschlossen'
        and (
          a.initiator_id = p_user_id
          or exists (select 1 from activity_votes v
                     where v.activity_id = a.id and v.user_id = p_user_id)
          or exists (select 1 from activity_responsibilities r
                     where r.activity_id = a.id and r.assigned_user_id = p_user_id)
        )
    )
    else 0
  end::integer;
$$;

-- Rechnet ein Badge eines Nutzers neu und hebt die verdiente Stufe bei Bedarf an.
-- GREATEST macht die Stufe monoton: Löschen senkt nur action_count, nie die Stufe.
-- Der Guard verhindert FK-Fehler, wenn Kaskaden-Trigger für einen gerade
-- gelöschten Nutzer feuern.
create or replace function public.refresh_user_badge(p_user_id uuid, p_badge text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if p_user_id is null or not exists (select 1 from auth.users where id = p_user_id) then
    return;
  end if;

  v_count := badge_count_for(p_user_id, p_badge);

  insert into user_badges (user_id, badge, action_count, highest_earned_tier, updated_at)
  values (p_user_id, p_badge, v_count, badge_tier_for(v_count), now())
  on conflict (user_id, badge) do update
    set action_count = excluded.action_count,
        highest_earned_tier = greatest(user_badges.highest_earned_tier, excluded.highest_earned_tier),
        updated_at = now();
end;
$$;

-- Immer dabei betrifft bei Statuswechseln alle Mitwirkenden einer Aktivität.
create or replace function public.refresh_activity_contributor_badges(
  p_activity_id uuid,
  p_initiator_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  for v_user in
    select p_initiator_id
    union
    select user_id from activity_votes where activity_id = p_activity_id
    union
    select assigned_user_id from activity_responsibilities where activity_id = p_activity_id
  loop
    perform refresh_user_badge(v_user, 'immer_dabei');
  end loop;
end;
$$;

-- Trigger auf activities: Ideengeber (Vorschläge) + Immer dabei (Abschluss-Wechsel).
create or replace function public.handle_activity_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform refresh_user_badge(new.initiator_id, 'ideengeber');
    if new.status = 'abgeschlossen' then
      perform refresh_user_badge(new.initiator_id, 'immer_dabei');
    end if;
  elsif tg_op = 'UPDATE' then
    if new.initiator_id is distinct from old.initiator_id then
      perform refresh_user_badge(old.initiator_id, 'ideengeber');
      perform refresh_user_badge(new.initiator_id, 'ideengeber');
    end if;
    if (old.status = 'abgeschlossen') <> (new.status = 'abgeschlossen')
       or new.initiator_id is distinct from old.initiator_id then
      perform refresh_activity_contributor_badges(new.id, new.initiator_id);
      if new.initiator_id is distinct from old.initiator_id then
        perform refresh_user_badge(old.initiator_id, 'immer_dabei');
      end if;
    end if;
  elsif tg_op = 'DELETE' then
    perform refresh_user_badge(old.initiator_id, 'ideengeber');
    if old.status = 'abgeschlossen' then
      -- Votes/Aufgaben-Nutzer werden über die Kaskaden-Trigger ihrer Zeilen erfasst.
      perform refresh_user_badge(old.initiator_id, 'immer_dabei');
    end if;
  end if;
  return null;
end;
$$;

create trigger trg_activity_badges
  after insert or update or delete on public.activities
  for each row execute function public.handle_activity_badges();

-- Trigger auf activity_votes: Entscheider + Immer dabei des Voters.
create or replace function public.handle_activity_vote_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_user_badge(new.user_id, 'entscheider');
    perform refresh_user_badge(new.user_id, 'immer_dabei');
  end if;
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.user_id is distinct from old.user_id) then
    perform refresh_user_badge(old.user_id, 'entscheider');
    perform refresh_user_badge(old.user_id, 'immer_dabei');
  end if;
  return null;
end;
$$;

create trigger trg_activity_vote_badges
  after insert or update or delete on public.activity_votes
  for each row execute function public.handle_activity_vote_badges();

-- Trigger auf activity_poll_votes: Entscheider (dedupliziert pro Umfrage im Recount).
create or replace function public.handle_poll_vote_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_user_badge(new.user_id, 'entscheider');
  end if;
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.user_id is distinct from old.user_id) then
    perform refresh_user_badge(old.user_id, 'entscheider');
  end if;
  return null;
end;
$$;

create trigger trg_poll_vote_badges
  after insert or update or delete on public.activity_poll_votes
  for each row execute function public.handle_poll_vote_badges();

-- Trigger auf activity_responsibilities: Planer + Immer dabei des Zuständigen.
create or replace function public.handle_responsibility_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_user_badge(new.assigned_user_id, 'planer');
    perform refresh_user_badge(new.assigned_user_id, 'immer_dabei');
  end if;
  if tg_op = 'DELETE'
     or (tg_op = 'UPDATE' and new.assigned_user_id is distinct from old.assigned_user_id) then
    perform refresh_user_badge(old.assigned_user_id, 'planer');
    perform refresh_user_badge(old.assigned_user_id, 'immer_dabei');
  end if;
  return null;
end;
$$;

create trigger trg_responsibility_badges
  after insert or update or delete on public.activity_responsibilities
  for each row execute function public.handle_responsibility_badges();

-- Trigger auf activity_polls: Planer des Erstellers (Umfrage gestartet).
create or replace function public.handle_poll_badges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_user_badge(new.created_by, 'planer');
  end if;
  if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.created_by is distinct from old.created_by) then
    perform refresh_user_badge(old.created_by, 'planer');
  end if;
  return null;
end;
$$;

create trigger trg_poll_badges
  after insert or update or delete on public.activity_polls
  for each row execute function public.handle_poll_badges();

-- Neues Profil → Akte mit 4 Badges bei 0 anlegen (Profil zeigt sofort alle
-- Badges als „noch nicht erreicht", kein leerer Zustand).
create or replace function public.handle_profile_badges_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into user_badges (user_id, badge)
  select new.id, b
  from unnest(array['ideengeber', 'entscheider', 'planer', 'immer_dabei']) as b
  on conflict (user_id, badge) do nothing;
  return null;
end;
$$;

create trigger trg_profile_badges_init
  after insert on public.profiles
  for each row execute function public.handle_profile_badges_init();

-- 3) Client-RPCs ----------------------------------------------------------------

-- „Angesehen"-Vermerk: setzt für den Aufrufer angesehen = verdient (alle Badges).
-- Geräteübergreifend dauerhaft; steuert die „Neu"-Hervorhebung im Profil.
create or replace function public.mark_own_badges_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update user_badges
  set highest_seen_tier = highest_earned_tier,
      updated_at = now()
  where user_id = (select auth.uid())
    and highest_seen_tier < highest_earned_tier;
$$;

-- Fremd-Sicht für die Mitgliederliste: EIN gebündelter Abruf pro Gruppe,
-- liefert ausschließlich verdiente Stufen (nie Zähler/Fortschritt anderer)
-- und nur für Mitglieder einer Gruppe, in der der Aufrufer selbst Mitglied ist.
create or replace function public.get_group_badges(p_group_id uuid)
returns table (user_id uuid, badge text, earned_tier integer)
language sql
stable
security definer
set search_path = public
as $$
  select ub.user_id, ub.badge, ub.highest_earned_tier
  from user_badges ub
  join group_members gm on gm.user_id = ub.user_id and gm.group_id = p_group_id
  where public.is_group_member(p_group_id)
    and ub.highest_earned_tier > 0;
$$;

-- 4) RLS --------------------------------------------------------------------------

alter table public.user_badges enable row level security;

-- Eigene Akte lesen (Zähler, Stufen, Angesehen-Stand); KEINE Schreib-Policies —
-- schreiben kann nur die SECURITY-DEFINER-Automatik bzw. mark_own_badges_seen.
create policy "Users read own badges" on public.user_badges
  for select to authenticated
  using (user_id = (select auth.uid()));

-- 5) Härtung -----------------------------------------------------------------------
-- Interne Automatik aus der REST-API nehmen (Trigger feuern unabhängig davon).

revoke execute on function public.badge_tier_for(integer) from public, anon, authenticated;
revoke execute on function public.badge_count_for(uuid, text) from public, anon, authenticated;
revoke execute on function public.refresh_user_badge(uuid, text) from public, anon, authenticated;
revoke execute on function public.refresh_activity_contributor_badges(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.handle_activity_badges() from public, anon, authenticated;
revoke execute on function public.handle_activity_vote_badges() from public, anon, authenticated;
revoke execute on function public.handle_poll_vote_badges() from public, anon, authenticated;
revoke execute on function public.handle_responsibility_badges() from public, anon, authenticated;
revoke execute on function public.handle_poll_badges() from public, anon, authenticated;
revoke execute on function public.handle_profile_badges_init() from public, anon, authenticated;

-- Client-RPCs: nur für eingeloggte Nutzer.
revoke execute on function public.mark_own_badges_seen() from public, anon;
grant execute on function public.mark_own_badges_seen() to authenticated;
revoke execute on function public.get_group_badges(uuid) from public, anon;
grant execute on function public.get_group_badges(uuid) to authenticated;

-- 6) Backfill (einmalig) -------------------------------------------------------------
-- Bestandsnutzer: Historie zählt ab Tag 1; verdiente Stufe = erreichter Stand,
-- angesehen = verdient → keine Toast-Flut und keine „Neu"-Markierungen beim Launch.

insert into public.user_badges (user_id, badge, action_count, highest_earned_tier, highest_seen_tier)
select p.id,
       b.badge,
       c.cnt,
       public.badge_tier_for(c.cnt),
       public.badge_tier_for(c.cnt)
from public.profiles p
cross join (values ('ideengeber'), ('entscheider'), ('planer'), ('immer_dabei')) as b(badge)
cross join lateral (select public.badge_count_for(p.id, b.badge) as cnt) c
on conflict (user_id, badge) do nothing;

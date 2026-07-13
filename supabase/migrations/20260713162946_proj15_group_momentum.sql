-- PROJ-15: Gruppen-Momentum ------------------------------------------------
-- Fortschritts-Akte je Gruppe + Gesehen-Vermerk je Mitglied.
-- Zähllogik lebt als Trigger-Automatik in der DB (atomar, fälschungssicher);
-- Clients lesen die Akte und schreiben nur ihren eigenen Gesehen-Wert.

-- 1) Tabellen ---------------------------------------------------------------

create table public.group_momentum (
  group_id uuid primary key references public.groups(id) on delete cascade,
  completed_count integer not null default 0 check (completed_count >= 0),
  highest_milestone integer not null default 0 check (highest_milestone in (0, 5, 10, 25)),
  updated_at timestamptz not null default now()
);

create table public.group_momentum_seen (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  highest_seen_milestone integer not null default 0 check (highest_seen_milestone in (0, 5, 10, 25)),
  updated_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

-- Beschleunigt den Recount im Trigger (count abgeschlossener je Gruppe).
create index idx_activities_group_completed
  on public.activities (group_id)
  where status = 'abgeschlossen';

-- 2) Automatik (Functions + Trigger) ----------------------------------------

-- Meilenstein-Schwellen 0/5/10/25 — muss zu src/lib/momentum.ts passen.
create or replace function public.momentum_milestone_for(p_count integer)
returns integer
language sql
immutable
set search_path = public
as $$
  select case
    when p_count >= 25 then 25
    when p_count >= 10 then 10
    when p_count >= 5 then 5
    else 0
  end;
$$;

-- Zählt die abgeschlossenen Aktivitäten einer Gruppe neu und hebt die
-- Meilenstein-Marke bei Bedarf an. GREATEST macht die Marke monoton:
-- Löschen senkt nur completed_count, nie highest_milestone (Anti-Farming).
create or replace function public.refresh_group_momentum(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*)::integer into v_count
  from activities
  where group_id = p_group_id and status = 'abgeschlossen';

  insert into group_momentum (group_id, completed_count, highest_milestone, updated_at)
  values (p_group_id, v_count, momentum_milestone_for(v_count), now())
  on conflict (group_id) do update
    set completed_count = excluded.completed_count,
        highest_milestone = greatest(group_momentum.highest_milestone, excluded.highest_milestone),
        updated_at = now();
end;
$$;

-- Trigger auf activities: jede Änderung zählt die betroffene(n) Gruppe(n) neu.
create or replace function public.handle_activity_momentum()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    perform refresh_group_momentum(new.group_id);
  end if;
  if tg_op in ('DELETE', 'UPDATE') and (tg_op = 'DELETE' or old.group_id <> new.group_id) then
    perform refresh_group_momentum(old.group_id);
  end if;
  return null;
end;
$$;

create trigger trg_activity_momentum
  after insert or update or delete on public.activities
  for each row execute function public.handle_activity_momentum();

-- Neue Gruppe → Akte sofort anlegen (Banner zeigt „Neue Gruppe · 0",
-- nicht erst ab dem ersten Vorschlag).
create or replace function public.handle_group_momentum_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into group_momentum (group_id) values (new.id)
  on conflict (group_id) do nothing;
  return null;
end;
$$;

create trigger trg_group_momentum_init
  after insert on public.groups
  for each row execute function public.handle_group_momentum_init();

-- Beitritt → Gesehen-Wert auf den aktuellen Gruppen-Meilenstein seeden:
-- neue Mitglieder bekommen keine Feiern für Meilensteine vor ihrem Beitritt.
create or replace function public.handle_member_momentum_seen_seed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into group_momentum_seen (group_id, user_id, highest_seen_milestone)
  values (
    new.group_id,
    new.user_id,
    coalesce((select highest_milestone from group_momentum where group_id = new.group_id), 0)
  )
  on conflict (group_id, user_id) do nothing;
  return null;
end;
$$;

create trigger trg_member_momentum_seen_seed
  after insert on public.group_members
  for each row execute function public.handle_member_momentum_seen_seed();

-- updated_at beim Client-Upsert des Gesehen-Werts automatisch pflegen.
create or replace function public.set_momentum_seen_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_momentum_seen_updated_at
  before update on public.group_momentum_seen
  for each row execute function public.set_momentum_seen_updated_at();

-- 3) RLS ---------------------------------------------------------------------

alter table public.group_momentum enable row level security;
alter table public.group_momentum_seen enable row level security;

-- Akte: alle Gruppenmitglieder lesen; KEINE Schreib-Policies —
-- schreiben kann nur die SECURITY-DEFINER-Automatik (fälschungssicher).
create policy "Members read group momentum" on public.group_momentum
  for select to authenticated
  using (public.is_group_member(group_id));

-- Gesehen-Vermerk: nur die eigene Zeile der eigenen Gruppe lesen/schreiben.
create policy "Members read own momentum seen" on public.group_momentum_seen
  for select to authenticated
  using (user_id = (select auth.uid()) and public.is_group_member(group_id));

create policy "Members insert own momentum seen" on public.group_momentum_seen
  for insert to authenticated
  with check (user_id = (select auth.uid()) and public.is_group_member(group_id));

create policy "Members update own momentum seen" on public.group_momentum_seen
  for update to authenticated
  using (user_id = (select auth.uid()) and public.is_group_member(group_id))
  with check (user_id = (select auth.uid()) and public.is_group_member(group_id));

-- 4) Realtime -----------------------------------------------------------------

alter publication supabase_realtime add table public.group_momentum;

-- 5) Backfill (einmalig) -------------------------------------------------------
-- Bestandsgruppen: Akte mit aktuellem Stand anlegen; Meilenstein-Marke gleich
-- dem erreichten Stand — Historie zählt, aber keine rückwirkende Feier …
insert into public.group_momentum (group_id, completed_count, highest_milestone)
select g.id,
       coalesce(a.cnt, 0)::integer,
       public.momentum_milestone_for(coalesce(a.cnt, 0)::integer)
from public.groups g
left join (
  select group_id, count(*) as cnt
  from public.activities
  where status = 'abgeschlossen'
  group by group_id
) a on a.group_id = g.id
on conflict (group_id) do nothing;

-- … und alle Bestandsmitglieder gelten als „hat gesehen" (kein Konfetti-Launch).
insert into public.group_momentum_seen (group_id, user_id, highest_seen_milestone)
select gm.group_id, gm.user_id, mo.highest_milestone
from public.group_members gm
join public.group_momentum mo on mo.group_id = gm.group_id
on conflict (group_id, user_id) do nothing;

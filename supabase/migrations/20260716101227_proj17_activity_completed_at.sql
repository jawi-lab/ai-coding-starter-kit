-- PROJ-17 Baustein 1: Abschlussdatum an der Aktivität.
-- Von der DB gesetzt beim Wechsel auf 'abgeschlossen' — der Client kann es
-- weder vergessen noch fälschen (Trigger überschreibt jeden Client-Wert).
-- Genutzt für Album-Sortierung, Karten-Datum und die „Neu"-Erkennung.

alter table public.activities add column completed_at timestamptz;

comment on column public.activities.completed_at is
  'PROJ-17: set by trigger when status enters ''abgeschlossen'', cleared when it leaves. Tamper-proof: client-supplied values are always overwritten.';

-- Backfill VOR dem Trigger: Termin als beste Näherung, sonst Erstelldatum.
update public.activities
   set completed_at = coalesce(start_date::timestamptz, created_at)
 where status = 'abgeschlossen';

create or replace function public.set_activity_completed_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'abgeschlossen' then
    if tg_op = 'INSERT' or old.status <> 'abgeschlossen' then
      new.completed_at := now();
    else
      -- Status bleibt abgeschlossen: bestehenden Wert erzwingen (fälschungssicher)
      new.completed_at := old.completed_at;
    end if;
  else
    new.completed_at := null;
  end if;
  return new;
end;
$$;

create trigger trg_activity_completed_at
  before insert or update on public.activities
  for each row execute function public.set_activity_completed_at();

-- Album-Query: Filter auf abgeschlossen + Sortierung nach Abschlussdatum
create index idx_activities_completed_at
  on public.activities (completed_at desc)
  where status = 'abgeschlossen';

-- PROJ-17 QA-Fixes (beide Ursachen pre-existing, von PROJ-17-QA aufgedeckt)
--
-- BUG-17-1 (High): Gruppenlöschung schlug fehl, sobald die Gruppe ≥1 Aktivität
-- hatte. Der AFTER-DELETE-Trigger handle_activity_momentum ruft beim
-- Kaskaden-Löschen refresh_group_momentum(old.group_id) auf, das bedingungslos
-- in group_momentum upsertete — für die im selben Statement gelöschte Gruppe
-- → FK-Verletzung group_momentum_group_id_fkey.
-- Fix: Existenz-Guard (analog handle_member_left_history aus PROJ-17).
-- CREATE OR REPLACE erhält die bestehende ACL (EXECUTE-Revokes aus
-- 20260713163122_proj15_momentum_harden_functions.sql bleiben wirksam).

create or replace function public.refresh_group_momentum(p_group_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  -- Guard: Während einer kaskadierenden Gruppenlöschung feuert der
  -- Aktivitäts-Trigger pro gelöschter Aktivität — die Gruppe ist dann
  -- bereits weg, ein Upsert würde die FK verletzen (BUG-17-1).
  if not exists (select 1 from groups where id = p_group_id) then
    return;
  end if;

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

-- BUG-17-2 (Medium): Ex-Mitglied als Initiator behielt Schreibrechte an der
-- eigenen, nicht-abgeschlossenen Aktivität (UPDATE/DELETE-Policies prüften im
-- Initiator-Zweig keine aktive Mitgliedschaft — Widerspruch zu Tech Design
-- Baustein 3: "Schreiben können ausschließlich aktive Mitglieder").
-- Fix: Initiator-Zweig zusätzlich an is_group_member(group_id) binden
-- (SECURITY-DEFINER-Helper aus 20260623184929). Admin-Zweig unverändert —
-- Admin-Rolle setzt Mitgliedschaft bereits voraus.

drop policy if exists activities_update_initiator_admin on activities;
create policy activities_update_initiator_admin on activities
  for update
  using (
    (status <> 'abgeschlossen'::text) and (
      (auth.uid() = initiator_id and public.is_group_member(group_id)) or
      (exists (
        select 1 from group_members
        where group_members.group_id = activities.group_id
          and group_members.user_id = auth.uid()
          and group_members.role = 'admin'::text
      ))
    )
  )
  with check (
    (auth.uid() = initiator_id and public.is_group_member(group_id)) or
    (exists (
      select 1 from group_members
      where group_members.group_id = activities.group_id
        and group_members.user_id = auth.uid()
        and group_members.role = 'admin'::text
    ))
  );

drop policy if exists activities_delete_initiator_admin on activities;
create policy activities_delete_initiator_admin on activities
  for delete
  using (
    (status = 'vorschlag'::text) and (
      (auth.uid() = initiator_id and public.is_group_member(group_id)) or
      (exists (
        select 1 from group_members
        where group_members.group_id = activities.group_id
          and group_members.user_id = auth.uid()
          and group_members.role = 'admin'::text
      ))
    )
  );

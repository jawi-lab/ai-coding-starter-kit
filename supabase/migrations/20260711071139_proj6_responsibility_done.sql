-- PROJ-6: Verantwortlichkeiten abhakbar machen ("Meine Aufgaben" auf Home).
-- Neue Spalten done/completed_at; "offen" = done = false.
alter table public.activity_responsibilities
  add column if not exists done boolean not null default false,
  add column if not exists completed_at timestamptz;

-- Bisher gab es keine UPDATE-Policy. Gruppenmitglieder dürfen Verantwortlichkeiten
-- abhaken (kollaborativ, gleiche Scope wie das Erstellen). Kein Wechsel der
-- Gruppe/Aktivität möglich (WITH CHECK erneut auf Mitgliedschaft geprüft).
drop policy if exists "Group members can update responsibilities" on public.activity_responsibilities;
create policy "Group members can update responsibilities"
  on public.activity_responsibilities for update
  using (
    is_group_member((
      select activities.group_id from public.activities
      where activities.id = activity_responsibilities.activity_id
    ))
  )
  with check (
    is_group_member((
      select activities.group_id from public.activities
      where activities.id = activity_responsibilities.activity_id
    ))
  );

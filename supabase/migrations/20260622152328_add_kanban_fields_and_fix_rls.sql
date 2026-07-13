
-- 1. Add start_date and end_date columns
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date;

-- 2. Expand status CHECK constraint with new Kanban statuses
ALTER TABLE public.activities DROP CONSTRAINT activities_status_check;
ALTER TABLE public.activities ADD CONSTRAINT activities_status_check
  CHECK (status = ANY (ARRAY[
    'vorschlag'::text,
    'zu_planen'::text,
    'geplant'::text,
    'in_planung'::text,
    'planung_abgeschlossen'::text,
    'abgeschlossen'::text
  ]));

-- 3. Drop and recreate UPDATE policy to allow Kanban status transitions
--    USING:      initiator or admin on any non-terminal status
--    WITH CHECK: user remains initiator or admin after the update
DROP POLICY IF EXISTS activities_update_initiator_admin ON activities;
CREATE POLICY activities_update_initiator_admin ON activities
  FOR UPDATE
  USING (
    (status <> 'abgeschlossen'::text) AND
    (
      (auth.uid() = initiator_id) OR
      (EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = activities.group_id
          AND group_members.user_id = auth.uid()
          AND group_members.role = 'admin'::text
      ))
    )
  )
  WITH CHECK (
    (auth.uid() = initiator_id) OR
    (EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = activities.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = 'admin'::text
    ))
  );

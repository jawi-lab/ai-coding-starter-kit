-- Security audit run-1, Fall 7, 8, 9.

-- Fall 8: Admins dürfen an Mitgliedschaften nur die Rolle ändern.
REVOKE UPDATE ON public.group_members FROM anon, authenticated;
GRANT UPDATE (role) ON public.group_members TO authenticated;

-- Fall 9: Aktivitäten starten immer als Vorschlag ohne Stimmen.
DROP POLICY activities_insert_admin_editor ON public.activities;
CREATE POLICY activities_insert_admin_editor ON public.activities
  FOR INSERT WITH CHECK (
    auth.uid() = initiator_id
    AND status = 'vorschlag'
    AND current_votes = 0
    AND EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_members.group_id = activities.group_id
        AND group_members.user_id = auth.uid()
        AND group_members.role = ANY (ARRAY['admin', 'editor'])
    )
  );

-- Fall 7 + 9: gilt nur für direkte Client-Schreibzugriffe. Der Vote-Trigger und
-- reset_activity_votes laufen als SECURITY DEFINER unter dem Owner und bleiben so
-- die einzigen Wege für Stimmenzähler und den Wechsel vorschlag <-> zu_planen.
CREATE OR REPLACE FUNCTION public.guard_activity_workflow()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF current_user NOT IN ('authenticated', 'anon') THEN
    RETURN NEW;
  END IF;

  IF NEW.group_id IS DISTINCT FROM OLD.group_id
     OR NEW.initiator_id IS DISTINCT FROM OLD.initiator_id THEN
    RAISE EXCEPTION 'Gruppe und Initiator einer Aktivität sind unveränderlich' USING ERRCODE = '42501';
  END IF;

  IF NEW.current_votes IS DISTINCT FROM OLD.current_votes THEN
    RAISE EXCEPTION 'Stimmen ändern sich nur durch Abstimmen' USING ERRCODE = '42501';
  END IF;

  IF NEW.required_votes IS DISTINCT FROM OLD.required_votes AND OLD.status <> 'vorschlag' THEN
    RAISE EXCEPTION 'Benötigte Stimmen sind nur im Vorschlag änderbar' USING ERRCODE = '42501';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status
     AND (OLD.status = 'vorschlag' OR NEW.status = 'vorschlag') THEN
    RAISE EXCEPTION 'Dieser Statuswechsel läuft nur über das Voting' USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.guard_activity_workflow() FROM public, anon, authenticated;

CREATE TRIGGER trg_activity_workflow_guard
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.guard_activity_workflow();

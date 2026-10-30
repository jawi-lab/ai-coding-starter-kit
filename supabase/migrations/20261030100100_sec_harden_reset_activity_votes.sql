-- Security audit run-1, Fall 2: NULL-sichere Berechtigungsprüfung, Status-Guard,
-- fester search_path und kein EXECUTE mehr für anon.
CREATE OR REPLACE FUNCTION public.reset_activity_votes(p_activity_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_group_id     UUID;
  v_initiator_id UUID;
  v_status       TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  SELECT group_id, initiator_id, status
    INTO v_group_id, v_initiator_id, v_status
    FROM activities
   WHERE id = p_activity_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aktivität nicht gefunden';
  END IF;

  -- Initiator nur solange Mitglied, sonst nur Admins der Gruppe
  IF NOT (
    (auth.uid() = v_initiator_id AND public.is_group_member(v_group_id))
    OR public.is_group_admin(v_group_id)
  ) THEN
    RAISE EXCEPTION 'Keine Berechtigung';
  END IF;

  IF v_status = 'abgeschlossen' THEN
    RAISE EXCEPTION 'Abgeschlossene Aktivitäten können nicht zurückgesetzt werden';
  END IF;

  -- Delete votes (trigger will decrement current_votes per row)
  DELETE FROM activity_votes WHERE activity_id = p_activity_id;

  -- Hard-reset counter and status (overrides trigger decrements)
  UPDATE activities
     SET current_votes = 0,
         status        = 'vorschlag'
   WHERE id = p_activity_id;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.reset_activity_votes(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reset_activity_votes(uuid) TO authenticated;

-- Gleiche Aufräumarbeit ohne Verhaltensänderung: diese Funktionen braucht anon nie.
-- Die is_*-Helfer bleiben bewusst ausführbar, weil RLS-Policies sie auswerten.
ALTER FUNCTION public.update_activity_votes_count() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.join_group_by_invite_code(text) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.create_group_with_membership(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.join_group_by_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_group_with_membership(text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_user_confirmed() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_activity_votes_count() FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM public, anon, authenticated;

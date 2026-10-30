-- Security audit run-1, Fall 3 (und Generator für Fall 11): Code-Erneuerung nur
-- für Admins der Gruppe, Codes aus dem CSPRNG. Ersetzt die Edge Function
-- generate-invite-code, die den Aufrufer nicht geprüft hat.
-- 32 Zeichen teilen 256 glatt, das Modulo erzeugt also keine Verzerrung.
CREATE OR REPLACE FUNCTION public.new_invite_code()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = ''
AS $function$
  SELECT string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (get_byte(b, i) % 32) + 1, 1), '' ORDER BY i
  )
  FROM extensions.gen_random_bytes(10) AS b, generate_series(0, 9) AS i;
$function$;

REVOKE EXECUTE ON FUNCTION public.new_invite_code() FROM public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.regenerate_invite_code(p_group_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_code     text;
  v_attempts int := 0;
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_group_admin(p_group_id) THEN
    RAISE EXCEPTION 'Keine Berechtigung' USING ERRCODE = '42501';
  END IF;

  LOOP
    v_attempts := v_attempts + 1;
    v_code := public.new_invite_code();
    BEGIN
      UPDATE public.groups SET invite_code = v_code WHERE id = p_group_id;
      RETURN v_code;
    EXCEPTION WHEN unique_violation THEN
      IF v_attempts >= 5 THEN
        RAISE EXCEPTION 'Fehler beim Generieren des Einladungs-Codes';
      END IF;
    END;
  END LOOP;
END;
$function$;

REVOKE EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.regenerate_invite_code(uuid) TO authenticated;

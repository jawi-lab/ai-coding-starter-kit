-- Security audit run-1, Fall 11: 10 Zeichen aus dem CSPRNG statt 6 aus random(),
-- höchstens 10 Fehlversuche pro Nutzer und Stunde.
CREATE TABLE public.invite_code_attempts (
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attempted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX invite_code_attempts_user_time_idx
  ON public.invite_code_attempts (user_id, attempted_at);

-- Zugriff nur über join_group_by_invite_code
ALTER TABLE public.invite_code_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.invite_code_attempts FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(p_invite_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_group_id UUID;
  v_user_id  UUID;
  v_status   TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'not_authenticated');
  END IF;

  -- Ensure profile is active
  SELECT status INTO v_status FROM public.profiles WHERE id = v_user_id;
  IF v_status IS DISTINCT FROM 'active' THEN
    RETURN json_build_object('error', 'not_active');
  END IF;

  -- Vor der Suche prüfen: im Limit verrät auch ein richtiger Code nichts mehr
  IF (
    SELECT count(*) FROM public.invite_code_attempts
    WHERE user_id = v_user_id AND attempted_at > now() - interval '1 hour'
  ) >= 10 THEN
    RETURN json_build_object('error', 'rate_limited');
  END IF;

  -- Find group by invite code (bypasses RLS due to SECURITY DEFINER)
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF v_group_id IS NULL THEN
    DELETE FROM public.invite_code_attempts
    WHERE user_id = v_user_id AND attempted_at < now() - interval '1 day';
    INSERT INTO public.invite_code_attempts (user_id) VALUES (v_user_id);
    RETURN json_build_object('error', 'invalid_code');
  END IF;

  -- Already a member?
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = v_user_id
  ) THEN
    RETURN json_build_object('error', 'already_member', 'group_id', v_group_id);
  END IF;

  -- Von einem Admin entfernt: kein Wiedereintritt per Code
  IF EXISTS (
    SELECT 1 FROM public.group_members_history
    WHERE group_id = v_group_id AND user_id = v_user_id AND removed_by_admin
  ) THEN
    RETURN json_build_object('error', 'removed');
  END IF;

  -- Insert as editor
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'editor');

  RETURN json_build_object('group_id', v_group_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_group_with_membership(p_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
declare
  v_user_id  uuid;
  v_status   text;
  v_group_id uuid;
  v_code     text;
  v_name     text;
  v_attempts int := 0;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return json_build_object('error', 'not_authenticated');
  end if;

  -- Ensure profile is active
  select status into v_status from public.profiles where id = v_user_id;
  if v_status is distinct from 'active' then
    return json_build_object('error', 'not_active');
  end if;

  v_name := trim(coalesce(p_name, ''));
  if v_name = '' then
    return json_build_object('error', 'invalid_name');
  end if;
  if char_length(v_name) > 50 then
    return json_build_object('error', 'name_too_long');
  end if;

  -- Generate a unique invite code (retry on collision)
  loop
    v_attempts := v_attempts + 1;
    v_code := public.new_invite_code();

    begin
      insert into public.groups (name, created_by, invite_code)
      values (v_name, v_user_id, v_code)
      returning id into v_group_id;
      exit; -- success
    exception when unique_violation then
      if v_attempts >= 5 then
        return json_build_object('error', 'code_generation_failed');
      end if;
    end;
  end loop;

  -- Add creator as admin member
  insert into public.group_members (group_id, user_id, role)
  values (v_group_id, v_user_id, 'admin');

  return json_build_object('group_id', v_group_id, 'invite_code', v_code);
end;
$function$;

-- Bestehende 6-stellige Codes einmalig ersetzen
UPDATE public.groups SET invite_code = public.new_invite_code() WHERE invite_code IS NOT NULL;

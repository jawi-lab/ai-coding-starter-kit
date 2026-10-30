-- Security audit run-1, Fall 4. Entscheidung: Ex-Mitglieder sehen nichts mehr.
-- Das hebt die PROJ-17-Regel "is or was member" auf: ohne Lesezugriff auf die
-- Gruppenzeile gibt es auch keinen Einladungscode mehr. Zusätzlich können von
-- einem Admin entfernte Nutzer nicht mehr per Code zurückkehren.

DROP POLICY members_read_group ON public.groups;
CREATE POLICY members_read_group ON public.groups
  FOR SELECT USING (public.is_group_member(id));

DROP POLICY members_read_memberships ON public.group_members;
CREATE POLICY members_read_memberships ON public.group_members
  FOR SELECT USING (public.is_group_member(group_id));

DROP POLICY activities_select_members ON public.activities;
CREATE POLICY activities_select_members ON public.activities
  FOR SELECT USING (public.is_group_member(group_id));

DROP POLICY "Group members can view comments" ON public.activity_comments;
CREATE POLICY "Group members can view comments" ON public.activity_comments
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY "Group members can view photos" ON public.activity_photos;
CREATE POLICY "Group members can view photos" ON public.activity_photos
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY "Group members can view poll options" ON public.activity_poll_options;
CREATE POLICY "Group members can view poll options" ON public.activity_poll_options
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY "Group members can view poll votes" ON public.activity_poll_votes;
CREATE POLICY "Group members can view poll votes" ON public.activity_poll_votes
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY "Group members can view polls" ON public.activity_polls;
CREATE POLICY "Group members can view polls" ON public.activity_polls
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY "Group members can view responsibilities" ON public.activity_responsibilities;
CREATE POLICY "Group members can view responsibilities" ON public.activity_responsibilities
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY activity_votes_select_members ON public.activity_votes;
CREATE POLICY activity_votes_select_members ON public.activity_votes
  FOR SELECT USING (public.is_activity_group_member(activity_id));

DROP POLICY activity_photos_select ON storage.objects;
CREATE POLICY activity_photos_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'activity-photos'
    AND public.is_group_member((
      SELECT a.group_id FROM public.activities a
      WHERE a.id = ((storage.foldername(objects.name))[1])::uuid
    ))
  );

DROP POLICY comment_images_select ON storage.objects;
CREATE POLICY comment_images_select ON storage.objects
  FOR SELECT USING (
    bucket_id = 'activity-comment-images'
    AND public.is_group_member((
      SELECT a.group_id FROM public.activities a
      WHERE a.id = ((storage.foldername(objects.name))[1])::uuid
    ))
  );

DROP POLICY "Users read own membership history" ON public.group_members_history;

DROP FUNCTION public.is_or_was_activity_group_member(uuid);
DROP FUNCTION public.is_or_was_group_member(uuid);

-- Merkmal "entfernt durch Admin". Altbestand bleibt false: rückwirkend ist nicht
-- bekannt, wer die Zeile gelöscht hat.
ALTER TABLE public.group_members_history
  ADD COLUMN removed_by_admin boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.handle_member_left_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
begin
  -- Kaskaden-Schutz: läuft die Löschung der Gruppe bzw. des Nutzer-Accounts,
  -- ist die Elternzeile bereits weg — dann keinen Historien-Eintrag anlegen
  -- (FK würde sonst die Kaskade abbrechen).
  if exists (select 1 from public.groups where id = old.group_id)
     and exists (select 1 from auth.users where id = old.user_id) then
    insert into public.group_members_history (group_id, user_id, removed_by_admin)
    values (old.group_id, old.user_id, auth.uid() is not null and auth.uid() <> old.user_id)
    on conflict (group_id, user_id) do update
      set left_at = now(), removed_by_admin = excluded.removed_by_admin;
  end if;
  return null;
end;
$function$;

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

  -- Find group by invite code (bypasses RLS due to SECURITY DEFINER)
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF v_group_id IS NULL THEN
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

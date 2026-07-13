-- Atomically create a group and add the creator as admin member.
-- Runs as SECURITY DEFINER to avoid the RLS chicken-and-egg problem where the
-- creator cannot read back the just-inserted group (members_read_group requires
-- an existing membership row that only gets created afterwards).
create or replace function public.create_group_with_membership(p_name text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid;
  v_status   text;
  v_group_id uuid;
  v_code     text;
  v_chars    text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
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

  -- Generate a unique 6-char invite code (retry on collision)
  loop
    v_attempts := v_attempts + 1;
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, floor(random() * length(v_chars))::int + 1, 1);
    end loop;

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
$$;

grant execute on function public.create_group_with_membership(text) to authenticated;

-- is_group_member / is_group_admin are used inside the group_members RLS
-- policies but were SECURITY INVOKER, so their internal SELECT on group_members
-- re-triggered the same policy -> infinite recursion ("stack depth limit
-- exceeded"). Reading groups/memberships therefore always failed. Recreate them
-- as SECURITY DEFINER (with a fixed search_path) so the internal lookup bypasses
-- RLS. This is the standard Supabase pattern for RLS helper functions.

create or replace function public.is_group_member(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid()
  );
$$;

create or replace function public.is_group_admin(gid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = gid and user_id = auth.uid() and role = 'admin'
  );
$$;

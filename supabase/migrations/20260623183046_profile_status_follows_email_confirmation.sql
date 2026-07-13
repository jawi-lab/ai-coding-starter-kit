-- Make profile.status reflect real email-confirmation state, server-side.
-- Previously handle_new_user always inserted 'active', so the pending->active
-- gate (AuthGuard / /signup/pending) was effectively bypassed.

-- 1. New signups start 'pending' unless already confirmed (e.g. confirmation disabled)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    case when new.email_confirmed_at is not null then 'active' else 'pending' end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Flip the profile to 'active' the moment the email gets confirmed
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (old.email_confirmed_at is null and new.email_confirmed_at is not null) then
    update public.profiles
    set status = 'active', updated_at = now()
    where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_confirmed on auth.users;
create trigger on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row execute function public.handle_user_confirmed();

-- 3. Backfill: bring existing profiles in sync with their confirmation state
update public.profiles p
set status = case when u.email_confirmed_at is not null then 'active' else 'pending' end,
    updated_at = now()
from auth.users u
where u.id = p.id
  and p.status is distinct from (case when u.email_confirmed_at is not null then 'active' else 'pending' end);

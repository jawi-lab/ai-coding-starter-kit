alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- Existing users have already set up their profile and groups, so they should
-- not be forced through the new first-login onboarding flow. New signups keep
-- the column default (false) and see the flow on their first login.
update public.profiles set onboarded = true where onboarded = false;

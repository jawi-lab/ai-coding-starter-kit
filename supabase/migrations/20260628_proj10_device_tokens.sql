-- PROJ-10: device_tokens — one FCM token per registered device, many per user.
--
-- The client half (src/lib/native/push.ts) registers a token on login / activation
-- (via the register_device_token RPC) and deletes it on logout. The send-push Edge
-- Function reads these rows via the service role to deliver pushes. A token is
-- globally unique so a re-login on the same device reassigns the existing row to
-- the new user (Re-Login edge case).

create table if not exists public.device_tokens (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  token      text not null unique,
  platform   text not null check (platform in ('ios', 'android', 'web')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.device_tokens is
  'PROJ-10: FCM device tokens per user. One row per device; unique token. Read by the send-push Edge Function (service role).';

-- send-push looks up tokens by recipient user_id (.in('user_id', [...])).
create index if not exists idx_device_tokens_user_id on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

-- A user may only read their own tokens (the send-push function uses the service
-- role and bypasses RLS).
create policy "Users see own device tokens"
  on public.device_tokens for select to authenticated
  using (auth.uid() = user_id);

-- A user may remove their own token (logout decoupling).
create policy "Users delete own device tokens"
  on public.device_tokens for delete to authenticated
  using (auth.uid() = user_id);

-- Registration goes through a SECURITY DEFINER RPC rather than a direct client
-- INSERT/UPDATE. The RPC always stamps user_id = auth.uid(), so the Re-Login case
-- (a token row currently owned by another user is reassigned to the new user via
-- the unique-token upsert) works without a permissive USING(true) UPDATE policy.
create or replace function public.register_device_token(p_token text, p_platform text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  if p_platform not in ('ios', 'android', 'web') then
    raise exception 'invalid platform';
  end if;
  insert into public.device_tokens (user_id, token, platform, updated_at)
  values (auth.uid(), p_token, p_platform, now())
  on conflict (token)
  do update set user_id = excluded.user_id, platform = excluded.platform, updated_at = now();
end;
$$;

revoke execute on function public.register_device_token(text, text) from public, anon;
grant execute on function public.register_device_token(text, text) to authenticated;

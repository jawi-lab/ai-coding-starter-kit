-- Replace the client upsert path (which required a permissive USING(true) UPDATE
-- policy to support the re-login token reassignment) with a SECURITY DEFINER RPC
-- that always stamps user_id = auth.uid(). Removes the always-true policy.

drop policy if exists "Users insert own device tokens" on public.device_tokens;
drop policy if exists "Users claim device tokens" on public.device_tokens;
drop policy if exists "Users see own device tokens" on public.device_tokens;
drop policy if exists "Users delete own device tokens" on public.device_tokens;

create policy "Users see own device tokens"
  on public.device_tokens for select to authenticated
  using (auth.uid() = user_id);

create policy "Users delete own device tokens"
  on public.device_tokens for delete to authenticated
  using (auth.uid() = user_id);

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

-- Trigger functions must never be callable as RPCs.
revoke execute on function public.proj10_dispatch_push() from public, anon, authenticated;
revoke execute on function public.set_activity_last_changed_by() from public, anon, authenticated;

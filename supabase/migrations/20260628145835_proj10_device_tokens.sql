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

create index if not exists idx_device_tokens_user_id on public.device_tokens (user_id);

alter table public.device_tokens enable row level security;

create policy "Users see own device tokens"
  on public.device_tokens for select
  using (auth.uid() = user_id);

create policy "Users insert own device tokens"
  on public.device_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users claim device tokens"
  on public.device_tokens for update
  using (true)
  with check (auth.uid() = user_id);

create policy "Users delete own device tokens"
  on public.device_tokens for delete
  using (auth.uid() = user_id);

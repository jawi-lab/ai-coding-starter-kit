alter table public.activities
  add column if not exists last_changed_by uuid references public.profiles(id) on delete set null;

create or replace function public.set_activity_last_changed_by()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.last_changed_by := auth.uid();
  return new;
end;
$$;

drop trigger if exists trg_activities_last_changed_by on public.activities;
create trigger trg_activities_last_changed_by
  before insert or update on public.activities
  for each row execute function public.set_activity_last_changed_by();

create extension if not exists pg_net;

do $$
begin
  if not exists (select 1 from vault.secrets where name = 'push_webhook_secret') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'push_webhook_secret',
      'PROJ-10: shared secret for the send-push webhook (matches PUSH_WEBHOOK_SECRET).'
    );
  end if;
end;
$$;

create or replace function public.proj10_dispatch_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  secret text;
begin
  select decrypted_secret into secret
  from vault.decrypted_secrets
  where name = 'push_webhook_secret'
  limit 1;

  if secret is null then
    return null;
  end if;

  perform net.http_post(
    url     := 'https://fogldssdmqgeffpuhvxd.supabase.co/functions/v1/send-push',
    body    := jsonb_build_object(
      'type',       tg_op,
      'table',      tg_table_name,
      'schema',     tg_table_schema,
      'record',     to_jsonb(new),
      'old_record', case when tg_op = 'UPDATE' then to_jsonb(old) else null end
    ),
    headers := jsonb_build_object(
      'Content-Type',    'application/json',
      'x-webhook-secret', secret
    ),
    timeout_milliseconds := 5000
  );
  return null;
end;
$$;

drop trigger if exists trg_push_activity_insert on public.activities;
create trigger trg_push_activity_insert
  after insert on public.activities
  for each row
  when (new.status = 'vorschlag')
  execute function public.proj10_dispatch_push();

drop trigger if exists trg_push_activity_update on public.activities;
create trigger trg_push_activity_update
  after update on public.activities
  for each row
  when (
    (old.status = 'vorschlag' and new.status = 'zu_planen')
    or (old.start_date is null and new.start_date is not null)
  )
  execute function public.proj10_dispatch_push();

drop trigger if exists trg_push_comment_insert on public.activity_comments;
create trigger trg_push_comment_insert
  after insert on public.activity_comments
  for each row
  when (array_length(new.mentioned_user_ids, 1) > 0)
  execute function public.proj10_dispatch_push();

drop trigger if exists trg_push_responsibility_insert on public.activity_responsibilities;
create trigger trg_push_responsibility_insert
  after insert on public.activity_responsibilities
  for each row
  when (new.assigned_user_id is not null)
  execute function public.proj10_dispatch_push();

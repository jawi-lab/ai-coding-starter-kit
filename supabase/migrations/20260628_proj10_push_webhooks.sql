-- PROJ-10: Database-side push triggers.
--
-- Five group events must fire a server-side push (architecture decision: DB
-- webhooks → send-push Edge Function, never a client call). We implement the
-- webhooks directly with pg_net so they are version-controlled here instead of
-- living only in the dashboard UI.
--
--   activities                INSERT (status=vorschlag)       → "Neuer Vorschlag"
--   activities                UPDATE (vorschlag→zu_planen)    → "Wird geplant"
--   activities                UPDATE (start_date null→set)    → "Termin steht"
--   activity_comments         INSERT (mentioned_user_ids > 0) → "@-Erwähnung"
--   activity_responsibilities INSERT                          → "Verantwortung"
--
-- The Edge Function classifies the event, resolves recipients (current group
-- members / mentioned / assigned), removes the trigger's actor, and sends FCM.

-- 1) Actor tracking on activities ------------------------------------------------
-- UPDATE webhook payloads do not carry who made the change, but the trigger
-- exclusion ("Auslöser bekommt nie eine Push") needs it. A BEFORE trigger stamps
-- the acting user (from the request JWT) onto the row so the AFTER webhook payload
-- carries it. NULL when changed by the service role (no actor to exclude).
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

-- 2) Async HTTP (pg_net) ---------------------------------------------------------
create extension if not exists pg_net;

-- 3) Webhook secret in Vault -----------------------------------------------------
-- The Edge Function rejects calls whose `x-webhook-secret` header does not match
-- its PUSH_WEBHOOK_SECRET env var. The trigger reads the same value from Vault so
-- the secret is never hardcoded in this committed migration. Generated once here;
-- the value must be copied into the function's PUSH_WEBHOOK_SECRET secret (see the
-- /backend manual-setup notes in the feature spec).
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

-- 4) Webhook dispatch ------------------------------------------------------------
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

  -- Not configured yet (no secret) → do nothing, never block the write.
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

-- 5) Triggers (narrow WHEN clauses keep the Edge Function from being woken for
--    irrelevant writes; it re-validates the event regardless) --------------------

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

-- These are trigger functions, never meant to be callable as PostgREST RPCs.
revoke execute on function public.proj10_dispatch_push() from public, anon, authenticated;
revoke execute on function public.set_activity_last_changed_by() from public, anon, authenticated;

-- PROJ-12 hardening (BUG-12-3): restrict authenticated UPDATE on public.notifications
-- to ONLY the `read` column. RLS pins rows to the owner but can't limit columns; the
-- client only ever flips `read`, so a column-level GRANT is the tight, behaviour-neutral
-- fix. The service role bypasses these grants (inserts/prune unaffected).
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

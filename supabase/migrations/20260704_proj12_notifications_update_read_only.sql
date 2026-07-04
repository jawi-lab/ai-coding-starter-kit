-- PROJ-12 hardening (BUG-12-3): restrict what an authenticated user may UPDATE on
-- public.notifications to ONLY the `read` column.
--
-- The RLS UPDATE policy already pins rows to their owner (auth.uid() = user_id), but a
-- policy cannot limit WHICH columns are writable — so a client could otherwise rewrite
-- the frozen title/body/deep-link of its own history rows. The client only ever flips
-- `read` (mark one / mark all read), so a column-level GRANT is the tight fit and a
-- pure defense-in-depth tightening (no behaviour change for the app).
--
-- The service role (send-push inserts, prune deletes) bypasses these grants, so writes
-- and retention are unaffected.

revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

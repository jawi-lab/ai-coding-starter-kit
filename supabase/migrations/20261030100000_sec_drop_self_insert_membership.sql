-- Security audit run-1, Fall 1: Mitgliedschaften entstehen nur noch über die
-- SECURITY-DEFINER-RPCs create_group_with_membership / join_group_by_invite_code.
-- Die alte Policy erlaubte jedem aktiven Nutzer, sich mit beliebiger Rolle
-- (auch admin) in jede Gruppe einzutragen.
DROP POLICY IF EXISTS users_insert_own_membership ON public.group_members;
REVOKE INSERT ON public.group_members FROM anon, authenticated;

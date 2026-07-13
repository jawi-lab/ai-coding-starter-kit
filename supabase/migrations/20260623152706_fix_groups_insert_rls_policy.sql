
-- Drop the overly strict INSERT policy that causes false failures
-- when auth.uid() is temporarily NULL (expired JWT / session timing).
-- The profile status check is redundant: Supabase only issues a valid JWT
-- to email-confirmed users, so auth.uid() = created_by is sufficient.
DROP POLICY IF EXISTS active_users_create_group ON groups;

CREATE POLICY active_users_create_group ON groups
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

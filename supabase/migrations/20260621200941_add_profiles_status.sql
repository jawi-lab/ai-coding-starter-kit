-- Add status column to profiles table for email verification state
ALTER TABLE public.profiles
  ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'active'));

-- Backfill existing rows (none expected in MVP, but safe to have)
-- New column defaults to 'pending'; no data exists yet so nothing to backfill

-- Verify constraint name for documentation
COMMENT ON COLUMN public.profiles.status IS 'Email verification state: pending = unverified, active = email confirmed';

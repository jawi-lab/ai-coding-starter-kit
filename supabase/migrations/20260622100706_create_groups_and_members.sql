
-- ============================================================
-- PROJ-3: groups + group_members tables with RLS
-- ============================================================

-- groups table
CREATE TABLE public.groups (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 50),
  invite_code TEXT        UNIQUE,
  created_by  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- group_members table
CREATE TABLE public.group_members (
  group_id  UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES auth.users(id)   ON DELETE CASCADE,
  role      TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'observer')) DEFAULT 'editor',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_groups_invite_code      ON public.groups(invite_code);
CREATE INDEX idx_group_members_user_id   ON public.group_members(user_id);
CREATE INDEX idx_group_members_group_id  ON public.group_members(group_id);
CREATE INDEX idx_group_members_role      ON public.group_members(group_id, role);

-- ============================================================
-- Helper functions (SECURITY INVOKER — run as calling user)
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_group_member(gid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION public.is_group_admin(gid UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY INVOKER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = gid AND user_id = auth.uid() AND role = 'admin'
  )
$$;

-- ============================================================
-- RLS Policies — groups
-- ============================================================

CREATE POLICY "members_read_group"
  ON public.groups FOR SELECT
  USING (public.is_group_member(id));

CREATE POLICY "active_users_create_group"
  ON public.groups FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
  );

CREATE POLICY "admins_update_group"
  ON public.groups FOR UPDATE
  USING  (public.is_group_admin(id))
  WITH CHECK (public.is_group_admin(id));

-- Only the last remaining member (who must be admin) can delete the group
CREATE POLICY "last_admin_delete_group"
  ON public.groups FOR DELETE
  USING (
    public.is_group_admin(id) AND
    (SELECT COUNT(*) FROM public.group_members WHERE group_id = id) = 1
  );

-- ============================================================
-- RLS Policies — group_members
-- ============================================================

CREATE POLICY "members_read_memberships"
  ON public.group_members FOR SELECT
  USING (public.is_group_member(group_id));

-- Users can only insert their own membership row (used for createGroup)
CREATE POLICY "users_insert_own_membership"
  ON public.group_members FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND status = 'active')
  );

-- Admins can change roles of other members
CREATE POLICY "admins_update_member_role"
  ON public.group_members FOR UPDATE
  USING  (public.is_group_admin(group_id) AND user_id != auth.uid())
  WITH CHECK (public.is_group_admin(group_id) AND user_id != auth.uid());

-- Members can leave (delete own row); admins can remove others
CREATE POLICY "members_delete_membership"
  ON public.group_members FOR DELETE
  USING (
    user_id = auth.uid() OR
    (public.is_group_admin(group_id) AND user_id != auth.uid())
  );

-- ============================================================
-- RPC: join_group_by_invite_code
-- SECURITY DEFINER so non-members can look up groups by code
-- without exposing all groups to authenticated users
-- ============================================================

CREATE OR REPLACE FUNCTION public.join_group_by_invite_code(p_invite_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_group_id UUID;
  v_user_id  UUID;
  v_status   TEXT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'not_authenticated');
  END IF;

  -- Ensure profile is active
  SELECT status INTO v_status FROM public.profiles WHERE id = v_user_id;
  IF v_status IS DISTINCT FROM 'active' THEN
    RETURN json_build_object('error', 'not_active');
  END IF;

  -- Find group by invite code (bypasses RLS due to SECURITY DEFINER)
  SELECT id INTO v_group_id
  FROM public.groups
  WHERE invite_code = UPPER(TRIM(p_invite_code));

  IF v_group_id IS NULL THEN
    RETURN json_build_object('error', 'invalid_code');
  END IF;

  -- Already a member?
  IF EXISTS (
    SELECT 1 FROM public.group_members
    WHERE group_id = v_group_id AND user_id = v_user_id
  ) THEN
    RETURN json_build_object('error', 'already_member', 'group_id', v_group_id);
  END IF;

  -- Insert as editor
  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'editor');

  RETURN json_build_object('group_id', v_group_id);
END;
$$;

-- Allow authenticated users to call this function
GRANT EXECUTE ON FUNCTION public.join_group_by_invite_code(TEXT) TO authenticated;

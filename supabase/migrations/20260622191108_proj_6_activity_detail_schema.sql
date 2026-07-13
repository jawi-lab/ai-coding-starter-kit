
-- 1. Add location column to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS location text;

-- 2. activity_comments table
CREATE TABLE IF NOT EXISTS activity_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content jsonb NOT NULL,
  mentioned_user_ids uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT content_length_limit CHECK (char_length(content::text) <= 50000)
);

ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_created ON activity_comments(activity_id, created_at);

CREATE POLICY "Group members can view comments"
  ON activity_comments FOR SELECT
  USING (
    is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Group members can create comments"
  ON activity_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Authors and admins can delete comments"
  ON activity_comments FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_group_admin((SELECT group_id FROM activities WHERE id = activity_id))
  );

-- 3. activity_responsibilities table
CREATE TABLE IF NOT EXISTS activity_responsibilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  label text NOT NULL CHECK (char_length(label) >= 1 AND char_length(label) <= 200),
  assigned_user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_responsibilities ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_responsibilities_activity_id ON activity_responsibilities(activity_id);

CREATE POLICY "Group members can view responsibilities"
  ON activity_responsibilities FOR SELECT
  USING (
    is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Group members can create responsibilities"
  ON activity_responsibilities FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Creators and admins can delete responsibilities"
  ON activity_responsibilities FOR DELETE
  USING (
    auth.uid() = created_by
    OR is_group_admin((SELECT group_id FROM activities WHERE id = activity_id))
  );

-- 4. activity_photos table
CREATE TABLE IF NOT EXISTS activity_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE activity_photos ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_activity_photos_activity_id ON activity_photos(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_photos_user_activity ON activity_photos(activity_id, user_id);

CREATE POLICY "Group members can view photos"
  ON activity_photos FOR SELECT
  USING (
    is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Group members can upload photos"
  ON activity_photos FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND is_group_member((SELECT group_id FROM activities WHERE id = activity_id))
  );

CREATE POLICY "Uploaders and admins can delete photos"
  ON activity_photos FOR DELETE
  USING (
    auth.uid() = user_id
    OR is_group_admin((SELECT group_id FROM activities WHERE id = activity_id))
  );

-- 5. Enable Realtime for activity_comments
ALTER PUBLICATION supabase_realtime ADD TABLE activity_comments;


-- ============================================================
-- PROJ-4: Aktivitäts-Vorschläge & Voting
-- ============================================================

-- Activities table
CREATE TABLE activities (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id         UUID        NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  initiator_id     UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT        NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  duration_category TEXT       NOT NULL CHECK (duration_category IN ('spontan', 'wochenende', 'laengerer_zeitraum')),
  required_votes   INTEGER     NOT NULL CHECK (required_votes >= 1),
  current_votes    INTEGER     NOT NULL DEFAULT 0 CHECK (current_votes >= 0),
  url              TEXT,
  description      TEXT,
  og_image_url     TEXT,
  status           TEXT        NOT NULL DEFAULT 'vorschlag'
                               CHECK (status IN ('vorschlag', 'zu_planen', 'geplant', 'abgeschlossen')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity votes table
CREATE TABLE activity_votes (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID        NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL REFERENCES profiles(id)  ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT activity_votes_unique_vote UNIQUE (activity_id, user_id)
);

-- Enable RLS
ALTER TABLE activities     ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_votes ENABLE ROW LEVEL SECURITY;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER TABLE activities REPLICA IDENTITY FULL;

-- Performance indexes
CREATE INDEX idx_activities_group_id        ON activities(group_id);
CREATE INDEX idx_activities_status          ON activities(status);
CREATE INDEX idx_activities_group_status    ON activities(group_id, status);
CREATE INDEX idx_activity_votes_activity_id ON activity_votes(activity_id);
CREATE INDEX idx_activity_votes_user_id     ON activity_votes(user_id);

-- ============================================================
-- RLS: activities
-- ============================================================

CREATE POLICY "activities_select_members"
  ON activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = activities.group_id
        AND group_members.user_id  = auth.uid()
    )
  );

CREATE POLICY "activities_insert_admin_editor"
  ON activities FOR INSERT
  WITH CHECK (
    auth.uid() = initiator_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = activities.group_id
        AND group_members.user_id  = auth.uid()
        AND group_members.role IN ('admin', 'editor')
    )
  );

-- Only allows updating fields other than status; status is changed by trigger or RPC only
CREATE POLICY "activities_update_initiator_admin"
  ON activities FOR UPDATE
  USING (
    status = 'vorschlag'
    AND (
      auth.uid() = initiator_id
      OR EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = activities.group_id
          AND group_members.user_id  = auth.uid()
          AND group_members.role = 'admin'
      )
    )
  )
  WITH CHECK (
    status = 'vorschlag'
    AND (
      auth.uid() = initiator_id
      OR EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = activities.group_id
          AND group_members.user_id  = auth.uid()
          AND group_members.role = 'admin'
      )
    )
  );

CREATE POLICY "activities_delete_initiator_admin"
  ON activities FOR DELETE
  USING (
    status = 'vorschlag'
    AND (
      auth.uid() = initiator_id
      OR EXISTS (
        SELECT 1 FROM group_members
        WHERE group_members.group_id = activities.group_id
          AND group_members.user_id  = auth.uid()
          AND group_members.role = 'admin'
      )
    )
  );

-- ============================================================
-- RLS: activity_votes
-- ============================================================

CREATE POLICY "activity_votes_select_members"
  ON activity_votes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM activities a
      JOIN group_members gm ON gm.group_id = a.group_id
      WHERE a.id = activity_votes.activity_id
        AND gm.user_id = auth.uid()
    )
  );

-- Any group member can vote on a 'vorschlag' activity (own user_id only)
CREATE POLICY "activity_votes_insert_members"
  ON activity_votes FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM activities a
      JOIN group_members gm ON gm.group_id = a.group_id
      WHERE a.id  = activity_votes.activity_id
        AND gm.user_id = auth.uid()
        AND a.status = 'vorschlag'
    )
  );

-- Users can only remove their own votes
CREATE POLICY "activity_votes_delete_own"
  ON activity_votes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: update current_votes + auto status change
-- SECURITY DEFINER: bypasses RLS so trigger can update activities
-- regardless of who initiated the vote.
-- ============================================================

CREATE OR REPLACE FUNCTION update_activity_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE activities
       SET current_votes = current_votes + 1,
           status = CASE
             WHEN (current_votes + 1 >= required_votes AND status = 'vorschlag')
             THEN 'zu_planen'
             ELSE status
           END
     WHERE id = NEW.activity_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE activities
       SET current_votes = GREATEST(current_votes - 1, 0)
     WHERE id = OLD.activity_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_activity_votes_count
  AFTER INSERT OR DELETE ON activity_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_votes_count();

-- ============================================================
-- RPC: reset_activity_votes
-- Transactional: deletes all votes + resets counter + status.
-- Permission check inside because SECURITY DEFINER bypasses RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION reset_activity_votes(p_activity_id UUID)
RETURNS VOID AS $$
DECLARE
  v_group_id     UUID;
  v_initiator_id UUID;
BEGIN
  SELECT group_id, initiator_id
    INTO v_group_id, v_initiator_id
    FROM activities
   WHERE id = p_activity_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aktivität nicht gefunden';
  END IF;

  IF auth.uid() <> v_initiator_id THEN
    IF NOT EXISTS (
      SELECT 1 FROM group_members
       WHERE group_id = v_group_id
         AND user_id  = auth.uid()
         AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Keine Berechtigung';
    END IF;
  END IF;

  -- Delete votes (trigger will decrement current_votes per row)
  DELETE FROM activity_votes WHERE activity_id = p_activity_id;

  -- Hard-reset counter and status (overrides trigger decrements)
  UPDATE activities
     SET current_votes = 0,
         status        = 'vorschlag'
   WHERE id = p_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- calendar_connections: stores Google OAuth tokens per user (max 1 per user)
CREATE TABLE calendar_connections (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_email TEXT       NOT NULL,
  access_token TEXT       NOT NULL,
  refresh_token TEXT      NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own calendar connection" ON calendar_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_calendar_connections_user_id   ON calendar_connections(user_id);
CREATE INDEX idx_calendar_connections_expires_at ON calendar_connections(expires_at);

-- user_date_blocks: manual unavailability blocks (day-level granularity)
CREATE TABLE user_date_blocks (
  id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE  NOT NULL,
  end_date   DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

ALTER TABLE user_date_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own date blocks" ON user_date_blocks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_date_blocks_user_id    ON user_date_blocks(user_id);
CREATE INDEX idx_user_date_blocks_start_date ON user_date_blocks(start_date);

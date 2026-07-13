
CREATE TABLE group_availability_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id    UUID NOT NULL UNIQUE REFERENCES groups(id) ON DELETE CASCADE,
  cached_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data        JSONB NOT NULL DEFAULT '{}'
);

-- Enable RLS but add no policies — only service role can access
ALTER TABLE group_availability_cache ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_group_availability_cache_group_id ON group_availability_cache(group_id);

-- Internal Analytics Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT, -- Anonymous ID to track unique visitors crudely
  user_id UUID REFERENCES auth.users(id), -- Nullable
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster aggregation by date
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_name ON analytics_events(event_name);

-- RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (anonymous tracking)
CREATE POLICY "Public can insert analytics" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Only specific admins can SELECT
-- For MVP: We allow authenticated users to SELECT (in real app, use roles)
CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT USING (auth.role() = 'authenticated');

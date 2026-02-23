-- ============================================
-- 03: ANALYTICS
-- НАЗНАЧЕНИЕ: Система трекинга событий (регистрации, клики, оплаты).
-- КОГДА ЗАПУСКАТЬ: Четвертым.
-- ЗАМЕНЯЕТ: Любой код по таблице analytics_events.
-- ============================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы для скорости работы админки
CREATE INDEX IF NOT EXISTS idx_analytics_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);

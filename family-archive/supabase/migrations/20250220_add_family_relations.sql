-- ============================================
-- МИГРАЦИЯ: Семейное древо и связи
-- Дата: 2025-02-20
-- Безопасна для повторного запуска
-- ============================================

-- 1. Таблица связей (если не существует)
CREATE TABLE IF NOT EXISTS family_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'spouse', 'sibling')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, from_member_id, to_member_id, relation_type)
);

-- 2. Индексы
CREATE INDEX IF NOT EXISTS idx_relations_family ON family_relations(family_id);
CREATE INDEX IF NOT EXISTS idx_relations_from ON family_relations(from_member_id);
CREATE INDEX IF NOT EXISTS idx_relations_to ON family_relations(to_member_id);
CREATE INDEX IF NOT EXISTS idx_relations_type ON family_relations(relation_type);

-- 3. RLS
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;

-- 4. Политики (с проверкой существования)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Public can view family relations') THEN
    CREATE POLICY "Public can view family relations" ON family_relations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Users can manage relations in own families') THEN
    CREATE POLICY "Users can manage relations in own families" ON family_relations FOR ALL USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;
END $$;

-- 5. Колонки в members
ALTER TABLE members ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'unknown'));
ALTER TABLE members ADD COLUMN IF NOT EXISTS generation INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS display_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS life_path JSONB DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 6. Колонки в families
ALTER TABLE families ADD COLUMN IF NOT EXISTS root_member_id UUID REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE families ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 7. Дефолтные значения
UPDATE members SET gender = 'unknown' WHERE gender IS NULL;
UPDATE members SET display_role = relationship WHERE relationship IS NOT NULL AND display_role IS NULL;

-- ============================================
-- ПОЛНЫЙ SQL ДЛЯ SUPABASE
-- Файл: supabase/schema.sql
-- Как использовать:
-- 1. Открой Supabase Dashboard
-- 2. Зайди в SQL Editor
-- 3. Скопируй ВЕСЬ этот файл
-- 4. Нажми Run
-- Код безопасен - использует IF NOT EXISTS
-- ============================================

-- 1. Расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ТАБЛИЦА FAMILIES (семьи)
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hero_image TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  root_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Добавляем колонки в families если их нет
ALTER TABLE families ADD COLUMN IF NOT EXISTS root_member_id UUID REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE families ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 3. ТАБЛИЦА MEMBERS (члены семьи)
-- ============================================
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  death_date DATE,
  biography TEXT,
  photo_url TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  quotes JSONB DEFAULT '[]'::jsonb,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Добавляем колонки в members если их нет
ALTER TABLE members ADD COLUMN IF NOT EXISTS relationship TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'unknown'));
ALTER TABLE members ADD COLUMN IF NOT EXISTS generation INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS display_role TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS life_path JSONB DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ============================================
-- 4. ТАБЛИЦА FAMILY_RELATIONS (связи между членами)
-- ============================================
CREATE TABLE IF NOT EXISTS family_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'spouse', 'sibling')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, from_member_id, to_member_id, relation_type)
);

-- ============================================
-- 5. ИНДЕКСЫ (для быстрого поиска)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_families_slug ON families(slug);
CREATE INDEX IF NOT EXISTS idx_families_user ON families(user_id);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_relations_family ON family_relations(family_id);
CREATE INDEX IF NOT EXISTS idx_relations_from ON family_relations(from_member_id);
CREATE INDEX IF NOT EXISTS idx_relations_to ON family_relations(to_member_id);
CREATE INDEX IF NOT EXISTS idx_relations_type ON family_relations(relation_type);

-- ============================================
-- 6. RLS (Row Level Security) - защита данных
-- ============================================
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. ПОЛИТИКИ БЕЗОПАСНОСТИ
-- Используем DO $$ чтобы избежать ошибок "already exists"
-- ============================================
DO $$
BEGIN
  -- FAMILIES: чтение для всех
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Public can view families') THEN
    CREATE POLICY "Public can view families" ON families FOR SELECT USING (true);
  END IF;
  -- FAMILIES: создание только владельцем
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can insert own families') THEN
    CREATE POLICY "Users can insert own families" ON families FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  -- FAMILIES: изменение только владельцем
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can update own families') THEN
    CREATE POLICY "Users can update own families" ON families FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  -- FAMILIES: удаление только владельцем
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can delete own families') THEN
    CREATE POLICY "Users can delete own families" ON families FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- MEMBERS: чтение для всех
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Public can view members') THEN
    CREATE POLICY "Public can view members" ON members FOR SELECT USING (true);
  END IF;
  -- MEMBERS: создание только владельцем семьи
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can insert members to own families') THEN
    CREATE POLICY "Users can insert members to own families" ON members FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;
  -- MEMBERS: изменение только владельцем семьи
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can update members of own families') THEN
    CREATE POLICY "Users can update members of own families" ON members FOR UPDATE USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;
  -- MEMBERS: удаление только владельцем семьи
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can delete members of own families') THEN
    CREATE POLICY "Users can delete members of own families" ON members FOR DELETE USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;

  -- FAMILY_RELATIONS: чтение для всех
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Public can view family relations') THEN
    CREATE POLICY "Public can view family relations" ON family_relations FOR SELECT USING (true);
  END IF;
  -- FAMILY_RELATIONS: управление только владельцем семьи
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Users can manage relations in own families') THEN
    CREATE POLICY "Users can manage relations in own families" ON family_relations FOR ALL USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;
END $$;

-- ============================================
-- 8. ДЕФОЛТНЫЕ ЗНАЧЕНИЯ
-- ============================================
UPDATE members SET gender = 'unknown' WHERE gender IS NULL;
UPDATE members SET display_role = relationship WHERE relationship IS NOT NULL AND display_role IS NULL;

-- ============================================
-- 9. STORAGE BUCKET для фотографий
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 10. ПОЛИТИКИ ДЛЯ STORAGE (фото)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view photos') THEN
    CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload photos') THEN
    CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can update own photos') THEN
    CREATE POLICY "Users can update own photos" ON storage.objects FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Users can delete own photos') THEN
    CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;

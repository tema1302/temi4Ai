-- ============================================
-- ПОЛНЫЙ SQL ДЛЯ SUPABASE (АКТУАЛЬНАЯ ВЕРСИЯ)
-- Файл: supabase/schema.sql
-- ============================================

-- 1. Расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. ТАБЛИЦА PROFILES (Подписки и пользователи)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'guardian', 'legacy')),
  subscription_status TEXT DEFAULT 'active',
  subscription_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Авто-создание профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, subscription_tier)
  VALUES (new.id, new.email, 'basic');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 3. ТАБЛИЦА FAMILIES (Архивы)
-- ============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hero_image TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  root_member_id UUID, -- FK добавляется в конце
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ТАБЛИЦА MEMBERS (Участники)
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
  life_path JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  tree_position JSONB DEFAULT NULL,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')) DEFAULT 'unknown',
  generation INTEGER DEFAULT 0,
  display_role TEXT,
  relationship TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Связываем корень семьи с участником
ALTER TABLE families DROP CONSTRAINT IF EXISTS fk_root_member;
ALTER TABLE families ADD CONSTRAINT fk_root_member FOREIGN KEY (root_member_id) REFERENCES members(id) ON DELETE SET NULL;

-- ============================================
-- 5. ТАБЛИЦА FAMILY_RELATIONS (Связи)
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
-- 6. ТАБЛИЦА ANALYTICS_EVENTS (Аналитика)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. ИНДЕКСЫ
-- ============================================
CREATE INDEX IF NOT EXISTS idx_families_slug ON families(slug);
CREATE INDEX IF NOT EXISTS idx_families_user ON families(user_id);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_relations_family ON family_relations(family_id);
CREATE INDEX IF NOT EXISTS idx_analytics_name ON analytics_events(event_name);

-- ============================================
-- 8. БЕЗОПАСНОСТЬ (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- PROFILES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- FAMILIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Public can view families') THEN
    CREATE POLICY "Public can view families" ON families FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can manage own families') THEN
    CREATE POLICY "Users can manage own families" ON families FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- MEMBERS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Public can view members') THEN
    CREATE POLICY "Public can view members" ON members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can manage members of own families') THEN
    CREATE POLICY "Users can manage members of own families" ON members FOR ALL 
      USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;

  -- RELATIONS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Public can view relations') THEN
    CREATE POLICY "Public can view relations" ON family_relations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Users can manage relations in own families') THEN
    CREATE POLICY "Users can manage relations in own families" ON family_relations FOR ALL 
      USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;

  -- ANALYTICS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Anyone can insert analytics') THEN
    CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- ============================================
-- 9. STORAGE (bucket 'photos')
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view photos') THEN
    CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload photos') THEN
    CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

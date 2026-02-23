-- ============================================
-- 04: RLS SECURITY
-- НАЗНАЧЕНИЕ: Защита данных — правила доступа (кто может редактировать).
-- КОГДА ЗАПУСКАТЬ: Пятым (когда все таблицы созданы).
-- ЗАМЕНЯЕТ: Все старые политики безопасности (Enable RLS, CREATE POLICY).
-- ============================================

-- Включение RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- 1. PROFILES (Видеть только своё)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- 2. FAMILIES (Чтение всем, Управление только владельцу)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Public can view families') THEN
    CREATE POLICY "Public can view families" ON families FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'families' AND policyname = 'Users can manage own families') THEN
    CREATE POLICY "Users can manage own families" ON families FOR ALL USING (auth.uid() = user_id);
  END IF;

  -- 3. MEMBERS (Управление через проверку владельца семьи)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Public can view members') THEN
    CREATE POLICY "Public can view members" ON members FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can manage members of own families') THEN
    CREATE POLICY "Users can manage members of own families" ON members FOR ALL 
      USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;

  -- 4. RELATIONS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Public can view relations') THEN
    CREATE POLICY "Public can view relations" ON family_relations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'family_relations' AND policyname = 'Users can manage relations in own families') THEN
    CREATE POLICY "Users can manage relations in own families" ON family_relations FOR ALL 
      USING (EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid()));
  END IF;

  -- 5. ANALYTICS (Анонимный сбор разрешен)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Anyone can insert analytics') THEN
    CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
  END IF;
END $$;

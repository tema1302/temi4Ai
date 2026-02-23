-- ============================================
-- 05: STORAGE & PERFORMANCE
-- НАЗНАЧЕНИЕ: Конфигурация файлов (фото) и ускорение запросов (индексы).
-- КОГДА ЗАПУСКАТЬ: Шестым (последним).
-- ЗАМЕНЯЕТ: Весь старый код по бакетам Storage и индексам tree_position.
-- ============================================

-- Создание бакета photos (если нет)
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true) ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  -- RLS для фото
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view photos') THEN
    CREATE POLICY "Public can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Authenticated users can upload photos') THEN
    CREATE POLICY "Authenticated users can upload photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');
  END IF;
END $$;

-- Индексы (для того чтобы всё "летало")
CREATE INDEX IF NOT EXISTS idx_families_slug ON families(slug);
CREATE INDEX IF NOT EXISTS idx_families_user ON families(user_id);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_members_tree_position ON members USING gin (tree_position) WHERE tree_position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_relations_family ON family_relations(family_id);
CREATE INDEX IF NOT EXISTS idx_relations_members ON family_relations(from_member_id, to_member_id);

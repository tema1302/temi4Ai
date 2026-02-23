-- ============================================
-- 00: RESET DATABASE (ОПАСНО: УДАЛЯЕТ ВСЁ)
-- НАЗНАЧЕНИЕ: Полная очистка базы перед новой установкой.
-- КОГДА ЗАПУСКАТЬ: Самым первым, если хотите начать "с чистого листа".
-- ============================================

-- Отключаем триггеры
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Удаляем таблицы в порядке зависимости (FK)
DROP TABLE IF EXISTS family_relations CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;

-- ============================================
-- 06: ADD FULL_NAME TO PROFILES
-- НАЗНАЧЕНИЕ: Добавляет поле full_name в таблицу profiles
-- КОГДА ЗАПУСКАТЬ: Для обновления существующей базы данных
-- ============================================

-- Добавляем колонку full_name если её нет
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Обновляем триггер для автоматического сохранения имени
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, subscription_tier)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'basic'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Опционально: синхронизировать имена существующих пользователей из auth.users metadata
-- Раскомментируйте если нужно обновить существующие записи:
UPDATE profiles p
SET full_name = u.raw_user_meta_data->>'full_name'
FROM auth.users u
WHERE p.id = u.id
AND p.full_name IS NULL
AND u.raw_user_meta_data->>'full_name' IS NOT NULL;

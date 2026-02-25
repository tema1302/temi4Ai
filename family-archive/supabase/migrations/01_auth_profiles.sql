-- ============================================
-- 01: AUTH & PROFILES
-- НАЗНАЧЕНИЕ: Учетные записи пользователей и их тарифные планы.
-- КОГДА ЗАПУСКАТЬ: Вторым (после Reset или в пустой базе).
-- ЗАМЕНЯЕТ: Любой код, связанный с таблицей profiles.
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'guardian', 'legacy')),
  subscription_status TEXT DEFAULT 'active',
  subscription_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Функция авто-создания профиля
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

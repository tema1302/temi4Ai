-- ============================================
-- 02: CORE ARCHIVE
-- НАЗНАЧЕНИЕ: Ядро системы — Семьи, Участники (с позициями на древе) и Связи.
-- КОГДА ЗАПУСКАТЬ: Третьим (зависит от Profiles).
-- ЗАМЕНЯЕТ: Весь старый код по таблицам families, members, family_relations.
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Семьи
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hero_image TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  root_member_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Участники (Люди)
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
  tree_position JSONB DEFAULT NULL, -- Хранит координаты {x, y}
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')) DEFAULT 'unknown',
  generation INTEGER DEFAULT 0,
  display_role TEXT,
  relationship TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN members.tree_position IS 'Custom position on family tree: { "x": number, "y": number }';

-- Связь root_member_id (после создания обеих таблиц)
ALTER TABLE families DROP CONSTRAINT IF EXISTS fk_root_member;
ALTER TABLE families ADD CONSTRAINT fk_root_member FOREIGN KEY (root_member_id) REFERENCES members(id) ON DELETE SET NULL;

-- 3. Связи (Граф)
CREATE TABLE IF NOT EXISTS family_relations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  from_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL CHECK (relation_type IN ('parent', 'spouse', 'sibling')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, from_member_id, to_member_id, relation_type)
);

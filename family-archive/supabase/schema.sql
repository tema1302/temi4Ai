-- Supabase SQL Schema for Family Memory Archive
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Families table
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  hero_image TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_families_slug ON families(slug);
CREATE INDEX IF NOT EXISTS idx_families_user ON families(user_id);
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);

-- Row Level Security (RLS)
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;

-- Policies: Public can view all families
CREATE POLICY "Public can view families" ON families
  FOR SELECT USING (true);

-- Policies: Only owner can modify their families
CREATE POLICY "Users can insert own families" ON families
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own families" ON families
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own families" ON families
  FOR DELETE USING (auth.uid() = user_id);

-- Policies: Public can view all members
CREATE POLICY "Public can view members" ON members
  FOR SELECT USING (true);

-- Policies: Only family owner can modify members
CREATE POLICY "Users can insert members to own families" ON members
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can update members of own families" ON members
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete members of own families" ON members
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM families WHERE id = family_id AND user_id = auth.uid())
  );

-- Storage bucket for photos (create via Dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

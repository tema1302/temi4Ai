-- Migration: Add tree_position column to members table
-- This allows storing custom positions for family tree nodes

ALTER TABLE members
ADD COLUMN IF NOT EXISTS tree_position JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN members.tree_position IS 'Custom position on family tree: { "x": number, "y": number }';

-- Optional: Create index for faster queries on tree_position
-- CREATE INDEX IF NOT EXISTS idx_members_tree_position ON members USING gin (tree_position) WHERE tree_position IS NOT NULL;

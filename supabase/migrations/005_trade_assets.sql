-- Migration 005: trade_assets table
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/sql

CREATE TABLE IF NOT EXISTS trade_assets (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  trade_slug  TEXT NOT NULL,
  asset_type  TEXT NOT NULL CHECK (asset_type IN ('hero', 'og')),
  image_url   TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trade_slug, asset_type)
);

-- Seed all 20 live trade slugs with empty slots
INSERT INTO trade_assets (trade_slug, asset_type, status) VALUES
  ('concrete-cutting', 'hero', 'pending'), ('concrete-cutting', 'og', 'pending'),
  ('pressure-washing', 'hero', 'pending'), ('pressure-washing', 'og', 'pending'),
  ('lawn-care',        'hero', 'pending'), ('lawn-care',        'og', 'pending'),
  ('drain-cleaning',   'hero', 'pending'), ('drain-cleaning',   'og', 'pending'),
  ('plumbing',         'hero', 'pending'), ('plumbing',         'og', 'pending'),
  ('locksmith',        'hero', 'pending'), ('locksmith',        'og', 'pending'),
  ('pest-control',     'hero', 'pending'), ('pest-control',     'og', 'pending'),
  ('hvac',             'hero', 'pending'), ('hvac',             'og', 'pending'),
  ('auto-detailing',   'hero', 'pending'), ('auto-detailing',   'og', 'pending'),
  ('snow-removal',     'hero', 'pending'), ('snow-removal',     'og', 'pending'),
  ('tree-service',     'hero', 'pending'), ('tree-service',     'og', 'pending'),
  ('chimney-sweep',    'hero', 'pending'), ('chimney-sweep',    'og', 'pending'),
  ('hauling',          'hero', 'pending'), ('hauling',          'og', 'pending'),
  ('grading',          'hero', 'pending'), ('grading',          'og', 'pending'),
  ('painting',         'hero', 'pending'), ('painting',         'og', 'pending'),
  ('auto-repair',      'hero', 'pending'), ('auto-repair',      'og', 'pending'),
  ('mechanic',         'hero', 'pending'), ('mechanic',         'og', 'pending'),
  ('floor-polishing',  'hero', 'pending'), ('floor-polishing',  'og', 'pending'),
  ('paving',           'hero', 'pending'), ('paving',           'og', 'pending'),
  ('demolition',       'hero', 'pending'), ('demolition',       'og', 'pending'),
  -- Tier 1 upcoming
  ('electrical',       'hero', 'pending'), ('electrical',       'og', 'pending'),
  ('roofing',          'hero', 'pending'), ('roofing',          'og', 'pending'),
  ('disaster-restoration', 'hero', 'pending'), ('disaster-restoration', 'og', 'pending')
ON CONFLICT (trade_slug, asset_type) DO NOTHING;

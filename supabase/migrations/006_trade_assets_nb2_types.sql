-- ============================================================
-- NB2 Full Migration Script
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/vzawlfitqnjhypnkguas/sql
-- ============================================================

-- Step 1: Expand check constraint to allow NB2 asset types
ALTER TABLE trade_assets DROP CONSTRAINT IF EXISTS trade_assets_asset_type_check;
ALTER TABLE trade_assets ADD CONSTRAINT trade_assets_asset_type_check 
  CHECK (asset_type IN ('hero', 'og', 'hero_a', 'hero_b', 'og_nb2'));

-- Step 2: Upsert all 60 NB2 trade_assets rows
-- (uses ON CONFLICT to handle duplicates on trade_slug + asset_type)

INSERT INTO trade_assets (trade_slug, asset_type, image_url, status)
VALUES
  -- concrete-cutting
  ('concrete-cutting', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/concrete-cutting-hero-a.jpg', 'pending'),
  ('concrete-cutting', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/concrete-cutting-hero-b.jpg', 'pending'),
  ('concrete-cutting', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/concrete-cutting-og.jpg', 'pending'),
  -- pressure-washing
  ('pressure-washing', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/pressure-washing-hero-a.jpg', 'pending'),
  ('pressure-washing', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/pressure-washing-hero-b.jpg', 'pending'),
  ('pressure-washing', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/pressure-washing-og.jpg', 'pending'),
  -- lawn-care
  ('lawn-care', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/lawn-care-hero-a.jpg', 'pending'),
  ('lawn-care', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/lawn-care-hero-b.jpg', 'pending'),
  ('lawn-care', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/lawn-care-og.jpg', 'pending'),
  -- drain-cleaning
  ('drain-cleaning', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/drain-cleaning-hero-a.jpg', 'pending'),
  ('drain-cleaning', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/drain-cleaning-hero-b.jpg', 'pending'),
  ('drain-cleaning', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/drain-cleaning-og.jpg', 'pending'),
  -- plumbing
  ('plumbing', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/plumbing-hero-a.jpg', 'pending'),
  ('plumbing', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/plumbing-hero-b.jpg', 'pending'),
  ('plumbing', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/plumbing-og.jpg', 'pending'),
  -- locksmith
  ('locksmith', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/locksmith-hero-a.jpg', 'pending'),
  ('locksmith', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/locksmith-hero-b.jpg', 'pending'),
  ('locksmith', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/locksmith-og.jpg', 'pending'),
  -- pest-control
  ('pest-control', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/pest-control-hero-a.jpg', 'pending'),
  ('pest-control', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/pest-control-hero-b.jpg', 'pending'),
  ('pest-control', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/pest-control-og.jpg', 'pending'),
  -- hvac
  ('hvac', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/hvac-hero-a.jpg', 'pending'),
  ('hvac', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/hvac-hero-b.jpg', 'pending'),
  ('hvac', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/hvac-og.jpg', 'pending'),
  -- auto-detailing
  ('auto-detailing', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/auto-detailing-hero-a.jpg', 'pending'),
  ('auto-detailing', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/auto-detailing-hero-b.jpg', 'pending'),
  ('auto-detailing', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/auto-detailing-og.jpg', 'pending'),
  -- snow-removal
  ('snow-removal', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/snow-removal-hero-a.jpg', 'pending'),
  ('snow-removal', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/snow-removal-hero-b.jpg', 'pending'),
  ('snow-removal', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/snow-removal-og.jpg', 'pending'),
  -- tree-service
  ('tree-service', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/tree-service-hero-a.jpg', 'pending'),
  ('tree-service', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/tree-service-hero-b.jpg', 'pending'),
  ('tree-service', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/tree-service-og.jpg', 'pending'),
  -- chimney-sweep
  ('chimney-sweep', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/chimney-sweep-hero-a.jpg', 'pending'),
  ('chimney-sweep', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/chimney-sweep-hero-b.jpg', 'pending'),
  ('chimney-sweep', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/chimney-sweep-og.jpg', 'pending'),
  -- hauling
  ('hauling', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/hauling-hero-a.jpg', 'pending'),
  ('hauling', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/hauling-hero-b.jpg', 'pending'),
  ('hauling', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/hauling-og.jpg', 'pending'),
  -- grading
  ('grading', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/grading-hero-a.jpg', 'pending'),
  ('grading', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/grading-hero-b.jpg', 'pending'),
  ('grading', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/grading-og.jpg', 'pending'),
  -- painting
  ('painting', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/painting-hero-a.jpg', 'pending'),
  ('painting', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/painting-hero-b.jpg', 'pending'),
  ('painting', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/painting-og.jpg', 'pending'),
  -- auto-repair
  ('auto-repair', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/auto-repair-hero-a.jpg', 'pending'),
  ('auto-repair', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/auto-repair-hero-b.jpg', 'pending'),
  ('auto-repair', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/auto-repair-og.jpg', 'pending'),
  -- mechanic
  ('mechanic', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/mechanic-hero-a.jpg', 'pending'),
  ('mechanic', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/mechanic-hero-b.jpg', 'pending'),
  ('mechanic', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/mechanic-og.jpg', 'pending'),
  -- floor-polishing
  ('floor-polishing', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/floor-polishing-hero-a.jpg', 'pending'),
  ('floor-polishing', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/floor-polishing-hero-b.jpg', 'pending'),
  ('floor-polishing', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/floor-polishing-og.jpg', 'pending'),
  -- paving
  ('paving', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/paving-hero-a.jpg', 'pending'),
  ('paving', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/paving-hero-b.jpg', 'pending'),
  ('paving', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/paving-og.jpg', 'pending'),
  -- demolition
  ('demolition', 'hero_a', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/demolition-hero-a.jpg', 'pending'),
  ('demolition', 'hero_b', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-heros/nb2/demolition-hero-b.jpg', 'pending'),
  ('demolition', 'og_nb2', 'https://vzawlfitqnjhypnkguas.supabase.co/storage/v1/object/public/ad-creatives/trade-ogs/nb2/demolition-og.jpg', 'pending')
ON CONFLICT (trade_slug, asset_type) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  status = EXCLUDED.status,
  updated_at = now();

-- Verify: count NB2 assets
SELECT asset_type, count(*) 
FROM trade_assets 
WHERE asset_type IN ('hero_a', 'hero_b', 'og_nb2')
GROUP BY asset_type
ORDER BY asset_type;

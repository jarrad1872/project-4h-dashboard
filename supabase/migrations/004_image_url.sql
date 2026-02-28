-- Migration 004: Link ad creatives to ads via image_url
-- Apply via: Supabase SQL editor OR node scripts/run-migration.js

-- Step 1: Add image_url column to ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Step 2: Populate image_url by matching ad_templates to ads by platform
-- Uses "saw" brand templates (Saw.City = concrete cutting, the 4H product)
UPDATE ads a
SET image_url = (
  SELECT (t.utm_campaign::jsonb)->>'image_url'
  FROM ad_templates t
  WHERE t.platform = a.platform
    AND t.name LIKE 'saw-%'
    AND (t.utm_campaign::jsonb)->>'image_url' IS NOT NULL
  LIMIT 1
)
WHERE a.image_url IS NULL;

-- Verify
SELECT
  COUNT(*) FILTER (WHERE image_url IS NOT NULL) AS with_image,
  COUNT(*) FILTER (WHERE image_url IS NULL) AS without_image,
  COUNT(*) AS total
FROM ads;

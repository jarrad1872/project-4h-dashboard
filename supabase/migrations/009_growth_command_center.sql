-- Migration 009: Growth command center data model
-- Adds richer influencer workflow fields and a dedicated creative_assets table

ALTER TABLE influencer_pipeline
  ADD COLUMN IF NOT EXISTS audience_size BIGINT,
  ADD COLUMN IF NOT EXISTS flat_fee_amount NUMERIC(10,2);

CREATE TABLE IF NOT EXISTS creative_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_slug TEXT NOT NULL DEFAULT 'pipe',
  title TEXT NOT NULL,
  angle TEXT NOT NULL,
  tool_used TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  target_platform TEXT NOT NULL DEFAULT 'multi',
  thumbnail_url TEXT,
  asset_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creative_assets_trade_slug ON creative_assets (trade_slug);
CREATE INDEX IF NOT EXISTS idx_creative_assets_status ON creative_assets (status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_platform ON creative_assets (target_platform);

CREATE OR REPLACE TRIGGER set_updated_at_creative_assets
  BEFORE UPDATE ON creative_assets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon read creative_assets" ON creative_assets
  FOR SELECT TO anon USING (true);

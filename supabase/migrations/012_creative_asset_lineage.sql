-- Phase 2 creative factory metadata for OpenAI image concept lineage.

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

ALTER TABLE creative_assets
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS model TEXT,
  ADD COLUMN IF NOT EXISTS prompt_brief_id TEXT,
  ADD COLUMN IF NOT EXISTS prompt_text TEXT,
  ADD COLUMN IF NOT EXISTS source_image_url TEXT,
  ADD COLUMN IF NOT EXISTS dimensions TEXT,
  ADD COLUMN IF NOT EXISTS variant_id TEXT,
  ADD COLUMN IF NOT EXISTS parent_asset_id TEXT,
  ADD COLUMN IF NOT EXISTS negative_prompt TEXT,
  ADD COLUMN IF NOT EXISTS generation_status TEXT,
  ADD COLUMN IF NOT EXISTS generation_error TEXT,
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS output_format TEXT,
  ADD COLUMN IF NOT EXISTS quality TEXT,
  ADD COLUMN IF NOT EXISTS moderation TEXT,
  ADD COLUMN IF NOT EXISTS response_metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_creative_assets_provider_model ON creative_assets (provider, model);
CREATE INDEX IF NOT EXISTS idx_creative_assets_prompt_brief_id ON creative_assets (prompt_brief_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_variant_id ON creative_assets (variant_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_generation_status ON creative_assets (generation_status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_trade_slug ON creative_assets (trade_slug);
CREATE INDEX IF NOT EXISTS idx_creative_assets_status ON creative_assets (status);
CREATE INDEX IF NOT EXISTS idx_creative_assets_platform ON creative_assets (target_platform);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'set_updated_at'
  ) THEN
    CREATE OR REPLACE TRIGGER set_updated_at_creative_assets
      BEFORE UPDATE ON creative_assets
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;

ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read creative_assets" ON creative_assets;
CREATE POLICY "anon read creative_assets" ON creative_assets
  FOR SELECT TO anon USING (true);

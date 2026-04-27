-- Phase 1 attribution foundation for Project 4H.
-- This makes the documented marketing_events table explicit and upgrades older/narrower versions safely.
-- Raw events stay separate from weekly rollups so demo calls, trials, and paid conversions remain attributable.

CREATE TABLE IF NOT EXISTS marketing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE marketing_events
  ADD COLUMN IF NOT EXISTS event_key TEXT,
  ADD COLUMN IF NOT EXISTS event_type TEXT,
  ADD COLUMN IF NOT EXISTS event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS tenant_id TEXT,
  ADD COLUMN IF NOT EXISTS visitor_id TEXT,
  ADD COLUMN IF NOT EXISTS session_id TEXT,
  ADD COLUMN IF NOT EXISTS creator_id TEXT,
  ADD COLUMN IF NOT EXISTS creative_asset_id TEXT,
  ADD COLUMN IF NOT EXISTS trade_slug TEXT,
  ADD COLUMN IF NOT EXISTS angle TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS utm_content TEXT,
  ADD COLUMN IF NOT EXISTS utm_term TEXT,
  ADD COLUMN IF NOT EXISTS variant_id TEXT,
  ADD COLUMN IF NOT EXISTS contact_id TEXT,
  ADD COLUMN IF NOT EXISTS value_cents INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE marketing_events
SET event_at = COALESCE(event_at, created_at, NOW())
WHERE event_at IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketing_events'
      AND column_name = 'event_name'
  ) THEN
    EXECUTE 'UPDATE marketing_events SET event_type = event_name WHERE event_type IS NULL AND event_name IN (''asset_view'', ''demo_call'', ''signup'', ''trial_started'', ''activated'', ''paid'')';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketing_events'
      AND column_name = 'trade'
  ) THEN
    EXECUTE 'UPDATE marketing_events SET trade_slug = trade WHERE trade_slug IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketing_events'
      AND column_name = 'props'
  ) THEN
    EXECUTE 'UPDATE marketing_events SET metadata = props WHERE metadata = ''{}''::jsonb';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketing_events_event_type_check'
  ) THEN
    ALTER TABLE marketing_events
      ADD CONSTRAINT marketing_events_event_type_check
      CHECK (event_type IN ('asset_view', 'demo_call', 'signup', 'trial_started', 'activated', 'paid'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketing_events_platform_check'
  ) THEN
    ALTER TABLE marketing_events
      ADD CONSTRAINT marketing_events_platform_check
      CHECK (platform IS NULL OR platform IN ('linkedin', 'youtube', 'facebook', 'instagram', 'multi'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketing_events_value_cents_check'
  ) THEN
    ALTER TABLE marketing_events
      ADD CONSTRAINT marketing_events_value_cents_check
      CHECK (value_cents >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'marketing_events_event_key_key'
  ) THEN
    ALTER TABLE marketing_events
      ADD CONSTRAINT marketing_events_event_key_key UNIQUE (event_key);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_marketing_events_event_at ON marketing_events (event_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketing_events_event_type ON marketing_events (event_type);
CREATE INDEX IF NOT EXISTS idx_marketing_events_utm_campaign ON marketing_events (utm_campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_events_utm_content ON marketing_events (utm_content);
CREATE INDEX IF NOT EXISTS idx_marketing_events_creator_id ON marketing_events (creator_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_creative_asset_id ON marketing_events (creative_asset_id);
CREATE INDEX IF NOT EXISTS idx_marketing_events_trade_platform ON marketing_events (trade_slug, platform);

ALTER TABLE marketing_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon read marketing_events" ON marketing_events;
CREATE POLICY "anon read marketing_events" ON marketing_events
  FOR SELECT TO anon USING (true);

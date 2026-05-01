-- 016_marketing_events_optional_attribution_nullable.sql
-- Older marketing_events tables had several attribution columns marked NOT NULL.
-- The current event contract only requires event_type/event_at/created_at; optional
-- attribution fields must accept nulls so card scans and generic events can log.

DO $$
DECLARE
  column_name_to_relax TEXT;
BEGIN
  FOREACH column_name_to_relax IN ARRAY ARRAY[
    'event_name',
    'event_key',
    'tenant_id',
    'visitor_id',
    'session_id',
    'creator_id',
    'creative_asset_id',
    'trade_slug',
    'angle',
    'platform',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'variant_id',
    'contact_id'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'marketing_events'
        AND column_name = column_name_to_relax
    ) THEN
      EXECUTE format(
        'ALTER TABLE public.marketing_events ALTER COLUMN %I DROP NOT NULL',
        column_name_to_relax
      );
    END IF;
  END LOOP;
END $$;

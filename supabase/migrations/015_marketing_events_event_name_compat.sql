-- 015_marketing_events_event_name_compat.sql
-- Production compatibility cleanup for legacy marketing_events.event_name.
-- The 4H event contract now uses event_type. Older tables may still have a
-- NOT NULL event_name column, which breaks field-sales tracking writes.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marketing_events'
      AND column_name = 'event_name'
  ) THEN
    UPDATE public.marketing_events
    SET event_name = COALESCE(event_name, event_type, 'asset_view')
    WHERE event_name IS NULL;

    ALTER TABLE public.marketing_events
      ALTER COLUMN event_name DROP NOT NULL;
  END IF;
END $$;

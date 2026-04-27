-- Migration 014: Human field sales rep pipeline

CREATE TABLE IF NOT EXISTS sales_leads (
  id TEXT PRIMARY KEY,
  rep_id TEXT NOT NULL,
  business_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Phoenix',
  state TEXT NOT NULL DEFAULT 'AZ',
  trade_domain TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospect',
  lead_type TEXT NOT NULL DEFAULT 'real',
  owner_profile TEXT NOT NULL DEFAULT '',
  pain_signal TEXT NOT NULL DEFAULT '',
  next_action TEXT NOT NULL DEFAULT '',
  last_touched_at TIMESTAMPTZ,
  tracking_code TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_leads_rep_id ON sales_leads (rep_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON sales_leads (stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_lead_type ON sales_leads (lead_type);
CREATE INDEX IF NOT EXISTS idx_sales_leads_trade_domain ON sales_leads (trade_domain);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_leads_tracking_code ON sales_leads (tracking_code);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_leads_stage_check'
  ) THEN
    ALTER TABLE sales_leads
      ADD CONSTRAINT sales_leads_stage_check
      CHECK (stage IN ('prospect', 'qualified', 'visited', 'card-left', 'demo-booked', 'trial-started', 'activated', 'paid', 'lost'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_leads_lead_type_check'
  ) THEN
    ALTER TABLE sales_leads
      ADD CONSTRAINT sales_leads_lead_type_check
      CHECK (lead_type IN ('archetype', 'real'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'sales_leads_archetype_stage_check'
  ) THEN
    ALTER TABLE sales_leads
      ADD CONSTRAINT sales_leads_archetype_stage_check
      CHECK (
        lead_type = 'real'
        OR stage IN ('prospect', 'qualified', 'lost')
      );
  END IF;
END $$;

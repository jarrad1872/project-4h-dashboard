-- Migration 008: Alert rules, engine runs, and influencer pipeline
-- Run after 007_indexes_and_rls.sql

-- ─── Alert Rules ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alert_rules (
  id TEXT PRIMARY KEY,
  metric TEXT NOT NULL,
  platform TEXT NOT NULL,
  operator TEXT NOT NULL,
  threshold NUMERIC NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Engine Runs ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engine_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  signals JSONB,
  alerts_fired JSONB,
  actions_taken JSONB
);

CREATE INDEX IF NOT EXISTS idx_engine_runs_run_at ON engine_runs (run_at DESC);

-- ─── Influencer Pipeline ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS influencer_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_name TEXT NOT NULL,
  trade TEXT NOT NULL,
  platform TEXT NOT NULL,
  channel_url TEXT,
  estimated_reach TEXT,
  status TEXT NOT NULL DEFAULT 'identified',
  deal_page TEXT,
  referral_code TEXT,
  notes TEXT,
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_status ON influencer_pipeline (status);
CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_trade ON influencer_pipeline (trade);

-- Updated-at trigger for influencer_pipeline
CREATE OR REPLACE TRIGGER set_updated_at_influencer_pipeline
  BEFORE UPDATE ON influencer_pipeline
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── RLS for new tables ─────────────────────────────────────────────────────

ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_pipeline ENABLE ROW LEVEL SECURITY;

-- Anon: read-only
CREATE POLICY "anon read alert_rules" ON alert_rules
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon read engine_runs" ON engine_runs
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon read influencer_pipeline" ON influencer_pipeline
  FOR SELECT TO anon USING (true);

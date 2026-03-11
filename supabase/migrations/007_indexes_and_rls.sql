-- Migration 007: Additional indexes + Row-Level Security
-- Run in Supabase SQL Editor

-- ─── ADDITIONAL INDEXES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS ads_workflow_stage_idx ON ads(workflow_stage);
CREATE INDEX IF NOT EXISTS ads_campaign_group_idx ON ads(campaign_group);
CREATE INDEX IF NOT EXISTS trade_assets_trade_slug_idx ON trade_assets(trade_slug);
CREATE INDEX IF NOT EXISTS trade_assets_status_idx ON trade_assets(status);

-- ─── ROW-LEVEL SECURITY ──────────────────────────────────────────────────────
-- Service role key bypasses RLS automatically.
-- These policies protect against anon key misuse (anon key is in NEXT_PUBLIC_*).

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE launch_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_assets ENABLE ROW LEVEL SECURITY;

-- Anon key: read-only on non-sensitive tables
CREATE POLICY "anon_read_ads" ON ads FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_templates" ON ad_templates FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_trade_assets" ON trade_assets FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_metrics" ON weekly_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_budget" ON budget FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_campaign" ON campaign_config FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_checklist" ON launch_checklist FOR SELECT TO anon USING (true);
CREATE POLICY "anon_read_lifecycle" ON lifecycle_messages FOR SELECT TO anon USING (true);

-- Anon key: no write access to any table (service role handles all writes)

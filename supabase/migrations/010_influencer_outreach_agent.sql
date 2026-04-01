-- Migration 010: Semi-autonomous influencer outreach agent workflow fields

ALTER TABLE influencer_pipeline
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS business_focus TEXT NOT NULL DEFAULT 'mixed',
  ADD COLUMN IF NOT EXISTS average_views BIGINT,
  ADD COLUMN IF NOT EXISTS engagement_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS sponsor_openness TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS outreach_stage TEXT NOT NULL DEFAULT 'discovery',
  ADD COLUMN IF NOT EXISTS draft_status TEXT NOT NULL DEFAULT 'not_started',
  ADD COLUMN IF NOT EXISTS draft_step TEXT NOT NULL DEFAULT 'initial',
  ADD COLUMN IF NOT EXISTS draft_subject TEXT,
  ADD COLUMN IF NOT EXISTS draft_body TEXT,
  ADD COLUMN IF NOT EXISTS approval_notes TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS draft_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_due_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_response_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_outreach_stage ON influencer_pipeline (outreach_stage);
CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_draft_status ON influencer_pipeline (draft_status);
CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_follow_up_due_at ON influencer_pipeline (follow_up_due_at);

-- Migration 013: Creator shortlist audit labels

ALTER TABLE influencer_pipeline
  ADD COLUMN IF NOT EXISTS audit_label TEXT,
  ADD COLUMN IF NOT EXISTS audit_reason TEXT,
  ADD COLUMN IF NOT EXISTS audited_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_influencer_pipeline_audit_label
  ON influencer_pipeline (audit_label);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'influencer_pipeline_audit_label_check'
  ) THEN
    ALTER TABLE influencer_pipeline
      ADD CONSTRAINT influencer_pipeline_audit_label_check
      CHECK (audit_label IS NULL OR audit_label IN ('keep', 'maybe', 'remove', 'needs-research'));
  END IF;
END $$;

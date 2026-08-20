-- Migration: Q3 8-stage lead pipeline
-- Apply via Supabase dashboard → SQL editor, or supabase db push
-- Safe to run once; DO block aborts the transaction if unexpected stages exist.

BEGIN;

-- ── Safety check ──────────────────────────────────────────────────────────────
-- Abort if any leads are in an unmapped stage (anything other than 'New').
-- All 9 leads are expected to be 'New'; if not, investigate before proceeding.
DO $$
DECLARE
  cnt   INTEGER;
  found TEXT;
BEGIN
  SELECT COUNT(*), string_agg(DISTINCT lead_stage, ', ')
  INTO cnt, found
  FROM leads
  WHERE lead_stage <> 'New';

  IF cnt > 0 THEN
    RAISE EXCEPTION
      'Found % lead(s) in unmapped stage(s): [%]. '
      'Add explicit mappings to this migration before re-running.',
      cnt, found;
  END IF;
END $$;

-- ── 1. Drop old constraint first (required — old constraint rejects 'Inquiry') ─
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_lead_stage_check;

-- ── 2. Migrate existing data ──────────────────────────────────────────────────
UPDATE leads SET lead_stage = 'Inquiry' WHERE lead_stage = 'New';

-- ── 3. Add new 9-value constraint ────────────────────────────────────────────
ALTER TABLE leads ADD CONSTRAINT leads_lead_stage_check CHECK (
  lead_stage IN (
    'Inquiry',
    'Qualified',
    'Engaged',
    'Meeting-ready',
    'Project-selected',
    'Reserved',
    'Contracted',
    'Closed',
    'Dropped'
  )
);

-- ── 4. Stage history table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS lead_stage_history (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id         UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_stage      TEXT,
  to_stage        TEXT        NOT NULL,
  transitioned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  transitioned_by TEXT,
  notes           TEXT
);

CREATE INDEX IF NOT EXISTS idx_lead_stage_history_lead_time
  ON lead_stage_history (lead_id, transitioned_at DESC);

-- ── 5. Trigger: auto-record stage changes ─────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_lead_stage_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, transitioned_at, transitioned_by)
    VALUES (NEW.id, NULL, NEW.lead_stage, NOW(), 'system');

  ELSIF TG_OP = 'UPDATE' AND (OLD.lead_stage IS DISTINCT FROM NEW.lead_stage) THEN
    INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, transitioned_at, transitioned_by)
    VALUES (NEW.id, OLD.lead_stage, NEW.lead_stage, NOW(), 'system');
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_lead_stage_history ON leads;
CREATE TRIGGER tg_lead_stage_history
  AFTER INSERT OR UPDATE OF lead_stage ON leads
  FOR EACH ROW EXECUTE FUNCTION trg_fn_lead_stage_history();

-- ── 6. Backfill: one initial entry per existing lead ─────────────────────────
-- Uses the lead's created_at as the transition timestamp.
-- The trigger above only fires on future INSERT/UPDATE, so no double-counting.
INSERT INTO lead_stage_history (lead_id, from_stage, to_stage, transitioned_at, transitioned_by)
SELECT id, NULL, 'Inquiry', created_at, 'backfill_migration'
FROM leads;

COMMIT;

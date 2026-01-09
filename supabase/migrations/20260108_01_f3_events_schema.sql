-- F3 Events Canonical Schema
-- Phase 1: Main f3_events table for normalized event storage
-- Run this in Supabase SQL Editor

-- f3_events: Canonical table for all F3 events (backblasts + preblasts)
CREATE TABLE f3_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_channel_id text NOT NULL,
  slack_message_ts text NOT NULL,
  slack_permalink text,
  ao_display_name text,
  event_kind text NOT NULL DEFAULT 'unknown', -- preblast | backblast | unknown
  title text,
  event_date date,
  event_time text,
  location_text text,
  q_slack_user_id text,
  q_name text,
  pax_count int,
  content_text text,
  content_html text,
  content_json jsonb NOT NULL,     -- normalized Slack message object
  raw_envelope_json jsonb,         -- full Slack webhook payload
  last_slack_edit_ts text,
  is_deleted bool DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slack_channel_id, slack_message_ts)
);

-- Indexes for efficient queries
CREATE INDEX idx_f3_events_date ON f3_events(event_date DESC);
CREATE INDEX idx_f3_events_ao ON f3_events(ao_display_name);
CREATE INDEX idx_f3_events_kind ON f3_events(event_kind);
CREATE INDEX idx_f3_events_q_slack ON f3_events(q_slack_user_id);
CREATE INDEX idx_f3_events_not_deleted ON f3_events(is_deleted) WHERE is_deleted = false;

-- Auto-update updated_at trigger (reuse existing function if available)
CREATE OR REPLACE FUNCTION update_f3_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER f3_events_updated_at
  BEFORE UPDATE ON f3_events
  FOR EACH ROW EXECUTE FUNCTION update_f3_events_updated_at();

-- Comment on table for documentation
COMMENT ON TABLE f3_events IS 'Canonical normalized storage for F3 events (backblasts and preblasts) from Slack';
COMMENT ON COLUMN f3_events.event_kind IS 'Type: preblast, backblast, or unknown';
COMMENT ON COLUMN f3_events.content_json IS 'Normalized Slack message object (blocks, metadata)';
COMMENT ON COLUMN f3_events.raw_envelope_json IS 'Full original Slack webhook payload for debugging';

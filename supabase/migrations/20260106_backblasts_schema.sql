-- F3 Marietta Backblasts Schema
-- Run this in Supabase SQL Editor after creating your project

-- ao_channels: Maps Slack channels to AO display names
CREATE TABLE ao_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_channel_id text UNIQUE NOT NULL,
  slack_channel_name text,
  ao_display_name text NOT NULL,
  is_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- backblasts: Stores parsed backblast content
CREATE TABLE backblasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slack_channel_id text NOT NULL,
  slack_message_ts text NOT NULL,
  slack_permalink text,
  ao_display_name text,
  title text,
  backblast_date date,
  q_name text,
  pax_text text,
  fng_text text,
  pax_count integer,
  content_text text NOT NULL,
  content_json jsonb,
  last_slack_edit_ts text,
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(slack_channel_id, slack_message_ts)
);

-- Indexes for efficient queries
CREATE INDEX idx_backblasts_date_ao ON backblasts(backblast_date DESC, ao_display_name);
CREATE INDEX idx_backblasts_not_deleted ON backblasts(is_deleted) WHERE is_deleted = false;

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER backblasts_updated_at
  BEFORE UPDATE ON backblasts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Initial AO channels for F3 Marietta
-- Update slack_channel_id values with your actual Slack channel IDs
INSERT INTO ao_channels (slack_channel_id, slack_channel_name, ao_display_name) VALUES
  ('REPLACE_WITH_CHANNEL_ID', '#ao_the_battlefield', 'The Battlefield'),
  ('REPLACE_WITH_CHANNEL_ID', '#ao_the_laststand', 'The Last Stand'),
  ('REPLACE_WITH_CHANNEL_ID', '#ao_blackops', 'Black Ops'),
  ('REPLACE_WITH_CHANNEL_ID', '#csaup', 'CSAUP');

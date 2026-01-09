-- Normalization Tables
-- Phase 2: Child tables for attendees, Qs, blocks, and elements
-- Run this in Supabase SQL Editor

-- f3_event_attendees: PAX attendees for an event
CREATE TABLE f3_event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES f3_events(id) ON DELETE CASCADE,
  attendee_external_id bigint,        -- F3 Nation app external ID
  attendee_slack_user_id text,        -- Slack user ID
  created_at timestamptz DEFAULT now()
);

-- Unique constraints to prevent duplicates
CREATE UNIQUE INDEX idx_f3_event_attendees_external 
  ON f3_event_attendees(event_id, attendee_external_id) 
  WHERE attendee_external_id IS NOT NULL;

CREATE UNIQUE INDEX idx_f3_event_attendees_slack 
  ON f3_event_attendees(event_id, attendee_slack_user_id) 
  WHERE attendee_slack_user_id IS NOT NULL;

CREATE INDEX idx_f3_event_attendees_event ON f3_event_attendees(event_id);

-- f3_event_qs: Q leaders for an event (can have multiple Qs)
CREATE TABLE f3_event_qs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES f3_events(id) ON DELETE CASCADE,
  q_external_id bigint,               -- F3 Nation app external ID
  q_slack_user_id text,               -- Slack user ID
  created_at timestamptz DEFAULT now()
);

-- Unique constraints to prevent duplicates
CREATE UNIQUE INDEX idx_f3_event_qs_external 
  ON f3_event_qs(event_id, q_external_id) 
  WHERE q_external_id IS NOT NULL;

CREATE UNIQUE INDEX idx_f3_event_qs_slack 
  ON f3_event_qs(event_id, q_slack_user_id) 
  WHERE q_slack_user_id IS NOT NULL;

CREATE INDEX idx_f3_event_qs_event ON f3_event_qs(event_id);

-- slack_message_blocks: Slack Block Kit blocks for an event message
CREATE TABLE slack_message_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES f3_events(id) ON DELETE CASCADE,
  block_index int NOT NULL,
  block_type text,
  block_id text,
  block_json jsonb,
  UNIQUE(event_id, block_index)
);

CREATE INDEX idx_slack_message_blocks_event ON slack_message_blocks(event_id);

-- slack_block_elements: Elements within a Slack block
CREATE TABLE slack_block_elements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  block_row_id uuid NOT NULL REFERENCES slack_message_blocks(id) ON DELETE CASCADE,
  element_index int NOT NULL,
  element_type text,
  element_json jsonb,
  UNIQUE(block_row_id, element_index)
);

CREATE INDEX idx_slack_block_elements_block ON slack_block_elements(block_row_id);

-- Comments for documentation
COMMENT ON TABLE f3_event_attendees IS 'PAX attendees for F3 events - from metadata.event_payload.the_pax or attendees';
COMMENT ON TABLE f3_event_qs IS 'Q leaders for F3 events - supports multiple Qs per event';
COMMENT ON TABLE slack_message_blocks IS 'Slack Block Kit blocks for rendering structured content';
COMMENT ON TABLE slack_block_elements IS 'Elements within Slack blocks for detailed parsing';

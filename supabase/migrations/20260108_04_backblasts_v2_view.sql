-- Backward Compatibility View
-- Phase 7: View that mimics backblasts table shape from f3_events
-- Run this in Supabase SQL Editor

-- backblasts_v2: Compatibility view for gradual migration
-- Allows existing website code to work with new data model
CREATE VIEW backblasts_v2 AS
SELECT 
  id,
  slack_channel_id,
  slack_message_ts,
  slack_permalink,
  ao_display_name,
  title,
  event_date AS backblast_date,
  q_name,
  NULL::text AS pax_text,
  NULL::text AS fng_text,
  pax_count,
  content_text,
  content_json,
  last_slack_edit_ts,
  is_deleted,
  created_at,
  updated_at
FROM f3_events
WHERE event_kind = 'backblast' AND is_deleted = false;

COMMENT ON VIEW backblasts_v2 IS 'Backward-compatible view for website migration - reads from f3_events';

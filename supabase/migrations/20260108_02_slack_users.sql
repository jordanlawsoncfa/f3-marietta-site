-- Slack Users Table
-- Phase 1: Store Slack user profiles for name resolution
-- Run this in Supabase SQL Editor

-- slack_users: Cache of Slack user profiles for Q name resolution
CREATE TABLE slack_users (
  slack_user_id text PRIMARY KEY,
  team_id text,
  display_name text,
  real_name text,
  image_48 text,
  is_bot bool DEFAULT false,
  deleted bool DEFAULT false,
  updated_at timestamptz DEFAULT now()
);

-- Index for team lookups
CREATE INDEX idx_slack_users_team ON slack_users(team_id);

-- Comment on table for documentation
COMMENT ON TABLE slack_users IS 'Cached Slack user profiles synced daily for Q name resolution';
COMMENT ON COLUMN slack_users.display_name IS 'Slack display_name - primary name to show';
COMMENT ON COLUMN slack_users.real_name IS 'Slack real_name - fallback if display_name empty';

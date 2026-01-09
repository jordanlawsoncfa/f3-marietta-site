# F3 Events Canonical Data Model

This document describes the normalized data model for F3 events (backblasts and preblasts) ingested from Slack.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Slack Events   │────▶│   API Handler    │────▶│   f3_events     │
│  API Webhook    │     │   /api/slack/    │     │   (canonical)   │
└─────────────────┘     │   events         │     └────────┬────────┘
                        │                  │              │
                        │  Dual-write      │     ┌────────┴────────┐
                        │  (legacy)        │     │  Child Tables   │
                        │        │         │     │  - attendees    │
                        │        ▼         │     │  - qs           │
                        │  ┌───────────┐   │     │  - blocks       │
                        │  │backblasts │   │     └─────────────────┘
                        │  │(legacy)   │   │
                        └──┴───────────┴───┘
```

## Tables

| Table | Purpose |
|-------|---------|
| `f3_events` | Canonical normalized event storage |
| `slack_users` | Cached Slack user profiles for Q name resolution |
| `f3_event_attendees` | PAX list for each event |
| `f3_event_qs` | Q leaders for each event |
| `slack_message_blocks` | Slack Block Kit blocks |
| `slack_block_elements` | Elements within blocks |
| `backblasts_v2` | Compatibility view (reads from f3_events) |

## Setup

### 1. Run Database Migrations

Execute these SQL files in order in your Supabase SQL Editor:

```bash
supabase/migrations/20260108_01_f3_events_schema.sql
supabase/migrations/20260108_02_slack_users.sql
supabase/migrations/20260108_03_normalization_tables.sql
supabase/migrations/20260108_04_backblasts_v2_view.sql
```

### 2. Configure Environment Variables

Add to `.env.local`:

```bash
# Required for Slack user sync
SLACK_BOT_TOKEN=xoxb-your-bot-token

# Optional: Secure cron endpoints
CRON_SECRET=your-random-secret
```

The bot token needs the `users:read` scope.

### 3. Initial Slack User Sync

Trigger the first sync manually:

```bash
curl -X POST https://your-domain.vercel.app/api/slack/sync-users \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### 4. Backfill Existing Data

```bash
# Dry run first
npx tsx scripts/backfill-f3-events.ts --dry-run

# Then run for real
npx tsx scripts/backfill-f3-events.ts
```

## Usage

### Reading Events

```typescript
import { supabase } from '@/lib/supabase';

// Fetch backblasts from canonical table
const { data } = await supabase
  .from('f3_events')
  .select('*')
  .eq('event_kind', 'backblast')
  .eq('is_deleted', false)
  .order('event_date', { ascending: false });
```

### Displaying Content

```tsx
// Display HTML content safely
<div 
  className="prose"
  dangerouslySetInnerHTML={{ __html: event.content_html || '' }} 
/>

// Fallback to plain text
{!event.content_html && (
  <pre className="whitespace-pre-wrap">{event.content_text}</pre>
)}
```

### Q Name Resolution

Q names are automatically resolved during ingestion. The resolution priority:

1. `display_name` from Slack profile
2. `real_name` from Slack profile  
3. Raw Slack user ID (fallback)

## Cron Jobs

| Endpoint | Schedule | Purpose |
|----------|----------|---------|
| `/api/slack/sync-users` | Daily 6 AM UTC | Sync Slack user profiles |
| `/api/slack/reconcile` | Daily 7 AM UTC | Existing reconciliation job |

## Rollback

If issues arise, the legacy `backblasts` table remains untouched.

### Revert to Legacy

1. Deploy previous version of `/api/slack/events/route.ts`
2. Website continues using `backblasts` table
3. Optionally drop new tables:

```sql
DROP VIEW IF EXISTS backblasts_v2;
DROP TABLE IF EXISTS slack_block_elements;
DROP TABLE IF EXISTS slack_message_blocks;
DROP TABLE IF EXISTS f3_event_qs;
DROP TABLE IF EXISTS f3_event_attendees;
DROP TABLE IF EXISTS f3_events;
DROP TABLE IF EXISTS slack_users;
```

## Verification Checklist

- [ ] Migrations run without errors
- [ ] Slack user sync populates `slack_users`
- [ ] Backfill completes with matching row counts
- [ ] New backblast → creates row in both tables
- [ ] Message edit → updates same row (no duplicates)
- [ ] Message delete → soft deletes in both tables
- [ ] Q names display as human-readable names
- [ ] `/backblasts` page continues to work
- [ ] All E2E tests pass

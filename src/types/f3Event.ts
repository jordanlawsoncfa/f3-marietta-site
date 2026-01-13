/**
 * F3 Event Types
 * TypeScript interfaces for the canonical F3 events data model
 */

// Event kind discriminator
export type EventKind = 'preblast' | 'backblast' | 'unknown';

/**
 * Main F3 Event record
 */
export interface F3Event {
    id: string;
    slack_channel_id: string;
    slack_message_ts: string;
    slack_permalink: string | null;
    ao_display_name: string | null;
    event_kind: EventKind;
    title: string | null;
    event_date: string | null;  // ISO date string YYYY-MM-DD
    event_time: string | null;
    location_text: string | null;
    q_slack_user_id: string | null;
    q_name: string | null;
    pax_count: number | null;
    content_text: string | null;
    content_html: string | null;
    content_json: Record<string, unknown>;
    raw_envelope_json: Record<string, unknown> | null;
    last_slack_edit_ts: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Slack user profile for name resolution
 */
export interface SlackUser {
    slack_user_id: string;
    team_id: string | null;
    display_name: string | null;
    real_name: string | null;
    image_48: string | null;
    is_bot: boolean;
    deleted: boolean;
    updated_at: string;
}

/**
 * Event attendee (PAX member)
 */
export interface F3EventAttendee {
    id: string;
    event_id: string;
    attendee_external_id: number | null;  // F3 Nation app ID
    attendee_slack_user_id: string | null;
    created_at: string;
}

/**
 * Event Q (leader)
 */
export interface F3EventQ {
    id: string;
    event_id: string;
    q_external_id: number | null;  // F3 Nation app ID
    q_slack_user_id: string | null;
    created_at: string;
}

/**
 * Slack message block
 */
export interface SlackMessageBlock {
    id: string;
    event_id: string;
    block_index: number;
    block_type: string | null;
    block_id: string | null;
    block_json: Record<string, unknown> | null;
}

/**
 * Slack block element
 */
export interface SlackBlockElement {
    id: string;
    block_row_id: string;
    element_index: number;
    element_type: string | null;
    element_json: Record<string, unknown> | null;
}

/**
 * Normalized event result from parsing
 */
export interface NormalizedEvent {
    // Core identifiers
    slack_channel_id: string;
    slack_message_ts: string;
    slack_permalink?: string;

    // Event metadata
    event_kind: EventKind;
    title?: string;
    event_date?: string;
    event_time?: string;
    location_text?: string;

    // Q information
    q_slack_user_id?: string;
    q_name?: string;

    // PAX
    pax_count?: number;

    // Content
    content_text?: string;
    content_html?: string;
    content_json: Record<string, unknown>;
    raw_envelope_json: Record<string, unknown>;

    // Child arrays for normalization tables
    attendees: Array<{ external_id?: number; slack_user_id?: string }>;
    qs: Array<{ external_id?: number; slack_user_id?: string }>;
    blocks: Array<{
        index: number;
        type?: string;
        id?: string;
        json: Record<string, unknown>;
        elements?: Array<{
            index: number;
            type?: string;
            json: Record<string, unknown>;
        }>;
    }>;
}

/**
 * Slack event payload metadata
 */
export interface SlackEventMetadata {
    event_type?: string;
    event_payload?: {
        title?: string;
        date?: string;
        start_time?: string;
        end_time?: string;
        the_q?: string;           // Slack user ID for backblast
        the_pax?: string[];       // Slack user IDs
        attendees?: number[];     // External IDs for preblast
        qs?: number[];            // External IDs for preblast
        event_instance_id?: string;
        [key: string]: unknown;
    };
}

/**
 * Slack API user response shape
 */
export interface SlackApiUser {
    id: string;
    team_id: string;
    name: string;
    deleted: boolean;
    is_bot: boolean;
    profile: {
        display_name?: string;
        real_name?: string;
        image_48?: string;
        [key: string]: unknown;
    };
}

export interface AOChannel {
    id: string;
    slack_channel_id: string;
    slack_channel_name: string | null;
    ao_display_name: string;
    is_enabled: boolean;
    created_at: string;
}

export interface Backblast {
    id: string;
    slack_channel_id: string;
    slack_message_ts: string;
    slack_permalink: string | null;
    ao_display_name: string | null;
    title: string | null;
    backblast_date: string | null;
    q_name: string | null;
    pax_text: string | null;
    fng_text: string | null;
    pax_count: number | null;
    content_text: string;
    content_json: Record<string, unknown> | null;
    last_slack_edit_ts: string | null;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;
}

export interface ParsedBackblast {
    title: string | null;
    date: string | null;
    ao: string | null;
    q: string | null;
    pax: string | null;
    fngs: string | null;
    count: number | null;
    content: string;
}

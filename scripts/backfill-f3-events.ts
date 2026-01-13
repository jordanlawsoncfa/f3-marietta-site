#!/usr/bin/env npx tsx
/**
 * Backfill F3 Events Script
 * 
 * Migrates existing backblasts table data to the new canonical f3_events table.
 * This script is safe to run multiple times (idempotent).
 * 
 * Usage: npx tsx scripts/backfill-f3-events.ts
 * 
 * Options:
 *   --dry-run     Show what would be migrated without making changes
 *   --limit=N     Process only N records (for testing)
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.error('Please set these environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

interface BackblastRow {
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

interface Stats {
    total: number;
    processed: number;
    skipped: number;
    errors: number;
    created: number;
    updated: number;
}

async function main() {
    console.log('===========================================');
    console.log('F3 Events Backfill Script');
    console.log('===========================================');
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
    if (limit) console.log(`Limit: ${limit} records`);
    console.log('');

    const stats: Stats = {
        total: 0,
        processed: 0,
        skipped: 0,
        errors: 0,
        created: 0,
        updated: 0,
    };

    try {
        // Fetch backblasts with content_json
        console.log('Fetching backblasts...');

        let query = supabase
            .from('backblasts')
            .select('*')
            .not('content_json', 'is', null)
            .order('created_at', { ascending: true });

        if (limit) {
            query = query.limit(limit);
        }

        const { data: backblasts, error } = await query;

        if (error) {
            console.error('Error fetching backblasts:', error);
            process.exit(1);
        }

        if (!backblasts || backblasts.length === 0) {
            console.log('No backblasts found to migrate.');
            return;
        }

        stats.total = backblasts.length;
        console.log(`Found ${stats.total} backblasts to process.\n`);

        // Process each backblast
        for (const row of backblasts as BackblastRow[]) {
            try {
                const result = await processBackblast(row, isDryRun);
                stats.processed++;

                if (result === 'created') stats.created++;
                else if (result === 'updated') stats.updated++;
                else if (result === 'skipped') stats.skipped++;

                // Progress update every 10 records
                if (stats.processed % 10 === 0) {
                    console.log(`Progress: ${stats.processed}/${stats.total}`);
                }
            } catch (err) {
                stats.errors++;
                console.error(`Error processing ${row.id}:`, err);
            }
        }

        // Final summary
        console.log('\n===========================================');
        console.log('SUMMARY');
        console.log('===========================================');
        console.log(`Total:     ${stats.total}`);
        console.log(`Processed: ${stats.processed}`);
        console.log(`Created:   ${stats.created}`);
        console.log(`Updated:   ${stats.updated}`);
        console.log(`Skipped:   ${stats.skipped}`);
        console.log(`Errors:    ${stats.errors}`);

        if (isDryRun) {
            console.log('\n⚠️  DRY RUN - No changes were made.');
        } else {
            console.log('\n✅ Migration complete!');
        }

    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

async function processBackblast(
    row: BackblastRow,
    dryRun: boolean
): Promise<'created' | 'updated' | 'skipped'> {
    const envelope = row.content_json;

    if (!envelope) {
        return 'skipped';
    }

    // Extract event data from stored envelope
    const event = (envelope as Record<string, unknown>).event as Record<string, unknown> | undefined;
    const message = event?.message || event;

    if (!message) {
        console.log(`  Skipping ${row.id}: No event data`);
        return 'skipped';
    }

    // Determine event kind from stored data
    let eventKind = 'backblast';
    const metadata = (message as Record<string, unknown>).metadata as Record<string, unknown> | undefined;
    const eventType = metadata?.event_type as string | undefined;

    if (eventType?.toLowerCase() === 'preblast') {
        eventKind = 'preblast';
    }

    // Extract Q Slack user ID if available
    const eventPayload = metadata?.event_payload as Record<string, unknown> | undefined;
    const qSlackUserId = eventPayload?.the_q as string | undefined;

    // Render HTML from blocks if available
    const blocks = (message as Record<string, unknown>).blocks as unknown[] | undefined;
    let contentHtml: string | null = null;

    if (blocks && blocks.length > 0) {
        // Basic HTML rendering (simplified for backfill)
        contentHtml = await renderBlocksSimple(blocks);
    }

    // Build f3_event record
    const f3Event = {
        slack_channel_id: row.slack_channel_id,
        slack_message_ts: row.slack_message_ts,
        slack_permalink: row.slack_permalink,
        ao_display_name: row.ao_display_name,
        event_kind: eventKind,
        title: row.title,
        event_date: row.backblast_date,
        event_time: null,
        location_text: null,
        q_slack_user_id: qSlackUserId || null,
        q_name: row.q_name,
        pax_count: row.pax_count,
        content_text: row.content_text,
        content_html: contentHtml,
        content_json: {
            text: (message as Record<string, unknown>).text,
            blocks: blocks,
            metadata: metadata,
        },
        raw_envelope_json: envelope,
        last_slack_edit_ts: row.last_slack_edit_ts,
        is_deleted: row.is_deleted,
        created_at: row.created_at,
        updated_at: row.updated_at,
    };

    console.log(`  Processing: ${row.id} → ${eventKind} (${row.backblast_date || 'no date'})`);

    if (dryRun) {
        return 'created';
    }

    // Check if already exists
    const { data: existing } = await supabase
        .from('f3_events')
        .select('id')
        .eq('slack_channel_id', row.slack_channel_id)
        .eq('slack_message_ts', row.slack_message_ts)
        .single();

    // Upsert to f3_events
    const { data, error } = await supabase
        .from('f3_events')
        .upsert(f3Event, {
            onConflict: 'slack_channel_id,slack_message_ts',
        })
        .select('id')
        .single();

    if (error) {
        throw new Error(`Upsert failed: ${error.message}`);
    }

    // Handle child records if we have event data
    if (data?.id && eventPayload) {
        await upsertChildRecords(data.id, eventKind, eventPayload, blocks || []);
    }

    return existing ? 'updated' : 'created';
}

async function upsertChildRecords(
    eventId: string,
    eventKind: string,
    eventPayload: Record<string, unknown>,
    blocks: unknown[]
) {
    // Delete existing child records
    await Promise.all([
        supabase.from('f3_event_attendees').delete().eq('event_id', eventId),
        supabase.from('f3_event_qs').delete().eq('event_id', eventId),
        supabase.from('slack_message_blocks').delete().eq('event_id', eventId),
    ]);

    // Insert attendees
    if (eventKind === 'backblast' && Array.isArray(eventPayload.the_pax)) {
        const attendeeRecords = eventPayload.the_pax
            .filter((p): p is string => typeof p === 'string')
            .map(slackUserId => ({
                event_id: eventId,
                attendee_slack_user_id: slackUserId,
                attendee_external_id: null,
            }));

        if (attendeeRecords.length > 0) {
            await supabase.from('f3_event_attendees').insert(attendeeRecords);
        }
    }

    // Insert Qs
    if (eventKind === 'backblast' && eventPayload.the_q) {
        await supabase.from('f3_event_qs').insert({
            event_id: eventId,
            q_slack_user_id: String(eventPayload.the_q),
            q_external_id: null,
        });
    }

    // Insert blocks (simplified - just store the raw JSON)
    if (blocks.length > 0) {
        const blockRecords = blocks.map((block, index) => {
            const b = block as Record<string, unknown>;
            return {
                event_id: eventId,
                block_index: index,
                block_type: b.type as string || null,
                block_id: b.block_id as string || null,
                block_json: b,
            };
        });

        await supabase.from('slack_message_blocks').insert(blockRecords);
    }
}

async function renderBlocksSimple(blocks: unknown[]): Promise<string> {
    const htmlParts: string[] = [];

    for (const block of blocks) {
        const b = block as Record<string, unknown>;
        const blockType = b.type as string;

        switch (blockType) {
            case 'section': {
                const textObj = b.text as Record<string, unknown> | undefined;
                if (textObj?.text) {
                    const text = escapeHtml(String(textObj.text));
                    htmlParts.push(`<p>${convertMrkdwnSimple(text)}</p>`);
                }
                break;
            }

            case 'rich_text': {
                const elements = b.elements as unknown[] | undefined;
                if (elements) {
                    for (const el of elements) {
                        const e = el as Record<string, unknown>;
                        if (e.type === 'rich_text_section') {
                            const sectionText = extractRichTextContent(e);
                            if (sectionText) {
                                htmlParts.push(`<p>${sectionText}</p>`);
                            }
                        }
                    }
                }
                break;
            }

            case 'divider':
                htmlParts.push('<hr>');
                break;

            case 'header': {
                const text = (b.text as Record<string, unknown>)?.text;
                if (text) {
                    htmlParts.push(`<h2>${escapeHtml(String(text))}</h2>`);
                }
                break;
            }
        }
    }

    return htmlParts.join('\n');
}

function extractRichTextContent(section: Record<string, unknown>): string {
    const elements = section.elements as unknown[] | undefined;
    if (!elements) return '';

    return elements.map(el => {
        const e = el as Record<string, unknown>;
        if (e.type === 'text') {
            let text = escapeHtml(String(e.text || ''));
            const style = e.style as Record<string, boolean> | undefined;
            if (style?.bold) text = `<strong>${text}</strong>`;
            if (style?.italic) text = `<em>${text}</em>`;
            return text;
        }
        if (e.type === 'user') {
            return `<span class="mention">@${e.user_id}</span>`;
        }
        if (e.type === 'link') {
            return `<a href="${escapeHtml(String(e.url))}">${escapeHtml(String(e.text || e.url))}</a>`;
        }
        return '';
    }).join('');
}

function convertMrkdwnSimple(text: string): string {
    // Bold
    let result = text.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    // Italic
    result = result.replace(/_([^_]+)_/g, '<em>$1</em>');
    // Line breaks
    result = result.replace(/\n/g, '<br>');
    return result;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Run the script
main().catch(console.error);

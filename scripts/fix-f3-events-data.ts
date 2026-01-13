#!/usr/bin/env npx tsx
/**
 * Fix F3 Events Data Script
 *
 * Addresses three issues:
 * 1. PAX count not displaying - re-extracts from metadata
 * 2. Thread replies showing as backblasts - soft-deletes replies
 * 3. Slack user IDs in content - re-renders HTML with resolved names
 *
 * Usage:
 *   npx tsx scripts/fix-f3-events-data.ts [--dry-run] [--limit=N] [--rerender-html]
 *
 * Options:
 *   --dry-run        Show what would change without making changes
 *   --limit=N        Process only N records
 *   --rerender-html  Also re-render content_html with resolved user names
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    console.error('Please set these environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Parse CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const rerenderHtml = args.includes('--rerender-html');
const limitArg = args.find(a => a.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

interface Stats {
    total: number;
    paxCountFixed: number;
    qNameFixed: number;
    threadRepliesDeleted: number;
    fakeBackblastsDeleted: number;
    contentHtmlFixed: number;
    errors: number;
}

interface F3EventRow {
    id: string;
    slack_channel_id: string;
    slack_message_ts: string;
    q_name: string | null;
    q_slack_user_id: string | null;
    pax_count: number | null;
    event_kind: string;
    is_deleted: boolean;
    raw_envelope_json: Record<string, unknown> | null;
    content_json: Record<string, unknown> | null;
}

async function main() {
    console.log('===========================================');
    console.log('Fix F3 Events Data Script');
    console.log('===========================================');
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
    console.log(`Re-render HTML: ${rerenderHtml ? 'YES' : 'NO'}`);
    if (limit) console.log(`Limit: ${limit} records`);
    console.log('');

    const stats: Stats = {
        total: 0,
        paxCountFixed: 0,
        qNameFixed: 0,
        threadRepliesDeleted: 0,
        fakeBackblastsDeleted: 0,
        contentHtmlFixed: 0,
        errors: 0,
    };

    try {
        // Fetch all f3_events
        console.log('Fetching f3_events...');

        let query = supabase
            .from('f3_events')
            .select('id, slack_channel_id, slack_message_ts, q_name, q_slack_user_id, pax_count, event_kind, is_deleted, raw_envelope_json, content_json')
            .eq('is_deleted', false)
            .order('created_at', { ascending: true });

        if (limit) {
            query = query.limit(limit);
        }

        const { data: events, error } = await query;

        if (error) {
            console.error('Error fetching f3_events:', error);
            process.exit(1);
        }

        if (!events || events.length === 0) {
            console.log('No events found to process.');
            return;
        }

        stats.total = events.length;
        console.log(`Found ${stats.total} events to process.\n`);

        // Step 1: Load slack_users for name resolution
        console.log('Loading slack_users cache...');
        const { data: slackUsers } = await supabase
            .from('slack_users')
            .select('slack_user_id, display_name, real_name');

        const userNameMap = new Map<string, string>();
        for (const user of slackUsers || []) {
            const name = user.display_name?.trim() || user.real_name?.trim() || user.slack_user_id;
            userNameMap.set(user.slack_user_id, name);
        }
        console.log(`Loaded ${userNameMap.size} users from cache.\n`);

        // Step 2: Process each event
        console.log('Processing events...\n');

        for (const event of events as F3EventRow[]) {
            try {
                await processEvent(event, userNameMap, stats, isDryRun, rerenderHtml);
            } catch (err) {
                stats.errors++;
                console.error(`Error processing ${event.id}:`, err);
            }
        }

        // Final summary
        console.log('\n===========================================');
        console.log('SUMMARY');
        console.log('===========================================');
        console.log(`Total processed:        ${stats.total}`);
        console.log(`PAX count fixed:        ${stats.paxCountFixed}`);
        console.log(`Q name fixed:           ${stats.qNameFixed}`);
        console.log(`Thread replies deleted: ${stats.threadRepliesDeleted}`);
        console.log(`Fake backblasts deleted:${stats.fakeBackblastsDeleted}`);
        console.log(`Content HTML fixed:     ${stats.contentHtmlFixed}`);
        console.log(`Errors:                 ${stats.errors}`);

        if (isDryRun) {
            console.log('\n⚠️  DRY RUN - No changes were made.');
            console.log('Run without --dry-run to apply changes.');
        } else {
            console.log('\n✅ Fix complete!');
        }

    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
}

async function processEvent(
    event: F3EventRow,
    userNameMap: Map<string, string>,
    stats: Stats,
    dryRun: boolean,
    shouldRerenderHtml: boolean
): Promise<void> {
    const updates: Record<string, unknown> = {};
    const envelope = event.raw_envelope_json;

    if (!envelope) {
        return;
    }

    // Extract message data
    const eventData = envelope.event as Record<string, unknown> | undefined;
    if (!eventData) return;

    const message = (eventData.message || eventData) as Record<string, unknown>;
    const metadata = message.metadata as Record<string, unknown> | undefined;
    const eventPayload = metadata?.event_payload as Record<string, unknown> | undefined;

    // Check 1: Is this a thread reply? (thread_ts differs from ts)
    const messageTs = (message.ts as string) || (eventData.ts as string);
    const threadTs = (message.thread_ts as string) || (eventData.thread_ts as string);

    if (threadTs && threadTs !== messageTs) {
        console.log(`  DELETE (thread reply): ${event.id}`);
        stats.threadRepliesDeleted++;

        if (!dryRun) {
            await supabase
                .from('f3_events')
                .update({ is_deleted: true })
                .eq('id', event.id);
        }
        return;
    }

    // Check 2: Is this a "fake" backblast? (classified as backblast but no proper metadata)
    // Real backblasts from F3 bot have metadata.event_payload with the_q and the_pax
    if (event.event_kind === 'backblast') {
        const hasPaxData = eventPayload && Array.isArray(eventPayload.the_pax) && eventPayload.the_pax.length > 0;
        const hasQData = eventPayload && eventPayload.the_q;

        // If it's a backblast but has no PAX and no Q data, it's likely a false positive
        if (!hasPaxData && !hasQData) {
            console.log(`  DELETE (fake backblast - no metadata): ${event.id}`);
            stats.fakeBackblastsDeleted++;

            if (!dryRun) {
                await supabase
                    .from('f3_events')
                    .update({ is_deleted: true })
                    .eq('id', event.id);
            }
            return;
        }
    }

    // Check 3: PAX count - re-extract from metadata if null OR if it seems wrong
    // (e.g., pax_count=86 when it should be 3-4 is likely a parsing bug)
    if (eventPayload) {
        let extractedPaxCount: number | null = null;

        // For backblasts: the_pax array
        if (event.event_kind === 'backblast' && Array.isArray(eventPayload.the_pax)) {
            extractedPaxCount = eventPayload.the_pax.length;
        }
        // For preblasts: attendees array
        else if (event.event_kind === 'preblast' && Array.isArray(eventPayload.attendees)) {
            extractedPaxCount = eventPayload.attendees.length;
        }
        // Fallback: try count field (may be string)
        else if (eventPayload.count !== undefined) {
            const parsed = parseInt(String(eventPayload.count), 10);
            if (!isNaN(parsed) && parsed < 100) { // Sanity check: PAX count shouldn't be > 100
                extractedPaxCount = parsed;
            }
        }

        // Update if we have a valid count AND it differs from current
        if (extractedPaxCount !== null && extractedPaxCount > 0) {
            const currentPax = event.pax_count;
            // Fix if null, or if current value is suspiciously high (likely a parsing error)
            if (currentPax === null || currentPax !== extractedPaxCount) {
                console.log(`  FIX PAX: ${event.id} → pax_count=${extractedPaxCount} (was: ${currentPax})`);
                updates.pax_count = extractedPaxCount;
                stats.paxCountFixed++;
            }
        }
    }

    // Check 4: Q Slack user ID exists but q_name is null or still a raw ID
    if (eventPayload) {
        // Extract Q Slack user ID from metadata if not already set
        let qSlackUserId = event.q_slack_user_id;

        if (!qSlackUserId && event.event_kind === 'backblast' && eventPayload.the_q) {
            qSlackUserId = String(eventPayload.the_q);
            updates.q_slack_user_id = qSlackUserId;
        }

        // Resolve Q name if needed
        if (qSlackUserId) {
            const currentQName = event.q_name || '';
            const isRawId = /^@?U[A-Z0-9]{8,}$/.test(currentQName) || currentQName === qSlackUserId || !currentQName;

            if (isRawId) {
                const resolvedName = userNameMap.get(qSlackUserId);
                if (resolvedName && resolvedName !== qSlackUserId) {
                    console.log(`  FIX Q: ${event.id} → q_name="${resolvedName}"`);
                    updates.q_name = resolvedName;
                    stats.qNameFixed++;
                }
            }
        }
    }

    // Check 5: Re-render content_html with resolved user names
    if (shouldRerenderHtml) {
        const blocks = (message.blocks as unknown[]) || [];
        if (blocks.length > 0) {
            const newHtml = await renderBlocksWithUserNames(blocks, userNameMap);
            if (newHtml) {
                console.log(`  FIX HTML: ${event.id} → re-rendered with user names`);
                updates.content_html = newHtml;
                stats.contentHtmlFixed++;
            }
        }
    }

    // Apply updates if any
    if (Object.keys(updates).length > 0 && !dryRun) {
        const { error } = await supabase
            .from('f3_events')
            .update(updates)
            .eq('id', event.id);

        if (error) {
            throw new Error(`Update failed: ${error.message}`);
        }
    }
}

/**
 * Re-render Slack blocks to HTML with resolved user names
 */
async function renderBlocksWithUserNames(
    blocks: unknown[],
    userNameMap: Map<string, string>
): Promise<string | null> {
    const htmlParts: string[] = [];

    for (const block of blocks) {
        const b = block as Record<string, unknown>;
        const blockType = b.type as string;

        switch (blockType) {
            case 'section': {
                const textObj = b.text as Record<string, unknown> | undefined;
                if (textObj?.text) {
                    const text = String(textObj.text);
                    const html = convertMrkdwnWithUsers(text, userNameMap);
                    htmlParts.push(`<p>${html}</p>`);
                }
                break;
            }

            case 'rich_text': {
                const elements = b.elements as unknown[] | undefined;
                if (elements) {
                    for (const el of elements) {
                        const e = el as Record<string, unknown>;
                        if (e.type === 'rich_text_section') {
                            const sectionHtml = renderRichTextSection(e, userNameMap);
                            if (sectionHtml) {
                                htmlParts.push(`<p>${sectionHtml}</p>`);
                            }
                        } else if (e.type === 'rich_text_list') {
                            const listItems = (e.elements as unknown[]) || [];
                            const listTag = e.style === 'ordered' ? 'ol' : 'ul';
                            const itemsHtml = listItems.map(item => {
                                const html = renderRichTextSection(item as Record<string, unknown>, userNameMap);
                                return `<li>${html}</li>`;
                            }).join('');
                            htmlParts.push(`<${listTag}>${itemsHtml}</${listTag}>`);
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

            case 'image': {
                const imageUrl = b.image_url as string;
                const altText = (b.alt_text as string) || 'Image';
                if (imageUrl) {
                    htmlParts.push(`<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(altText)}" />`);
                }
                break;
            }
        }
    }

    return htmlParts.length > 0 ? htmlParts.join('\n') : null;
}

function renderRichTextSection(
    section: Record<string, unknown>,
    userNameMap: Map<string, string>
): string {
    const elements = section.elements as unknown[] | undefined;
    if (!elements) return '';

    return elements.map(el => {
        const e = el as Record<string, unknown>;
        switch (e.type) {
            case 'text': {
                let text = escapeHtml(String(e.text || ''));
                const style = e.style as Record<string, boolean> | undefined;
                if (style?.bold) text = `<strong>${text}</strong>`;
                if (style?.italic) text = `<em>${text}</em>`;
                if (style?.strike) text = `<del>${text}</del>`;
                if (style?.code) text = `<code>${text}</code>`;
                return text;
            }
            case 'user': {
                const userId = e.user_id as string;
                const userName = userNameMap.get(userId) || userId;
                return `<span class="mention">@${escapeHtml(userName)}</span>`;
            }
            case 'channel': {
                const channelName = (e.name as string) || (e.channel_id as string);
                return `<span class="channel">#${escapeHtml(channelName)}</span>`;
            }
            case 'link': {
                const url = e.url as string;
                const linkText = (e.text as string) || url;
                return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">${escapeHtml(linkText)}</a>`;
            }
            case 'emoji': {
                const unicode = e.unicode as string;
                if (unicode) {
                    const codePoints = unicode.split('-').map(cp => parseInt(cp, 16));
                    return String.fromCodePoint(...codePoints);
                }
                return `:${e.name}:`;
            }
            default:
                return '';
        }
    }).join('');
}

function convertMrkdwnWithUsers(text: string, userNameMap: Map<string, string>): string {
    let html = escapeHtml(text);

    // Bold
    html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    // Strikethrough
    html = html.replace(/~([^~]+)~/g, '<del>$1</del>');
    // Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links: <url|text> or <url>
    html = html.replace(/&lt;(https?:\/\/[^|&gt;]+)\|([^&gt;]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');
    html = html.replace(/&lt;(https?:\/\/[^&gt;]+)&gt;/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');

    // User mentions: <@UXXXX> - resolve to display name
    html = html.replace(/&lt;@([A-Z0-9]+)&gt;/g, (_, userId) => {
        const userName = userNameMap.get(userId) || userId;
        return `<span class="mention">@${escapeHtml(userName)}</span>`;
    });

    // Channel mentions: <#CXXXX|name>
    html = html.replace(/&lt;#[A-Z0-9]+\|([^&gt;]+)&gt;/g, '<span class="channel">#$1</span>');
    html = html.replace(/&lt;#([A-Z0-9]+)&gt;/g, '<span class="channel">#$1</span>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Run the script
main().catch(console.error);

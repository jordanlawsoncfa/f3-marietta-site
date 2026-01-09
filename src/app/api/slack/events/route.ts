import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { verifySlackSignature } from '@/lib/slack/slackVerify';
import { parseBackblast, isBackblastMessage, generateBackblastTitle } from '@/lib/backblast/parseBackblast';
import { normalizeSlackMessage, isBackblastPayload, isPreblastPayload } from '@/lib/slack/normalizeSlackMessage';
import type { NormalizedEvent } from '@/types/f3Event';

// Slack event types
interface SlackEvent {
    type: string;
    subtype?: string;
    channel: string;
    ts: string;
    text?: string;
    user?: string;
    bot_id?: string;
    app_id?: string;
    message?: {
        ts: string;
        text?: string;
        user?: string;
        bot_id?: string;
    };
    previous_message?: {
        ts: string;
    };
}

interface SlackEventPayload {
    type: 'url_verification' | 'event_callback';
    challenge?: string;
    token?: string;
    event?: SlackEvent;
}

/**
 * POST /api/slack/events
 * Handles Slack Events API webhooks for backblast and preblast messages
 */
export async function POST(request: NextRequest) {
    try {
        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify Slack signature
        const signingSecret = process.env.SLACK_SIGNING_SECRET;
        if (!signingSecret) {
            console.error('SLACK_SIGNING_SECRET not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const signature = request.headers.get('x-slack-signature') || '';
        const timestamp = request.headers.get('x-slack-request-timestamp') || '';

        if (!verifySlackSignature(signingSecret, signature, timestamp, rawBody)) {
            console.error('Invalid Slack signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // Parse the payload
        const payload: SlackEventPayload = JSON.parse(rawBody);

        // Handle URL verification challenge (used when setting up Events API)
        if (payload.type === 'url_verification') {
            return NextResponse.json({ challenge: payload.challenge });
        }

        // Handle event callbacks
        if (payload.type === 'event_callback' && payload.event) {
            // Process asynchronously but respond quickly to Slack
            // Note: Vercel functions have time limits, so we process inline
            await handleSlackEvent(payload.event, rawBody);
        }

        // Always respond 200 quickly to acknowledge receipt
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error processing Slack event:', error);
        // Still return 200 to prevent Slack from retrying
        return NextResponse.json({ ok: true });
    }
}

async function handleSlackEvent(event: SlackEvent, rawPayload: string) {
    const { type, subtype, channel, ts } = event;

    console.log('handleSlackEvent called:', { type, subtype, channel, ts });
    console.log('Event text preview:', event.text?.substring(0, 100));

    // Only process message events
    if (type !== 'message') {
        console.log('Not a message event, ignoring');
        return;
    }

    // Check if this channel is in our allowlist
    const aoChannel = await getAOChannel(channel);
    if (!aoChannel) {
        console.log('Channel not in allowlist:', channel);
        return;
    }
    console.log('Channel matched:', aoChannel.ao_display_name);

    // Handle message deletion
    if (subtype === 'message_deleted' && event.previous_message) {
        console.log('Processing message deletion');
        await handleMessageDeleted(channel, event.previous_message.ts);
        return;
    }

    // Handle message edit (message_changed)
    if (subtype === 'message_changed' && event.message) {
        console.log('Processing message edit');
        const messageText = event.message.text || '';

        // Check if it's a backblast or preblast
        if (isBackblastPayload(rawPayload) || isPreblastPayload(rawPayload)) {
            await handleF3EventUpsert(aoChannel.ao_display_name, rawPayload, ts);
        }

        // Also maintain legacy backblasts table for backblasts only
        if (isBackblastMessage(messageText)) {
            await handleLegacyBackblastUpsert(
                channel,
                event.message.ts,
                messageText,
                aoChannel.ao_display_name,
                rawPayload,
                ts
            );
        }
        return;
    }

    // Handle new message (no subtype or bot_message)
    if (!subtype || subtype === 'bot_message') {
        const text = event.text || '';
        console.log('Processing new message, text length:', text.length);

        // Check if this is a backblast or preblast
        const isBackblast = isBackblastPayload(rawPayload) || isBackblastMessage(text);
        const isPreblast = isPreblastPayload(rawPayload);

        if (!isBackblast && !isPreblast) {
            console.log('Not a backblast or preblast, ignoring');
            return;
        }

        console.log(`Message identified as ${isPreblast ? 'preblast' : 'backblast'}, upserting...`);

        // Write to new canonical f3_events table
        await handleF3EventUpsert(aoChannel.ao_display_name, rawPayload);

        // Also maintain legacy backblasts table for backblasts only
        if (isBackblast && !isPreblast) {
            await handleLegacyBackblastUpsert(
                channel,
                ts,
                text,
                aoChannel.ao_display_name,
                rawPayload
            );
        }
    }
}

async function getAOChannel(slackChannelId: string) {
    const { data, error } = await supabase
        .from('ao_channels')
        .select('*')
        .eq('slack_channel_id', slackChannelId)
        .eq('is_enabled', true)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

/**
 * Upsert to canonical f3_events table with full normalization
 */
async function handleF3EventUpsert(
    aoDisplayName: string,
    rawPayload: string,
    editTs?: string
) {
    try {
        // Normalize the Slack message
        const normalized = await normalizeSlackMessage(rawPayload, aoDisplayName);

        // Prepare the f3_events record
        const record = {
            slack_channel_id: normalized.slack_channel_id,
            slack_message_ts: normalized.slack_message_ts,
            slack_permalink: normalized.slack_permalink || null,
            ao_display_name: aoDisplayName,
            event_kind: normalized.event_kind,
            title: normalized.title || null,
            event_date: normalized.event_date || null,
            event_time: normalized.event_time || null,
            location_text: normalized.location_text || null,
            q_slack_user_id: normalized.q_slack_user_id || null,
            q_name: normalized.q_name || null,
            pax_count: normalized.pax_count || null,
            content_text: normalized.content_text || null,
            content_html: normalized.content_html || null,
            content_json: normalized.content_json,
            raw_envelope_json: normalized.raw_envelope_json,
            last_slack_edit_ts: editTs || null,
            is_deleted: false,
        };

        // Upsert to f3_events
        const { data: eventData, error: eventError } = await supabase
            .from('f3_events')
            .upsert(record, {
                onConflict: 'slack_channel_id,slack_message_ts',
            })
            .select('id')
            .single();

        if (eventError) {
            console.error('Error upserting f3_event:', eventError);
            return;
        }

        const eventId = eventData?.id;
        console.log(`F3 Event upserted: ${eventId} (${normalized.event_kind})`);

        // Upsert child records
        if (eventId) {
            await upsertChildRecords(eventId, normalized);
        }

        // Trigger revalidation
        revalidatePath('/backblasts');
        if (eventId) {
            revalidatePath(`/backblasts/${eventId}`);
        }

    } catch (error) {
        console.error('Error in handleF3EventUpsert:', error);
    }
}

/**
 * Upsert child records (attendees, qs, blocks)
 */
async function upsertChildRecords(eventId: string, normalized: NormalizedEvent) {
    // Delete existing child records first (idempotent replace)
    await Promise.all([
        supabase.from('f3_event_attendees').delete().eq('event_id', eventId),
        supabase.from('f3_event_qs').delete().eq('event_id', eventId),
        supabase.from('slack_message_blocks').delete().eq('event_id', eventId),
    ]);

    // Insert attendees
    if (normalized.attendees.length > 0) {
        const attendeeRecords = normalized.attendees.map(a => ({
            event_id: eventId,
            attendee_external_id: a.external_id || null,
            attendee_slack_user_id: a.slack_user_id || null,
        }));

        const { error } = await supabase.from('f3_event_attendees').insert(attendeeRecords);
        if (error) console.error('Error inserting attendees:', error);
    }

    // Insert Qs
    if (normalized.qs.length > 0) {
        const qRecords = normalized.qs.map(q => ({
            event_id: eventId,
            q_external_id: q.external_id || null,
            q_slack_user_id: q.slack_user_id || null,
        }));

        const { error } = await supabase.from('f3_event_qs').insert(qRecords);
        if (error) console.error('Error inserting Qs:', error);
    }

    // Insert blocks
    if (normalized.blocks.length > 0) {
        for (const block of normalized.blocks) {
            const { data: blockData, error: blockError } = await supabase
                .from('slack_message_blocks')
                .insert({
                    event_id: eventId,
                    block_index: block.index,
                    block_type: block.type || null,
                    block_id: block.id || null,
                    block_json: block.json,
                })
                .select('id')
                .single();

            if (blockError) {
                console.error('Error inserting block:', blockError);
                continue;
            }

            // Insert block elements
            if (blockData?.id && block.elements && block.elements.length > 0) {
                const elementRecords = block.elements.map(el => ({
                    block_row_id: blockData.id,
                    element_index: el.index,
                    element_type: el.type || null,
                    element_json: el.json,
                }));

                const { error: elError } = await supabase
                    .from('slack_block_elements')
                    .insert(elementRecords);
                if (elError) console.error('Error inserting elements:', elError);
            }
        }
    }
}

/**
 * Legacy: Upsert to backblasts table for backward compatibility
 */
async function handleLegacyBackblastUpsert(
    channelId: string,
    messageTs: string,
    text: string,
    aoDisplayName: string,
    rawPayload: string,
    editTs?: string
) {
    // Parse the backblast content using legacy parser
    const parsed = parseBackblast(text, aoDisplayName);
    const title = generateBackblastTitle(parsed);

    // Prepare the record for upsert
    const record = {
        slack_channel_id: channelId,
        slack_message_ts: messageTs,
        ao_display_name: parsed.ao || aoDisplayName,
        title,
        backblast_date: parsed.date,
        q_name: parsed.q,
        pax_text: parsed.pax,
        fng_text: parsed.fngs,
        pax_count: parsed.count,
        content_text: parsed.content,
        content_json: JSON.parse(rawPayload),
        last_slack_edit_ts: editTs || null,
        is_deleted: false,
    };

    // Upsert the record
    const { data, error } = await supabase
        .from('backblasts')
        .upsert(record, {
            onConflict: 'slack_channel_id,slack_message_ts',
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error upserting legacy backblast:', error);
        return;
    }

    console.log(`Legacy backblast upserted: ${data?.id}`);
}

async function handleMessageDeleted(channelId: string, messageTs: string) {
    // Soft delete in both tables
    const results = await Promise.allSettled([
        // Delete from f3_events
        supabase
            .from('f3_events')
            .update({ is_deleted: true })
            .eq('slack_channel_id', channelId)
            .eq('slack_message_ts', messageTs)
            .select('id')
            .single(),

        // Delete from legacy backblasts
        supabase
            .from('backblasts')
            .update({ is_deleted: true })
            .eq('slack_channel_id', channelId)
            .eq('slack_message_ts', messageTs)
            .select('id')
            .single(),
    ]);

    // Log results
    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.data) {
            console.log(`Soft deleted: ${result.value.data.id}`);
        }
    }

    // Trigger revalidation
    revalidatePath('/backblasts');
}


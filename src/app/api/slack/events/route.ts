import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { supabase } from '@/lib/supabase';
import { verifySlackSignature } from '@/lib/slack/slackVerify';
import { parseBackblast, isBackblastMessage, generateBackblastTitle } from '@/lib/backblast/parseBackblast';

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
 * Handles Slack Events API webhooks for backblast messages
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

    // Only process message events
    if (type !== 'message') {
        return;
    }

    // Check if this channel is in our allowlist
    const aoChannel = await getAOChannel(channel);
    if (!aoChannel) {
        // Not an AO channel we're tracking
        return;
    }

    // Handle message deletion
    if (subtype === 'message_deleted' && event.previous_message) {
        await handleMessageDeleted(channel, event.previous_message.ts);
        return;
    }

    // Handle message edit
    if (subtype === 'message_changed' && event.message) {
        await handleMessageUpsert(
            channel,
            event.message.ts,
            event.message.text || '',
            aoChannel.ao_display_name,
            rawPayload,
            ts // Edit timestamp
        );
        return;
    }

    // Handle new message (no subtype or bot_message)
    if (!subtype || subtype === 'bot_message') {
        const text = event.text || '';

        // Check if this looks like a backblast
        if (!isBackblastMessage(text)) {
            return;
        }

        await handleMessageUpsert(
            channel,
            ts,
            text,
            aoChannel.ao_display_name,
            rawPayload
        );
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

async function handleMessageUpsert(
    channelId: string,
    messageTs: string,
    text: string,
    aoDisplayName: string,
    rawPayload: string,
    editTs?: string
) {
    // Parse the backblast content
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
        console.error('Error upserting backblast:', error);
        return;
    }

    // Trigger revalidation for the affected pages
    revalidatePath('/backblasts');
    if (data?.id) {
        revalidatePath(`/backblasts/${data.id}`);
    }

    console.log(`Backblast upserted: ${data?.id}`);
}

async function handleMessageDeleted(channelId: string, messageTs: string) {
    // Soft delete by setting is_deleted = true
    const { data, error } = await supabase
        .from('backblasts')
        .update({ is_deleted: true })
        .eq('slack_channel_id', channelId)
        .eq('slack_message_ts', messageTs)
        .select('id')
        .single();

    if (error) {
        // Record might not exist if it wasn't a backblast
        console.log('No backblast found to delete:', channelId, messageTs);
        return;
    }

    // Trigger revalidation
    revalidatePath('/backblasts');
    if (data?.id) {
        revalidatePath(`/backblasts/${data.id}`);
    }

    console.log(`Backblast soft deleted: ${data?.id}`);
}

/**
 * Slack User Lookup
 * Resolves Slack user IDs to human-readable display names
 */

import { supabase } from '@/lib/supabase';
import { getSlackClient, isSlackClientConfigured } from './slackClient';
import type { SlackUser } from '@/types/f3Event';

/**
 * Lookup a Slack user by ID
 * First checks local cache, then fetches from Slack API if not found
 */
export async function lookupSlackUser(slackUserId: string): Promise<SlackUser | null> {
    // First, check our local cache
    const { data: cached, error: cacheError } = await supabase
        .from('slack_users')
        .select('*')
        .eq('slack_user_id', slackUserId)
        .single();

    if (cached && !cacheError) {
        return cached as SlackUser;
    }

    // Not in cache - fetch from Slack API if configured
    if (!isSlackClientConfigured()) {
        console.warn(`Slack user ${slackUserId} not in cache and SLACK_BOT_TOKEN not configured`);
        return null;
    }

    try {
        const client = getSlackClient();
        const result = await client.users.info({ user: slackUserId });

        if (!result.ok || !result.user) {
            console.warn(`Failed to fetch Slack user ${slackUserId}:`, result.error);
            return null;
        }

        const user = result.user;
        const slackUser: Omit<SlackUser, 'updated_at'> = {
            slack_user_id: user.id!,
            team_id: user.team_id || null,
            display_name: user.profile?.display_name || null,
            real_name: user.profile?.real_name || null,
            image_48: user.profile?.image_48 || null,
            is_bot: user.is_bot || false,
            deleted: user.deleted || false,
        };

        // Upsert into cache
        const { data: inserted, error: insertError } = await supabase
            .from('slack_users')
            .upsert(slackUser, { onConflict: 'slack_user_id' })
            .select()
            .single();

        if (insertError) {
            console.error('Error caching Slack user:', insertError);
            // Return the user data even if caching fails
            return { ...slackUser, updated_at: new Date().toISOString() } as SlackUser;
        }

        return inserted as SlackUser;
    } catch (error) {
        console.error(`Error fetching Slack user ${slackUserId}:`, error);
        return null;
    }
}

/**
 * Resolve a Slack user ID to a display name
 * Uses priority: display_name → real_name → slack_user_id
 */
export async function resolveSlackUserName(slackUserId: string): Promise<string> {
    const user = await lookupSlackUser(slackUserId);

    if (!user) {
        return slackUserId; // Fallback to raw ID
    }

    // Priority: display_name → real_name → slack_user_id
    if (user.display_name && user.display_name.trim()) {
        return user.display_name.trim();
    }

    if (user.real_name && user.real_name.trim()) {
        return user.real_name.trim();
    }

    return slackUserId;
}

/**
 * Batch lookup multiple Slack users
 * Returns a map of slack_user_id → display name
 */
export async function batchResolveSlackUserNames(
    slackUserIds: string[]
): Promise<Map<string, string>> {
    const result = new Map<string, string>();

    if (slackUserIds.length === 0) {
        return result;
    }

    // Deduplicate
    const uniqueIds = [...new Set(slackUserIds)];

    // First, check cache for all users
    const { data: cached } = await supabase
        .from('slack_users')
        .select('slack_user_id, display_name, real_name')
        .in('slack_user_id', uniqueIds);

    const cachedMap = new Map<string, { display_name: string | null; real_name: string | null }>();
    if (cached) {
        for (const user of cached) {
            cachedMap.set(user.slack_user_id, {
                display_name: user.display_name,
                real_name: user.real_name,
            });
        }
    }

    // Process each user
    for (const userId of uniqueIds) {
        const cachedUser = cachedMap.get(userId);

        if (cachedUser) {
            const name = cachedUser.display_name?.trim() ||
                cachedUser.real_name?.trim() ||
                userId;
            result.set(userId, name);
        } else {
            // Fetch from Slack API
            const name = await resolveSlackUserName(userId);
            result.set(userId, name);
        }
    }

    return result;
}

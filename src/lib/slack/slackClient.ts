/**
 * Slack Web API Client
 * Singleton instance for making Slack API calls
 */

import { WebClient } from '@slack/web-api';

let slackClientInstance: WebClient | null = null;

/**
 * Get the Slack WebClient instance
 * Uses SLACK_BOT_TOKEN environment variable
 */
export function getSlackClient(): WebClient {
    if (slackClientInstance) {
        return slackClientInstance;
    }

    const token = process.env.SLACK_BOT_TOKEN;

    if (!token) {
        throw new Error(
            'Missing SLACK_BOT_TOKEN environment variable. ' +
            'Please set it in .env.local with a bot token that has users:read scope.'
        );
    }

    slackClientInstance = new WebClient(token);
    return slackClientInstance;
}

/**
 * Check if Slack client is configured
 */
export function isSlackClientConfigured(): boolean {
    return !!process.env.SLACK_BOT_TOKEN;
}

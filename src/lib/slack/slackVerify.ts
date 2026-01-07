import crypto from 'crypto';

/**
 * Verify Slack request signature to ensure the request is from Slack
 * https://api.slack.com/authentication/verifying-requests-from-slack
 */
export function verifySlackSignature(
    signingSecret: string,
    signature: string,
    timestamp: string,
    body: string
): boolean {
    // Prevent replay attacks - reject requests older than 5 minutes
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
    if (parseInt(timestamp, 10) < fiveMinutesAgo) {
        console.warn('Slack request timestamp too old');
        return false;
    }

    // Create the signature base string
    const sigBaseString = `v0:${timestamp}:${body}`;

    // Create HMAC SHA256 hash
    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(sigBaseString);
    const computedSignature = `v0=${hmac.digest('hex')}`;

    // Use timing-safe comparison to prevent timing attacks
    try {
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature)
        );
    } catch {
        return false;
    }
}

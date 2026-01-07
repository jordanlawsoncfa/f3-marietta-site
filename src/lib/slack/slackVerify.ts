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
    // Debug logging
    console.log('Verifying Slack signature...');
    console.log('Timestamp:', timestamp);
    console.log('Signature received:', signature?.substring(0, 20) + '...');
    console.log('Body length:', body?.length);
    console.log('Signing secret length:', signingSecret?.length);

    // Prevent replay attacks - reject requests older than 5 minutes
    const now = Math.floor(Date.now() / 1000);
    const fiveMinutesAgo = now - 60 * 5;
    const requestTimestamp = parseInt(timestamp, 10);

    console.log('Current time:', now, 'Request time:', requestTimestamp, 'Diff:', now - requestTimestamp);

    if (requestTimestamp < fiveMinutesAgo) {
        console.warn('Slack request timestamp too old:', now - requestTimestamp, 'seconds');
        return false;
    }

    // Create the signature base string
    const sigBaseString = `v0:${timestamp}:${body}`;

    // Create HMAC SHA256 hash
    const hmac = crypto.createHmac('sha256', signingSecret);
    hmac.update(sigBaseString);
    const computedSignature = `v0=${hmac.digest('hex')}`;

    console.log('Computed signature:', computedSignature.substring(0, 20) + '...');
    console.log('Signatures match:', signature === computedSignature);

    // Use timing-safe comparison to prevent timing attacks
    try {
        const result = crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(computedSignature)
        );
        console.log('timingSafeEqual result:', result);
        return result;
    } catch (err) {
        console.error('timingSafeEqual error:', err);
        return false;
    }
}

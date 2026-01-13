import { ParsedBackblast } from '@/types/backblast';

/**
 * Parse a backblast message from the F3 Nation app format
 * 
 * Expected format:
 * Backblast! [Title]
 * DATE: YYYY-MM-DD
 * AO: [Location Name]
 * Q: @username
 * PAX: @user1, @user2, ...
 * FNGs: [Names or "None"]
 * COUNT: [number]
 * [Workout content...]
 */
export function parseBackblast(text: string, fallbackAo?: string): ParsedBackblast {
    const lines = text.split('\n');

    let title: string | null = null;
    let date: string | null = null;
    let ao: string | null = fallbackAo || null;
    let q: string | null = null;
    let pax: string | null = null;
    let fngs: string | null = null;
    let count: number | null = null;
    let contentStartIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // First line: "Backblast! Title"
        if (i === 0 && line.toLowerCase().startsWith('backblast')) {
            // Extract title after "Backblast!" or "Backblast:"
            const titleMatch = line.match(/backblast[!:]?\s*(.+)?/i);
            title = titleMatch?.[1]?.trim() || null;
            contentStartIndex = i + 1;
            continue;
        }

        // DATE: YYYY-MM-DD or other formats
        if (line.toUpperCase().startsWith('DATE:')) {
            const dateStr = line.substring(5).trim();
            date = parseDate(dateStr);
            contentStartIndex = i + 1;
            continue;
        }

        // AO: Location
        if (line.toUpperCase().startsWith('AO:')) {
            ao = line.substring(3).trim();
            contentStartIndex = i + 1;
            continue;
        }

        // Q: @username
        if (line.toUpperCase().startsWith('Q:')) {
            q = cleanSlackMention(line.substring(2).trim());
            contentStartIndex = i + 1;
            continue;
        }

        // PAX: @user1, @user2
        if (line.toUpperCase().startsWith('PAX:')) {
            pax = line.substring(4).trim();
            contentStartIndex = i + 1;
            continue;
        }

        // FNGs: Names or None
        if (line.toUpperCase().startsWith('FNGS:') || line.toUpperCase().startsWith('FNG:')) {
            const colonIndex = line.indexOf(':');
            fngs = line.substring(colonIndex + 1).trim();
            contentStartIndex = i + 1;
            continue;
        }

        // COUNT: number
        if (line.toUpperCase().startsWith('COUNT:')) {
            const countStr = line.substring(6).trim();
            const parsed = parseInt(countStr, 10);
            count = isNaN(parsed) ? null : parsed;
            contentStartIndex = i + 1;
            continue;
        }

        // If we hit a line that's not a known field, stop parsing headers
        if (line.length > 0 && !line.startsWith('DATE:') && !line.startsWith('AO:')) {
            break;
        }
    }

    // Extract the workout content (everything after the header fields)
    const contentLines = lines.slice(contentStartIndex);
    const content = contentLines.join('\n').trim();

    return {
        title,
        date,
        ao,
        q,
        pax,
        fngs,
        count,
        content: content || text, // Fallback to full text if no content parsed
    };
}

/**
 * Parse various date formats into YYYY-MM-DD
 */
function parseDate(dateStr: string): string | null {
    if (!dateStr) return null;

    // Try ISO format first: YYYY-MM-DD
    const isoMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }

    // Try MM/DD/YYYY or MM-DD-YYYY
    const usMatch = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (usMatch) {
        const month = usMatch[1].padStart(2, '0');
        const day = usMatch[2].padStart(2, '0');
        return `${usMatch[3]}-${month}-${day}`;
    }

    // Try to parse with Date object as fallback
    try {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
            return parsed.toISOString().split('T')[0];
        }
    } catch {
        // Ignore parsing errors
    }

    return null;
}

/**
 * Clean up Slack user mentions to get readable names
 * Slack mentions look like <@U12345|username> or <@U12345>
 */
function cleanSlackMention(text: string): string {
    // Replace <@U12345|username> with @username
    let cleaned = text.replace(/<@[A-Z0-9]+\|([^>]+)>/g, '@$1');
    // Replace <@U12345> with @[User ID] (when display name not available)
    cleaned = cleaned.replace(/<@([A-Z0-9]+)>/g, '@$1');
    return cleaned;
}

/**
 * Check if a message text appears to be a backblast
 * Must explicitly contain "Backblast" (not "Preblast" or other variants)
 */
export function isBackblastMessage(text: string): boolean {
    if (!text) {
        console.log('isBackblastMessage: No text provided');
        return false;
    }

    const lowerText = text.toLowerCase();

    // Explicitly exclude preblasts
    if (lowerText.startsWith('preblast')) {
        console.log('isBackblastMessage: Detected Preblast, ignoring');
        return false;
    }

    // Check for "Backblast" at the start (most common F3 Nation app format)
    if (lowerText.startsWith('backblast')) {
        console.log('isBackblastMessage: Detected Backblast! at start');
        return true;
    }

    // Check if "backblast" appears anywhere in the first line
    const firstLine = text.split('\n')[0].toLowerCase();
    if (firstLine.includes('backblast') && !firstLine.includes('preblast')) {
        console.log('isBackblastMessage: Detected Backblast in first line');
        return true;
    }

    console.log('isBackblastMessage: No backblast pattern found');
    return false;
}

/**
 * Generate a title for the backblast based on parsed data
 */
export function generateBackblastTitle(parsed: ParsedBackblast): string {
    const parts: string[] = [];

    if (parsed.ao) {
        parts.push(parsed.ao);
    }

    parts.push('Backblast');

    if (parsed.date) {
        parts.push(`— ${parsed.date}`);
    }

    if (parsed.title && parsed.title !== 'Backblast') {
        return `${parts.join(' ')}: ${parsed.title}`;
    }

    return parts.join(' ');
}

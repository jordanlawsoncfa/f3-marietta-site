import { supabase } from '@/lib/supabase';
import { Backblast } from '@/types/backblast';

export interface PaginatedBackblastsResult {
    rows: Backblast[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface GetBackblastsOptions {
    page?: number;
    pageSize?: number;
    ao?: string;
    search?: string;
}

/**
 * Fetch backblasts with server-side pagination
 */
export async function getBackblastsPaginated(
    options: GetBackblastsOptions = {}
): Promise<PaginatedBackblastsResult> {
    const {
        page = 1,
        pageSize = 50,
        ao,
        search,
    } = options;

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Build the base query
    let query = supabase
        .from('backblasts')
        .select('*', { count: 'exact' })
        .eq('is_deleted', false)
        .order('backblast_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    // Apply AO filter
    if (ao) {
        query = query.eq('ao_display_name', ao);
    }

    // Apply search filter across multiple columns
    if (search) {
        query = query.or(
            `q_name.ilike.%${search}%,ao_display_name.ilike.%${search}%,content_text.ilike.%${search}%`
        );
    }

    // Apply pagination
    query = query.range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching backblasts:', error);
        return {
            rows: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0,
        };
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
        rows: data || [],
        total,
        page,
        pageSize,
        totalPages,
    };
}

/**
 * Get list of unique AO names for filter dropdown
 */
export async function getAOList(): Promise<string[]> {
    const { data, error } = await supabase
        .from('backblasts')
        .select('ao_display_name')
        .eq('is_deleted', false)
        .not('ao_display_name', 'is', null);

    if (error || !data) {
        return [];
    }

    // Get unique AO names, sorted alphabetically
    const uniqueAOs = [...new Set(data.map((d) => d.ao_display_name).filter(Boolean))] as string[];
    return uniqueAOs.sort();
}

/**
 * Create a short excerpt from content text
 */
export function createExcerpt(text: string | null, maxLength: number = 100): string {
    if (!text) return '';

    // Clean up the text - remove extra whitespace and normalize
    const cleaned = text
        .replace(/\s+/g, ' ')
        .trim();

    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    // Truncate at word boundary
    const truncated = cleaned.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.7) {
        return truncated.slice(0, lastSpace) + '…';
    }

    return truncated + '…';
}

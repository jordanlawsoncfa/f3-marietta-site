import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Server-side only Supabase client using service role key
// NEVER import this file in client components

let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
    if (supabaseInstance) {
        return supabaseInstance;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(
            'Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local'
        );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return supabaseInstance;
}

// Export a proxy that lazily initializes the client
export const supabase = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        const client = getSupabase();
        const value = client[prop as keyof SupabaseClient];
        if (typeof value === 'function') {
            return value.bind(client);
        }
        return value;
    },
});

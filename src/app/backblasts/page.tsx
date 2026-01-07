import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { Backblast } from '@/types/backblast';
import { Calendar, User, Users, MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BackblastsPageProps {
    searchParams: Promise<{ ao?: string; q?: string }>;
}

async function getBackblasts(ao?: string, search?: string): Promise<Backblast[]> {
    let query = supabase
        .from('backblasts')
        .select('*')
        .eq('is_deleted', false)
        .order('backblast_date', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

    if (ao) {
        query = query.eq('ao_display_name', ao);
    }

    if (search) {
        query = query.or(`title.ilike.%${search}%,content_text.ilike.%${search}%,q_name.ilike.%${search}%`);
    }

    const { data, error } = await query.limit(100);

    if (error) {
        console.error('Error fetching backblasts:', error);
        return [];
    }

    return data || [];
}

async function getAOList(): Promise<string[]> {
    const { data, error } = await supabase
        .from('backblasts')
        .select('ao_display_name')
        .eq('is_deleted', false)
        .not('ao_display_name', 'is', null);

    if (error || !data) {
        return [];
    }

    // Get unique AO names
    const uniqueAOs = [...new Set(data.map((d) => d.ao_display_name).filter(Boolean))] as string[];
    return uniqueAOs.sort();
}

export default async function BackblastsPage({ searchParams }: BackblastsPageProps) {
    const params = await searchParams;
    const aoFilter = params.ao;
    const searchQuery = params.q;

    const [backblasts, aoList] = await Promise.all([
        getBackblasts(aoFilter, searchQuery),
        getAOList(),
    ]);

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="BACKBLASTS"
                subtitle="Workout recaps from our AOs. See what you missed—or relive the pain."
                backgroundImage="/images/workouts-bg.jpg"
            />

            <Section>
                <div className="max-w-6xl mx-auto">
                    {/* Filters */}
                    <div className="mb-8 flex flex-col sm:flex-row gap-4">
                        {/* AO Filter */}
                        <form className="flex gap-4 flex-wrap">
                            <select
                                name="ao"
                                defaultValue={aoFilter || ''}
                                className="bg-card border border-border rounded-md px-4 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="">All AOs</option>
                                {aoList.map((ao) => (
                                    <option key={ao} value={ao}>
                                        {ao}
                                    </option>
                                ))}
                            </select>

                            {/* Search */}
                            <input
                                type="text"
                                name="q"
                                placeholder="Search backblasts..."
                                defaultValue={searchQuery || ''}
                                className="bg-card border border-border rounded-md px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary min-w-[200px]"
                            />

                            <button
                                type="submit"
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                            >
                                Filter
                            </button>

                            {(aoFilter || searchQuery) && (
                                <Link
                                    href="/backblasts"
                                    className="bg-muted text-muted-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted/80 transition-colors"
                                >
                                    Clear
                                </Link>
                            )}
                        </form>
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-muted-foreground mb-6">
                        {backblasts.length} backblast{backblasts.length !== 1 ? 's' : ''} found
                        {aoFilter && ` for ${aoFilter}`}
                        {searchQuery && ` matching "${searchQuery}"`}
                    </p>

                    {/* Backblasts Grid */}
                    {backblasts.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-lg border border-border">
                            <p className="text-lg text-muted-foreground">No backblasts found.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Check back after workouts are posted in Slack!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {backblasts.map((bb) => (
                                <BackblastCard key={bb.id} backblast={bb} />
                            ))}
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}

function BackblastCard({ backblast }: { backblast: Backblast }) {
    const formattedDate = backblast.backblast_date
        ? new Date(backblast.backblast_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : 'Date unknown';

    // Get a preview of the content
    const contentPreview = backblast.content_text
        ? backblast.content_text.slice(0, 150) + (backblast.content_text.length > 150 ? '...' : '')
        : '';

    return (
        <Link
            href={`/backblasts/${backblast.id}`}
            className="group bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
        >
            {/* AO Badge */}
            {backblast.ao_display_name && (
                <div className="flex items-center gap-1.5 mb-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        {backblast.ao_display_name}
                    </span>
                </div>
            )}

            {/* Title */}
            <h3 className="font-bold font-heading text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {backblast.title || 'Backblast'}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formattedDate}
                </span>
                {backblast.q_name && (
                    <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        Q: {backblast.q_name}
                    </span>
                )}
                {backblast.pax_count && (
                    <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {backblast.pax_count} PAX
                    </span>
                )}
            </div>

            {/* Content Preview */}
            {contentPreview && (
                <p className="text-sm text-muted-foreground line-clamp-3">{contentPreview}</p>
            )}
        </Link>
    );
}

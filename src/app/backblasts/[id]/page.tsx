import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Backblast } from '@/types/backblast';
import { ArrowLeft, ExternalLink } from 'lucide-react';

interface BackblastDetailPageProps {
    params: Promise<{ id: string }>;
}

async function getBackblast(id: string): Promise<Backblast | null> {
    const { data, error } = await supabase
        .from('backblasts')
        .select('*')
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

    if (error || !data) {
        return null;
    }

    return data;
}

export async function generateMetadata({ params }: BackblastDetailPageProps) {
    const { id } = await params;
    const backblast = await getBackblast(id);

    if (!backblast) {
        return { title: 'Backblast Not Found' };
    }

    const title = backblast.ao_display_name
        ? `${backblast.ao_display_name} Backblast`
        : 'Backblast';

    return {
        title: `${title} | F3 Marietta`,
        description: backblast.content_text?.slice(0, 160),
    };
}

export default async function BackblastDetailPage({ params }: BackblastDetailPageProps) {
    const { id } = await params;
    const backblast = await getBackblast(id);

    if (!backblast) {
        notFound();
    }

    const formattedDate = backblast.backblast_date
        ? new Date(backblast.backblast_date + 'T00:00:00').toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
        : null;

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-b from-muted/60 to-background border-b border-border py-10">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Back Link */}
                    <Link
                        href="/backblasts"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Backblasts
                    </Link>

                    {/* Metadata Badges */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        {backblast.ao_display_name && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                                {backblast.ao_display_name}
                            </span>
                        )}
                        {formattedDate && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                                {formattedDate}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold font-heading text-foreground mb-4">
                        {backblast.title || 'Backblast'}
                    </h1>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-6 text-sm">
                        <div>
                            <span className="text-muted-foreground">Q: </span>
                            <span className="text-foreground font-medium">
                                {backblast.q_name || '—'}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground">PAX Count: </span>
                            <span className="text-foreground font-medium">
                                {backblast.pax_count ?? '—'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <Section>
                <div className="max-w-4xl mx-auto">
                    {/* PAX & FNG Section */}
                    {(backblast.pax_text || backblast.fng_text) && (
                        <div className="bg-card border border-border rounded-lg p-5 mb-8">
                            <div className="grid sm:grid-cols-2 gap-6">
                                {backblast.pax_text && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            PAX
                                        </h3>
                                        <p className="text-foreground text-sm leading-relaxed">
                                            {backblast.pax_text}
                                        </p>
                                    </div>
                                )}
                                {backblast.fng_text && backblast.fng_text.toLowerCase() !== 'none' && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                            FNGs
                                        </h3>
                                        <p className="text-foreground text-sm leading-relaxed">
                                            {backblast.fng_text}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Workout Content */}
                    <article className="prose prose-invert max-w-none">
                        <div
                            className="text-foreground text-base leading-relaxed whitespace-pre-line"
                            style={{ fontFamily: 'var(--font-sans)' }}
                        >
                            {backblast.content_text}
                        </div>
                    </article>

                    {/* Slack Permalink */}
                    {backblast.slack_permalink && (
                        <div className="mt-10 pt-6 border-t border-border">
                            <a
                                href={backblast.slack_permalink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View original in Slack
                            </a>
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}

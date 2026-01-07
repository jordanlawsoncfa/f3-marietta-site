import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Section } from '@/components/ui/Section';
import { Backblast } from '@/types/backblast';
import { Calendar, User, Users, MapPin, ArrowLeft, ExternalLink } from 'lucide-react';

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

    return {
        title: `${backblast.title || 'Backblast'} | F3 Marietta`,
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
        : 'Date unknown';

    return (
        <div className="flex flex-col min-h-screen">
            {/* Header */}
            <div className="bg-muted/50 border-b border-border py-8">
                <div className="container mx-auto px-4">
                    <Link
                        href="/backblasts"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Backblasts
                    </Link>

                    {/* AO Badge */}
                    {backblast.ao_display_name && (
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                                {backblast.ao_display_name}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl md:text-4xl font-bold font-heading text-foreground mb-4">
                        {backblast.title || 'Backblast'}
                    </h1>

                    {/* Meta row */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formattedDate}
                        </span>
                        {backblast.q_name && (
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Q: {backblast.q_name}
                            </span>
                        )}
                        {backblast.pax_count && (
                            <span className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {backblast.pax_count} PAX
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <Section>
                <div className="max-w-3xl mx-auto">
                    {/* PAX & FNG Section */}
                    {(backblast.pax_text || backblast.fng_text) && (
                        <div className="bg-card border border-border rounded-lg p-4 mb-6 space-y-3">
                            {backblast.pax_text && (
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        PAX
                                    </h3>
                                    <p className="text-sm text-foreground">{backblast.pax_text}</p>
                                </div>
                            )}
                            {backblast.fng_text && backblast.fng_text.toLowerCase() !== 'none' && (
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                        FNGs
                                    </h3>
                                    <p className="text-sm text-foreground">{backblast.fng_text}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Workout Content */}
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {backblast.content_text}
                        </div>
                    </div>

                    {/* Slack Permalink */}
                    {backblast.slack_permalink && (
                        <div className="mt-8 pt-6 border-t border-border">
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

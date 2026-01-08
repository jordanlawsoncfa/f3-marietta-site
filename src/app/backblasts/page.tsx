import Link from 'next/link';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { getBackblastsPaginated, getAOList, createExcerpt } from '@/lib/backblast/getBackblastsPaginated';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BackblastsPageProps {
    searchParams: Promise<{
        page?: string;
        pageSize?: string;
        ao?: string;
        q?: string;
    }>;
}

export default async function BackblastsPage({ searchParams }: BackblastsPageProps) {
    const params = await searchParams;

    const page = Math.max(1, parseInt(params.page || '1', 10) || 1);
    const pageSize = [50, 100, 200].includes(parseInt(params.pageSize || '50', 10))
        ? parseInt(params.pageSize || '50', 10)
        : 50;
    const aoFilter = params.ao || '';
    const searchQuery = params.q || '';

    const [result, aoList] = await Promise.all([
        getBackblastsPaginated({ page, pageSize, ao: aoFilter || undefined, search: searchQuery || undefined }),
        getAOList(),
    ]);

    const { rows: backblasts, total, totalPages } = result;
    const startRow = (page - 1) * pageSize + 1;
    const endRow = Math.min(page * pageSize, total);

    // Build URL for pagination/filtering
    const buildUrl = (updates: Record<string, string | number | undefined>) => {
        const newParams = new URLSearchParams();

        const currentParams = {
            page: updates.page !== undefined ? updates.page : page,
            pageSize: updates.pageSize !== undefined ? updates.pageSize : pageSize,
            ao: updates.ao !== undefined ? updates.ao : aoFilter,
            q: updates.q !== undefined ? updates.q : searchQuery,
        };

        if (currentParams.page && currentParams.page !== 1) {
            newParams.set('page', String(currentParams.page));
        }
        if (currentParams.pageSize && currentParams.pageSize !== 50) {
            newParams.set('pageSize', String(currentParams.pageSize));
        }
        if (currentParams.ao) {
            newParams.set('ao', String(currentParams.ao));
        }
        if (currentParams.q) {
            newParams.set('q', String(currentParams.q));
        }

        const qs = newParams.toString();
        return `/backblasts${qs ? `?${qs}` : ''}`;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="BACKBLASTS"
                subtitle="Workout recaps from our AOs. See what you missed—or relive the pain."
                backgroundImage="/images/workouts-bg.jpg"
            />

            <Section>
                <div className="max-w-6xl mx-auto">
                    {/* Controls Row */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        {/* Filters */}
                        <form className="flex gap-3 flex-wrap items-center">
                            <select
                                name="ao"
                                defaultValue={aoFilter}
                                className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="">All AOs</option>
                                {aoList.map((ao) => (
                                    <option key={ao} value={ao}>
                                        {ao}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                name="q"
                                placeholder="Search Q, AO, or content..."
                                defaultValue={searchQuery}
                                className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary w-[220px]"
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
                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Clear
                                </Link>
                            )}
                        </form>

                        {/* Page Size */}
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Show:</span>
                            {[50, 100, 200].map((size) => (
                                <Link
                                    key={size}
                                    href={buildUrl({ pageSize: size, page: 1 })}
                                    className={`px-2 py-1 rounded ${pageSize === size
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        } transition-colors`}
                                >
                                    {size}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Results count */}
                    <p className="text-sm text-muted-foreground mb-4">
                        {total === 0 ? (
                            'No backblasts found'
                        ) : (
                            <>
                                Showing {startRow}–{endRow} of {total} backblast{total !== 1 ? 's' : ''}
                                {aoFilter && ` in ${aoFilter}`}
                                {searchQuery && ` matching "${searchQuery}"`}
                            </>
                        )}
                    </p>

                    {/* Table */}
                    {backblasts.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-lg border border-border">
                            <p className="text-lg text-muted-foreground">No backblasts found.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Check back after workouts are posted in Slack!
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30 sticky top-0">
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                AO
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Q
                                            </th>
                                            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                PAX
                                            </th>
                                            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Excerpt
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {backblasts.map((bb, idx) => {
                                            const formattedDate = bb.backblast_date
                                                ? new Date(bb.backblast_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : '—';

                                            return (
                                                <tr
                                                    key={bb.id}
                                                    className={`
                                                        border-b border-border/50 
                                                        hover:bg-muted/50 
                                                        cursor-pointer 
                                                        transition-colors
                                                        ${idx % 2 === 0 ? 'bg-transparent' : 'bg-muted/20'}
                                                    `}
                                                >
                                                    <td className="py-3 px-4">
                                                        <Link href={`/backblasts/${bb.id}`} className="block text-sm text-foreground">
                                                            {formattedDate}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Link href={`/backblasts/${bb.id}`} className="block text-sm font-medium text-primary">
                                                            {bb.ao_display_name || '—'}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Link href={`/backblasts/${bb.id}`} className="block text-sm text-foreground">
                                                            {bb.q_name || '—'}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <Link href={`/backblasts/${bb.id}`} className="block text-sm text-foreground">
                                                            {bb.pax_count ?? '—'}
                                                        </Link>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Link href={`/backblasts/${bb.id}`} className="block text-sm text-muted-foreground">
                                                            {createExcerpt(bb.content_text, 100)}
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {backblasts.map((bb) => {
                                    const formattedDate = bb.backblast_date
                                        ? new Date(bb.backblast_date + 'T00:00:00').toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })
                                        : '—';

                                    return (
                                        <Link
                                            key={bb.id}
                                            href={`/backblasts/${bb.id}`}
                                            className="block bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-medium text-primary">
                                                    {bb.ao_display_name || 'Unknown AO'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">{formattedDate}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                                                <span>Q: {bb.q_name || '—'}</span>
                                                <span>PAX: {bb.pax_count ?? '—'}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {createExcerpt(bb.content_text, 80)}
                                            </p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages}
                            </div>
                            <div className="flex gap-2">
                                {page > 1 ? (
                                    <Link
                                        href={buildUrl({ page: page - 1 })}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-md hover:bg-muted transition-colors"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-md text-muted-foreground cursor-not-allowed opacity-50">
                                        <ChevronLeft className="h-4 w-4" />
                                        Prev
                                    </span>
                                )}
                                {page < totalPages ? (
                                    <Link
                                        href={buildUrl({ page: page + 1 })}
                                        className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-md hover:bg-muted transition-colors"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-md text-muted-foreground cursor-not-allowed opacity-50">
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Section>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { searchGlossaryEntries } from "@/lib/searchGlossary";
import { GlossaryEntry } from "@/../data/f3Glossary";

interface GlossaryListProps {
    title: string;
    entries: GlossaryEntry[];
    showCategoryFilter?: boolean;
}

export function GlossaryList({ title, entries, showCategoryFilter = false }: GlossaryListProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredEntries = useMemo(() => {
        return searchGlossaryEntries(entries, searchQuery);
    }, [entries, searchQuery]);

    // Group by first letter for A-Z sorting if needed, but for now just flat list with search is fine.
    // The user mentioned "Consider grouping alphabetically (A–Z) if it’s easy; but search/filter is more important."
    // Let's stick to a clean list for now to keep it simple and fast, as search is the primary interaction.

    return (
        <div className="max-w-4xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                <div className="text-lg font-bold text-muted-foreground">
                    {title} ({filteredEntries.length})
                </div>

                {/* Search */}
                <div className="w-full md:w-auto relative">
                    <input
                        type="text"
                        placeholder={`Search ${title}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 px-4 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredEntries.slice(0, 100).map((entry) => (
                    <Card key={entry.id} id={entry.id} className="hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl text-primary">{entry.term}</CardTitle>
                                {showCategoryFilter && entry.category && (
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
                                        {entry.category}
                                    </span>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground font-medium mb-1">{entry.shortDescription}</p>
                            {entry.longDescription && (
                                <p className="text-sm text-muted-foreground mt-2 border-t pt-2 border-border/50">
                                    {entry.longDescription}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {filteredEntries.length > 100 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                        Showing first 100 results. Use search to find more.
                    </div>
                )}

                {filteredEntries.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">No results found for "{searchQuery}"</p>
                        <Button variant="link" onClick={() => setSearchQuery("")}>Clear Search</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

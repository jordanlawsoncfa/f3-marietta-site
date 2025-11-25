"use client";

import { useState, useMemo } from "react";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { lexiconEntries, exiconEntries } from "@/../data/f3Glossary";
import { cn } from "@/lib/utils";
import { searchGlossaryEntries } from "@/lib/searchGlossary";

export default function GlossaryPage() {
    const [activeTab, setActiveTab] = useState<"lexicon" | "exicon">("lexicon");
    const [searchQuery, setSearchQuery] = useState("");

    const currentEntries = activeTab === "lexicon" ? lexiconEntries : exiconEntries;
    const title = activeTab === "lexicon" ? "Lexicon" : "Exicon";

    const filteredEntries = useMemo(() => {
        return searchGlossaryEntries(currentEntries, searchQuery);
    }, [currentEntries, searchQuery]);

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="F3 TERMS AND EXERCISES"
                subtitle="The definitive guide to F3 terminology (Lexicon) and exercises (Exicon)."
                ctaText="Find a Workout"
                ctaLink="/workouts"
                backgroundImage="/images/lexicon-bg.jpg"
            />

            <Section>
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                        {/* Tabs */}
                        <div className="flex p-1 bg-muted rounded-lg">
                            <button
                                onClick={() => setActiveTab("lexicon")}
                                className={cn(
                                    "px-6 py-2 rounded-md text-sm font-bold transition-all",
                                    activeTab === "lexicon"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                LEXICON (Terms)
                            </button>
                            <button
                                onClick={() => setActiveTab("exicon")}
                                className={cn(
                                    "px-6 py-2 rounded-md text-sm font-bold transition-all",
                                    activeTab === "exicon"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                EXICON (Exercises)
                            </button>
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

                    <div className="text-center mb-8">
                        <p className="text-muted-foreground">
                            Showing {filteredEntries.length} {activeTab === "lexicon" ? "terms" : "exercises"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {filteredEntries.slice(0, 100).map((entry) => (
                            <Card key={entry.id} className="hover:border-primary/30 transition-colors">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl text-primary">{entry.term}</CardTitle>
                                        {entry.category && (
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
            </Section>
        </div>
    );
}

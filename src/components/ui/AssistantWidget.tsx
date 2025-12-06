"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Link from "next/link";
import { Send, Loader2 } from "lucide-react";

interface RelatedEntry {
    type: string;
    term: string;
    slug: string;
    url: string;
}

interface RelatedPage {
    title: string;
    url: string;
}

interface AssistantResponse {
    answerText: string;
    relatedEntries: RelatedEntry[];
    relatedPages?: RelatedPage[];
}

const EXAMPLE_QUESTIONS = [
    "What is F3?",
    "What should I expect at my first workout?",
    "What's a CSAUP?",
    "What's the difference between the Lexicon and Exicon?",
];

interface AssistantWidgetProps {
    title?: string;
    description?: string;
    compact?: boolean;
}

export function AssistantWidget({ title, description, compact = false }: AssistantWidgetProps) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<AssistantResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);
        setQuery(searchQuery);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to get answer");
            }

            setResponse(data);
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    return (
        <div className="w-full">
            {(title || description) && (
                <div className={`text-center mb-6 ${compact ? "mb-4" : ""}`}>
                    {title && <h2 className={`font-bold font-heading mb-2 ${compact ? "text-xl" : "text-2xl"}`}>{title}</h2>}
                    {description && <p className="text-muted-foreground text-sm">{description}</p>}
                </div>
            )}

            <div className="mb-6">
                <form onSubmit={handleSubmit} className="relative mb-4">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full px-4 py-3 pr-12 text-base rounded-lg border border-input bg-background text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                        />
                        <div className="absolute right-2">
                            <Button
                                type="submit"
                                disabled={isLoading || !query.trim()}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                <span className="sr-only">Ask</span>
                            </Button>
                        </div>
                    </div>
                </form>

                {/* Example Questions */}
                {!response && !isLoading && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {EXAMPLE_QUESTIONS.map((q) => (
                            <button
                                key={q}
                                onClick={() => handleSearch(q)}
                                className="text-xs bg-muted/50 hover:bg-muted px-3 py-1.5 rounded-full transition-colors text-muted-foreground hover:text-foreground text-left"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center mb-6 text-sm">
                    {error}
                </div>
            )}

            {response && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-primary/20 bg-muted">
                        <CardContent className="pt-4 pb-4">
                            <h3 className="font-bold text-sm mb-2 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                <span>🤖</span> Answer
                            </h3>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{response.answerText}</p>
                        </CardContent>
                    </Card>

                    {/* Related Pages */}
                    {response.relatedPages && response.relatedPages.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Recommended Pages
                            </h4>
                            <div className="flex flex-col gap-2">
                                {response.relatedPages.map((page) => (
                                    <Link
                                        key={page.url}
                                        href={page.url}
                                        className="flex items-center justify-between px-3 py-2 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-colors text-sm font-medium"
                                    >
                                        {page.title}
                                        <span className="text-muted-foreground">→</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Related Glossary Entries */}
                    {response.relatedEntries.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                Related Terms
                            </h4>
                            <div className="flex flex-col gap-2">
                                {response.relatedEntries.map((entry) => (
                                    <a
                                        key={entry.slug}
                                        href={entry.url}
                                        className="flex items-center justify-between p-2 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all group text-sm"
                                    >
                                        <div>
                                            <span className="font-bold block group-hover:text-primary transition-colors">
                                                {entry.term}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">
                                                {entry.type}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">
                                            →
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

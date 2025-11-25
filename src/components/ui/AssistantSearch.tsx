"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
// import { Search, Loader2, ArrowRight } from "lucide-react"; // Assuming lucide is available or we use emoji/text

interface RelatedEntry {
    type: string;
    term: string;
    slug: string;
    url: string;
}

interface AssistantResponse {
    answerText: string;
    relatedEntries: RelatedEntry[];
}

export function AssistantSearch() {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<AssistantResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
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

    return (
        <div className="w-full max-w-3xl mx-auto my-8 px-4">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-heading mb-2">What would you like to know?</h2>
                <p className="text-muted-foreground">Ask about F3, workouts, the Lexicon, or where to start.</p>
            </div>

            <form onSubmit={handleSubmit} className="relative mb-8">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What is a Merkin? or When are the workouts?"
                        className="w-full px-6 py-4 text-lg rounded-full border border-input bg-background shadow-sm focus:outline-none focus:ring-2 focus:ring-primary pr-32"
                    />
                    <div className="absolute right-2">
                        <Button
                            type="submit"
                            disabled={isLoading || !query.trim()}
                            className="rounded-full px-6"
                        >
                            {isLoading ? (
                                <span className="animate-spin mr-2">⏳</span>
                            ) : (
                                <span>Ask</span>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            {error && (
                <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-center mb-6">
                    {error}
                </div>
            )}

            {response && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                <span>🤖</span> Assistant Answer
                            </h3>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{response.answerText}</p>
                        </CardContent>
                    </Card>

                    {response.relatedEntries.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
                                Related Terms & Exercises
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {response.relatedEntries.map((entry) => (
                                    <a
                                        key={entry.slug}
                                        href={entry.url}
                                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:border-primary/50 hover:bg-accent/50 transition-all group"
                                    >
                                        <div>
                                            <span className="font-bold block group-hover:text-primary transition-colors">
                                                {entry.term}
                                            </span>
                                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
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

"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { lexiconEntries, exiconEntries } from "@/../data/f3Glossary";
import { cn } from "@/lib/utils";
import { GlossaryList } from "@/components/ui/GlossaryList";

export default function GlossaryPage() {
    const [activeTab, setActiveTab] = useState<"lexicon" | "exicon">("lexicon");

    const entries = activeTab === "lexicon" ? lexiconEntries : exiconEntries;
    const title = activeTab === "lexicon" ? "Lexicon (Terms)" : "Exicon (Exercises)";

    return (
        <div className="flex flex-col min-h-screen">
            <Section className="bg-background pt-8 pb-4">
                <div className="text-center max-w-3xl mx-auto mb-8">
                    <h1 className="text-4xl font-bold font-heading mb-4">F3 TERMS</h1>
                    <p className="text-lg text-muted-foreground">
                        Master the language of F3. Switch between the Lexicon (general terms) and Exicon (exercises).
                    </p>
                </div>

                {/* Search and Tabs */}
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-center mb-6 gap-4">
                        <Button
                            variant={activeTab === "lexicon" ? "default" : "outline"}
                            onClick={() => setActiveTab("lexicon")}
                            className="w-32"
                        >
                            Lexicon
                        </Button>
                        <Button
                            variant={activeTab === "exicon" ? "default" : "outline"}
                            onClick={() => setActiveTab("exicon")}
                            className="w-32"
                        >
                            Exicon
                        </Button>
                    </div>

                    <GlossaryList
                        title={title}
                        entries={entries}
                        showCategoryFilter={activeTab === "exicon"}
                    />
                </div>
            </Section>
        </div>
    );
}

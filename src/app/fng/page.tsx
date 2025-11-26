import fs from "fs";
import path from "path";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { FAQItem } from "@/components/ui/FAQItem";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

function getFAQs() {
    try {
        const filePath = path.join(process.cwd(), "data", "faq.md");
        const fileContent = fs.readFileSync(filePath, "utf-8");

        // Simple markdown parsing for H2 questions and paragraph answers
        const sections = fileContent.split(/^## /m).slice(1);

        return sections.map(section => {
            const [question, ...answerLines] = section.split("\n");
            return {
                question: question.trim(),
                answer: answerLines.join("\n").trim()
            };
        });
    } catch (error) {
        console.error("Error reading FAQ file:", error);
        return [];
    }
}

export default function FNGPage() {
    const faqs = getFAQs();

    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="NEW GUYS (FNGs)"
                subtitle="Everything you need to know before your first workout."
                ctaText="Find a Workout"
                ctaLink="/workouts"
                backgroundImage="/images/fng-bg.jpg"
            />

            <Section>
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold font-heading mb-4">FREQUENTLY ASKED QUESTIONS</h2>
                        <p className="text-muted-foreground">
                            Got questions? We've got answers. If you don't see what you're looking for, reach out.
                        </p>
                    </div>

                    <div className="space-y-2">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} question={faq.question} answer={faq.answer} />
                        ))}
                    </div>
                </div>
            </Section>

            <Section className="bg-primary text-primary-foreground text-center">
                <h2 className="text-3xl font-bold font-heading mb-6">NO MORE EXCUSES</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
                    You've read the FAQs. You know it's free. You know we're waiting for you.
                </p>
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 font-bold">
                    <Link href="/workouts">Pick a Workout & Show Up</Link>
                </Button>
            </Section>
        </div>
    );
}

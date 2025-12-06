import fs from "fs";
import path from "path";
import { Section } from "@/components/ui/Section";
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
            <Section className="pt-12 md:pt-20">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">FREQUENTLY ASKED QUESTIONS</h1>
                        <p className="text-muted-foreground text-lg">
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

            <Section className="bg-muted/30 text-center">
                <h2 className="text-2xl md:text-3xl font-bold font-heading mb-6">STILL HAVE QUESTIONS?</h2>
                <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90 text-muted-foreground">
                    Don't let questions stop you from showing up. The best way to learn is to experience it.
                </p>
                <Button asChild variant="outline" size="lg">
                    <Link href="/contact">Contact Us</Link>
                </Button>
            </Section>
        </div>
    );
}

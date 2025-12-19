import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Section } from "@/components/ui/Section";
import { FAQItem } from "@/components/ui/FAQItem";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface FAQ {
    question: string;
    answer: string;
    tags: string[];
    category: string;
}

function getFAQs(): FAQ[] {
    try {
        const faqDir = path.join(process.cwd(), "data", "content", "faq");
        const files = fs.readdirSync(faqDir).filter(f => f.endsWith('.md') && f !== 'README.md');

        const faqs = files.map(file => {
            const content = fs.readFileSync(path.join(faqDir, file), 'utf-8');
            const { data, content: body } = matter(content);

            // Extract answer from body (text after ### Answer)
            const answerMatch = body.match(/### Answer\s+([\s\S]*?)(?=###|$)/);
            const answer = answerMatch ? answerMatch[1].trim() : '';

            return {
                question: data.title || '',
                answer: answer,
                tags: data.tags || [],
                category: data.category || ''
            };
        });

        // Filter to only FNG-tagged FAQs and sort alphabetically by question
        return faqs
            .filter(faq => faq.tags.includes('FNG') && faq.question && faq.answer)
            .sort((a, b) => a.question.localeCompare(b.question));
    } catch (error) {
        console.error("Error reading FAQ files:", error);
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

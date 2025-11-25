import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { FAQItem } from "@/components/ui/FAQItem";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const faqs = [
    {
        question: "Who is F3 for?",
        answer: "F3 is for any man who wants to get in shape, make friends, and become a better leader. We welcome men of all ages and fitness levels."
    },
    {
        question: "What does it cost?",
        answer: "It is 100% free. Always. No catch."
    },
    {
        question: "What should I bring/wear?",
        answer: "Wear standard workout clothes and running shoes. Bring a pair of work gloves (we do pushups on pavement/grass) and water if you need it. That's it."
    },
    {
        question: "What if I'm out of shape?",
        answer: "Perfect. You're exactly who we're looking for. The workout is designed to be scalable. You do you. No man is left behind."
    },
    {
        question: "What time do workouts start?",
        answer: "Workouts typically start early (around 5:30 AM or 6:00 AM) to get it done before the day starts. Check the Workouts page for specific times."
    },
    {
        question: "Do I need to sign up?",
        answer: "Nope. Just show up. We'll have a disclaimer for you to agree to, but no registration is required."
    }
];

export default function FNGPage() {
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

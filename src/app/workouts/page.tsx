import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { AOCard } from "@/components/ui/AOCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const aos = [
    {
        name: "The Battlefield",
        time: "Tuesdays & Thursdays 5:30 AM EST",
        location: "Marietta High-School - Front Parking Lot, 1171 Whitlock Ave NW, Marietta, GA 30064",
        mapLink: "https://maps.google.com/?q=1171+Whitlock+Ave+NW,+Marietta,+GA+30064",
        description: "A tough bootcamp-style workout focused on strength, endurance, and pushing limits together. The original F3 Marietta AO.",
    },
    {
        name: "The Last Stand",
        time: "Mon/Wed 5:30 AM",
        location: "545 Kenneth E Marcus Way, Marietta, GA 30060",
        mapLink: "https://maps.google.com/?q=545+Kenneth+E+Marcus+Way,+Marietta,+GA+30060",
        description: "Another men's workout AO in our region with its own flavor and leadership. Come ready to work.",
    },
];

export default function WorkoutsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="WORKOUT LOCATIONS"
                subtitle="Find a workout near you. Just show up."
                ctaText="What to Expect"
                ctaLink="/fng"
                backgroundImage="/images/workouts-bg.jpg"
            />

            <Section>
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h2 className="text-3xl font-bold font-heading mb-4">WHERE WE MEET</h2>
                    <p className="text-muted-foreground">
                        All workouts are free, open to all men, and held outdoors rain or shine.
                        Check the schedule below and join us in the gloom.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {aos.map((ao) => (
                        <AOCard key={ao.name} {...ao} />
                    ))}
                </div>
            </Section>

            <div className="sticky bottom-4 z-40 flex justify-center w-full pointer-events-none">
                <div className="bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-lg pointer-events-auto flex items-center gap-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <span className="font-bold">First time?</span>
                    <span className="text-sm hidden sm:inline">Just show up 5-10 minutes early and tell them you're an FNG.</span>
                    <Button asChild size="sm" variant="secondary" className="font-bold">
                        <Link href="/fng">New Guys Start Here</Link>
                    </Button>
                </div>
            </div>

            <Section className="bg-muted/30 text-center">
                <h2 className="text-2xl font-bold font-heading mb-4">CAN'T FIND A WORKOUT?</h2>
                <p className="text-muted-foreground mb-6">
                    We are constantly expanding. Check back often or reach out to us to suggest a new location.
                </p>
                <Button asChild variant="outline">
                    <Link href="/contact">Contact Us</Link>
                </Button>
            </Section>
        </div>
    );
}

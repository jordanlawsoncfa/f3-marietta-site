import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";

// Video data
const videos = [
    {
        title: "Mission of F3",
        videoId: "mQ1uxuR65So",
    },
    {
        title: "What is F3?",
        videoId: "rGo03Y1ZZ3I",
    },
    {
        title: "What F3 Typically Looks Like",
        videoId: "WIYUXUwq2gM",
    },
    {
        title: "Basic F3 Exercises",
        videoId: "NvBUQ3x2Z-E",
    },
];

function VideoCard({ title, videoId }: { title: string; videoId: string }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
                <h3 className="font-bold font-heading text-foreground">{title}</h3>
            </div>
            <div className="relative w-full pt-[56.25%]">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </div>
    );
}

export default function WhatToExpectPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="WHAT TO EXPECT AT F3"
                subtitle="New to F3? Watch these videos to learn what a typical workout looks like, what F3 is all about, and some basic exercises you might encounter."
                backgroundImage="/images/workouts-bg.jpg"
            />

            <Section>
                {/* Video Grid: 2x2 desktop, 1 column mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                    {videos.map((video) => (
                        <VideoCard key={video.videoId} title={video.title} videoId={video.videoId} />
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <div className="bg-muted/50 border border-border rounded-xl px-6 py-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold font-heading mb-2">Ready to Post?</h3>
                        <p className="text-muted-foreground mb-4">
                            Find a workout location and time that works for you. All you need is yourself —
                            no sign-up required, just show up.
                        </p>
                        <a
                            href="/workouts"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors"
                        >
                            Find a Workout
                        </a>
                    </div>
                </div>
            </Section>
        </div>
    );
}

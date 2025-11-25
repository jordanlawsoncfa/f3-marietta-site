import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface HeroProps {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage?: string;
}

export function Hero({ title, subtitle, ctaText, ctaLink, backgroundImage }: HeroProps) {
    return (
        <div className="relative w-full py-24 md:py-32 lg:py-40 bg-zinc-900 text-white overflow-hidden">
            {/* Background Overlay or Image */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
                style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundColor: !backgroundImage ? "#18181b" : undefined
                }}
            />
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-background to-transparent" />

            <div className="container relative z-10 mx-auto px-4 text-center">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter font-heading mb-6 uppercase">
                    {title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8">
                    {subtitle}
                </p>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                    <Link href={ctaLink}>{ctaText}</Link>
                </Button>
            </div>
        </div>
    );
}

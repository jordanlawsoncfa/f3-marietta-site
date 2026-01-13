"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";


const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "F3 Terms", href: "/glossary" },
    { name: "Community", href: "/community" },
    { name: "Backblasts", href: "/backblasts" },
    { name: "FAQ", href: "/fng" },
    { name: "What to Expect", href: "/what-to-expect" },
    { name: "Contact Us", href: "/contact" },
    { name: "F3 Gear", href: "https://f3gear.com/", external: true },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-muted/95 backdrop-blur supports-[backdrop-filter]:bg-muted/60">
            <div className="container mx-auto flex min-h-[5rem] md:min-h-[6rem] items-center justify-between px-4 py-2 md:py-4">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8 h-full">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className={cn(
                                "text-base font-medium transition-colors text-gray-200 hover:text-primary flex items-center gap-1",
                                item.external && "text-muted-foreground hover:text-gray-200"
                            )}
                        >

                            {item.name}
                        </Link>
                    ))}
                    <Link
                        href="/workouts"
                        className={cn(
                            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                            "h-10 px-4 py-2",
                            "ml-2 font-bold uppercase tracking-wider"
                        )}
                    >
                        Find a Workout
                    </Link>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="flex items-center p-2 md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? "X" : "Menu"}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-border bg-muted">
                    <div className="container mx-auto flex flex-col gap-4 p-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                                rel={item.external ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "text-sm font-medium transition-colors text-gray-200 hover:text-primary flex items-center gap-2 py-2",
                                    item.external && "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >

                                {item.name}
                            </Link>
                        ))}
                        <Link
                            href="/workouts"
                            className={cn(
                                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                                "bg-primary text-primary-foreground hover:bg-primary/90",
                                "h-10 px-4 py-2",
                                "w-full font-bold uppercase tracking-wider mt-2"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            Find a Workout
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}

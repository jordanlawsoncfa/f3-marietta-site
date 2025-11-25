"use client";

import { useState } from "react";
import Link from "next/link";
// import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "About", href: "/about" },
    { name: "Workouts", href: "/workouts" },
    { name: "Glossary", href: "/glossary" },
    { name: "Community", href: "/community" },
    { name: "FNGs", href: "/fng" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium transition-colors hover:text-primary"
                        >
                            {item.name}
                        </Link>
                    ))}
                    <Button asChild variant="default" size="sm">
                        <Link href="/workouts">Find a Workout</Link>
                    </Button>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    className="flex items-center p-2 md:hidden"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? "X" : "Menu"}
                    {/* {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />} */}
                </button>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="container mx-auto flex flex-col gap-4 p-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium transition-colors hover:text-primary"
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <Button asChild variant="default" className="w-full">
                            <Link href="/workouts" onClick={() => setIsOpen(false)}>
                                Find a Workout
                            </Link>
                        </Button>
                    </div>
                </div>
            )}
        </header>
    );
}

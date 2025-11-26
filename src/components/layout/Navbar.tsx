"use client";

import { useState } from "react";
import Link from "next/link";
// import { Menu, X, Home } from "lucide-react"; // Assuming lucide is available
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Locations", href: "/workouts" },
    { name: "F3 Terms", href: "/glossary" },
    { name: "Community", href: "/community" },
    { name: "New to F3", href: "/fng" },
    { name: "Contact Us", href: "/contact" },
    { name: "F3 Gear", href: "https://f3gear.com/", external: true },
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
                            key={item.name}
                            href={item.href}
                            target={item.external ? "_blank" : undefined}
                            rel={item.external ? "noopener noreferrer" : undefined}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-1",
                                item.external && "text-muted-foreground hover:text-foreground"
                            )}
                        >

                            {item.name}
                        </Link>
                    ))}
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
                <div className="md:hidden border-t border-border/40 bg-background">
                    <div className="container mx-auto flex flex-col gap-4 p-4">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                target={item.external ? "_blank" : undefined}
                                rel={item.external ? "noopener noreferrer" : undefined}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2 py-2",
                                    item.external && "text-muted-foreground"
                                )}
                                onClick={() => setIsOpen(false)}
                            >

                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
}

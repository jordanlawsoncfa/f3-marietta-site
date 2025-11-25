import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-border/40 bg-background py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <span className="text-2xl font-bold tracking-tighter font-heading text-primary">
                                F3 MARIETTA
                            </span>
                        </Link>
                        <p className="text-muted-foreground max-w-sm">
                            Free, peer-led workouts for men in Marietta, GA.
                            Our mission is to plant, grow, and serve small workout groups for men for the invigoration of male community leadership.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link href="/workouts" className="text-muted-foreground hover:text-primary transition-colors">Workouts</Link></li>
                            <li><Link href="/community" className="text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
                            <li><Link href="/fng" className="text-muted-foreground hover:text-primary transition-colors">New Guys (FNGs)</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold mb-4">Connect</h3>
                        <ul className="space-y-2">
                            <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Twitter / X</a></li>
                            <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">Instagram</a></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} F3 Marietta. All rights reserved.</p>
                    <p className="mt-2">
                        F3 is always free, open to all men, held outdoors, peer-led, and ends with a Circle of Trust.
                    </p>
                </div>
            </div>
        </footer>
    );
}

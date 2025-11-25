import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Mail, Twitter, Instagram } from "lucide-react";

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="CONTACT US"
                subtitle="Have questions? Want to start an AO? Reach out."
                ctaText="Find a Workout"
                ctaLink="/workouts"
                backgroundImage="/images/contact-bg.jpg"
            />

            <Section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div>
                        <h2 className="text-3xl font-bold font-heading mb-6">GET IN TOUCH</h2>
                        <p className="text-muted-foreground mb-8">
                            The best way to reach us is to show up at a workout. But if you have specific questions or media inquiries, feel free to drop us a line.
                        </p>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {/* <Mail className="h-5 w-5" /> */} 📧 Email
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">info@f3marietta.com (Placeholder)</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        {/* <Twitter className="h-5 w-5" /> */} 📱 Social Media
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="flex gap-4">
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                        {/* <Twitter className="h-6 w-6" /> */} Twitter
                                    </a>
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                        {/* <Instagram className="h-6 w-6" /> */} Instagram
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="bg-muted/30 p-8 rounded-lg">
                        <h3 className="text-xl font-bold font-heading mb-4">SEND US A MESSAGE</h3>
                        <form className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    placeholder="Your Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    className="w-full p-2 rounded-md border border-input bg-background"
                                    placeholder="How can we help?"
                                />
                            </div>
                            <Button type="button" className="w-full">Send Message</Button>
                        </form>
                    </div>
                </div>
            </Section>
        </div>
    );
}

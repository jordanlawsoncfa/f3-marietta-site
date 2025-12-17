"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";
import { Hero } from "@/components/ui/Hero";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ChevronDown, MapPin, Clock, ExternalLink } from "lucide-react";

// Types
interface Workout {
    name: string;
    type: string;
    time: string;
    location?: string;
    address: string;
    region?: string; // For "Other Nearby" workouts
    mapLink?: string;
}

interface DaySchedule {
    marietta: Workout[];
    westCobb: Workout[];
    otherNearby: Workout[];
}

type WeekSchedule = Record<string, DaySchedule>;

// Schedule Data
const weekSchedule: WeekSchedule = {
    Monday: {
        marietta: [
            {
                name: "The Last Stand",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Custer Park",
                address: "600 Kenneth E Marcus Way, Marietta, GA",
                mapLink: "https://map.f3nation.com/?eventId=44023&locationId=44024",
            },
        ],
        westCobb: [
            {
                name: "The Forge",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Lost Mountain Park",
                address: "4843 Dallas Hwy, Powder Springs, GA 30127",
                mapLink: "https://map.f3nation.com/?eventId=34743&locationId=34744",
            },
            {
                name: "The Grove",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Hillgrove Highschool",
                address: "4165 Luther Ward Rd, Powder Springs, GA",
                mapLink: "https://map.f3nation.com/?eventId=32723&locationId=32724",
            },
            {
                name: "The Streak",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Logan Farm Park",
                address: "4405 Cherokee St, Acworth, GA",
                mapLink: "https://map.f3nation.com/",
            },
        ],
        otherNearby: [
            {
                name: "Madhouse",
                type: "Running",
                time: "5:45 AM – 6:15 AM",
                region: "Atlanta",
                location: "Taylor-Brawner Park",
                address: "3180 Atlanta Rd SE, Smyrna, GA",
                mapLink: "https://map.f3nation.com/?eventId=40243&locationId=40243",
            },
        ],
    },
    Tuesday: {
        marietta: [
            {
                name: "The Battlefield",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Marietta High School",
                address: "1171 Whitlock Ave NW, Marietta, GA",
                mapLink: "https://map.f3nation.com/?eventId=47961&locationId=47965",
            },
        ],
        westCobb: [
            {
                name: "Crazy 8's",
                type: "Running",
                time: "5:30 AM – 6:15 AM",
                location: "Lost Mountain Park",
                address: "4843 Dallas Hwy, Powder Springs, GA 30127",
                mapLink: "https://map.f3nation.com/?eventId=32865&locationId=34744",
            },
            {
                name: "The OG",
                type: "Bootcamp 0-0 (No running)",
                time: "5:30 AM – 6:15 AM",
                location: "Due West Methodist Church",
                address: "3956 Due West Rd, Marietta, GA",
                mapLink: "https://map.f3nation.com/?eventId=32866&locationId=32866",
            },
            {
                name: "The Chase",
                type: "Running",
                time: "5:30 AM – 6:15 AM",
                location: "Cobb Vineyard Church",
                address: "3206 Old 41 Hwy NW, Kennesaw, GA",
                mapLink: "https://map.f3nation.com/?eventId=44452&locationId=44452",
            },
        ],
        otherNearby: [
            {
                name: "The Flight Deck",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                region: "Cherokee",
                location: "Aviation Park",
                address: "2659 Barrett Lakes Blvd, Kennesaw, GA",
                mapLink: "https://map.f3nation.com/?eventId=32677&locationId=32677",
            },
            {
                name: "Warning Track",
                type: "Bootcamp",
                time: "5:45 AM – 6:30 AM",
                region: "Atlanta",
                location: "Tolleson Park",
                address: "3515 McCauley Rd, Smyrna, GA",
                mapLink: "https://map.f3nation.com/?eventId=32973&locationId=32975",
            },
        ],
    },
    Wednesday: {
        marietta: [
            {
                name: "The Last Stand",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Custer Park",
                address: "600 Kenneth E Marcus Way, Marietta, GA",
                mapLink: "https://map.f3nation.com/?eventId=44023&locationId=44024",
            },
        ],
        westCobb: [
            {
                name: "The Forge",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Lost Mountain Park",
                address: "4843 Dallas Hwy, Powder Springs, GA 30127",
                mapLink: "https://map.f3nation.com/?eventId=34743&locationId=34744",
            },
            {
                name: "The Grove",
                type: "Bootcamp",
                time: "5:30 AM – 6:30 AM",
                location: "Hillgrove Highschool",
                address: "4165 Luther Ward Rd, Powder Springs, GA",
                mapLink: "https://map.f3nation.com/?eventId=32723&locationId=32724",
            },
            {
                name: "The Streak",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Logan Farm Park",
                address: "4405 Cherokee St, Acworth, GA",
                mapLink: "https://map.f3nation.com/",
            },
        ],
        otherNearby: [
            {
                name: "Swiss Army Knife",
                type: "Bootcamp",
                time: "5:45 AM – 6:30 AM",
                region: "Atlanta",
                location: "Jonquil Park",
                address: "3000 Park Rd, Smyrna, GA 30080",
                mapLink: "https://map.f3nation.com/?eventId=41433&locationId=41433",
            },
        ],
    },
    Thursday: {
        marietta: [
            {
                name: "The Battlefield",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                location: "Marietta High School",
                address: "1171 Whitlock Ave NW, Marietta, GA",
                mapLink: "https://map.f3nation.com/?eventId=47961&locationId=47965",
            },
        ],
        westCobb: [
            {
                name: "Crazy 8's",
                type: "Running",
                time: "5:30 AM – 6:15 AM",
                location: "Lost Mountain Park",
                address: "4843 Dallas Hwy, Powder Springs, GA 30127",
                mapLink: "https://map.f3nation.com/?eventId=32865&locationId=34744",
            },
        ],
        otherNearby: [
            {
                name: "Galaxy",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                region: "West Atlanta",
                location: "East Cobb Park",
                address: "3322 Roswell Rd, Marietta, GA",
                mapLink: "https://map.f3nation.com/",
            },
            {
                name: "Warning Track",
                type: "Bootcamp",
                time: "5:45 AM – 6:30 AM",
                region: "Atlanta",
                location: "Tolleson Park",
                address: "3515 McCauley Rd, Smyrna, GA",
                mapLink: "https://map.f3nation.com/?eventId=32973&locationId=32975",
            },
        ],
    },
    Friday: {
        marietta: [],
        westCobb: [
            {
                name: "The Foundry",
                type: "Bootcamp",
                time: "5:15 AM – 6:15 AM",
                location: "Lost Mountain Park",
                address: "4843 Dallas Hwy, Powder Springs, GA 30127",
                mapLink: "https://map.f3nation.com/?eventId=34744&locationId=34744",
            },
        ],
        otherNearby: [
            {
                name: "The Flight Deck",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                region: "Cherokee",
                location: "Aviation Park",
                address: "2659 Barrett Lakes Blvd, Kennesaw, GA",
                mapLink: "https://map.f3nation.com/?eventId=32677&locationId=32677",
            },
            {
                name: "Galaxy",
                type: "Bootcamp",
                time: "5:30 AM – 6:15 AM",
                region: "West Atlanta",
                location: "East Cobb Park",
                address: "3322 Roswell Rd, Marietta, GA",
                mapLink: "https://map.f3nation.com/",
            },
        ],
    },
    Saturday: {
        marietta: [],
        westCobb: [
            {
                name: "The Outpost",
                type: "Bootcamp",
                time: "6:30 AM – 7:30 AM",
                location: "West Ridge Church",
                address: "3522 Hiram Acworth Hwy, Dallas, GA",
                mapLink: "https://map.f3nation.com/?eventId=45391&locationId=45391",
            },
        ],
        otherNearby: [
            {
                name: "Warning Track",
                type: "Bootcamp",
                time: "6:30 AM – 7:30 AM",
                region: "Atlanta",
                location: "Tolleson Park",
                address: "3515 McCauley Rd, Smyrna, GA",
                mapLink: "https://map.f3nation.com/?eventId=32973&locationId=32975",
            },
        ],
    },
    Sunday: {
        marietta: [],
        westCobb: [],
        otherNearby: [],
    },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const REGIONS = [
    { key: "marietta" as const, label: "Marietta" },
    { key: "westCobb" as const, label: "West Cobb" },
    { key: "otherNearby" as const, label: "Other Nearby" },
];

// Workout Card Component
function WorkoutCard({ workout }: { workout: Workout }) {
    return (
        <div className="bg-card border border-border rounded-md p-2 space-y-1.5 hover:border-primary/50 transition-colors">
            <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-foreground leading-tight">{workout.name}</h4>
                <div className="flex flex-wrap gap-1">
                    <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {workout.type}
                    </span>
                    {workout.region && (
                        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            {workout.region}
                        </span>
                    )}
                </div>
            </div>
            <div className="space-y-0.5 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5 shrink-0" />
                    <span>{workout.time}</span>
                </div>
                {workout.location && (
                    <div className="flex items-start gap-1">
                        <MapPin className="h-2.5 w-2.5 shrink-0 mt-0.5" />
                        <span className="leading-tight">{workout.location}</span>
                    </div>
                )}
                <div className="text-[9px] text-muted-foreground/70 pl-3.5 leading-tight">
                    {workout.address}
                </div>
            </div>
            {workout.mapLink && (
                <a
                    href={workout.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                >
                    Directions <ExternalLink className="h-2.5 w-2.5" />
                </a>
            )}
        </div>
    );
}

// Region Section Component
function RegionSection({ label, workouts }: { label: string; workouts: Workout[] }) {
    return (
        <div className="mb-3 last:mb-0">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 pb-1 border-b border-border/50">
                {label}
            </h4>
            {workouts.length > 0 ? (
                <div className="space-y-2">
                    {workouts.map((workout, idx) => (
                        <WorkoutCard key={`${workout.name}-${idx}`} workout={workout} />
                    ))}
                </div>
            ) : (
                <p className="text-xs text-muted-foreground/60 italic py-2">None</p>
            )}
        </div>
    );
}

// Day Column Component (Desktop)
function DayColumn({ day, schedule }: { day: string; schedule: DaySchedule }) {
    const hasNoWorkouts =
        schedule.marietta.length === 0 &&
        schedule.westCobb.length === 0 &&
        schedule.otherNearby.length === 0;

    return (
        <div className="bg-muted/30 rounded-lg border border-border p-2 flex flex-col">
            <h3 className="font-bold font-heading text-sm text-foreground mb-3 pb-2 border-b border-border text-center">
                {day.slice(0, 3)}
            </h3>
            {hasNoWorkouts ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                    No scheduled workouts
                </p>
            ) : (
                <>
                    {REGIONS.map((region) => (
                        <RegionSection
                            key={region.key}
                            label={region.label}
                            workouts={schedule[region.key]}
                        />
                    ))}
                </>
            )}
        </div>
    );
}

// Day Accordion Component (Mobile)
function DayAccordion({ day, schedule }: { day: string; schedule: DaySchedule }) {
    const [isOpen, setIsOpen] = useState(false);
    const totalWorkouts =
        schedule.marietta.length + schedule.westCobb.length + schedule.otherNearby.length;

    return (
        <div className="border border-border rounded-lg overflow-hidden bg-muted/30">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="font-bold font-heading text-foreground">{day}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {totalWorkouts} workout{totalWorkouts !== 1 ? "s" : ""}
                    </span>
                </div>
                <ChevronDown
                    className={cn(
                        "h-5 w-5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 border-t border-border">
                    {totalWorkouts === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No scheduled workouts
                        </p>
                    ) : (
                        <>
                            {REGIONS.map((region) => (
                                <RegionSection
                                    key={region.key}
                                    label={region.label}
                                    workouts={schedule[region.key]}
                                />
                            ))}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default function WorkoutsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Hero
                title="WORKOUT SCHEDULE"
                subtitle="Find a workout near you. Just show up."
                ctaText="What to Expect at F3"
                ctaLink="/what-to-expect"
                backgroundImage="/images/workouts-bg.jpg"
            />

            <Section>
                <div className="text-center max-w-2xl mx-auto mb-8">
                    <h2 className="text-3xl font-bold font-heading mb-4">WORKOUT SCHEDULE</h2>
                    <p className="text-muted-foreground">
                        All workouts are free, open to all men, and held outdoors rain or shine.
                        Check the schedule below and join us in the gloom.
                    </p>
                </div>

                {/* Desktop: Table layout with Marietta featured prominently */}
                <div className="hidden lg:block space-y-8">
                    {/* MARIETTA AOs - Featured Section */}
                    <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4">
                        <h3 className="text-lg font-bold font-heading text-primary mb-4 uppercase tracking-wide">
                            Marietta AOs
                        </h3>

                        {/* Day Headers Row */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                            {DAYS.map((day) => (
                                <div
                                    key={day}
                                    className="text-center font-bold font-heading text-sm text-foreground py-2 bg-muted/50 rounded-lg"
                                >
                                    {day.slice(0, 3)}
                                </div>
                            ))}
                        </div>

                        {/* Marietta Workouts Row */}
                        <div className="grid grid-cols-7 gap-2">
                            {DAYS.map((day) => {
                                const workouts = weekSchedule[day].marietta;
                                return (
                                    <div key={day} className="min-h-[140px] bg-card/50 rounded-lg p-2">
                                        {workouts.length > 0 ? (
                                            <div className="space-y-2">
                                                {workouts.map((workout, idx) => (
                                                    <WorkoutCard key={`${workout.name}-${idx}`} workout={workout} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground/50 italic text-center py-8">—</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* NEARBY AOs - West Cobb & Other Nearby */}
                    <div className="border border-border/50 rounded-xl p-4 bg-muted/20">
                        <h3 className="text-md font-bold font-heading text-muted-foreground mb-4">
                            Nearby AOs
                        </h3>

                        {/* Day Headers Row */}
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
                            <div></div>
                            {DAYS.map((day) => (
                                <div
                                    key={day}
                                    className="text-center font-semibold text-xs text-muted-foreground py-1.5"
                                >
                                    {day.slice(0, 3)}
                                </div>
                            ))}
                        </div>

                        {/* West Cobb Row */}
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 py-2 border-b border-border/30">
                            <div className="flex items-start justify-end pr-2">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    West Cobb
                                </span>
                            </div>
                            {DAYS.map((day) => {
                                const workouts = weekSchedule[day].westCobb;
                                return (
                                    <div key={day} className="min-h-[80px] bg-muted/10 rounded-md p-1">
                                        {workouts.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {workouts.map((workout, idx) => (
                                                    <WorkoutCard key={`${workout.name}-${idx}`} workout={workout} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground/40 italic text-center py-6">—</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Other Nearby Row */}
                        <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 py-2">
                            <div className="flex items-start justify-end pr-2">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                                    Other Nearby
                                </span>
                            </div>
                            {DAYS.map((day) => {
                                const workouts = weekSchedule[day].otherNearby;
                                return (
                                    <div key={day} className="min-h-[80px] bg-muted/10 rounded-md p-1">
                                        {workouts.length > 0 ? (
                                            <div className="space-y-1.5">
                                                {workouts.map((workout, idx) => (
                                                    <WorkoutCard key={`${workout.name}-${idx}`} workout={workout} />
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-muted-foreground/40 italic text-center py-6">—</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Mobile/Tablet: Accordion by day */}
                <div className="lg:hidden space-y-3">
                    {DAYS.map((day) => (
                        <DayAccordion key={day} day={day} schedule={weekSchedule[day]} />
                    ))}
                </div>
            </Section>

            <section className="mt-8 mb-20">
                <div className="max-w-2xl mx-auto text-center bg-[#0A1A2F] border border-[#23334A] rounded-xl px-6 py-8">
                    <h2 className="text-xl font-semibold mb-2 text-white">Not in Marietta? No problem!</h2>
                    <p className="text-gray-300">
                        You can find F3 workouts all across the country (and the world). Use the F3 Nation map to search for any region or AO.
                    </p>
                    <Button asChild className="mt-4">
                        <a
                            href="https://map.f3nation.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Find F3 Near You
                        </a>
                    </Button>
                </div>
            </section>
        </div>
    );
}

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AOCardProps {
    name: string;
    time: string;
    location: string;
    mapLink: string;
    description: string;
}

export function AOCard({ name, time, location, mapLink, description }: AOCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader>
                <CardTitle>{name}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-2">
                    {time}
                </CardDescription>
                <CardDescription className="flex items-center gap-1">
                    {location}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm">{description}</p>
            </CardContent>
            <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <a href={mapLink} target="_blank" rel="noopener noreferrer">
                        View on Map
                    </a>
                </Button>
            </CardFooter>
        </Card>
    );
}

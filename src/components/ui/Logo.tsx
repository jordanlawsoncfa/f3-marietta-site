import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
    showSubtext?: boolean;
}

export function Logo({ className, showSubtext = false }: LogoProps) {
    return (
        <div className={cn("group flex flex-col justify-center select-none", className)}>
            <div className="flex items-center gap-1.5">
                <div className="flex items-center justify-center bg-primary text-primary-foreground font-heading font-black text-lg px-2 py-0.5 rounded shadow-sm transform -skew-x-6">
                    F3
                </div>
                <span className="font-heading text-2xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors">
                    MARIETTA
                </span>
            </div>
            {showSubtext && (
                <span className="text-[0.6rem] font-semibold tracking-widest text-muted-foreground uppercase pl-1 mt-0.5">
                    Battlefield • The Last Stand
                </span>
            )}
        </div>
    );
}

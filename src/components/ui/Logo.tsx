import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <Link href="/" className={cn("relative block", className)}>
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                <Image
                    src="/f3-marietta-logo.png"
                    alt="F3 Marietta"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
        </Link>
    );
}

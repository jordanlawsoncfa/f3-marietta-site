import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type F3IconProps = {
    className?: string;
};

export const FitnessIcon: React.FC<F3IconProps> = ({ className }) => (
    <Image
        src="/icons/fitness-pushup.png"
        alt="Fitness icon – man doing a push-up"
        width={64}
        height={64}
        className={cn("object-contain", className)}
    />
);

export const FellowshipIcon: React.FC<F3IconProps> = ({ className }) => (
    <Image
        src="/icons/fellowship-group.png"
        alt="Fellowship icon – group of men"
        width={64}
        height={64}
        className={cn("object-contain", className)}
    />
);

export const FaithIcon: React.FC<F3IconProps> = ({ className }) => (
    <Image
        src="/icons/faith-hands.png"
        alt="Faith icon – raised hands"
        width={64}
        height={64}
        className={cn("object-contain", className)}
    />
);

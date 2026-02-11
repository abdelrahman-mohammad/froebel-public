"use client";

import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
    className?: string;
    children?: React.ReactNode;
}

export function AnimatedBackground({ className, children }: AnimatedBackgroundProps) {
    return (
        <div className={cn("relative min-h-full overflow-hidden", className)}>
            {/* Background base */}
            <div className="absolute inset-0 bg-background" />

            {/* Animated gradient blobs */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Primary blob - top right */}
                <div
                    className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-50 dark:opacity-30 blur-[100px] animate-blob"
                    style={{ backgroundColor: "hsl(var(--primary))" }}
                />

                {/* Secondary blob - bottom left */}
                <div
                    className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 dark:opacity-20 blur-[120px] animate-blob animation-delay-2000"
                    style={{ backgroundColor: "hsl(var(--chart-4))" }}
                />

                {/* Accent blob - center */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-30 dark:opacity-15 blur-[80px] animate-blob animation-delay-4000"
                    style={{ backgroundColor: "hsl(var(--success))" }}
                />

                {/* Additional small blob - top left */}
                <div
                    className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full opacity-35 dark:opacity-20 blur-[90px] animate-blob-reverse animation-delay-1000"
                    style={{ backgroundColor: "hsl(var(--chart-5))" }}
                />
            </div>

            {/* Noise overlay for texture */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] pointer-events-none bg-noise" />

            {/* Content */}
            <div className="relative z-10 min-h-[inherit] flex flex-col">{children}</div>
        </div>
    );
}

"use client";

import { cva } from "class-variance-authority";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { QuizCardSkeletonProps, QuizCardSize } from "./types";

// ============================================================================
// Variant Definitions (matching QuizCard)
// ============================================================================

const cardVariants = cva("flex flex-col h-full overflow-hidden", {
    variants: {
        variant: {
            explore: "border-l-4 border-l-muted",
            library: "",
            featured: "ring-2 ring-muted",
        },
        size: {
            compact: "gap-2",
            default: "gap-0",
            large: "gap-0",
        },
    },
    defaultVariants: {
        variant: "explore",
        size: "default",
    },
});

const bannerHeightMap: Record<QuizCardSize, string> = {
    compact: "h-0",
    default: "h-20",
    large: "h-28",
};

const iconSizeMap: Record<QuizCardSize, string> = {
    compact: "h-8 w-8",
    default: "h-12 w-12",
    large: "h-14 w-14",
};

const iconOverlapMap: Record<QuizCardSize, string> = {
    compact: "mt-0",
    default: "-mt-6",
    large: "-mt-7",
};

// ============================================================================
// Main Skeleton Component
// ============================================================================

export function QuizCardSkeleton({
    variant = "explore",
    size = "default",
    className,
}: QuizCardSkeletonProps) {
    const isCompact = size === "compact";
    const isLarge = size === "large";

    return (
        <Card className={cn(cardVariants({ variant, size }), className)}>
            {/* Banner Section - hidden for compact */}
            {!isCompact && (
                <div className={cn("overflow-hidden rounded-t-xl", bannerHeightMap[size])}>
                    <Skeleton className="h-full w-full rounded-none" />
                </div>
            )}

            {/* Header with overlapping icon */}
            <CardHeader
                className={cn(
                    "flex-row items-start gap-3 space-y-0 px-4",
                    !isCompact && iconOverlapMap[size],
                    !isCompact && "relative z-10",
                    isCompact ? "py-3" : "pt-0 pb-2"
                )}
            >
                {/* Icon Skeleton */}
                <Skeleton
                    className={cn(
                        iconSizeMap[size],
                        "rounded-lg shrink-0",
                        !isCompact && "ring-4 ring-card"
                    )}
                />

                {/* Title + Category Skeleton */}
                <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className={cn("h-5 w-3/4", isLarge && "h-6")} />
                    <Skeleton className="h-5 w-20 rounded-full" />
                </div>
            </CardHeader>

            <CardContent className={cn("flex-1 space-y-3 px-4", isCompact ? "pb-2" : "pb-3")}>
                {/* Description Skeleton - hidden for compact */}
                {!isCompact && (
                    <div className={cn("space-y-1.5", isLarge ? "min-h-[3.75rem]" : "min-h-[2.5rem]")}>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        {isLarge && <Skeleton className="h-4 w-2/3" />}
                    </div>
                )}

                {/* Separator */}
                <Skeleton className="h-px w-full" />

                {/* Stats Row Skeleton - always visible */}
                <div className={cn(
                    "flex flex-wrap gap-x-4 gap-y-1.5",
                    isCompact ? "text-xs" : "text-sm"
                )}>
                    <Skeleton className={cn(isCompact ? "h-3.5 w-20" : "h-4 w-24")} />
                    <Skeleton className={cn(isCompact ? "h-3.5 w-14" : "h-4 w-16")} />
                    <Skeleton className={cn(isCompact ? "h-3.5 w-12" : "h-4 w-16")} />
                </div>
            </CardContent>

            {/* Actions Skeleton */}
            <CardFooter className="gap-2 px-4 pb-4 pt-0 mt-auto">
                {isCompact ? (
                    <Skeleton className="h-8 w-8 rounded-md" />
                ) : (
                    <>
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </>
                )}
            </CardFooter>
        </Card>
    );
}

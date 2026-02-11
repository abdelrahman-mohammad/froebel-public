"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

interface StatsWidgetSkeletonProps {
    className?: string;
}

export function StatsWidgetSkeleton({ className }: StatsWidgetSkeletonProps) {
    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
            {[...Array(4)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-5 w-5 rounded mb-1" />
                    <Skeleton className="h-8 w-10 mb-1" />
                    <Skeleton className="h-3 w-16" />
                </div>
            ))}
        </div>
    );
}

"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseCardSkeletonProps {
    showImage?: boolean;
}

export function CourseCardSkeleton({ showImage = true }: CourseCardSkeletonProps) {
    return (
        <Card className="h-full flex flex-col overflow-hidden">
            {/* Image skeleton */}
            {showImage && <Skeleton className="w-full h-32" />}

            <CardHeader className={showImage ? "pt-3" : undefined}>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-2/3 mt-1" />
            </CardHeader>

            <CardContent className="flex-1">
                {/* Difficulty badge */}
                <Skeleton className="h-5 w-20 mb-3" />

                {/* Stats */}
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Tags */}
                <div className="flex gap-1.5 mt-4">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-14" />
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <Skeleton className="h-9 w-full" />
            </CardFooter>
        </Card>
    );
}

export default CourseCardSkeleton;

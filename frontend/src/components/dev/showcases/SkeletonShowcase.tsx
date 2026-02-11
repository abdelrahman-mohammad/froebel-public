"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { ShowcaseItem } from "../ShowcaseItem";

export function SkeletonShowcase() {
    return (
        <ShowcaseItem title="Skeleton" description="Placeholder loading states for content">
            <div className="space-y-6">
                {/* Basic Shapes */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic Shapes</h4>
                    <div className="flex flex-wrap items-center gap-4">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-lg" />
                    </div>
                </div>

                {/* Card Loading State */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Card Loading State
                    </h4>
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                </div>

                {/* Profile Card Skeleton */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Profile Card</h4>
                    <div className="flex flex-col space-y-3 w-[300px] p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-9 w-20" />
                            <Skeleton className="h-9 w-20" />
                        </div>
                    </div>
                </div>

                {/* List Skeleton */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">List Items</h4>
                    <div className="space-y-3 w-[400px]">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-10 w-10 rounded" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-8 w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Article Skeleton */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Article Preview
                    </h4>
                    <div className="space-y-4 w-[500px]">
                        <Skeleton className="h-[200px] w-full rounded-lg" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>

                {/* Table Skeleton */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Table Rows</h4>
                    <div className="w-full border rounded-lg overflow-hidden">
                        <div className="flex items-center gap-4 p-3 bg-muted/50">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24 ml-auto" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-3 border-t">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-28 ml-auto" />
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ShowcaseItem>
    );
}

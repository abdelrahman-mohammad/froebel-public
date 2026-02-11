import { CourseCardSkeleton } from "@/components/course/CourseCardSkeleton";
import { QuizBrowseCardSkeleton } from "@/components/browse";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExploreLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>

            {/* Search and filters */}
            <div className="flex flex-col gap-4 mb-8">
                <Skeleton className="h-10 w-full max-w-xl" />
                <div className="flex gap-3">
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                    <Skeleton className="h-8 w-24" />
                </div>
            </div>

            {/* Content grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) =>
                    i % 2 === 0 ? (
                        <QuizBrowseCardSkeleton key={i} />
                    ) : (
                        <CourseCardSkeleton key={i} />
                    )
                )}
            </div>
        </div>
    );
}

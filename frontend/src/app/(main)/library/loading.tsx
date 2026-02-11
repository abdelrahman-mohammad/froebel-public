import { QuizBrowseCardSkeleton } from "@/components/browse";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="mb-8">
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-48" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Search */}
            <div className="mb-6">
                <Skeleton className="h-10 w-full max-w-md" />
            </div>

            {/* Content grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <QuizBrowseCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

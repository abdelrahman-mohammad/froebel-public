import { QuizBrowseCardSkeleton } from "@/components/browse";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
    return (
        <div className="container mx-auto py-8 px-4">
            {/* Profile header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                {/* Avatar */}
                <Skeleton className="h-24 w-24 rounded-full" />

                {/* User info */}
                <div className="flex-1 text-center sm:text-left space-y-3">
                    <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                    <Skeleton className="h-4 w-32 mx-auto sm:mx-0" />
                    <Skeleton className="h-5 w-64 mx-auto sm:mx-0" />

                    {/* Stats row */}
                    <div className="flex gap-6 justify-center sm:justify-start">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>

                {/* Action button */}
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 mb-6 border-b pb-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-24" />
            </div>

            {/* Content grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <QuizBrowseCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

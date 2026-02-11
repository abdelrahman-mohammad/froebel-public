import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
    return (
        <div className="container mx-auto py-8 px-4 max-w-2xl">
            {/* Header */}
            <div className="mb-8">
                <Skeleton className="h-9 w-32 mb-2" />
                <Skeleton className="h-5 w-64" />
            </div>

            {/* Form skeleton */}
            <div className="space-y-6">
                {/* Form group 1 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Form group 2 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                </div>

                {/* Form group 3 */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-24 w-full" />
                </div>

                {/* Form group 4 - Avatar */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                </div>

                {/* Submit button */}
                <Skeleton className="h-10 w-32" />
            </div>
        </div>
    );
}

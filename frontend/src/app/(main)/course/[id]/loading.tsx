import { Loader2 } from "lucide-react";

export default function CourseLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading course...</p>
        </div>
    );
}

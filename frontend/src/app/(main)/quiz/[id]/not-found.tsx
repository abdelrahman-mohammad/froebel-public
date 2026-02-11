import Link from "next/link";

import { FileQuestion, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function QuizNotFound() {
    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
            <div className="mx-auto max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Quiz not found
                </h1>
                <p className="text-muted-foreground">
                    The quiz you&apos;re looking for doesn&apos;t exist or has
                    been removed.
                </p>
                <Button asChild>
                    <Link href="/explore">
                        <Search className="h-4 w-4" />
                        Browse quizzes
                    </Link>
                </Button>
            </div>
        </div>
    );
}

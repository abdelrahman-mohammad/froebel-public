import Link from "next/link";

import { FileQuestion, Home, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
            <div className="mx-auto max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <FileQuestion className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground">
                    Page not found
                </h1>
                <p className="text-muted-foreground">
                    The page you&apos;re looking for doesn&apos;t exist or has
                    been moved.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button asChild>
                        <Link href="/">
                            <Home className="h-4 w-4" />
                            Go home
                        </Link>
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/explore">
                            <Search className="h-4 w-4" />
                            Explore
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

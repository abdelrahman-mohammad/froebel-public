"use client";

import { useEffect } from "react";
import Link from "next/link";

import { AlertCircle, LogIn, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function AuthError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Auth route error:", error);
    }, [error]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
            <div className="mx-auto max-w-md space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                    <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground">
                    Something went wrong
                </h2>
                <p className="text-muted-foreground">
                    {error.message ||
                        "An error occurred while loading this page. Please try again."}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button onClick={reset}>
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                    <Button variant="outline" asChild>
                        <Link href="/login">
                            <LogIn className="h-4 w-4" />
                            Return to login
                        </Link>
                    </Button>
                </div>
                {process.env.NODE_ENV === "development" && error.digest && (
                    <p className="text-xs text-muted-foreground">
                        Error ID: {error.digest}
                    </p>
                )}
            </div>
        </div>
    );
}

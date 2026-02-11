"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { DashboardPage } from "@/components/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
    const { isAuthenticated, isInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push("/login");
        }
    }, [isInitialized, isAuthenticated, router]);

    // Show skeleton while initializing auth
    if (!isInitialized) {
        return (
            <div className="container mx-auto py-6 px-4 md:py-8">
                <div className="mb-6">
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-5 w-72" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
                    <Skeleton className="h-48" />
                    <Skeleton className="h-48" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <DashboardPage />;
}

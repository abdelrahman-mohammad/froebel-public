"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { SettingsNav } from "@/components/settings/SettingsNav";

import { useAuth } from "@/contexts/AuthContext";

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const { isAuthenticated, isInitialized } = useAuth();
    const router = useRouter();

    // Redirect unauthenticated users to login
    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isInitialized, router]);

    if (!isInitialized) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Left Navigation - stacks on mobile */}
                <aside className="w-full md:w-56 shrink-0">
                    <SettingsNav />
                </aside>

                {/* Right Content */}
                <main className="flex-1 min-w-0">{children}</main>
            </div>
        </div>
    );
}

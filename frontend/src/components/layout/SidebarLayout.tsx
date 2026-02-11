"use client";

import Image from "next/image";
import Link from "next/link";

import { Loader2, Plus, Search } from "lucide-react";

import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { useAuth } from "@/contexts/AuthContext";

import { useCreateQuiz } from "@/hooks/useCreateQuiz";

import { AppSidebar } from "./sidebar/AppSidebar";

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
    const { isAuthenticated } = useAuth();
    const { createAndRedirect, isCreating } = useCreateQuiz();

    // Common header for all users
    const header = (
        <header className="flex items-center h-16 px-4 gap-2 border-b bg-background shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image src="/logo.png" alt="Froebel" width={120} height={30} priority />
            </Link>
            <div className="flex-1 flex justify-center px-4">
                <SearchBar />
            </div>
            {isAuthenticated ? (
                <>
                    <Button asChild variant="secondary" size="sm">
                        <Link href="/explore">
                            <Search className="size-4 mr-1" />
                            Explore
                        </Link>
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={createAndRedirect}
                        disabled={isCreating}
                    >
                        {isCreating ? (
                            <Loader2 className="size-4 mr-1 animate-spin" />
                        ) : (
                            <Plus className="size-4 mr-1" />
                        )}
                        {isCreating ? "Creating..." : "Create"}
                    </Button>
                </>
            ) : (
                <>
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild variant="default" size="sm">
                        <Link href="/register">Sign up</Link>
                    </Button>
                </>
            )}
        </header>
    );

    // Always show sidebar layout
    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex flex-col h-screen w-full">
                {header}
                <div className="flex flex-1 overflow-hidden">
                    <AppSidebar />
                    <SidebarInset>
                        <main className="flex-1 overflow-auto">{children}</main>
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}

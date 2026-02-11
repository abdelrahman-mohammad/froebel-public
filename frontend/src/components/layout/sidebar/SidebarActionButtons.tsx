"use client";

import Link from "next/link";

import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useCreateQuiz } from "@/hooks/useCreateQuiz";

import { cn } from "@/lib/utils";

export function SidebarActionButtons() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    const { createAndRedirect, isCreating } = useCreateQuiz();

    return (
        <div
            className={cn(
                "flex gap-1 transition-all duration-200",
                isCollapsed ? "flex-col" : "flex-row"
            )}
        >
            <Button
                onClick={createAndRedirect}
                disabled={isCreating}
                variant="default"
                size={isCollapsed ? "icon" : "default"}
                className="flex-1"
            >
                {isCreating ? (
                    <Loader2 className={cn("size-4 animate-spin", isCollapsed && "size-5")} />
                ) : (
                    <Plus className={cn("size-4", isCollapsed && "size-5")} />
                )}
                {!isCollapsed && <span>{isCreating ? "Creating..." : "Create"}</span>}
            </Button>
            <Button
                asChild
                variant="secondary"
                size={isCollapsed ? "icon" : "default"}
                className="flex-1"
            >
                <Link href="/explore">
                    <Search className={cn("size-4", isCollapsed && "size-5")} />
                    {!isCollapsed && <span>Explore</span>}
                </Link>
            </Button>
        </div>
    );
}

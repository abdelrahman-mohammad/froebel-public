"use client";

import Link from "next/link";

import { Loader2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCreateQuiz } from "@/hooks/useCreateQuiz";

import { cn } from "@/lib/utils";

interface QuickActionsWidgetProps {
    className?: string;
}

export function QuickActionsWidget({ className }: QuickActionsWidgetProps) {
    const { createAndRedirect, isCreating } = useCreateQuiz();

    return (
        <div className={cn("flex flex-wrap gap-3", className)}>
            <Button
                onClick={createAndRedirect}
                disabled={isCreating}
                className="flex-1 min-w-[140px]"
            >
                {isCreating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Plus className="h-4 w-4" />
                )}
                {isCreating ? "Creating..." : "Create Quiz"}
            </Button>
            <Button asChild variant="secondary" className="flex-1 min-w-[140px]">
                <Link href="/course/new">
                    <Plus className="h-4 w-4" />
                    Create Course
                </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 min-w-[140px]">
                <Link href="/explore">
                    <Search className="h-4 w-4" />
                    Explore
                </Link>
            </Button>
        </div>
    );
}

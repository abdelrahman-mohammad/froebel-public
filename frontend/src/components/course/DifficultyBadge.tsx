"use client";

import { Badge } from "@/components/ui/badge";

import type { Difficulty } from "@/lib/course/types";
import { cn } from "@/lib/utils";

interface DifficultyBadgeProps {
    difficulty: Difficulty;
    className?: string;
}

const difficultyConfig: Record<Difficulty, { label: string; className: string }> = {
    BEGINNER: {
        label: "Beginner",
        className:
            "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    INTERMEDIATE: {
        label: "Intermediate",
        className:
            "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
    },
    ADVANCED: {
        label: "Advanced",
        className:
            "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
    },
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
    const config = difficultyConfig[difficulty];

    return (
        <Badge variant="secondary" className={cn(config.className, "font-medium", className)}>
            {config.label}
        </Badge>
    );
}

export default DifficultyBadge;

"use client";

import { Flame, Zap } from "lucide-react";

import { cn } from "@/lib/utils";

interface GamificationHeaderProps {
    streak: number;
    totalXP: number;
    className?: string;
}

export function GamificationHeader({ streak, totalXP, className }: GamificationHeaderProps) {
    const hasActiveStreak = streak > 0;

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-8 py-4 px-6 rounded-xl bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/10",
                className
            )}
        >
            {/* Streak Display */}
            <div className="flex items-center gap-2">
                <Flame
                    className={cn(
                        "h-6 w-6",
                        hasActiveStreak
                            ? "text-warning animate-pulse-fire"
                            : "text-muted-foreground"
                    )}
                />
                <div className="flex flex-col">
                    <span className="text-xl font-bold tabular-nums">{streak}</span>
                    <span className="text-xs text-muted-foreground">Day Streak</span>
                </div>
            </div>

            {/* Divider */}
            <div className="h-10 w-px bg-border" />

            {/* XP Display */}
            <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-chart-4" />
                <div className="flex flex-col">
                    <span className="text-xl font-bold tabular-nums">
                        {totalXP.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">Total XP</span>
                </div>
            </div>
        </div>
    );
}

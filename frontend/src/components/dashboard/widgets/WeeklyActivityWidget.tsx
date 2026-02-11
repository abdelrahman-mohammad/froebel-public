"use client";

import { Check } from "lucide-react";

import type { DayActivity } from "@/hooks/useGamificationMock";

import { cn } from "@/lib/utils";

import { DashboardSection } from "../DashboardSection";

interface WeeklyActivityWidgetProps {
    weekData: DayActivity[];
    dailyGoal: number;
    className?: string;
}

interface ActivityBarProps {
    day: DayActivity;
    maxXP: number;
    dailyGoal: number;
    isToday: boolean;
    index: number;
}

function ActivityBar({ day, maxXP, dailyGoal, isToday, index }: ActivityBarProps) {
    // Calculate bar height as percentage of max XP (minimum 4px for visibility)
    const heightPercentage = maxXP > 0 ? (day.xpEarned / maxXP) * 100 : 0;
    const barHeight = Math.max(4, heightPercentage);

    return (
        <div className="flex flex-col items-center gap-1.5 flex-1">
            {/* Bar container */}
            <div className="relative w-full h-20 flex items-end justify-center">
                {/* Goal line marker */}
                <div
                    className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/30"
                    style={{ bottom: `${(dailyGoal / maxXP) * 100}%` }}
                />

                {/* Activity bar */}
                <div
                    className={cn(
                        "w-full max-w-6 rounded-t-sm animate-grow-bar",
                        day.goalMet
                            ? "bg-gradient-to-t from-success to-success/80"
                            : "bg-gradient-to-t from-primary to-primary/80",
                        isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                    style={{
                        height: `${barHeight}%`,
                        animationDelay: `${index * 50}ms`,
                    }}
                />

                {/* Goal met checkmark */}
                {day.goalMet && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                        <div className="flex items-center justify-center w-4 h-4 rounded-full bg-success">
                            <Check className="w-3 h-3 text-success-foreground" />
                        </div>
                    </div>
                )}
            </div>

            {/* Day label */}
            <span
                className={cn(
                    "text-xs font-medium",
                    isToday ? "text-primary font-bold" : "text-muted-foreground"
                )}
            >
                {day.day}
            </span>

            {/* XP earned (only show on hover/focus or for today) */}
            <span
                className={cn(
                    "text-xs tabular-nums",
                    isToday ? "text-foreground" : "text-muted-foreground/60"
                )}
            >
                {day.xpEarned > 0 ? `+${day.xpEarned}` : "—"}
            </span>
        </div>
    );
}

export function WeeklyActivityWidget({
    weekData,
    dailyGoal,
    className,
}: WeeklyActivityWidgetProps) {
    // Find max XP for scaling (ensure it's at least the daily goal)
    const maxXP = Math.max(dailyGoal, ...weekData.map((d) => d.xpEarned));

    // Calculate weekly stats
    const totalXP = weekData.reduce((sum, day) => sum + day.xpEarned, 0);
    const daysGoalMet = weekData.filter((d) => d.goalMet).length;

    return (
        <DashboardSection title="This Week" className={className}>
            {/* Chart */}
            <div className="flex items-end justify-between gap-2 px-2 py-4">
                {weekData.map((day, index) => (
                    <ActivityBar
                        key={`${day.day}-${index}`}
                        day={day}
                        maxXP={maxXP}
                        dailyGoal={dailyGoal}
                        isToday={index === weekData.length - 1}
                        index={index}
                    />
                ))}
            </div>

            {/* Weekly summary */}
            <div className="flex items-center justify-between pt-4 border-t border-border text-sm">
                <div className="flex items-center gap-4">
                    <div>
                        <span className="text-muted-foreground">Total: </span>
                        <span className="font-semibold tabular-nums">
                            {totalXP.toLocaleString()} XP
                        </span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Goals met: </span>
                        <span className="font-semibold tabular-nums text-success">
                            {daysGoalMet}/7
                        </span>
                    </div>
                </div>
                <div className="text-xs text-muted-foreground">Goal: {dailyGoal} XP/day</div>
            </div>
        </DashboardSection>
    );
}

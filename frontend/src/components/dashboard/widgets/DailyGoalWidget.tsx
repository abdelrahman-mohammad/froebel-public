"use client";

import { CircularProgress } from "@/components/ui/circular-progress";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/lib/utils";

interface DailyGoalWidgetProps {
    currentXP: number;
    goalXP: number;
    streak: number;
    className?: string;
}

function getProgressVariant(percentage: number) {
    if (percentage >= 100) return "success";
    if (percentage >= 50) return "default";
    return "warning";
}

function getMotivationalMessage(percentage: number, streak: number): string {
    if (percentage >= 100) {
        return "Amazing! You've reached your daily goal! Keep the momentum going!";
    }
    if (percentage >= 75) {
        return "Almost there! Just a little more to reach your goal!";
    }
    if (percentage >= 50) {
        return "Great progress! You're halfway to your daily goal!";
    }
    if (streak > 0) {
        return `Complete your goal to maintain your ${streak}-day streak!`;
    }
    return "Start a quiz to begin earning XP and build your streak!";
}

export function DailyGoalWidget({ currentXP, goalXP, streak, className }: DailyGoalWidgetProps) {
    const percentage = Math.min(100, (currentXP / goalXP) * 100);
    const variant = getProgressVariant(percentage);
    const message = getMotivationalMessage(percentage, streak);

    return (
        <div
            className={cn(
                "flex flex-col items-center gap-6 p-6 rounded-xl bg-card border border-border",
                className
            )}
        >
            {/* Circular Progress Ring */}
            <CircularProgress value={percentage} size={140} strokeWidth={10} variant={variant}>
                <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold tabular-nums">{currentXP}</span>
                    <span className="text-sm text-muted-foreground">/ {goalXP} XP</span>
                </div>
            </CircularProgress>

            {/* Today's Goal Section */}
            <div className="w-full max-w-xs space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Today&apos;s Goal</span>
                    <span className="text-muted-foreground tabular-nums">
                        {Math.round(percentage)}%
                    </span>
                </div>
                <Progress value={percentage} variant={variant} />
            </div>

            {/* Motivational Message */}
            <p className="text-sm text-muted-foreground text-center max-w-xs">{message}</p>
        </div>
    );
}

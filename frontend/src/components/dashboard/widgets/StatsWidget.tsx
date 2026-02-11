"use client";

import type { DashboardStats } from "@/hooks/useDashboard";

import { cn } from "@/lib/utils";

interface StatsWidgetProps {
    stats: DashboardStats;
    className?: string;
}

interface StatItemProps {
    value: number;
    label: string;
}

function StatItem({ value, label }: StatItemProps) {
    return (
        <div className="flex flex-col items-center text-center">
            <span className="text-2xl font-bold tabular-nums">{value}</span>
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    );
}

export function StatsWidget({ stats, className }: StatsWidgetProps) {
    return (
        <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6", className)}>
            <StatItem value={stats.quizzesCreated} label="Quizzes Created" />
            <StatItem value={stats.coursesCreated} label="Courses Created" />
            <StatItem value={stats.quizzesTaken} label="Quizzes Taken" />
            <StatItem value={stats.coursesEnrolled} label="Enrolled" />
        </div>
    );
}

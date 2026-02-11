"use client";

import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useDashboard } from "@/hooks/useDashboard";
import { useGamificationMock } from "@/hooks/useGamificationMock";

import { ContinueLearningWidget } from "./widgets/ContinueLearningWidget";
import { DailyGoalWidget } from "./widgets/DailyGoalWidget";
import { GamificationHeader } from "./widgets/GamificationHeader";
import { QuickActionsWidget } from "./widgets/QuickActionsWidget";
import { RecentCoursesWidget } from "./widgets/RecentCoursesWidget";
import { RecentQuizzesWidget } from "./widgets/RecentQuizzesWidget";
import { RecommendedQuizzesWidget } from "./widgets/RecommendedQuizzesWidget";
import { WeeklyActivityWidget } from "./widgets/WeeklyActivityWidget";

export function DashboardPage() {
    const { data, isLoading, error, refetch } = useDashboard();
    const { data: gamificationData, isLoading: gamificationLoading } = useGamificationMock();

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                    <h2 className="text-lg font-semibold mb-2">Failed to load dashboard</h2>
                    <p className="text-muted-foreground text-sm mb-4">{error}</p>
                    <Button onClick={refetch} variant="outline">
                        <RefreshCw className="h-4 w-4" />
                        Try again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            {/* Header */}
            <header className="mb-6">
                {isLoading ? (
                    <>
                        <Skeleton className="h-8 w-64 mb-2" />
                        <Skeleton className="h-5 w-80" />
                    </>
                ) : data?.profile ? (
                    <>
                        <h1 className="text-2xl font-bold">
                            Welcome back, {data.profile.displayName}!
                        </h1>
                        <p className="text-muted-foreground">Ready to learn something new today?</p>
                    </>
                ) : null}
            </header>

            {/* Gamification Header - Streak & XP */}
            <div className="mb-6">
                {gamificationLoading ? (
                    <Skeleton className="h-20 w-full rounded-xl" />
                ) : gamificationData ? (
                    <GamificationHeader
                        streak={gamificationData.currentStreak}
                        totalXP={gamificationData.totalXP}
                    />
                ) : null}
            </div>

            {/* Daily Goal Widget */}
            <div className="mb-6">
                {gamificationLoading ? (
                    <Skeleton className="h-64 w-full rounded-xl" />
                ) : gamificationData ? (
                    <DailyGoalWidget
                        currentXP={gamificationData.todayXP}
                        goalXP={gamificationData.dailyGoal}
                        streak={gamificationData.currentStreak}
                    />
                ) : null}
            </div>

            {/* Continue Learning - only shows if there are enrollments */}
            {!isLoading && data && data.inProgressEnrollments.length > 0 && (
                <ContinueLearningWidget enrollments={data.inProgressEnrollments} />
            )}

            {/* Quick Actions */}
            <div className="py-6 border-b">
                <QuickActionsWidget />
            </div>

            {/* Weekly Activity */}
            {gamificationLoading ? (
                <div className="py-6 border-b">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <Skeleton className="h-32 w-full" />
                </div>
            ) : gamificationData ? (
                <WeeklyActivityWidget
                    weekData={gamificationData.weeklyActivity}
                    dailyGoal={gamificationData.dailyGoal}
                />
            ) : null}

            {/* Recommended Quizzes */}
            {gamificationLoading ? (
                <div className="py-6 border-b">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-40" />
                        <Skeleton className="h-40" />
                    </div>
                </div>
            ) : gamificationData ? (
                <RecommendedQuizzesWidget quizzes={gamificationData.recommendedQuizzes} />
            ) : null}

            {/* My Quizzes */}
            {isLoading ? (
                <div className="py-6 border-b">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="divide-y">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-4">
                                <Skeleton className="h-5 w-5" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-48 mb-1" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : data ? (
                <RecentQuizzesWidget quizzes={data.recentQuizzes} />
            ) : null}

            {/* My Courses */}
            {isLoading ? (
                <div className="py-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="divide-y">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 py-4">
                                <Skeleton className="h-5 w-5" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-48 mb-1" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : data ? (
                <RecentCoursesWidget courses={data.recentCourses} />
            ) : null}
        </div>
    );
}

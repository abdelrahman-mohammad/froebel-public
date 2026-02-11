"use client";

import { useCallback, useEffect, useState } from "react";

import { getMyCourses, getMyEnrollments } from "@/lib/course/api";
import type { CourseSummaryDTO, EnrollmentSummaryDTO } from "@/lib/course/types";
import { getMyProfile } from "@/lib/profile/api";
import type { ProfileResponse } from "@/lib/profile/types";
import { getMyQuizzes } from "@/lib/quiz/api";
import type { QuizSummaryDTO } from "@/lib/quiz/types";

export interface DashboardStats {
    quizzesCreated: number;
    coursesCreated: number;
    quizzesTaken: number;
    coursesEnrolled: number;
}

export interface DashboardData {
    stats: DashboardStats;
    recentQuizzes: QuizSummaryDTO[];
    recentCourses: CourseSummaryDTO[];
    inProgressEnrollments: EnrollmentSummaryDTO[];
    profile: ProfileResponse | null;
}

interface UseDashboardReturn {
    data: DashboardData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch all data in parallel
            const [profile, quizzesResponse, coursesResponse, enrollmentsResponse] =
                await Promise.all([
                    getMyProfile(),
                    getMyQuizzes(0, 4, "updatedAt,desc"),
                    getMyCourses(0, 4, "updatedAt,desc"),
                    getMyEnrollments(0, 10),
                ]);

            // Filter for in-progress enrollments (not completed)
            const inProgressEnrollments = enrollmentsResponse.content.filter(
                (enrollment) => enrollment.progressPercentage < 100 && !enrollment.completedAt
            );

            // Build stats
            const stats: DashboardStats = {
                quizzesCreated: profile.stats.quizzesCreated,
                coursesCreated: profile.stats.coursesCreated,
                quizzesTaken: profile.stats.quizzesTaken ?? 0,
                coursesEnrolled: enrollmentsResponse.totalElements,
            };

            setData({
                stats,
                recentQuizzes: quizzesResponse.content,
                recentCourses: coursesResponse.content,
                inProgressEnrollments: inProgressEnrollments.slice(0, 3),
                profile,
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load dashboard";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchDashboard,
    };
}

/**
 * useEnrollments Hook
 * Manages user's course enrollments with pagination
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import {
    enrollInCourse as enrollApi,
    getCourseErrorMessage,
    getMyEnrollments,
    unenrollFromCourse as unenrollApi,
} from "@/lib/course/api";
import type { EnrollmentDTO, EnrollmentSummaryDTO } from "@/lib/course/types";

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface UseEnrollmentsReturn {
    enrollments: EnrollmentSummaryDTO[];
    isLoading: boolean;
    isEnrolling: boolean;
    error: string | null;
    pagination: Pagination;
    // Operations
    enroll: (courseId: string) => Promise<EnrollmentDTO>;
    unenroll: (courseId: string) => Promise<void>;
    // Check enrollment
    isEnrolled: (courseId: string) => boolean;
    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    // Utilities
    refetch: () => Promise<void>;
    clearError: () => void;
}

export function useEnrollments(initialPageSize = 20): UseEnrollmentsReturn {
    const [enrollments, setEnrollments] = useState<EnrollmentSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        pageSize: initialPageSize,
        totalPages: 0,
        totalItems: 0,
    });

    // Fetch enrollments from API
    const fetchEnrollments = useCallback(async (page: number, size: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMyEnrollments(page, size);
            setEnrollments(response.content);
            setPagination({
                page: response.pageable.pageNumber,
                pageSize: response.pageable.pageSize,
                totalPages: response.totalPages,
                totalItems: response.totalElements,
            });
        } catch (err) {
            const message = getCourseErrorMessage(err);
            setError(message);
            console.error("Failed to fetch enrollments:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchEnrollments(pagination.page, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch current page
    const refetch = useCallback(async () => {
        await fetchEnrollments(pagination.page, pagination.pageSize);
    }, [fetchEnrollments, pagination.page, pagination.pageSize]);

    // Change page
    const setPage = useCallback(
        (page: number) => {
            fetchEnrollments(page, pagination.pageSize);
        },
        [fetchEnrollments, pagination.pageSize]
    );

    // Change page size
    const setPageSize = useCallback(
        (size: number) => {
            fetchEnrollments(0, size); // Reset to first page
        },
        [fetchEnrollments]
    );

    // Enroll in a course
    const enroll = useCallback(
        async (courseId: string): Promise<EnrollmentDTO> => {
            setIsEnrolling(true);
            setError(null);

            try {
                const response = await enrollApi(courseId);
                await refetch(); // Refresh list
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsEnrolling(false);
            }
        },
        [refetch]
    );

    // Unenroll from a course
    const unenroll = useCallback(
        async (courseId: string): Promise<void> => {
            setIsEnrolling(true);
            setError(null);

            try {
                await unenrollApi(courseId);
                // Optimistic update - remove from list immediately
                setEnrollments((prev) => prev.filter((e) => e.courseId !== courseId));
                setPagination((prev) => ({
                    ...prev,
                    totalItems: prev.totalItems - 1,
                }));
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                await refetch(); // Revert optimistic update on error
                throw err;
            } finally {
                setIsEnrolling(false);
            }
        },
        [refetch]
    );

    // Check if user is enrolled in a course
    const isEnrolled = useCallback(
        (courseId: string): boolean => {
            return enrollments.some((e) => e.courseId === courseId);
        },
        [enrollments]
    );

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        enrollments,
        isLoading,
        isEnrolling,
        error,
        pagination,
        enroll,
        unenroll,
        isEnrolled,
        setPage,
        setPageSize,
        refetch,
        clearError,
    };
}

export default useEnrollments;

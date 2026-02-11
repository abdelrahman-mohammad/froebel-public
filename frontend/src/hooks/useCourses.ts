/**
 * useCourses Hook
 * Manages user's course list with API integration and pagination
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import {
    createCourse as createCourseApi,
    deleteCourse as deleteCourseApi,
    getCourseById,
    getCourseErrorMessage,
    getMyCourses,
    setCoursePublished as setCoursePublishedApi,
    updateCourse as updateCourseApi,
} from "@/lib/course/api";
import type {
    CourseDetailDTO,
    CourseSummaryDTO,
    CreateCourseRequest,
    UpdateCourseRequest,
} from "@/lib/course/types";

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface UseCoursesReturn {
    courses: CourseSummaryDTO[];
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
    // CRUD operations
    createCourse: (data: CreateCourseRequest) => Promise<CourseDetailDTO>;
    updateCourse: (courseId: string, data: UpdateCourseRequest) => Promise<CourseDetailDTO>;
    deleteCourse: (courseId: string) => Promise<void>;
    getCourse: (courseId: string) => Promise<CourseDetailDTO>;
    // Publish
    setCoursePublished: (courseId: string, published: boolean) => Promise<CourseDetailDTO>;
    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    // Utilities
    refetch: () => Promise<void>;
    clearError: () => void;
}

export function useCourses(): UseCoursesReturn {
    const [courses, setCourses] = useState<CourseSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        pageSize: 20,
        totalPages: 0,
        totalItems: 0,
    });

    // Fetch courses from API
    const fetchCourses = useCallback(async (page: number, size: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMyCourses(page, size);
            setCourses(response.content);
            setPagination({
                page: response.pageable.pageNumber,
                pageSize: response.pageable.pageSize,
                totalPages: response.totalPages,
                totalItems: response.totalElements,
            });
        } catch (err) {
            const message = getCourseErrorMessage(err);
            setError(message);
            console.error("Failed to fetch courses:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchCourses(pagination.page, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch current page
    const refetch = useCallback(async () => {
        await fetchCourses(pagination.page, pagination.pageSize);
    }, [fetchCourses, pagination.page, pagination.pageSize]);

    // Change page
    const setPage = useCallback(
        (page: number) => {
            fetchCourses(page, pagination.pageSize);
        },
        [fetchCourses, pagination.pageSize]
    );

    // Change page size
    const setPageSize = useCallback(
        (size: number) => {
            fetchCourses(0, size); // Reset to first page
        },
        [fetchCourses]
    );

    // Create a new course
    const createCourse = useCallback(
        async (data: CreateCourseRequest): Promise<CourseDetailDTO> => {
            try {
                const response = await createCourseApi(data);
                await refetch(); // Refresh list
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        [refetch]
    );

    // Update an existing course
    const updateCourse = useCallback(
        async (courseId: string, data: UpdateCourseRequest): Promise<CourseDetailDTO> => {
            try {
                const response = await updateCourseApi(courseId, data);
                await refetch(); // Refresh list
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        [refetch]
    );

    // Delete a course
    const deleteCourse = useCallback(
        async (courseId: string): Promise<void> => {
            try {
                await deleteCourseApi(courseId);
                // Optimistic update - remove from list immediately
                setCourses((prev) => prev.filter((c) => c.id !== courseId));
                setPagination((prev) => ({
                    ...prev,
                    totalItems: prev.totalItems - 1,
                }));
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                await refetch(); // Revert optimistic update on error
                throw err;
            }
        },
        [refetch]
    );

    // Get a single course by ID
    const getCourse = useCallback(async (courseId: string): Promise<CourseDetailDTO> => {
        try {
            const response = await getCourseById(courseId);
            return response;
        } catch (err) {
            const message = getCourseErrorMessage(err);
            setError(message);
            throw err;
        }
    }, []);

    // Set course published status
    const setCoursePublished = useCallback(
        async (courseId: string, published: boolean): Promise<CourseDetailDTO> => {
            try {
                const response = await setCoursePublishedApi(courseId, published);
                // Update local state
                setCourses((prev) =>
                    prev.map((c) => (c.id === courseId ? { ...c, published } : c))
                );
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        []
    );

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        courses,
        isLoading,
        error,
        pagination,
        createCourse,
        updateCourse,
        deleteCourse,
        getCourse,
        setCoursePublished,
        setPage,
        setPageSize,
        refetch,
        clearError,
    };
}

export default useCourses;

/**
 * usePublicCourses Hook
 * Manages public course browsing with search, filters, and pagination
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { getCourseErrorMessage, getPublicCourses } from "@/lib/course/api";
import type {
    Difficulty,
    PublicCourseFilters,
    PublicCourseSummaryDTO,
    SortOption,
} from "@/lib/course/types";

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface UsePublicCoursesOptions {
    initialFilters?: PublicCourseFilters;
    pageSize?: number;
}

export interface UsePublicCoursesReturn {
    courses: PublicCourseSummaryDTO[];
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
    // Filter state
    search: string;
    categoryId: string | null;
    difficulty: Difficulty | null;
    tags: string[];
    sortBy: SortOption;
    // Filter setters
    setSearch: (query: string) => void;
    setCategoryId: (categoryId: string | null) => void;
    setDifficulty: (difficulty: Difficulty | null) => void;
    setTags: (tags: string[]) => void;
    setSortBy: (sortBy: SortOption) => void;
    setPage: (page: number) => void;
    // Actions
    refetch: () => Promise<void>;
    clearError: () => void;
    clearFilters: () => void;
}

export function usePublicCourses(options: UsePublicCoursesOptions = {}): UsePublicCoursesReturn {
    const { initialFilters = {}, pageSize = 20 } = options;

    const [courses, setCourses] = useState<PublicCourseSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [search, setSearchState] = useState(initialFilters.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || "");
    const [categoryId, setCategoryIdState] = useState<string | null>(
        initialFilters.categoryId || null
    );
    const [difficulty, setDifficultyState] = useState<Difficulty | null>(
        initialFilters.difficulty || null
    );
    const [tags, setTagsState] = useState<string[]>(initialFilters.tags || []);
    const [sortBy, setSortByState] = useState<SortOption>(initialFilters.sortBy || "newest");

    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        pageSize,
        totalPages: 0,
        totalItems: 0,
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch courses from API
    const fetchCourses = useCallback(
        async (page: number, size: number, filters: PublicCourseFilters) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getPublicCourses(page, size, filters);
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
                console.error("Failed to fetch public courses:", err);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Fetch when filters or pagination changes
    useEffect(() => {
        const filters: PublicCourseFilters = {
            search: debouncedSearch || undefined,
            categoryId: categoryId || undefined,
            difficulty: difficulty || undefined,
            tags: tags.length > 0 ? tags : undefined,
            sortBy,
        };
        fetchCourses(pagination.page, pagination.pageSize, filters);
    }, [
        fetchCourses,
        debouncedSearch,
        categoryId,
        difficulty,
        tags,
        sortBy,
        pagination.page,
        pagination.pageSize,
    ]);

    // Set search (resets to first page)
    const setSearch = useCallback((query: string) => {
        setSearchState(query);
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    // Set category (resets to first page)
    const setCategoryId = useCallback((id: string | null) => {
        setCategoryIdState(id);
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    // Set difficulty filter (resets to first page)
    const setDifficulty = useCallback((diff: Difficulty | null) => {
        setDifficultyState(diff);
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    // Set tags (resets to first page)
    const setTags = useCallback((newTags: string[]) => {
        setTagsState(newTags);
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    // Set sort (resets to first page)
    const setSortBy = useCallback((sort: SortOption) => {
        setSortByState(sort);
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    // Set page
    const setPage = useCallback((page: number) => {
        setPagination((prev) => ({ ...prev, page }));
    }, []);

    // Refetch current page
    const refetch = useCallback(async () => {
        const filters: PublicCourseFilters = {
            search: debouncedSearch || undefined,
            categoryId: categoryId || undefined,
            difficulty: difficulty || undefined,
            tags: tags.length > 0 ? tags : undefined,
            sortBy,
        };
        await fetchCourses(pagination.page, pagination.pageSize, filters);
    }, [
        fetchCourses,
        pagination.page,
        pagination.pageSize,
        debouncedSearch,
        categoryId,
        difficulty,
        tags,
        sortBy,
    ]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchState("");
        setDebouncedSearch("");
        setCategoryIdState(null);
        setDifficultyState(null);
        setTagsState([]);
        setSortByState("newest");
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    return {
        courses,
        isLoading,
        error,
        pagination,
        search,
        categoryId,
        difficulty,
        tags,
        sortBy,
        setSearch,
        setCategoryId,
        setDifficulty,
        setTags,
        setSortBy,
        setPage,
        refetch,
        clearError,
        clearFilters,
    };
}

export default usePublicCourses;

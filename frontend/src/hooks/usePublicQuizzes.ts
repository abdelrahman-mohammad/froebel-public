/**
 * usePublicQuizzes Hook
 * Manages public quiz browsing with search, filters, and pagination
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { getPublicQuizzes, getQuizErrorMessage } from "@/lib/quiz/api";
import type { PublicQuizFilters, PublicQuizSummaryDTO, SortOption } from "@/lib/quiz/types";

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface UsePublicQuizzesOptions {
    initialFilters?: PublicQuizFilters;
    pageSize?: number;
}

export interface UsePublicQuizzesReturn {
    quizzes: PublicQuizSummaryDTO[];
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
    // Filter state
    search: string;
    categoryId: string | null;
    tags: string[];
    sortBy: SortOption;
    // Filter setters
    setSearch: (query: string) => void;
    setCategoryId: (categoryId: string | null) => void;
    setTags: (tags: string[]) => void;
    setSortBy: (sortBy: SortOption) => void;
    setPage: (page: number) => void;
    // Actions
    refetch: () => Promise<void>;
    clearError: () => void;
    clearFilters: () => void;
}

export function usePublicQuizzes(options: UsePublicQuizzesOptions = {}): UsePublicQuizzesReturn {
    const { initialFilters = {}, pageSize = 20 } = options;

    const [quizzes, setQuizzes] = useState<PublicQuizSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter state
    const [search, setSearchState] = useState(initialFilters.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search || "");
    const [categoryId, setCategoryIdState] = useState<string | null>(
        initialFilters.categoryId || null
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

    // Fetch quizzes from API
    const fetchQuizzes = useCallback(
        async (
            page: number,
            size: number,
            filters: PublicQuizFilters
        ) => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await getPublicQuizzes(page, size, filters);
                setQuizzes(response.content);
                setPagination({
                    page: response.pageable.pageNumber,
                    pageSize: response.pageable.pageSize,
                    totalPages: response.totalPages,
                    totalItems: response.totalElements,
                });
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                console.error("Failed to fetch public quizzes:", err);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    // Fetch when filters or pagination changes
    useEffect(() => {
        const filters: PublicQuizFilters = {
            search: debouncedSearch || undefined,
            categoryId: categoryId || undefined,
            tags: tags.length > 0 ? tags : undefined,
            sortBy,
        };
        fetchQuizzes(pagination.page, pagination.pageSize, filters);
    }, [fetchQuizzes, debouncedSearch, categoryId, tags, sortBy, pagination.page, pagination.pageSize]);

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
        const filters: PublicQuizFilters = {
            search: debouncedSearch || undefined,
            categoryId: categoryId || undefined,
            tags: tags.length > 0 ? tags : undefined,
            sortBy,
        };
        await fetchQuizzes(pagination.page, pagination.pageSize, filters);
    }, [fetchQuizzes, pagination.page, pagination.pageSize, debouncedSearch, categoryId, tags, sortBy]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setSearchState("");
        setDebouncedSearch("");
        setCategoryIdState(null);
        setTagsState([]);
        setSortByState("newest");
        setPagination((prev) => ({ ...prev, page: 0 }));
    }, []);

    return {
        quizzes,
        isLoading,
        error,
        pagination,
        search,
        categoryId,
        tags,
        sortBy,
        setSearch,
        setCategoryId,
        setTags,
        setSortBy,
        setPage,
        refetch,
        clearError,
        clearFilters,
    };
}

export default usePublicQuizzes;

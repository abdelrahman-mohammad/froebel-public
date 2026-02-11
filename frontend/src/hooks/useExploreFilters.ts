/**
 * useExploreFilters Hook
 * Manages URL state synchronization for explore page filters
 */

"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import type { Difficulty } from "@/lib/course/types";
import type { SortOption } from "@/lib/quiz/types";

export type ContentType = "all" | "quiz" | "course";

export interface ExploreFilters {
    search: string;
    contentType: ContentType;
    categoryId: string | null;
    tags: string[];
    sortBy: SortOption;
    difficulty: Difficulty | null;
}

export interface UseExploreFiltersReturn {
    filters: ExploreFilters;
    updateFilters: (newFilters: Partial<ExploreFilters>) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

const DEFAULT_FILTERS: ExploreFilters = {
    search: "",
    contentType: "all",
    categoryId: null,
    tags: [],
    sortBy: "newest",
    difficulty: null,
};

export function useExploreFilters(): UseExploreFiltersReturn {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse current state from URL
    const filters = useMemo((): ExploreFilters => {
        return {
            search: searchParams.get("q") || "",
            contentType: (searchParams.get("type") as ContentType) || "all",
            categoryId: searchParams.get("category") || null,
            tags: searchParams.getAll("tag"),
            sortBy: (searchParams.get("sort") as SortOption) || "newest",
            difficulty: (searchParams.get("difficulty") as Difficulty) || null,
        };
    }, [searchParams]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return (
            filters.search !== "" ||
            filters.contentType !== "all" ||
            filters.categoryId !== null ||
            filters.tags.length > 0 ||
            filters.sortBy !== "newest" ||
            filters.difficulty !== null
        );
    }, [filters]);

    // Build URL from filters
    const buildUrl = useCallback((newFilters: ExploreFilters): string => {
        const params = new URLSearchParams();

        if (newFilters.search) {
            params.set("q", newFilters.search);
        }
        if (newFilters.contentType !== "all") {
            params.set("type", newFilters.contentType);
        }
        if (newFilters.categoryId) {
            params.set("category", newFilters.categoryId);
        }
        if (newFilters.tags.length > 0) {
            newFilters.tags.forEach((tag) => params.append("tag", tag));
        }
        if (newFilters.sortBy !== "newest") {
            params.set("sort", newFilters.sortBy);
        }
        if (newFilters.difficulty) {
            params.set("difficulty", newFilters.difficulty);
        }

        const queryString = params.toString();
        return queryString ? `/explore?${queryString}` : "/explore";
    }, []);

    // Update filters (merges with current)
    const updateFilters = useCallback(
        (newFilters: Partial<ExploreFilters>) => {
            const mergedFilters = { ...filters, ...newFilters };
            const url = buildUrl(mergedFilters);
            router.replace(url, { scroll: false });
        },
        [filters, buildUrl, router]
    );

    // Clear all filters
    const clearFilters = useCallback(() => {
        router.replace("/explore", { scroll: false });
    }, [router]);

    return {
        filters,
        updateFilters,
        clearFilters,
        hasActiveFilters,
    };
}

export default useExploreFilters;

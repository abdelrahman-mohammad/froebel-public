/**
 * useCategories Hook
 * Fetches and manages category data for filtering
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { fetchCategories } from "@/lib/quiz/api";
import type { ApiCategory } from "@/lib/quiz/types";

export interface UseCategriesReturn {
    categories: ApiCategory[];
    flatCategories: ApiCategory[];
    isLoading: boolean;
    error: string | null;
    getCategoryById: (id: string) => ApiCategory | undefined;
    getCategoryPath: (id: string) => string;
    refetch: () => Promise<void>;
}

/**
 * Flatten nested categories into a single array
 */
function flattenCategories(categories: ApiCategory[]): ApiCategory[] {
    const result: ApiCategory[] = [];

    function traverse(cats: ApiCategory[]) {
        for (const cat of cats) {
            result.push(cat);
            if (cat.children && cat.children.length > 0) {
                traverse(cat.children);
            }
        }
    }

    traverse(categories);
    return result;
}

export function useCategories(): UseCategriesReturn {
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategoriesData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await fetchCategories();
            setCategories(data);
        } catch (err) {
            setError("Failed to load categories");
            console.error("Failed to fetch categories:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategoriesData();
    }, [fetchCategoriesData]);

    // Flatten categories for easy lookup
    const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

    // Get category by ID
    const getCategoryById = useCallback(
        (id: string): ApiCategory | undefined => {
            return flatCategories.find((cat) => cat.id === id);
        },
        [flatCategories]
    );

    // Get breadcrumb path for a category (e.g., "Programming > Web Development > React")
    const getCategoryPath = useCallback(
        (id: string): string => {
            const path: string[] = [];
            let current = flatCategories.find((cat) => cat.id === id);

            while (current) {
                path.unshift(current.name);
                current = current.parentId
                    ? flatCategories.find((cat) => cat.id === current!.parentId)
                    : undefined;
            }

            return path.join(" > ");
        },
        [flatCategories]
    );

    return {
        categories,
        flatCategories,
        isLoading,
        error,
        getCategoryById,
        getCategoryPath,
        refetch: fetchCategoriesData,
    };
}

export default useCategories;

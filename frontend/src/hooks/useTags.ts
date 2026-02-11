/**
 * useTags Hook
 * Fetches and manages tag data for filtering
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { getTags, type TagDTO } from "@/lib/tags/api";

export interface UseTagsReturn {
    tags: TagDTO[];
    isLoading: boolean;
    error: string | null;
    getTagBySlug: (slug: string) => TagDTO | undefined;
    refetch: () => Promise<void>;
}

export function useTags(): UseTagsReturn {
    const [tags, setTags] = useState<TagDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTagsData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getTags();
            setTags(data);
        } catch (err) {
            setError("Failed to load tags");
            console.error("Failed to fetch tags:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTagsData();
    }, [fetchTagsData]);

    // Get tag by slug
    const getTagBySlug = useCallback(
        (slug: string): TagDTO | undefined => {
            return tags.find((tag) => tag.slug === slug);
        },
        [tags]
    );

    return {
        tags,
        isLoading,
        error,
        getTagBySlug,
        refetch: fetchTagsData,
    };
}

export default useTags;

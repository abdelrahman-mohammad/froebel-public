"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/contexts/AuthContext";

import {
    type SidebarData,
    fetchSidebarData,
    removeFromRecent,
    renameItem,
    toggleStarItem,
} from "@/lib/sidebar";

interface UseSidebarDataResult {
    data: SidebarData | null;
    isLoading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    starItem: (itemId: string, itemType: "quiz" | "course") => Promise<void>;
    unstarItem: (itemId: string, itemType: "quiz" | "course") => Promise<void>;
    removeRecent: (itemId: string, itemType: "quiz" | "course") => Promise<void>;
    rename: (itemId: string, itemType: "quiz" | "course", newName: string) => Promise<void>;
}

export function useSidebarData(): UseSidebarDataResult {
    const { isAuthenticated } = useAuth();
    const [data, setData] = useState<SidebarData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!isAuthenticated) {
            setData(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await fetchSidebarData();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Failed to fetch sidebar data"));
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const starItem = useCallback(
        async (itemId: string, itemType: "quiz" | "course") => {
            await toggleStarItem(itemId, itemType);
            // Optimistically update or refetch
            await fetchData();
        },
        [fetchData]
    );

    const unstarItem = useCallback(async (itemId: string, itemType: "quiz" | "course") => {
        await toggleStarItem(itemId, itemType);
        // Optimistically update: remove from starred list
        setData((prev) =>
            prev
                ? {
                      ...prev,
                      starred: prev.starred.filter((item) => item.id !== itemId),
                  }
                : null
        );
    }, []);

    const removeRecentItem = useCallback(async (itemId: string, itemType: "quiz" | "course") => {
        await removeFromRecent(itemId, itemType);
        // Optimistically update: remove from recent list
        setData((prev) =>
            prev
                ? {
                      ...prev,
                      recent: prev.recent.filter((item) => item.id !== itemId),
                  }
                : null
        );
    }, []);

    const renameItemFn = useCallback(async (itemId: string, itemType: "quiz" | "course", newName: string) => {
        await renameItem(itemId, itemType, newName);
        // Optimistically update: update name in all lists
        setData((prev) => {
            if (!prev) return null;
            return {
                starred: prev.starred.map((item) => (item.id === itemId ? { ...item, name: newName } : item)),
                recent: prev.recent.map((item) => (item.id === itemId ? { ...item, name: newName } : item)),
                courses: prev.courses.map((item) => (item.id === itemId ? { ...item, name: newName } : item)),
            };
        });
    }, []);

    return {
        data,
        isLoading,
        error,
        refetch: fetchData,
        starItem,
        unstarItem,
        removeRecent: removeRecentItem,
        rename: renameItemFn,
    };
}

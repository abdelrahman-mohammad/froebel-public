/**
 * useCourseProgress Hook
 * Manages progress tracking for an enrolled course
 */

"use client";

import { useCallback, useState } from "react";

import {
    getCourseErrorMessage,
    getCourseProgress as getCourseProgressApi,
    markMaterialComplete as markCompleteApi,
    unmarkMaterialComplete as unmarkCompleteApi,
} from "@/lib/course/api";
import type { ProgressDTO } from "@/lib/course/types";

export interface UseCourseProgressReturn {
    progress: ProgressDTO | null;
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
    // Operations
    loadProgress: (courseId: string) => Promise<ProgressDTO>;
    markComplete: (courseId: string, materialId: string) => Promise<ProgressDTO>;
    unmarkComplete: (courseId: string, materialId: string) => Promise<ProgressDTO>;
    toggleComplete: (courseId: string, materialId: string) => Promise<ProgressDTO>;
    // Utilities
    isMaterialComplete: (materialId: string) => boolean;
    refetch: (courseId: string) => Promise<void>;
    reset: () => void;
    clearError: () => void;
}

export function useCourseProgress(): UseCourseProgressReturn {
    const [progress, setProgress] = useState<ProgressDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load progress for a course
    const loadProgress = useCallback(async (courseId: string): Promise<ProgressDTO> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getCourseProgressApi(courseId);
            setProgress(response);
            return response;
        } catch (err) {
            const message = getCourseErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Mark a material as complete
    const markComplete = useCallback(
        async (courseId: string, materialId: string): Promise<ProgressDTO> => {
            setIsUpdating(true);
            setError(null);

            try {
                const response = await markCompleteApi(courseId, materialId);
                setProgress(response);
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        },
        []
    );

    // Unmark a material as complete
    const unmarkComplete = useCallback(
        async (courseId: string, materialId: string): Promise<ProgressDTO> => {
            setIsUpdating(true);
            setError(null);

            try {
                const response = await unmarkCompleteApi(courseId, materialId);
                setProgress(response);
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsUpdating(false);
            }
        },
        []
    );

    // Toggle material completion status
    const toggleComplete = useCallback(
        async (courseId: string, materialId: string): Promise<ProgressDTO> => {
            if (!progress) {
                throw new Error("No progress loaded");
            }

            const materialProgress = progress.materials.find((m) => m.materialId === materialId);

            if (materialProgress?.completed) {
                return unmarkComplete(courseId, materialId);
            } else {
                return markComplete(courseId, materialId);
            }
        },
        [progress, markComplete, unmarkComplete]
    );

    // Check if a material is complete
    const isMaterialComplete = useCallback(
        (materialId: string): boolean => {
            if (!progress) return false;
            const material = progress.materials.find((m) => m.materialId === materialId);
            return material?.completed ?? false;
        },
        [progress]
    );

    // Refetch progress for a course
    const refetch = useCallback(
        async (courseId: string) => {
            await loadProgress(courseId);
        },
        [loadProgress]
    );

    // Reset all state
    const reset = useCallback(() => {
        setProgress(null);
        setError(null);
        setIsLoading(false);
        setIsUpdating(false);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        progress,
        isLoading,
        isUpdating,
        error,
        loadProgress,
        markComplete,
        unmarkComplete,
        toggleComplete,
        isMaterialComplete,
        refetch,
        reset,
        clearError,
    };
}

export default useCourseProgress;

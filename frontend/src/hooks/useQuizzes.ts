/**
 * useQuizzes Hook
 * Manages user's quiz list with API integration and pagination
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import {
    createQuiz as createQuizApi,
    deleteQuiz as deleteQuizApi,
    exportQuiz as exportQuizApi,
    getMyQuizzes,
    getQuizById,
    getQuizErrorMessage,
    importQuiz as importQuizApi,
    updateQuiz as updateQuizApi,
} from "@/lib/quiz/api";
import { apiQuizToLocal } from "@/lib/quiz/converters";
import type { CreateQuizRequest, ImportQuizRequest, QuizSummaryDTO } from "@/lib/quiz/types";

import type { Quiz } from "@/types/quiz";

export interface Pagination {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export interface UseQuizzesReturn {
    quizzes: QuizSummaryDTO[];
    isLoading: boolean;
    error: string | null;
    pagination: Pagination;
    // CRUD operations
    createQuiz: (data: CreateQuizRequest) => Promise<Quiz>;
    updateQuiz: (quizId: string, data: CreateQuizRequest) => Promise<Quiz>;
    deleteQuiz: (quizId: string) => Promise<void>;
    getQuiz: (quizId: string) => Promise<Quiz>;
    // Import/Export
    importQuizFromFile: (file: File) => Promise<Quiz>;
    exportQuiz: (quizId: string) => Promise<void>;
    // Pagination
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    // Utilities
    refetch: () => Promise<void>;
    clearError: () => void;
}

export function useQuizzes(): UseQuizzesReturn {
    const [quizzes, setQuizzes] = useState<QuizSummaryDTO[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<Pagination>({
        page: 0,
        pageSize: 20,
        totalPages: 0,
        totalItems: 0,
    });

    // Fetch quizzes from API
    const fetchQuizzes = useCallback(async (page: number, size: number) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getMyQuizzes(page, size);
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
            console.error("Failed to fetch quizzes:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchQuizzes(pagination.page, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Refetch current page
    const refetch = useCallback(async () => {
        await fetchQuizzes(pagination.page, pagination.pageSize);
    }, [fetchQuizzes, pagination.page, pagination.pageSize]);

    // Change page
    const setPage = useCallback(
        (page: number) => {
            fetchQuizzes(page, pagination.pageSize);
        },
        [fetchQuizzes, pagination.pageSize]
    );

    // Change page size
    const setPageSize = useCallback(
        (size: number) => {
            fetchQuizzes(0, size); // Reset to first page
        },
        [fetchQuizzes]
    );

    // Create a new quiz
    const createQuiz = useCallback(
        async (data: CreateQuizRequest): Promise<Quiz> => {
            try {
                const response = await createQuizApi(data);
                await refetch(); // Refresh list
                return apiQuizToLocal(response);
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        [refetch]
    );

    // Update an existing quiz
    const updateQuiz = useCallback(
        async (quizId: string, data: CreateQuizRequest): Promise<Quiz> => {
            try {
                const response = await updateQuizApi(quizId, data);
                await refetch(); // Refresh list
                return apiQuizToLocal(response);
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        [refetch]
    );

    // Delete a quiz
    const deleteQuiz = useCallback(
        async (quizId: string): Promise<void> => {
            try {
                await deleteQuizApi(quizId);
                // Optimistic update - remove from list immediately
                setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
                setPagination((prev) => ({
                    ...prev,
                    totalItems: prev.totalItems - 1,
                }));
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                await refetch(); // Revert optimistic update on error
                throw err;
            }
        },
        [refetch]
    );

    // Get a single quiz by ID
    const getQuiz = useCallback(async (quizId: string): Promise<Quiz> => {
        try {
            const response = await getQuizById(quizId);
            return apiQuizToLocal(response);
        } catch (err) {
            const message = getQuizErrorMessage(err);
            setError(message);
            throw err;
        }
    }, []);

    // Import quiz from file
    const importQuizFromFile = useCallback(
        async (file: File): Promise<Quiz> => {
            try {
                const content = await file.text();
                const data: ImportQuizRequest = JSON.parse(content);

                // Validate basic structure
                if (!data.quiz?.title) {
                    throw new Error("Invalid quiz file: missing title");
                }

                const response = await importQuizApi(data);
                await refetch(); // Refresh list
                return apiQuizToLocal(response);
            } catch (err) {
                let message: string;
                if (err instanceof SyntaxError) {
                    message = "Invalid JSON file format";
                } else {
                    message = getQuizErrorMessage(err);
                }
                setError(message);
                throw err;
            }
        },
        [refetch]
    );

    // Export quiz to file
    const exportQuiz = useCallback(
        async (quizId: string): Promise<void> => {
            try {
                const exportData = await exportQuizApi(quizId);

                // Get quiz title for filename
                const quiz = quizzes.find((q) => q.id === quizId);
                const filename = quiz
                    ? `${quiz.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.json`
                    : `quiz_${quizId}.json`;

                // Create download
                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                throw err;
            }
        },
        [quizzes]
    );

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        quizzes,
        isLoading,
        error,
        pagination,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        getQuiz,
        importQuizFromFile,
        exportQuiz,
        setPage,
        setPageSize,
        refetch,
        clearError,
    };
}

export default useQuizzes;

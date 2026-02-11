/**
 * useQuizEditor Hook
 * Manages quiz editing with API sync
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
    addQuestion as addQuestionApi,
    createQuiz as createQuizApi,
    deleteQuestion as deleteQuestionApi,
    getQuizById,
    getQuizErrorMessage,
    reorderQuestions as reorderQuestionsApi,
    setQuizPublished,
    updatePublishedVersion as updatePublishedVersionApi,
    updateQuestion as updateQuestionApi,
    updateQuiz as updateQuizApi,
} from "@/lib/quiz/api";
import { apiQuestionToLocal, apiQuizToLocal, localQuestionToApi } from "@/lib/quiz/converters";
import type { CreateQuizRequest, QuizDetailDTO, UpdateQuizRequest } from "@/lib/quiz/types";

import type { Question, Quiz } from "@/types/quiz";

export interface UseQuizEditorReturn {
    // Quiz state
    quiz: Quiz | null;
    quizMeta: QuizDetailDTO | null;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    isDirty: boolean;

    // Quiz operations
    loadQuiz: (quizId: string) => Promise<Quiz>;
    createQuiz: (data: CreateQuizRequest) => Promise<Quiz>;
    updateQuizMeta: (data: UpdateQuizRequest, quizId?: string) => Promise<Quiz>;
    publishQuiz: (published: boolean, quizId?: string) => Promise<Quiz>;
    updatePublished: (quizId?: string) => Promise<Quiz>;

    // Question operations
    addQuestion: (question: Question, quizId?: string) => Promise<Question>;
    addQuestionToQuiz: (quizId: string, question: Question) => Promise<void>;
    updateQuestion: (questionId: string, question: Question, quizId?: string) => Promise<Question>;
    deleteQuestion: (questionId: string, quizId?: string) => Promise<void>;
    reorderQuestions: (questionIds: string[], quizId?: string) => Promise<void>;

    // Utilities
    setDirty: (dirty: boolean) => void;
    reset: () => void;
    clearError: () => void;
}

export function useQuizEditor(): UseQuizEditorReturn {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizMeta, setQuizMeta] = useState<QuizDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Track component mount state to prevent state updates after unmount
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Helper to safely update state only if mounted
    const safeSetState = useCallback(
        <T>(setter: React.Dispatch<React.SetStateAction<T>>, value: React.SetStateAction<T>) => {
            if (isMountedRef.current) {
                setter(value);
            }
        },
        []
    );

    // Load an existing quiz for editing
    const loadQuiz = useCallback(async (quizId: string): Promise<Quiz> => {
        safeSetState(setIsLoading, true);
        safeSetState(setError, null);

        try {
            const response = await getQuizById(quizId);
            if (!isMountedRef.current) throw new Error("Component unmounted");
            safeSetState(setQuizMeta, response);
            const localQuiz = apiQuizToLocal(response);
            safeSetState(setQuiz, localQuiz);
            safeSetState(setIsDirty, false);
            return localQuiz;
        } catch (err) {
            if (isMountedRef.current) {
                const message = getQuizErrorMessage(err);
                safeSetState(setError, message);
            }
            throw err;
        } finally {
            safeSetState(setIsLoading, false);
        }
    }, [safeSetState]);

    // Create a new quiz
    const createQuiz = useCallback(async (data: CreateQuizRequest): Promise<Quiz> => {
        safeSetState(setIsSaving, true);
        safeSetState(setError, null);

        try {
            const response = await createQuizApi(data);
            if (!isMountedRef.current) throw new Error("Component unmounted");
            safeSetState(setQuizMeta, response);
            const localQuiz = apiQuizToLocal(response);
            safeSetState(setQuiz, localQuiz);
            safeSetState(setIsDirty, false);
            return localQuiz;
        } catch (err) {
            if (isMountedRef.current) {
                const message = getQuizErrorMessage(err);
                safeSetState(setError, message);
            }
            throw err;
        } finally {
            safeSetState(setIsSaving, false);
        }
    }, [safeSetState]);

    // Update quiz metadata
    const updateQuizMeta = useCallback(
        async (data: UpdateQuizRequest, quizId?: string): Promise<Quiz> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const response = await updateQuizApi(id, data);
                if (!isMountedRef.current) throw new Error("Component unmounted");
                safeSetState(setQuizMeta, response);
                const localQuiz = apiQuizToLocal(response);
                safeSetState(setQuiz, localQuiz);
                safeSetState(setIsDirty, false);
                return localQuiz;
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Publish or unpublish the quiz
    const publishQuiz = useCallback(
        async (published: boolean, quizId?: string): Promise<Quiz> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const response = await setQuizPublished(id, published);
                if (!isMountedRef.current) throw new Error("Component unmounted");
                safeSetState(setQuizMeta, response);
                const localQuiz = apiQuizToLocal(response);
                safeSetState(setQuiz, localQuiz);
                return localQuiz;
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Update the published version with current draft content
    const updatePublished = useCallback(
        async (quizId?: string): Promise<Quiz> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const response = await updatePublishedVersionApi(id);
                if (!isMountedRef.current) throw new Error("Component unmounted");
                safeSetState(setQuizMeta, response);
                const localQuiz = apiQuizToLocal(response);
                safeSetState(setQuiz, localQuiz);
                return localQuiz;
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Add a new question
    const addQuestion = useCallback(
        async (question: Question, quizId?: string): Promise<Question> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const apiQuestion = localQuestionToApi(question);
                const response = await addQuestionApi(id, apiQuestion);
                if (!isMountedRef.current) throw new Error("Component unmounted");

                // Convert the returned question and update local state
                const addedQuestion = apiQuestionToLocal(response);

                safeSetState(setQuiz, (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        questions: [...prev.questions, addedQuestion],
                    };
                });

                // Update meta counts
                safeSetState(setQuizMeta, (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        questionCount: (prev.questionCount ?? 0) + 1,
                    };
                });

                return addedQuestion;
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Add a question to a specific quiz by ID (for new quiz creation flow)
    const addQuestionToQuiz = useCallback(
        async (quizId: string, question: Question): Promise<void> => {
            safeSetState(setError, null);

            try {
                const apiQuestion = localQuestionToApi(question);
                await addQuestionApi(quizId, apiQuestion);
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            }
        },
        [safeSetState]
    );

    // Update an existing question
    const updateQuestion = useCallback(
        async (questionId: string, question: Question, quizId?: string): Promise<Question> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const apiQuestion = localQuestionToApi(question);
                const response = await updateQuestionApi(id, questionId, apiQuestion);
                if (!isMountedRef.current) throw new Error("Component unmounted");

                // Convert the returned question and update local state
                const updatedQuestion = apiQuestionToLocal(response);

                safeSetState(setQuiz, (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        questions: prev.questions.map((q) => (q.id === questionId ? updatedQuestion : q)),
                    };
                });

                return updatedQuestion;
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Delete a question
    const deleteQuestion = useCallback(
        async (questionId: string, quizId?: string): Promise<void> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                await deleteQuestionApi(id, questionId);
                if (!isMountedRef.current) return;

                // Update local state after successful delete
                safeSetState(setQuiz, (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        questions: prev.questions.filter((q) => q.id !== questionId),
                    };
                });

                // Update meta counts
                safeSetState(setQuizMeta, (prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        questionCount: prev.questionCount - 1,
                    };
                });
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                    // Reload on error to revert optimistic update
                    try {
                        const reloaded = await getQuizById(id);
                        if (isMountedRef.current) {
                            safeSetState(setQuizMeta, reloaded);
                            safeSetState(setQuiz, apiQuizToLocal(reloaded));
                        }
                    } catch {
                        // Ignore reload errors
                    }
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Reorder questions
    const reorderQuestions = useCallback(
        async (questionIds: string[], quizId?: string): Promise<void> => {
            const id = quizId || quizMeta?.id;
            if (!id) {
                throw new Error("No quiz loaded");
            }

            safeSetState(setIsSaving, true);
            safeSetState(setError, null);

            try {
                const response = await reorderQuestionsApi(id, questionIds);
                if (!isMountedRef.current) return;
                safeSetState(setQuizMeta, response);
                const localQuiz = apiQuizToLocal(response);
                safeSetState(setQuiz, localQuiz);
            } catch (err) {
                if (isMountedRef.current) {
                    const message = getQuizErrorMessage(err);
                    safeSetState(setError, message);
                }
                throw err;
            } finally {
                safeSetState(setIsSaving, false);
            }
        },
        [quizMeta, safeSetState]
    );

    // Set dirty flag manually
    const setDirty = useCallback((dirty: boolean) => {
        setIsDirty(dirty);
    }, []);

    // Reset all state
    const reset = useCallback(() => {
        setQuiz(null);
        setQuizMeta(null);
        setError(null);
        setIsDirty(false);
        setIsLoading(false);
        setIsSaving(false);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        quiz,
        quizMeta,
        isLoading,
        isSaving,
        error,
        isDirty,
        loadQuiz,
        createQuiz,
        updateQuizMeta,
        publishQuiz,
        updatePublished,
        addQuestion,
        addQuestionToQuiz,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        setDirty,
        reset,
        clearError,
    };
}

export default useQuizEditor;

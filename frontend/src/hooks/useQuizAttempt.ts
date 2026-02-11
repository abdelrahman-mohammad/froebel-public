/**
 * useQuizAttempt Hook
 * Manages quiz taking flow with attempt tracking
 */

"use client";

import { useCallback, useRef, useState } from "react";

import {
    QuizApiError,
    getAttemptResult,
    getPublicQuiz,
    getQuizErrorMessage,
    startAttempt as startAttemptApi,
    submitAttempt as submitAttemptApi,
} from "@/lib/quiz/api";
import { apiQuizToLocal, userAnswersToApi } from "@/lib/quiz/converters";
import type { AttemptResultDTO, PublicQuizDetailDTO, QuizAttemptDTO } from "@/lib/quiz/types";

import type { Question, Quiz, UserAnswers } from "@/types/quiz";

export interface UseQuizAttemptReturn {
    // Quiz data
    quiz: Quiz | null;
    isLoadingQuiz: boolean;

    // Attempt state
    attempt: QuizAttemptDTO | null;
    isStarting: boolean;
    isSubmitting: boolean;

    // Results
    result: AttemptResultDTO | null;

    // Error handling
    error: string | null;
    isRateLimited: boolean;

    // Actions
    loadQuiz: (quizId: string) => Promise<Quiz>;
    startAttempt: (quizId: string, email?: string) => Promise<QuizAttemptDTO>;
    submitAttempt: (answers: UserAnswers) => Promise<AttemptResultDTO>;
    reset: () => void;
    clearError: () => void;
}

export function useQuizAttempt(): UseQuizAttemptReturn {
    // Quiz state
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [quizShareableId, setQuizShareableId] = useState<string | null>(null);
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);

    // Attempt state
    const [attempt, setAttempt] = useState<QuizAttemptDTO | null>(null);
    const [isStarting, setIsStarting] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Results
    const [result, setResult] = useState<AttemptResultDTO | null>(null);

    // Error state
    const [error, setError] = useState<string | null>(null);
    const [isRateLimited, setIsRateLimited] = useState(false);

    // Load quiz details (without correct answers)
    const loadQuiz = useCallback(async (quizId: string): Promise<Quiz> => {
        setIsLoadingQuiz(true);
        setError(null);

        try {
            const response = await getPublicQuiz(quizId);
            const localQuiz = apiQuizToLocal(response);
            setQuiz(localQuiz);
            // Store the shareableId for use in API calls (backend expects shareableId, not UUID)
            setQuizShareableId(response.shareableId);
            return localQuiz;
        } catch (err) {
            const message = getQuizErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setIsLoadingQuiz(false);
        }
    }, []);

    // Start a new attempt
    const startAttempt = useCallback(
        async (quizId: string, email?: string): Promise<QuizAttemptDTO> => {
            setIsStarting(true);
            setError(null);
            setIsRateLimited(false);

            try {
                const attemptData = await startAttemptApi(quizId, email ? { anonymousEmail: email } : undefined);
                setAttempt(attemptData);
                return attemptData;
            } catch (err) {
                if (err instanceof QuizApiError && err.status === 429) {
                    setIsRateLimited(true);
                    setError(
                        "Maximum attempt limit reached for this quiz. Please try again later."
                    );
                } else {
                    const message = getQuizErrorMessage(err);
                    setError(message);
                }
                throw err;
            } finally {
                setIsStarting(false);
            }
        },
        []
    );

    // Ref guard to prevent double-submit (synchronous check)
    const isSubmittingRef = useRef(false);

    // Submit attempt with answers
    const submitAttempt = useCallback(
        async (answers: UserAnswers): Promise<AttemptResultDTO> => {
            if (!attempt || !quiz || !quizShareableId) {
                throw new Error("No active attempt or quiz loaded");
            }

            // Prevent double-submission with synchronous ref check
            if (isSubmittingRef.current) {
                throw new Error("Submission already in progress");
            }
            isSubmittingRef.current = true;

            setIsSubmitting(true);
            setError(null);

            try {
                // Convert local answers to API format
                const apiAnswers = userAnswersToApi(answers, quiz.questions);

                // Use shareableId (not UUID) as backend expects shareableId in URL
                const resultData = await submitAttemptApi(quizShareableId, attempt.id, {
                    answers: apiAnswers,
                });

                setResult(resultData);
                return resultData;
            } catch (err) {
                const message = getQuizErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSubmitting(false);
                isSubmittingRef.current = false;
            }
        },
        [attempt, quiz, quizShareableId]
    );

    // Reset all state
    const reset = useCallback(() => {
        setQuiz(null);
        setQuizShareableId(null);
        setAttempt(null);
        setResult(null);
        setError(null);
        setIsRateLimited(false);
        setIsLoadingQuiz(false);
        setIsStarting(false);
        setIsSubmitting(false);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
        setIsRateLimited(false);
    }, []);

    return {
        quiz,
        isLoadingQuiz,
        attempt,
        isStarting,
        isSubmitting,
        result,
        error,
        isRateLimited,
        loadQuiz,
        startAttempt,
        submitAttempt,
        reset,
        clearError,
    };
}

export default useQuizAttempt;

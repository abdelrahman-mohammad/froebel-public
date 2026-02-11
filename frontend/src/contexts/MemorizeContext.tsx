"use client";

import React, {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
} from "react";

import { calculateBatchResults, createBatches, prepareQuizForMemorize } from "@/lib/memorize-utils";

import type {
    CumulativeResults,
    MemorizeAction,
    MemorizeOptions,
    MemorizeState,
    ViewMode,
} from "@/types/memorize";
import { initialMemorizeState } from "@/types/memorize";
import type { Question, Quiz, UserAnswer } from "@/types/quiz";

// ============================================================================
// Context Value Type
// ============================================================================

export interface MemorizeContextValue {
    state: MemorizeState;

    // Phase transitions
    initMemorize: (quiz: Quiz, options: MemorizeOptions) => void;
    startMemorizing: () => void;
    startAssessment: () => void;

    // View controls
    setViewMode: (mode: ViewMode) => void;
    navigateSingleCard: (direction: "prev" | "next") => void;

    // Assessment
    selectAnswer: (questionId: string, answer: UserAnswer) => void;
    submitAssessment: () => void;

    // Batch navigation
    retryBatch: () => void;
    continueToNextBatch: () => void;
    finishMemorization: () => void;
    reset: () => void;

    // Computed values
    currentBatch: Question[];
    currentBatchChapterName: string | undefined;
    isLastBatch: boolean;
    totalBatches: number;
    completedBatches: number;
    totalQuestions: number;
    completedQuestions: number;
}

// ============================================================================
// Reducer
// ============================================================================

function memorizeReducer(state: MemorizeState, action: MemorizeAction): MemorizeState {
    switch (action.type) {
        case "INIT": {
            const { quiz, options } = action.payload;
            const preparedQuiz = prepareQuizForMemorize(quiz, options);
            const batchInfos = createBatches(preparedQuiz.questions, options.batchSize, quiz);

            return {
                ...initialMemorizeState,
                phase: "memorizing",
                originalQuiz: quiz,
                preparedQuiz,
                batches: batchInfos.map((b) => b.questions),
                batchChapterNames: batchInfos.map((b) => b.chapterName),
                options,
            };
        }

        case "SET_PHASE": {
            return {
                ...state,
                phase: action.payload,
                // Reset single card index when entering memorizing phase
                singleCardIndex: action.payload === "memorizing" ? 0 : state.singleCardIndex,
                // Reset assessment answers when starting assessment
                assessmentAnswers: action.payload === "assessing" ? {} : state.assessmentAnswers,
            };
        }

        case "SET_VIEW_MODE": {
            return {
                ...state,
                viewMode: action.payload,
                singleCardIndex: 0,
            };
        }

        case "SET_SINGLE_CARD_INDEX": {
            return {
                ...state,
                singleCardIndex: action.payload,
            };
        }

        case "NAVIGATE_SINGLE_CARD": {
            const currentBatch = state.batches[state.currentBatchIndex] || [];
            const maxIndex = currentBatch.length - 1;
            let newIndex = state.singleCardIndex;

            if (action.payload === "prev") {
                newIndex = Math.max(0, state.singleCardIndex - 1);
            } else {
                newIndex = Math.min(maxIndex, state.singleCardIndex + 1);
            }

            return {
                ...state,
                singleCardIndex: newIndex,
            };
        }

        case "SELECT_ANSWER": {
            const { questionId, answer } = action.payload;
            return {
                ...state,
                assessmentAnswers: {
                    ...state.assessmentAnswers,
                    [questionId]: answer,
                },
            };
        }

        case "COMPLETE_ASSESSMENT": {
            const batchResult = action.payload;

            // Update cumulative results
            const newCumulativeResults: CumulativeResults = {
                correctCount: state.cumulativeResults.correctCount + batchResult.correctCount,
                totalQuestions: state.cumulativeResults.totalQuestions + batchResult.totalQuestions,
                earnedPoints: state.cumulativeResults.earnedPoints + batchResult.earnedPoints,
                totalPoints: state.cumulativeResults.totalPoints + batchResult.totalPoints,
            };

            return {
                ...state,
                phase: "batch-results",
                batchResults: [...state.batchResults, batchResult],
                cumulativeResults: newCumulativeResults,
            };
        }

        case "RETRY_BATCH": {
            // Remove the last batch result if retrying
            const newBatchResults = state.batchResults.slice(0, -1);
            const lastResult = state.batchResults[state.batchResults.length - 1];

            // Subtract from cumulative results
            const newCumulativeResults: CumulativeResults = lastResult
                ? {
                      correctCount: state.cumulativeResults.correctCount - lastResult.correctCount,
                      totalQuestions:
                          state.cumulativeResults.totalQuestions - lastResult.totalQuestions,
                      earnedPoints: state.cumulativeResults.earnedPoints - lastResult.earnedPoints,
                      totalPoints: state.cumulativeResults.totalPoints - lastResult.totalPoints,
                  }
                : state.cumulativeResults;

            return {
                ...state,
                phase: "memorizing",
                batchResults: newBatchResults,
                cumulativeResults: newCumulativeResults,
                singleCardIndex: 0,
                assessmentAnswers: {},
            };
        }

        case "CONTINUE_TO_NEXT_BATCH": {
            return {
                ...state,
                phase: "memorizing",
                currentBatchIndex: state.currentBatchIndex + 1,
                singleCardIndex: 0,
                assessmentAnswers: {},
            };
        }

        case "FINISH": {
            return {
                ...state,
                phase: "summary",
            };
        }

        case "RESET": {
            return initialMemorizeState;
        }

        default:
            return state;
    }
}

// ============================================================================
// Context
// ============================================================================

const MemorizeContext = createContext<MemorizeContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface MemorizeProviderProps {
    children: ReactNode;
}

export function MemorizeProvider({ children }: MemorizeProviderProps) {
    const [state, dispatch] = useReducer(memorizeReducer, initialMemorizeState);

    // Before unload warning - prevent accidental navigation during memorization
    useEffect(() => {
        const isActive = state.originalQuiz && state.phase !== "summary";
        if (isActive) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = "";
                return "";
            };
            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [state.originalQuiz, state.phase]);

    // Computed values
    const currentBatch = useMemo(() => {
        return state.batches[state.currentBatchIndex] || [];
    }, [state.batches, state.currentBatchIndex]);

    const currentBatchChapterName = useMemo(() => {
        return state.batchChapterNames[state.currentBatchIndex];
    }, [state.batchChapterNames, state.currentBatchIndex]);

    const totalBatches = state.batches.length;
    const isLastBatch = state.currentBatchIndex >= totalBatches - 1;
    const completedBatches = state.batchResults.length;

    const totalQuestions = useMemo(() => {
        return state.batches.reduce((sum, batch) => sum + batch.length, 0);
    }, [state.batches]);

    const completedQuestions = useMemo(() => {
        return state.batchResults.reduce((sum, result) => sum + result.totalQuestions, 0);
    }, [state.batchResults]);

    // Phase transitions
    const initMemorize = useCallback((quiz: Quiz, options: MemorizeOptions) => {
        dispatch({ type: "INIT", payload: { quiz, options } });
    }, []);

    const startMemorizing = useCallback(() => {
        dispatch({ type: "SET_PHASE", payload: "memorizing" });
    }, []);

    const startAssessment = useCallback(() => {
        dispatch({ type: "SET_PHASE", payload: "assessing" });
    }, []);

    // View controls
    const setViewMode = useCallback((mode: ViewMode) => {
        dispatch({ type: "SET_VIEW_MODE", payload: mode });
    }, []);

    const navigateSingleCard = useCallback((direction: "prev" | "next") => {
        dispatch({ type: "NAVIGATE_SINGLE_CARD", payload: direction });
    }, []);

    // Assessment
    const selectAnswer = useCallback((questionId: string, answer: UserAnswer) => {
        dispatch({
            type: "SELECT_ANSWER",
            payload: { questionId, answer },
        });
    }, []);

    const submitAssessment = useCallback(() => {
        // Calculate results for current batch
        const batchResult = calculateBatchResults(
            currentBatch,
            state.assessmentAnswers,
            state.currentBatchIndex
        );
        // Add chapter name if available
        if (currentBatchChapterName) {
            batchResult.chapterName = currentBatchChapterName;
        }
        dispatch({ type: "COMPLETE_ASSESSMENT", payload: batchResult });
    }, [currentBatch, state.assessmentAnswers, state.currentBatchIndex, currentBatchChapterName]);

    // Batch navigation
    const retryBatch = useCallback(() => {
        dispatch({ type: "RETRY_BATCH" });
    }, []);

    const continueToNextBatch = useCallback(() => {
        dispatch({ type: "CONTINUE_TO_NEXT_BATCH" });
    }, []);

    const finishMemorization = useCallback(() => {
        dispatch({ type: "FINISH" });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    const value = useMemo<MemorizeContextValue>(
        () => ({
            state,
            initMemorize,
            startMemorizing,
            startAssessment,
            setViewMode,
            navigateSingleCard,
            selectAnswer,
            submitAssessment,
            retryBatch,
            continueToNextBatch,
            finishMemorization,
            reset,
            currentBatch,
            currentBatchChapterName,
            isLastBatch,
            totalBatches,
            completedBatches,
            totalQuestions,
            completedQuestions,
        }),
        [
            state,
            initMemorize,
            startMemorizing,
            startAssessment,
            setViewMode,
            navigateSingleCard,
            selectAnswer,
            submitAssessment,
            retryBatch,
            continueToNextBatch,
            finishMemorization,
            reset,
            currentBatch,
            currentBatchChapterName,
            isLastBatch,
            totalBatches,
            completedBatches,
            totalQuestions,
            completedQuestions,
        ]
    );

    return <MemorizeContext.Provider value={value}>{children}</MemorizeContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useMemorize(): MemorizeContextValue {
    const context = useContext(MemorizeContext);
    if (!context) {
        throw new Error("useMemorize must be used within a MemorizeProvider");
    }
    return context;
}

// Optional hook that returns null instead of throwing
export function useMemorizeSafe(): MemorizeContextValue | null {
    return useContext(MemorizeContext);
}

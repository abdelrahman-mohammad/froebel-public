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

import type { Question, Quiz, UserAnswer, UserAnswers } from "@/types/quiz";

// ============================================================================
// Types
// ============================================================================

export interface QuizOptions {
    timerEnabled: boolean;
    timerDuration: number; // in seconds
    checkAnswerEnabled: boolean;
    randomizeQuestions: boolean;
    randomizeChoices: boolean;
    isMemorizeMode: boolean;
}

export interface QuizState {
    // Quiz data
    quiz: Quiz | null;
    currentQuestionIndex: number;
    userAnswers: UserAnswers;
    flaggedQuestions: Set<string>;

    // Options
    options: QuizOptions;

    // Timer state (managed externally by useTimer, but tracked here for reference)
    timeRemaining: number;

    // Check answer feature
    checkedQuestions: Set<string>;

    // Status
    isSubmitted: boolean;
    isLoading: boolean;
}

export type QuizAction =
    | { type: "SET_QUIZ"; payload: { quiz: Quiz; options: QuizOptions } }
    | {
          type: "SELECT_ANSWER";
          payload: { questionId: string; answer: UserAnswer };
      }
    | { type: "TOGGLE_FLAG"; payload: { questionId: string } }
    | { type: "GO_TO_QUESTION"; payload: { index: number } }
    | { type: "NEXT_QUESTION" }
    | { type: "PREVIOUS_QUESTION" }
    | { type: "UPDATE_TIME"; payload: { timeRemaining: number } }
    | { type: "CHECK_ANSWER"; payload: { questionId: string } }
    | { type: "SUBMIT_QUIZ" }
    | { type: "RESET_QUIZ" };

export interface QuizContextValue {
    state: QuizState;
    dispatch: React.Dispatch<QuizAction>;
    // Computed values
    currentQuestion: Question | null;
    totalQuestions: number;
    answeredCount: number;
    isCurrentAnswered: boolean;
    isCurrentFlagged: boolean;
    isCurrentChecked: boolean;
    // Convenience actions
    selectAnswer: (questionId: string, answer: UserAnswer) => void;
    toggleFlag: (questionId: string) => void;
    goToQuestion: (index: number) => void;
    nextQuestion: () => void;
    previousQuestion: () => void;
    checkAnswer: (questionId: string) => void;
    checkCurrentAnswer: (questionId: string) => void; // Alias for checkAnswer
    submitQuiz: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const defaultOptions: QuizOptions = {
    timerEnabled: false,
    timerDuration: 0,
    checkAnswerEnabled: false,
    randomizeQuestions: false,
    randomizeChoices: false,
    isMemorizeMode: false,
};

const initialState: QuizState = {
    quiz: null,
    currentQuestionIndex: 0,
    userAnswers: {},
    flaggedQuestions: new Set(),
    options: defaultOptions,
    timeRemaining: 0,
    checkedQuestions: new Set(),
    isSubmitted: false,
    isLoading: false,
};

// ============================================================================
// Reducer
// ============================================================================

function quizReducer(state: QuizState, action: QuizAction): QuizState {
    switch (action.type) {
        case "SET_QUIZ": {
            const { quiz, options } = action.payload;
            return {
                ...initialState,
                quiz,
                options,
                timeRemaining: options.timerDuration,
            };
        }

        case "SELECT_ANSWER": {
            const { questionId, answer } = action.payload;
            // If question was previously checked, clear the check state to allow re-answering
            const newCheckedQuestions = state.checkedQuestions.has(questionId)
                ? new Set([...state.checkedQuestions].filter((id) => id !== questionId))
                : state.checkedQuestions;
            return {
                ...state,
                userAnswers: {
                    ...state.userAnswers,
                    [questionId]: answer,
                },
                checkedQuestions: newCheckedQuestions,
            };
        }

        case "TOGGLE_FLAG": {
            // Don't allow flag changes after quiz is submitted
            if (state.isSubmitted) {
                return state;
            }
            const { questionId } = action.payload;
            const newFlagged = new Set(state.flaggedQuestions);
            if (newFlagged.has(questionId)) {
                newFlagged.delete(questionId);
            } else {
                newFlagged.add(questionId);
            }
            return {
                ...state,
                flaggedQuestions: newFlagged,
            };
        }

        case "GO_TO_QUESTION": {
            const { index } = action.payload;
            const maxIndex = (state.quiz?.questions.length ?? 1) - 1;
            const newIndex = Math.max(0, Math.min(index, maxIndex));
            return {
                ...state,
                currentQuestionIndex: newIndex,
            };
        }

        case "NEXT_QUESTION": {
            const maxIndex = (state.quiz?.questions.length ?? 1) - 1;
            if (state.currentQuestionIndex >= maxIndex) {
                return state;
            }
            return {
                ...state,
                currentQuestionIndex: state.currentQuestionIndex + 1,
            };
        }

        case "PREVIOUS_QUESTION": {
            if (state.currentQuestionIndex <= 0) {
                return state;
            }
            return {
                ...state,
                currentQuestionIndex: state.currentQuestionIndex - 1,
            };
        }

        case "UPDATE_TIME": {
            return {
                ...state,
                timeRemaining: action.payload.timeRemaining,
            };
        }

        case "CHECK_ANSWER": {
            const { questionId } = action.payload;
            const newChecked = new Set(state.checkedQuestions);
            newChecked.add(questionId);
            return {
                ...state,
                checkedQuestions: newChecked,
            };
        }

        case "SUBMIT_QUIZ": {
            return {
                ...state,
                isSubmitted: true,
            };
        }

        case "RESET_QUIZ": {
            return initialState;
        }

        default:
            return state;
    }
}

// ============================================================================
// Context
// ============================================================================

const QuizContext = createContext<QuizContextValue | null>(null);

// ============================================================================
// Provider
// ============================================================================

interface QuizProviderProps {
    children: ReactNode;
    initialQuiz?: Quiz;
    initialOptions?: Partial<QuizOptions>;
}

export function QuizProvider({ children, initialQuiz, initialOptions }: QuizProviderProps) {
    // Compute initial state with quiz if provided
    const computedInitialState = React.useMemo((): QuizState => {
        if (!initialQuiz) return initialState;

        const options: QuizOptions = {
            ...defaultOptions,
            ...initialOptions,
            timerEnabled: !!initialQuiz.timeLimit && initialQuiz.timeLimit > 0,
            timerDuration: (initialQuiz.timeLimit ?? 0) * 60,
        };

        return {
            ...initialState,
            quiz: initialQuiz,
            options,
            timeRemaining: options.timerDuration,
        };
    }, [initialQuiz, initialOptions]);

    const [state, dispatch] = useReducer(quizReducer, computedInitialState);

    // Before unload warning - prevent accidental navigation during quiz
    useEffect(() => {
        if (state.quiz && !state.isSubmitted) {
            const handleBeforeUnload = (e: BeforeUnloadEvent) => {
                e.preventDefault();
                e.returnValue = "";
                return "";
            };
            window.addEventListener("beforeunload", handleBeforeUnload);
            return () => window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    }, [state.quiz, state.isSubmitted]);

    // Computed values
    const currentQuestion = useMemo(() => {
        if (!state.quiz?.questions) return null;
        return state.quiz.questions[state.currentQuestionIndex] ?? null;
    }, [state.quiz, state.currentQuestionIndex]);

    const totalQuestions = state.quiz?.questions.length ?? 0;

    const answeredCount = useMemo(() => {
        return Object.keys(state.userAnswers).filter((id) => {
            const answer = state.userAnswers[id];
            if (Array.isArray(answer)) {
                return answer.length > 0 && answer.some((a) => a !== "");
            }
            return answer !== null && answer !== undefined && answer !== "";
        }).length;
    }, [state.userAnswers]);

    const isCurrentAnswered = useMemo(() => {
        if (!currentQuestion) return false;
        const answer = state.userAnswers[currentQuestion.id];
        if (Array.isArray(answer)) {
            return answer.length > 0 && answer.some((a) => a !== "");
        }
        return answer !== null && answer !== undefined && answer !== "";
    }, [currentQuestion, state.userAnswers]);

    const isCurrentFlagged = useMemo(() => {
        if (!currentQuestion) return false;
        return state.flaggedQuestions.has(currentQuestion.id);
    }, [currentQuestion, state.flaggedQuestions]);

    const isCurrentChecked = useMemo(() => {
        if (!currentQuestion) return false;
        return state.checkedQuestions.has(currentQuestion.id);
    }, [currentQuestion, state.checkedQuestions]);

    // Convenience actions
    const selectAnswer = useCallback((questionId: string, answer: UserAnswer) => {
        dispatch({
            type: "SELECT_ANSWER",
            payload: { questionId, answer },
        });
    }, []);

    const toggleFlag = useCallback((questionId: string) => {
        dispatch({ type: "TOGGLE_FLAG", payload: { questionId } });
    }, []);

    const goToQuestion = useCallback((index: number) => {
        dispatch({ type: "GO_TO_QUESTION", payload: { index } });
    }, []);

    const nextQuestion = useCallback(() => {
        dispatch({ type: "NEXT_QUESTION" });
    }, []);

    const previousQuestion = useCallback(() => {
        dispatch({ type: "PREVIOUS_QUESTION" });
    }, []);

    const checkAnswer = useCallback((questionId: string) => {
        dispatch({ type: "CHECK_ANSWER", payload: { questionId } });
    }, []);

    const submitQuiz = useCallback(() => {
        dispatch({ type: "SUBMIT_QUIZ" });
    }, []);

    // checkCurrentAnswer is an alias for checkAnswer
    const checkCurrentAnswer = checkAnswer;

    const value = useMemo<QuizContextValue>(
        () => ({
            state,
            dispatch,
            currentQuestion,
            totalQuestions,
            answeredCount,
            isCurrentAnswered,
            isCurrentFlagged,
            isCurrentChecked,
            selectAnswer,
            toggleFlag,
            goToQuestion,
            nextQuestion,
            previousQuestion,
            checkAnswer,
            checkCurrentAnswer,
            submitQuiz,
        }),
        [
            state,
            currentQuestion,
            totalQuestions,
            answeredCount,
            isCurrentAnswered,
            isCurrentFlagged,
            isCurrentChecked,
            selectAnswer,
            toggleFlag,
            goToQuestion,
            nextQuestion,
            previousQuestion,
            checkAnswer,
            checkCurrentAnswer,
            submitQuiz,
        ]
    );

    return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useQuizContext(): QuizContextValue {
    const context = useContext(QuizContext);
    if (!context) {
        throw new Error("useQuizContext must be used within a QuizProvider");
    }
    return context;
}

// Optional hook that returns null instead of throwing
export function useQuizContextSafe(): QuizContextValue | null {
    return useContext(QuizContext);
}

// Alias for useQuizContext
export const useQuiz = useQuizContext;

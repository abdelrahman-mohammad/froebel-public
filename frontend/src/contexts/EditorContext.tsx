"use client";

import React, { type ReactNode, createContext, useCallback, useContext, useReducer } from "react";

import isEqual from "lodash/isEqual";

import { generateChapterId } from "@/lib/chapter-utils";

import type {
    Chapter,
    Choice,
    Question,
    QuestionType,
    Quiz,
    QuizSettings,
    QuizStatus,
} from "@/types/quiz";
import { getPlainText, isRichTextEmpty } from "@/types/rich-text";

// Editor state interface
export interface EditorState {
    quiz: Quiz;
    originalQuiz: Quiz; // Original state for dirty comparison
    isDirty: boolean;
    selectedQuestionIndex: number | null;
    isCreatingQuestion: boolean;
    creatingChapterId: string | null;
    showValidationErrors: boolean; // When true, show validation errors on all fields
    // Backwards compatibility properties (deprecated)
    /** @deprecated Use selectedQuestionIndex !== null || isCreatingQuestion instead */
    isModalOpen: boolean;
    /** @deprecated Use selectedQuestionIndex instead */
    editingQuestionIndex: number | null;
}

// Actions for the editor reducer
export type EditorAction =
    | { type: "SET_QUIZ"; payload: Quiz }
    | { type: "UPDATE_TITLE"; payload: string }
    | { type: "UPDATE_DESCRIPTION"; payload: string }
    | { type: "UPDATE_TIME_LIMIT"; payload: number }
    | { type: "ADD_QUESTION"; payload: Question }
    | {
          type: "UPDATE_QUESTION";
          payload: { index: number; question: Question };
      }
    | { type: "DELETE_QUESTION"; payload: number }
    | { type: "DELETE_QUESTION_BY_ID"; payload: string }
    | {
          type: "MOVE_QUESTION";
          payload: { index: number; direction: "up" | "down" };
      }
    | {
          type: "REORDER_QUESTIONS";
          payload: { oldIndex: number; newIndex: number };
      }
    | {
          type: "MOVE_QUESTION_TO_CHAPTER";
          payload: { questionId: string; chapterId: string | null };
      }
    | { type: "SELECT_QUESTION"; payload: number | null }
    | { type: "SELECT_NEXT" }
    | { type: "SELECT_PREV" }
    | { type: "START_CREATE_QUESTION" }
    | { type: "CANCEL_CREATE_QUESTION" }
    | { type: "MARK_SAVED" }
    | { type: "RESET" }
    // Chapter actions
    | { type: "ADD_CHAPTER"; payload: { id: string; name: string } }
    | { type: "UPDATE_CHAPTER"; payload: { id: string; name: string } }
    | { type: "DELETE_CHAPTER"; payload: string }
    | { type: "FINISH_CREATE_CHAPTER" }
    | {
          type: "MOVE_CHAPTER";
          payload: { id: string; direction: "up" | "down" };
      }
    | {
          type: "REORDER_CHAPTERS";
          payload: { oldIndex: number; newIndex: number };
      }
    // Settings actions
    | { type: "UPDATE_SETTINGS"; payload: Partial<QuizSettings> }
    // Metadata actions
    | { type: "UPDATE_TAGS"; payload: string[] }
    | {
          type: "UPDATE_CATEGORY";
          payload: { id: string | null; name: string | null };
      }
    | { type: "UPDATE_ICON_URL"; payload: string | null }
    | { type: "UPDATE_BANNER_URL"; payload: string | null }
    // Status
    | { type: "SET_STATUS"; payload: QuizStatus }
    // Version (for optimistic locking)
    | { type: "UPDATE_VERSION"; payload: number }
    // Validation
    | { type: "SET_SHOW_VALIDATION_ERRORS"; payload: boolean };

// ============================================================================
// Deep comparison utilities for dirty state tracking
// ============================================================================

/**
 * Compare two values that might be rich text (string or SerializedEditorState)
 * Uses JSON.stringify for fast comparison of serialized editor states.
 * This is more efficient than recursive deep comparison for these JSON-serializable objects.
 */
function richTextEquals(a: unknown, b: unknown): boolean {
    // Same reference or both primitives
    if (a === b) return true;
    // Both null/undefined
    if (a == null && b == null) return true;
    // One is null/undefined
    if (a == null || b == null) return false;
    // Both strings
    if (typeof a === "string" && typeof b === "string") return a === b;
    // Different types
    if (typeof a !== typeof b) return false;
    // For objects (SerializedEditorState), use JSON.stringify
    // This is faster than lodash isEqual for these JSON-serializable structures
    try {
        return JSON.stringify(a) === JSON.stringify(b);
    } catch {
        // Fallback to lodash for edge cases (circular refs, etc.)
        return isEqual(a, b);
    }
}

/**
 * Compare two arrays using a custom equality function
 */
function arraysEqual<T>(
    a: T[] | undefined,
    b: T[] | undefined,
    eq: (x: T, y: T) => boolean
): boolean {
    if (a === b) return true;
    if (!a && !b) return true;
    if (!a || !b) return false;
    if (a.length !== b.length) return false;
    return a.every((item, i) => eq(item, b[i]));
}

/**
 * Compare two Choice arrays
 */
function choicesEqual(a: Choice[] | undefined, b: Choice[] | undefined): boolean {
    return arraysEqual(a, b, (x, y) => {
        if (x.id !== y.id) return false;
        if (x.correct !== y.correct) return false;
        if (!richTextEquals(x.text, y.text)) return false;
        if (!richTextEquals(x.hint, y.hint)) return false;
        return true;
    });
}

/**
 * Compare two Question objects
 */
function questionEquals(a: Question, b: Question): boolean {
    // Base properties
    if (a.id !== b.id) return false;
    if (a.type !== b.type) return false;
    if (a.points !== b.points) return false;
    if (a.chapter !== b.chapter) return false;
    if (a.identifier !== b.identifier) return false;
    if (a.explanation !== b.explanation) return false;
    if (!richTextEquals(a.text, b.text)) return false;
    if (!richTextEquals(a.hintCorrect, b.hintCorrect)) return false;
    if (!richTextEquals(a.hintWrong, b.hintWrong)) return false;

    // Type-specific properties
    switch (a.type) {
        case "multiple_choice":
        case "multiple_answer":
            if (b.type !== a.type) return false;
            if (!choicesEqual(a.choices, b.choices)) return false;
            break;
        case "true_false":
            if (b.type !== "true_false") return false;
            if (a.correct !== b.correct) return false;
            break;
        case "fill_blank":
            if (b.type !== "fill_blank") return false;
            if (!arraysEqual(a.answers, b.answers, (x, y) => x === y)) return false;
            if (a.inline !== b.inline) return false;
            if (a.numeric !== b.numeric) return false;
            if (a.tolerance !== b.tolerance) return false;
            break;
        case "dropdown":
            if (b.type !== "dropdown") return false;
            if (!choicesEqual(a.choices, b.choices)) return false;
            if (!arraysEqual(a.answers, b.answers, (x, y) => x === y)) return false;
            break;
        case "free_text":
            if (b.type !== "free_text") return false;
            if (a.referenceAnswer !== b.referenceAnswer) return false;
            if (a.aiGradingEnabled !== b.aiGradingEnabled) return false;
            break;
        case "numeric":
            if (b.type !== "numeric") return false;
            if (a.correctAnswer !== b.correctAnswer) return false;
            if (a.tolerance !== b.tolerance) return false;
            if (a.unit !== b.unit) return false;
            break;
        case "file_upload":
            if (b.type !== "file_upload") return false;
            if (!arraysEqual(a.acceptedTypes, b.acceptedTypes, (x, y) => x === y)) return false;
            if (a.maxFileSizeMB !== b.maxFileSizeMB) return false;
            if (a.referenceAnswer !== b.referenceAnswer) return false;
            break;
    }

    return true;
}

/**
 * Compare two Chapter arrays
 */
function chaptersEqual(a: Chapter[] | undefined, b: Chapter[] | undefined): boolean {
    return arraysEqual(a, b, (x, y) => x.id === y.id && x.name === y.name);
}

/**
 * Compare two QuizSettings objects
 */
function settingsEqual(a: QuizSettings | undefined, b: QuizSettings | undefined): boolean {
    if (a === b) return true;
    if (!a && !b) return true;
    if (!a || !b) return false;

    // Compare all settings fields
    return (
        a.shuffleQuestions === b.shuffleQuestions &&
        a.shuffleChoices === b.shuffleChoices &&
        a.showCorrectAnswers === b.showCorrectAnswers &&
        a.passingScore === b.passingScore &&
        a.isPublic === b.isPublic &&
        a.allowAnonymous === b.allowAnonymous &&
        a.maxAttempts === b.maxAttempts &&
        a.requireAccessCode === b.requireAccessCode &&
        a.accessCode === b.accessCode &&
        a.filterIpAddresses === b.filterIpAddresses &&
        a.allowedIpAddresses === b.allowedIpAddresses &&
        a.availableFrom === b.availableFrom &&
        a.availableTo === b.availableTo &&
        a.resultsVisibleFrom === b.resultsVisibleFrom
    );
}

/**
 * Compare two Quiz objects for equality (used to determine isDirty state)
 */
function quizEquals(a: Quiz, b: Quiz): boolean {
    // Simple fields
    if (a.title !== b.title) return false;
    if (a.description !== b.description) return false;
    if (a.timeLimit !== b.timeLimit) return false;
    if (a.categoryId !== b.categoryId) return false;
    if (a.category !== b.category) return false;
    if (a.courseId !== b.courseId) return false;
    if (a.iconUrl !== b.iconUrl) return false;
    if (a.bannerUrl !== b.bannerUrl) return false;
    if (a.aiGradingEnabled !== b.aiGradingEnabled) return false;

    // Arrays
    if (!arraysEqual(a.tags, b.tags, (x, y) => x === y)) return false;
    if (!arraysEqual(a.questions, b.questions, questionEquals)) return false;
    if (!chaptersEqual(a.chapters, b.chapters)) return false;

    // Settings object
    if (!settingsEqual(a.settings, b.settings)) return false;

    return true;
}

// ============================================================================
// State initialization
// ============================================================================

// Initial state factory
function createInitialState(quiz?: Quiz): EditorState {
    const initialQuiz = quiz || createEmptyQuiz();
    return {
        quiz: initialQuiz,
        originalQuiz: structuredClone(initialQuiz),
        isDirty: false,
        selectedQuestionIndex: null,
        isCreatingQuestion: false,
        creatingChapterId: null,
        showValidationErrors: false,
        // Backwards compatibility
        isModalOpen: false,
        editingQuestionIndex: null,
    };
}

// Create an empty quiz
export function createEmptyQuiz(): Quiz {
    return {
        id: "",
        title: "",
        description: "",
        timeLimit: 0,
        questions: [],
    };
}

// Create an empty question
export function createEmptyQuestion(type: QuestionType = "multiple_choice"): Question {
    const baseQuestion = {
        id: `q${Date.now()}`,
        text: "",
        points: 1,
        image: null,
    };

    switch (type) {
        case "multiple_choice":
        case "multiple_answer":
            return {
                ...baseQuestion,
                type,
                choices: [
                    { id: "a", text: "", correct: false },
                    { id: "b", text: "", correct: false },
                ],
            };
        case "true_false":
            return {
                ...baseQuestion,
                type,
                correct: true,
            };
        case "fill_blank":
            return {
                ...baseQuestion,
                type,
                answers: [""],
                inline: true,
                numeric: false,
                tolerance: "off",
                caseSensitive: false,
            };
        case "dropdown":
            return {
                ...baseQuestion,
                type,
                choices: [
                    { id: "a", text: "", correct: false },
                    { id: "b", text: "", correct: false },
                ],
                answers: [],
            };
        case "free_text":
            return {
                ...baseQuestion,
                type,
                referenceAnswer: "",
                aiGradingEnabled: false,
            };
        case "numeric":
            return {
                ...baseQuestion,
                type,
                correctAnswer: 0,
                tolerance: null,
                unit: "",
            };
        case "file_upload":
            return {
                ...baseQuestion,
                type,
                acceptedTypes: [".pdf", ".docx", "image/*"],
                maxFileSizeMB: 10,
                referenceAnswer: "",
            };
        default:
            return {
                ...baseQuestion,
                type: "multiple_choice",
                choices: [],
            };
    }
}

// Core reducer logic
function coreEditorReducer(state: EditorState, action: EditorAction): EditorState {
    switch (action.type) {
        case "SET_QUIZ":
            return {
                ...state,
                quiz: action.payload,
                originalQuiz: structuredClone(action.payload),
                isDirty: false,
            };

        case "UPDATE_TITLE": {
            const newQuiz = { ...state.quiz, title: action.payload };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_DESCRIPTION": {
            const newQuiz = { ...state.quiz, description: action.payload };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_TIME_LIMIT": {
            const newQuiz = {
                ...state.quiz,
                timeLimit: Math.max(0, Math.min(480, action.payload)),
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "ADD_QUESTION": {
            const newQuestions = [...state.quiz.questions, action.payload];
            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                isCreatingQuestion: false,
                selectedQuestionIndex: newQuestions.length - 1, // Auto-select the new question
            };
        }

        case "UPDATE_QUESTION": {
            const newQuestions = [...state.quiz.questions];
            newQuestions[action.payload.index] = action.payload.question;
            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                // Keep selection in place for inline editing
            };
        }

        case "DELETE_QUESTION": {
            const deletedIndex = action.payload;
            const newQuestions = state.quiz.questions.filter((_, i) => i !== deletedIndex);

            // Handle selection after deletion
            let newSelectedIndex = state.selectedQuestionIndex;
            if (newSelectedIndex !== null) {
                if (newSelectedIndex === deletedIndex) {
                    // If deleting the selected question, select the previous one (or next if first)
                    if (newQuestions.length === 0) {
                        newSelectedIndex = null;
                    } else if (deletedIndex >= newQuestions.length) {
                        newSelectedIndex = newQuestions.length - 1;
                    }
                    // Otherwise keep the same index (which now points to the next question)
                } else if (newSelectedIndex > deletedIndex) {
                    // Adjust index if we deleted a question before the selected one
                    newSelectedIndex = newSelectedIndex - 1;
                }
            }

            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                selectedQuestionIndex: newSelectedIndex,
            };
        }

        case "DELETE_QUESTION_BY_ID": {
            const questionId = action.payload;
            const deletedIndex = state.quiz.questions.findIndex((q) => q.id === questionId);

            // If question not found, return state unchanged
            if (deletedIndex === -1) {
                return state;
            }

            const newQuestions = state.quiz.questions.filter((q) => q.id !== questionId);

            // Handle selection after deletion
            let newSelectedIndex = state.selectedQuestionIndex;
            if (newSelectedIndex !== null) {
                if (newSelectedIndex === deletedIndex) {
                    if (newQuestions.length === 0) {
                        newSelectedIndex = null;
                    } else if (deletedIndex >= newQuestions.length) {
                        newSelectedIndex = newQuestions.length - 1;
                    }
                } else if (newSelectedIndex > deletedIndex) {
                    newSelectedIndex = newSelectedIndex - 1;
                }
            }

            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                selectedQuestionIndex: newSelectedIndex,
            };
        }

        case "MOVE_QUESTION": {
            const { index, direction } = action.payload;
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= state.quiz.questions.length) {
                return state;
            }

            const newQuestions = [...state.quiz.questions];
            [newQuestions[index], newQuestions[newIndex]] = [
                newQuestions[newIndex],
                newQuestions[index],
            ];

            // Update selection if the moved question was selected
            let newSelectedIndex = state.selectedQuestionIndex;
            if (newSelectedIndex === index) {
                newSelectedIndex = newIndex;
            } else if (newSelectedIndex === newIndex) {
                newSelectedIndex = index;
            }

            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                selectedQuestionIndex: newSelectedIndex,
            };
        }

        case "REORDER_QUESTIONS": {
            const { oldIndex, newIndex } = action.payload;
            if (oldIndex === newIndex) return state;
            if (oldIndex < 0 || oldIndex >= state.quiz.questions.length) return state;
            if (newIndex < 0 || newIndex >= state.quiz.questions.length) return state;

            const newQuestions = [...state.quiz.questions];
            const [movedQuestion] = newQuestions.splice(oldIndex, 1);
            newQuestions.splice(newIndex, 0, movedQuestion);

            // Update selection if needed
            let newSelectedIndex = state.selectedQuestionIndex;
            if (newSelectedIndex !== null) {
                if (newSelectedIndex === oldIndex) {
                    newSelectedIndex = newIndex;
                } else if (oldIndex < newSelectedIndex && newIndex >= newSelectedIndex) {
                    newSelectedIndex = newSelectedIndex - 1;
                } else if (oldIndex > newSelectedIndex && newIndex <= newSelectedIndex) {
                    newSelectedIndex = newSelectedIndex + 1;
                }
            }

            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                selectedQuestionIndex: newSelectedIndex,
            };
        }

        case "MOVE_QUESTION_TO_CHAPTER": {
            const { questionId, chapterId } = action.payload;

            // Validate chapter exists (if not removing from chapter)
            if (chapterId !== null) {
                const chapters = state.quiz.chapters || [];
                const chapterExists = chapters.some((c) => c.id === chapterId);
                if (!chapterExists) {
                    // Chapter doesn't exist, don't make any changes
                    return state;
                }
            }

            const newQuestions = state.quiz.questions.map((q) => {
                if (q.id === questionId) {
                    // Set chapter to the new value (or undefined to remove)
                    return { ...q, chapter: chapterId ?? undefined };
                }
                return q;
            });

            const newQuiz = { ...state.quiz, questions: newQuestions };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "SELECT_QUESTION":
            return {
                ...state,
                selectedQuestionIndex: action.payload,
                isCreatingQuestion: false,
            };

        case "SELECT_NEXT": {
            const currentIndex = state.selectedQuestionIndex;
            const questionCount = state.quiz.questions.length;
            if (questionCount === 0) return state;

            let nextIndex: number;
            if (currentIndex === null) {
                nextIndex = 0;
            } else if (currentIndex < questionCount - 1) {
                nextIndex = currentIndex + 1;
            } else {
                return state; // Already at the last question
            }

            return {
                ...state,
                selectedQuestionIndex: nextIndex,
                isCreatingQuestion: false,
            };
        }

        case "SELECT_PREV": {
            const currentIndex = state.selectedQuestionIndex;
            const questionCount = state.quiz.questions.length;
            if (questionCount === 0) return state;

            let prevIndex: number;
            if (currentIndex === null) {
                prevIndex = questionCount - 1;
            } else if (currentIndex > 0) {
                prevIndex = currentIndex - 1;
            } else {
                return state; // Already at the first question
            }

            return {
                ...state,
                selectedQuestionIndex: prevIndex,
                isCreatingQuestion: false,
            };
        }

        case "START_CREATE_QUESTION":
            return {
                ...state,
                isCreatingQuestion: true,
                selectedQuestionIndex: null,
            };

        case "CANCEL_CREATE_QUESTION":
            return {
                ...state,
                isCreatingQuestion: false,
            };

        case "MARK_SAVED":
            return {
                ...state,
                originalQuiz: structuredClone(state.quiz),
                isDirty: false,
            };

        case "RESET":
            return createInitialState();

        // Chapter actions
        case "ADD_CHAPTER": {
            const newChapter: Chapter = {
                id: action.payload.id,
                name: action.payload.name,
            };
            const newQuiz = {
                ...state.quiz,
                chapters: [...(state.quiz.chapters || []), newChapter],
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
                creatingChapterId: action.payload.id,
            };
        }

        case "FINISH_CREATE_CHAPTER":
            return {
                ...state,
                creatingChapterId: null,
            };

        case "UPDATE_CHAPTER": {
            const { id, name } = action.payload;
            const chapters = state.quiz.chapters || [];
            const newQuiz = {
                ...state.quiz,
                chapters: chapters.map((c) => (c.id === id ? { ...c, name } : c)),
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "DELETE_CHAPTER": {
            const chapterId = action.payload;
            const chapters = state.quiz.chapters || [];
            // Remove chapter from list
            const newChapters = chapters.filter((c) => c.id !== chapterId);
            // Remove chapter reference from all questions
            const newQuestions = state.quiz.questions.map((q) => {
                if (q.chapter === chapterId) {
                    // Set chapter to undefined instead of destructuring and casting
                    // This is type-safe since 'chapter' is an optional property
                    return { ...q, chapter: undefined };
                }
                return q;
            });
            const newQuiz = {
                ...state.quiz,
                chapters: newChapters.length > 0 ? newChapters : undefined,
                questions: newQuestions,
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "MOVE_CHAPTER": {
            const { id, direction } = action.payload;
            const chapters = state.quiz.chapters || [];
            const index = chapters.findIndex((c) => c.id === id);
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= chapters.length) {
                return state;
            }

            const newChapters = [...chapters];
            [newChapters[index], newChapters[newIndex]] = [
                newChapters[newIndex],
                newChapters[index],
            ];

            const newQuiz = { ...state.quiz, chapters: newChapters };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "REORDER_CHAPTERS": {
            const { oldIndex, newIndex } = action.payload;
            const chapters = state.quiz.chapters || [];
            if (oldIndex === newIndex) return state;
            if (oldIndex < 0 || oldIndex >= chapters.length) return state;
            if (newIndex < 0 || newIndex >= chapters.length) return state;

            const newChapters = [...chapters];
            const [movedChapter] = newChapters.splice(oldIndex, 1);
            newChapters.splice(newIndex, 0, movedChapter);

            const newQuiz = { ...state.quiz, chapters: newChapters };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_SETTINGS": {
            const currentSettings = state.quiz.settings || {};
            const newQuiz = {
                ...state.quiz,
                settings: { ...currentSettings, ...action.payload },
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_TAGS": {
            const newQuiz = { ...state.quiz, tags: action.payload };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_CATEGORY": {
            const newQuiz = {
                ...state.quiz,
                categoryId: action.payload.id || undefined,
                category: action.payload.name || undefined,
            };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_ICON_URL": {
            const newQuiz = { ...state.quiz, iconUrl: action.payload || undefined };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "UPDATE_BANNER_URL": {
            const newQuiz = { ...state.quiz, bannerUrl: action.payload || undefined };
            return {
                ...state,
                quiz: newQuiz,
                isDirty: !quizEquals(newQuiz, state.originalQuiz),
            };
        }

        case "SET_STATUS":
            return {
                ...state,
                quiz: { ...state.quiz, status: action.payload },
                // Don't set isDirty since this is a server state change, not a local edit
            };

        case "UPDATE_VERSION":
            return {
                ...state,
                quiz: { ...state.quiz, version: action.payload },
                // Don't set isDirty since this is a server state update for optimistic locking
            };

        case "SET_SHOW_VALIDATION_ERRORS":
            return {
                ...state,
                showValidationErrors: action.payload,
            };

        default:
            return state;
    }
}

// Wrapper reducer that adds backwards compatibility properties
function editorReducer(state: EditorState, action: EditorAction): EditorState {
    const newState = coreEditorReducer(state, action);

    // Update backwards compatibility properties based on new state
    if (newState !== state) {
        return {
            ...newState,
            isModalOpen: newState.isCreatingQuestion || newState.selectedQuestionIndex !== null,
            editingQuestionIndex: newState.selectedQuestionIndex,
        };
    }

    return state;
}

// Context type
interface EditorContextType {
    state: EditorState;
    // Quiz metadata
    updateTitle: (title: string) => void;
    updateDescription: (description: string) => void;
    updateTimeLimit: (minutes: number) => void;
    adjustTimeLimit: (delta: number) => void;
    // Questions
    addQuestion: (question: Question) => void;
    updateQuestion: (index: number, question: Question) => void;
    deleteQuestion: (index: number) => void;
    deleteQuestionById: (questionId: string) => void;
    moveQuestion: (index: number, direction: "up" | "down") => void;
    reorderQuestions: (oldIndex: number, newIndex: number) => void;
    moveQuestionToChapter: (questionId: string, chapterId: string | null) => void;
    // Chapters
    addChapter: (name: string) => string;
    updateChapter: (id: string, name: string) => void;
    deleteChapter: (id: string) => void;
    moveChapter: (id: string, direction: "up" | "down") => void;
    reorderChapters: (oldIndex: number, newIndex: number) => void;
    finishCreateChapter: () => void;
    // Settings
    updateSettings: (settings: Partial<QuizSettings>) => void;
    // Metadata
    updateTags: (tags: string[]) => void;
    updateCategory: (id: string | null, name: string | null) => void;
    updateIconUrl: (url: string | null) => void;
    updateBannerUrl: (url: string | null) => void;
    // Selection (replaces modal)
    selectQuestion: (index: number | null) => void;
    selectNextQuestion: () => void;
    selectPreviousQuestion: () => void;
    startCreateQuestion: () => void;
    cancelCreateQuestion: () => void;
    // Quiz
    setQuiz: (quiz: Quiz) => void;
    markSaved: () => void;
    reset: () => void;
    // Status
    setStatus: (status: QuizStatus) => void;
    // Version (for optimistic locking)
    updateVersion: (version: number) => void;
    // Validation
    setShowValidationErrors: (show: boolean) => void;
    // Helpers
    getSelectedQuestion: () => Question | null;
    // Backwards compatibility (deprecated - use selection methods instead)
    /** @deprecated Use selectQuestion(null) and startCreateQuestion() instead */
    openAddModal: () => void;
    /** @deprecated Use selectQuestion(index) instead */
    openEditModal: (index: number) => void;
    /** @deprecated Use selectQuestion(null) or cancelCreateQuestion() instead */
    closeModal: () => void;
    /** @deprecated Use getSelectedQuestion() instead */
    getEditingQuestion: () => Question | null;
}

// Create context
const EditorContext = createContext<EditorContextType | null>(null);

// Provider props
interface EditorProviderProps {
    children: ReactNode;
    initialQuiz?: Quiz;
}

// Provider component
export function EditorProvider({ children, initialQuiz }: EditorProviderProps) {
    const [state, dispatch] = useReducer(editorReducer, initialQuiz, (quiz) =>
        createInitialState(quiz)
    );

    // Quiz metadata actions
    const updateTitle = useCallback((title: string) => {
        dispatch({ type: "UPDATE_TITLE", payload: title });
    }, []);

    const updateDescription = useCallback((description: string) => {
        dispatch({ type: "UPDATE_DESCRIPTION", payload: description });
    }, []);

    const updateTimeLimit = useCallback((minutes: number) => {
        dispatch({ type: "UPDATE_TIME_LIMIT", payload: minutes });
    }, []);

    const adjustTimeLimit = useCallback(
        (delta: number) => {
            dispatch({
                type: "UPDATE_TIME_LIMIT",
                payload: (state.quiz.timeLimit ?? 0) + delta,
            });
        },
        [state.quiz.timeLimit]
    );

    // Question actions
    const addQuestion = useCallback((question: Question) => {
        dispatch({ type: "ADD_QUESTION", payload: question });
    }, []);

    const updateQuestion = useCallback((index: number, question: Question) => {
        dispatch({ type: "UPDATE_QUESTION", payload: { index, question } });
    }, []);

    const deleteQuestion = useCallback((index: number) => {
        dispatch({ type: "DELETE_QUESTION", payload: index });
    }, []);

    const deleteQuestionById = useCallback((questionId: string) => {
        dispatch({ type: "DELETE_QUESTION_BY_ID", payload: questionId });
    }, []);

    const moveQuestion = useCallback((index: number, direction: "up" | "down") => {
        dispatch({ type: "MOVE_QUESTION", payload: { index, direction } });
    }, []);

    const reorderQuestions = useCallback((oldIndex: number, newIndex: number) => {
        dispatch({
            type: "REORDER_QUESTIONS",
            payload: { oldIndex, newIndex },
        });
    }, []);

    const moveQuestionToChapter = useCallback((questionId: string, chapterId: string | null) => {
        dispatch({
            type: "MOVE_QUESTION_TO_CHAPTER",
            payload: { questionId, chapterId },
        });
    }, []);

    // Chapter actions
    const addChapter = useCallback((name: string): string => {
        const id = generateChapterId();
        dispatch({ type: "ADD_CHAPTER", payload: { id, name } });
        return id;
    }, []);

    const updateChapter = useCallback((id: string, name: string) => {
        dispatch({ type: "UPDATE_CHAPTER", payload: { id, name } });
    }, []);

    const deleteChapter = useCallback((id: string) => {
        dispatch({ type: "DELETE_CHAPTER", payload: id });
    }, []);

    const moveChapter = useCallback((id: string, direction: "up" | "down") => {
        dispatch({ type: "MOVE_CHAPTER", payload: { id, direction } });
    }, []);

    const reorderChapters = useCallback((oldIndex: number, newIndex: number) => {
        dispatch({
            type: "REORDER_CHAPTERS",
            payload: { oldIndex, newIndex },
        });
    }, []);

    const finishCreateChapter = useCallback(() => {
        dispatch({ type: "FINISH_CREATE_CHAPTER" });
    }, []);

    // Settings actions
    const updateSettings = useCallback((settings: Partial<QuizSettings>) => {
        dispatch({ type: "UPDATE_SETTINGS", payload: settings });
    }, []);

    // Metadata actions
    const updateTags = useCallback((tags: string[]) => {
        dispatch({ type: "UPDATE_TAGS", payload: tags });
    }, []);

    const updateCategory = useCallback((id: string | null, name: string | null) => {
        dispatch({ type: "UPDATE_CATEGORY", payload: { id, name } });
    }, []);

    const updateIconUrl = useCallback((url: string | null) => {
        dispatch({ type: "UPDATE_ICON_URL", payload: url });
    }, []);

    const updateBannerUrl = useCallback((url: string | null) => {
        dispatch({ type: "UPDATE_BANNER_URL", payload: url });
    }, []);

    // Selection actions (replaces modal)
    const selectQuestion = useCallback((index: number | null) => {
        dispatch({ type: "SELECT_QUESTION", payload: index });
    }, []);

    const selectNextQuestion = useCallback(() => {
        dispatch({ type: "SELECT_NEXT" });
    }, []);

    const selectPreviousQuestion = useCallback(() => {
        dispatch({ type: "SELECT_PREV" });
    }, []);

    const startCreateQuestion = useCallback(() => {
        dispatch({ type: "START_CREATE_QUESTION" });
    }, []);

    const cancelCreateQuestion = useCallback(() => {
        dispatch({ type: "CANCEL_CREATE_QUESTION" });
    }, []);

    // Quiz actions
    const setQuiz = useCallback((quiz: Quiz) => {
        dispatch({ type: "SET_QUIZ", payload: quiz });
    }, []);

    const markSaved = useCallback(() => {
        dispatch({ type: "MARK_SAVED" });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    // Status
    const setStatus = useCallback((status: QuizStatus) => {
        dispatch({ type: "SET_STATUS", payload: status });
    }, []);

    // Version (for optimistic locking)
    const updateVersion = useCallback((version: number) => {
        dispatch({ type: "UPDATE_VERSION", payload: version });
    }, []);

    // Validation
    const setShowValidationErrors = useCallback((show: boolean) => {
        dispatch({ type: "SET_SHOW_VALIDATION_ERRORS", payload: show });
    }, []);

    // Helpers
    const getSelectedQuestion = useCallback((): Question | null => {
        if (state.selectedQuestionIndex === null) return null;
        return state.quiz.questions[state.selectedQuestionIndex] || null;
    }, [state.selectedQuestionIndex, state.quiz.questions]);

    // Backwards compatibility methods (deprecated)
    const openAddModal = useCallback(() => {
        dispatch({ type: "START_CREATE_QUESTION" });
    }, []);

    const openEditModal = useCallback((index: number) => {
        dispatch({ type: "SELECT_QUESTION", payload: index });
    }, []);

    const closeModal = useCallback(() => {
        dispatch({ type: "CANCEL_CREATE_QUESTION" });
        dispatch({ type: "SELECT_QUESTION", payload: null });
    }, []);

    const getEditingQuestion = useCallback((): Question | null => {
        if (state.selectedQuestionIndex === null) return null;
        return state.quiz.questions[state.selectedQuestionIndex] || null;
    }, [state.selectedQuestionIndex, state.quiz.questions]);

    const value: EditorContextType = {
        state,
        updateTitle,
        updateDescription,
        updateTimeLimit,
        adjustTimeLimit,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        deleteQuestionById,
        moveQuestion,
        reorderQuestions,
        moveQuestionToChapter,
        addChapter,
        updateChapter,
        deleteChapter,
        moveChapter,
        reorderChapters,
        finishCreateChapter,
        updateSettings,
        updateTags,
        updateCategory,
        updateIconUrl,
        updateBannerUrl,
        selectQuestion,
        selectNextQuestion,
        selectPreviousQuestion,
        startCreateQuestion,
        cancelCreateQuestion,
        setQuiz,
        markSaved,
        reset,
        setStatus,
        updateVersion,
        setShowValidationErrors,
        getSelectedQuestion,
        // Backwards compatibility
        openAddModal,
        openEditModal,
        closeModal,
        getEditingQuestion,
    };

    return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

// Hook to use editor context
export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
}

// Validation utilities
export interface ValidationError {
    field: string;
    message: string;
}

/**
 * Validate quiz for saving or publishing
 * @param quiz The quiz to validate
 * @param mode "draft" for minimal validation (allow saving incomplete), "publish" for full validation
 * @returns Array of validation errors (empty if valid)
 */
export function validateQuiz(quiz: Quiz, mode: "draft" | "publish" = "publish"): ValidationError[] {
    const errors: ValidationError[] = [];

    // For drafts, require a non-empty title (after trimming whitespace)
    if (mode === "draft") {
        const trimmedTitle = quiz.title?.trim() || "";
        if (trimmedTitle.length === 0) {
            errors.push({
                field: "title",
                message: "Title is required to save a draft",
            });
        }
        return errors;
    }

    // Full validation for publishing
    if (!quiz.title || quiz.title.trim().length < 4) {
        errors.push({
            field: "title",
            message: "Title must be at least 4 characters",
        });
    }

    if (!quiz.categoryId) {
        errors.push({ field: "category", message: "Category is required" });
    }

    if (quiz.questions.length === 0) {
        errors.push({
            field: "questions",
            message: "Quiz must have at least 1 question",
        });
    }

    // Also validate each question when publishing
    quiz.questions.forEach((q, index) => {
        const questionErrors = validateQuestion(q);
        questionErrors.forEach((e) => {
            errors.push({
                field: `questions[${index}].${e.field}`,
                message: `Question ${index + 1}: ${e.message}`,
            });
        });
    });

    // Validate settings
    const settings = quiz.settings;
    if (settings) {
        // Validate date range: availableFrom must be before availableTo
        if (settings.availableFrom && settings.availableTo) {
            const fromDate = new Date(settings.availableFrom);
            const toDate = new Date(settings.availableTo);
            if (toDate <= fromDate) {
                errors.push({
                    field: "settings.availableTo",
                    message: "Available Until must be after Available From",
                });
            }
        }

        // Validate IP addresses if filtering is enabled
        if (settings.filterIpAddresses && settings.allowedIpAddresses) {
            const ipLines = settings.allowedIpAddresses.split("\n");
            const invalidIps: string[] = [];
            ipLines.forEach((line, index) => {
                const trimmed = line.trim();
                if (trimmed && !isValidIPEntry(trimmed)) {
                    invalidIps.push(`Line ${index + 1}`);
                }
            });
            if (invalidIps.length > 0) {
                errors.push({
                    field: "settings.allowedIpAddresses",
                    message: `Invalid IP address format on ${invalidIps.slice(0, 3).join(", ")}${invalidIps.length > 3 ? ` and ${invalidIps.length - 3} more` : ""}`,
                });
            }
        }
    }

    return errors;
}

// Helper for IP validation in quiz validation
function isValidIPEntry(entry: string): boolean {
    // IPv4 validation
    const isIPv4 = (ip: string): boolean => {
        const parts = ip.split(".");
        if (parts.length !== 4) return false;
        return parts.every((part) => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255 && part === String(num);
        });
    };

    // Simplified IPv6 validation
    const isIPv6 = (ip: string): boolean => {
        const ipv6Regex = /^(?:(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,7}:|(?:[0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|(?:[0-9a-fA-F]{1,4}:){1,5}(?::[0-9a-fA-F]{1,4}){1,2}|(?:[0-9a-fA-F]{1,4}:){1,4}(?::[0-9a-fA-F]{1,4}){1,3}|(?:[0-9a-fA-F]{1,4}:){1,3}(?::[0-9a-fA-F]{1,4}){1,4}|(?:[0-9a-fA-F]{1,4}:){1,2}(?::[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:(?::[0-9a-fA-F]{1,4}){1,6}|:(?:(?::[0-9a-fA-F]{1,4}){1,7}|:)|::)$/;
        return ipv6Regex.test(ip);
    };

    // CIDR validation
    if (entry.includes("/")) {
        const parts = entry.split("/");
        if (parts.length !== 2) return false;
        const [ip, prefix] = parts;
        const prefixNum = parseInt(prefix, 10);
        if (isIPv4(ip)) return !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 32;
        if (isIPv6(ip)) return !isNaN(prefixNum) && prefixNum >= 0 && prefixNum <= 128;
        return false;
    }

    return isIPv4(entry) || isIPv6(entry);
}

export function validateQuestion(question: Question): ValidationError[] {
    const errors: ValidationError[] = [];

    // Get plain text for validation (handles both string and SerializedEditorState)
    const questionText = getPlainText(question.text);

    if (isRichTextEmpty(question.text)) {
        errors.push({ field: "text", message: "Question text is required" });
    }

    switch (question.type) {
        case "multiple_choice":
        case "multiple_answer": {
            if (question.choices.length < 2) {
                errors.push({
                    field: "choices",
                    message: "At least 2 choices are required",
                });
            }
            // Check for empty choice text
            const emptyChoices = question.choices.filter(
                (c) => !c.text || (typeof c.text === "string" ? !c.text.trim() : isRichTextEmpty(c.text))
            );
            if (emptyChoices.length > 0) {
                errors.push({
                    field: "choices",
                    message: `${emptyChoices.length} choice(s) have empty text`,
                });
            }
            const correctCount = question.choices.filter((c) => c.correct).length;
            if (correctCount === 0) {
                errors.push({
                    field: "choices",
                    message: "At least 1 correct answer is required",
                });
            }
            if (question.type === "multiple_choice" && correctCount > 1) {
                errors.push({
                    field: "choices",
                    message: "Multiple choice can only have 1 correct answer",
                });
            }
            break;
        }

        case "fill_blank": {
            const blankCount = (questionText.match(/\{blank\}/gi) || []).length;
            const nonEmptyAnswers = question.answers.filter((a) => a.trim());

            // Check if there are {blank} markers
            if (blankCount === 0) {
                errors.push({
                    field: "text",
                    message: "Question text must contain at least one {blank} marker",
                });
            }

            // Check if answers are provided for each blank
            if (blankCount > 0 && nonEmptyAnswers.length === 0) {
                errors.push({
                    field: "answers",
                    message: "At least 1 answer is required for the blank(s)",
                });
            } else if (blankCount > 0 && nonEmptyAnswers.length !== blankCount) {
                errors.push({
                    field: "answers",
                    message: `Each {blank} marker requires an answer (${nonEmptyAnswers.length}/${blankCount} provided)`,
                });
            }
            break;
        }

        case "dropdown": {
            if (question.choices.length < 2) {
                errors.push({
                    field: "choices",
                    message: "At least 2 choices are required",
                });
            }
            // Check for empty choice text
            const emptyDropdownChoices = question.choices.filter(
                (c) => !c.text || (typeof c.text === "string" ? !c.text.trim() : isRichTextEmpty(c.text))
            );
            if (emptyDropdownChoices.length > 0) {
                errors.push({
                    field: "choices",
                    message: `${emptyDropdownChoices.length} choice(s) have empty text`,
                });
            }
            const dropdownCount = (questionText.match(/\{dropdown\}/gi) || []).length;
            if (dropdownCount === 0) {
                errors.push({
                    field: "text",
                    message: "Question text must contain at least one {dropdown} marker",
                });
            }
            // Check that answers array has correct answer for each dropdown marker
            const validAnswers = question.answers.filter((a) => a && a.trim());
            if (dropdownCount > 0 && validAnswers.length !== dropdownCount) {
                errors.push({
                    field: "answers",
                    message: `Each dropdown marker requires a correct answer (${validAnswers.length}/${dropdownCount} provided)`,
                });
            }
            // Verify each answer is a valid choice ID
            const choiceIds = new Set(question.choices.map((c) => c.id));
            const invalidAnswers = validAnswers.filter((a) => !choiceIds.has(a));
            if (invalidAnswers.length > 0) {
                errors.push({
                    field: "answers",
                    message: "Some selected answers are not valid choices",
                });
            }
            break;
        }

        case "numeric": {
            if (typeof question.correctAnswer !== "number" || isNaN(question.correctAnswer)) {
                errors.push({
                    field: "correctAnswer",
                    message: "A valid correct answer is required",
                });
            }
            if (
                question.tolerance !== null &&
                question.tolerance !== undefined &&
                question.tolerance < 0
            ) {
                errors.push({
                    field: "tolerance",
                    message: "Tolerance must be a non-negative number",
                });
            }
            break;
        }

        case "file_upload": {
            if (!question.acceptedTypes || question.acceptedTypes.length === 0) {
                errors.push({
                    field: "acceptedTypes",
                    message: "At least one accepted file type is required",
                });
            }
            if (!question.maxFileSizeMB || question.maxFileSizeMB < 1) {
                errors.push({
                    field: "maxFileSizeMB",
                    message: "Maximum file size must be at least 1 MB",
                });
            }
            break;
        }

        case "true_false": {
            // true_false only needs base text validation (already done above)
            // The 'correct' field is a boolean with a default value, so always valid
            break;
        }

        case "free_text": {
            // free_text only needs base text validation (already done above)
            // Optional fields (referenceAnswer, aiGradingEnabled) have valid defaults
            break;
        }
    }

    return errors;
}

// Helper to generate choice ID (Excel-style: a-z, aa-az, ba-bz, ...)
export function generateChoiceId(index: number): string {
    let result = "";
    let n = index;

    do {
        result = String.fromCharCode(97 + (n % 26)) + result;
        n = Math.floor(n / 26) - 1;
    } while (n >= 0);

    return result;
}

// Helper to add a choice
export function addChoice(choices: Choice[]): Choice[] {
    const newId = generateChoiceId(choices.length);
    return [...choices, { id: newId, text: "", correct: false }];
}

// Helper to remove a choice
export function removeChoice(choices: Choice[], index: number): Choice[] {
    const newChoices = choices.filter((_, i) => i !== index);
    // Reassign IDs
    return newChoices.map((c, i) => ({ ...c, id: generateChoiceId(i) }));
}

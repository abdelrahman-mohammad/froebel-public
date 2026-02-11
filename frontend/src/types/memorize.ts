/**
 * Memorize Mode Types
 * TypeScript definitions for memorize mode data structures
 */
import type { Question, QuestionResult, Quiz, UserAnswers } from "./quiz";

// View mode for flashcards
export type ViewMode = "all" | "one";

// Batch size options
export type BatchSize = 3 | 5 | 10 | 15 | "all";

// Shuffle mode options for chapter-aware shuffling
export type ShuffleMode =
    | "none" // No shuffling
    | "full" // Full random shuffle (ignores chapters)
    | "within-chapters" // Shuffle questions within each chapter
    | "chapters-only" // Shuffle chapter order, keep question order
    | "both"; // Shuffle both chapter order and questions within

// Memorize mode phases
export type MemorizePhase = "settings" | "memorizing" | "assessing" | "batch-results" | "summary";

// Options for memorize mode
export interface MemorizeOptions {
    batchSize: BatchSize | "chapters"; // "chapters" = one batch per chapter
    shuffleMode: ShuffleMode;
    shuffleChoices: boolean;
    selectedChapters?: string[]; // Optional: filter to specific chapter IDs
}

// Result for a single batch
export interface BatchResult {
    batchIndex: number;
    correctCount: number;
    totalQuestions: number;
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
    questionResults: QuestionResult[];
    chapterName?: string; // Optional: for chapter-based batching
}

// Cumulative results across all batches
export interface CumulativeResults {
    correctCount: number;
    totalQuestions: number;
    earnedPoints: number;
    totalPoints: number;
}

// Memorize mode state
export interface MemorizeState {
    phase: MemorizePhase;
    originalQuiz: Quiz | null;
    preparedQuiz: Quiz | null;
    batches: Question[][];
    batchChapterNames: (string | undefined)[]; // Chapter name for each batch (for chapter-based batching)
    currentBatchIndex: number;
    viewMode: ViewMode;
    singleCardIndex: number;
    batchResults: BatchResult[];
    cumulativeResults: CumulativeResults;
    assessmentAnswers: UserAnswers;
    options: MemorizeOptions;
}

// Actions for memorize reducer
export type MemorizeAction =
    | { type: "INIT"; payload: { quiz: Quiz; options: MemorizeOptions } }
    | { type: "SET_PHASE"; payload: MemorizePhase }
    | { type: "SET_VIEW_MODE"; payload: ViewMode }
    | { type: "SET_SINGLE_CARD_INDEX"; payload: number }
    | { type: "NAVIGATE_SINGLE_CARD"; payload: "prev" | "next" }
    | {
          type: "SELECT_ANSWER";
          payload: { questionId: string; answer: string | string[] | null };
      }
    | { type: "COMPLETE_ASSESSMENT"; payload: BatchResult }
    | { type: "RETRY_BATCH" }
    | { type: "CONTINUE_TO_NEXT_BATCH" }
    | { type: "FINISH" }
    | { type: "RESET" };

// Default options
export const defaultMemorizeOptions: MemorizeOptions = {
    batchSize: 10,
    shuffleMode: "none",
    shuffleChoices: false,
};

// Initial cumulative results
export const initialCumulativeResults: CumulativeResults = {
    correctCount: 0,
    totalQuestions: 0,
    earnedPoints: 0,
    totalPoints: 0,
};

// Initial memorize state
export const initialMemorizeState: MemorizeState = {
    phase: "settings",
    originalQuiz: null,
    preparedQuiz: null,
    batches: [],
    batchChapterNames: [],
    currentBatchIndex: 0,
    viewMode: "all",
    singleCardIndex: 0,
    batchResults: [],
    cumulativeResults: initialCumulativeResults,
    assessmentAnswers: {},
    options: defaultMemorizeOptions,
};

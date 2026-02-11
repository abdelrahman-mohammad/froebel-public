/**
 * Quiz Data Types
 * TypeScript definitions for quiz data structures
 */
import type { RichTextContent } from "./rich-text";

// Chapter structure for grouping questions
export interface Chapter {
    id: string;
    name: string;
}

// Question Types
export type QuestionType =
    | "multiple_choice"
    | "multiple_answer"
    | "true_false"
    | "fill_blank"
    | "dropdown"
    | "free_text"
    | "numeric"
    | "file_upload";

// Quiz lifecycle status
export type QuizStatus = "draft" | "published" | "archived";

// Tolerance options for numeric fill_blank questions
export type ToleranceType = "off" | "0.1" | "1";

// Choice for multiple choice/answer questions
export interface Choice {
    id: string; // a, b, c, d...
    text: RichTextContent;
    correct: boolean;
    hint?: RichTextContent; // Optional hint for this choice
}

// Base question properties
interface BaseQuestion {
    id: string; // q1, q2, q3...
    text: RichTextContent;
    points: number;
    chapter?: string; // Optional chapter ID
    identifier?: string; // Optional internal label for the question
    explanation?: string; // Explanation shown after answering
    hintCorrect?: RichTextContent; // Global hint shown when answer is correct
    hintWrong?: RichTextContent; // Global hint shown when answer is wrong
}

// Multiple choice question - single correct answer
export interface MultipleChoiceQuestion extends BaseQuestion {
    type: "multiple_choice";
    choices: Choice[];
}

// Multiple answer question - multiple correct answers
export interface MultipleAnswerQuestion extends BaseQuestion {
    type: "multiple_answer";
    choices: Choice[];
}

// True/False question
export interface TrueFalseQuestion extends BaseQuestion {
    type: "true_false";
    correct: boolean;
}

// Fill in the blank question
export interface FillBlankQuestion extends BaseQuestion {
    type: "fill_blank";
    answers: string[]; // Correct answers for each blank
    inline?: boolean; // Whether blanks are inline with text (default: true)
    numeric?: boolean; // Whether to use numeric input
    tolerance?: ToleranceType; // Tolerance for numeric comparison
    caseSensitive?: boolean; // Whether answer matching is case-sensitive (default: false)
}

// Dropdown question - inline dropdowns within question text
export interface DropdownQuestion extends BaseQuestion {
    type: "dropdown";
    choices: Choice[]; // Shared choices for all dropdowns
    answers: string[]; // Correct choice IDs for each dropdown
}

// Free text / essay question
export interface FreeTextQuestion extends BaseQuestion {
    type: "free_text";
    referenceAnswer?: RichTextContent; // Optional reference answer for string comparison
    aiGradingEnabled?: boolean; // Whether to use AI grading (default: false)
}

// Numeric question - number input with optional tolerance
export interface NumericQuestion extends BaseQuestion {
    type: "numeric";
    correctAnswer: number;
    tolerance?: number | null; // e.g., 0.1 means ±0.1 is accepted
    unit?: string; // Optional unit label (e.g., "kg", "m/s")
}

// File upload question
export interface FileUploadQuestion extends BaseQuestion {
    type: "file_upload";
    acceptedTypes: string[]; // MIME types or extensions (e.g., [".pdf", ".docx", "image/*"])
    maxFileSizeMB: number; // Maximum file size in MB
    referenceAnswer?: RichTextContent; // Optional reference/expected answer description
}

// Union type for all question types
export type Question =
    | MultipleChoiceQuestion
    | MultipleAnswerQuestion
    | TrueFalseQuestion
    | FillBlankQuestion
    | DropdownQuestion
    | FreeTextQuestion
    | NumericQuestion
    | FileUploadQuestion;

// Quiz settings for behavior and access control
export interface QuizSettings {
    // Options
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    showCorrectAnswers?: boolean;
    passingScore?: number;
    isPublic?: boolean;
    // Access control
    allowAnonymous?: boolean; // Allow anonymous quiz taking
    maxAttempts?: number | null; // Maximum attempts per user (null = unlimited)
    // Restrictions
    requireAccessCode?: boolean;
    accessCode?: string;
    filterIpAddresses?: boolean;
    allowedIpAddresses?: string; // Comma-separated or newline-separated IP addresses
    // Availability
    availableFrom?: string; // ISO date string
    availableTo?: string; // ISO date string
    resultsVisibleFrom?: string; // ISO date string - when results become visible
}

/**
 * Quiz data structure
 *
 * Type semantics for optional fields:
 * - `undefined` (via `?`): Field was not provided or is not applicable
 * - `null`: Field was explicitly set to "no value" / disabled
 * - `undefined | null`: Field may be unset OR explicitly disabled (e.g., timeLimit)
 */
export interface Quiz {
    id: string;
    shareableId?: string; // Short shareable identifier for URLs
    title: string;
    description?: string;
    /**
     * Time limit in minutes.
     * - `undefined`: Not set (inherits default behavior)
     * - `null`: Explicitly disabled (no timer)
     * - `number`: Time limit in minutes
     */
    timeLimit?: number | null;
    questions: Question[];
    chapters?: Chapter[]; // Optional chapters for grouping questions
    settings?: QuizSettings; // Quiz behavior settings
    _sourceUrl?: string; // Internal: tracks source URL for updates
    // Metadata
    tags?: string[]; // Tags for categorization and search
    category?: string; // Category name for display
    categoryId?: string; // Category ID for API
    courseId?: string; // Course ID for API
    iconUrl?: string; // Square icon image URL
    bannerUrl?: string; // Banner image URL (3:1 ratio)
    // AI Grading
    aiGradingEnabled?: boolean; // Quiz-level AI grading setting
    // Lifecycle status
    status?: QuizStatus; // Quiz status (draft, published, archived)
    // Optimistic locking version
    version?: number;
}

// User answer types
export type UserAnswer =
    | string // For multiple_choice (choice id), true_false ("true"/"false")
    | string[] // For multiple_answer (choice ids), fill_blank (answers), dropdown (choice ids)
    | null; // Unanswered

// User answers keyed by question ID
export type UserAnswers = Record<string, UserAnswer>;

// Individual blank result for fill_blank questions
export interface BlankResult {
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

// Result for a single question
export interface QuestionResult {
    questionId: string;
    questionText: string;
    type: QuestionType;
    userAnswer: UserAnswer;
    points: number;
    earnedPoints: number;
    isCorrect: boolean;
    correctAnswer?: string | string[] | boolean | number; // The correct answer(s)
    blankResults?: BlankResult[]; // For fill_blank questions
}

// Overall quiz score
export interface QuizScore {
    correctCount: number;
    totalQuestions: number;
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
    questionResults: QuestionResult[];
}

// Quiz preparation options
export interface QuizOptions {
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
}

// Quiz player state
export interface QuizPlayerState {
    quiz: Quiz | null;
    currentQuestionIndex: number;
    userAnswers: UserAnswers;
    flaggedQuestions: Set<string>;
    timeRemaining: number;
    isSubmitted: boolean;
    checkAnswerEnabled: boolean;
    checkedQuestions: Set<string>;
}

// Quiz player actions
export type QuizPlayerAction =
    | { type: "SET_QUIZ"; payload: Quiz }
    | { type: "SELECT_ANSWER"; questionId: string; answer: UserAnswer }
    | { type: "TOGGLE_FLAG"; questionId: string }
    | { type: "GO_TO_QUESTION"; index: number }
    | { type: "TICK_TIMER" }
    | { type: "SUBMIT_QUIZ" }
    | { type: "CHECK_ANSWER"; questionId: string }
    | { type: "RESET" };

// Raw quiz data from JSON (before normalization)
export interface RawQuizData {
    quiz?: RawQuiz;
    title?: string;
    description?: string;
    timeLimit?: number;
    questions?: RawQuestion[];
    chapters?: Chapter[];
}

export interface RawQuiz {
    id?: string;
    title: string;
    description?: string;
    timeLimit?: number;
    questions: RawQuestion[];
    chapters?: Chapter[];
}

export interface RawQuestion {
    id?: string;
    type?: QuestionType;
    text: string;
    points?: number;
    chapter?: string; // Optional chapter ID
    identifier?: string; // Optional internal label
    hintCorrect?: string; // Global hint for correct answer
    hintWrong?: string; // Global hint for wrong answer
    // For multiple choice/answer
    choices?: RawChoice[];
    // For true_false
    correct?: boolean;
    // For fill_blank
    answers?: string[];
    inline?: boolean;
    numeric?: boolean;
    tolerance?: ToleranceType;
    // For free_text
    referenceAnswer?: string;
    correct_answer?: string; // Legacy field from CanvasQuizReplay
    aiGradingEnabled?: boolean;
    // For numeric question type
    correctAnswer?: number;
    numericTolerance?: number | null; // Different from fill_blank tolerance
    unit?: string;
    // For file_upload
    acceptedTypes?: string[];
    maxFileSizeMB?: number;
}

export interface RawChoice {
    id?: string;
    text: string;
    correct?: boolean;
}

// Type guards
export function isMultipleChoiceQuestion(q: Question): q is MultipleChoiceQuestion {
    return q.type === "multiple_choice";
}

export function isMultipleAnswerQuestion(q: Question): q is MultipleAnswerQuestion {
    return q.type === "multiple_answer";
}

export function isTrueFalseQuestion(q: Question): q is TrueFalseQuestion {
    return q.type === "true_false";
}

export function isFillBlankQuestion(q: Question): q is FillBlankQuestion {
    return q.type === "fill_blank";
}

export function isDropdownQuestion(q: Question): q is DropdownQuestion {
    return q.type === "dropdown";
}

export function isFreeTextQuestion(q: Question): q is FreeTextQuestion {
    return q.type === "free_text";
}

export function isNumericQuestion(q: Question): q is NumericQuestion {
    return q.type === "numeric";
}

export function isFileUploadQuestion(q: Question): q is FileUploadQuestion {
    return q.type === "file_upload";
}

export function hasChoices(
    q: Question
): q is MultipleChoiceQuestion | MultipleAnswerQuestion | DropdownQuestion {
    return q.type === "multiple_choice" || q.type === "multiple_answer" || q.type === "dropdown";
}

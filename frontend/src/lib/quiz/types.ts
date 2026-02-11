/**
 * Quiz API Types
 * TypeScript definitions matching the Quiz API specification
 */

// ============================================
// Enums
// ============================================

/**
 * Question types supported by the API
 * Note: API uses UPPERCASE, local types use lowercase
 */
export type ApiQuestionType =
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_ANSWER"
    | "TRUE_FALSE"
    | "FILL_IN_BLANK"
    | "DROPDOWN"
    | "FREE_TEXT"
    | "NUMERIC"
    | "FILE_UPLOAD";

/**
 * Quiz lifecycle status
 */
export type ApiQuizStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

// ============================================
// Common Types
// ============================================

export interface ApiCategory {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    icon?: string | null;
    color?: string | null;
    sortOrder?: number;
    usageCount?: number;
    imageUrl?: string | null;
    isFeatured?: boolean;
    isActive?: boolean;
    children?: ApiCategory[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ApiChoice {
    id: string;
    text: string;
    correct?: boolean; // Only present in authenticated responses
}

// ============================================
// Question Data Structures (by type)
// ============================================

export interface MultipleChoiceData {
    choices: ApiChoice[];
}

export interface TrueFalseData {
    correct: boolean;
}

export interface FillInBlankData {
    answers: string[];
    caseSensitive?: boolean;
    inline?: boolean;
    numeric?: boolean;
    tolerance?: number | null;
}

export interface FreeTextData {
    referenceAnswer?: string;
    allowImage?: boolean;
    aiGradingEnabled?: boolean;
}

export interface NumericData {
    correctAnswer: number;
    tolerance?: number | null;
    unit?: string;
}

export interface FileUploadData {
    acceptedTypes: string[];
    maxFileSizeMB: number;
    referenceAnswer?: string;
}

// Union for all question data types
export type ApiQuestionData =
    | MultipleChoiceData
    | TrueFalseData
    | FillInBlankData
    | FreeTextData
    | NumericData
    | FileUploadData
    | Record<string, unknown>; // For public quiz (empty data)

// ============================================
// Question DTOs
// ============================================

export interface QuestionDTO {
    id: string;
    text: string;
    type: ApiQuestionType;
    points: number;
    questionOrder: number;
    data: ApiQuestionData;
    // Optional fields from backend response
    chapter?: string | null;
    explanation?: string | null;
    hintCorrect?: string | null;
    hintWrong?: string | null;
    identifier?: string | null;
    createdAt?: string;
}

export interface CreateQuestionRequest {
    text: string;
    type: ApiQuestionType;
    points: number;
    data: ApiQuestionData;
    chapter?: string | null;
    explanation?: string | null;
    hintCorrect?: string | null;
    hintWrong?: string | null;
    identifier?: string | null;
}

export interface UpdateQuestionRequest {
    text: string;
    type: ApiQuestionType;
    points: number;
    data: ApiQuestionData;
    chapter?: string | null;
    explanation?: string | null;
    hintCorrect?: string | null;
    hintWrong?: string | null;
    identifier?: string | null;
}

export interface ReorderQuestionsRequest {
    questionOrder: string[];
}

// ============================================
// Quiz DTOs
// ============================================

/**
 * Quiz summary for list views
 */
export interface QuizSummaryDTO {
    id: string;
    shareableId: string;
    title: string;
    description?: string;
    status: ApiQuizStatus;
    isPublic: boolean;
    questionCount: number;
    totalPoints: number;
    createdAt: string;
}

/**
 * Public quiz summary (for browse page)
 * Matches backend QuizSummaryResponse
 */
export interface PublicQuizSummaryDTO {
    id: string;
    shareableId: string;
    title: string;
    description?: string;
    creatorId?: string;
    creatorDisplayName?: string;
    courseId?: string | null;
    categoryId?: string | null;
    status?: ApiQuizStatus;
    isPublic?: boolean;
    allowAnonymous?: boolean;
    questionCount: number;
    totalPoints?: number;
    timeLimit?: number | null;
    passingScore?: number | null;
    maxAttempts?: number | null;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    // Scheduling fields
    availableFrom?: string | null;
    availableUntil?: string | null;
    resultsVisibleFrom?: string | null;
    availabilityStatus?: string;
    // Deprecated: use creatorDisplayName instead
    /** @deprecated Use creatorDisplayName instead */
    creatorName?: string;
    /** @deprecated Use categoryId instead */
    categoryName?: string;
}

/**
 * Full quiz details with questions
 */
export interface QuizDetailDTO {
    id: string;
    shareableId: string;
    title: string;
    description?: string;
    iconUrl?: string | null;
    bannerUrl?: string | null;
    timeLimit?: number | null;
    shuffleQuestions: boolean;
    shuffleChoices: boolean;
    showCorrectAnswers: boolean;
    isPublic: boolean;
    aiGradingEnabled?: boolean;
    status: ApiQuizStatus;
    passingScore: number;
    tags?: string[];
    categoryId?: string | null;
    courseId?: string | null;
    creatorId: string;
    creatorDisplayName?: string;
    questionCount: number;
    totalPoints: number;
    createdAt: string;
    updatedAt: string;
    questions?: QuestionDTO[];
    // Access control
    allowAnonymous: boolean;
    maxAttempts: number | null;
    // Scheduling fields
    availableFrom?: string;
    availableUntil?: string;
    resultsVisibleFrom?: string;
    availabilityStatus?: string;
    // Access restriction fields
    requireAccessCode?: boolean;
    accessCode?: string;
    filterIpAddresses?: boolean;
    allowedIpAddresses?: string;
    // Optimistic locking version
    version?: number;
    // Published version tracking
    publishedVersionNumber?: number | null;
    hasUnpublishedChanges?: boolean;
}

/**
 * Public quiz details (for taking - no correct answers)
 * Matches backend PublicQuizResponse
 */
export interface PublicQuizDetailDTO {
    id: string;
    shareableId: string;
    title: string;
    description?: string;
    creatorDisplayName?: string;
    timeLimit?: number | null;
    passingScore?: number | null;
    shuffleQuestions: boolean;
    shuffleChoices: boolean;
    maxAttempts?: number | null;
    allowAnonymous?: boolean;
    questionCount?: number;
    totalPoints: number;
    questions: QuestionDTO[];
    // Scheduling fields
    availableFrom?: string | null;
    availableUntil?: string | null;
    isCurrentlyAvailable?: boolean;
    availabilityStatus?: string;
}

// ============================================
// Create/Update Request DTOs
// ============================================

export interface CreateQuizRequest {
    title: string;
    description?: string;
    iconUrl?: string;
    bannerUrl?: string;
    courseId?: string;
    timeLimit?: number | null;
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    showCorrectAnswers?: boolean;
    isPublic?: boolean;
    aiGradingEnabled?: boolean;
    passingScore?: number;
    tagNames?: string[]; // Backend field name
    categoryId?: string;
    // Access control
    allowAnonymous?: boolean;
    maxAttempts?: number | null;
    // Scheduling fields
    availableFrom?: string;
    availableUntil?: string;
    resultsVisibleFrom?: string;
    // Access restriction fields
    requireAccessCode?: boolean;
    accessCode?: string;
    filterIpAddresses?: boolean;
    allowedIpAddresses?: string;
}

export interface UpdateQuizRequest {
    title: string;
    description?: string;
    iconUrl?: string;
    bannerUrl?: string;
    courseId?: string;
    timeLimit?: number | null;
    shuffleQuestions?: boolean;
    shuffleChoices?: boolean;
    showCorrectAnswers?: boolean;
    isPublic?: boolean;
    aiGradingEnabled?: boolean;
    passingScore?: number;
    tagNames?: string[]; // Backend field name
    categoryId?: string;
    // Access control
    allowAnonymous?: boolean;
    maxAttempts?: number | null;
    // Scheduling fields
    availableFrom?: string;
    availableUntil?: string;
    resultsVisibleFrom?: string;
    // Access restriction fields
    requireAccessCode?: boolean;
    accessCode?: string;
    filterIpAddresses?: boolean;
    allowedIpAddresses?: string;
    // Optimistic locking version
    version?: number;
}

// ============================================
// Quiz Attempt DTOs
// ============================================

export interface StartAttemptRequest {
    anonymousName?: string;
    anonymousEmail?: string;
    anonymousSessionId?: string;
    accessCode?: string;
}

export interface QuizAttemptDTO {
    id: string;
    quizId: string;
    quizTitle: string;
    startedAt: string;
    timeLimit?: number | null;
    expiresAt?: string;
}

// Answer data structure for different question types
export interface AnswerData {
    selectedChoices?: string[]; // For MULTIPLE_CHOICE, MULTIPLE_ANSWER, DROPDOWN
    booleanAnswer?: boolean; // For TRUE_FALSE
    textAnswers?: string[]; // For FILL_IN_BLANK
    textAnswer?: string; // For FREE_TEXT
    numericAnswer?: number; // For NUMERIC
    // Note: FILE_UPLOAD questions are handled separately via file upload endpoints
}

// Answer submission - wraps answer data with question ID
export interface SubmitAnswerDTO {
    questionId: string;
    answerData: AnswerData; // Backend requires this wrapper (non-null)
    timeTakenSeconds?: number;
}

export interface SubmitAttemptRequest {
    answers: SubmitAnswerDTO[];
}

// Result answer detail
export interface AnswerResultDTO {
    questionId: string;
    questionText: string;
    questionType: ApiQuestionType;
    pointsEarned: number;
    pointsPossible: number;
    correct: boolean;
    userAnswer: {
        selectedChoices?: string[];
        booleanAnswer?: boolean;
        textAnswers?: string[];
        textAnswer?: string;
    };
    correctAnswer?: {
        choices?: ApiChoice[];
        correct?: boolean;
        answers?: string[];
    };
}

export interface AttemptResultDTO {
    attemptId: string;
    quizId: string;
    quizTitle: string;
    score: number;
    totalPoints: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
    startedAt: string;
    completedAt: string;
    timeTaken: number; // in seconds
    answers?: AnswerResultDTO[]; // Only if showResults is true
}

// ============================================
// Import/Export DTOs
// ============================================

/**
 * Canvas-compatible export format
 */
export interface ExportQuizFormat {
    quiz: {
        title: string;
        description?: string;
        time_limit?: number | null;
        shuffle_answers?: boolean;
        show_correct_answers?: boolean;
        questions: ExportQuestionFormat[];
    };
}

export interface ExportQuestionFormat {
    question_name?: string;
    question_text: string;
    question_type: string; // Canvas type like 'multiple_choice_question'
    points_possible: number;
    answers: ExportAnswerFormat[];
}

export interface ExportAnswerFormat {
    text: string;
    weight: number; // 100 for correct, 0 for incorrect
}

// Import uses the same format as export
export type ImportQuizRequest = ExportQuizFormat;

// ============================================
// Pagination
// ============================================

export interface PageableInfo {
    pageNumber: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: PageableInfo;
    totalElements: number;
    totalPages: number;
}

// ============================================
// Error Response
// ============================================

export interface QuizApiErrorResponse {
    error: string;
    message: string;
    details?: Record<string, string>;
}

// ============================================
// Filter Types
// ============================================

export type SortOption = "newest" | "popular" | "updated";

export interface PublicQuizFilters {
    search?: string;
    categoryId?: string;
    tags?: string[];
    sortBy?: SortOption;
}

/**
 * AI Grading System Types
 * Supports multiple AI providers for grading free-text questions
 */

export type AIProvider = "gemini" | "deepseek" | "claude" | "openai";

export interface GradingRequest {
    /** The question text being asked */
    questionText: string;
    /** Optional reference answer for comparison */
    referenceAnswer?: string;
    /** The student's submitted answer */
    userAnswer: string;
    /** Maximum points possible for this question */
    points: number;
}

export interface GradingResponse {
    /** Whether the grading request was successful */
    success: boolean;
    /** Whether the answer is substantially correct */
    correct?: boolean;
    /** Normalized score from 0-1 (e.g., 0.75 = 75% credit) */
    score?: number;
    /** AI-generated feedback for the student */
    feedback?: string;
    /** Error message if grading failed */
    error?: string;
}

export interface ProviderConfig {
    /** API endpoint URL */
    endpoint: string;
    /** Model identifier */
    model: string;
    /** Whether this provider supports image inputs */
    supportsVision: boolean;
    /** Whether this provider supports structured JSON output */
    supportsStructuredOutput: boolean;
}

export interface RateLimitInfo {
    /** Whether a request can be made now */
    canRequest: boolean;
    /** Milliseconds until next available slot (0 if can request) */
    waitTime: number;
    /** Number of requests made in current window */
    requestCount: number;
}

/**
 * Internal response from AI providers before normalization
 */
export interface RawGradingResult {
    correct: boolean;
    score: number;
    feedback: string;
}

/**
 * Quiz API Client
 * Fetch wrappers for quiz endpoints
 * Uses HttpOnly cookies for authentication (set by backend)
 */
import type {
    ApiCategory,
    AttemptResultDTO,
    CreateQuestionRequest,
    CreateQuizRequest,
    ExportQuizFormat,
    ImportQuizRequest,
    PaginatedResponse,
    PublicQuizDetailDTO,
    PublicQuizFilters,
    PublicQuizSummaryDTO,
    QuestionDTO,
    QuizApiErrorResponse,
    QuizAttemptDTO,
    QuizDetailDTO,
    QuizSummaryDTO,
    ReorderQuestionsRequest,
    SubmitAttemptRequest,
    UpdateQuestionRequest,
    UpdateQuizRequest,
} from "./types";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Get CSRF token from cookie (XSRF-TOKEN)
 * Spring Security sets this cookie for CSRF protection
 */
function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Custom error class for Quiz API errors
 */
export class QuizApiError extends Error {
    constructor(
        public status: number,
        public errorResponse: QuizApiErrorResponse
    ) {
        super(errorResponse.message);
        this.name = "QuizApiError";
    }
}

/**
 * Helper to make authenticated requests
 * Uses HttpOnly cookies for authentication (sent automatically)
 * CSRF token is included in X-XSRF-TOKEN header for state-changing requests
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Include CSRF token for state-changing methods (POST, PUT, DELETE)
    const method = options.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            (headers as Record<string, string>)["X-XSRF-TOKEN"] = csrfToken;
        }
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies with requests
    });
}

/**
 * Helper to make unauthenticated (public) requests
 * Still includes credentials for CSRF cookie and potential authenticated users
 */
async function fetchPublic(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Include CSRF token for state-changing methods (POST, PUT, DELETE)
    const method = options.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            (headers as Record<string, string>)["X-XSRF-TOKEN"] = csrfToken;
        }
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies with requests
    });
}

/**
 * Helper to handle API response
 * Handles both JSON and non-JSON responses gracefully
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    // Check content-type to determine if response is JSON
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    let data: unknown;
    if (isJson) {
        try {
            data = await response.json();
        } catch {
            // JSON parsing failed despite content-type header
            throw new QuizApiError(response.status, {
                status: response.status,
                message: `Server returned invalid JSON (HTTP ${response.status})`,
                timestamp: new Date().toISOString(),
                path: "",
            });
        }
    } else {
        // Non-JSON response (likely HTML error page)
        const text = await response.text();
        if (!response.ok) {
            throw new QuizApiError(response.status, {
                status: response.status,
                message: `Server error (HTTP ${response.status})`,
                timestamp: new Date().toISOString(),
                path: "",
                details: text.length < 500 ? { body: text } : undefined,
            });
        }
        // For successful non-JSON responses, return as-is (rare case)
        return text as unknown as T;
    }

    if (!response.ok) {
        throw new QuizApiError(response.status, data as QuizApiErrorResponse);
    }

    return data as T;
}

/**
 * Get human-readable error message from API error
 */
export function getQuizErrorMessage(error: unknown): string {
    if (error instanceof QuizApiError) {
        if (error.status === 429) {
            return "Maximum attempt limit reached for this quiz. Please try again later.";
        }
        if (error.status === 401) {
            return "Please log in to continue.";
        }
        if (error.status === 403) {
            return "You don't have permission to access this quiz.";
        }
        if (error.status === 404) {
            return "Quiz not found.";
        }
        if (error.errorResponse.details) {
            const messages = Object.values(error.errorResponse.details);
            return messages.length > 0 ? messages[0] : error.message;
        }
        return error.message;
    }

    if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
            return "Unable to connect to server. Please check your connection.";
        }
        return error.message;
    }

    return "An unexpected error occurred";
}

// ============================================
// Quiz Management (Authenticated)
// ============================================

/**
 * List user's quizzes with pagination
 */
export async function getMyQuizzes(
    page = 0,
    size = 20,
    sort = "createdAt,desc"
): Promise<PaginatedResponse<QuizSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetchWithAuth(`/api/v1/quizzes?${params}`);
    return handleResponse<PaginatedResponse<QuizSummaryDTO>>(response);
}

/**
 * Get quiz details by ID
 */
export async function getQuizById(quizId: string): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}`);
    return handleResponse<QuizDetailDTO>(response);
}

/**
 * Create a new quiz
 */
export async function createQuiz(data: CreateQuizRequest): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth("/api/v1/quizzes", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<QuizDetailDTO>(response);
}

/**
 * Update an existing quiz
 */
export async function updateQuiz(quizId: string, data: UpdateQuizRequest): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<QuizDetailDTO>(response);
}

/**
 * Delete a quiz
 */
export async function deleteQuiz(quizId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}`, {
        method: "DELETE",
    });
    return handleResponse<void>(response);
}

/**
 * Publish or unpublish a quiz
 */
export async function setQuizPublished(quizId: string, published: boolean): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth(
        `/api/v1/quizzes/${quizId}/publish?published=${published}`,
        { method: "PATCH" }
    );
    return handleResponse<QuizDetailDTO>(response);
}

/**
 * Update the published version with current draft content.
 * Creates a new snapshot and updates the publishedVersionNumber pointer.
 * Use this when the quiz is already published and you want to push draft changes live.
 */
export async function updatePublishedVersion(quizId: string): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth(
        `/api/v1/quizzes/${quizId}/update-published`,
        { method: "PATCH" }
    );
    return handleResponse<QuizDetailDTO>(response);
}

// ============================================
// Question Management (Authenticated)
// ============================================

/**
 * Add a question to a quiz
 */
export async function addQuestion(
    quizId: string,
    data: CreateQuestionRequest
): Promise<QuestionDTO> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}/questions`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<QuestionDTO>(response);
}

/**
 * Update a question
 */
export async function updateQuestion(
    quizId: string,
    questionId: string,
    data: UpdateQuestionRequest
): Promise<QuestionDTO> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}/questions/${questionId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<QuestionDTO>(response);
}

/**
 * Delete a question
 */
export async function deleteQuestion(quizId: string, questionId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE",
    });
    return handleResponse<void>(response);
}

/**
 * Reorder questions in a quiz
 */
export async function reorderQuestions(
    quizId: string,
    questionOrder: string[]
): Promise<QuizDetailDTO> {
    const body: ReorderQuestionsRequest = { questionOrder };
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}/questions/reorder`, {
        method: "PATCH",
        body: JSON.stringify(body),
    });
    return handleResponse<QuizDetailDTO>(response);
}

// ============================================
// Import/Export (Authenticated)
// ============================================

/**
 * Export quiz as JSON (Canvas-compatible format)
 */
export async function exportQuiz(quizId: string): Promise<ExportQuizFormat> {
    const response = await fetchWithAuth(`/api/v1/quizzes/${quizId}/export`);
    return handleResponse<ExportQuizFormat>(response);
}

/**
 * Import quiz from JSON
 */
export async function importQuiz(data: ImportQuizRequest): Promise<QuizDetailDTO> {
    const response = await fetchWithAuth("/api/v1/quizzes/import", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<QuizDetailDTO>(response);
}

// ============================================
// Public Quiz Taking
// ============================================

/**
 * List public quizzes with pagination and filters
 */
export async function getPublicQuizzes(
    page = 0,
    size = 20,
    filters: PublicQuizFilters = {}
): Promise<PaginatedResponse<PublicQuizSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (filters.search) {
        params.set("search", filters.search);
    }
    if (filters.categoryId) {
        params.set("categoryId", filters.categoryId);
    }
    if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append("tags", tag));
    }
    if (filters.sortBy) {
        params.set("sortBy", filters.sortBy);
    }

    const response = await fetchPublic(`/api/v1/quizzes/public?${params}`);
    return handleResponse<PaginatedResponse<PublicQuizSummaryDTO>>(response);
}

/**
 * Get public quiz details for taking (without correct answers)
 */
export async function getPublicQuiz(quizId: string): Promise<PublicQuizDetailDTO> {
    const response = await fetchPublic(`/api/v1/quizzes/public/${quizId}`);
    return handleResponse<PublicQuizDetailDTO>(response);
}

/**
 * Start a quiz attempt
 */
export async function startAttempt(
    quizId: string,
    options?: {
        anonymousName?: string;
        anonymousEmail?: string;
        anonymousSessionId?: string;
        accessCode?: string;
    }
): Promise<QuizAttemptDTO> {
    const response = await fetchPublic(`/api/v1/quizzes/${quizId}/attempts`, {
        method: "POST",
        body: JSON.stringify(options ?? {}),
    });
    return handleResponse<QuizAttemptDTO>(response);
}

/**
 * Submit quiz answers
 */
export async function submitAttempt(
    quizId: string,
    attemptId: string,
    data: SubmitAttemptRequest
): Promise<AttemptResultDTO> {
    const response = await fetchPublic(`/api/v1/quizzes/${quizId}/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<AttemptResultDTO>(response);
}

/**
 * Get attempt results
 */
export async function getAttemptResult(
    quizId: string,
    attemptId: string
): Promise<AttemptResultDTO> {
    const response = await fetchPublic(`/api/v1/quizzes/${quizId}/attempts/${attemptId}`);
    return handleResponse<AttemptResultDTO>(response);
}

// ============================================
// Categories
// ============================================

/**
 * Fetch all categories as a tree structure
 */
export async function fetchCategories(): Promise<ApiCategory[]> {
    const response = await fetchWithAuth("/api/v1/categories");
    return handleResponse<ApiCategory[]>(response);
}

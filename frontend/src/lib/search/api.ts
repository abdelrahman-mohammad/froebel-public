/**
 * Search API Client
 * Fetch wrappers for search endpoints
 * Uses HttpOnly cookies for authentication (set by backend)
 */
import type {
    PaginatedResponse,
    SearchApiErrorResponse,
    SearchCourseItem,
    SearchQuizItem,
    SearchResultDTO,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Custom error class for Search API errors
 */
export class SearchApiError extends Error {
    constructor(
        public status: number,
        public errorResponse: SearchApiErrorResponse
    ) {
        super(errorResponse.message);
        this.name = "SearchApiError";
    }
}

/**
 * Helper to handle API responses
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorResponse: SearchApiErrorResponse;
        try {
            errorResponse = await response.json();
        } catch {
            errorResponse = {
                error: "UNKNOWN_ERROR",
                message: `Request failed with status ${response.status}`,
            };
        }
        throw new SearchApiError(response.status, errorResponse);
    }
    return response.json();
}

/**
 * Quick search for header dropdown preview
 * GET /api/v1/search?q=query&limit=5
 */
export async function quickSearch(query: string, limit = 5): Promise<SearchResultDTO> {
    const params = new URLSearchParams({
        q: query,
        limit: limit.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/api/v1/search?${params}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies for optional authentication
    });
    return handleResponse<SearchResultDTO>(response);
}

/**
 * Full paginated quiz search
 * GET /api/v1/search/quizzes?q=query&page=0&size=12
 */
export async function searchQuizzes(
    query: string,
    page = 0,
    size = 12
): Promise<PaginatedResponse<SearchQuizItem>> {
    const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        size: size.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/api/v1/search/quizzes?${params}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies for optional authentication
    });
    return handleResponse<PaginatedResponse<SearchQuizItem>>(response);
}

/**
 * Full paginated course search
 * GET /api/v1/search/courses?q=query&page=0&size=12
 */
export async function searchCourses(
    query: string,
    page = 0,
    size = 12
): Promise<PaginatedResponse<SearchCourseItem>> {
    const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        size: size.toString(),
    });
    const response = await fetch(`${API_BASE_URL}/api/v1/search/courses?${params}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send cookies for optional authentication
    });
    return handleResponse<PaginatedResponse<SearchCourseItem>>(response);
}

/**
 * Get user-friendly error message from search error
 */
export function getSearchErrorMessage(error: unknown): string {
    if (error instanceof SearchApiError) {
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

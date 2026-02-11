/**
 * Profile API client
 * Fetch wrappers for profile endpoints
 * Uses HttpOnly cookies for authentication (set by backend)
 */
import type {
    ProfileApiErrorResponse,
    ProfileResponse,
    PublicProfileResponse,
    UpdatePrivacyRequest,
    UpdateProfileRequest,
} from "./types";

// API base URL - uses environment variable or defaults to localhost
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
 * Custom error class for Profile API errors
 */
export class ProfileApiError extends Error {
    constructor(
        public status: number,
        public errorResponse: ProfileApiErrorResponse
    ) {
        super(errorResponse.message);
        this.name = "ProfileApiError";
    }
}

/**
 * Helper to make authenticated requests
 * Handles both JSON and FormData requests
 * Uses HttpOnly cookies for authentication (sent automatically)
 * CSRF token is included in X-XSRF-TOKEN header for state-changing requests
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
        (headers as Record<string, string>)["Content-Type"] = "application/json";
    }

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
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new ProfileApiError(response.status, data as ProfileApiErrorResponse);
    }

    return data as T;
}

/**
 * Get human-readable error message from API error
 */
export function getProfileErrorMessage(error: unknown): string {
    if (error instanceof ProfileApiError) {
        if (error.status === 413) {
            return "File is too large. Maximum size is 5MB.";
        }
        if (error.status === 415) {
            return "Invalid file type. Please use JPEG, PNG, WebP, or GIF.";
        }
        // Handle validation errors with details
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
// Profile Management (Authenticated)
// ============================================

/**
 * Get current user's profile
 */
export async function getMyProfile(): Promise<ProfileResponse> {
    const response = await fetchWithAuth("/api/v1/profile/me");
    return handleResponse<ProfileResponse>(response);
}

/**
 * Update current user's profile
 */
export async function updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    const response = await fetchWithAuth("/api/v1/profile/me", {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<ProfileResponse>(response);
}

/**
 * Update privacy settings
 */
export async function updatePrivacy(data: UpdatePrivacyRequest): Promise<ProfileResponse> {
    const response = await fetchWithAuth("/api/v1/profile/me/privacy", {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<ProfileResponse>(response);
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<ProfileResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithAuth("/api/v1/profile/me/avatar", {
        method: "POST",
        body: formData,
    });
    return handleResponse<ProfileResponse>(response);
}

/**
 * Delete avatar image
 */
export async function deleteAvatar(): Promise<ProfileResponse> {
    const response = await fetchWithAuth("/api/v1/profile/me/avatar", {
        method: "DELETE",
    });
    return handleResponse<ProfileResponse>(response);
}

// ============================================
// Public Profile (No Auth)
// ============================================

/**
 * Get public profile by user ID
 */
export async function getPublicProfile(userId: string): Promise<PublicProfileResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/profile/public/${userId}`);
    return handleResponse<PublicProfileResponse>(response);
}

// ============================================
// Helpers
// ============================================

/**
 * Get full avatar URL from relative path
 */
export function getAvatarUrl(avatarPath: string | null): string | null {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${API_BASE_URL}${avatarPath}`;
}

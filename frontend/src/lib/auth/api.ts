/**
 * Auth API client
 * Fetch wrappers for authentication endpoints
 * Uses HttpOnly cookies for token storage (set by backend)
 */
import type {
    ApiErrorResponse,
    AuthResponse,
    LoginRequest,
    MessageResponse,
    OAuthProvider,
    RegisterRequest,
    TokenResponse,
    User,
} from "@/types/auth";

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
 * Custom error class for API errors
 */
export class AuthApiError extends Error {
    constructor(
        public status: number,
        public errorResponse: ApiErrorResponse
    ) {
        super(errorResponse.message);
        this.name = "AuthApiError";
    }
}

/**
 * Helper to make API requests with credentials (cookies)
 * Tokens are automatically sent via HttpOnly cookies
 * CSRF token is included in X-XSRF-TOKEN header for state-changing requests
 */
async function fetchWithCredentials(url: string, options: RequestInit = {}): Promise<Response> {
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
 */
async function handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json();

    if (!response.ok) {
        throw new AuthApiError(response.status, data as ApiErrorResponse);
    }

    return data as T;
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials),
    });

    return handleResponse<AuthResponse>(response);
}

/**
 * Register a new account
 * Returns a message response - user must verify email before logging in
 */
export async function register(data: RegisterRequest): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Refresh the access token using refresh token (from HttpOnly cookie)
 */
export async function refreshToken(): Promise<TokenResponse> {
    // Refresh token is automatically sent via HttpOnly cookie
    const response = await fetchWithCredentials("/api/v1/auth/refresh", {
        method: "POST",
    });

    return handleResponse<TokenResponse>(response);
}

/**
 * Logout - invalidates all refresh tokens for the user
 */
export async function logout(): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/logout", {
        method: "POST",
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Get current user profile
 */
export async function getMe(): Promise<User> {
    const response = await fetchWithCredentials("/api/v1/auth/me");
    return handleResponse<User>(response);
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, newPassword: string): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Change password (requires authentication)
 */
export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/change-password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Verify email with token (POST for security - token in body, not URL)
 */
export async function verifyEmail(token: string): Promise<MessageResponse> {
    const response = await fetchWithCredentials("/api/v1/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ token }),
    });

    return handleResponse<MessageResponse>(response);
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<MessageResponse> {
    const response = await fetchWithCredentials(
        `/api/v1/auth/resend-verification?email=${encodeURIComponent(email)}`,
        { method: "POST" }
    );

    return handleResponse<MessageResponse>(response);
}

/**
 * Get OAuth URL for a provider
 * Opens this URL to start OAuth flow
 */
export function getOAuthUrl(provider: OAuthProvider): string {
    return `${API_BASE_URL}/api/v1/auth/oauth2/${provider}`;
}

/**
 * Get human-readable error message from API error
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof AuthApiError) {
        // Handle validation errors with details
        if ("details" in error.errorResponse) {
            const details = error.errorResponse.details;
            const messages = Object.values(details);
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

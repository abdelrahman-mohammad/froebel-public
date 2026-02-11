/**
 * Authentication types for Froebel
 * Based on AUTH_API.md specification
 */

// User roles (USER is default, ADMIN is for system administrators)
export type UserRole = "USER" | "ADMIN";

// OAuth providers
export type OAuthProvider = "google" | "github" | "microsoft";

// User object returned from API
export interface User {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    avatarUrl: string | null;
    emailVerified: boolean;
}

// Auth response with tokens (login, register, refresh)
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number; // seconds
    user?: User;
}

// Token-only response (for refresh endpoint)
export interface TokenResponse {
    accessToken: string;
    refreshToken: string;
    tokenType: "Bearer";
    expiresIn: number;
}

// Login request
export interface LoginRequest {
    email: string;
    password: string;
}

// Register request
export interface RegisterRequest {
    email: string;
    password: string;
    displayName: string;
}

// Refresh token request
export interface RefreshTokenRequest {
    refreshToken: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
    email: string;
}

// Reset password request
export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

// Change password request (authenticated)
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

// Generic message response
export interface MessageResponse {
    message: string;
}

// Validation error response (400)
export interface ValidationErrorResponse {
    error: "Bad Request";
    message: "Validation failed";
    details: Record<string, string>;
}

// Auth error response (401, 403, 404, 409)
export interface AuthErrorResponse {
    error: string;
    message: string;
}

// Union of all error responses
export type ApiErrorResponse = ValidationErrorResponse | AuthErrorResponse;

// OAuth callback result (parsed from URL fragment)
export interface OAuthCallbackResult {
    accessToken: string | null;
    refreshToken: string | null;
    expiresIn: number | null;
    tokenType: string | null;
    error: string | null;
}

// Auth state for context
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

/**
 * Auth state utilities
 * With HttpOnly cookies, tokens are managed by the browser automatically.
 * This module now only handles legacy cleanup and migration.
 */

const LEGACY_STORAGE_KEYS = {
    ACCESS_TOKEN: "froebel_access_token",
    REFRESH_TOKEN: "froebel_refresh_token",
    TOKEN_EXPIRY: "froebel_token_expiry",
} as const;

/**
 * Clear any legacy tokens from localStorage (migration cleanup)
 * Called on logout and initialization to ensure clean state
 */
export function clearLegacyTokens(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(LEGACY_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LEGACY_STORAGE_KEYS.TOKEN_EXPIRY);
}

/**
 * Check if there are any legacy tokens that need migration
 */
export function hasLegacyTokens(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(LEGACY_STORAGE_KEYS.ACCESS_TOKEN);
}

// Legacy exports for backward compatibility during migration
// These are now no-ops or return false since tokens are in HttpOnly cookies

/** @deprecated Tokens are now in HttpOnly cookies */
export function saveTokens(): void {
    // No-op: tokens are set via HttpOnly cookies by the backend
}

/** @deprecated Tokens are now in HttpOnly cookies */
export function getAccessToken(): string | null {
    return null;
}

/** @deprecated Tokens are now in HttpOnly cookies */
export function getRefreshToken(): string | null {
    return null;
}

/** @deprecated Tokens are now in HttpOnly cookies */
export function getTokenExpiry(): number | null {
    return null;
}

/** @deprecated Use clearLegacyTokens instead */
export function clearTokens(): void {
    clearLegacyTokens();
}

/** @deprecated Auth state now determined by API calls */
export function hasValidToken(): boolean {
    return false;
}

/** @deprecated Auth state now determined by API calls */
export function isTokenExpired(): boolean {
    return true;
}

/** @deprecated Tokens are now in HttpOnly cookies */
export function hasRefreshToken(): boolean {
    return false;
}

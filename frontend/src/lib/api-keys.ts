/**
 * API Key Management
 * Handles storing and retrieving user-provided API keys from localStorage
 */
import type { AIProvider } from "./ai-grading/types";

const STORAGE_PREFIX = "froebel_api_key_";

/**
 * Get a stored API key for a provider
 */
export function getStoredApiKey(provider: AIProvider): string | null {
    if (typeof window === "undefined") return null;

    try {
        const key = localStorage.getItem(`${STORAGE_PREFIX}${provider}`);
        return key || null;
    } catch {
        return null;
    }
}

/**
 * Store an API key for a provider
 */
export function setStoredApiKey(provider: AIProvider, key: string): void {
    if (typeof window === "undefined") return;

    try {
        if (key.trim()) {
            localStorage.setItem(`${STORAGE_PREFIX}${provider}`, key.trim());
        } else {
            localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
        }
    } catch (error) {
        console.error("Failed to store API key:", error);
    }
}

/**
 * Remove a stored API key for a provider
 */
export function removeStoredApiKey(provider: AIProvider): void {
    if (typeof window === "undefined") return;

    try {
        localStorage.removeItem(`${STORAGE_PREFIX}${provider}`);
    } catch (error) {
        console.error("Failed to remove API key:", error);
    }
}

/**
 * Get all providers that have stored keys
 */
export function getStoredProviders(): AIProvider[] {
    if (typeof window === "undefined") return [];

    const providers: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
    const stored: AIProvider[] = [];

    for (const provider of providers) {
        if (getStoredApiKey(provider)) {
            stored.push(provider);
        }
    }

    return stored;
}

/**
 * Check if any API key is stored
 */
export function hasAnyStoredKey(): boolean {
    return getStoredProviders().length > 0;
}

/**
 * Clear all stored API keys
 */
export function clearAllStoredKeys(): void {
    const providers: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
    for (const provider of providers) {
        removeStoredApiKey(provider);
    }
}

/**
 * Get the preferred provider (first one with a stored key)
 */
export function getPreferredProvider(): AIProvider | null {
    const stored = getStoredProviders();
    return stored.length > 0 ? stored[0] : null;
}

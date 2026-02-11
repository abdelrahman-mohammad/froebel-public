/**
 * Client-side helper for AI Grading
 * Provides functions to call the AI grading API route from the browser
 */
import { getStoredApiKey } from "@/lib/api-keys";

import type { AIProvider, GradingRequest, GradingResponse, RateLimitInfo } from "./types";

export interface GradingApiRequest extends GradingRequest {
    provider: AIProvider;
    apiKey?: string;
}

export interface RateLimitApiResponse extends RateLimitInfo {
    provider: AIProvider;
    hasApiKey: boolean;
}

export interface GradingResponseWithKeyStatus extends GradingResponse {
    needsApiKey?: boolean;
}

/**
 * Request AI grading for an answer
 * Automatically includes user's stored API key if available
 */
export async function requestAIGrading(
    provider: AIProvider,
    request: GradingRequest
): Promise<GradingResponseWithKeyStatus> {
    try {
        // Get user's stored API key if available
        const storedKey = getStoredApiKey(provider);

        const response = await fetch("/api/ai/grade", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                provider,
                ...request,
                ...(storedKey && { apiKey: storedKey }),
            }),
        });

        const data = await response.json();

        // Handle rate limiting
        if (response.status === 429) {
            return {
                success: false,
                error: `Rate limited. Try again in ${Math.ceil((data.waitTime || 60000) / 1000)} seconds.`,
            };
        }

        return data;
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Network error",
        };
    }
}

/**
 * Check rate limit status for a provider
 */
export async function checkRateLimit(provider: AIProvider): Promise<RateLimitApiResponse | null> {
    try {
        const response = await fetch(`/api/ai/grade?provider=${provider}`);
        if (!response.ok) {
            return null;
        }
        return response.json();
    } catch {
        return null;
    }
}

/**
 * Check if a provider is configured (has API key - either stored locally or on server)
 */
export async function isProviderConfigured(provider: AIProvider): Promise<boolean> {
    // Check for locally stored key first
    const storedKey = getStoredApiKey(provider);
    if (storedKey) {
        return true;
    }

    // Fall back to checking server-side key
    const status = await checkRateLimit(provider);
    return status?.hasApiKey ?? false;
}

/**
 * Get all configured providers
 */
export async function getConfiguredProviders(): Promise<AIProvider[]> {
    const providers: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
    const configured: AIProvider[] = [];

    // Check all providers in parallel
    const results = await Promise.all(
        providers.map(async (provider) => {
            const isConfigured = await isProviderConfigured(provider);
            return { provider, isConfigured };
        })
    );

    for (const { provider, isConfigured } of results) {
        if (isConfigured) {
            configured.push(provider);
        }
    }

    return configured;
}

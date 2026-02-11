/**
 * AI Grading Module
 * Exports all public types and functions
 */

// Types
export type {
    AIProvider,
    GradingRequest,
    GradingResponse,
    ProviderConfig,
    RateLimitInfo,
} from "./types";

// Provider configuration
export { PROVIDERS, API_KEY_ENV_VARS } from "./providers";

// Client-side functions (for use in React components)
export {
    requestAIGrading,
    checkRateLimit,
    isProviderConfigured,
    getConfiguredProviders,
} from "./client";

// Re-export client types
export type { GradingApiRequest, RateLimitApiResponse } from "./client";

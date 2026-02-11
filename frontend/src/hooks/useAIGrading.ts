/**
 * React Hook for AI Grading
 * Provides state management for AI grading operations
 */

"use client";

import { useCallback, useEffect, useState } from "react";

import { checkRateLimit, getConfiguredProviders, requestAIGrading } from "@/lib/ai-grading/client";
import type {
    AIProvider,
    GradingRequest,
    GradingResponse,
    RateLimitInfo,
} from "@/lib/ai-grading/types";

export interface UseAIGradingOptions {
    /** Default provider to use */
    defaultProvider?: AIProvider;
    /** Callback when grading completes */
    onGradingComplete?: (response: GradingResponse) => void;
    /** Callback when grading fails */
    onGradingError?: (error: string) => void;
}

export interface UseAIGradingReturn {
    /** Whether a grading request is in progress */
    isGrading: boolean;
    /** The most recent grading result */
    result: GradingResponse | null;
    /** Current provider */
    provider: AIProvider;
    /** Set the current provider */
    setProvider: (provider: AIProvider) => void;
    /** Rate limit info for current provider */
    rateLimitInfo: RateLimitInfo | null;
    /** List of configured providers */
    configuredProviders: AIProvider[];
    /** Grade an answer */
    grade: (request: GradingRequest) => Promise<GradingResponse>;
    /** Clear the current result */
    clearResult: () => void;
    /** Refresh rate limit info */
    refreshRateLimitInfo: () => Promise<void>;
}

export function useAIGrading(options: UseAIGradingOptions = {}): UseAIGradingReturn {
    const { defaultProvider = "gemini", onGradingComplete, onGradingError } = options;

    const [isGrading, setIsGrading] = useState(false);
    const [result, setResult] = useState<GradingResponse | null>(null);
    const [provider, setProvider] = useState<AIProvider>(defaultProvider);
    const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
    const [configuredProviders, setConfiguredProviders] = useState<AIProvider[]>([]);

    // Load configured providers on mount
    useEffect(() => {
        getConfiguredProviders().then(setConfiguredProviders);
    }, []);

    // Refresh rate limit info when provider changes
    const refreshRateLimitInfo = useCallback(async () => {
        const info = await checkRateLimit(provider);
        if (info) {
            setRateLimitInfo({
                canRequest: info.canRequest,
                waitTime: info.waitTime,
                requestCount: info.requestCount,
            });
        }
    }, [provider]);

    useEffect(() => {
        refreshRateLimitInfo();
    }, [refreshRateLimitInfo]);

    // Grade an answer
    const grade = useCallback(
        async (request: GradingRequest): Promise<GradingResponse> => {
            setIsGrading(true);
            setResult(null);

            try {
                const response = await requestAIGrading(provider, request);
                setResult(response);

                if (response.success) {
                    onGradingComplete?.(response);
                } else if (response.error) {
                    onGradingError?.(response.error);
                }

                // Refresh rate limit info after request
                refreshRateLimitInfo();

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                const errorResponse: GradingResponse = {
                    success: false,
                    error: errorMessage,
                };
                setResult(errorResponse);
                onGradingError?.(errorMessage);
                return errorResponse;
            } finally {
                setIsGrading(false);
            }
        },
        [provider, onGradingComplete, onGradingError, refreshRateLimitInfo]
    );

    // Clear the current result
    const clearResult = useCallback(() => {
        setResult(null);
    }, []);

    return {
        isGrading,
        result,
        provider,
        setProvider,
        rateLimitInfo,
        configuredProviders,
        grade,
        clearResult,
        refreshRateLimitInfo,
    };
}

export default useAIGrading;

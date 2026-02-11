/**
 * AI Grading API Route
 * POST /api/ai/grade
 *
 * Handles AI grading requests with rate limiting and provider abstraction.
 * Supports both server-side environment variable keys and user-provided keys.
 * User-provided keys take priority over server-side keys.
 */
import { NextRequest, NextResponse } from "next/server";

import { gradeAnswer } from "@/lib/ai-grading/grading";
import { API_KEY_ENV_VARS } from "@/lib/ai-grading/providers";
import { rateLimiter } from "@/lib/ai-grading/rate-limiter";
import type { AIProvider, GradingRequest } from "@/lib/ai-grading/types";

/**
 * Get API key for a provider from environment variables
 */
function getApiKeyForProvider(provider: AIProvider): string | undefined {
    const envVar = API_KEY_ENV_VARS[provider];
    return process.env[envVar];
}

/**
 * Validate the grading request body
 */
function validateRequest(body: unknown): {
    valid: boolean;
    error?: string;
    data?: { provider: AIProvider; userApiKey?: string } & GradingRequest;
} {
    if (!body || typeof body !== "object") {
        return { valid: false, error: "Request body is required" };
    }

    const { provider, questionText, userAnswer, points, referenceAnswer, apiKey } = body as Record<
        string,
        unknown
    >;

    // Validate provider
    const validProviders: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
    if (!provider || !validProviders.includes(provider as AIProvider)) {
        return {
            valid: false,
            error: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
        };
    }

    // Validate required fields
    if (!questionText || typeof questionText !== "string") {
        return {
            valid: false,
            error: "questionText is required and must be a string",
        };
    }

    if (!userAnswer || typeof userAnswer !== "string") {
        return {
            valid: false,
            error: "userAnswer is required and must be a string",
        };
    }

    if (typeof points !== "number" || points <= 0) {
        return {
            valid: false,
            error: "points is required and must be a positive number",
        };
    }

    // Validate optional fields
    if (referenceAnswer !== undefined && typeof referenceAnswer !== "string") {
        return {
            valid: false,
            error: "referenceAnswer must be a string if provided",
        };
    }

    if (apiKey !== undefined && typeof apiKey !== "string") {
        return { valid: false, error: "apiKey must be a string if provided" };
    }

    return {
        valid: true,
        data: {
            provider: provider as AIProvider,
            questionText: questionText as string,
            userAnswer: userAnswer as string,
            points: points as number,
            referenceAnswer: referenceAnswer as string | undefined,
            userApiKey: apiKey as string | undefined,
        },
    };
}

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();

        // Validate request
        const validation = validateRequest(body);
        if (!validation.valid || !validation.data) {
            return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
        }

        const { provider, userApiKey, ...gradingRequest } = validation.data;

        // Get API key - user-provided key takes priority over server key
        const apiKey = userApiKey || getApiKeyForProvider(provider);
        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: `API key not configured for ${provider}. Please provide an API key or set ${API_KEY_ENV_VARS[provider]} environment variable.`,
                    needsApiKey: true,
                },
                { status: 400 }
            );
        }

        // Check rate limit
        const rateLimitInfo = rateLimiter.getRateLimitInfo(provider);
        if (!rateLimitInfo.canRequest) {
            return NextResponse.json(
                {
                    success: false,
                    error: "RATE_LIMITED",
                    waitTime: rateLimitInfo.waitTime,
                    message: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitInfo.waitTime / 1000)} seconds.`,
                },
                { status: 429 }
            );
        }

        // Record the request before making it
        rateLimiter.recordRequest(provider);

        // Grade the answer
        const result = await gradeAnswer(provider, apiKey, gradingRequest);

        // Return appropriate status based on result
        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }
    } catch (error) {
        console.error("AI Grading API error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

/**
 * GET handler for checking rate limit status
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const provider = searchParams.get("provider") as AIProvider | null;

    if (!provider) {
        return NextResponse.json(
            { error: "provider query parameter is required" },
            { status: 400 }
        );
    }

    const validProviders: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
    if (!validProviders.includes(provider)) {
        return NextResponse.json(
            {
                error: `Invalid provider. Must be one of: ${validProviders.join(", ")}`,
            },
            { status: 400 }
        );
    }

    const rateLimitInfo = rateLimiter.getRateLimitInfo(provider);
    const hasApiKey = !!getApiKeyForProvider(provider);

    return NextResponse.json({
        provider,
        hasApiKey,
        ...rateLimitInfo,
    });
}

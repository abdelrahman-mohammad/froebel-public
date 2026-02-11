/**
 * API Key Validation Route
 * POST /api/ai/test-key
 *
 * Tests if a provided API key is valid by making a minimal API call
 */
import { NextRequest, NextResponse } from "next/server";

import { PROVIDERS } from "@/lib/ai-grading/providers";
import type { AIProvider } from "@/lib/ai-grading/types";

/**
 * Test Gemini API key
 */
async function testGeminiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
            { method: "GET" }
        );

        if (response.ok) {
            return { success: true };
        }

        const data = await response.json();
        return {
            success: false,
            error: data.error?.message || `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

/**
 * Test DeepSeek API key
 */
async function testDeepSeekKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch("https://api.deepseek.com/models", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (response.ok) {
            return { success: true };
        }

        const data = await response.json();
        return {
            success: false,
            error: data.error?.message || `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

/**
 * Test Claude API key
 */
async function testClaudeKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Claude doesn't have a simple models endpoint, so we make a minimal completion request
        const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
            },
            body: JSON.stringify({
                model: PROVIDERS.claude.model,
                max_tokens: 1,
                messages: [{ role: "user", content: "Hi" }],
            }),
        });

        if (response.ok) {
            return { success: true };
        }

        const data = await response.json();
        return {
            success: false,
            error: data.error?.message || `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

/**
 * Test OpenAI API key
 */
async function testOpenAIKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    try {
        const response = await fetch("https://api.openai.com/v1/models", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (response.ok) {
            return { success: true };
        }

        const data = await response.json();
        return {
            success: false,
            error: data.error?.message || `HTTP ${response.status}`,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : "Connection failed",
        };
    }
}

/**
 * Test an API key for a given provider
 */
async function testApiKey(
    provider: AIProvider,
    apiKey: string
): Promise<{ success: boolean; error?: string }> {
    switch (provider) {
        case "gemini":
            return testGeminiKey(apiKey);
        case "deepseek":
            return testDeepSeekKey(apiKey);
        case "claude":
            return testClaudeKey(apiKey);
        case "openai":
            return testOpenAIKey(apiKey);
        default:
            return { success: false, error: "Unknown provider" };
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { provider, apiKey } = body;

        // Validate input
        const validProviders: AIProvider[] = ["gemini", "deepseek", "claude", "openai"];
        if (!provider || !validProviders.includes(provider)) {
            return NextResponse.json(
                { success: false, error: "Invalid provider" },
                { status: 400 }
            );
        }

        if (!apiKey || typeof apiKey !== "string") {
            return NextResponse.json(
                { success: false, error: "API key is required" },
                { status: 400 }
            );
        }

        // Test the key
        const result = await testApiKey(provider, apiKey.trim());

        return NextResponse.json(result);
    } catch (error) {
        console.error("Test key error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

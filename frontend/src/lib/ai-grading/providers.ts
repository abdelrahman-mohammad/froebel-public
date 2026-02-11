/**
 * AI Provider Configurations
 * Contains endpoints, models, and capabilities for each supported provider
 */
import type { AIProvider, ProviderConfig } from "./types";

export const PROVIDERS: Record<AIProvider, ProviderConfig> = {
    gemini: {
        endpoint:
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        model: "gemini-2.5-flash",
        supportsVision: true,
        supportsStructuredOutput: true,
    },
    deepseek: {
        endpoint: "https://api.deepseek.com/chat/completions",
        model: "deepseek-chat",
        supportsVision: false,
        supportsStructuredOutput: false,
    },
    claude: {
        endpoint: "https://api.anthropic.com/v1/messages",
        model: "claude-sonnet-4-20250514",
        supportsVision: true,
        supportsStructuredOutput: false,
    },
    openai: {
        endpoint: "https://api.openai.com/v1/chat/completions",
        model: "gpt-4o-mini",
        supportsVision: true,
        supportsStructuredOutput: false,
    },
};

/**
 * Schema for structured JSON output (used by Gemini)
 */
export const GRADING_SCHEMA = {
    type: "object",
    properties: {
        correct: { type: "boolean" },
        score: { type: "integer" },
        feedback: { type: "string" },
    },
    required: ["correct", "score", "feedback"],
} as const;

/**
 * Environment variable names for each provider's API key
 */
export const API_KEY_ENV_VARS: Record<AIProvider, string> = {
    gemini: "GEMINI_API_KEY",
    deepseek: "DEEPSEEK_API_KEY",
    claude: "CLAUDE_API_KEY",
    openai: "OPENAI_API_KEY",
};

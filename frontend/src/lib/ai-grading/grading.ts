/**
 * AI Grading Logic
 * Handles grading requests to multiple AI providers with response parsing
 */
import { GRADING_SCHEMA, PROVIDERS } from "./providers";
import type { AIProvider, GradingRequest, GradingResponse, RawGradingResult } from "./types";

/**
 * Build the grading prompt for AI providers
 */
export function buildGradingPrompt(request: GradingRequest): string {
    const { questionText, referenceAnswer, userAnswer, points } = request;

    let prompt = `You are grading a student's answer to a quiz question. Be fair but accurate.

Question: ${questionText}
Points possible: ${points}`;

    if (referenceAnswer) {
        prompt += `\nExpected Answer: ${referenceAnswer}`;
    }

    prompt += `
Student's Answer: ${userAnswer}

Evaluate the student's answer and respond ONLY with valid JSON:
{"correct": true, "score": ${points}, "feedback": "Your feedback here"}

Rules:
- "correct": true if substantially correct, false otherwise
- "score": Integer 0 to ${points}
- "feedback": Max 2 sentences, under 100 words

IMPORTANT: Respond with ONLY raw JSON. No markdown, no code fences.`;

    return prompt;
}

/**
 * Parse AI response with multi-tier fallback
 */
export function parseGradingResponse(response: string, points: number): RawGradingResult {
    // 1. Try markdown code block extraction
    const codeBlockMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
        try {
            return processRawJson(JSON.parse(codeBlockMatch[1]), points);
        } catch {
            // Continue to next parsing strategy
        }
    }

    // 2. Try direct JSON parse
    try {
        return processRawJson(JSON.parse(response.trim()), points);
    } catch {
        // Continue to next parsing strategy
    }

    // 3. Try balanced brace extraction
    const jsonStr = extractBalancedJson(response);
    if (jsonStr) {
        try {
            return processRawJson(JSON.parse(jsonStr), points);
        } catch {
            // Continue to next parsing strategy
        }
    }

    // 4. Regex field extraction fallback
    const correctMatch = response.match(/"correct"\s*:\s*(true|false)/i);
    const scoreMatch = response.match(/"score"\s*:\s*(\d+)/);
    const feedbackMatch = response.match(/"feedback"\s*:\s*"([^"]*)"/);

    if (correctMatch && scoreMatch) {
        return {
            correct: correctMatch[1].toLowerCase() === "true",
            score: Math.min(parseInt(scoreMatch[1]), points),
            feedback: feedbackMatch?.[1] || "Graded by AI",
        };
    }

    throw new Error("Failed to parse AI response");
}

/**
 * Extract JSON object using balanced brace matching
 */
function extractBalancedJson(text: string): string | null {
    const start = text.indexOf("{");
    if (start === -1) return null;

    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = start; i < text.length; i++) {
        const char = text[i];

        if (escape) {
            escape = false;
            continue;
        }

        if (char === "\\") {
            escape = true;
            continue;
        }

        if (char === '"') {
            inString = !inString;
            continue;
        }

        if (!inString) {
            if (char === "{") depth++;
            if (char === "}") {
                depth--;
                if (depth === 0) {
                    return text.slice(start, i + 1);
                }
            }
        }
    }

    return null;
}

/**
 * Process raw JSON and validate/normalize values
 */
function processRawJson(json: Record<string, unknown>, points: number): RawGradingResult {
    const correct = Boolean(json.correct);
    const rawScore = typeof json.score === "number" ? json.score : 0;
    const score = Math.min(Math.max(0, rawScore), points);
    const feedback = typeof json.feedback === "string" ? json.feedback : "Graded by AI";

    return { correct, score, feedback };
}

/**
 * Grade an answer using Gemini API
 */
async function gradeWithGemini(apiKey: string, request: GradingRequest): Promise<GradingResponse> {
    const prompt = buildGradingPrompt(request);
    const config = PROVIDERS.gemini;

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            responseMimeType: "application/json",
            responseSchema: GRADING_SCHEMA,
        },
    };

    const response = await fetch(`${config.endpoint}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("No response from Gemini");
    }

    const result = parseGradingResponse(text, request.points);

    return {
        success: true,
        correct: result.correct,
        score: result.score / request.points, // Normalize to 0-1
        feedback: result.feedback,
    };
}

/**
 * Grade an answer using DeepSeek API
 */
async function gradeWithDeepSeek(
    apiKey: string,
    request: GradingRequest
): Promise<GradingResponse> {
    const prompt = buildGradingPrompt(request);
    const config = PROVIDERS.deepseek;

    const body = {
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
    };

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("No response from DeepSeek");
    }

    const result = parseGradingResponse(text, request.points);

    return {
        success: true,
        correct: result.correct,
        score: result.score / request.points,
        feedback: result.feedback,
    };
}

/**
 * Grade an answer using Claude API
 */
async function gradeWithClaude(apiKey: string, request: GradingRequest): Promise<GradingResponse> {
    const prompt = buildGradingPrompt(request);
    const config = PROVIDERS.claude;

    const body = {
        model: config.model,
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
    };

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) {
        throw new Error("No response from Claude");
    }

    const result = parseGradingResponse(text, request.points);

    return {
        success: true,
        correct: result.correct,
        score: result.score / request.points,
        feedback: result.feedback,
    };
}

/**
 * Grade an answer using OpenAI API
 */
async function gradeWithOpenAI(apiKey: string, request: GradingRequest): Promise<GradingResponse> {
    const prompt = buildGradingPrompt(request);
    const config = PROVIDERS.openai;

    const body = {
        model: config.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 2048,
    };

    const response = await fetch(config.endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error("No response from OpenAI");
    }

    const result = parseGradingResponse(text, request.points);

    return {
        success: true,
        correct: result.correct,
        score: result.score / request.points,
        feedback: result.feedback,
    };
}

/**
 * Grade an answer using the specified provider
 */
export async function gradeWithProvider(
    provider: AIProvider,
    apiKey: string,
    request: GradingRequest
): Promise<GradingResponse> {
    switch (provider) {
        case "gemini":
            return gradeWithGemini(apiKey, request);
        case "deepseek":
            return gradeWithDeepSeek(apiKey, request);
        case "claude":
            return gradeWithClaude(apiKey, request);
        case "openai":
            return gradeWithOpenAI(apiKey, request);
        default:
            return {
                success: false,
                error: `Unknown provider: ${provider}`,
            };
    }
}

/**
 * Main entry point for grading an answer
 * Wraps the provider call with error handling
 */
export async function gradeAnswer(
    provider: AIProvider,
    apiKey: string,
    request: GradingRequest
): Promise<GradingResponse> {
    try {
        return await gradeWithProvider(provider, apiKey, request);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return {
            success: false,
            error: message,
        };
    }
}

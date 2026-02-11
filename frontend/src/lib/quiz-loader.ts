/**
 * Quiz Loader Utility
 * Loads and normalizes quiz data from JSON files
 */
import type { ShuffleMode } from "@/types/memorize";
import type {
    Chapter,
    Choice,
    Question,
    QuestionType,
    Quiz,
    RawChoice,
    RawQuestion,
    RawQuizData,
} from "@/types/quiz";

import { shuffleWithChapters } from "./chapter-utils";

/**
 * Generate a simple ID from a string
 */
function generateId(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).slice(0, 8);
}

/**
 * Create a slug from a title
 */
function slugify(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 20);
}

/**
 * Normalize raw choice data
 */
function normalizeChoice(raw: RawChoice, index: number): Choice {
    return {
        id: raw.id || String.fromCharCode(97 + index), // a, b, c, d...
        text: raw.text,
        correct: raw.correct ?? false,
    };
}

/**
 * Infer question type from raw question data
 */
function inferQuestionType(raw: RawQuestion): QuestionType {
    if (raw.type) return raw.type;

    // Check for free_text indicators (referenceAnswer or legacy correct_answer field)
    if (raw.referenceAnswer !== undefined || raw.correct_answer !== undefined) {
        return "free_text";
    }

    // Has true/false correct value
    if (typeof raw.correct === "boolean" && !raw.choices) {
        return "true_false";
    }

    // Has answers array (fill blank or dropdown)
    if (raw.answers && Array.isArray(raw.answers)) {
        // Check if text contains {dropdown} markers
        if (raw.text.toLowerCase().includes("{dropdown}")) {
            return "dropdown";
        }
        return "fill_blank";
    }

    // Has choices
    if (raw.choices && raw.choices.length > 0) {
        // Count correct answers
        const correctCount = raw.choices.filter((c) => c.correct).length;
        return correctCount > 1 ? "multiple_answer" : "multiple_choice";
    }

    // Default to multiple choice
    return "multiple_choice";
}

/**
 * Normalize raw question data
 */
function normalizeQuestion(raw: RawQuestion, index: number): Question {
    const type = inferQuestionType(raw);
    const baseQuestion = {
        id: raw.id || `q${index + 1}`,
        text: raw.text,
        points: raw.points ?? 1,
        image: raw.image || null,
        ...(raw.chapter ? { chapter: raw.chapter } : {}),
    };

    switch (type) {
        case "multiple_choice":
        case "multiple_answer":
            return {
                ...baseQuestion,
                type,
                choices: (raw.choices || []).map(normalizeChoice),
            };

        case "true_false":
            return {
                ...baseQuestion,
                type,
                correct: raw.correct ?? true,
            };

        case "fill_blank":
            return {
                ...baseQuestion,
                type,
                answers: raw.answers || [],
                inline: raw.inline ?? true,
                numeric: raw.numeric ?? false,
                tolerance: raw.tolerance ?? "off",
            };

        case "dropdown":
            return {
                ...baseQuestion,
                type,
                choices: (raw.choices || []).map(normalizeChoice),
                answers: raw.answers || [],
            };

        case "free_text":
            return {
                ...baseQuestion,
                type,
                referenceAnswer: raw.referenceAnswer || raw.correct_answer || "",
                aiGradingEnabled: raw.aiGradingEnabled ?? false,
            };

        default:
            // This should never happen due to exhaustive type checking
            throw new Error(`Unknown question type: ${type}`);
    }
}

/**
 * Normalize chapters array
 */
function normalizeChapters(chapters: Chapter[] | undefined): Chapter[] | undefined {
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
        return undefined;
    }

    return chapters.map((ch, index) => ({
        id: ch.id || `ch${index + 1}`,
        name: ch.name || `Chapter ${index + 1}`,
    }));
}

/**
 * Validate and fix chapter references in questions
 */
function validateQuestionChapters(
    questions: Question[],
    chapters: Chapter[] | undefined
): Question[] {
    if (!chapters || chapters.length === 0) {
        // Remove all chapter references if no chapters exist
        return questions.map((q) => {
            if (q.chapter) {
                const { chapter: _, ...rest } = q;
                return rest as Question;
            }
            return q;
        });
    }

    const validChapterIds = new Set(chapters.map((c) => c.id));

    return questions.map((q) => {
        if (q.chapter && !validChapterIds.has(q.chapter)) {
            // Remove invalid chapter reference
            const { chapter: _, ...rest } = q;
            return rest as Question;
        }
        return q;
    });
}

/**
 * Normalize raw quiz data into a proper Quiz object
 */
export function normalizeQuizData(raw: RawQuizData, sourceUrl?: string): Quiz {
    // Handle both { quiz: {...} } and flat formats
    const quizData = raw.quiz || raw;

    const title = quizData.title || "Untitled Quiz";
    const id = slugify(title) + "-" + generateId(title);

    const rawQuestions = quizData.questions || [];
    const chapters = normalizeChapters(quizData.chapters);
    let questions = rawQuestions.map((q, i) => normalizeQuestion(q, i));

    // Validate chapter references
    questions = validateQuestionChapters(questions, chapters);

    return {
        id,
        title,
        description: quizData.description,
        timeLimit: quizData.timeLimit ?? null,
        questions,
        ...(chapters ? { chapters } : {}),
        _sourceUrl: sourceUrl,
    };
}

/**
 * Load quiz from a URL
 */
export async function loadQuizFromUrl(url: string): Promise<Quiz> {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to load quiz: ${response.status} ${response.statusText}`);
    }

    const data: RawQuizData = await response.json();
    return normalizeQuizData(data, url);
}

/**
 * Load quiz by name (from /quiz/{name}/data.json)
 */
export async function loadQuizByName(name: string): Promise<Quiz> {
    const url = `/quiz/${name}/data.json`;
    return loadQuizFromUrl(url);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Options for preparing a quiz
 */
export interface PrepareQuizOptions {
    /** Legacy: simple shuffle (equivalent to shuffleMode: 'full') */
    shuffleQuestions?: boolean;
    /** Chapter-aware shuffle mode */
    shuffleMode?: ShuffleMode;
    /** Shuffle answer choices */
    shuffleChoices?: boolean;
    /** Filter to specific chapter IDs */
    selectedChapters?: string[];
}

/**
 * Prepare quiz with options (shuffle questions/choices, filter chapters)
 */
export function prepareQuiz(quiz: Quiz, options: PrepareQuizOptions = {}): Quiz {
    let questions = [...quiz.questions];

    // Filter to selected chapters if specified
    if (options.selectedChapters && options.selectedChapters.length > 0) {
        const selectedSet = new Set(options.selectedChapters);
        questions = questions.filter((q) => q.chapter && selectedSet.has(q.chapter));
    }

    // Determine shuffle mode
    let shuffleMode: ShuffleMode = "none";
    if (options.shuffleMode) {
        shuffleMode = options.shuffleMode;
    } else if (options.shuffleQuestions) {
        // Legacy support: shuffleQuestions = true means full shuffle
        shuffleMode = "full";
    }

    // Apply chapter-aware shuffle
    if (shuffleMode !== "none") {
        questions = shuffleWithChapters(questions, quiz, shuffleMode);
    }

    // Shuffle choices for each question
    if (options.shuffleChoices) {
        questions = questions.map((q) => {
            if (q.type === "multiple_choice" || q.type === "multiple_answer") {
                return {
                    ...q,
                    choices: shuffleArray(q.choices),
                };
            }
            return q;
        });
    }

    return {
        ...quiz,
        questions,
    };
}

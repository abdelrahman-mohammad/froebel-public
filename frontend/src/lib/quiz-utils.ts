/**
 * Quiz utility functions
 * ID generation, normalization, shuffle, etc.
 */
import type { Choice, Question, Quiz, QuizOptions, RawQuestion, RawQuizData } from "@/types/quiz";

/**
 * Generate a unique quiz ID from title
 * Format: slugified-title-randomhash
 */
export function generateQuizId(title: string): string {
    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 30);
    const hash = Math.random().toString(36).substring(2, 8);
    return `${slug}-${hash}`;
}

/**
 * Normalize raw quiz data to ensure consistent format
 * Throws error if data is invalid
 */
export function normalizeQuizData(data: RawQuizData): Quiz {
    // Handle nested quiz object
    const quizData = data.quiz || data;

    // Validate title
    const title = (quizData.title || "").trim();
    if (title.length < 4) {
        throw new Error("Quiz title must be at least 4 characters");
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error('Quiz must contain a "questions" array');
    }

    const quiz: Quiz = {
        id: generateQuizId(title),
        title,
        description: quizData.description || "",
        timeLimit: quizData.timeLimit || null,
        questions: quizData.questions.map((q, index) => normalizeQuestion(q, index)),
    };

    return quiz;
}

/**
 * Normalize a single question
 */
function normalizeQuestion(q: RawQuestion, index: number): Question {
    const baseQuestion = {
        id: `q${index + 1}`,
        text: q.text || "",
        points: q.points || 1,
        image: q.image || null,
    };

    const type = q.type || "multiple_choice";

    switch (type) {
        case "fill_blank":
            return {
                ...baseQuestion,
                type: "fill_blank",
                answers: q.answers || [],
                inline: q.inline !== false, // true unless explicitly false
                numeric: q.numeric || false,
                tolerance: q.tolerance || "off",
            };

        case "true_false":
            return {
                ...baseQuestion,
                type: "true_false",
                correct: q.correct ?? true,
            };

        case "multiple_answer":
            return {
                ...baseQuestion,
                type: "multiple_answer",
                choices: normalizeChoices(q.choices || []),
            };

        case "multiple_choice":
        default:
            return {
                ...baseQuestion,
                type: "multiple_choice",
                choices: normalizeChoices(q.choices || []),
            };
    }
}

/**
 * Normalize choices for multiple choice/answer questions
 */
function normalizeChoices(choices: { text: string; correct?: boolean }[]): Choice[] {
    return choices.map((c, index) => ({
        id: String.fromCharCode(97 + index), // a, b, c, d...
        text: c.text || "",
        correct: c.correct || false,
    }));
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new array, doesn't mutate original
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Prepare quiz for playing with optional randomization
 */
export function prepareQuizForPlay(quiz: Quiz, options: QuizOptions = {}): Quiz {
    const { shuffleQuestions = false, shuffleChoices = false } = options;

    let questions = [...quiz.questions];

    if (shuffleQuestions) {
        questions = shuffleArray(questions);
    }

    if (shuffleChoices) {
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

/**
 * Count the number of blanks in a fill_blank question
 */
export function countBlanks(questionText: string): number {
    return (questionText.match(/\{blank\}/g) || []).length;
}

/**
 * Parse question text and replace {blank} markers with placeholder indices
 * Returns array of text segments and blank positions
 */
export function parseBlankQuestion(
    questionText: string
): { type: "text" | "blank"; content: string; index?: number }[] {
    const parts: { type: "text" | "blank"; content: string; index?: number }[] = [];
    const segments = questionText.split(/(\{blank\})/);
    let blankIndex = 0;

    segments.forEach((segment) => {
        if (segment === "{blank}") {
            parts.push({ type: "blank", content: "", index: blankIndex });
            blankIndex++;
        } else if (segment) {
            parts.push({ type: "text", content: segment });
        }
    });

    return parts;
}

/**
 * Format time in seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format time to human readable string (e.g., "5 minutes", "1 hour 30 minutes")
 */
export function formatTimeHuman(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    let result = `${hours} hour${hours !== 1 ? "s" : ""}`;
    if (mins > 0) {
        result += ` ${mins} minute${mins !== 1 ? "s" : ""}`;
    }
    return result;
}

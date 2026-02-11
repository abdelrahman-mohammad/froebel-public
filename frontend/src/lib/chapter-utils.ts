/**
 * Chapter Utility Functions
 * Helper functions for working with quiz chapters
 */
import type { ShuffleMode } from "@/types/memorize";
import type { Chapter, Question, Quiz } from "@/types/quiz";

/**
 * Check if quiz has multiple chapters (2+)
 * Chapter display is only shown when there are multiple chapters
 */
export function hasMultipleChapters(quiz: Quiz | null): boolean {
    if (!quiz?.chapters) return false;
    return quiz.chapters.length >= 2;
}

/**
 * Get chapter name by ID
 * Returns undefined if chapter not found
 */
export function getChapterName(
    quiz: Quiz | null,
    chapterId: string | undefined
): string | undefined {
    if (!quiz?.chapters || !chapterId) return undefined;
    const chapter = quiz.chapters.find((c) => c.id === chapterId);
    return chapter?.name;
}

/**
 * Get chapter by ID
 */
export function getChapterById(quiz: Quiz | null, chapterId: string): Chapter | undefined {
    if (!quiz?.chapters) return undefined;
    return quiz.chapters.find((c) => c.id === chapterId);
}

/**
 * Group questions by chapter
 * Returns a Map with chapter ID as key and questions array as value
 * Questions without a chapter are grouped under "uncategorized"
 */
export function getQuestionsByChapter(quiz: Quiz): Map<string, Question[]> {
    const groups = new Map<string, Question[]>();

    for (const question of quiz.questions) {
        const chapterId = question.chapter || "uncategorized";
        if (!groups.has(chapterId)) {
            groups.set(chapterId, []);
        }
        groups.get(chapterId)!.push(question);
    }

    return groups;
}

/**
 * Get questions for a specific chapter
 */
export function getQuestionsForChapter(quiz: Quiz, chapterId: string): Question[] {
    return quiz.questions.filter((q) => q.chapter === chapterId);
}

/**
 * Count questions per chapter
 * Returns a Map with chapter ID as key and count as value
 */
export function countQuestionsByChapter(quiz: Quiz): Map<string, number> {
    const counts = new Map<string, number>();

    for (const question of quiz.questions) {
        const chapterId = question.chapter || "uncategorized";
        counts.set(chapterId, (counts.get(chapterId) || 0) + 1);
    }

    return counts;
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Shuffle questions with chapter awareness
 * Supports different shuffle modes:
 * - none: No shuffling
 * - full: Full random shuffle (ignores chapters)
 * - within-chapters: Shuffle questions within each chapter
 * - chapters-only: Shuffle chapter order, keep question order
 * - both: Shuffle both chapter order and questions within
 */
export function shuffleWithChapters(
    questions: Question[],
    quiz: Quiz,
    mode: ShuffleMode
): Question[] {
    if (mode === "none") {
        return [...questions];
    }

    if (mode === "full" || !hasMultipleChapters(quiz)) {
        return shuffleArray(questions);
    }

    // Group questions by chapter, preserving order
    const chapterOrder = quiz.chapters?.map((c) => c.id) || [];
    const questionsByChapter = getQuestionsByChapter({ ...quiz, questions });

    // Add uncategorized at the end if exists
    if (questionsByChapter.has("uncategorized")) {
        chapterOrder.push("uncategorized");
    }

    // Filter to only chapters that have questions
    const activeChapters = chapterOrder.filter(
        (id) => questionsByChapter.has(id) && questionsByChapter.get(id)!.length > 0
    );

    // Shuffle chapter order if needed
    const orderedChapters =
        mode === "chapters-only" || mode === "both" ? shuffleArray(activeChapters) : activeChapters;

    // Build result by concatenating questions from each chapter
    const result: Question[] = [];
    for (const chapterId of orderedChapters) {
        let chapterQuestions = questionsByChapter.get(chapterId) || [];

        // Shuffle within chapter if needed
        if (mode === "within-chapters" || mode === "both") {
            chapterQuestions = shuffleArray(chapterQuestions);
        }

        result.push(...chapterQuestions);
    }

    return result;
}

/**
 * Generate a unique chapter ID
 */
export function generateChapterId(): string {
    return `ch_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new chapter with the given name
 */
export function createChapter(name: string): Chapter {
    return {
        id: generateChapterId(),
        name: name.trim(),
    };
}

/**
 * Validate chapter references in questions
 * Returns questions with invalid chapter references fixed (set to undefined)
 */
export function validateChapterReferences(quiz: Quiz): Question[] {
    const validChapterIds = new Set(quiz.chapters?.map((c) => c.id) || []);

    return quiz.questions.map((question) => {
        if (question.chapter && !validChapterIds.has(question.chapter)) {
            // Remove invalid chapter reference
            const { chapter: _, ...rest } = question;
            return rest as Question;
        }
        return question;
    });
}

/**
 * Get chapters that have at least one question
 */
export function getChaptersWithQuestions(quiz: Quiz): Chapter[] {
    if (!quiz.chapters) return [];

    const questionCounts = countQuestionsByChapter(quiz);

    return quiz.chapters.filter((chapter) => (questionCounts.get(chapter.id) || 0) > 0);
}

/**
 * Check if a chapter can be deleted (has no questions)
 */
export function canDeleteChapter(quiz: Quiz, chapterId: string): boolean {
    return !quiz.questions.some((q) => q.chapter === chapterId);
}

/**
 * Get chapter display info for a question
 * Returns null if chapters shouldn't be displayed
 */
export function getQuestionChapterDisplay(
    quiz: Quiz,
    question: Question
): { name: string; id: string } | null {
    if (!hasMultipleChapters(quiz) || !question.chapter) {
        return null;
    }

    const chapter = getChapterById(quiz, question.chapter);
    if (!chapter) return null;

    return { name: chapter.name, id: chapter.id };
}

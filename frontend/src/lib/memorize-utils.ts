/**
 * Memorize Mode Utilities
 * Helper functions for batch creation, answer display, and scoring
 */
import type { BatchResult, BatchSize, MemorizeOptions } from "@/types/memorize";
import type { Question, QuestionResult, Quiz, UserAnswers } from "@/types/quiz";
import {
    isDropdownQuestion,
    isFillBlankQuestion,
    isMultipleAnswerQuestion,
    isMultipleChoiceQuestion,
    isTrueFalseQuestion,
} from "@/types/quiz";
import { getPlainText } from "@/types/rich-text";

import { getQuestionsByChapter, shuffleWithChapters } from "./chapter-utils";
import { calculateScore, checkAnswer } from "./check-answer";

/**
 * Batch info including optional chapter name
 */
export interface BatchInfo {
    questions: Question[];
    chapterName?: string;
}

/**
 * Create batches from questions based on batch size
 * When batchSize is "chapters", each chapter becomes a batch
 */
export function createBatches(
    questions: Question[],
    batchSize: BatchSize | "chapters",
    quiz?: Quiz
): BatchInfo[] {
    // Chapter-based batching
    if (batchSize === "chapters" && quiz?.chapters) {
        const questionsByChapter = getQuestionsByChapter({
            ...quiz,
            questions,
        });
        const batches: BatchInfo[] = [];

        // Create batches in chapter order
        for (const chapter of quiz.chapters) {
            const chapterQuestions = questionsByChapter.get(chapter.id);
            if (chapterQuestions && chapterQuestions.length > 0) {
                batches.push({
                    questions: chapterQuestions,
                    chapterName: chapter.name,
                });
            }
        }

        // Add uncategorized questions as final batch if any
        const uncategorized = questionsByChapter.get("uncategorized");
        if (uncategorized && uncategorized.length > 0) {
            batches.push({
                questions: uncategorized,
                chapterName: "Uncategorized",
            });
        }

        return batches.length > 0 ? batches : [{ questions }];
    }

    // Size-based batching
    if (batchSize === "all" || questions.length <= getBatchSizeNumber(batchSize as BatchSize)) {
        return [{ questions }];
    }

    const size = getBatchSizeNumber(batchSize as BatchSize);
    const batches: BatchInfo[] = [];

    for (let i = 0; i < questions.length; i += size) {
        batches.push({ questions: questions.slice(i, i + size) });
    }

    return batches;
}

/**
 * Convert batch size to number
 */
function getBatchSizeNumber(batchSize: BatchSize): number {
    return batchSize === "all" ? Infinity : batchSize;
}

/**
 * Shuffle an array using Fisher-Yates algorithm
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
 * Prepare quiz for memorize mode (apply shuffle options and chapter filtering)
 */
export function prepareQuizForMemorize(quiz: Quiz, options: MemorizeOptions): Quiz {
    let questions = [...quiz.questions];

    // Filter to selected chapters if specified
    if (options.selectedChapters && options.selectedChapters.length > 0) {
        const selectedSet = new Set(options.selectedChapters);
        questions = questions.filter((q) => q.chapter && selectedSet.has(q.chapter));
    }

    // Apply chapter-aware shuffle
    if (options.shuffleMode && options.shuffleMode !== "none") {
        questions = shuffleWithChapters(questions, quiz, options.shuffleMode);
    }

    // Shuffle choices if enabled
    if (options.shuffleChoices) {
        questions = questions.map((q) => {
            if (
                isMultipleChoiceQuestion(q) ||
                isMultipleAnswerQuestion(q) ||
                isDropdownQuestion(q)
            ) {
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
 * Get displayable correct answer(s) for a question
 * Returns formatted string(s) showing the correct answer
 */
export function getCorrectAnswerDisplay(question: Question): string | string[] {
    if (isMultipleChoiceQuestion(question)) {
        const correctChoice = question.choices.find((c) => c.correct);
        return correctChoice ? getPlainText(correctChoice.text) : "No correct answer";
    }

    if (isMultipleAnswerQuestion(question)) {
        const correctChoices = question.choices
            .filter((c) => c.correct)
            .map((c) => getPlainText(c.text));
        return correctChoices.length > 0 ? correctChoices : ["No correct answers"];
    }

    if (isTrueFalseQuestion(question)) {
        return question.correct ? "True" : "False";
    }

    if (isFillBlankQuestion(question)) {
        return question.answers;
    }

    if (isDropdownQuestion(question)) {
        return question.answers.map((answerId) => {
            const choice = question.choices.find((c) => c.id === answerId);
            return choice ? getPlainText(choice.text) : answerId;
        });
    }

    return "Unknown question type";
}

/**
 * Calculate batch results from user answers
 */
export function calculateBatchResults(
    questions: Question[],
    userAnswers: UserAnswers,
    batchIndex: number
): BatchResult {
    const scoreResult = calculateScore(questions, userAnswers);

    const questionResults: QuestionResult[] = questions.map((question) => {
        const userAnswer = userAnswers[question.id] ?? null;
        const checkResult = checkAnswer(question, userAnswer);

        return {
            questionId: question.id,
            questionText: getPlainText(question.text),
            type: question.type,
            userAnswer,
            points: checkResult.maxPoints,
            earnedPoints: checkResult.earnedPoints,
            isCorrect: checkResult.isCorrect,
            correctAnswer: getCorrectAnswerForResult(question),
            blankResults: checkResult.blankResults,
        };
    });

    return {
        batchIndex,
        correctCount: scoreResult.correctCount,
        totalQuestions: scoreResult.totalQuestions,
        earnedPoints: scoreResult.earnedPoints,
        totalPoints: scoreResult.totalPoints,
        percentage: scoreResult.percentage,
        questionResults,
    };
}

/**
 * Get the correct answer for question result display
 */
function getCorrectAnswerForResult(question: Question): string | string[] | boolean {
    if (isMultipleChoiceQuestion(question)) {
        const correctChoice = question.choices.find((c) => c.correct);
        return correctChoice?.id || "";
    }

    if (isMultipleAnswerQuestion(question)) {
        return question.choices.filter((c) => c.correct).map((c) => c.id);
    }

    if (isTrueFalseQuestion(question)) {
        return question.correct;
    }

    if (isFillBlankQuestion(question)) {
        return question.answers;
    }

    if (isDropdownQuestion(question)) {
        return question.answers;
    }

    return "";
}

/**
 * Get color class based on percentage score
 */
export function getScoreColorClass(percentage: number): string {
    if (percentage >= 70) return "success";
    if (percentage >= 50) return "warning";
    return "danger";
}

/**
 * Format percentage for display
 */
export function formatPercentage(percentage: number): string {
    return `${Math.round(percentage)}%`;
}

/**
 * Get total questions count across all batches
 */
export function getTotalQuestionsCount(batches: Question[][]): number {
    return batches.reduce((sum, batch) => sum + batch.length, 0);
}

/**
 * Get completed questions count from batch results
 */
export function getCompletedQuestionsCount(batchResults: BatchResult[]): number {
    return batchResults.reduce((sum, result) => sum + result.totalQuestions, 0);
}

/**
 * Calculate overall percentage from batch results
 */
export function calculateOverallPercentage(batchResults: BatchResult[]): number {
    if (batchResults.length === 0) return 0;

    const totalEarned = batchResults.reduce((sum, r) => sum + r.earnedPoints, 0);
    const totalMax = batchResults.reduce((sum, r) => sum + r.totalPoints, 0);

    return totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0;
}

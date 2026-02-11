/**
 * Check Answer Utility
 * Functions to check user answers against correct answers
 */
import type { CheckState } from "@/components/quiz/AnswerChoice";
import type { DropdownCheckResult } from "@/components/quiz/question-types/Dropdown";

import type {
    BlankResult,
    FillBlankQuestion,
    Question,
    ToleranceType,
    UserAnswer,
} from "@/types/quiz";
import {
    isDropdownQuestion,
    isFileUploadQuestion,
    isFillBlankQuestion,
    isFreeTextQuestion,
    isMultipleAnswerQuestion,
    isMultipleChoiceQuestion,
    isNumericQuestion,
    isTrueFalseQuestion,
} from "@/types/quiz";
import type { RichTextContent } from "@/types/rich-text";
import { getPlainText } from "@/types/rich-text";

/**
 * Result of checking an answer
 */
export interface CheckResult {
    type: Question["type"];
    isCorrect: boolean;
    earnedPoints: number;
    maxPoints: number;
    /** Choice states for multiple choice/answer questions */
    choiceStates?: Map<string, CheckState>;
    /** Blank results for fill_blank questions */
    blankResults?: BlankResult[];
    /** Dropdown results for dropdown questions */
    dropdownResults?: DropdownCheckResult[];
    /** True/False result */
    trueFalseResult?: { isCorrect: boolean; correctAnswer: boolean };
    /** Free text result */
    freeTextResult?: {
        isCorrect: boolean;
        referenceAnswer?: string;
        feedback?: string;
        /** Normalized score 0-1 for partial credit */
        score?: number;
        /** Whether this was graded by AI */
        gradedByAI?: boolean;
        /** Whether AI grading is pending (needs async call) */
        pendingAIGrade?: boolean;
        /** Whether AI grading is in progress */
        isGrading?: boolean;
        /** Error message if AI grading failed */
        aiError?: string;
    };
    /** File upload result */
    fileUploadResult?: {
        /** Whether a file was uploaded */
        hasUpload: boolean;
        /** Filename if uploaded */
        filename?: string;
        /** Whether manual grading is pending */
        pendingManualGrade: boolean;
    };
}

/**
 * Check user answer against the correct answer
 */
export function checkAnswer(question: Question, userAnswer: UserAnswer): CheckResult {
    if (isMultipleChoiceQuestion(question)) {
        return checkMultipleChoice(question, userAnswer);
    }

    if (isMultipleAnswerQuestion(question)) {
        return checkMultipleAnswer(question, userAnswer);
    }

    if (isTrueFalseQuestion(question)) {
        return checkTrueFalse(question, userAnswer);
    }

    if (isFillBlankQuestion(question)) {
        return checkFillBlank(question, userAnswer);
    }

    if (isDropdownQuestion(question)) {
        return checkDropdown(question, userAnswer);
    }

    if (isFreeTextQuestion(question)) {
        return checkFreeText(question, userAnswer);
    }

    if (isNumericQuestion(question)) {
        return checkNumeric(question, userAnswer);
    }

    if (isFileUploadQuestion(question)) {
        return checkFileUpload(question, userAnswer);
    }

    // Exhaustive check - TypeScript will error if a new question type is added
    // but not handled above
    const _exhaustiveCheck: never = question;
    throw new Error(`Unhandled question type: ${(_exhaustiveCheck as Question).type}`);
}

/**
 * Check multiple choice answer
 */
function checkMultipleChoice(
    question: {
        type: "multiple_choice";
        choices: { id: string; correct: boolean }[];
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    const choiceStates = new Map<string, CheckState>();
    const selectedId = typeof userAnswer === "string" ? userAnswer : null;
    let isCorrect = false;

    for (const choice of question.choices) {
        if (choice.correct) {
            // This is the correct answer
            choiceStates.set(choice.id, "correct");
            if (selectedId === choice.id) {
                isCorrect = true;
            }
        } else if (selectedId === choice.id) {
            // User selected wrong answer
            choiceStates.set(choice.id, "incorrect");
        }
    }

    return {
        type: "multiple_choice",
        isCorrect,
        earnedPoints: isCorrect ? question.points : 0,
        maxPoints: question.points,
        choiceStates,
    };
}

/**
 * Check multiple answer question (partial credit)
 */
function checkMultipleAnswer(
    question: {
        type: "multiple_answer";
        choices: { id: string; correct: boolean }[];
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    const choiceStates = new Map<string, CheckState>();
    const selectedIds = Array.isArray(userAnswer) ? new Set(userAnswer) : new Set<string>();

    let correctCount = 0;
    let incorrectCount = 0;
    let totalCorrect = 0;

    for (const choice of question.choices) {
        const isSelected = selectedIds.has(choice.id);

        if (choice.correct) {
            totalCorrect++;
            if (isSelected) {
                choiceStates.set(choice.id, "correct");
                correctCount++;
            } else {
                // Missed correct answer
                choiceStates.set(choice.id, "correct");
            }
        } else if (isSelected) {
            // User selected wrong answer
            choiceStates.set(choice.id, "incorrect");
            incorrectCount++;
        }
    }

    // Partial credit calculation
    // Points = max(0, (correct selections - incorrect selections) / total correct answers) * points
    const earnedPoints = Math.max(
        0,
        Math.round(((correctCount - incorrectCount) / totalCorrect) * question.points * 100) / 100
    );

    const isCorrect = correctCount === totalCorrect && incorrectCount === 0;

    return {
        type: "multiple_answer",
        isCorrect,
        earnedPoints,
        maxPoints: question.points,
        choiceStates,
    };
}

/**
 * Check true/false answer
 */
function checkTrueFalse(
    question: { type: "true_false"; correct: boolean; points: number },
    userAnswer: UserAnswer
): CheckResult {
    // Normalize: trim and lowercase to handle " true ", "True", "TRUE", etc.
    const normalizedAnswer = typeof userAnswer === "string" ? userAnswer.trim().toLowerCase() : "";
    const userBool = normalizedAnswer === "true";
    const isCorrect = normalizedAnswer !== "" && userBool === question.correct;

    return {
        type: "true_false",
        isCorrect,
        earnedPoints: isCorrect ? question.points : 0,
        maxPoints: question.points,
        trueFalseResult: {
            isCorrect,
            correctAnswer: question.correct,
        },
    };
}

/**
 * Check fill in the blank answer
 */
function checkFillBlank(question: FillBlankQuestion, userAnswer: UserAnswer): CheckResult {
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
    const correctAnswers = question.answers;
    const blankResults: BlankResult[] = [];
    const caseSensitive = question.caseSensitive ?? false;

    let correctCount = 0;

    for (let i = 0; i < correctAnswers.length; i++) {
        const userValue = userAnswers[i] || "";
        const correctValue = correctAnswers[i];

        let isBlankCorrect: boolean;

        if (question.numeric && question.tolerance && question.tolerance !== "off") {
            isBlankCorrect = checkNumericAnswer(userValue, correctValue, question.tolerance);
        } else if (caseSensitive) {
            // Case-sensitive: only trim whitespace, don't lowercase
            isBlankCorrect = userValue.trim() === correctValue.trim();
        } else {
            // Case-insensitive: normalize (trim + lowercase)
            isBlankCorrect = normalizeAnswer(userValue) === normalizeAnswer(correctValue);
        }

        if (isBlankCorrect) {
            correctCount++;
        }

        blankResults.push({
            userAnswer: userValue,
            correctAnswer: correctValue,
            isCorrect: isBlankCorrect,
        });
    }

    // Partial credit for fill in the blank
    const earnedPoints =
        Math.round((correctCount / correctAnswers.length) * question.points * 100) / 100;

    const isCorrect = correctCount === correctAnswers.length;

    return {
        type: "fill_blank",
        isCorrect,
        earnedPoints,
        maxPoints: question.points,
        blankResults,
    };
}

/**
 * Check dropdown question
 */
function checkDropdown(
    question: {
        type: "dropdown";
        choices: { id: string; text: RichTextContent }[];
        answers: string[];
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
    const correctAnswers = question.answers;
    const dropdownResults: DropdownCheckResult[] = [];

    let correctCount = 0;

    for (let i = 0; i < correctAnswers.length; i++) {
        const userValue = userAnswers[i] || "";
        const correctChoiceId = correctAnswers[i];
        const isDropdownCorrect = userValue === correctChoiceId;

        // Find the correct choice text for display
        const correctChoice = question.choices.find((c) => c.id === correctChoiceId);
        const correctAnswerText = correctChoice
            ? getPlainText(correctChoice.text)
            : correctChoiceId;

        if (isDropdownCorrect) {
            correctCount++;
        }

        dropdownResults.push({
            isCorrect: isDropdownCorrect,
            correctAnswer: correctAnswerText,
        });
    }

    // Partial credit for dropdown
    const earnedPoints =
        Math.round((correctCount / correctAnswers.length) * question.points * 100) / 100;

    const isCorrect = correctCount === correctAnswers.length;

    return {
        type: "dropdown",
        isCorrect,
        earnedPoints,
        maxPoints: question.points,
        dropdownResults,
    };
}

/**
 * Check free text answer
 * First tries string comparison, then indicates AI grading if needed
 */
function checkFreeText(
    question: {
        type: "free_text";
        referenceAnswer?: RichTextContent;
        aiGradingEnabled?: boolean;
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    const userText = typeof userAnswer === "string" ? userAnswer.trim() : "";
    const referenceAnswer = getPlainText(question.referenceAnswer).trim();

    // Empty answer is always incorrect
    if (!userText) {
        return {
            type: "free_text",
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: question.points,
            freeTextResult: {
                isCorrect: false,
                referenceAnswer: referenceAnswer || undefined,
            },
        };
    }

    // Step 1: String comparison (case-insensitive)
    if (referenceAnswer) {
        const isExactMatch = userText.toLowerCase() === referenceAnswer.toLowerCase();
        if (isExactMatch) {
            return {
                type: "free_text",
                isCorrect: true,
                earnedPoints: question.points,
                maxPoints: question.points,
                freeTextResult: {
                    isCorrect: true,
                    score: 1,
                    referenceAnswer,
                },
            };
        }
    }

    // Step 2: Check if AI grading is enabled
    if (question.aiGradingEnabled) {
        // Return result indicating AI grading is pending
        // The component should call gradeWithAI() to complete the grading
        return {
            type: "free_text",
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: question.points,
            freeTextResult: {
                isCorrect: false,
                referenceAnswer: referenceAnswer || undefined,
                pendingAIGrade: true,
            },
        };
    }

    // Step 3: No exact match and no AI grading - mark as incorrect
    return {
        type: "free_text",
        isCorrect: false,
        earnedPoints: 0,
        maxPoints: question.points,
        freeTextResult: {
            isCorrect: false,
            referenceAnswer: referenceAnswer || undefined,
        },
    };
}

/**
 * Check numeric answer
 */
function checkNumeric(
    question: {
        type: "numeric";
        correctAnswer: number;
        tolerance?: number | null;
        unit?: string;
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    const userText = typeof userAnswer === "string" ? userAnswer.trim() : "";

    // Empty answer is incorrect
    if (!userText) {
        return {
            type: "numeric",
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: question.points,
        };
    }

    const userNum = parseFloat(userText);

    // Invalid number is incorrect
    if (isNaN(userNum)) {
        return {
            type: "numeric",
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: question.points,
        };
    }

    const tolerance = question.tolerance ?? 0;
    const isCorrect = Math.abs(userNum - question.correctAnswer) <= tolerance;

    return {
        type: "numeric",
        isCorrect,
        earnedPoints: isCorrect ? question.points : 0,
        maxPoints: question.points,
    };
}

/**
 * Check file upload answer
 * File uploads require manual grading - just validate file was uploaded
 */
function checkFileUpload(
    question: {
        type: "file_upload";
        acceptedTypes: string[];
        maxFileSizeMB: number;
        points: number;
    },
    userAnswer: UserAnswer
): CheckResult {
    // File uploads require manual review
    // Just check if something was provided
    const hasUpload = userAnswer !== null && userAnswer !== undefined && userAnswer !== "";
    const filename = typeof userAnswer === "string" ? userAnswer : undefined;

    return {
        type: "file_upload",
        isCorrect: false, // Requires manual grading
        earnedPoints: 0,
        maxPoints: question.points,
        fileUploadResult: {
            hasUpload,
            filename,
            pendingManualGrade: true,
        },
    };
}

/**
 * Normalize answer for comparison (trim, lowercase)
 */
function normalizeAnswer(answer: string): string {
    return answer.trim().toLowerCase();
}

/**
 * Check numeric answer with tolerance
 */
function checkNumericAnswer(
    userAnswer: string,
    correctAnswer: string,
    tolerance: ToleranceType
): boolean {
    // Trim before parsing to handle leading/trailing whitespace
    const userNum = parseFloat(userAnswer.trim());
    const correctNum = parseFloat(correctAnswer.trim());

    if (isNaN(userNum) || isNaN(correctNum)) {
        // Fall back to string comparison if not valid numbers
        return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
    }

    // Map tolerance type to numeric value
    const toleranceValue = tolerance === "0.1" ? 0.1 : tolerance === "1" ? 1 : 0;
    return Math.abs(userNum - correctNum) <= toleranceValue;
}

/**
 * Calculate total score for a quiz
 */
export function calculateScore(
    questions: Question[],
    userAnswers: Record<string, UserAnswer>
): {
    correctCount: number;
    totalQuestions: number;
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
    results: Map<string, CheckResult>;
} {
    const results = new Map<string, CheckResult>();
    let correctCount = 0;
    let earnedPoints = 0;
    let totalPoints = 0;

    for (const question of questions) {
        const userAnswer = userAnswers[question.id] ?? null;
        const result = checkAnswer(question, userAnswer);

        results.set(question.id, result);
        totalPoints += result.maxPoints;
        earnedPoints += result.earnedPoints;

        if (result.isCorrect) {
            correctCount++;
        }
    }

    const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

    return {
        correctCount,
        totalQuestions: questions.length,
        earnedPoints,
        totalPoints,
        percentage,
        results,
    };
}

/**
 * Grade a free text answer using AI
 * This is an async function that should be called when pendingAIGrade is true
 */
export async function gradeWithAI(
    question: {
        type: "free_text";
        text: string;
        referenceAnswer?: string;
        points: number;
    },
    userAnswer: string,
    provider: import("@/lib/ai-grading/types").AIProvider
): Promise<CheckResult> {
    const { requestAIGrading } = await import("@/lib/ai-grading/client");

    const referenceAnswer = question.referenceAnswer?.trim() || "";

    try {
        const response = await requestAIGrading(provider, {
            questionText: question.text,
            referenceAnswer: referenceAnswer || undefined,
            userAnswer: userAnswer.trim(),
            points: question.points,
        });

        if (!response.success) {
            // AI grading failed - return with error
            return {
                type: "free_text",
                isCorrect: false,
                earnedPoints: 0,
                maxPoints: question.points,
                freeTextResult: {
                    isCorrect: false,
                    referenceAnswer: referenceAnswer || undefined,
                    aiError: response.error || "AI grading failed",
                    gradedByAI: false,
                },
            };
        }

        // AI grading succeeded
        const score = response.score ?? 0;
        const isCorrect = response.correct ?? false;
        const earnedPoints = Math.round(score * question.points * 100) / 100;

        return {
            type: "free_text",
            isCorrect,
            earnedPoints,
            maxPoints: question.points,
            freeTextResult: {
                isCorrect,
                score,
                feedback: response.feedback,
                referenceAnswer: referenceAnswer || undefined,
                gradedByAI: true,
            },
        };
    } catch (error) {
        return {
            type: "free_text",
            isCorrect: false,
            earnedPoints: 0,
            maxPoints: question.points,
            freeTextResult: {
                isCorrect: false,
                referenceAnswer: referenceAnswer || undefined,
                aiError: error instanceof Error ? error.message : "AI grading failed",
                gradedByAI: false,
            },
        };
    }
}

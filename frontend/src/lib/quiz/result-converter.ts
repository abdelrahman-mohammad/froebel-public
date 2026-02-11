/**
 * Result Converter Utility
 * Converts backend AttemptResultDTO to formats used by question components
 */
import type { CheckResult } from "@/lib/check-answer";
import type { CheckState } from "@/components/quiz/AnswerChoice";

import type { AnswerResultDTO, AttemptResultDTO } from "./types";
import type { Question, Quiz, UserAnswer, QuestionType } from "@/types/quiz";

/**
 * Data needed to display a question in review mode
 */
export interface QuestionReviewData {
    questionId: string;
    questionIndex: number;
    isCorrect: boolean;
    pointsEarned: number;
    pointsPossible: number;
    userAnswer: UserAnswer;
    checkResult: CheckResult;
}

/**
 * Convert API question type to local question type
 */
function apiTypeToLocal(apiType: string): QuestionType {
    const typeMap: Record<string, QuestionType> = {
        MULTIPLE_CHOICE: "multiple_choice",
        MULTIPLE_ANSWER: "multiple_answer",
        TRUE_FALSE: "true_false",
        FILL_IN_BLANK: "fill_blank",
        DROPDOWN: "dropdown",
        FREE_TEXT: "free_text",
        NUMERIC: "numeric",
        FILE_UPLOAD: "file_upload",
    };
    return typeMap[apiType] || "multiple_choice";
}

/**
 * Convert backend userAnswer to local UserAnswer format
 */
function convertUserAnswer(result: AnswerResultDTO): UserAnswer {
    const { userAnswer, questionType } = result;

    switch (questionType) {
        case "MULTIPLE_CHOICE":
            // Single selection
            return userAnswer.selectedChoices?.[0] ?? null;

        case "MULTIPLE_ANSWER":
        case "DROPDOWN":
            // Array of selections
            return userAnswer.selectedChoices ?? [];

        case "TRUE_FALSE":
            // Boolean as string
            return userAnswer.booleanAnswer !== undefined
                ? String(userAnswer.booleanAnswer)
                : null;

        case "FILL_IN_BLANK":
            // Array of text answers
            return userAnswer.textAnswers ?? [];

        case "FREE_TEXT":
        case "NUMERIC":
            // Single text/number answer
            return userAnswer.textAnswer ?? null;

        case "FILE_UPLOAD":
            return null; // File uploads not yet supported

        default:
            return null;
    }
}

/**
 * Convert backend AnswerResultDTO to CheckResult for use by question components
 */
export function convertAnswerResultToCheckResult(
    result: AnswerResultDTO,
    question: Question
): CheckResult {
    const type = apiTypeToLocal(result.questionType);

    // Base result
    const checkResult: CheckResult = {
        type,
        isCorrect: result.correct,
        earnedPoints: result.pointsEarned,
        maxPoints: result.pointsPossible,
    };

    // Add type-specific data
    switch (result.questionType) {
        case "MULTIPLE_CHOICE":
        case "MULTIPLE_ANSWER": {
            // Build choice states map
            const choiceStates = new Map<string, CheckState>();
            const userSelected = new Set(result.userAnswer.selectedChoices ?? []);
            const correctChoices = result.correctAnswer?.choices ?? [];

            for (const choice of correctChoices) {
                const isUserSelected = userSelected.has(choice.id);
                const isCorrectChoice = choice.correct;

                if (isCorrectChoice && isUserSelected) {
                    choiceStates.set(choice.id, "correct");
                } else if (!isCorrectChoice && isUserSelected) {
                    choiceStates.set(choice.id, "incorrect");
                } else if (isCorrectChoice && !isUserSelected) {
                    choiceStates.set(choice.id, "correct"); // Show as correct (missed)
                }
            }

            checkResult.choiceStates = choiceStates;
            break;
        }

        case "TRUE_FALSE": {
            const correctAnswer = result.correctAnswer?.correct ?? false;
            checkResult.trueFalseResult = {
                isCorrect: result.correct,
                correctAnswer,
            };
            break;
        }

        case "FILL_IN_BLANK": {
            // Build blank results from backend data
            const userAnswers = result.userAnswer.textAnswers ?? [];
            const correctAnswers = result.correctAnswer?.answers ?? [];
            // Check if question has caseSensitive flag (from FillBlankQuestion type)
            const caseSensitive = (question as { caseSensitive?: boolean }).caseSensitive ?? false;

            checkResult.blankResults = userAnswers.map((userAns, index) => {
                const correctAns = correctAnswers[index];
                const trimmedUser = userAns?.trim() ?? "";
                const trimmedCorrect = correctAns?.trim() ?? "";

                // Respect caseSensitive flag: only lowercase when case-insensitive
                const isBlankCorrect = caseSensitive
                    ? trimmedUser === trimmedCorrect
                    : trimmedUser.toLowerCase() === trimmedCorrect.toLowerCase();

                return {
                    userAnswer: userAns || "",
                    correctAnswer: correctAns || "",
                    isCorrect: isBlankCorrect,
                };
            });
            break;
        }

        case "DROPDOWN": {
            // Build dropdown results - handles multiple dropdowns
            const userSelected = result.userAnswer.selectedChoices ?? [];
            const correctChoices = result.correctAnswer?.choices ?? [];
            // Get all correct choices (there may be multiple for multiple dropdowns)
            const allCorrectChoices = correctChoices.filter((c) => c.correct);

            checkResult.dropdownResults = userSelected.map((selection, index) => {
                // For multiple dropdowns, match by index; for single dropdown, use first correct
                const correctChoice = allCorrectChoices[index] ?? allCorrectChoices[0];
                const isCorrectSelection = correctChoice?.id === selection;
                return {
                    isCorrect: isCorrectSelection,
                    correctAnswer: correctChoice?.text ?? "",
                };
            });
            break;
        }

        case "FREE_TEXT": {
            checkResult.freeTextResult = {
                isCorrect: result.correct,
                referenceAnswer: result.correctAnswer?.answers?.[0],
                score: result.pointsPossible > 0
                    ? result.pointsEarned / result.pointsPossible
                    : 0,
                pendingAIGrade: !result.correct && result.pointsEarned === 0,
            };
            break;
        }
    }

    return checkResult;
}

/**
 * Convert full AttemptResultDTO to array of QuestionReviewData
 * for use in review mode
 */
export function convertAttemptToReviewData(
    result: AttemptResultDTO,
    quiz: Quiz
): QuestionReviewData[] {
    if (!result.answers) {
        return [];
    }

    return result.answers.map((answer, index) => {
        // Find corresponding question in quiz
        const question = quiz.questions.find((q) => q.id === answer.questionId);

        return {
            questionId: answer.questionId,
            questionIndex: index,
            isCorrect: answer.correct,
            pointsEarned: answer.pointsEarned,
            pointsPossible: answer.pointsPossible,
            userAnswer: convertUserAnswer(answer),
            checkResult: question
                ? convertAnswerResultToCheckResult(answer, question)
                : {
                      type: apiTypeToLocal(answer.questionType),
                      isCorrect: answer.correct,
                      earnedPoints: answer.pointsEarned,
                      maxPoints: answer.pointsPossible,
                  },
        };
    });
}

/**
 * Build a UserAnswers map from review data
 * Useful for populating QuizContext state in review mode
 */
export function buildUserAnswersFromReviewData(
    reviewData: QuestionReviewData[]
): Record<string, UserAnswer> {
    const userAnswers: Record<string, UserAnswer> = {};

    for (const item of reviewData) {
        userAnswers[item.questionId] = item.userAnswer;
    }

    return userAnswers;
}

/**
 * Build a checkResults map from review data
 * Useful for displaying check states in review mode
 */
export function buildCheckResultsFromReviewData(
    reviewData: QuestionReviewData[]
): Map<string, CheckResult> {
    const checkResults = new Map<string, CheckResult>();

    for (const item of reviewData) {
        checkResults.set(item.questionId, item.checkResult);
    }

    return checkResults;
}

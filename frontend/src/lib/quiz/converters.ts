/**
 * Type Converters
 * Bridge between API types and local Quiz types
 */
import type {
    Choice,
    DropdownQuestion,
    FileUploadQuestion,
    FillBlankQuestion,
    FreeTextQuestion,
    MultipleAnswerQuestion,
    MultipleChoiceQuestion,
    NumericQuestion,
    Question,
    QuestionType,
    Quiz,
    QuizStatus,
    TrueFalseQuestion,
} from "@/types/quiz";
// ============================================
// User Answer Converters
// ============================================

import type { UserAnswer, UserAnswers } from "@/types/quiz";
import { deserializeRichText, getPlainText, serializeRichText } from "@/types/rich-text";

import type {
    ApiChoice,
    ApiQuestionType,
    ApiQuizStatus,
    CreateQuestionRequest,
    CreateQuizRequest,
    FileUploadData,
    FillInBlankData,
    FreeTextData,
    MultipleChoiceData,
    NumericData,
    PublicQuizDetailDTO,
    QuestionDTO,
    QuizDetailDTO,
    TrueFalseData,
    UpdateQuizRequest,
} from "./types";
import type { SubmitAnswerDTO } from "./types";

// ============================================
// Question Type Mapping
// ============================================

const apiToLocalQuestionType: Record<ApiQuestionType, QuestionType> = {
    MULTIPLE_CHOICE: "multiple_choice",
    MULTIPLE_ANSWER: "multiple_answer",
    TRUE_FALSE: "true_false",
    FILL_IN_BLANK: "fill_blank",
    DROPDOWN: "dropdown",
    FREE_TEXT: "free_text",
    NUMERIC: "numeric",
    FILE_UPLOAD: "file_upload",
};

const localToApiQuestionType: Record<QuestionType, ApiQuestionType> = {
    multiple_choice: "MULTIPLE_CHOICE",
    multiple_answer: "MULTIPLE_ANSWER",
    true_false: "TRUE_FALSE",
    fill_blank: "FILL_IN_BLANK",
    dropdown: "DROPDOWN",
    free_text: "FREE_TEXT",
    numeric: "NUMERIC",
    file_upload: "FILE_UPLOAD",
};

// ============================================
// Quiz Status Mapping
// ============================================

const apiToLocalQuizStatus: Record<ApiQuizStatus, QuizStatus> = {
    DRAFT: "draft",
    PUBLISHED: "published",
    ARCHIVED: "archived",
};

const localToApiQuizStatus: Record<QuizStatus, ApiQuizStatus> = {
    draft: "DRAFT",
    published: "PUBLISHED",
    archived: "ARCHIVED",
};

// ============================================
// API to Local Converters
// ============================================

/**
 * Convert API choice to local choice
 *
 * Security note: For public quiz responses (quiz taking), the backend strips
 * the `correct` field entirely from all choices. When `correct` is undefined,
 * we default to `false`. This is safe because:
 * 1. ALL choices in public responses have `correct: undefined` (no leakage)
 * 2. The frontend just needs a boolean to satisfy the type system
 * 3. No display logic should rely on `correct` for public quizzes
 */
function apiChoiceToLocal(apiChoice: ApiChoice): Choice {
    return {
        id: apiChoice.id,
        text: deserializeRichText(apiChoice.text),
        correct: apiChoice.correct ?? false,
    };
}

/**
 * Convert API question to local question
 */
export function apiQuestionToLocal(dto: QuestionDTO): Question {
    const localType = apiToLocalQuestionType[dto.type];
    const baseProps = {
        id: dto.id,
        text: deserializeRichText(dto.text),
        points: dto.points,
        // Map additional fields from backend
        chapter: dto.chapter || undefined,
        explanation: dto.explanation || undefined,
        hintCorrect: dto.hintCorrect ? deserializeRichText(dto.hintCorrect) : undefined,
        hintWrong: dto.hintWrong ? deserializeRichText(dto.hintWrong) : undefined,
        identifier: dto.identifier || undefined,
    };

    switch (dto.type) {
        case "MULTIPLE_CHOICE": {
            const data = dto.data as MultipleChoiceData;
            return {
                ...baseProps,
                type: "multiple_choice",
                choices: data.choices?.map(apiChoiceToLocal) ?? [],
            } as MultipleChoiceQuestion;
        }

        case "MULTIPLE_ANSWER": {
            const data = dto.data as MultipleChoiceData;
            return {
                ...baseProps,
                type: "multiple_answer",
                choices: data.choices?.map(apiChoiceToLocal) ?? [],
            } as MultipleAnswerQuestion;
        }

        case "TRUE_FALSE": {
            const data = dto.data as TrueFalseData;
            return {
                ...baseProps,
                type: "true_false",
                correct: data.correct ?? true,
            } as TrueFalseQuestion;
        }

        case "FILL_IN_BLANK": {
            const data = dto.data as FillInBlankData;
            return {
                ...baseProps,
                type: "fill_blank",
                answers: data.answers ?? [],
                inline: data.inline ?? true,
                numeric: data.numeric ?? false,
                tolerance: data.tolerance ?? null,
                caseSensitive: data.caseSensitive ?? false,
            } as FillBlankQuestion;
        }

        case "DROPDOWN": {
            const data = dto.data as MultipleChoiceData;
            // For dropdown questions, extract the correct answer from choices.
            // Note: Backend currently enforces exactly 1 correct answer per dropdown question.
            // The answers array will contain a single element - the correct choice ID.
            // TODO: If multiple {dropdown} markers are needed, backend data model must be updated.
            const choices = data.choices?.map(apiChoiceToLocal) ?? [];
            const answers = choices.filter((c) => c.correct).map((c) => c.id);
            return {
                ...baseProps,
                type: "dropdown",
                choices,
                answers,
            } as DropdownQuestion;
        }

        case "FREE_TEXT": {
            const data = dto.data as FreeTextData;
            return {
                ...baseProps,
                type: "free_text",
                referenceAnswer: deserializeRichText(data.referenceAnswer),
                aiGradingEnabled: data.aiGradingEnabled ?? false,
            } as FreeTextQuestion;
        }

        case "NUMERIC": {
            const data = dto.data as NumericData;
            return {
                ...baseProps,
                type: "numeric",
                correctAnswer: data.correctAnswer,
                tolerance: data.tolerance,
                unit: data.unit,
            } as NumericQuestion;
        }

        case "FILE_UPLOAD": {
            const data = dto.data as FileUploadData;
            return {
                ...baseProps,
                type: "file_upload",
                acceptedTypes: data.acceptedTypes ?? [".pdf"],
                maxFileSizeMB: data.maxFileSizeMB ?? 10,
                referenceAnswer: deserializeRichText(data.referenceAnswer),
            } as FileUploadQuestion;
        }

        default:
            // Throw error for unknown types instead of silently creating malformed questions
            throw new Error(
                `Unknown question type "${dto.type}" (id: ${dto.id}). ` +
                `This may indicate a version mismatch between frontend and backend.`
            );
    }
}

/**
 * Convert API quiz detail to local quiz
 */
export function apiQuizToLocal(dto: QuizDetailDTO | PublicQuizDetailDTO): Quiz {
    // Extract settings from DTO if it's QuizDetailDTO (has full settings)
    const isDetailDTO = "status" in dto;
    const detailDto = dto as QuizDetailDTO;
    const publicDto = dto as PublicQuizDetailDTO;

    // Build settings based on DTO type
    // PublicQuizDetailDTO now includes some settings needed for quiz taking
    const settings = isDetailDTO
        ? {
              shuffleQuestions: dto.shuffleQuestions,
              shuffleChoices: dto.shuffleChoices,
              showCorrectAnswers: detailDto.showCorrectAnswers,
              isPublic: detailDto.isPublic,
              passingScore: detailDto.passingScore,
              // Access control
              allowAnonymous: detailDto.allowAnonymous,
              maxAttempts: detailDto.maxAttempts,
              // Access restriction fields
              requireAccessCode: detailDto.requireAccessCode,
              accessCode: detailDto.accessCode,
              filterIpAddresses: detailDto.filterIpAddresses,
              allowedIpAddresses: detailDto.allowedIpAddresses,
              // Availability fields (note: backend uses availableUntil, frontend uses availableTo)
              availableFrom: detailDto.availableFrom,
              availableTo: detailDto.availableUntil,
              resultsVisibleFrom: detailDto.resultsVisibleFrom,
          }
        : {
              // PublicQuizDetailDTO settings for quiz taking
              shuffleQuestions: dto.shuffleQuestions,
              shuffleChoices: dto.shuffleChoices,
              passingScore: publicDto.passingScore ?? undefined,
              allowAnonymous: publicDto.allowAnonymous,
              maxAttempts: publicDto.maxAttempts ?? undefined,
              availableFrom: publicDto.availableFrom ?? undefined,
              availableTo: publicDto.availableUntil ?? undefined,
          };

    // Extract category ID if present (only in QuizDetailDTO)
    // Note: Backend sends categoryId directly, not a category object
    const categoryId = isDetailDTO ? detailDto.categoryId ?? undefined : undefined;

    // Extract tags if present (only in QuizDetailDTO)
    const tags = isDetailDTO && detailDto.tags ? [...detailDto.tags] : undefined;

    return {
        id: dto.id,
        shareableId: dto.shareableId,
        title: dto.title,
        description: dto.description,
        iconUrl: isDetailDTO ? detailDto.iconUrl ?? undefined : undefined,
        bannerUrl: isDetailDTO ? detailDto.bannerUrl ?? undefined : undefined,
        timeLimit: dto.timeLimit,
        questions: dto.questions?.map(apiQuestionToLocal) ?? [],
        settings,
        categoryId,
        courseId: isDetailDTO ? detailDto.courseId ?? undefined : undefined,
        tags,
        aiGradingEnabled: isDetailDTO ? detailDto.aiGradingEnabled : undefined,
        status: isDetailDTO ? apiToLocalQuizStatus[detailDto.status] : undefined,
        version: isDetailDTO ? detailDto.version : undefined,
    };
}

// ============================================
// Local to API Converters
// ============================================

/**
 * Convert local choice to API choice
 */
function localChoiceToApi(choice: Choice): ApiChoice {
    return {
        id: choice.id,
        text: serializeRichText(choice.text),
        correct: choice.correct,
    };
}

/**
 * Convert local question to API create request
 */
export function localQuestionToApi(question: Question): CreateQuestionRequest {
    const apiType = localToApiQuestionType[question.type];

    // Common optional fields that apply to all question types
    const commonFields = {
        chapter: question.chapter || undefined,
        explanation: question.explanation || undefined,
        hintCorrect: question.hintCorrect ? serializeRichText(question.hintCorrect) : undefined,
        hintWrong: question.hintWrong ? serializeRichText(question.hintWrong) : undefined,
        identifier: question.identifier || undefined,
    };

    switch (question.type) {
        case "multiple_choice": {
            const q = question as MultipleChoiceQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    choices: q.choices.map(localChoiceToApi),
                },
                ...commonFields,
            };
        }

        case "multiple_answer": {
            const q = question as MultipleAnswerQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    choices: q.choices.map(localChoiceToApi),
                },
                ...commonFields,
            };
        }

        case "true_false": {
            const q = question as TrueFalseQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    correct: q.correct,
                },
                ...commonFields,
            };
        }

        case "fill_blank": {
            const q = question as FillBlankQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    answers: q.answers,
                    caseSensitive: q.caseSensitive ?? false,
                    inline: q.inline ?? true,
                    numeric: q.numeric ?? false,
                    tolerance: q.tolerance ?? null,
                },
                ...commonFields,
            };
        }

        case "dropdown": {
            const q = question as DropdownQuestion;
            // For dropdown, mark the correct choice based on the first answer.
            // Note: Backend enforces exactly 1 correct answer per dropdown question.
            // If answers array has multiple elements, only the first is used.
            const correctAnswerId = q.answers[0];
            const choices = q.choices.map((c) => ({
                ...localChoiceToApi(c),
                correct: c.id === correctAnswerId,
            }));
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    choices,
                },
                ...commonFields,
            };
        }

        case "free_text": {
            const q = question as FreeTextQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    referenceAnswer: serializeRichText(q.referenceAnswer) || undefined,
                    allowImage: false,
                    aiGradingEnabled: q.aiGradingEnabled ?? false,
                },
                ...commonFields,
            };
        }

        case "numeric": {
            const q = question as NumericQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    correctAnswer: q.correctAnswer,
                    tolerance: q.tolerance,
                    unit: q.unit,
                },
                ...commonFields,
            };
        }

        case "file_upload": {
            const q = question as FileUploadQuestion;
            return {
                text: serializeRichText(q.text),
                type: apiType,
                points: q.points,
                data: {
                    acceptedTypes: q.acceptedTypes,
                    maxFileSizeMB: q.maxFileSizeMB,
                    referenceAnswer: serializeRichText(q.referenceAnswer) || undefined,
                },
                ...commonFields,
            };
        }
    }

    // Exhaustive check - this should never happen
    const _exhaustiveCheck: never = question;
    throw new Error(`Unknown question type: ${(_exhaustiveCheck as Question).type}`);
}

/**
 * Convert local quiz to API create/update request
 */
export function localQuizToApi(quiz: Quiz): CreateQuizRequest & Partial<UpdateQuizRequest> {
    const settings = quiz.settings || {};
    return {
        title: quiz.title,
        description: quiz.description,
        iconUrl: quiz.iconUrl,
        bannerUrl: quiz.bannerUrl,
        courseId: quiz.courseId,
        timeLimit: quiz.timeLimit || null, // 0 or undefined → null (disabled)
        shuffleQuestions: settings.shuffleQuestions ?? false,
        shuffleChoices: settings.shuffleChoices ?? false,
        showCorrectAnswers: settings.showCorrectAnswers ?? true,
        isPublic: settings.isPublic ?? false,
        aiGradingEnabled: quiz.aiGradingEnabled ?? false,
        passingScore: settings.passingScore ?? 70,
        // Metadata
        categoryId: quiz.categoryId,
        tagNames: quiz.tags, // Backend expects 'tagNames', not 'tags'
        // Access control
        allowAnonymous: settings.allowAnonymous ?? false,
        maxAttempts: settings.maxAttempts ?? null,
        // Access restriction fields
        requireAccessCode: settings.requireAccessCode ?? false,
        accessCode: settings.accessCode,
        filterIpAddresses: settings.filterIpAddresses ?? false,
        allowedIpAddresses: settings.allowedIpAddresses,
        // Availability fields (note: backend uses availableUntil, frontend uses availableTo)
        availableFrom: settings.availableFrom,
        availableUntil: settings.availableTo,
        resultsVisibleFrom: settings.resultsVisibleFrom,
        // Optimistic locking version (for updates)
        version: quiz.version,
    };
}

/**
 * Convert local user answers to API submit format
 */
export function userAnswersToApi(answers: UserAnswers, questions: Question[]): SubmitAnswerDTO[] {
    const result: SubmitAnswerDTO[] = [];

    for (const question of questions) {
        const answer = answers[question.id];
        if (answer === null || answer === undefined) {
            continue; // Skip unanswered
        }

        // Build answerData based on question type
        let answerData: SubmitAnswerDTO["answerData"];

        switch (question.type) {
            case "multiple_choice":
                // answer is a string (choice id)
                answerData = { selectedChoices: [answer as string] };
                break;

            case "multiple_answer":
            case "dropdown":
                // answer is string[]
                answerData = { selectedChoices: answer as string[] };
                break;

            case "true_false":
                // answer is "true" or "false" string
                answerData = { booleanAnswer: answer === "true" };
                break;

            case "fill_blank":
                // answer is string[]
                answerData = { textAnswers: answer as string[] };
                break;

            case "free_text":
                // answer is a string
                answerData = { textAnswer: answer as string };
                break;

            case "numeric":
                // answer is a string that needs to be parsed to number
                answerData = { numericAnswer: parseFloat(answer as string) };
                break;

            case "file_upload":
                // File uploads are handled separately via file upload endpoints
                // Skip adding this answer to the submission
                continue;

            default:
                continue;
        }

        result.push({
            questionId: question.id,
            answerData,
        });
    }

    return result;
}

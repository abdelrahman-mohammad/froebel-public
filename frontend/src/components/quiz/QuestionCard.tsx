"use client";

import React, { useEffect, useRef } from "react";

import { FlagIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RichTextViewer } from "@/components/ui/RichTextViewer";

import { renderLatex } from "@/lib/format-text";
import { cn } from "@/lib/utils";

import type { BlankResult, Question, UserAnswer } from "@/types/quiz";
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

import type { CheckState } from "./AnswerChoice";
import { Dropdown, type DropdownCheckResult } from "./question-types/Dropdown";
import { FileUpload, type FileUploadCheckResult } from "./question-types/FileUpload";
import { FillBlank } from "./question-types/FillBlank";
import { FreeText, type FreeTextCheckResult } from "./question-types/FreeText";
import { MultipleAnswer } from "./question-types/MultipleAnswer";
import { MultipleChoice } from "./question-types/MultipleChoice";
import { Numeric, type NumericCheckResult } from "./question-types/Numeric";
import { TrueFalse } from "./question-types/TrueFalse";

export interface CheckResult {
    type: Question["type"];
    choiceStates?: Map<string, CheckState>;
    blankResults?: BlankResult[];
    dropdownResults?: DropdownCheckResult[];
    trueFalseResult?: { isCorrect: boolean; correctAnswer: boolean };
    freeTextResult?: FreeTextCheckResult;
    numericResult?: NumericCheckResult;
    fileUploadResult?: FileUploadCheckResult;
}

export interface QuestionCardProps {
    /** The question data */
    question: Question;
    /** Current question number (1-indexed) */
    questionNumber: number;
    /** Total number of questions */
    totalQuestions: number;
    /** User's current answer */
    userAnswer: UserAnswer;
    /** Whether this question is flagged */
    isFlagged: boolean;
    /** Whether this question has been checked */
    isChecked: boolean;
    /** Check results (if checked) */
    checkResult: CheckResult | null;
    /** Optional chapter name (only shown when quiz has multiple chapters) */
    chapterName?: string;
    /** Whether the quiz has been submitted (disables flag button) */
    isSubmitted?: boolean;
    /** Callback when answer changes */
    onAnswerChange: (answer: UserAnswer) => void;
    /** Callback when flag is toggled */
    onToggleFlag: () => void;
}

/**
 * Main question display component
 * Renders question header, text, image, and appropriate answer component
 */
export function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    userAnswer,
    isFlagged,
    isChecked,
    checkResult,
    chapterName,
    isSubmitted = false,
    onAnswerChange,
    onToggleFlag,
}: QuestionCardProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Render LaTeX after content updates
    useEffect(() => {
        renderLatex(contentRef.current);
    }, [question.text, question.id]);

    // Format points text
    const pointsText = question.points === 1 ? "1 pt" : `${question.points} pts`;

    return (
        <div className="bg-card rounded-lg shadow-md p-6 border border-border" data-question-id={question.id}>
            <div className="space-y-5" ref={contentRef}>
                {/* Chapter Name (only shown when quiz has multiple chapters) */}
                {chapterName && <div className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground w-fit">{chapterName}</div>}

                {/* Question Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-border">
                    <span className="text-sm font-medium text-muted-foreground">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "text-muted-foreground hover:text-warning",
                            isFlagged && "text-warning"
                        )}
                        onClick={onToggleFlag}
                        disabled={isSubmitted}
                        title={isFlagged ? "Unflag this question" : "Flag this question"}
                        aria-pressed={isFlagged}
                    >
                        <FlagIcon className={cn("h-4 w-4", isFlagged && "fill-current")} />
                    </Button>
                    <span className="ml-auto text-sm font-semibold text-primary">{pointsText}</span>
                </div>

                {/* Question Image (if present) */}
                {question.image && (
                    <div className="mt-4 rounded-lg overflow-hidden">
                        <img src={question.image} alt="Question illustration" loading="lazy" className="max-w-full h-auto" />
                    </div>
                )}

                {/* Question Text */}
                {!isFillBlankQuestion(question) &&
                    !isDropdownQuestion(question) &&
                    !isFreeTextQuestion(question) &&
                    !isNumericQuestion(question) &&
                    !isFileUploadQuestion(question) && (
                        <RichTextViewer
                            content={question.text}
                            className="question_text text-base leading-relaxed"
                        />
                    )}

                {/* Answer Section */}
                <QuestionAnswers
                    question={question}
                    userAnswer={userAnswer}
                    isChecked={isChecked}
                    checkResult={checkResult}
                    onAnswerChange={onAnswerChange}
                />
            </div>
        </div>
    );
}

// ============================================================================
// Answer Section Component
// ============================================================================

interface QuestionAnswersProps {
    question: Question;
    userAnswer: UserAnswer;
    isChecked: boolean;
    checkResult: CheckResult | null;
    onAnswerChange: (answer: UserAnswer) => void;
}

function QuestionAnswers({
    question,
    userAnswer,
    isChecked,
    checkResult,
    onAnswerChange,
}: QuestionAnswersProps) {
    // Multiple Choice
    if (isMultipleChoiceQuestion(question)) {
        return (
            <MultipleChoice
                question={question}
                userAnswer={typeof userAnswer === "string" ? userAnswer : null}
                disabled={isChecked}
                checkStates={checkResult?.choiceStates ?? null}
                onSelect={(choiceId) => onAnswerChange(choiceId)}
            />
        );
    }

    // Multiple Answer
    if (isMultipleAnswerQuestion(question)) {
        const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
        return (
            <MultipleAnswer
                question={question}
                userAnswers={currentAnswers as string[]}
                disabled={isChecked}
                checkStates={checkResult?.choiceStates ?? null}
                onToggle={(choiceId) => {
                    const newAnswers = currentAnswers.includes(choiceId)
                        ? currentAnswers.filter((id) => id !== choiceId)
                        : [...currentAnswers, choiceId];
                    onAnswerChange(newAnswers);
                }}
            />
        );
    }

    // True/False
    if (isTrueFalseQuestion(question)) {
        return (
            <TrueFalse
                question={question}
                userAnswer={userAnswer === "true" || userAnswer === "false" ? userAnswer : null}
                disabled={isChecked}
                checkResult={checkResult?.trueFalseResult ?? null}
                onSelect={(value) => onAnswerChange(value)}
            />
        );
    }

    // Fill in the Blank
    if (isFillBlankQuestion(question)) {
        const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
        return (
            <FillBlank
                question={question}
                userAnswers={currentAnswers as string[]}
                disabled={isChecked}
                checkResults={checkResult?.blankResults ?? null}
                onBlankChange={(index, value) => {
                    const newAnswers = [...currentAnswers];
                    newAnswers[index] = value;
                    onAnswerChange(newAnswers);
                }}
            />
        );
    }

    // Dropdown
    if (isDropdownQuestion(question)) {
        const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
        return (
            <Dropdown
                question={question}
                userAnswers={currentAnswers as string[]}
                disabled={isChecked}
                checkResults={checkResult?.dropdownResults ?? null}
                onSelect={(index, choiceId) => {
                    const newAnswers = [...currentAnswers];
                    newAnswers[index] = choiceId;
                    onAnswerChange(newAnswers);
                }}
            />
        );
    }

    // Free Text
    if (isFreeTextQuestion(question)) {
        const currentAnswer = typeof userAnswer === "string" ? userAnswer : "";
        return (
            <FreeText
                question={question}
                userAnswer={currentAnswer}
                disabled={isChecked}
                checkResult={checkResult?.freeTextResult ?? null}
                onAnswerChange={(value) => onAnswerChange(value)}
            />
        );
    }

    // Numeric
    if (isNumericQuestion(question)) {
        const currentAnswer = typeof userAnswer === "string" ? userAnswer : "";
        return (
            <Numeric
                question={question}
                userAnswer={currentAnswer}
                disabled={isChecked}
                checkResult={checkResult?.numericResult ?? null}
                onAnswerChange={(value) => onAnswerChange(value)}
            />
        );
    }

    // File Upload
    if (isFileUploadQuestion(question)) {
        const currentAnswer = typeof userAnswer === "string" ? userAnswer : null;
        return (
            <FileUpload
                question={question}
                userAnswer={currentAnswer}
                disabled={isChecked}
                checkResult={checkResult?.fileUploadResult ?? null}
                onFileUpload={(file) => {
                    // For now, just store the file name as the answer
                    // Actual file upload to server would happen elsewhere
                    onAnswerChange(file?.name ?? null);
                }}
            />
        );
    }

    // Fallback
    return <div className="mt-5 space-y-3">Unsupported question type</div>;
}

export default QuestionCard;

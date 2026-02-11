"use client";

import React, { useCallback } from "react";

import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RichTextViewer } from "@/components/ui/RichTextViewer";
import { RichTextWithPlaceholders } from "@/components/ui/RichTextWithPlaceholders";

import { cn } from "@/lib/utils";

import type { BlankResult, FillBlankQuestion } from "@/types/quiz";

// Fill-blank input base styles
const fillBlankInputBase =
    "inline-block w-32 px-3 py-1 text-center border-b-2 border-border bg-transparent focus:outline-none focus:border-primary";
const fillBlankNumericBase =
    "w-20 px-2 py-1 text-center border-b-2 border-border bg-transparent focus:outline-none focus:border-primary";
const fillBlankCorrect = "border-success bg-correct";
const fillBlankIncorrect = "border-destructive bg-incorrect";

// Correct answer hint styling
const correctAnswerHintStyle = "ml-2 text-sm text-success font-medium";

export interface FillBlankProps {
    /** The question data */
    question: FillBlankQuestion;
    /** Current answers for each blank (array indexed by position) */
    userAnswers: string[];
    /** Whether inputs are disabled */
    disabled: boolean;
    /** Check results for each blank (after checking answer) */
    checkResults: BlankResult[] | null;
    /** Callback when a blank value changes */
    onBlankChange: (index: number, value: string) => void;
}

/**
 * Fill in the blank question component
 * Supports both inline text blanks and numeric blanks with +/- buttons
 */
export function FillBlank({
    question,
    userAnswers,
    disabled,
    checkResults,
    onBlankChange,
}: FillBlankProps) {
    const isNumeric = question.numeric || false;
    const isInline = question.inline !== false; // Default to inline mode

    // Handle numeric increment/decrement
    const adjustNumericValue = useCallback(
        (index: number, delta: number) => {
            const currentValue = parseFloat(userAnswers[index] || "0") || 0;
            const newValue = currentValue + delta;
            onBlankChange(index, String(newValue));
        },
        [userAnswers, onBlankChange]
    );

    // Render a placeholder input at the given index
    const renderPlaceholder = useCallback(
        (index: number) => {
            const currentValue = userAnswers[index] || "";
            const blankResult = checkResults?.[index];

            if (isNumeric) {
                return (
                    <NumericBlankInput
                        index={index}
                        value={currentValue}
                        disabled={disabled}
                        checkResult={blankResult}
                        onChange={(value) => onBlankChange(index, value)}
                        onAdjust={(delta) => adjustNumericValue(index, delta)}
                    />
                );
            }

            return (
                <TextBlankInput
                    index={index}
                    value={currentValue}
                    disabled={disabled}
                    checkResult={blankResult}
                    onChange={(value) => onBlankChange(index, value)}
                />
            );
        },
        [userAnswers, checkResults, isNumeric, disabled, onBlankChange, adjustNumericValue]
    );

    // Legacy mode: single input below question text
    if (!isInline) {
        const currentValue = userAnswers[0] || "";
        const blankResult = checkResults?.[0];

        return (
            <div className="answers fill-blank-answers">
                <RichTextViewer
                    content={question.text}
                    className="question-text-content mb-3"
                />
                <div className="inline-flex items-center gap-2">
                    <Input
                        type="text"
                        className={cn(
                            fillBlankInputBase,
                            blankResult?.isCorrect === true && fillBlankCorrect,
                            blankResult?.isCorrect === false && fillBlankIncorrect
                        )}
                        placeholder="Type your answer here..."
                        value={currentValue}
                        disabled={disabled}
                        onChange={(e) => onBlankChange(0, e.target.value)}
                    />
                    {blankResult && !blankResult.isCorrect && blankResult.correctAnswer && (
                        <span className={correctAnswerHintStyle}>
                            <strong>{blankResult.correctAnswer}</strong>
                        </span>
                    )}
                </div>
            </div>
        );
    }

    // Inline mode: rich text with embedded inputs at {blank} placeholders
    return (
        <div className="answers fill-blank-answers fill-blank-inline">
            <RichTextWithPlaceholders
                content={question.text}
                placeholderPattern="{blank}"
                renderPlaceholder={renderPlaceholder}
                className="text-base leading-loose"
            />
        </div>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

interface TextBlankInputProps {
    index: number;
    value: string;
    disabled: boolean;
    checkResult?: BlankResult;
    onChange: (value: string) => void;
}

function TextBlankInput({ index, value, disabled, checkResult, onChange }: TextBlankInputProps) {
    return (
        <span className="inline-flex items-center mx-1">
            <input
                type="text"
                className={cn(
                    fillBlankInputBase,
                    checkResult?.isCorrect === true && fillBlankCorrect,
                    checkResult?.isCorrect === false && fillBlankIncorrect
                )}
                data-blank-index={index}
                value={value}
                disabled={disabled}
                placeholder="..."
                autoComplete="off"
                onChange={(e) => onChange(e.target.value)}
            />
            {checkResult && !checkResult.isCorrect && checkResult.correctAnswer && (
                <span className={correctAnswerHintStyle}>
                    <strong>{checkResult.correctAnswer}</strong>
                </span>
            )}
        </span>
    );
}

interface NumericBlankInputProps {
    index: number;
    value: string;
    disabled: boolean;
    checkResult?: BlankResult;
    onChange: (value: string) => void;
    onAdjust: (delta: number) => void;
}

function NumericBlankInput({
    index,
    value,
    disabled,
    checkResult,
    onChange,
    onAdjust,
}: NumericBlankInputProps) {
    return (
        <span className="inline-flex items-center gap-1 mx-1">
            <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="w-8 h-8 flex items-center justify-center rounded"
                disabled={disabled}
                onClick={() => onAdjust(-1)}
                aria-label="Decrease value"
            >
                <MinusIcon className="h-3 w-3" />
            </Button>
            <input
                type="number"
                className={cn(
                    fillBlankNumericBase,
                    checkResult?.isCorrect === true && fillBlankCorrect,
                    checkResult?.isCorrect === false && fillBlankIncorrect
                )}
                data-blank-index={index}
                value={value}
                disabled={disabled}
                step="any"
                autoComplete="off"
                onChange={(e) => onChange(e.target.value)}
            />
            <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="w-8 h-8 flex items-center justify-center rounded"
                disabled={disabled}
                onClick={() => onAdjust(1)}
                aria-label="Increase value"
            >
                <PlusIcon className="h-3 w-3" />
            </Button>
            {checkResult && !checkResult.isCorrect && checkResult.correctAnswer && (
                <span className={correctAnswerHintStyle}>
                    <strong>{checkResult.correctAnswer}</strong>
                </span>
            )}
        </span>
    );
}

export default FillBlank;

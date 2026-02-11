"use client";

import React, { useCallback } from "react";

import { RichTextWithPlaceholders } from "@/components/ui/RichTextWithPlaceholders";

import { cn } from "@/lib/utils";

import type { DropdownQuestion } from "@/types/quiz";
import { getPlainText } from "@/types/rich-text";

// Inline dropdown select base styles
const inlineDropdownBase =
    "px-3 py-1 border-2 border-border rounded-md bg-card text-foreground focus:outline-none focus:border-primary cursor-pointer";
const dropdownCorrect = "border-success bg-correct";
const dropdownIncorrect = "border-destructive bg-incorrect";

// Correct answer hint styling
const correctAnswerHintStyle = "ml-2 text-sm text-success font-medium";

export interface DropdownCheckResult {
    isCorrect: boolean;
    correctAnswer: string;
}

export interface DropdownProps {
    /** The question data */
    question: DropdownQuestion;
    /** Current selections for each dropdown (array of choice IDs) */
    userAnswers: string[];
    /** Whether inputs are disabled */
    disabled: boolean;
    /** Check results for each dropdown (after checking answer) */
    checkResults: DropdownCheckResult[] | null;
    /** Callback when a dropdown selection changes */
    onSelect: (index: number, choiceId: string) => void;
}

/**
 * Dropdown question component
 * Renders inline select elements within the question text
 */
export function Dropdown({
    question,
    userAnswers,
    disabled,
    checkResults,
    onSelect,
}: DropdownProps) {
    // Render a placeholder dropdown at the given index
    const renderPlaceholder = useCallback(
        (index: number) => {
            const currentValue = userAnswers[index] || "";
            const checkResult = checkResults?.[index];

            return (
                <InlineDropdown
                    index={index}
                    choices={question.choices}
                    value={currentValue}
                    disabled={disabled}
                    checkResult={checkResult}
                    onChange={(value) => onSelect(index, value)}
                />
            );
        },
        [question.choices, userAnswers, disabled, checkResults, onSelect]
    );

    // Render rich text with embedded dropdown selects at {dropdown} placeholders
    return (
        <div className="answers dropdown-answers">
            <RichTextWithPlaceholders
                content={question.text}
                placeholderPattern="{dropdown}"
                renderPlaceholder={renderPlaceholder}
                className="text-base leading-loose"
            />
        </div>
    );
}

// ============================================================================
// Sub-component
// ============================================================================

interface InlineDropdownProps {
    index: number;
    choices: DropdownQuestion["choices"];
    value: string;
    disabled: boolean;
    checkResult?: DropdownCheckResult;
    onChange: (value: string) => void;
}

function InlineDropdown({
    index,
    choices,
    value,
    disabled,
    checkResult,
    onChange,
}: InlineDropdownProps) {
    return (
        <span className="inline-flex items-center mx-1">
            <select
                className={cn(
                    inlineDropdownBase,
                    checkResult?.isCorrect === true && dropdownCorrect,
                    checkResult?.isCorrect === false && dropdownIncorrect
                )}
                data-dropdown-index={index}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">-- Select --</option>
                {choices.map((choice) => (
                    <option key={choice.id} value={choice.id}>
                        {getPlainText(choice.text)}
                    </option>
                ))}
            </select>
            {checkResult && !checkResult.isCorrect && checkResult.correctAnswer && (
                <span className={correctAnswerHintStyle}>
                    <strong>{checkResult.correctAnswer}</strong>
                </span>
            )}
        </span>
    );
}

export default Dropdown;

"use client";

import React from "react";

import { InlineTextViewer } from "@/components/ui/RichTextViewer";

import { cn } from "@/lib/utils";

import type { RichTextContent } from "@/types/rich-text";

export type CheckState = "correct" | "incorrect" | null;

// Answer choice container styles
const answerBase =
    "flex items-center gap-3 p-3.5 px-4 border-2 border-border rounded-lg cursor-pointer transition-all duration-200 bg-card hover:bg-muted hover:border-primary hover:translate-x-1";
const answerSelected =
    "bg-primary-light border-primary shadow-[0_0_0_3px_rgba(3,116,181,0.1)] dark:shadow-[0_0_0_3px_rgba(91,179,232,0.1)]";
const answerDisabled = "pointer-events-none opacity-75";
const answerCorrect = "bg-correct border-2 border-dashed !border-correct-foreground";
const answerIncorrect = "bg-incorrect border-2 border-dashed !border-incorrect-foreground";

// User answer tag styles
const userAnswerTagStyle = "text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground";

export interface AnswerChoiceProps {
    /** Type of input - radio for single select, checkbox for multiple */
    type: "radio" | "checkbox";
    /** Question ID for input name grouping */
    questionId: string;
    /** Choice ID for input value */
    choiceId: string;
    /** Display text (RichTextContent from Lexical or plain string) */
    text: RichTextContent;
    /** Whether this choice is currently selected */
    selected: boolean;
    /** Whether the input is disabled (e.g., after checking answer) */
    disabled: boolean;
    /** Check answer state - shows correct/incorrect styling */
    checkState?: CheckState;
    /** Whether to show "Your Answer" tag */
    showUserTag?: boolean;
    /** Callback when selection changes */
    onChange: (choiceId: string) => void;
    /** Optional className for additional styling */
    className?: string;
}

/**
 * Reusable answer choice component for radio/checkbox inputs
 * Used by MultipleChoice, MultipleAnswer, and TrueFalse question types
 */
export function AnswerChoice({
    type,
    questionId,
    choiceId,
    text,
    selected,
    disabled,
    checkState,
    showUserTag = false,
    onChange,
    className,
}: AnswerChoiceProps) {
    const inputId = `answer_${questionId}_${choiceId}`;

    const handleChange = () => {
        if (!disabled) {
            onChange(choiceId);
        }
    };

    return (
        <div
            className={cn(
                answerBase,
                type === "checkbox" && "multiple-answer",
                selected && answerSelected,
                checkState === "correct" && answerCorrect,
                checkState === "incorrect" && answerIncorrect,
                disabled && answerDisabled,
                className
            )}
            onClick={handleChange}
        >
            <span className="flex-shrink-0">
                <input
                    type={type}
                    name={`question_${questionId}`}
                    value={choiceId}
                    id={inputId}
                    checked={selected}
                    disabled={disabled}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary focus:ring-primary border-border"
                    aria-describedby={showUserTag ? `${inputId}-tag` : undefined}
                />
            </span>
            <label className="flex-1 text-sm leading-relaxed" htmlFor={inputId}>
                <InlineTextViewer content={text} />
            </label>
            {showUserTag && (
                <span id={`${inputId}-tag`} className={userAnswerTagStyle}>
                    Your Answer
                </span>
            )}
        </div>
    );
}

export default AnswerChoice;

"use client";

import React from "react";

import { cn } from "@/lib/utils";

import type { TrueFalseQuestion } from "@/types/quiz";

export interface TrueFalseProps {
    /** The question data */
    question: TrueFalseQuestion;
    /** Currently selected answer */
    userAnswer: "true" | "false" | null;
    /** Whether inputs are disabled */
    disabled: boolean;
    /** Check result for the user's answer */
    checkResult: {
        isCorrect: boolean;
        correctAnswer: boolean;
    } | null;
    /** Callback when an answer is selected */
    onSelect: (value: "true" | "false") => void;
}

// Base styles for tf-option button
const tfOptionBase =
    "flex-1 flex flex-col items-center justify-center gap-2 py-4 px-6 border-2 border-border rounded-lg bg-card transition-all duration-200 cursor-pointer hover:border-primary hover:bg-muted";

// State-specific styles
const tfOptionSelected =
    "border-primary bg-primary-light shadow-[0_0_0_3px_rgba(3,116,181,0.1)] dark:shadow-[0_0_0_3px_rgba(91,179,232,0.1)]";
const tfOptionDisabled = "pointer-events-none opacity-75";
const tfOptionCorrect = "bg-correct border-2 border-dashed !border-correct-foreground";
const tfOptionIncorrect = "bg-incorrect border-2 border-dashed !border-incorrect-foreground";

/**
 * True/False question component - two styled buttons
 */
export function TrueFalse({ userAnswer, disabled, checkResult, onSelect }: TrueFalseProps) {
    const getButtonState = (value: "true" | "false") => {
        const isSelected = userAnswer === value;
        const correctValue = checkResult?.correctAnswer ? "true" : "false";

        if (!checkResult) {
            return { isCorrect: null, showUserTag: false };
        }

        // This is the correct answer
        if (value === correctValue) {
            return { isCorrect: true, showUserTag: isSelected };
        }

        // This is incorrect and was selected
        if (isSelected && value !== correctValue) {
            return { isCorrect: false, showUserTag: true };
        }

        return { isCorrect: null, showUserTag: false };
    };

    const trueState = getButtonState("true");
    const falseState = getButtonState("false");

    return (
        <div className="answers true-false-answers">
            {/* tf-options: flex gap-4 */}
            <div className="flex gap-4">
                <button
                    type="button"
                    className={cn(
                        tfOptionBase,
                        userAnswer === "true" && tfOptionSelected,
                        trueState.isCorrect === true && tfOptionCorrect,
                        trueState.isCorrect === false && tfOptionIncorrect,
                        disabled && tfOptionDisabled
                    )}
                    disabled={disabled}
                    onClick={() => !disabled && onSelect("true")}
                    aria-pressed={userAnswer === "true"}
                >
                    {/* tf-label: text-lg font-semibold */}
                    <span className="text-lg font-semibold">True</span>
                    {trueState.showUserTag && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                            Your Answer
                        </span>
                    )}
                </button>

                <button
                    type="button"
                    className={cn(
                        tfOptionBase,
                        userAnswer === "false" && tfOptionSelected,
                        falseState.isCorrect === true && tfOptionCorrect,
                        falseState.isCorrect === false && tfOptionIncorrect,
                        disabled && tfOptionDisabled
                    )}
                    disabled={disabled}
                    onClick={() => !disabled && onSelect("false")}
                    aria-pressed={userAnswer === "false"}
                >
                    {/* tf-label: text-lg font-semibold */}
                    <span className="text-lg font-semibold">False</span>
                    {falseState.showUserTag && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                            Your Answer
                        </span>
                    )}
                </button>
            </div>
        </div>
    );
}

export default TrueFalse;

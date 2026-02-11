"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { RichTextViewer } from "@/components/ui/RichTextViewer";

import { cn } from "@/lib/utils";

import type { NumericQuestion } from "@/types/quiz";

export interface NumericCheckResult {
    isCorrect: boolean;
    correctAnswer: number;
    tolerance: number | null;
    userAnswer: number | null;
}

export interface NumericProps {
    /** The question data */
    question: NumericQuestion;
    /** Current user answer (as string for input handling) */
    userAnswer: string;
    /** Whether input is disabled */
    disabled: boolean;
    /** Check result (after checking answer) */
    checkResult: NumericCheckResult | null;
    /** Callback when answer changes */
    onAnswerChange: (value: string) => void;
}

/**
 * Numeric question component
 * Renders a number input with optional unit display
 */
export function Numeric({
    question,
    userAnswer,
    disabled,
    checkResult,
    onAnswerChange,
}: NumericProps) {
    const hasUnit = question.unit && question.unit.trim() !== "";

    // Format the correct answer display
    const formatCorrectAnswer = () => {
        if (!checkResult) return null;

        const { correctAnswer, tolerance } = checkResult;
        if (tolerance !== null && tolerance > 0) {
            return `${correctAnswer} ± ${tolerance}${hasUnit ? ` ${question.unit}` : ""}`;
        }
        return `${correctAnswer}${hasUnit ? ` ${question.unit}` : ""}`;
    };

    return (
        <div className="answers numeric-answers">
            {/* Question text */}
            <RichTextViewer content={question.text} className="question_text mb-4" />

            {/* Input with optional unit */}
            <div className="flex items-center gap-2">
                <Input
                    type="number"
                    step="any"
                    value={userAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    disabled={disabled}
                    placeholder="Enter your answer..."
                    className={cn(
                        "w-40",
                        checkResult?.isCorrect === true && "border-success bg-success/10",
                        checkResult?.isCorrect === false && "border-destructive bg-destructive/10"
                    )}
                />
                {hasUnit && (
                    <span className="text-muted-foreground font-medium">{question.unit}</span>
                )}
            </div>

            {/* Show correct answer when checked and incorrect */}
            {checkResult && !checkResult.isCorrect && (
                <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Correct answer: </span>
                    <span className="font-medium text-success">{formatCorrectAnswer()}</span>
                </div>
            )}

            {/* Show tolerance info when checked and correct */}
            {checkResult?.isCorrect &&
                checkResult.tolerance !== null &&
                checkResult.tolerance > 0 && (
                    <div className="mt-2 text-sm text-success">
                        Correct! (within ± {checkResult.tolerance} tolerance)
                    </div>
                )}
        </div>
    );
}

export default Numeric;

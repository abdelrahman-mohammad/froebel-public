"use client";

import React, { useState } from "react";

import { CheckCircle, ChevronDown, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { cn } from "@/lib/utils";

import type { AnswerResultDTO } from "@/lib/quiz/types";

export interface QuestionResultCardProps {
    /** Question number (1-based) */
    questionNumber: number;
    /** Answer result from backend */
    result: AnswerResultDTO;
    /** Whether to start expanded */
    defaultOpen?: boolean;
}

/**
 * Format question type for display
 */
function formatQuestionType(type: string): string {
    return type
        .toLowerCase()
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

/**
 * Format user answer for display based on question type
 */
function formatUserAnswer(result: AnswerResultDTO): string {
    const { userAnswer, questionType } = result;

    switch (questionType) {
        case "MULTIPLE_CHOICE":
        case "MULTIPLE_ANSWER":
        case "DROPDOWN":
            return userAnswer.selectedChoices?.join(", ") || "No answer";

        case "TRUE_FALSE":
            if (userAnswer.booleanAnswer === undefined) return "No answer";
            return userAnswer.booleanAnswer ? "True" : "False";

        case "FILL_IN_BLANK":
            return userAnswer.textAnswers?.join(", ") || "No answer";

        case "FREE_TEXT":
            return userAnswer.textAnswer || "No answer";

        case "NUMERIC":
            return userAnswer.textAnswer || "No answer";

        case "FILE_UPLOAD":
            // File uploads show filename or "No file uploaded"
            return userAnswer.fileId ? `File: ${userAnswer.fileId}` : "No file uploaded";

        default:
            return JSON.stringify(userAnswer);
    }
}

/**
 * Format correct answer for display based on question type
 */
function formatCorrectAnswer(result: AnswerResultDTO): string | null {
    const { correctAnswer, questionType } = result;

    if (!correctAnswer) return null;

    switch (questionType) {
        case "MULTIPLE_CHOICE":
        case "MULTIPLE_ANSWER":
        case "DROPDOWN":
            // Find correct choices
            const correctChoices = correctAnswer.choices?.filter((c) => c.correct);
            return correctChoices?.map((c) => c.text).join(", ") || null;

        case "TRUE_FALSE":
            if (correctAnswer.correct === undefined) return null;
            return correctAnswer.correct ? "True" : "False";

        case "FILL_IN_BLANK":
            return correctAnswer.answers?.join(", ") || null;

        case "FREE_TEXT":
        case "NUMERIC":
            return correctAnswer.answers?.[0] || null;

        case "FILE_UPLOAD":
            // File uploads require manual grading - no "correct answer" to display
            return "(Requires manual review)";

        default:
            return null;
    }
}

/**
 * Card displaying a single question result in the breakdown
 * Collapsible to show details (user answer vs correct answer)
 */
export function QuestionResultCard({
    questionNumber,
    result,
    defaultOpen = false,
}: QuestionResultCardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const userAnswer = formatUserAnswer(result);
    const correctAnswer = formatCorrectAnswer(result);
    const isPending = result.questionType === "FREE_TEXT" && result.pointsEarned === 0;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="w-full">
                <div
                    className={cn(
                        "flex items-center justify-between p-4 rounded-lg border transition-colors",
                        "hover:bg-muted/50",
                        result.correct
                            ? "border-success/30 bg-success/5"
                            : "border-destructive/30 bg-destructive/5"
                    )}
                >
                    {/* Left side: Question number and text */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Correct/Incorrect icon */}
                        {result.correct ? (
                            <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                        ) : (
                            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                        )}

                        {/* Question number and type */}
                        <div className="flex flex-col items-start min-w-0">
                            <span className="font-medium text-sm">Question {questionNumber}</span>
                            <span className="text-xs text-muted-foreground">
                                {formatQuestionType(result.questionType)}
                            </span>
                        </div>
                    </div>

                    {/* Right side: Points and expand icon */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* AI grading pending badge */}
                        {isPending && (
                            <Badge variant="secondary" className="text-xs">
                                AI Pending
                            </Badge>
                        )}

                        {/* Points */}
                        <div className="text-right">
                            <span
                                className={cn(
                                    "font-semibold",
                                    result.correct ? "text-success" : "text-destructive"
                                )}
                            >
                                {result.pointsEarned}
                            </span>
                            <span className="text-muted-foreground">/{result.pointsPossible}</span>
                        </div>

                        {/* Expand/collapse icon */}
                        <ChevronDown
                            className={cn(
                                "h-4 w-4 text-muted-foreground transition-transform",
                                isOpen && "rotate-180"
                            )}
                        />
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
                <div className="px-4 pb-4 pt-2 ml-8 space-y-3 text-sm">
                    {/* Question text */}
                    <div>
                        <span className="text-muted-foreground font-medium">Question: </span>
                        <span>{result.questionText}</span>
                    </div>

                    {/* User answer */}
                    <div>
                        <span className="text-muted-foreground font-medium">Your answer: </span>
                        <span
                            className={cn(
                                result.correct ? "text-success" : "text-destructive",
                                "font-medium"
                            )}
                        >
                            {userAnswer}
                        </span>
                    </div>

                    {/* Correct answer (only if user was wrong and we have the answer) */}
                    {!result.correct && correctAnswer && (
                        <div>
                            <span className="text-muted-foreground font-medium">
                                Correct answer:{" "}
                            </span>
                            <span className="text-success font-medium">{correctAnswer}</span>
                        </div>
                    )}
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}

export default QuestionResultCard;

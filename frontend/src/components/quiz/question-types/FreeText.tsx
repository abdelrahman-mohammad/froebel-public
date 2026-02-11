"use client";

import React from "react";

import { AlertCircle, CheckCircle, Loader2, Sparkles, XCircle } from "lucide-react";

import { RichTextViewer } from "@/components/ui/RichTextViewer";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";

import type { FreeTextQuestion } from "@/types/quiz";

export interface FreeTextCheckResult {
    isCorrect: boolean;
    referenceAnswer?: string;
    feedback?: string;
    /** Normalized score 0-1 for partial credit */
    score?: number;
    /** Whether this was graded by AI */
    gradedByAI?: boolean;
    /** Whether AI grading is in progress */
    isGrading?: boolean;
    /** Error message if AI grading failed */
    aiError?: string;
}

export interface FreeTextProps {
    /** The question data */
    question: FreeTextQuestion;
    /** Current answer text */
    userAnswer: string;
    /** Whether input is disabled */
    disabled: boolean;
    /** Check result (after checking answer) */
    checkResult: FreeTextCheckResult | null;
    /** Callback when answer changes */
    onAnswerChange: (value: string) => void;
}

/**
 * Get the appropriate border/background class based on result
 */
function getResultStyles(checkResult: FreeTextCheckResult | null): string {
    if (!checkResult) return "";
    if (checkResult.isGrading) return "border-primary/50 bg-primary/5";
    if (checkResult.aiError) return "border-warning bg-warning/10";
    if (checkResult.isCorrect) return "border-success bg-correct/10";
    // Partial credit
    if (checkResult.score !== undefined && checkResult.score > 0 && checkResult.score < 1) {
        return "border-warning bg-warning/10";
    }
    return "border-destructive bg-incorrect/10";
}

/**
 * Free text / essay question component
 * Displays a textarea for long-form answers with AI grading support
 */
export function FreeText({
    question,
    userAnswer,
    disabled,
    checkResult,
    onAnswerChange,
}: FreeTextProps) {
    const hasScore = checkResult?.score !== undefined;
    const scorePercent = hasScore ? Math.round((checkResult.score ?? 0) * 100) : null;
    const isPartialCredit = hasScore && checkResult.score! > 0 && checkResult.score! < 1;

    return (
        <div className="answers free-text-answers">
            <RichTextViewer content={question.text} className="question-text-content mb-4" />

            {/* AI Grading Indicator */}
            {question.aiGradingEnabled && !checkResult && (
                <div className="ai-grading-indicator flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>AI grading enabled for this question</span>
                </div>
            )}

            <div className="free-text-container">
                <Textarea
                    className={cn(
                        "free-text-input min-h-[120px] resize-y",
                        getResultStyles(checkResult)
                    )}
                    placeholder="Type your answer here..."
                    value={userAnswer}
                    disabled={disabled || checkResult?.isGrading}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    rows={6}
                />

                {/* AI Grading Loading State */}
                {checkResult?.isGrading && (
                    <div className="ai-grading-loading flex items-center gap-2 mt-3 p-3 rounded-md bg-primary/10 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>AI is grading your answer...</span>
                    </div>
                )}

                {/* Result Badge */}
                {checkResult && !checkResult.isGrading && (
                    <div className="result-badge mt-3">
                        {checkResult.aiError ? (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-warning/10 text-sm text-warning-foreground">
                                <AlertCircle className="h-4 w-4 text-warning" />
                                <span>AI grading failed: {checkResult.aiError}</span>
                            </div>
                        ) : checkResult.isCorrect ? (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-correct/20 text-sm text-success">
                                <CheckCircle className="h-4 w-4" />
                                <span>Correct!</span>
                                {checkResult.gradedByAI && (
                                    <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                                        <Sparkles className="h-3 w-3" />
                                        Graded by AI
                                    </span>
                                )}
                            </div>
                        ) : isPartialCredit ? (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-warning/20 text-sm">
                                <AlertCircle className="h-4 w-4 text-warning" />
                                <span>Partially Correct ({scorePercent}%)</span>
                                {checkResult.gradedByAI && (
                                    <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                                        <Sparkles className="h-3 w-3" />
                                        Graded by AI
                                    </span>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-3 rounded-md bg-incorrect/20 text-sm text-destructive">
                                <XCircle className="h-4 w-4" />
                                <span>Incorrect</span>
                                {checkResult.gradedByAI && (
                                    <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                                        <Sparkles className="h-3 w-3" />
                                        Graded by AI
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* AI Feedback */}
                {checkResult?.feedback && !checkResult.isGrading && (
                    <div className="ai-feedback mt-2 p-3 rounded-md bg-muted/50 text-sm">
                        <div className="flex items-center gap-2 mb-1 font-medium">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Feedback
                        </div>
                        <p className="text-muted-foreground">{checkResult.feedback}</p>
                    </div>
                )}

                {/* Reference Answer */}
                {checkResult &&
                    !checkResult.isCorrect &&
                    !checkResult.isGrading &&
                    checkResult.referenceAnswer && (
                        <div className="correct-answer-hint mt-2 p-3 rounded-md bg-muted text-sm">
                            <strong>Reference Answer:</strong> {checkResult.referenceAnswer}
                        </div>
                    )}
            </div>
        </div>
    );
}

export default FreeText;

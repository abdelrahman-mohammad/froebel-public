"use client";

import React from "react";

import { CheckCircle, FlagIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface QuizProgressProps {
    /** Number of answered questions */
    answeredCount: number;
    /** Total number of questions */
    totalQuestions: number;
    /** Number of flagged questions */
    flaggedCount: number;
    /** Additional class name */
    className?: string;
}

/**
 * Quiz progress indicator
 * Shows answered count, progress bar, and flagged count
 */
export function QuizProgress({
    answeredCount,
    totalQuestions,
    flaggedCount,
    className,
}: QuizProgressProps) {
    const progressPercent =
        totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
        <div className={cn("flex flex-wrap items-center gap-4 py-3", className)}>
            {/* Answered count */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4" aria-hidden="true" />
                <span>
                    <strong className="text-foreground font-semibold">{answeredCount}</strong> of <strong className="text-foreground font-semibold">{totalQuestions}</strong> answered
                </span>
            </div>

            {/* Progress bar */}
            <div
                className="flex-1 h-2 min-w-[100px] rounded-full bg-muted overflow-hidden"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${progressPercent}% complete`}
            >
                <div
                    className="h-full transition-all duration-300 ease-out bg-gradient-to-b from-primary to-primary-dark"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Flagged count (only shown if > 0) */}
            {flaggedCount > 0 && (
                <div className="flex items-center gap-2 text-sm text-warning">
                    <FlagIcon className="w-4 h-4" aria-hidden="true" />
                    <span>
                        <strong className="font-semibold">{flaggedCount}</strong> flagged
                    </span>
                </div>
            )}
        </div>
    );
}

export default QuizProgress;

"use client";

import React, { useMemo, useState } from "react";

import {
    ArrowRight,
    Check,
    ChevronDown,
    ChevronUp,
    ChevronsUpDown,
    RefreshCw,
    Trophy,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useMemorize } from "@/contexts/MemorizeContext";

import { formatPercentage, getScoreColorClass } from "@/lib/memorize-utils";
import { cn } from "@/lib/utils";

/**
 * Batch results view after completing an assessment
 */
export function BatchResults() {
    const {
        state,
        isLastBatch,
        totalBatches,
        totalQuestions,
        completedQuestions,
        retryBatch,
        continueToNextBatch,
        finishMemorization,
    } = useMemorize();

    const [showReview, setShowReview] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Get the latest batch result
    const latestResult = state.batchResults[state.batchResults.length - 1];

    // Get all question IDs for expand/collapse all (must be before early return for React hooks rules)
    const allQuestionIds = useMemo(
        () => latestResult?.questionResults.map((r) => r.questionId) ?? [],
        [latestResult?.questionResults]
    );

    // Early return after hooks
    if (!latestResult) {
        return null;
    }

    const colorClass = getScoreColorClass(latestResult.percentage);

    // Calculate cumulative percentage
    const cumulativePercentage =
        state.cumulativeResults.totalPoints > 0
            ? Math.round(
                  (state.cumulativeResults.earnedPoints / state.cumulativeResults.totalPoints) * 100
              )
            : 0;

    const handleRetry = () => {
        retryBatch();
    };

    const handleContinue = () => {
        if (isLastBatch) {
            finishMemorization();
        } else {
            continueToNextBatch();
        }
    };

    const toggleItem = (questionId: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(questionId)) {
                newSet.delete(questionId);
            } else {
                newSet.add(questionId);
            }
            return newSet;
        });
    };

    const expandAll = () => {
        setExpandedItems(new Set(allQuestionIds));
    };

    const collapseAll = () => {
        setExpandedItems(new Set());
    };

    const allExpanded = expandedItems.size === allQuestionIds.length;

    // Format answer for display
    const formatAnswer = (answer: unknown): string => {
        if (answer === null || answer === undefined) return "";
        if (typeof answer === "boolean") return answer ? "True" : "False";
        if (Array.isArray(answer)) {
            const filtered = answer.filter((a) => a !== null && a !== undefined && a !== "");
            return filtered.length > 0 ? filtered.join(", ") : "";
        }
        return String(answer);
    };

    // Get background color based on score
    const getScoreBgClass = (scoreClass: string) => {
        if (scoreClass === "score-high") return "bg-success/10";
        if (scoreClass === "score-medium") return "bg-warning/10";
        return "bg-destructive/10";
    };

    const getScoreTextClass = (scoreClass: string) => {
        if (scoreClass === "score-high") return "text-success";
        if (scoreClass === "score-medium") return "text-warning";
        return "text-destructive";
    };

    return (
        <div className="max-w-lg mx-auto text-center space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">Batch {latestResult.batchIndex + 1} Complete</h1>
            </div>

            {/* Score Display */}
            <div className={cn("flex flex-col items-center gap-2 p-6 rounded-lg", getScoreBgClass(colorClass))}>
                <span className={cn("text-5xl font-bold", getScoreTextClass(colorClass))}>
                    {formatPercentage(latestResult.percentage)}
                </span>
                <span className="text-lg text-muted-foreground">
                    {latestResult.correctCount} of {latestResult.totalQuestions} correct
                </span>
                <span className="text-sm text-muted-foreground">
                    {latestResult.earnedPoints} / {latestResult.totalPoints} points
                </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Batch Score</span>
                    <span>{formatPercentage(latestResult.percentage)}</span>
                </div>
                <div className="rounded-full overflow-hidden">
                    <Progress value={latestResult.percentage} className="h-3" />
                </div>
            </div>

            {/* Cumulative Progress */}
            <div className="p-4 rounded-lg bg-muted">
                <h3 className="text-sm font-semibold mb-3">Overall Progress</h3>
                <div className="flex justify-around gap-4">
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-foreground">{state.batchResults.length}</span>
                        <span className="text-xs text-muted-foreground">of {totalBatches} batches</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-foreground">{completedQuestions}</span>
                        <span className="text-xs text-muted-foreground">of {totalQuestions} questions</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-xl font-bold text-foreground">{formatPercentage(cumulativePercentage)}</span>
                        <span className="text-xs text-muted-foreground">overall</span>
                    </div>
                </div>
            </div>

            {/* Question Review Toggle */}
            <Button
                variant="ghost"
                onClick={() => setShowReview(!showReview)}
                className="w-full justify-center gap-2"
            >
                {showReview ? (
                    <>
                        <ChevronUp className="h-4 w-4" />
                        Hide Question Review
                    </>
                ) : (
                    <>
                        <ChevronDown className="h-4 w-4" />
                        Review Questions
                    </>
                )}
            </Button>

            {/* Question Review */}
            {showReview && (
                <div className="space-y-2 text-left">
                    {/* Expand/Collapse All Buttons */}
                    <div className="flex justify-end mb-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={allExpanded ? collapseAll : expandAll}
                            className="gap-1.5 text-xs"
                        >
                            <ChevronsUpDown className="h-3.5 w-3.5" />
                            {allExpanded ? "Collapse All" : "Expand All"}
                        </Button>
                    </div>

                    {latestResult.questionResults.map((result, index) => {
                        const isExpanded = expandedItems.has(result.questionId);
                        return (
                            <div
                                key={result.questionId}
                                className={cn(
                                    "flex flex-col rounded-lg border overflow-hidden",
                                    result.isCorrect
                                        ? "bg-success/5 border-success/20"
                                        : "bg-destructive/5 border-destructive/20"
                                )}
                            >
                                <button
                                    type="button"
                                    className="flex items-center gap-3 p-3 w-full text-left cursor-pointer transition-colors hover:bg-muted/50"
                                    onClick={() => toggleItem(result.questionId)}
                                >
                                    <div className={cn("shrink-0", result.isCorrect ? "text-success" : "text-destructive")}>
                                        {result.isCorrect ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <X className="h-4 w-4" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="font-semibold mr-2">Q{index + 1}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {isExpanded
                                                ? result.questionText
                                                : result.questionText.length > 80
                                                  ? result.questionText.substring(0, 80) + "..."
                                                  : result.questionText}
                                        </span>
                                    </div>
                                    <div className="text-sm font-medium">
                                        {result.earnedPoints}/{result.points} pts
                                    </div>
                                    <div className="text-muted-foreground">
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="px-3 pb-3 pt-0 pl-10 space-y-2">
                                        {formatAnswer(result.userAnswer) && (
                                            <div className="flex flex-col gap-0.5 text-sm">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Your answer:
                                                </span>
                                                <span className="font-medium text-primary">
                                                    {formatAnswer(result.userAnswer)}
                                                </span>
                                            </div>
                                        )}
                                        {formatAnswer(result.correctAnswer) && (
                                            <div className="flex flex-col gap-0.5 text-sm">
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    Correct answer:
                                                </span>
                                                <span className="font-medium text-success">
                                                    {formatAnswer(result.correctAnswer)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={handleRetry} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button onClick={handleContinue} className="gap-2">
                    {isLastBatch ? (
                        <>
                            <Trophy className="h-4 w-4" />
                            View Final Results
                        </>
                    ) : (
                        <>
                            <ArrowRight className="h-4 w-4" />
                            Continue to Next Batch
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default BatchResults;

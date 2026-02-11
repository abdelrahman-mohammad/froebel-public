"use client";

import React from "react";

import { useRouter } from "next/navigation";

import { CheckCircle2, Home, RefreshCw, Target, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { useMemorize } from "@/contexts/MemorizeContext";

import { formatPercentage, getScoreColorClass } from "@/lib/memorize-utils";
import { cn } from "@/lib/utils";

/**
 * Final summary view after completing all batches
 */
export function MemorizeSummary() {
    const router = useRouter();
    const { state, reset, totalQuestions } = useMemorize();

    // Calculate overall percentage
    const overallPercentage =
        state.cumulativeResults.totalPoints > 0
            ? Math.round(
                  (state.cumulativeResults.earnedPoints / state.cumulativeResults.totalPoints) * 100
              )
            : 0;

    const colorClass = getScoreColorClass(overallPercentage);

    const handleStartOver = () => {
        reset();
    };

    const handleGoHome = () => {
        reset();
        router.push("/");
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
            <div className="flex flex-col items-center gap-4">
                <Trophy className="h-16 w-16 text-warning" />
                <h1 className="text-2xl font-bold">Memorization Complete!</h1>
            </div>

            {/* Overall Score */}
            <div className={cn("flex flex-col items-center gap-2 p-8 rounded-lg", getScoreBgClass(colorClass))}>
                <span className={cn("text-6xl font-bold", getScoreTextClass(colorClass))}>{formatPercentage(overallPercentage)}</span>
                <span className="text-lg text-muted-foreground">Overall Accuracy</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-muted">
                    <CheckCircle2 className="h-6 w-6" />
                    <span className="text-2xl font-bold text-foreground">{state.cumulativeResults.correctCount}</span>
                    <span className="text-xs text-muted-foreground">Correct</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-muted">
                    <Target className="h-6 w-6" />
                    <span className="text-2xl font-bold text-foreground">{totalQuestions}</span>
                    <span className="text-xs text-muted-foreground">Total Questions</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-4 rounded-lg bg-muted">
                    <Trophy className="h-6 w-6" />
                    <span className="text-2xl font-bold text-foreground">{state.batchResults.length}</span>
                    <span className="text-xs text-muted-foreground">Batches Completed</span>
                </div>
            </div>

            {/* Batch Breakdown */}
            <div className="text-left space-y-3">
                <h2 className="text-lg font-semibold">Batch Breakdown</h2>
                <div className="space-y-2">
                    {state.batchResults.map((result) => {
                        return (
                            <div key={result.batchIndex} className="flex items-center gap-3">
                                <span className="w-20 text-sm font-medium">Batch {result.batchIndex + 1}</span>
                                <div className="flex-1">
                                    <Progress value={result.percentage} className="h-2" />
                                </div>
                                <span className="w-12 text-right text-sm font-medium">
                                    {formatPercentage(result.percentage)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Points Summary */}
            <div className="flex justify-between items-center p-4 rounded-lg bg-muted">
                <span>Total Points:</span>
                <span className="text-lg font-bold">
                    {state.cumulativeResults.earnedPoints} / {state.cumulativeResults.totalPoints}
                </span>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
                <Button variant="secondary" onClick={handleStartOver} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Start Over
                </Button>
                <Button onClick={handleGoHome} className="gap-2">
                    <Home className="h-4 w-4" />
                    Back to Home
                </Button>
            </div>
        </div>
    );
}

export default MemorizeSummary;

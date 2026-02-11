"use client";

import React, { useState } from "react";

import {
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Eye,
    Home,
    RefreshCw,
    Trophy,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import type { AttemptResultDTO } from "@/lib/quiz/types";
import type { Quiz } from "@/types/quiz";

import { QuestionResultCard } from "./QuestionResultCard";

interface QuizScore {
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
}

export interface QuizResultsProps {
    /** The quiz that was completed */
    quiz: Quiz;
    /** The final score (legacy, use result for full details) */
    score: QuizScore;
    /** Full attempt result from backend (includes per-question breakdown) */
    result?: AttemptResultDTO;
    /** Callback to retry the quiz */
    onRetry: () => void;
    /** Callback to go to home page */
    onGoHome: () => void;
    /** Callback to enter review mode (navigate through questions) */
    onReviewAnswers?: () => void;
}

/**
 * Get grade letter from percentage
 */
function getGrade(percentage: number): { letter: string; color: string } {
    if (percentage >= 90) return { letter: "A", color: "text-success" };
    if (percentage >= 80) return { letter: "B", color: "text-primary" };
    if (percentage >= 70) return { letter: "C", color: "text-warning" };
    if (percentage >= 60) return { letter: "D", color: "text-warning" };
    return { letter: "F", color: "text-destructive" };
}

/**
 * Get encouragement message based on score
 */
function getEncouragement(percentage: number): string {
    if (percentage === 100) return "Perfect score! Outstanding work!";
    if (percentage >= 90) return "Excellent performance!";
    if (percentage >= 80) return "Great job!";
    if (percentage >= 70) return "Good effort!";
    if (percentage >= 60) return "Not bad, keep practicing!";
    return "Keep studying and try again!";
}

/**
 * Quiz results display component
 * Shows score, grade, and encouragement after quiz submission
 */
export function QuizResults({
    quiz,
    score,
    result,
    onRetry,
    onGoHome,
    onReviewAnswers,
}: QuizResultsProps) {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const { earnedPoints, totalPoints, percentage } = score;
    const grade = getGrade(percentage);
    const encouragement = getEncouragement(percentage);
    const isPassing = percentage >= 60;

    // Check if we have per-question results to show
    const hasBreakdown = result?.answers && result.answers.length > 0;

    // Count correct/incorrect
    const correctCount = result?.answers?.filter((a) => a.correct).length ?? 0;
    const incorrectCount = (result?.answers?.length ?? 0) - correctCount;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <Trophy
                    className={cn(
                        "w-16 h-16 mx-auto",
                        isPassing ? "text-warning" : "text-muted-foreground"
                    )}
                />
                <h1 className="text-3xl font-bold">Quiz Complete!</h1>
                <p className="text-lg text-muted-foreground">{quiz.title}</p>
            </div>

            {/* Score Card */}
            <div className="bg-card border border-border rounded-xl p-8 space-y-4 shadow-lg text-center">
                <div className="flex justify-center">
                    <span className={cn("text-7xl font-bold", grade.color)}>{grade.letter}</span>
                </div>

                <div className="flex justify-center">
                    <span className="text-4xl font-semibold">{percentage}%</span>
                </div>

                <div className="flex items-baseline justify-center gap-1 text-lg text-muted-foreground">
                    <span className="text-2xl font-bold text-foreground">{earnedPoints}</span>
                    <span className="text-xl">/</span>
                    <span className="text-xl">{totalPoints}</span>
                    <span className="ml-1">points</span>
                </div>

                <div className="flex justify-center">
                    {isPassing ? (
                        <span className="flex items-center gap-2 text-success font-medium">
                            <CheckCircle className="h-5 w-5" />
                            Passed
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-destructive font-medium">
                            <XCircle className="h-5 w-5" />
                            Not Passed
                        </span>
                    )}
                </div>

                <p className="text-lg text-muted-foreground italic">{encouragement}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-center">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Questions</span>
                    <span className="text-xl font-semibold">{quiz.questions.length}</span>
                </div>
                {hasBreakdown && (
                    <>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Correct</span>
                            <span className="text-xl font-semibold text-success">{correctCount}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm text-muted-foreground">Incorrect</span>
                            <span className="text-xl font-semibold text-destructive">
                                {incorrectCount}
                            </span>
                        </div>
                    </>
                )}
                {quiz.timeLimit && (
                    <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Time Limit</span>
                        <span className="text-xl font-semibold">{quiz.timeLimit} min</span>
                    </div>
                )}
            </div>

            {/* Question Breakdown */}
            {hasBreakdown && (
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowBreakdown(!showBreakdown)}
                    >
                        {showBreakdown ? (
                            <>
                                <ChevronUp className="h-4 w-4" />
                                Hide Question Breakdown
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-4 w-4" />
                                Show Question Breakdown
                            </>
                        )}
                    </Button>

                    {showBreakdown && result.answers && (
                        <div className="space-y-2">
                            {result.answers.map((answer, index) => (
                                <QuestionResultCard
                                    key={answer.questionId}
                                    questionNumber={index + 1}
                                    result={answer}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-4">
                {onReviewAnswers && (
                    <Button onClick={onReviewAnswers} variant="secondary" size="lg">
                        <Eye className="h-4 w-4" />
                        Review Answers
                    </Button>
                )}
                <Button onClick={onRetry} variant="default" size="lg">
                    <RefreshCw className="h-4 w-4" />
                    Try Again
                </Button>
                <Button onClick={onGoHome} variant="outline" size="lg">
                    <Home className="h-4 w-4" />
                    Home
                </Button>
            </div>
        </div>
    );
}

export default QuizResults;

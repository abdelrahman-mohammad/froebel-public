"use client";

import React, { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, Clock, HelpCircle, Loader2, Play } from "lucide-react";

import { QuizPlayer, type QuizSubmitResults } from "@/components/quiz/QuizPlayer";
import { QuizErrorBoundary } from "@/components/quiz/QuizErrorBoundary";
import { QuizResults } from "@/components/quiz/QuizResults";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { QuizProvider } from "@/contexts/QuizContext";

import { useQuizAttempt } from "@/hooks/useQuizAttempt";

import { convertAttemptToReviewData } from "@/lib/quiz/result-converter";

export default function QuizPage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    // Hook for API-based quizzes
    const quizAttempt = useQuizAttempt();

    // Quiz flow state
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [email, setEmail] = useState("");
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showReview, setShowReview] = useState(false);

    // Load quiz on mount
    useEffect(() => {
        if (quizId) {
            quizAttempt.loadQuiz(quizId).catch(() => {
                // Error is handled in the hook
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    // Handle quiz start
    const handleStartQuiz = async () => {
        try {
            await quizAttempt.startAttempt(quizId, email || undefined);
            setShowStartScreen(false);
        } catch {
            // Error is handled in the hook
        }
    };

    // Handle quiz submission - submit answers to backend
    const handleSubmit = useCallback(
        async (results: QuizSubmitResults) => {
            setSubmitError(null);
            try {
                // Submit answers to backend for server-side scoring
                await quizAttempt.submitAttempt(results.userAnswers);
            } catch (err) {
                // If backend submission fails, show error but keep quiz state
                setSubmitError(
                    err instanceof Error ? err.message : "Failed to submit quiz. Please try again."
                );
            }
        },
        [quizAttempt]
    );

    // Handle retry
    const handleRetry = useCallback(() => {
        setShowStartScreen(true);
        setSubmitError(null);
        setShowReview(false);
        quizAttempt.reset();
        quizAttempt.loadQuiz(quizId);
    }, [quizId, quizAttempt]);

    // Handle review answers (enter review mode)
    const handleReviewAnswers = useCallback(() => {
        setShowReview(true);
    }, []);

    // Handle exit review (back to results)
    const handleExitReview = useCallback(() => {
        setShowReview(false);
    }, []);

    // Handle go home
    const handleGoHome = useCallback(() => {
        router.push("/");
    }, [router]);

    // Handle go to explore
    const handleGoExplore = useCallback(() => {
        router.push("/explore");
    }, [router]);

    // Loading state
    if (quizAttempt.isLoadingQuiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading quiz...</p>
            </div>
        );
    }

    // Error state
    if (quizAttempt.error && !quizAttempt.quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                        <AlertCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-bold">Error Loading Quiz</h1>
                    <p className="text-muted-foreground">{quizAttempt.error}</p>
                    <Button onClick={handleGoExplore} variant="outline">
                        <ArrowLeft className="h-4 w-4" />
                        Browse Quizzes
                    </Button>
                </div>
            </div>
        );
    }

    // Rate limited
    if (quizAttempt.isRateLimited) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-warning/10">
                        <AlertCircle className="w-8 h-8 text-warning" />
                    </div>
                    <h1 className="text-2xl font-bold">Attempt Limit Reached</h1>
                    <p className="text-muted-foreground">
                        You have reached the maximum number of attempts for this quiz. Please try
                        again later.
                    </p>
                    <Button onClick={handleGoExplore} variant="outline">
                        <ArrowLeft className="h-4 w-4" />
                        Browse Quizzes
                    </Button>
                </div>
            </div>
        );
    }

    // Show results (use backend result for scores)
    if (quizAttempt.result && quizAttempt.quiz) {
        // Review mode - show QuizPlayer with review data
        if (showReview) {
            const reviewData = convertAttemptToReviewData(quizAttempt.result, quizAttempt.quiz);
            return (
                <div className="container mx-auto px-4 py-8">
                    <QuizProvider initialQuiz={quizAttempt.quiz}>
                        <QuizErrorBoundary onRetry={handleExitReview}>
                            <QuizPlayer
                                reviewMode
                                reviewData={reviewData}
                                onExitReview={handleExitReview}
                            />
                        </QuizErrorBoundary>
                    </QuizProvider>
                </div>
            );
        }

        // Results screen
        const score = {
            earnedPoints: quizAttempt.result.score,
            totalPoints: quizAttempt.result.totalPoints,
            percentage: quizAttempt.result.percentage,
        };
        return (
            <div className="container mx-auto px-4 py-8">
                <QuizResults
                    quiz={quizAttempt.quiz}
                    score={score}
                    result={quizAttempt.result}
                    onRetry={handleRetry}
                    onGoHome={handleGoHome}
                    onReviewAnswers={handleReviewAnswers}
                />
            </div>
        );
    }

    // Start screen
    if (showStartScreen && quizAttempt.quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>{quizAttempt.quiz.title}</CardTitle>
                        {quizAttempt.quiz.description && (
                            <CardDescription>{quizAttempt.quiz.description}</CardDescription>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <HelpCircle className="h-4 w-4" />
                                <span>{quizAttempt.quiz.questions.length} questions</span>
                            </div>
                            {quizAttempt.quiz.timeLimit && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{quizAttempt.quiz.timeLimit} min</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email (optional)</label>
                            <Input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Providing your email helps track your attempts.
                            </p>
                        </div>

                        {quizAttempt.error && (
                            <div className="rounded-lg bg-destructive/10 text-destructive p-3 text-sm">
                                {quizAttempt.error}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                        <Button variant="outline" onClick={handleGoExplore}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStartQuiz}
                            disabled={quizAttempt.isStarting}
                            className="flex-1"
                        >
                            {quizAttempt.isStarting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Starting...
                                </>
                            ) : (
                                <>
                                    <Play className="h-4 w-4" />
                                    Start Quiz
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Submitting state
    if (quizAttempt.isSubmitting && quizAttempt.quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Submitting your answers...</p>
            </div>
        );
    }

    // Quiz in progress
    if (!showStartScreen && quizAttempt.quiz) {
        return (
            <div className="container mx-auto px-4 py-8">
                {submitError && (
                    <div className="mb-4 rounded-lg bg-destructive/10 text-destructive p-4 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                        <span>{submitError}</span>
                    </div>
                )}
                <QuizProvider initialQuiz={quizAttempt.quiz}>
                    <QuizErrorBoundary>
                        <QuizPlayer checkAnswerEnabled={false} onSubmit={handleSubmit} />
                    </QuizErrorBoundary>
                </QuizProvider>
            </div>
        );
    }

    // Fallback loading
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
        </div>
    );
}

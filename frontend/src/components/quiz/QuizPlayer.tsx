"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useQuiz } from "@/contexts/QuizContext";

import { useTimer } from "@/hooks/useTimer";

import { getChapterName, hasMultipleChapters } from "@/lib/chapter-utils";
import { type CheckResult, checkAnswer } from "@/lib/check-answer";

import type { UserAnswer, UserAnswers } from "@/types/quiz";

import type { QuestionReviewData } from "@/lib/quiz/result-converter";

import { QuestionCard } from "./QuestionCard";
import { QuestionNav } from "./QuestionNav";
import { QuizNavigation } from "./QuizNavigation";
import { QuizProgress } from "./QuizProgress";
import { Timer } from "./Timer";

/** Results passed to onSubmit callback */
export interface QuizSubmitResults {
    earnedPoints: number;
    totalPoints: number;
    percentage: number;
    userAnswers: UserAnswers;
}

export interface QuizPlayerProps {
    /** Whether check answer feature is enabled */
    checkAnswerEnabled?: boolean;
    /** Callback when quiz is submitted */
    onSubmit?: (results: QuizSubmitResults) => void;
    /** Whether this is a memorize mode assessment */
    isMemorizeAssessment?: boolean;
    /** Callback for memorize mode submission */
    onMemorizeSubmit?: () => void;
    /** Custom submit button text */
    submitButtonText?: string;
    /** Enable review mode - shows answers/results, disables inputs */
    reviewMode?: boolean;
    /** Pre-populated review data (from backend results) */
    reviewData?: QuestionReviewData[];
    /** Callback when exiting review mode */
    onExitReview?: () => void;
}

/**
 * Main quiz player component
 * Orchestrates all quiz components and manages quiz flow
 */
export function QuizPlayer({
    checkAnswerEnabled = true,
    onSubmit,
    isMemorizeAssessment = false,
    onMemorizeSubmit,
    submitButtonText,
    reviewMode = false,
    reviewData,
    onExitReview,
}: QuizPlayerProps) {
    const {
        state,
        currentQuestion,
        answeredCount: contextAnsweredCount,
        selectAnswer,
        toggleFlag,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        checkCurrentAnswer,
        submitQuiz,
    } = useQuiz();

    const { quiz, currentQuestionIndex, userAnswers, flaggedQuestions, checkedQuestions, isSubmitted } = state;

    // Track submission state to prevent double-submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isSubmittingRef = useRef(false);

    // Timer hook - disabled for memorize assessments and review mode
    const timer = useTimer({
        duration: (quiz?.timeLimit ?? 0) * 60, // Convert minutes to seconds
        enabled: !isMemorizeAssessment && !reviewMode && !!quiz?.timeLimit && quiz.timeLimit > 0,
        onExpire: () => {
            // Auto-submit when timer expires (guarded by ref to prevent race condition)
            if (!isSubmittingRef.current) {
                handleSubmit();
            }
        },
        autoStart: true,
    });

    // Disable check answer for memorize assessments and review mode
    const effectiveCheckAnswerEnabled = checkAnswerEnabled && !isMemorizeAssessment && !reviewMode;

    // Build review data lookup map
    const reviewDataMap = useMemo(() => {
        if (!reviewData) return null;
        const map = new Map<string, QuestionReviewData>();
        for (const item of reviewData) {
            map.set(item.questionId, item);
        }
        return map;
    }, [reviewData]);

    // Use answeredCount from context (already computed) and derive flaggedCount
    const answeredCount = contextAnsweredCount;
    const flaggedCount = flaggedQuestions.size;

    // Get check result for current question
    const currentCheckResult = useMemo((): CheckResult | null => {
        if (!currentQuestion) return null;

        // In review mode, use pre-populated review data
        if (reviewMode && reviewDataMap) {
            const reviewItem = reviewDataMap.get(currentQuestion.id);
            return reviewItem?.checkResult ?? null;
        }

        // Normal mode - only show if question was checked
        if (!checkedQuestions.has(currentQuestion.id)) {
            return null;
        }
        return checkAnswer(currentQuestion, userAnswers[currentQuestion.id] ?? null);
    }, [currentQuestion, checkedQuestions, userAnswers, reviewMode, reviewDataMap]);

    // Check if current question can be checked
    const canCheckCurrentAnswer = useMemo(() => {
        if (!effectiveCheckAnswerEnabled || !currentQuestion) return false;
        if (checkedQuestions.has(currentQuestion.id)) return false;

        const answer = userAnswers[currentQuestion.id];
        if (answer === null || answer === undefined) return false;
        if (typeof answer === "string") return answer !== "";
        if (Array.isArray(answer)) return answer.some((a) => a !== "");
        return false;
    }, [effectiveCheckAnswerEnabled, currentQuestion, checkedQuestions, userAnswers]);

    // Check if submit button should be shown (never in review mode)
    const showSubmit = useMemo(() => {
        if (!quiz || reviewMode) return false;
        // Show on last question or when all questions are answered
        const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
        const allAnswered = answeredCount === quiz.questions.length;
        return isLastQuestion || allAnswered;
    }, [quiz, currentQuestionIndex, answeredCount, reviewMode]);

    // Handlers
    const handleAnswerChange = useCallback(
        (answer: UserAnswer) => {
            // No answer changes allowed in review mode
            if (reviewMode) return;
            if (currentQuestion) {
                selectAnswer(currentQuestion.id, answer);
            }
        },
        [currentQuestion, selectAnswer, reviewMode]
    );

    const handleToggleFlag = useCallback(() => {
        if (currentQuestion) {
            toggleFlag(currentQuestion.id);
        }
    }, [currentQuestion, toggleFlag]);

    const handleCheck = useCallback(() => {
        if (currentQuestion) {
            checkCurrentAnswer(currentQuestion.id);
        }
    }, [currentQuestion, checkCurrentAnswer]);

    const handleSubmit = useCallback(() => {
        if (!quiz) return;

        // Prevent double-submission
        if (isSubmittingRef.current) return;
        isSubmittingRef.current = true;
        setIsSubmitting(true);

        // For memorize assessments, call the special handler
        if (isMemorizeAssessment && onMemorizeSubmit) {
            onMemorizeSubmit();
            return;
        }

        // Calculate final score (client-side for immediate feedback)
        let earnedPoints = 0;
        let totalPoints = 0;

        for (const question of quiz.questions) {
            const answer = userAnswers[question.id] ?? null;
            const result = checkAnswer(question, answer);
            earnedPoints += result.earnedPoints;
            totalPoints += result.maxPoints;
        }

        const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        submitQuiz();

        // Pass userAnswers so page can submit to backend
        onSubmit?.({
            earnedPoints,
            totalPoints,
            percentage,
            userAnswers,
        });
    }, [quiz, userAnswers, submitQuiz, onSubmit, isMemorizeAssessment, onMemorizeSubmit]);

    // Get chapter name (only shown when quiz has multiple chapters)
    // Must be before early return to comply with React Hooks rules
    const currentChapterName = useMemo(() => {
        if (!quiz || !currentQuestion) return undefined;
        if (!hasMultipleChapters(quiz) || !currentQuestion.chapter) {
            return undefined;
        }
        return getChapterName(quiz, currentQuestion.chapter);
    }, [quiz, currentQuestion]);

    // Loading state
    if (!quiz || !currentQuestion) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
                <p>Loading quiz...</p>
            </div>
        );
    }

    const totalQuestions = quiz.questions.length;

    // In review mode, get user answer from review data; otherwise from quiz context
    const currentUserAnswer = useMemo(() => {
        if (reviewMode && reviewDataMap) {
            const reviewItem = reviewDataMap.get(currentQuestion.id);
            return reviewItem?.userAnswer ?? null;
        }
        return userAnswers[currentQuestion.id] ?? null;
    }, [reviewMode, reviewDataMap, currentQuestion.id, userAnswers]);

    const isCurrentFlagged = flaggedQuestions.has(currentQuestion.id);
    // In review mode, always show as checked (to display results)
    const isCurrentChecked = reviewMode || checkedQuestions.has(currentQuestion.id);

    return (
        <div className="space-y-4">
            {/* Quiz Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border sm:text-left text-center">
                <div className="flex items-center gap-3">
                    {reviewMode && onExitReview && (
                        <Button variant="ghost" size="icon" onClick={onExitReview}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                    {reviewMode && (
                        <Badge variant="secondary">Review Mode</Badge>
                    )}
                </div>
                {!reviewMode && timer.isRunning && (
                    <Timer
                        timeRemaining={timer.timeRemaining}
                        isWarning={timer.isWarning}
                        isRunning={timer.isRunning}
                    />
                )}
            </div>

            {/* Question Navigation */}
            <QuestionNav
                questions={quiz.questions}
                currentIndex={currentQuestionIndex}
                userAnswers={userAnswers}
                flaggedQuestions={flaggedQuestions}
                onNavigate={goToQuestion}
            />

            {/* Progress */}
            <QuizProgress
                answeredCount={answeredCount}
                totalQuestions={totalQuestions}
                flaggedCount={flaggedCount}
            />

            {/* Current Question */}
            <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={totalQuestions}
                userAnswer={currentUserAnswer}
                isFlagged={isCurrentFlagged}
                isChecked={isCurrentChecked}
                checkResult={currentCheckResult}
                chapterName={currentChapterName}
                isSubmitted={isSubmitted || reviewMode}
                onAnswerChange={handleAnswerChange}
                onToggleFlag={handleToggleFlag}
            />

            {/* Navigation Controls */}
            <QuizNavigation
                currentIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                canCheck={canCheckCurrentAnswer}
                isChecked={isCurrentChecked}
                showSubmit={showSubmit}
                isSubmitting={isSubmitting}
                onPrevious={previousQuestion}
                onNext={nextQuestion}
                onCheck={handleCheck}
                onSubmit={handleSubmit}
                submitText={submitButtonText}
            />
        </div>
    );
}

export default QuizPlayer;

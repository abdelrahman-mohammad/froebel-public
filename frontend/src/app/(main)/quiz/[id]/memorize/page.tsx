"use client";

import React, { useCallback, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

import { BatchResults } from "@/components/memorize/BatchResults";
import { MemorizeAssessment } from "@/components/memorize/MemorizeAssessment";
import { MemorizeSettings } from "@/components/memorize/MemorizeSettings";
import { MemorizeSummary } from "@/components/memorize/MemorizeSummary";
import { MemorizeView } from "@/components/memorize/MemorizeView";
import { Button } from "@/components/ui/button";

import { MemorizeProvider, useMemorize } from "@/contexts/MemorizeContext";

import { useQuizAttempt } from "@/hooks/useQuizAttempt";

import type { MemorizeOptions } from "@/types/memorize";
import type { Quiz } from "@/types/quiz";

export default function MemorizePage() {
    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    const quizAttempt = useQuizAttempt();
    const [showSettings, setShowSettings] = useState(true);

    // Load quiz on mount
    useEffect(() => {
        if (quizId) {
            quizAttempt.loadQuiz(quizId).catch(() => {
                // Error is handled in the hook
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [quizId]);

    const handleGoHome = useCallback(() => {
        router.push("/");
    }, [router]);

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

    // No quiz found
    if (!quizAttempt.quiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-8">
                <div className="flex flex-col items-center gap-4 text-center max-w-md">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                        <AlertCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h1 className="text-2xl font-bold">Quiz Not Found</h1>
                    <p className="text-muted-foreground">
                        The quiz could not be found or is not available for memorization.
                    </p>
                    <Button onClick={handleGoHome} variant="outline">
                        <ArrowLeft className="h-4 w-4" />
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <MemorizeProvider>
            <MemorizePageContent
                quiz={quizAttempt.quiz}
                showSettings={showSettings}
                onStartMemorize={() => setShowSettings(false)}
            />
        </MemorizeProvider>
    );
}

// ============================================================================
// Inner Content Component (uses MemorizeContext)
// ============================================================================

interface MemorizePageContentProps {
    quiz: Quiz;
    showSettings: boolean;
    onStartMemorize: () => void;
}

function MemorizePageContent({ quiz, showSettings, onStartMemorize }: MemorizePageContentProps) {
    const { state, initMemorize } = useMemorize();

    const handleStart = (options: MemorizeOptions) => {
        initMemorize(quiz, options);
        onStartMemorize();
    };

    // Show settings if not initialized
    if (showSettings || state.phase === "settings") {
        return (
            <div className="min-h-screen p-6">
                <MemorizeSettings quiz={quiz} onStart={handleStart} />
            </div>
        );
    }

    // Render based on phase
    return (
        <div className="min-h-screen p-6">
            <PhaseRenderer />
        </div>
    );
}

// ============================================================================
// Phase Renderer Component
// ============================================================================

function PhaseRenderer() {
    const { state } = useMemorize();

    switch (state.phase) {
        case "memorizing":
            return <MemorizeView />;

        case "assessing":
            return <MemorizeAssessment />;

        case "batch-results":
            return <BatchResults />;

        case "summary":
            return <MemorizeSummary />;

        default:
            return null;
    }
}

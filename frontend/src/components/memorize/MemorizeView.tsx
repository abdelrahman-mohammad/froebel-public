"use client";

import React, { useCallback } from "react";

import { useRouter } from "next/navigation";

import { ArrowLeft, ClipboardCheck } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useMemorize } from "@/contexts/MemorizeContext";

import { getChapterName, hasMultipleChapters } from "@/lib/chapter-utils";

import { FlashCardGrid } from "./FlashCardGrid";
import { FlashCardSingle } from "./FlashCardSingle";
import { ViewModeToggle } from "./ViewModeToggle";

/**
 * Main memorization view with flashcards
 */
export function MemorizeView() {
    const router = useRouter();
    const {
        state,
        currentBatch,
        currentBatchChapterName,
        totalBatches,
        setViewMode,
        navigateSingleCard,
        startAssessment,
        reset,
    } = useMemorize();

    const [showExitDialog, setShowExitDialog] = React.useState(false);

    // Check if we should show chapter names on individual cards
    const showQuestionChapters = hasMultipleChapters(state.originalQuiz);

    // Get chapter name for a specific question
    const getQuestionChapterName = useCallback(
        (chapterId: string | undefined) => {
            if (!showQuestionChapters || !chapterId) return undefined;
            return getChapterName(state.originalQuiz, chapterId);
        },
        [state.originalQuiz, showQuestionChapters]
    );

    const handleExit = () => {
        setShowExitDialog(true);
    };

    const confirmExit = () => {
        reset();
        router.push("/");
    };

    const handleAssess = () => {
        startAssessment();
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Header */}
            <header className="flex flex-col sm:flex-row flex-wrap items-center justify-between gap-4 pb-4 border-b border-border text-center sm:text-left">
                <Button variant="ghost" onClick={handleExit} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Exit
                </Button>

                <div className="flex flex-col items-center">
                    {currentBatchChapterName && (
                        <span className="text-sm font-medium text-primary">{currentBatchChapterName}</span>
                    )}
                    <span className="text-lg font-semibold">
                        Batch {state.currentBatchIndex + 1} of {totalBatches}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {currentBatch.length} {currentBatch.length === 1 ? "question" : "questions"}
                    </span>
                </div>

                <ViewModeToggle viewMode={state.viewMode} onModeChange={setViewMode} />
            </header>

            {/* Content */}
            <div className="flex-1 py-6 overflow-auto">
                {state.viewMode === "all" ? (
                    <FlashCardGrid
                        questions={currentBatch}
                        getChapterName={getQuestionChapterName}
                    />
                ) : (
                    <FlashCardSingle
                        questions={currentBatch}
                        currentIndex={state.singleCardIndex}
                        onNavigate={navigateSingleCard}
                        getChapterName={getQuestionChapterName}
                    />
                )}
            </div>

            {/* Footer */}
            <footer className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-border">
                <Button variant="secondary" onClick={handleExit}>
                    Exit Memorization
                </Button>
                <Button onClick={handleAssess} className="gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Assess My Knowledge
                </Button>
            </footer>

            {/* Exit Confirmation Dialog */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Exit Memorization?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Your progress will be lost. Are you sure you want to exit?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmExit}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Exit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default MemorizeView;

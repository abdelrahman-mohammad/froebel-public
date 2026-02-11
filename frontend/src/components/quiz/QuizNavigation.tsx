"use client";

import React, { useCallback, useEffect } from "react";

import { Check, ChevronLeft, ChevronRight, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export interface QuizNavigationProps {
    /** Current question index (0-indexed) */
    currentIndex: number;
    /** Total number of questions */
    totalQuestions: number;
    /** Whether the current question can be checked */
    canCheck: boolean;
    /** Whether the current question has been checked */
    isChecked: boolean;
    /** Whether to show the submit button */
    showSubmit: boolean;
    /** Whether submission is in progress */
    isSubmitting?: boolean;
    /** Callback for previous button */
    onPrevious: () => void;
    /** Callback for next button */
    onNext: () => void;
    /** Callback for check answer button */
    onCheck: () => void;
    /** Callback for submit quiz button */
    onSubmit: () => void;
    /** Custom submit button text */
    submitText?: string;
    /** Additional class name */
    className?: string;
}

/**
 * Quiz navigation controls
 * Previous/Next buttons, Check Answer, and Submit Quiz
 */
export function QuizNavigation({
    currentIndex,
    totalQuestions,
    canCheck,
    isChecked,
    showSubmit,
    isSubmitting = false,
    onPrevious,
    onNext,
    onCheck,
    onSubmit,
    submitText = "Submit Quiz",
    className,
}: QuizNavigationProps) {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalQuestions - 1;

    // Keyboard navigation
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            // Don't handle if focused on input/textarea/contenteditable
            const target = e.target as HTMLElement;
            if (
                target instanceof HTMLInputElement ||
                target instanceof HTMLTextAreaElement ||
                target instanceof HTMLSelectElement ||
                target.isContentEditable ||
                target.closest("[contenteditable='true']")
            ) {
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                    if (!isFirst) {
                        e.preventDefault();
                        onPrevious();
                    }
                    break;
                case "ArrowRight":
                    if (!isLast) {
                        e.preventDefault();
                        onNext();
                    }
                    break;
            }
        },
        [isFirst, isLast, onPrevious, onNext]
    );

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-4 border-t border-border mt-6", className)}>
            {/* Previous Button */}
            <Button
                variant="outline"
                size="lg"
                onClick={onPrevious}
                disabled={isFirst}
                className="min-w-[100px] sm:min-w-[120px]"
            >
                <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                Previous
            </Button>

            {/* Center Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
                {/* Check Answer Button */}
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={onCheck}
                    disabled={!canCheck || isChecked}
                    className="min-w-[100px] sm:min-w-[120px]"
                >
                    <Check className="h-4 w-4 mr-1" aria-hidden="true" />
                    {isChecked ? "Checked" : "Check Answer"}
                </Button>

                {/* Submit Button (conditionally shown) */}
                {showSubmit && (
                    <Button
                        variant="success"
                        size="lg"
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="min-w-[100px] sm:min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" aria-hidden="true" />
                        ) : (
                            <Send className="h-4 w-4 mr-1" aria-hidden="true" />
                        )}
                        {isSubmitting ? "Submitting..." : submitText}
                    </Button>
                )}
            </div>

            {/* Next Button */}
            <Button
                variant="outline"
                size="lg"
                onClick={onNext}
                disabled={isLast}
                className="min-w-[100px] sm:min-w-[120px]"
            >
                Next
                <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
            </Button>
        </div>
    );
}

export default QuizNavigation;

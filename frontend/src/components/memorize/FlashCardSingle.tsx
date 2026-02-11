"use client";

import React from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import type { Question } from "@/types/quiz";

import { FlashCard } from "./FlashCard";

export interface FlashCardSingleProps {
    /** Questions in the batch */
    questions: Question[];
    /** Current card index */
    currentIndex: number;
    /** Callback to navigate */
    onNavigate: (direction: "prev" | "next") => void;
    /** Starting question number offset */
    startNumber?: number;
    /** Optional function to get chapter name for a question */
    getChapterName?: (chapterId: string | undefined) => string | undefined;
}

/**
 * Single card view with navigation for "One by One" mode
 */
export function FlashCardSingle({
    questions,
    currentIndex,
    onNavigate,
    startNumber = 1,
    getChapterName,
}: FlashCardSingleProps) {
    const currentQuestion = questions[currentIndex];
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === questions.length - 1;

    if (!currentQuestion) {
        return null;
    }

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Progress indicator */}
            <div className="text-sm text-muted-foreground">
                Card {currentIndex + 1} of {questions.length}
            </div>

            {/* Card with navigation */}
            <div className="flex items-center gap-4 w-full max-w-2xl">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full shrink-0"
                    onClick={() => onNavigate("prev")}
                    disabled={isFirst}
                    aria-label="Previous card"
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>

                <FlashCard
                    question={currentQuestion}
                    questionNumber={startNumber + currentIndex}
                    totalInBatch={questions.length}
                    isLarge
                    chapterName={getChapterName?.(currentQuestion.chapter)}
                />

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-12 w-12 rounded-full shrink-0"
                    onClick={() => onNavigate("next")}
                    disabled={isLast}
                    aria-label="Next card"
                >
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>

            {/* Dot indicators */}
            <div className="flex gap-2 justify-center">
                {questions.map((_, index) => (
                    <span
                        key={index}
                        className={cn(
                            "w-2 h-2 rounded-full transition-colors",
                            index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}

export default FlashCardSingle;

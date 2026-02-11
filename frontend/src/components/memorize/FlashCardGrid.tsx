"use client";

import React from "react";

import type { Question } from "@/types/quiz";

import { FlashCard } from "./FlashCard";

export interface FlashCardGridProps {
    /** Questions to display */
    questions: Question[];
    /** Starting question number offset (for batch display) */
    startNumber?: number;
    /** Optional function to get chapter name for a question */
    getChapterName?: (chapterId: string | undefined) => string | undefined;
}

/**
 * Grid layout for flashcards in "All at Once" view mode
 */
export function FlashCardGrid({ questions, startNumber = 1, getChapterName }: FlashCardGridProps) {
    return (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {questions.map((question, index) => (
                <FlashCard
                    key={question.id}
                    question={question}
                    questionNumber={startNumber + index}
                    chapterName={getChapterName?.(question.chapter)}
                />
            ))}
        </div>
    );
}

export default FlashCardGrid;

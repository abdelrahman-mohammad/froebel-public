"use client";

import React, { useEffect, useRef } from "react";

import { RichTextViewer } from "@/components/ui/RichTextViewer";

import { formatQuestionText, renderLatex } from "@/lib/format-text";
import { getCorrectAnswerDisplay } from "@/lib/memorize-utils";
import { cn } from "@/lib/utils";

import type { Question } from "@/types/quiz";
import {
    isDropdownQuestion,
    isFillBlankQuestion,
    isMultipleChoiceQuestion,
    isTrueFalseQuestion,
} from "@/types/quiz";
import { getPlainText } from "@/types/rich-text";

export interface FlashCardProps {
    /** The question to display */
    question: Question;
    /** Question number (1-indexed) */
    questionNumber: number;
    /** Total questions in batch */
    totalInBatch?: number;
    /** Whether to render as large card (single view) */
    isLarge?: boolean;
    /** Optional chapter name (only shown when quiz has multiple chapters) */
    chapterName?: string;
    /** Optional class name */
    className?: string;
}

/**
 * FlashCard component for memorize mode
 * Displays question with the correct answer revealed
 */
export function FlashCard({
    question,
    questionNumber,
    totalInBatch,
    isLarge = false,
    chapterName,
    className,
}: FlashCardProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // Render LaTeX after content updates
    useEffect(() => {
        renderLatex(contentRef.current);
    }, [question.text, question.id]);

    // Format points text
    const pointsText = question.points === 1 ? "1 pt" : `${question.points} pts`;

    // Get the correct answer display
    const correctAnswer = getCorrectAnswerDisplay(question);

    return (
        <div
            className={cn(
                "flex flex-col p-4 rounded-lg border border-border bg-card text-card-foreground",
                isLarge && "max-w-2xl mx-auto p-6",
                className
            )}
            data-question-id={question.id}
            ref={contentRef}
        >
            {/* Chapter Name (only shown when quiz has multiple chapters) */}
            {chapterName && <div className="text-xs font-medium px-2 py-0.5 rounded bg-accent text-accent-foreground w-fit mb-2">{chapterName}</div>}

            {/* Card Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="font-semibold text-primary">
                    Q{questionNumber}
                    {totalInBatch && ` of ${totalInBatch}`}
                </span>
                <span className="text-sm text-muted-foreground">{pointsText}</span>
            </div>

            {/* Question Image (if present) */}
            {question.image && (
                <div className="my-3 rounded-lg overflow-hidden">
                    <img src={question.image} alt="Question illustration" loading="lazy" className={cn("w-full h-auto object-contain", isLarge ? "max-h-64" : "max-h-48")} />
                </div>
            )}

            {/* Question Text */}
            <div className="mb-4 text-foreground">
                <QuestionTextDisplay question={question} />
            </div>

            {/* Answer Section */}
            <div className="mt-auto p-3 rounded-lg bg-success/10 border border-success/20">
                <div className="text-xs font-semibold text-success uppercase tracking-wide mb-1">Answer:</div>
                <AnswerDisplay answer={correctAnswer} question={question} />
            </div>
        </div>
    );
}

// ============================================================================
// Question Text Display
// ============================================================================

interface QuestionTextDisplayProps {
    question: Question;
}

function QuestionTextDisplay({ question }: QuestionTextDisplayProps) {
    // For fill_blank and dropdown, show the text with placeholders
    if (isFillBlankQuestion(question) || isDropdownQuestion(question)) {
        // Replace {blank} or {dropdown} with visible placeholder
        const placeholder = isFillBlankQuestion(question) ? "{blank}" : "{dropdown}";
        const questionText = getPlainText(question.text);
        const displayText = questionText.replace(
            new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
            '<span class="memorize-blank-placeholder">____</span>'
        );
        return (
            <div
                dangerouslySetInnerHTML={{
                    __html: formatQuestionText(displayText),
                }}
            />
        );
    }

    // For regular questions, use RichTextViewer to preserve Lexical formatting
    return <RichTextViewer content={question.text} />;
}

// ============================================================================
// Answer Display
// ============================================================================

interface AnswerDisplayProps {
    answer: string | string[];
    question: Question;
}

function AnswerDisplay({ answer, question }: AnswerDisplayProps) {
    // True/False - simple text
    if (isTrueFalseQuestion(question)) {
        return <div className="text-foreground font-medium">{answer as string}</div>;
    }

    // Multiple choice - single answer
    if (isMultipleChoiceQuestion(question)) {
        return <div className="text-foreground font-medium">{answer as string}</div>;
    }

    // Multiple answers - list
    if (Array.isArray(answer)) {
        if (answer.length === 1) {
            return <div className="text-foreground font-medium">{answer[0]}</div>;
        }

        return (
            <ul className="list-disc list-inside space-y-1">
                {answer.map((ans, index) => (
                    <li key={index}>{ans}</li>
                ))}
            </ul>
        );
    }

    // Default single answer
    return <div className="text-foreground font-medium">{answer}</div>;
}

export default FlashCard;

"use client";

import React, { useCallback, useEffect, useRef } from "react";

import { FlagIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Question, UserAnswer } from "@/types/quiz";

export interface QuestionNavProps {
    /** Array of questions */
    questions: Question[];
    /** Current question index (0-indexed) */
    currentIndex: number;
    /** User answers keyed by question ID */
    userAnswers: Record<string, UserAnswer>;
    /** Set of flagged question IDs */
    flaggedQuestions: Set<string>;
    /** Callback when a question is selected */
    onNavigate: (index: number) => void;
}

/**
 * Checks if a user answer is considered "answered" (non-empty)
 */
function isAnswered(answer: UserAnswer | undefined): boolean {
    if (answer === undefined || answer === null) return false;
    if (typeof answer === "string") return answer !== "";
    if (Array.isArray(answer)) return answer.some((a) => a !== "");
    return false;
}

/**
 * Horizontal scrollable question navigation
 * Shows question numbers with visual states for current, answered, and flagged
 */
export function QuestionNav({
    questions,
    currentIndex,
    userAnswers,
    flaggedQuestions,
    onNavigate,
}: QuestionNavProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

    // Auto-scroll to center current question
    const scrollToQuestion = useCallback((index: number) => {
        const container = containerRef.current;
        const button = buttonRefs.current.get(index);

        if (container && button) {
            const buttonRect = button.getBoundingClientRect();

            // Calculate offset to center the button
            const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + buttonRect.width / 2;

            container.scrollTo({
                left: Math.max(0, scrollLeft),
                behavior: "smooth",
            });
        }
    }, []);

    // Scroll to current question when it changes
    useEffect(() => {
        scrollToQuestion(currentIndex);
    }, [currentIndex, scrollToQuestion]);

    // Store button ref
    const setButtonRef = useCallback((index: number, el: HTMLButtonElement | null) => {
        if (el) {
            buttonRefs.current.set(index, el);
        } else {
            buttonRefs.current.delete(index);
        }
    }, []);

    return (
        <nav className="py-3 border-b border-border" aria-label="Question navigation">
            <div ref={containerRef} className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-thin" role="list">
                {questions.map((question, index) => {
                    const isCurrent = index === currentIndex;
                    const isFlagged = flaggedQuestions.has(question.id);
                    const answered = isAnswered(userAnswers[question.id]);

                    return (
                        <button
                            key={question.id}
                            ref={(el) => setButtonRef(index, el)}
                            type="button"
                            className={cn(
                                "relative flex items-center justify-center min-w-[40px] h-10 px-3 rounded-lg",
                                "border-2 border-border bg-card text-foreground font-medium text-sm",
                                "transition-all duration-200 hover:border-primary hover:bg-muted",
                                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                isCurrent && "border-primary bg-primary text-primary-foreground",
                                answered && !isCurrent && "border-success bg-correct text-success"
                            )}
                            onClick={() => onNavigate(index)}
                            aria-label={`Question ${index + 1}${isFlagged ? ", flagged" : ""}${answered ? ", answered" : ""}`}
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            <span className="leading-none">{index + 1}</span>
                            {isFlagged && (
                                <FlagIcon className="absolute -top-1 -right-1 w-3 h-3 text-warning fill-warning" aria-hidden="true" />
                            )}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}

export default QuestionNav;

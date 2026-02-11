"use client";

import React from "react";

import type { MultipleAnswerQuestion } from "@/types/quiz";

import { AnswerChoice, type CheckState } from "../AnswerChoice";

export interface MultipleAnswerProps {
    /** The question data */
    question: MultipleAnswerQuestion;
    /** Currently selected answers (array of choice IDs) */
    userAnswers: string[];
    /** Whether inputs are disabled */
    disabled: boolean;
    /** Check states for each choice (after checking answer) */
    checkStates: Map<string, CheckState> | null;
    /** Callback when an answer is toggled */
    onToggle: (choiceId: string) => void;
}

/**
 * Multiple answer question component - multiple correct answers with checkboxes
 */
export function MultipleAnswer({
    question,
    userAnswers,
    disabled,
    checkStates,
    onToggle,
}: MultipleAnswerProps) {
    return (
        <div className="answers multiple-answer-answers">
            <p className="select-hint">Select all that apply</p>
            {question.choices.map((choice) => {
                const isSelected = userAnswers.includes(choice.id);
                const checkState = checkStates?.get(choice.id) ?? null;
                // Show user tag on selected answers when checking
                const showUserTag = checkStates !== null && isSelected;

                return (
                    <AnswerChoice
                        key={choice.id}
                        type="checkbox"
                        questionId={question.id}
                        choiceId={choice.id}
                        text={choice.text}
                        selected={isSelected}
                        disabled={disabled}
                        checkState={checkState}
                        showUserTag={showUserTag}
                        onChange={onToggle}
                    />
                );
            })}
        </div>
    );
}

export default MultipleAnswer;

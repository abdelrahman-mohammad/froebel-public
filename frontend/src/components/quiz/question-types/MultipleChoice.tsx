"use client";

import React from "react";

import type { MultipleChoiceQuestion } from "@/types/quiz";

import { AnswerChoice, type CheckState } from "../AnswerChoice";

export interface MultipleChoiceProps {
    /** The question data */
    question: MultipleChoiceQuestion;
    /** Currently selected answer (choice ID) */
    userAnswer: string | null;
    /** Whether inputs are disabled */
    disabled: boolean;
    /** Check states for each choice (after checking answer) */
    checkStates: Map<string, CheckState> | null;
    /** Callback when an answer is selected */
    onSelect: (choiceId: string) => void;
}

/**
 * Multiple choice question component - single correct answer with radio buttons
 */
export function MultipleChoice({
    question,
    userAnswer,
    disabled,
    checkStates,
    onSelect,
}: MultipleChoiceProps) {
    return (
        <div className="answers multiple-choice-answers">
            {question.choices.map((choice) => {
                const isSelected = userAnswer === choice.id;
                const checkState = checkStates?.get(choice.id) ?? null;
                // Show user tag on selected answer when checking
                const showUserTag = checkStates !== null && isSelected;

                return (
                    <AnswerChoice
                        key={choice.id}
                        type="radio"
                        questionId={question.id}
                        choiceId={choice.id}
                        text={choice.text}
                        selected={isSelected}
                        disabled={disabled}
                        checkState={checkState}
                        showUserTag={showUserTag}
                        onChange={onSelect}
                    />
                );
            })}
        </div>
    );
}

export default MultipleChoice;

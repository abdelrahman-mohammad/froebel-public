"use client";

import React from "react";

import { QuizPlayer } from "@/components/quiz/QuizPlayer";

import { useMemorize } from "@/contexts/MemorizeContext";
import { QuizProvider } from "@/contexts/QuizContext";

/**
 * Assessment phase wrapper that uses QuizPlayer for the current batch
 */
export function MemorizeAssessment() {
    const { currentBatch, state, submitAssessment } = useMemorize();

    // Create a temporary quiz from the current batch
    const assessmentQuiz = {
        id: `assessment-batch-${state.currentBatchIndex}`,
        title: `Batch ${state.currentBatchIndex + 1} Assessment`,
        questions: currentBatch,
    };

    const handleSubmit = () => {
        submitAssessment();
    };

    return (
        <QuizProvider
            initialQuiz={assessmentQuiz}
            initialOptions={{
                timerEnabled: false,
                checkAnswerEnabled: false,
                isMemorizeMode: true,
            }}
        >
            <QuizPlayer
                isMemorizeAssessment
                onMemorizeSubmit={handleSubmit}
                submitButtonText="Submit Batch"
            />
        </QuizProvider>
    );
}

export default MemorizeAssessment;

"use client";

import React from "react";

import { FileQuestion } from "lucide-react";

import type { Quiz } from "@/types/quiz";

import { QuizCard } from "./QuizCard";

export interface QuizListProps {
    quizzes: Quiz[];
    onPlay: (quizId: string) => void;
    onEdit: (quizId: string) => void;
    onExport: (quiz: Quiz) => void;
    onDelete: (quizId: string) => void;
}

export function QuizList({ quizzes, onPlay, onEdit, onExport, onDelete }: QuizListProps) {
    if (quizzes.length === 0) {
        return (
            <div className="no-quizzes">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No quizzes yet</p>
                <p className="text-sm">Create a new quiz or import one to get started.</p>
            </div>
        );
    }

    return (
        <div className="quiz-list">
            {quizzes.map((quiz) => (
                <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onPlay={onPlay}
                    onEdit={onEdit}
                    onExport={onExport}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}

export default QuizList;

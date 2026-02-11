"use client";

import React, { useMemo } from "react";

import { Download, MoreVertical, Pencil, Play, Trash2 } from "lucide-react";

import {
    QuizCard as BaseQuizCard,
    type QuizCardAction,
    type QuizCardData,
} from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Quiz } from "@/types/quiz";

export interface QuizCardProps {
    quiz: Quiz;
    onPlay: (quizId: string) => void;
    onEdit: (quizId: string) => void;
    onExport: (quiz: Quiz) => void;
    onDelete: (quizId: string) => void;
}

/**
 * Converts Quiz to QuizCardData format
 */
function toQuizCardData(quiz: Quiz): QuizCardData {
    return {
        id: quiz.id,
        shareableId: quiz.shareableId,
        title: quiz.title,
        description: quiz.description,
        questionCount: quiz.questions.length,
        timeLimit: quiz.timeLimit ?? undefined,
        categoryName: quiz.category,
        tags: quiz.tags,
        status: quiz.status,
    };
}

export function QuizCard({ quiz, onPlay, onEdit, onExport, onDelete }: QuizCardProps) {
    const quizCardData = useMemo(() => toQuizCardData(quiz), [quiz]);

    const actions: QuizCardAction[] = useMemo(
        () => [
            {
                label: "Play",
                onClick: () => onPlay(quiz.shareableId ?? quiz.id),
                variant: "default",
                icon: Play,
            },
        ],
        [quiz.shareableId, quiz.id, onPlay]
    );

    return (
        <div className="relative">
            <BaseQuizCard
                quiz={quizCardData}
                variant="library"
                size="compact"
                actions={actions}
            />
            {/* Dropdown menu overlay */}
            <div className="absolute top-3 right-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Quiz actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(quiz.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport(quiz)}>
                            <Download className="h-4 w-4" />
                            Export
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => onDelete(quiz.id)}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export default QuizCard;

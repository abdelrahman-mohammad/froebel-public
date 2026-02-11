"use client";

import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Chapter, Question } from "@/types/quiz";

import { ChapterBlock } from "./ChapterBlock";

interface SortableChapterBlockProps {
    chapter: Chapter;
    questions: { question: Question; index: number }[];
    isExpanded: boolean;
    showAnswers: boolean;
    expandedQuestions: Set<string>;
    isCreating?: boolean;
    onToggleExpand: () => void;
    onToggleQuestion: (questionId: string) => void;
    onRename: (name: string) => void;
    onDelete: () => void;
    onUpdateQuestion: (index: number, question: Question) => void;
    onDeleteQuestion: (index: number) => void;
    onFinishCreating?: (saved: boolean) => void;
}

export function SortableChapterBlock({
    chapter,
    questions,
    isExpanded,
    showAnswers,
    expandedQuestions,
    isCreating,
    onToggleExpand,
    onToggleQuestion,
    onRename,
    onDelete,
    onUpdateQuestion,
    onDeleteQuestion,
    onFinishCreating,
}: SortableChapterBlockProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: chapter.id,
        data: {
            type: "chapter",
            chapter,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <ChapterBlock
                chapter={chapter}
                questions={questions}
                isExpanded={isExpanded}
                showAnswers={showAnswers}
                expandedQuestions={expandedQuestions}
                isCreating={isCreating}
                onToggleExpand={onToggleExpand}
                onToggleQuestion={onToggleQuestion}
                onRename={onRename}
                onDelete={onDelete}
                onUpdateQuestion={onUpdateQuestion}
                onDeleteQuestion={onDeleteQuestion}
                onFinishCreating={onFinishCreating}
                isDragging={isDragging}
                dragListeners={listeners}
            />
        </div>
    );
}

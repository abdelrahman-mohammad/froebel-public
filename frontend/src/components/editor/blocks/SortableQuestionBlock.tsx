"use client";

import React from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Question } from "@/types/quiz";

import { QuestionBlock } from "./QuestionBlock";

interface SortableQuestionBlockProps {
    question: Question;
    index: number;
    isExpanded: boolean;
    showAnswers: boolean;
    onToggleExpand: () => void;
    onUpdate: (question: Question) => void;
    onDelete: () => void;
}

export function SortableQuestionBlock({
    question,
    index,
    isExpanded,
    showAnswers,
    onToggleExpand,
    onUpdate,
    onDelete,
}: SortableQuestionBlockProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: question.id,
        data: {
            type: "question",
            question,
            index,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes}>
            <QuestionBlock
                question={question}
                index={index}
                isExpanded={isExpanded}
                showAnswers={showAnswers}
                onToggleExpand={onToggleExpand}
                onUpdate={onUpdate}
                onDelete={onDelete}
                isDragging={isDragging}
                dragListeners={listeners}
            />
        </div>
    );
}

"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// This component uses valid setState pattern for isCreating state
import React, { useEffect, useRef, useState } from "react";

import { useDndContext, useDroppable } from "@dnd-kit/core";
import {
    BookOpen,
    Check,
    ChevronDown,
    ChevronRight,
    GripVertical,
    Pencil,
    Trash2,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

import type { Chapter, Question } from "@/types/quiz";

import { SortableQuestionBlock } from "./SortableQuestionBlock";

interface ChapterBlockProps {
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
    isDragging?: boolean;
    dragListeners?: React.HTMLAttributes<HTMLElement>;
}

export function ChapterBlock({
    chapter,
    questions,
    isExpanded,
    showAnswers,
    expandedQuestions,
    isCreating = false,
    onToggleExpand,
    onToggleQuestion,
    onRename,
    onDelete,
    onUpdateQuestion,
    onDeleteQuestion,
    onFinishCreating,
    isDragging = false,
    dragListeners,
}: ChapterBlockProps) {
    const [isEditing, setIsEditing] = useState(isCreating);
    const [editName, setEditName] = useState(chapter.name);
    const inputRef = useRef<HTMLInputElement>(null);

    // Check if a question is being dragged (not a chapter)
    const { active } = useDndContext();
    const isDraggingQuestion = active?.data.current?.type === "question";
    const draggedQuestionChapter = active?.data.current?.question?.chapter;

    // Only show droppable when:
    // 1. Dragging an uncategorized question (no chapter), OR
    // 2. Dragging a question from a DIFFERENT chapter
    const isFromDifferentChapterOrUncategorized =
        isDraggingQuestion && draggedQuestionChapter !== chapter.id;

    // Droppable zone for receiving questions - only active when dragging a question from elsewhere
    const { setNodeRef: setDroppableRef, isOver: isDroppableOver } = useDroppable({
        id: `chapter-drop-${chapter.id}`,
        data: {
            type: "chapter-drop",
            chapterId: chapter.id,
        },
        disabled: !isExpanded || !isFromDifferentChapterOrUncategorized,
    });

    // Only show drop feedback when dragging a question from elsewhere over this chapter
    const showDropFeedback = isDroppableOver && isFromDifferentChapterOrUncategorized;

    // Sync isEditing when isCreating prop changes
    useEffect(() => {
        if (isCreating) {
            setIsEditing(true);
        }
    }, [isCreating]);

    // Focus input when entering edit/create mode
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSaveName = () => {
        if (editName.trim()) {
            onRename(editName.trim());
            setIsEditing(false);
            if (isCreating) {
                onFinishCreating?.(true);
            }
        } else if (isCreating) {
            // Empty name in create mode - cancel creation
            onFinishCreating?.(false);
        } else {
            setEditName(chapter.name);
            setIsEditing(false);
        }
    };

    const handleCancelEdit = () => {
        setEditName(chapter.name);
        setIsEditing(false);
        if (isCreating) {
            onFinishCreating?.(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSaveName();
        } else if (e.key === "Escape") {
            handleCancelEdit();
        }
    };

    return (
        <div className={cn("transition-all duration-200", isDragging && "opacity-50")}>
            {/* Section Divider Header */}
            <div className="flex items-center gap-2 py-2 group">
                {/* Left decorative line */}
                <div className="h-px bg-border flex-shrink-0 w-4" />

                {/* Drag handle */}
                <div
                    className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    {...dragListeners}
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                {/* Expand/collapse toggle */}
                <button
                    onClick={onToggleExpand}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                >
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </button>

                {/* Chapter icon */}
                <BookOpen className="h-4 w-4 text-muted-foreground" />

                {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Input
                            ref={inputRef}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveName}
                            autoFocus
                            className="h-7 text-sm"
                            placeholder="Chapter name..."
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleSaveName}
                            className="h-7 w-7 shrink-0"
                        >
                            <Check className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCancelEdit}
                            className="h-7 w-7 shrink-0"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ) : (
                    <>
                        <span className="font-medium text-sm">{chapter.name}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setEditName(chapter.name);
                                setIsEditing(true);
                            }}
                            className="h-6 w-6 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    </>
                )}

                {/* Center decorative line */}
                <div className="h-px bg-border flex-1" />

                {/* Question count */}
                {!isEditing && (
                    <span className="text-xs text-muted-foreground px-2 shrink-0">
                        {questions.length} {questions.length === 1 ? "question" : "questions"}
                    </span>
                )}

                {/* Right decorative line */}
                <div className="h-px bg-border flex-shrink-0 w-8" />

                {/* Delete button */}
                {!isEditing && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Questions - Droppable Zone */}
            {isExpanded && (
                <div className="pl-6 space-y-2 pb-2">
                    {/* Drop zone for empty chapters */}
                    {questions.length === 0 && (
                        <div
                            ref={setDroppableRef}
                            className={cn(
                                "h-[55px] flex items-center justify-center border-2 border-dashed rounded-lg text-sm text-center font-medium transition-colors duration-200",
                                showDropFeedback
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-muted-foreground/30 text-muted-foreground"
                            )}
                        >
                            {showDropFeedback
                                ? "Drop question here"
                                : "No questions in this chapter. Drag questions here to add them."}
                        </div>
                    )}
                    {/* Questions list */}
                    {questions.length > 0 &&
                        questions.map(({ question, index }) => (
                            <SortableQuestionBlock
                                key={question.id}
                                question={question}
                                index={index}
                                isExpanded={expandedQuestions.has(question.id)}
                                showAnswers={showAnswers}
                                onToggleExpand={() => onToggleQuestion(question.id)}
                                onUpdate={(q) => onUpdateQuestion(index, q)}
                                onDelete={() => onDeleteQuestion(index)}
                            />
                        ))}
                    {/* Drop zone at bottom for chapters with questions */}
                    {questions.length > 0 && (
                        <div
                            ref={
                                isFromDifferentChapterOrUncategorized ? setDroppableRef : undefined
                            }
                            className={cn(
                                "h-[55px] flex items-center justify-center border-2 border-dashed rounded-lg text-sm text-center font-medium transition-colors duration-200",
                                showDropFeedback
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-muted-foreground/30 text-muted-foreground"
                            )}
                        >
                            {showDropFeedback
                                ? "Drop question here"
                                : "Drag questions here to add them"}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

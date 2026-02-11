"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// Question editor tab with state patterns
import { useCallback, useEffect, useMemo, useState } from "react";

import { type DragEndEvent, useDndContext, useDroppable } from "@dnd-kit/core";
import { ChevronRight, FileQuestion, GripVertical, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useEditor, validateQuestion } from "@/contexts/EditorContext";

import { useQuizEditor } from "@/hooks/useQuizEditor";

import { cn } from "@/lib/utils";

import type { Question } from "@/types/quiz";
import { getPlainText } from "@/types/rich-text";

import { CreateQuestionBlock } from "../blocks/CreateQuestionBlock";
import { DndWrapper } from "../blocks/DndWrapper";
import { SortableChapterBlock } from "../blocks/SortableChapterBlock";
import { SortableQuestionBlock } from "../blocks/SortableQuestionBlock";

// Question type abbreviations for drag overlay
const questionTypeAbbr: Record<string, string> = {
    multiple_choice: "MC",
    multiple_answer: "MA",
    true_false: "T/F",
    fill_blank: "Fill",
    dropdown: "DD",
    free_text: "Free",
    numeric: "Num",
    file_upload: "File",
};

interface QuestionsTabProps {
    quizId?: string;
}

export function QuestionsTab({ quizId }: QuestionsTabProps) {
    const {
        state,
        updateChapter,
        deleteChapter,
        updateQuestion,
        deleteQuestion,
        deleteQuestionById,
        cancelCreateQuestion,
        startCreateQuestion,
        reorderQuestions,
        reorderChapters,
        moveQuestionToChapter,
        finishCreateChapter,
    } = useEditor();
    const { quiz, isCreatingQuestion, creatingChapterId } = state;

    const { deleteQuestion: deleteQuestionApi } = useQuizEditor();

    // Local state
    const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(() => {
        // Start with all chapters expanded
        return new Set(quiz.chapters?.map((c) => c.id) || []);
    });
    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: "question" | "chapter";
        questionId?: string;
        chapterId?: string;
    } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Auto-expand new chapter when creating
    useEffect(() => {
        if (creatingChapterId) {
            setExpandedChapters((prev) => new Set([...prev, creatingChapterId]));
        }
    }, [creatingChapterId]);

    // Group questions by chapter
    const questionsByChapter = useMemo(() => {
        const grouped = new Map<string | null, { question: Question; index: number }[]>();

        quiz.questions.forEach((question, index) => {
            const chapterId = question.chapter || null;
            if (!grouped.has(chapterId)) {
                grouped.set(chapterId, []);
            }
            grouped.get(chapterId)!.push({ question, index });
        });

        return grouped;
    }, [quiz.questions]);

    const uncategorizedQuestions = questionsByChapter.get(null) || [];
    const chapters = quiz.chapters || [];

    // Handlers
    const handleFinishCreatingChapter = useCallback(
        (chapterId: string, saved: boolean) => {
            finishCreateChapter();
            // If not saved (cancelled with empty name), delete the chapter
            if (!saved) {
                deleteChapter(chapterId);
            }
        },
        [finishCreateChapter, deleteChapter]
    );

    const toggleQuestion = useCallback((questionId: string) => {
        setExpandedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    }, []);

    const toggleChapter = useCallback((chapterId: string) => {
        setExpandedChapters((prev) => {
            const next = new Set(prev);
            if (next.has(chapterId)) {
                next.delete(chapterId);
            } else {
                next.add(chapterId);
            }
            return next;
        });
    }, []);

    const handleUpdateQuestion = useCallback(
        (index: number, question: Question) => {
            // Validate question before updating - show warnings but don't block
            const errors = validateQuestion(question);
            if (errors.length > 0) {
                // Show first error as warning toast
                toast.warning(`Question has issues: ${errors[0].message}`);
            }
            updateQuestion(index, question);
        },
        [updateQuestion]
    );

    const handleDeleteQuestion = useCallback(
        (index: number) => {
            const questionId = quiz.questions[index]?.id;
            if (questionId) {
                setDeleteConfirm({ type: "question", questionId });
            }
        },
        [quiz.questions]
    );

    const handleDeleteChapter = useCallback((chapterId: string) => {
        setDeleteConfirm({ type: "chapter", chapterId });
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deleteConfirm) return;

        if (deleteConfirm.type === "question" && deleteConfirm.questionId) {
            const questionId = deleteConfirm.questionId;

            if (quizId) {
                // API-backed quiz: delete from server first, then update local state
                setIsDeleting(true);
                let apiSuccess = false;
                try {
                    await deleteQuestionApi(questionId, quizId);
                    apiSuccess = true;
                } catch (error) {
                    console.error("Failed to delete question:", error);
                    toast.error("Failed to delete question. Please try again.");
                    setDeleteConfirm(null);
                    setIsDeleting(false);
                    return;
                }

                // Always update local state after successful API call
                // Using finally-like pattern to ensure sync even if deleteQuestionById fails
                if (apiSuccess) {
                    try {
                        deleteQuestionById(questionId);
                    } catch (localError) {
                        console.error("Failed to update local state after deletion:", localError);
                        // State is out of sync - reload to recover
                        toast.error("State sync error. Refreshing...");
                        window.location.reload();
                        return;
                    } finally {
                        setIsDeleting(false);
                    }
                }
            } else {
                // Local-only quiz: delete by ID
                deleteQuestionById(questionId);
            }
        } else if (deleteConfirm.type === "chapter" && deleteConfirm.chapterId) {
            deleteChapter(deleteConfirm.chapterId);
        }

        setDeleteConfirm(null);
    }, [deleteConfirm, quizId, deleteQuestionApi, deleteQuestionById, deleteChapter]);

    // Drag end handler for questions
    const handleQuestionDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const activeData = active.data.current;
            if (activeData?.type !== "question") return;

            const overData = over.data.current;

            // Check if dropping into chapter drop zone (content area)
            if (overData?.type === "chapter-drop") {
                moveQuestionToChapter(active.id as string, overData.chapterId);
                return;
            }

            // Check if dropping into uncategorized drop zone (removes from chapter)
            if (overData?.type === "uncategorized-drop") {
                moveQuestionToChapter(active.id as string, null);
                return;
            }

            // Otherwise, reorder questions
            const oldIndex = quiz.questions.findIndex((q) => q.id === active.id);
            const newIndex = quiz.questions.findIndex((q) => q.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderQuestions(oldIndex, newIndex);
            }
        },
        [quiz.questions, reorderQuestions, moveQuestionToChapter]
    );

    // Drag end handler for chapters
    const handleChapterDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            const activeData = active.data.current;
            if (activeData?.type !== "chapter") return;

            const chapters = quiz.chapters || [];
            const oldIndex = chapters.findIndex((c) => c.id === active.id);
            const newIndex = chapters.findIndex((c) => c.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderChapters(oldIndex, newIndex);
            }
        },
        [quiz.chapters, reorderChapters]
    );

    // Combined drag end handler (memoized for performance)
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const activeData = event.active.data.current;
            if (activeData?.type === "chapter") {
                handleChapterDragEnd(event);
            } else if (activeData?.type === "question") {
                handleQuestionDragEnd(event);
            }
        },
        [handleChapterDragEnd, handleQuestionDragEnd]
    );

    // Combined sortable items (chapters + ALL questions for proper animation)
    const allSortableIds = useMemo(() => {
        const chapterIds = (quiz.chapters || []).map((c) => c.id);
        // Include ALL question IDs for proper sorting animation (not just uncategorized)
        const allQuestionIds = quiz.questions.map((q) => q.id);
        return [...chapterIds, ...allQuestionIds];
    }, [quiz.chapters, quiz.questions]);

    // Render drag overlay content - matches collapsed QuestionBlock appearance
    // dropZoneWidth is provided when hovering over a drop zone (width applied by wrapper)
    const renderDragOverlay = useCallback(
        (
            activeId: string | null,
            data: { type: string; question?: Question } | null,
            _dropZoneWidth: number | null
        ) => {
            if (!activeId || !data) return null;

            if (data.type === "question" && data.question) {
                const index = quiz.questions.findIndex((q) => q.id === activeId);
                const question = data.question;
                const plainText = getPlainText(question.text).trim();
                const previewText = plainText
                    ? plainText.length > 60
                        ? plainText.slice(0, 60) + "..."
                        : plainText
                    : "Untitled question";

                return (
                    <div
                        className="flex items-center gap-2 p-3 border rounded-lg shadow-lg h-full min-h-[55px] opacity-90 w-full bg-card"
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground shrink-0">
                            {question.identifier || `Q${index + 1}`}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-muted rounded shrink-0">
                            {questionTypeAbbr[question.type] || "?"}
                        </span>
                        <span className="truncate flex-1">{previewText}</span>
                        <span className="text-sm text-muted-foreground shrink-0">
                            {question.points} pts
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground shrink-0 pointer-events-none"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            }

            return null;
        },
        [quiz.questions]
    );

    // Empty state - only show when no questions AND no chapters
    if (quiz.questions.length === 0 && !isCreatingQuestion && chapters.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                        <FileQuestion className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No questions yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Get started by creating your first question.
                        </p>
                        <Button onClick={startCreateQuestion} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create First Question
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto p-4 space-y-3">
                <DndWrapper
                    items={allSortableIds}
                    onDragEnd={handleDragEnd}
                    renderDragOverlay={renderDragOverlay}
                >
                    {/* Chapters */}
                    {chapters.map((chapter) => {
                        const chapterQuestions = questionsByChapter.get(chapter.id) || [];
                        return (
                            <SortableChapterBlock
                                key={chapter.id}
                                chapter={chapter}
                                questions={chapterQuestions}
                                isExpanded={expandedChapters.has(chapter.id)}
                                showAnswers={false}
                                expandedQuestions={expandedQuestions}
                                isCreating={creatingChapterId === chapter.id}
                                onToggleExpand={() => toggleChapter(chapter.id)}
                                onToggleQuestion={toggleQuestion}
                                onRename={(name) => updateChapter(chapter.id, name)}
                                onDelete={() => handleDeleteChapter(chapter.id)}
                                onUpdateQuestion={handleUpdateQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                                onFinishCreating={(saved) =>
                                    handleFinishCreatingChapter(chapter.id, saved)
                                }
                            />
                        );
                    })}

                    {/* Uncategorized Questions */}
                    {chapters.length > 0 && (
                        <UncategorizedDropZone hasQuestions={uncategorizedQuestions.length > 0}>
                            {uncategorizedQuestions.map(({ question, index }) => (
                                <SortableQuestionBlock
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    isExpanded={expandedQuestions.has(question.id)}
                                    showAnswers={false}
                                    onToggleExpand={() => toggleQuestion(question.id)}
                                    onUpdate={(q) => handleUpdateQuestion(index, q)}
                                    onDelete={() => handleDeleteQuestion(index)}
                                />
                            ))}
                        </UncategorizedDropZone>
                    )}

                    {/* Show uncategorized without drop zone when no chapters */}
                    {chapters.length === 0 && uncategorizedQuestions.length > 0 && (
                        <div className="space-y-2">
                            {uncategorizedQuestions.map(({ question, index }) => (
                                <SortableQuestionBlock
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    isExpanded={expandedQuestions.has(question.id)}
                                    showAnswers={false}
                                    onToggleExpand={() => toggleQuestion(question.id)}
                                    onUpdate={(q) => handleUpdateQuestion(index, q)}
                                    onDelete={() => handleDeleteQuestion(index)}
                                />
                            ))}
                        </div>
                    )}

                    {/* Create Question Block - at the end under uncategorized */}
                    {isCreatingQuestion && (
                        <CreateQuestionBlock quizId={quizId} onCancel={cancelCreateQuestion} />
                    )}
                </DndWrapper>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={deleteConfirm !== null}
                onOpenChange={(open) => {
                    // Prevent closing dialog while deleting
                    if (!isDeleting && !open) setDeleteConfirm(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deleteConfirm?.type === "chapter" ? "Chapter" : "Question"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteConfirm?.type === "chapter"
                                ? "Are you sure you want to delete this chapter? Questions in this chapter will become uncategorized."
                                : "Are you sure you want to delete this question? This action cannot be undone."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// Uncategorized drop zone component
interface UncategorizedDropZoneProps {
    hasQuestions: boolean;
    children: React.ReactNode;
}

function UncategorizedDropZone({ hasQuestions, children }: UncategorizedDropZoneProps) {
    // Check if a question from a chapter is being dragged
    const { active } = useDndContext();
    const isDraggingQuestion = active?.data.current?.type === "question";
    const draggedQuestionChapter = active?.data.current?.question?.chapter;
    // A question is from a chapter if it has a non-empty chapter string
    const isDraggingFromChapter =
        isDraggingQuestion &&
        typeof draggedQuestionChapter === "string" &&
        draggedQuestionChapter.length > 0;

    // Droppable zone for receiving questions from chapters
    // Enabled when dragging any question that belongs to a chapter
    const { setNodeRef, isOver } = useDroppable({
        id: "uncategorized-drop",
        data: {
            type: "uncategorized-drop",
        },
        disabled: !isDraggingFromChapter,
    });

    const showDropFeedback = isOver && isDraggingFromChapter;

    return (
        <div className="space-y-2 p-2 -m-2 rounded-lg">
            <h3 className="text-sm font-medium text-muted-foreground px-2">Uncategorized</h3>

            {/* Drop zone for empty section - always visible */}
            {!hasQuestions && (
                <div
                    ref={setNodeRef}
                    className={cn(
                        "h-[55px] flex items-center justify-center border-2 border-dashed rounded-lg text-sm text-center font-medium transition-colors duration-200",
                        showDropFeedback
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/30 text-muted-foreground"
                    )}
                >
                    {showDropFeedback
                        ? "Drop here to remove from chapter"
                        : "Drag questions here to remove them from chapters"}
                </div>
            )}

            {/* Questions */}
            {children}

            {/* Drop zone at bottom when section has questions - always rendered to prevent layout shift */}
            {hasQuestions && (
                <div
                    ref={isDraggingFromChapter ? setNodeRef : undefined}
                    className={cn(
                        "h-[55px] flex items-center justify-center border-2 border-dashed rounded-lg text-sm text-center font-medium transition-all duration-200",
                        isDraggingFromChapter
                            ? showDropFeedback
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-primary/50 bg-primary/5 text-primary/70"
                            : "opacity-0 pointer-events-none border-transparent"
                    )}
                >
                    Drop here to remove from chapter
                </div>
            )}
        </div>
    );
}

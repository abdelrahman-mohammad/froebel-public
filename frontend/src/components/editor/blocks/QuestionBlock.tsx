"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import isEqual from "lodash/isEqual";
import {
    Check,
    ChevronDown,
    ChevronRight,
    GripVertical,
    MessageSquare,
    Trash2,
    X,
} from "lucide-react";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
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
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { createEmptyQuestion, generateChoiceId } from "@/contexts/EditorContext";

import { cn } from "@/lib/utils";

import type { Choice, Question, QuestionType } from "@/types/quiz";
import { type RichTextContent, getPlainText } from "@/types/rich-text";

import {
    ChoicesEditor,
    FileUploadEditor,
    FillBlankEditor,
    FreeTextEditor,
    NumericEditor,
    TrueFalseEditor,
} from "../type-editors";

// Question type labels
const questionTypeLabels: Record<QuestionType, string> = {
    multiple_choice: "Multiple Choice",
    multiple_answer: "Multiple Answer",
    true_false: "True/False",
    fill_blank: "Fill Blank",
    dropdown: "Dropdown",
    free_text: "Free Text",
    numeric: "Numeric",
    file_upload: "File Upload",
};

const questionTypeAbbr: Record<QuestionType, string> = {
    multiple_choice: "MC",
    multiple_answer: "MA",
    true_false: "T/F",
    fill_blank: "Fill",
    dropdown: "DD",
    free_text: "Free",
    numeric: "Num",
    file_upload: "File",
};

interface QuestionBlockProps {
    question: Question;
    index: number;
    isExpanded: boolean;
    showAnswers: boolean;
    onToggleExpand: () => void;
    onUpdate: (question: Question) => void;
    onDelete: () => void;
    isDragging?: boolean;
    dragListeners?: React.HTMLAttributes<HTMLElement>;
}

export function QuestionBlock({
    question,
    index,
    isExpanded,
    showAnswers,
    onToggleExpand,
    onUpdate,
    onDelete,
    isDragging = false,
    dragListeners,
}: QuestionBlockProps) {
    // Local state for editing
    const [localQuestion, setLocalQuestion] = useState(question);
    const [originalQuestion, setOriginalQuestion] = useState(question);
    const [isDirty, setIsDirty] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);

    // Track previous question to detect external changes
    const prevQuestionRef = useRef<Question>(question);

    // Sync local state with prop when:
    // 1. Switching to a different question (ID change)
    // 2. Same question but updated from server (content change while not dirty)
    useEffect(() => {
        const isNewQuestion = question.id !== prevQuestionRef.current.id;
        const isExternalUpdate = !isEqual(question, prevQuestionRef.current) && !isDirty;

        if (isNewQuestion || isExternalUpdate) {
            setLocalQuestion(question);
            setOriginalQuestion(question);
            setIsDirty(false);
            prevQuestionRef.current = question;
        }
    }, [question, isDirty]);

    // Update field helper - only updates local state, not parent
    // Uses functional update to avoid stale closure issues
    const updateField = useCallback((field: string, value: unknown) => {
        setLocalQuestion((prev) => ({ ...prev, [field]: value }) as Question);
        setIsDirty(true);
    }, []);

    // Handle collapse - auto-save if dirty and collapse
    const handleCollapse = useCallback(() => {
        if (isDirty) {
            // Auto-save changes on collapse
            onUpdate(localQuestion);
            setOriginalQuestion(localQuestion);
            setIsDirty(false);
            prevQuestionRef.current = localQuestion;
        }
        onToggleExpand();
    }, [isDirty, localQuestion, onUpdate, onToggleExpand]);

    // Handle discard - show confirmation if dirty
    const handleDiscard = useCallback(() => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            onToggleExpand(); // Just collapse if no changes
        }
    }, [isDirty, onToggleExpand]);

    // Confirm discard
    const confirmDiscard = useCallback(() => {
        setLocalQuestion(originalQuestion);
        setIsDirty(false);
        setShowDiscardDialog(false);
        onToggleExpand();
    }, [originalQuestion, onToggleExpand]);

    // Handle update - save changes to parent
    const handleUpdate = useCallback(() => {
        onUpdate(localQuestion);
        setOriginalQuestion(localQuestion);
        setIsDirty(false);
        // Update ref to prevent sync effect from re-triggering
        prevQuestionRef.current = localQuestion;
        onToggleExpand();
    }, [localQuestion, onUpdate, onToggleExpand]);

    // Handle type change - preserve all common fields
    const handleTypeChange = useCallback(
        (type: QuestionType) => {
            const newQuestion = createEmptyQuestion(type);
            // Preserve all common fields that exist across question types
            const updated = {
                ...newQuestion, // Type-specific structure (choices, answers, etc.)
                // Common fields to preserve
                id: localQuestion.id,
                text: localQuestion.text,
                points: localQuestion.points,
                image: localQuestion.image,
                chapter: localQuestion.chapter,
                identifier: localQuestion.identifier,
                explanation: localQuestion.explanation,
                hintCorrect: localQuestion.hintCorrect,
                hintWrong: localQuestion.hintWrong,
            };
            setLocalQuestion(updated);
            setIsDirty(true);
        },
        [localQuestion]
    );

    // Choice management
    const addChoice = useCallback(() => {
        if (
            localQuestion.type === "multiple_choice" ||
            localQuestion.type === "multiple_answer" ||
            localQuestion.type === "dropdown"
        ) {
            const newChoices: Choice[] = [
                ...localQuestion.choices,
                {
                    id: generateChoiceId(localQuestion.choices.length),
                    text: "",
                    correct: false,
                },
            ];
            setLocalQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
            setIsDirty(true);
        }
    }, [localQuestion]);

    const removeChoice = useCallback(
        (choiceIndex: number) => {
            if (
                localQuestion.type === "multiple_choice" ||
                localQuestion.type === "multiple_answer" ||
                localQuestion.type === "dropdown"
            ) {
                const newChoices = localQuestion.choices
                    .filter((_, i) => i !== choiceIndex)
                    .map((c, i) => ({ ...c, id: generateChoiceId(i) }));
                setLocalQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
                setIsDirty(true);
            }
        },
        [localQuestion]
    );

    const updateChoice = useCallback(
        (choiceIndex: number, field: "text" | "correct", value: RichTextContent | boolean) => {
            if (
                localQuestion.type === "multiple_choice" ||
                localQuestion.type === "multiple_answer" ||
                localQuestion.type === "dropdown"
            ) {
                let newChoices: Choice[];

                if (field === "correct" && localQuestion.type !== "multiple_answer") {
                    // Single correct answer - unselect others
                    newChoices = localQuestion.choices.map((c, i) => ({
                        ...c,
                        correct: i === choiceIndex ? (value as boolean) : false,
                    }));
                } else {
                    newChoices = localQuestion.choices.map((c, i) =>
                        i === choiceIndex ? { ...c, [field]: value } : c
                    );
                }

                setLocalQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
                setIsDirty(true);
            }
        },
        [localQuestion]
    );

    // Preview text (extract plain text from rich content)
    const plainText = getPlainText(localQuestion.text).trim();
    const previewText = plainText
        ? plainText.length > 60
            ? plainText.slice(0, 60) + "..."
            : plainText
        : "Untitled question";

    // Collapsed view
    if (!isExpanded) {
        return (
            <div
                className={cn(
                    "flex items-center gap-2 p-3 border rounded-lg bg-card hover:bg-accent/30 transition-colors group",
                    isDragging && "opacity-50"
                )}
            >
                <div
                    className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    aria-label="Drag to reorder question"
                    role="button"
                    tabIndex={0}
                    {...dragListeners}
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                <button
                    onClick={onToggleExpand}
                    className="flex items-center gap-2 flex-1 text-left min-w-0"
                    aria-label={`Expand question ${localQuestion.identifier || `Q${index + 1}`}`}
                    aria-expanded={false}
                >
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground shrink-0">
                        {localQuestion.identifier || `Q${index + 1}`}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-muted rounded shrink-0">
                        {questionTypeAbbr[localQuestion.type]}
                    </span>
                    <span className="truncate flex-1">{previewText}</span>
                    <span className="text-sm text-muted-foreground shrink-0">
                        {localQuestion.points} pts
                    </span>
                </button>

                {showAnswers && (
                    <div className="text-xs text-muted-foreground shrink-0 max-w-32 truncate">
                        {renderAnswerPreview()}
                    </div>
                )}

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                    aria-label={`Delete question ${localQuestion.identifier || `Q${index + 1}`}`}
                >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
            </div>
        );
    }

    // Helper to render answer preview
    function renderAnswerPreview() {
        switch (localQuestion.type) {
            case "multiple_choice":
            case "multiple_answer":
            case "dropdown": {
                const correct = localQuestion.choices
                    .filter((c) => c.correct)
                    .map((c) => c.text || c.id.toUpperCase())
                    .join(", ");
                return correct || "No correct answer";
            }
            case "true_false":
                return localQuestion.correct ? "True" : "False";
            case "fill_blank":
                return localQuestion.answers.filter((a) => a).join(", ") || "No answers";
            case "free_text":
                return "Open-ended";
            case "numeric": {
                const tolerance = localQuestion.tolerance ? ` ±${localQuestion.tolerance}` : "";
                const unit = localQuestion.unit ? ` ${localQuestion.unit}` : "";
                return `${localQuestion.correctAnswer}${tolerance}${unit}`;
            }
            case "file_upload":
                return localQuestion.acceptedTypes.join(", ");
            default:
                return "";
        }
    }

    // Expanded view
    return (
        <div
            className={cn(
                "border border-primary rounded-lg bg-background overflow-hidden",
                isDragging && "opacity-50"
            )}
        >
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-primary/10 border-b">
                <div
                    className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                    aria-label="Drag to reorder question"
                    role="button"
                    tabIndex={0}
                    {...dragListeners}
                >
                    <GripVertical className="h-4 w-4" />
                </div>

                <button
                    onClick={handleCollapse}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    aria-label={`Collapse question ${localQuestion.identifier || `Q${index + 1}`} (auto-saves changes)`}
                    aria-expanded={true}
                    title="Collapse (auto-saves changes)"
                >
                    <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </button>

                <Input
                    value={localQuestion.identifier || ""}
                    onChange={(e) => updateField("identifier", e.target.value || undefined)}
                    placeholder={`Q${index + 1}`}
                    className="w-24 h-8 font-medium"
                />

                <div className="flex items-center gap-1 ml-auto">
                    <Label htmlFor={`points-${question.id}`} className="text-sm">
                        Points:
                    </Label>
                    <NumberInput
                        id={`points-${question.id}`}
                        min={0}
                        max={100}
                        value={localQuestion.points}
                        onChange={(e) => updateField("points", parseInt(e.target.value) || 0)}
                        className="w-16 h-8"
                    />
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                    <Label>Question Text</Label>
                    <RichTextEditor
                        key={`question-text-${localQuestion.id}`}
                        value={localQuestion.text}
                        onChange={(value) => updateField("text", value)}
                        size="default"
                        resizable
                        maxLength={2000}
                        hideActions={{ share: true, treeView: true }}
                    />
                    {(localQuestion.type === "fill_blank" || localQuestion.type === "dropdown") && (
                        <p className="text-xs text-muted-foreground">
                            {localQuestion.type === "fill_blank"
                                ? "Use {blank} to mark where inputs should appear"
                                : "Use {dropdown} to mark where dropdowns should appear"}
                        </p>
                    )}
                </div>

                {/* Type-specific editors - wrapped in error boundary to prevent crashes */}
                <ErrorBoundary
                    onReset={() => {
                        // Reset local question to original state on error recovery
                        setLocalQuestion(originalQuestion);
                        setIsDirty(false);
                    }}
                    resetLabel="Reset Question"
                >
                    {renderTypeEditor()}
                </ErrorBoundary>

                {/* Global Hints */}
                <Collapsible className="pt-4 border-t">
                    <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group w-full">
                        <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        <MessageSquare className="h-4 w-4" />
                        <span>Feedback Hints (optional)</span>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-success">
                                    When Correct
                                </Label>
                                <RichTextEditor
                                    key={`hint-correct-${localQuestion.id}`}
                                    value={localQuestion.hintCorrect}
                                    onChange={(value) => updateField("hintCorrect", value)}
                                    size="sm"
                                    resizable
                                    hideActions={{
                                        share: true,
                                        importExport: true,
                                        treeView: true,
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-destructive">
                                    When Wrong
                                </Label>
                                <RichTextEditor
                                    key={`hint-wrong-${localQuestion.id}`}
                                    value={localQuestion.hintWrong}
                                    onChange={(value) => updateField("hintWrong", value)}
                                    size="sm"
                                    resizable
                                    hideActions={{
                                        share: true,
                                        importExport: true,
                                        treeView: true,
                                    }}
                                />
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                    <Select value={localQuestion.type} onValueChange={handleTypeChange}>
                        <SelectTrigger className="w-40 h-8">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(questionTypeLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <div className="flex-1" />

                    <Button size="sm" variant="outline" onClick={handleDiscard} className="gap-1.5">
                        <X className="h-3.5 w-3.5" />
                        Discard
                    </Button>
                    <Button size="sm" onClick={handleUpdate} className="gap-1.5">
                        <Check className="h-3.5 w-3.5" />
                        Update
                    </Button>
                </div>
            </div>

            {/* Discard Changes Dialog */}
            <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes to this question. Are you sure you want to
                            discard them?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Keep Editing</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDiscard}>Discard</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    // Render type-specific editor using shared components
    function renderTypeEditor() {
        const editorProps = {
            question: localQuestion,
            updateField,
            addChoice,
            removeChoice,
            updateChoice,
            idPrefix: question.id,
        };

        switch (localQuestion.type) {
            case "multiple_choice":
            case "multiple_answer":
            case "dropdown":
                return <ChoicesEditor {...editorProps} />;
            case "true_false":
                return <TrueFalseEditor {...editorProps} />;
            case "fill_blank":
                return <FillBlankEditor {...editorProps} />;
            case "free_text":
                return <FreeTextEditor {...editorProps} />;
            case "numeric":
                return <NumericEditor {...editorProps} />;
            case "file_upload":
                return <FileUploadEditor {...editorProps} />;
            default:
                return null;
        }
    }
}

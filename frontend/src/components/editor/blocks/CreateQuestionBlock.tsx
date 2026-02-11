"use client";

import React, { useCallback, useState } from "react";

import { AlertCircle, Check, ChevronRight, Loader2, MessageSquare } from "lucide-react";

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
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
    createEmptyQuestion,
    generateChoiceId,
    useEditor,
    validateQuestion,
} from "@/contexts/EditorContext";

import { useQuizEditor } from "@/hooks/useQuizEditor";

import type { Choice, Question, QuestionType } from "@/types/quiz";
import type { RichTextContent } from "@/types/rich-text";

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

interface CreateQuestionBlockProps {
    quizId?: string;
    onCancel: () => void;
}

export function CreateQuestionBlock({ quizId, onCancel }: CreateQuestionBlockProps) {
    const { state, addQuestion } = useEditor();
    const { quiz } = state;
    const { addQuestion: addQuestionApi, isSaving: isApiSaving } = useQuizEditor();

    const [question, setQuestion] = useState<Question>(() => createEmptyQuestion());
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showDiscardDialog, setShowDiscardDialog] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Update field helper
    const updateField = useCallback((field: string, value: unknown) => {
        setQuestion((prev) => ({ ...prev, [field]: value }) as Question);
        setIsDirty(true);
    }, []);

    // Handle cancel with dirty check
    const handleCancel = useCallback(() => {
        if (isDirty) {
            setShowDiscardDialog(true);
        } else {
            onCancel();
        }
    }, [isDirty, onCancel]);

    // Handle type change - preserve all common fields
    const handleTypeChange = useCallback(
        (type: QuestionType) => {
            const newQuestion = createEmptyQuestion(type);
            setQuestion({
                ...newQuestion,
                id: question.id,
                text: question.text,
                points: question.points,
                image: question.image,
                chapter: question.chapter,
                identifier: question.identifier,
                explanation: question.explanation,
                hintCorrect: question.hintCorrect,
                hintWrong: question.hintWrong,
            });
            setIsDirty(true);
        },
        [question]
    );

    // Choice management
    const addChoice = useCallback(() => {
        if (
            question.type === "multiple_choice" ||
            question.type === "multiple_answer" ||
            question.type === "dropdown"
        ) {
            const newChoices: Choice[] = [
                ...question.choices,
                {
                    id: generateChoiceId(question.choices.length),
                    text: "",
                    correct: false,
                },
            ];
            setQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
            setIsDirty(true);
        }
    }, [question]);

    const removeChoice = useCallback(
        (index: number) => {
            if (
                question.type === "multiple_choice" ||
                question.type === "multiple_answer" ||
                question.type === "dropdown"
            ) {
                const newChoices = question.choices
                    .filter((_, i) => i !== index)
                    .map((c, i) => ({ ...c, id: generateChoiceId(i) }));
                setQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
                setIsDirty(true);
            }
        },
        [question]
    );

    const updateChoice = useCallback(
        (index: number, field: "text" | "correct", value: RichTextContent | boolean) => {
            if (
                question.type === "multiple_choice" ||
                question.type === "multiple_answer" ||
                question.type === "dropdown"
            ) {
                let newChoices: Choice[];

                if (field === "correct" && question.type !== "multiple_answer") {
                    newChoices = question.choices.map((c, i) => ({
                        ...c,
                        correct: i === index ? (value as boolean) : false,
                    }));
                } else {
                    newChoices = question.choices.map((c, i) =>
                        i === index ? { ...c, [field]: value } : c
                    );
                }

                setQuestion((prev) => ({ ...prev, choices: newChoices }) as Question);
                setIsDirty(true);
            }
        },
        [question]
    );

    // Clear field error when field is updated
    const updateFieldWithClear = useCallback(
        (field: string, value: unknown) => {
            updateField(field, value);
            // Clear field error when user starts typing
            if (fieldErrors[field]) {
                setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        },
        [updateField, fieldErrors]
    );

    // Handle save
    const handleSave = useCallback(async () => {
        // Set default identifier if empty
        const questionToSave = {
            ...question,
            identifier: question.identifier?.trim() || `Q${quiz.questions.length + 1}`,
        };

        const validationErrors = validateQuestion(questionToSave);
        if (validationErrors.length > 0) {
            // Convert to field-based errors
            const newFieldErrors: Record<string, string> = {};
            validationErrors.forEach((e) => {
                newFieldErrors[e.field] = e.message;
            });
            setFieldErrors(newFieldErrors);
            setGeneralError(null);
            return;
        }

        setIsSaving(true);
        setFieldErrors({});
        setGeneralError(null);

        try {
            if (quizId) {
                const addedQuestion = await addQuestionApi(questionToSave, quizId);
                addQuestion(addedQuestion);
            } else {
                addQuestion(questionToSave);
            }
            // Close the form after successful save
            onCancel();
        } catch (error) {
            console.error("Failed to save question:", error);
            // Sanitize error message to avoid exposing sensitive server details
            let userMessage = "Failed to save question. Please try again.";
            if (error instanceof Error) {
                // Only show user-friendly messages, not raw server errors
                const safePatterns = [
                    /validation/i,
                    /required/i,
                    /invalid/i,
                    /too long/i,
                    /too short/i,
                    /already exists/i,
                ];
                if (safePatterns.some((pattern) => pattern.test(error.message))) {
                    userMessage = error.message;
                }
            }
            setGeneralError(userMessage);
        } finally {
            setIsSaving(false);
        }
    }, [question, quizId, quiz.questions.length, addQuestion, addQuestionApi, onCancel]);

    const saving = isSaving || isApiSaving;

    return (
        <div className="border border-primary rounded-lg bg-background overflow-hidden animate-pulse-glow">
            {/* Header */}
            <div className="flex items-center gap-2 p-3 bg-primary/10 border-b">
                <Input
                    value={question.identifier || ""}
                    onChange={(e) => updateField("identifier", e.target.value)}
                    placeholder={`Q${quiz.questions.length + 1}`}
                    className="w-24 h-8 font-medium"
                />

                <div className="flex items-center gap-1 ml-auto">
                    <Label htmlFor="new-points" className="text-sm">
                        Points:
                    </Label>
                    <NumberInput
                        id="new-points"
                        min={0}
                        value={question.points}
                        onChange={(e) => updateField("points", parseInt(e.target.value) || 0)}
                        className="w-16 h-8"
                    />
                </div>
            </div>

            {/* General Error (e.g., API errors) */}
            {generalError && (
                <div className="p-3 bg-destructive/10 text-destructive text-sm border-b">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {generalError}
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Question Text */}
                <div className="space-y-2">
                    <Label className={fieldErrors.text ? "text-destructive" : ""}>
                        Question Text
                    </Label>
                    <RichTextEditor
                        key={`create-question-text-${question.id}`}
                        value={question.text}
                        onChange={(value) => updateFieldWithClear("text", value)}
                        size="default"
                        resizable
                        maxLength={2000}
                        autoFocus
                        hideActions={{ share: true, treeView: true }}
                    />
                    {fieldErrors.text && (
                        <p className="text-xs text-destructive flex items-center gap-1 -mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {fieldErrors.text}
                        </p>
                    )}
                    {(question.type === "fill_blank" || question.type === "dropdown") &&
                        !fieldErrors.text && (
                            <p className="text-xs text-muted-foreground">
                                {question.type === "fill_blank"
                                    ? "Use {blank} to mark where inputs should appear"
                                    : "Use {dropdown} to mark where dropdowns should appear"}
                            </p>
                        )}
                </div>

                {/* Type-specific editors */}
                {renderTypeEditor(question)}

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
                                    key={`create-hint-correct-${question.id}`}
                                    value={question.hintCorrect}
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
                                    key={`create-hint-wrong-${question.id}`}
                                    value={question.hintWrong}
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
                    <Select value={question.type} onValueChange={handleTypeChange}>
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

                    <Button size="sm" variant="outline" onClick={handleCancel} disabled={saving}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
                        {saving ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="h-3.5 w-3.5" />
                                Create
                            </>
                        )}
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
                        <AlertDialogAction onClick={onCancel}>Discard</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );

    // Render the appropriate type editor based on question type
    function renderTypeEditor(q: Question) {
        const editorProps = {
            question: q,
            updateField,
            addChoice,
            removeChoice,
            updateChoice,
            idPrefix: "new",
            fieldErrors,
        };

        switch (q.type) {
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

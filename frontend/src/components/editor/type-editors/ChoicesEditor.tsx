"use client";

import { AlertCircle, Plus, X } from "lucide-react";

import { InlineRichTextEditor } from "@/components/editor/InlineRichTextEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import type {
    DropdownQuestion,
    MultipleAnswerQuestion,
    MultipleChoiceQuestion,
} from "@/types/quiz";

import type { TypeEditorProps } from "./index";

type ChoiceQuestion = MultipleChoiceQuestion | MultipleAnswerQuestion | DropdownQuestion;

export function ChoicesEditor({
    question,
    updateChoice,
    addChoice,
    removeChoice,
    idPrefix = "choice",
    fieldErrors,
}: TypeEditorProps) {
    if (
        question.type !== "multiple_choice" &&
        question.type !== "multiple_answer" &&
        question.type !== "dropdown"
    ) {
        return null;
    }

    const q = question as ChoiceQuestion;
    const isMultiple = question.type === "multiple_answer";

    const choicesError = fieldErrors?.choices;

    return (
        <div className="space-y-3">
            <Label className={choicesError ? "text-destructive" : ""}>
                Answer Choices{" "}
                <span
                    className={cn(
                        "text-xs font-normal",
                        choicesError ? "text-destructive" : "text-muted-foreground"
                    )}
                >
                    ({isMultiple ? "Check all correct" : "Select correct"})
                </span>
            </Label>
            <div className="space-y-2">
                {q.choices.map((choice, index) => (
                    <div key={choice.id} className="flex items-center gap-2">
                        <input
                            type={isMultiple ? "checkbox" : "radio"}
                            checked={choice.correct}
                            onChange={(e) => updateChoice?.(index, "correct", e.target.checked)}
                            className="h-4 w-4 accent-primary shrink-0"
                            name={`${idPrefix}-correct`}
                        />
                        <InlineRichTextEditor
                            key={`choice-${choice.id}`}
                            value={choice.text}
                            onChange={(value) => updateChoice?.(index, "text", value)}
                            placeholder={`Choice ${choice.id.toUpperCase()}`}
                            className={cn(
                                "flex-1",
                                choice.correct && "shadow-[0_0_0_2px_rgb(34,197,94)]"
                            )}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeChoice?.(index)}
                            disabled={q.choices.length <= 2}
                            className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>
            {choicesError && (
                <p className="text-xs text-destructive flex items-center gap-1 -mt-1">
                    <AlertCircle className="h-3 w-3" />
                    {choicesError}
                </p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addChoice} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Choice
            </Button>
        </div>
    );
}

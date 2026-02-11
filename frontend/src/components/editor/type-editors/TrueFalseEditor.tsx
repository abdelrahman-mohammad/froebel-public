"use client";

import { Label } from "@/components/ui/label";

import type { TrueFalseQuestion } from "@/types/quiz";

import type { TypeEditorProps } from "./index";

export function TrueFalseEditor({ question, updateField, idPrefix = "tf" }: TypeEditorProps) {
    if (question.type !== "true_false") return null;

    const q = question as TrueFalseQuestion;

    return (
        <div className="space-y-3">
            <Label>Correct Answer</Label>
            <div className="flex gap-4">
                <label
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        q.correct === true
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    }`}
                >
                    <input
                        type="radio"
                        name={`${idPrefix}-answer`}
                        checked={q.correct === true}
                        onChange={() => updateField("correct", true)}
                        className="sr-only"
                    />
                    <span className="font-medium">True</span>
                </label>
                <label
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        q.correct === false
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                    }`}
                >
                    <input
                        type="radio"
                        name={`${idPrefix}-answer`}
                        checked={q.correct === false}
                        onChange={() => updateField("correct", false)}
                        className="sr-only"
                    />
                    <span className="font-medium">False</span>
                </label>
            </div>
        </div>
    );
}

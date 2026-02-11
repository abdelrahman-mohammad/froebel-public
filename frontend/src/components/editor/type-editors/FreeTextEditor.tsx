"use client";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { FreeTextQuestion } from "@/types/quiz";

import type { TypeEditorProps } from "./index";

export function FreeTextEditor({ question, updateField, idPrefix = "ft" }: TypeEditorProps) {
    if (question.type !== "free_text") return null;

    const q = question as FreeTextQuestion;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Correct Answer (optional)</Label>
                <RichTextEditor
                    key={`reference-answer-${q.id}`}
                    value={q.referenceAnswer}
                    onChange={(value) => updateField("referenceAnswer", value)}
                    size="sm"
                    resizable
                    maxLength={2000}
                    hideActions={{
                        share: true,
                        importExport: true,
                        treeView: true,
                    }}
                />
            </div>

            <div className="flex items-center gap-2">
                <Checkbox
                    id={`${idPrefix}-aiGrading`}
                    checked={q.aiGradingEnabled || false}
                    onCheckedChange={(checked) => updateField("aiGradingEnabled", checked === true)}
                />
                <Label
                    htmlFor={`${idPrefix}-aiGrading`}
                    className="text-sm cursor-pointer font-normal"
                >
                    Enable AI grading
                </Label>
            </div>
        </div>
    );
}

"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

import type { NumericQuestion } from "@/types/quiz";

import type { TypeEditorProps } from "./index";

export function NumericEditor({ question, updateField }: TypeEditorProps) {
    if (question.type !== "numeric") return null;

    const q = question as NumericQuestion;

    return (
        <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
                <Label>Correct Answer</Label>
                <NumberInput
                    value={q.correctAnswer}
                    onChange={(e) => updateField("correctAnswer", parseFloat(e.target.value) || 0)}
                    step={1}
                />
            </div>

            <div className="space-y-2">
                <Label>Tolerance (±)</Label>
                <NumberInput
                    value={q.tolerance ?? ""}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                            updateField("tolerance", null);
                        } else {
                            // Round to nearest 0.1
                            const parsed = parseFloat(val);
                            const rounded = Math.round(parsed * 10) / 10;
                            updateField("tolerance", rounded);
                        }
                    }}
                    min={0}
                    step={0.1}
                />
                <p className="text-xs text-muted-foreground">Leave empty for exact match</p>
            </div>

            <div className="space-y-2">
                <Label>Unit</Label>
                <Input
                    value={q.unit || ""}
                    onChange={(e) => updateField("unit", e.target.value)}
                    placeholder="e.g., kg, m/s"
                />
            </div>
        </div>
    );
}

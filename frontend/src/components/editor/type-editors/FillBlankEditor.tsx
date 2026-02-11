"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { FillBlankQuestion, ToleranceType } from "@/types/quiz";

import type { TypeEditorProps } from "./index";

export function FillBlankEditor({ question, updateField, idPrefix = "fb" }: TypeEditorProps) {
    if (question.type !== "fill_blank") return null;

    const q = question as FillBlankQuestion;

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Correct Answers (one per line)</Label>
                <Textarea
                    value={q.answers.join("\n")}
                    onChange={(e) => updateField("answers", e.target.value.split("\n"))}
                    onBlur={(e) => {
                        // Filter out empty lines when user finishes editing
                        const filtered = e.target.value.split("\n").filter((a) => a.trim());
                        if (filtered.length !== q.answers.length || filtered.some((a, i) => a !== q.answers[i])) {
                            updateField("answers", filtered);
                        }
                    }}
                    placeholder="Enter correct answers..."
                    rows={3}
                />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${idPrefix}-case-sensitive`}
                        checked={q.caseSensitive ?? false}
                        onCheckedChange={(checked) => updateField("caseSensitive", checked === true)}
                    />
                    <Label
                        htmlFor={`${idPrefix}-case-sensitive`}
                        className="text-sm cursor-pointer font-normal"
                    >
                        Case-sensitive matching
                    </Label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        id={`${idPrefix}-numeric`}
                        checked={q.numeric}
                        onCheckedChange={(checked) => updateField("numeric", checked === true)}
                    />
                    <Label
                        htmlFor={`${idPrefix}-numeric`}
                        className="text-sm cursor-pointer font-normal"
                    >
                        Numeric input mode
                    </Label>
                </div>
            </div>

            {q.numeric && (
                <div className="pl-6 space-y-2">
                    <Label className="text-sm">Tolerance</Label>
                    <div className="flex gap-2">
                        {(["off", "0.1", "1"] as ToleranceType[]).map((t) => (
                            <Button
                                key={t}
                                type="button"
                                variant={q.tolerance === t ? "default" : "outline"}
                                size="sm"
                                onClick={() => updateField("tolerance", t)}
                            >
                                {t === "off" ? "Exact" : `±${t}`}
                            </Button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

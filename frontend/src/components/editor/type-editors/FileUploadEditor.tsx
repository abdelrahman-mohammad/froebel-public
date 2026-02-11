"use client";

import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { FileTypeCombobox } from "@/components/ui/file-type-combobox";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/ui/number-input";

import type { FileUploadQuestion } from "@/types/quiz";

import type { TypeEditorProps } from "./index";

export function FileUploadEditor({ question, updateField }: TypeEditorProps) {
    if (question.type !== "file_upload") return null;

    const q = question as FileUploadQuestion;

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                    <Label>Accepted File Types</Label>
                    <FileTypeCombobox
                        value={q.acceptedTypes}
                        onChange={(types) =>
                            updateField("acceptedTypes", types.length > 0 ? types : [".pdf"])
                        }
                        placeholder="Select file types..."
                    />
                </div>

                <div className="space-y-2">
                    <Label>Max Size (MB)</Label>
                    <NumberInput
                        value={q.maxFileSizeMB}
                        onChange={(e) =>
                            updateField("maxFileSizeMB", Math.max(1, parseInt(e.target.value) || 1))
                        }
                        min={1}
                        max={15}
                        className="w-24"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label>Expected Answer Description (optional)</Label>
                <RichTextEditor
                    key={`expected-answer-${q.id}`}
                    value={q.referenceAnswer}
                    onChange={(value) => updateField("referenceAnswer", value)}
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
    );
}

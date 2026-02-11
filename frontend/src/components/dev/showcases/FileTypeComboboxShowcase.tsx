"use client";

import { useState } from "react";

import { FileTypeCombobox } from "@/components/ui/file-type-combobox";
import { Label } from "@/components/ui/label";

import { ShowcaseItem } from "../ShowcaseItem";

export function FileTypeComboboxShowcase() {
    const [types1, setTypes1] = useState<string[]>([]);
    const [types2, setTypes2] = useState<string[]>([".pdf", ".doc,.docx"]);
    const [types3, setTypes3] = useState<string[]>(["image/*", ".pdf", ".mp4"]);
    const [typesCustom, setTypesCustom] = useState<string[]>([".pdf", ".xyz"]);

    return (
        <ShowcaseItem
            title="File Type Combobox"
            description="Multi-select dropdown for file type selection"
        >
            <div className="space-y-6">
                {/* Basic */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Basic</h4>
                    <FileTypeCombobox
                        value={types1}
                        onChange={setTypes1}
                        placeholder="Select file types..."
                    />
                </div>

                {/* With Pre-selected */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Pre-selected (Documents)
                    </h4>
                    <FileTypeCombobox value={types2} onChange={setTypes2} />
                </div>

                {/* Multiple Types */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Multiple Categories
                    </h4>
                    <FileTypeCombobox value={types3} onChange={setTypes3} />
                </div>

                {/* Allow Custom */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Allow Custom Extensions
                    </h4>
                    <div className="space-y-3">
                        <FileTypeCombobox
                            value={typesCustom}
                            onChange={setTypesCustom}
                            allowCustom
                        />
                        <p className="text-xs text-muted-foreground">
                            Type a custom extension like &quot;.abc&quot; or &quot;xyz&quot; to add
                            it. Selected: {typesCustom.join(", ")}
                        </p>
                    </div>
                </div>

                {/* With Label */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">With Label</h4>
                    <div className="space-y-2">
                        <Label>Allowed Attachment Types</Label>
                        <FileTypeCombobox
                            value={[".pdf", ".png", ".jpg,.jpeg"]}
                            onChange={() => {}}
                            placeholder="Choose allowed types..."
                        />
                    </div>
                </div>

                {/* Current Selection Display */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Selection Preview
                    </h4>
                    <div className="space-y-3">
                        <FileTypeCombobox value={types1} onChange={setTypes1} />
                        <div className="text-sm text-muted-foreground">
                            Selected values: {types1.length > 0 ? types1.join(", ") : "None"}
                        </div>
                    </div>
                </div>

                {/* Categories Info */}
                <div className="p-4 bg-muted/50 rounded-lg text-sm">
                    <p className="font-medium mb-2">Available Categories:</p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Documents (PDF, Word, Excel, PowerPoint, Text)</li>
                        <li>Images (All Images, PNG, JPEG, GIF, SVG, WebP)</li>
                        <li>Audio (All Audio, MP3, WAV)</li>
                        <li>Video (All Video, MP4, WebM)</li>
                        <li>Archives (ZIP, RAR)</li>
                        <li>Code (JavaScript/TypeScript, Python, Java)</li>
                    </ul>
                </div>
            </div>
        </ShowcaseItem>
    );
}

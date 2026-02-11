"use client";

import { useState } from "react";

import { Check, ChevronLeft, ChevronRight, Download, Loader2 } from "lucide-react";

import { MarkdownPreview } from "@/components/course/editor/MarkdownEditor";
import { Button } from "@/components/ui/button";

import type { MaterialDTO } from "@/lib/course/types";

interface MaterialContentProps {
    material: MaterialDTO | null;
    isComplete: boolean;
    isUpdating: boolean;
    onToggleComplete: () => void;
    onPrevious: (() => void) | null;
    onNext: (() => void) | null;
    currentIndex: number;
    totalCount: number;
}

export function MaterialContent({
    material,
    isComplete,
    isUpdating,
    onToggleComplete,
    onPrevious,
    onNext,
    currentIndex,
    totalCount,
}: MaterialContentProps) {
    if (!material) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Select a material to view</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div>
                    <h2 className="text-xl font-semibold">{material.title}</h2>
                    <p className="text-sm text-muted-foreground">
                        Lesson {currentIndex + 1} of {totalCount}
                    </p>
                </div>
                <Button
                    variant={isComplete ? "outline" : "default"}
                    onClick={onToggleComplete}
                    disabled={isUpdating}
                    className="gap-2"
                >
                    {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isComplete ? (
                        <>
                            <Check className="h-4 w-4" />
                            Completed
                        </>
                    ) : (
                        "Mark Complete"
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {material.contentType === "TEXT" && material.content && (
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <MarkdownPreview content={material.content} />
                    </div>
                )}

                {material.contentType === "FILE" && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Download className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">File Material</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            This lesson contains a file attachment.
                        </p>
                        {material.fileId && (
                            <Button>
                                <Download className="h-4 w-4" />
                                Download File
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation footer */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                <Button
                    variant="outline"
                    onClick={onPrevious || undefined}
                    disabled={!onPrevious}
                    className="gap-2"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>

                <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} / {totalCount}
                </span>

                <Button
                    variant="outline"
                    onClick={onNext || undefined}
                    disabled={!onNext}
                    className="gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

export default MaterialContent;

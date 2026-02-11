"use client";

import React, { ChangeEvent, DragEvent, useCallback, useRef, useState } from "react";

import { AlertCircle, Download, FileIcon, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RichTextViewer } from "@/components/ui/RichTextViewer";

import { cn } from "@/lib/utils";

import type { FileUploadQuestion } from "@/types/quiz";

export interface FileUploadCheckResult {
    hasUpload: boolean;
    pendingManualGrade: boolean;
    fileName?: string;
}

export interface FileUploadProps {
    /** The question data */
    question: FileUploadQuestion;
    /** Current uploaded file info (file name or null) */
    userAnswer: string | null;
    /** Whether input is disabled */
    disabled: boolean;
    /** Check result (after checking answer) */
    checkResult: FileUploadCheckResult | null;
    /** Callback when file is uploaded */
    onFileUpload: (file: File | null) => void;
}

/**
 * File upload question component
 * Renders a drag-drop upload area with file validation
 */
export function FileUpload({
    question,
    userAnswer,
    disabled,
    checkResult,
    onFileUpload,
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    // Format accepted types for display
    const acceptedTypesDisplay = question.acceptedTypes.join(", ");

    // Validate file
    const validateFile = useCallback(
        (file: File): string | null => {
            // Check file size
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > question.maxFileSizeMB) {
                return `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum of ${question.maxFileSizeMB}MB`;
            }

            // Check file type
            const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
            const fileType = file.type;

            const isAccepted = question.acceptedTypes.some((accepted) => {
                // Check for wildcard MIME types like "image/*"
                if (accepted.includes("/*")) {
                    const [category] = accepted.split("/");
                    return fileType.startsWith(category + "/");
                }
                // Check extension
                if (accepted.startsWith(".")) {
                    return fileExtension === accepted.toLowerCase();
                }
                // Check exact MIME type
                return fileType === accepted;
            });

            if (!isAccepted) {
                return `File type not accepted. Allowed: ${acceptedTypesDisplay}`;
            }

            return null;
        },
        [question.acceptedTypes, question.maxFileSizeMB, acceptedTypesDisplay]
    );

    // Handle file selection
    const handleFileSelect = useCallback(
        (file: File) => {
            setUploadError(null);

            const error = validateFile(file);
            if (error) {
                setUploadError(error);
                return;
            }

            onFileUpload(file);
        },
        [validateFile, onFileUpload]
    );

    // Drag handlers
    const handleDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDragging(false);
        }
    }, []);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            dragCounter.current = 0;
            setIsDragging(false);

            if (disabled) return;

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        },
        [disabled, handleFileSelect]
    );

    // File input change handler
    const handleInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                handleFileSelect(files[0]);
            }
            // Reset the input
            e.target.value = "";
        },
        [handleFileSelect]
    );

    // Clear uploaded file
    const handleClear = useCallback(() => {
        onFileUpload(null);
        setUploadError(null);
    }, [onFileUpload]);

    return (
        <div className="answers file-upload-answers">
            {/* Question text */}
            <RichTextViewer content={question.text} className="question_text mb-4" />

            {/* Upload area or file preview */}
            {userAnswer ? (
                // File uploaded - show preview
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/30">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{userAnswer}</p>
                        <p className="text-sm text-muted-foreground">File uploaded successfully</p>
                    </div>
                    {!disabled && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={handleClear}
                            aria-label="Remove file"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ) : (
                // No file - show drop zone
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer",
                        isDragging
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !disabled && fileInputRef.current?.click()}
                >
                    <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                        {isDragging ? (
                            <>
                                <Download className="h-10 w-10 mb-3 text-blue-600 animate-bounce" />
                                <p className="text-blue-600 font-medium">Drop to upload</p>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 mb-3 text-muted-foreground" />
                                <p className="font-medium">Drop file here or click to browse</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Accepted: {acceptedTypesDisplay}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Max size: {question.maxFileSizeMB}MB
                                </p>
                            </>
                        )}
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={question.acceptedTypes.join(",")}
                        onChange={handleInputChange}
                        disabled={disabled}
                        className="hidden"
                    />
                </div>
            )}

            {/* Upload error */}
            {uploadError && (
                <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {uploadError}
                </div>
            )}

            {/* Manual grading notice */}
            <div className="mt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    This question will be manually graded by the instructor.
                </span>
            </div>

            {/* Check result feedback */}
            {checkResult && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
                    {checkResult.hasUpload ? (
                        <p className="text-amber-700">
                            Your file has been submitted and is pending manual review.
                        </p>
                    ) : (
                        <p className="text-amber-700">No file was uploaded for this question.</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default FileUpload;

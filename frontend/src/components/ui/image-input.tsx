"use client";

import React, { ChangeEvent, DragEvent, useCallback, useRef, useState } from "react";

import { Download, ImageIcon, Link, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";

interface ImageInputProps {
    value: string | null;
    onChange: (url: string | null) => void;
    aspectRatio?: "square" | "banner";
    placeholder?: string;
    helpText?: string;
    className?: string;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ImageInput({
    value,
    onChange,
    aspectRatio = "square",
    placeholder,
    helpText,
    className,
}: ImageInputProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [urlInput, setUrlInput] = useState("");
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    // Use fixed height for consistent sizing between icon and banner
    const sizeClasses = aspectRatio === "square" ? "w-32 h-32" : "w-full h-32";

    const validateAndProcessFile = useCallback(
        (file: File) => {
            setUploadError(null);

            // Validate file type
            if (!ACCEPTED_TYPES.includes(file.type)) {
                setUploadError("Please upload a JPEG, PNG, WebP, or GIF image");
                return;
            }

            // Validate file size
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                setUploadError(`File size must be under ${MAX_FILE_SIZE_MB}MB`);
                return;
            }

            // Convert to base64 data URL
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                onChange(result);
                setImageError(false);
            };
            reader.onerror = () => {
                setUploadError("Failed to read file");
            };
            reader.readAsDataURL(file);
        },
        [onChange]
    );

    // Drag and drop handlers with counter to prevent jitter
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

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                validateAndProcessFile(files[0]);
            }
        },
        [validateAndProcessFile]
    );

    // File input handler
    const handleFileSelect = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                validateAndProcessFile(files[0]);
            }
            // Reset the input so the same file can be selected again
            e.target.value = "";
        },
        [validateAndProcessFile]
    );

    // URL input handler
    const handleUrlSubmit = useCallback(() => {
        const url = urlInput.trim();
        if (url) {
            onChange(url);
            setUrlInput("");
            setShowUrlInput(false);
            setImageError(false);
        }
    }, [urlInput, onChange]);

    const handleUrlKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleUrlSubmit();
            } else if (e.key === "Escape") {
                setShowUrlInput(false);
                setUrlInput("");
            }
        },
        [handleUrlSubmit]
    );

    // Clear image
    const handleClear = useCallback(() => {
        onChange(null);
        setImageError(false);
        setUploadError(null);
    }, [onChange]);

    // Handle image load error
    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    const handleImageLoad = useCallback(() => {
        setImageError(false);
    }, []);

    const defaultPlaceholder =
        aspectRatio === "square" ? "Drop icon here" : "Drop banner image here";

    return (
        <div className={cn("space-y-2", className)}>
            {/* Image preview / drop zone */}
            <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg overflow-hidden transition-all duration-200",
                    sizeClasses,
                    isDragging ? "border-blue-500 bg-blue-500/10" : "border-muted-foreground/25",
                    !value &&
                        !isDragging &&
                        "cursor-pointer hover:border-primary/50 hover:bg-muted/50",
                    value && !isDragging && "hover:opacity-90"
                )}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => !value && fileInputRef.current?.click()}
            >
                {value && !imageError ? (
                    <>
                        {/* Image preview */}
                        <img
                            src={value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                        />
                        {/* Clear button */}
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-md"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClear();
                            }}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </>
                ) : (
                    /* Drop zone placeholder */
                    <div
                        className={cn(
                            "absolute inset-0 flex flex-col items-center justify-center transition-colors duration-200 pointer-events-none",
                            isDragging ? "text-blue-600" : "text-muted-foreground"
                        )}
                    >
                        {imageError ? (
                            <>
                                <ImageIcon className="h-8 w-8 mb-2 text-destructive" />
                                <span className="text-sm text-destructive">
                                    Failed to load image
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 pointer-events-auto"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                >
                                    Clear
                                </Button>
                            </>
                        ) : isDragging ? (
                            <>
                                <Download className="h-8 w-8 mb-2 animate-bounce" />
                                <span className="text-sm font-medium">Drop to upload</span>
                            </>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mb-2" />
                                <span className="text-sm">{placeholder || defaultPlaceholder}</span>
                                <span className="text-xs mt-1">or click to browse</span>
                            </>
                        )}
                    </div>
                )}

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_TYPES.join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Upload error message */}
            {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}

            {/* URL input dialog */}
            <Dialog
                open={showUrlInput}
                onOpenChange={(open) => {
                    setShowUrlInput(open);
                    if (!open) setUrlInput("");
                }}
            >
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-muted-foreground"
                    >
                        <Link className="h-3 w-3" />
                        Use URL
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Image URL</DialogTitle>
                        <DialogDescription>
                            Paste a URL to an image (JPEG, PNG, WebP, or GIF)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={handleUrlKeyDown}
                            placeholder="https://example.com/image.jpg"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowUrlInput(false);
                                setUrlInput("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                            Add Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Help text */}
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
        </div>
    );
}

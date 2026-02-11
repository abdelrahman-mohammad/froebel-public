"use client";

import { ChangeEvent, DragEvent, useCallback, useRef, useState } from "react";

import { Download, ImageIcon, Link, Upload, X } from "lucide-react";

import { CategorySelector } from "@/components/editor/CategorySelector";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagsInput } from "@/components/ui/tags-input";
import { Textarea } from "@/components/ui/textarea";

import { useEditor } from "@/contexts/EditorContext";

import { cn } from "@/lib/utils";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function DetailsTab() {
    const {
        state,
        updateTitle,
        updateDescription,
        updateCategory,
        updateTags,
        updateIconUrl,
        updateBannerUrl,
    } = useEditor();
    const { quiz, isDirty, showValidationErrors } = state;
    const [categoryTouched, setCategoryTouched] = useState(false);

    // Drag states
    const [bannerDragging, setBannerDragging] = useState(false);
    const [iconDragging, setIconDragging] = useState(false);
    const bannerDragCounter = useRef(0);
    const iconDragCounter = useRef(0);

    // File input refs
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const iconInputRef = useRef<HTMLInputElement>(null);

    // URL dialog states - separate inputs to prevent data loss when switching dialogs
    const [showBannerUrlDialog, setShowBannerUrlDialog] = useState(false);
    const [showIconUrlDialog, setShowIconUrlDialog] = useState(false);
    const [bannerUrlInput, setBannerUrlInput] = useState("");
    const [iconUrlInput, setIconUrlInput] = useState("");

    // Error states
    const [bannerError, setBannerError] = useState<string | null>(null);
    const [iconError, setIconError] = useState<string | null>(null);

    const handleCategoryChange = useCallback(
        (id: string | null, name: string | null) => {
            setCategoryTouched(true);
            updateCategory(id, name);
        },
        [updateCategory]
    );

    // File validation and processing
    const processFile = useCallback(
        (file: File, type: "banner" | "icon") => {
            const setError = type === "banner" ? setBannerError : setIconError;
            const updateUrl = type === "banner" ? updateBannerUrl : updateIconUrl;

            setError(null);

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setError("Please upload a JPEG, PNG, WebP, or GIF image");
                return;
            }

            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                setError(`File size must be under ${MAX_FILE_SIZE_MB}MB`);
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                updateUrl(result);
            };
            reader.onerror = () => {
                setError("Failed to read file");
            };
            reader.readAsDataURL(file);
        },
        [updateBannerUrl, updateIconUrl]
    );

    // Banner drag handlers
    const handleBannerDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        bannerDragCounter.current++;
        setBannerDragging(true);
    }, []);

    const handleBannerDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use Math.max to prevent counter going negative due to event ordering issues
        bannerDragCounter.current = Math.max(0, bannerDragCounter.current - 1);
        if (bannerDragCounter.current === 0) {
            setBannerDragging(false);
        }
    }, []);

    const handleBannerDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleBannerDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            bannerDragCounter.current = 0;
            setBannerDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0], "banner");
            }
        },
        [processFile]
    );

    // Icon drag handlers
    const handleIconDragEnter = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        iconDragCounter.current++;
        setIconDragging(true);
    }, []);

    const handleIconDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Use Math.max to prevent counter going negative due to event ordering issues
        iconDragCounter.current = Math.max(0, iconDragCounter.current - 1);
        if (iconDragCounter.current === 0) {
            setIconDragging(false);
        }
    }, []);

    const handleIconDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleIconDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            iconDragCounter.current = 0;
            setIconDragging(false);

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                processFile(files[0], "icon");
            }
        },
        [processFile]
    );

    // File input handlers
    const handleBannerFileSelect = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                processFile(files[0], "banner");
            }
            e.target.value = "";
        },
        [processFile]
    );

    const handleIconFileSelect = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                processFile(files[0], "icon");
            }
            e.target.value = "";
        },
        [processFile]
    );

    // URL submit handlers - using separate state for each dialog
    const handleBannerUrlSubmit = useCallback(() => {
        const url = bannerUrlInput.trim();
        if (url) {
            updateBannerUrl(url);
            setBannerUrlInput("");
            setShowBannerUrlDialog(false);
        }
    }, [bannerUrlInput, updateBannerUrl]);

    const handleIconUrlSubmit = useCallback(() => {
        const url = iconUrlInput.trim();
        if (url) {
            updateIconUrl(url);
            setIconUrlInput("");
            setShowIconUrlDialog(false);
        }
    }, [iconUrlInput, updateIconUrl]);

    // Show category error if user touched the field OR if validation failed during publish attempt
    const showCategoryError = !quiz.categoryId && (categoryTouched || showValidationErrors);

    return (
        <div className="max-w-3xl mx-auto p-6">
            {/* Main container - vertically stacked */}
            <div className="space-y-8">
                {/* Media Preview Section */}
                <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                        Media Preview
                    </h3>
                    <div className="border-b border-border/50 -mt-2 mb-4" />

                    {/* Banner and Icon Upload Areas */}
                    <div className="flex gap-4">
                        {/* Icon Upload */}
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Icon</Label>
                            <div
                                className={cn(
                                    "w-40 aspect-square rounded-lg overflow-hidden border-2 border-dashed transition-all duration-200 cursor-pointer",
                                    iconDragging
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50"
                                )}
                                onDragEnter={handleIconDragEnter}
                                onDragLeave={handleIconDragLeave}
                                onDragOver={handleIconDragOver}
                                onDrop={handleIconDrop}
                                onClick={() => iconInputRef.current?.click()}
                            >
                                {quiz.iconUrl ? (
                                    <div className="relative w-full h-full flex items-center justify-center bg-muted/50">
                                        <img
                                            src={quiz.iconUrl}
                                            alt="Quiz icon"
                                            className="h-full w-auto object-contain"
                                        />
                                        {/* Clear button */}
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2 h-6 w-6 rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateIconUrl(null);
                                                setIconError(null);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                        {/* URL button */}
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-10 h-6 w-6 rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowIconUrlDialog(true);
                                            }}
                                        >
                                            <Link className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : iconDragging ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-blue-600">
                                        <Download className="h-6 w-6 animate-bounce" />
                                        <span className="text-xs font-medium mt-1">Drop</span>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground p-2">
                                        <ImageIcon className="h-6 w-6 mb-1" />
                                        <span className="text-xs text-center leading-tight">
                                            Drag here,{" "}
                                            <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowIconUrlDialog(true);
                                                }}
                                            >
                                                paste link
                                            </button>
                                            , or{" "}
                                            <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    iconInputRef.current?.click();
                                                }}
                                            >
                                                browse
                                            </button>
                                        </span>
                                    </div>
                                )}

                                {/* Hidden file input */}
                                <input
                                    ref={iconInputRef}
                                    type="file"
                                    accept={ACCEPTED_TYPES.join(",")}
                                    onChange={handleIconFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Banner Upload */}
                        <div className="flex-1 space-y-2">
                            <Label className="text-xs text-muted-foreground">Banner</Label>
                            <div
                                className={cn(
                                    "relative w-full h-40 rounded-lg overflow-hidden border-2 border-dashed transition-all duration-200 cursor-pointer",
                                    bannerDragging
                                        ? "border-blue-500 bg-blue-500/10"
                                        : "border-muted-foreground/25 bg-muted/30 hover:border-primary/50"
                                )}
                                onDragEnter={handleBannerDragEnter}
                                onDragLeave={handleBannerDragLeave}
                                onDragOver={handleBannerDragOver}
                                onDrop={handleBannerDrop}
                                onClick={() => bannerInputRef.current?.click()}
                            >
                                {quiz.bannerUrl ? (
                                    <>
                                        <img
                                            src={quiz.bannerUrl}
                                            alt="Quiz banner"
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Clear button */}
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                updateBannerUrl(null);
                                                setBannerError(null);
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                        {/* URL button */}
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="icon"
                                            className="absolute top-2 right-11 h-7 w-7 rounded-full shadow-md"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowBannerUrlDialog(true);
                                            }}
                                        >
                                            <Link className="h-3.5 w-3.5" />
                                        </Button>
                                    </>
                                ) : bannerDragging ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-600">
                                        <Download className="h-8 w-8 mb-2 animate-bounce" />
                                        <span className="text-sm font-medium">Drop to upload</span>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                                        <Upload className="h-8 w-8 mb-2" />
                                        <span className="text-sm">
                                            Drag here,{" "}
                                            <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowBannerUrlDialog(true);
                                                }}
                                            >
                                                paste link
                                            </button>
                                            , or{" "}
                                            <button
                                                type="button"
                                                className="text-primary hover:underline font-medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    bannerInputRef.current?.click();
                                                }}
                                            >
                                                browse
                                            </button>
                                        </span>
                                        <span className="text-xs mt-1">Recommended: 1200×400</span>
                                    </div>
                                )}

                                {/* Hidden file input */}
                                <input
                                    ref={bannerInputRef}
                                    type="file"
                                    accept={ACCEPTED_TYPES.join(",")}
                                    onChange={handleBannerFileSelect}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error messages */}
                    {(bannerError || iconError) && (
                        <div className="flex justify-between items-start mt-4">
                            {iconError && <p className="text-xs text-destructive">{iconError}</p>}
                            {bannerError && (
                                <p className="text-xs text-destructive ml-auto">{bannerError}</p>
                            )}
                        </div>
                    )}
                </section>

                {/* Quiz Details Section */}
                <section>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                        Quiz Details
                    </h3>
                    <div className="border-b border-border/50 -mt-2 mb-4" />

                    <div className="space-y-6">
                        {/* Quiz Title */}
                        <div className="space-y-2">
                            <Label htmlFor="title">
                                Title <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="title"
                                value={quiz.title}
                                onChange={(e) => updateTitle(e.target.value)}
                                placeholder="Enter quiz title..."
                                className="text-lg"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={quiz.description || ""}
                                onChange={(e) => updateDescription(e.target.value)}
                                placeholder="Enter quiz description..."
                                rows={3}
                            />
                        </div>

                        {/* Category and Tags - side by side on medium+ screens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Category */}
                            <div className="space-y-2">
                                <Label>
                                    Category <span className="text-destructive">*</span>
                                </Label>
                                <CategorySelector
                                    value={quiz.categoryId || null}
                                    onChange={handleCategoryChange}
                                />
                                {showCategoryError && (
                                    <p className="text-xs text-destructive">Category is required</p>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <TagsInput
                                    tags={quiz.tags || []}
                                    onChange={updateTags}
                                    placeholder="Add tag..."
                                    maxTags={10}
                                />
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* URL Dialogs - each with separate state to prevent data loss */}
            <Dialog
                open={showBannerUrlDialog}
                onOpenChange={(open) => {
                    setShowBannerUrlDialog(open);
                    if (!open) setBannerUrlInput("");
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Banner Image URL</DialogTitle>
                        <DialogDescription>
                            Paste a URL to an image (JPEG, PNG, WebP, or GIF)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            type="url"
                            value={bannerUrlInput}
                            onChange={(e) => setBannerUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleBannerUrlSubmit();
                                }
                            }}
                            placeholder="https://example.com/banner.jpg"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowBannerUrlDialog(false);
                                setBannerUrlInput("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleBannerUrlSubmit} disabled={!bannerUrlInput.trim()}>
                            Add Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={showIconUrlDialog}
                onOpenChange={(open) => {
                    setShowIconUrlDialog(open);
                    if (!open) setIconUrlInput("");
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enter Icon Image URL</DialogTitle>
                        <DialogDescription>
                            Paste a URL to an image (JPEG, PNG, WebP, or GIF)
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Input
                            type="url"
                            value={iconUrlInput}
                            onChange={(e) => setIconUrlInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleIconUrlSubmit();
                                }
                            }}
                            placeholder="https://example.com/icon.jpg"
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowIconUrlDialog(false);
                                setIconUrlInput("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleIconUrlSubmit} disabled={!iconUrlInput.trim()}>
                            Add Image
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

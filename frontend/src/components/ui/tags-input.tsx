"use client";

import React, { KeyboardEvent, useCallback, useRef, useState } from "react";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    maxTags?: number;
    maxTagLength?: number;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export function TagsInput({
    tags,
    onChange,
    maxTags = 10,
    maxTagLength = 15,
    placeholder = "Add tag...",
    className,
    disabled = false,
}: TagsInputProps) {
    const [inputValue, setInputValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const addTag = useCallback(() => {
        const trimmedValue = inputValue.trim().toLowerCase();

        // Validate: not empty, not duplicate, not at max
        if (!trimmedValue) return;
        if (tags.includes(trimmedValue)) {
            setInputValue("");
            return;
        }
        if (tags.length >= maxTags) return;

        onChange([...tags, trimmedValue]);
        setInputValue("");
    }, [inputValue, tags, maxTags, onChange]);

    const removeTag = useCallback(
        (tagToRemove: string, e?: React.MouseEvent) => {
            e?.stopPropagation();
            onChange(tags.filter((tag) => tag !== tagToRemove));
            // Keep focus on input after removing
            inputRef.current?.focus();
        },
        [tags, onChange]
    );

    const handleKeyDown = useCallback(
        (e: KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault();
                addTag();
            } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
                // Remove the last tag when pressing backspace on empty input
                removeTag(tags[tags.length - 1]);
            } else if (e.key === "Escape") {
                inputRef.current?.blur();
            }
        },
        [addTag, inputValue, tags, removeTag]
    );

    const handleContainerClick = useCallback(() => {
        if (!disabled) {
            inputRef.current?.focus();
        }
    }, [disabled]);

    const canAddMore = tags.length < maxTags;

    return (
        <div className={cn("space-y-2", className)}>
            {/* Unified container */}
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                className={cn(
                    "flex flex-wrap items-center gap-1.5 min-h-10 w-full rounded-md border bg-background px-3 py-2 text-sm transition-all duration-200",
                    isFocused
                        ? "border-primary shadow-[0_0_0_4px_rgba(3,116,181,0.1)]"
                        : "border-input hover:border-border",
                    disabled && "cursor-not-allowed opacity-50",
                    !disabled && "cursor-text"
                )}
            >
                {/* Tags */}
                {tags.map((tag, index) => (
                    <Badge
                        key={tag}
                        variant="secondary"
                        className={cn(
                            "gap-1 pr-1 animate-in fade-in-0 zoom-in-95 duration-200",
                            "hover:bg-muted-foreground/20"
                        )}
                        style={{ animationDelay: `${index * 30}ms` }}
                    >
                        <span className="max-w-[120px] truncate">{tag}</span>
                        <button
                            type="button"
                            onClick={(e) => removeTag(tag, e)}
                            disabled={disabled}
                            className={cn(
                                "ml-0.5 rounded-full p-0.5 transition-colors",
                                "hover:bg-foreground/20 hover:text-foreground",
                                "focus:outline-none focus:ring-1 focus:ring-ring"
                            )}
                            aria-label={`Remove ${tag}`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}

                {/* Inline input */}
                {canAddMore && !disabled && (
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value.slice(0, maxTagLength))}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => {
                            setIsFocused(false);
                            // Auto-add tag on blur if there's content
                            if (inputValue.trim()) {
                                addTag();
                            }
                        }}
                        placeholder={tags.length === 0 ? placeholder : ""}
                        maxLength={maxTagLength}
                        className={cn(
                            "flex-1 min-w-[80px] bg-transparent outline-none placeholder:text-muted-foreground",
                            tags.length > 0 && "placeholder:text-transparent"
                        )}
                        disabled={disabled}
                    />
                )}

                {/* Max reached indicator */}
                {!canAddMore && (
                    <span className="text-xs text-muted-foreground italic">Max {maxTags} tags</span>
                )}
            </div>

            {/* Helper text with counter */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {inputValue.length > 0 ? (
                        <span
                            className={cn(
                                "tabular-nums",
                                inputValue.length >= maxTagLength && "text-amber-500"
                            )}
                        >
                            {inputValue.length}/{maxTagLength} chars
                        </span>
                    ) : (
                        <>
                            Press Enter to add
                            {tags.length > 0 ? ", Backspace to remove" : ""}
                        </>
                    )}
                </span>
                <span
                    className={cn(
                        "tabular-nums transition-colors",
                        tags.length >= maxTags && "text-amber-500"
                    )}
                >
                    {tags.length}/{maxTags}
                </span>
            </div>
        </div>
    );
}

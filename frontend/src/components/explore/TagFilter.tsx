"use client";

import { useState } from "react";

import { Check, ChevronsUpDown, Tag, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import type { TagDTO } from "@/lib/tags/api";

interface TagFilterProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    tags: TagDTO[];
    isLoading?: boolean;
    disabled?: boolean;
    maxVisible?: number;
}

export function TagFilter({
    selectedTags,
    onChange,
    tags = [],
    isLoading,
    disabled,
    maxVisible = 2,
}: TagFilterProps) {
    // Ensure we have a safe array to work with
    const availableTags = tags ?? [];
    const [open, setOpen] = useState(false);

    const toggleTag = (tagSlug: string) => {
        if (selectedTags.includes(tagSlug)) {
            onChange(selectedTags.filter((t) => t !== tagSlug));
        } else {
            onChange([...selectedTags, tagSlug]);
        }
    };

    const removeTag = (tagSlug: string) => {
        onChange(selectedTags.filter((t) => t !== tagSlug));
    };

    const visibleTags = selectedTags.slice(0, maxVisible);
    const hiddenCount = selectedTags.length - maxVisible;

    return (
        <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        role="combobox"
                        aria-expanded={open}
                        className="justify-between"
                        disabled={disabled || isLoading}
                    >
                        <Tag className="h-4 w-4 mr-2 shrink-0" />
                        {isLoading ? (
                            <span className="text-muted-foreground">Loading...</span>
                        ) : selectedTags.length > 0 ? (
                            <span>{selectedTags.length} tags</span>
                        ) : (
                            <span className="text-muted-foreground">Tags</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                            <CommandEmpty>No tags found.</CommandEmpty>
                            <CommandGroup>
                                {availableTags.map((tag) => (
                                    <CommandItem
                                        key={tag.id}
                                        value={tag.name}
                                        onSelect={() => toggleTag(tag.slug)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                selectedTags.includes(tag.slug)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {tag.name}
                                        {tag.usageCount > 0 && (
                                            <Badge variant="secondary" className="ml-auto text-xs">
                                                {tag.usageCount}
                                            </Badge>
                                        )}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Show selected tags as badges */}
            {selectedTags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                    {visibleTags.map((tagSlug) => {
                        const tag = availableTags.find((t) => t.slug === tagSlug);
                        return (
                            <Badge
                                key={tagSlug}
                                variant="secondary"
                                className="gap-1 pr-1"
                            >
                                {tag?.name || tagSlug}
                                <button
                                    type="button"
                                    onClick={() => removeTag(tagSlug)}
                                    className="ml-1 rounded-full hover:bg-muted p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Remove {tag?.name || tagSlug}</span>
                                </button>
                            </Badge>
                        );
                    })}
                    {hiddenCount > 0 && (
                        <Badge variant="outline">+{hiddenCount} more</Badge>
                    )}
                </div>
            )}
        </div>
    );
}

export default TagFilter;

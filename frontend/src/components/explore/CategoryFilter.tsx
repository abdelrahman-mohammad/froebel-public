"use client";

import { useState } from "react";

import { Check, ChevronsUpDown, FolderTree, X } from "lucide-react";

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
import type { ApiCategory } from "@/lib/quiz/types";

interface CategoryFilterProps {
    value: string | null;
    onChange: (categoryId: string | null) => void;
    categories: ApiCategory[];
    flatCategories: ApiCategory[];
    getCategoryPath: (id: string) => string;
    isLoading?: boolean;
    disabled?: boolean;
}

export function CategoryFilter({
    value,
    onChange,
    categories,
    flatCategories,
    getCategoryPath,
    isLoading,
    disabled,
}: CategoryFilterProps) {
    const [open, setOpen] = useState(false);

    const selectedCategory = value ? flatCategories.find((c) => c.id === value) : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between min-w-[140px]"
                    disabled={disabled || isLoading}
                >
                    <FolderTree className="h-4 w-4 mr-2 shrink-0" />
                    {isLoading ? (
                        <span className="text-muted-foreground">Loading...</span>
                    ) : selectedCategory ? (
                        <span className="truncate">{selectedCategory.name}</span>
                    ) : (
                        <span className="text-muted-foreground">Category</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {/* All categories option */}
                            <CommandItem
                                value="all-categories"
                                onSelect={() => {
                                    onChange(null);
                                    setOpen(false);
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === null ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                All Categories
                            </CommandItem>

                            {/* Render categories hierarchically */}
                            {categories.map((category) => (
                                <CategoryItem
                                    key={category.id}
                                    category={category}
                                    selectedId={value}
                                    onSelect={(id) => {
                                        onChange(id);
                                        setOpen(false);
                                    }}
                                    depth={0}
                                />
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

interface CategoryItemProps {
    category: ApiCategory;
    selectedId: string | null;
    onSelect: (id: string) => void;
    depth: number;
}

function CategoryItem({ category, selectedId, onSelect, depth }: CategoryItemProps) {
    return (
        <>
            <CommandItem
                value={`${category.name}-${category.id}`}
                onSelect={() => onSelect(category.id)}
                style={{ paddingLeft: `${(depth + 1) * 12}px` }}
            >
                <Check
                    className={cn(
                        "mr-2 h-4 w-4",
                        selectedId === category.id ? "opacity-100" : "opacity-0"
                    )}
                />
                {category.name}
                {category.usageCount !== undefined && category.usageCount > 0 && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                        {category.usageCount}
                    </Badge>
                )}
            </CommandItem>
            {category.children?.map((child) => (
                <CategoryItem
                    key={child.id}
                    category={child}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    depth={depth + 1}
                />
            ))}
        </>
    );
}

export default CategoryFilter;

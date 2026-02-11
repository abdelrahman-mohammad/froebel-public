"use client";

import { useEffect, useMemo, useState } from "react";

import { Check, ChevronsUpDown, Folder, Loader2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

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

import { fetchCategories } from "@/lib/quiz/api";
import type { ApiCategory } from "@/lib/quiz/types";
import { cn } from "@/lib/utils";

interface CategorySelectorProps {
    value: string | null;
    onChange: (id: string | null, name: string | null) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

interface FlatCategory {
    id: string;
    name: string;
    parentId: string | null;
    breadcrumb: string; // Full path like "Programming › Web Development › React"
    icon?: string | null;
    depth: number; // 0 = root, 1 = subcategory, 2 = 3rd level
}

// Helper to get icon component from icon name string
function getIconComponent(
    iconName: string | null | undefined
): React.ComponentType<{ className?: string }> {
    if (!iconName) return Folder;

    // Convert icon name to PascalCase (e.g., "book-open" -> "BookOpen")
    const pascalCase = iconName
        .split(/[-_]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");

    const IconComponent = (
        LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>
    )[pascalCase];
    return IconComponent || Folder;
}

export function CategorySelector({
    value,
    onChange,
    placeholder = "Select category...",
    className,
    disabled = false,
}: CategorySelectorProps) {
    const [open, setOpen] = useState(false);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch categories on mount
    useEffect(() => {
        let mounted = true;

        async function loadCategories() {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchCategories();
                if (mounted) {
                    setCategories(data);
                }
            } catch (err) {
                if (mounted) {
                    setError("Failed to load categories");
                    console.error("Failed to fetch categories:", err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        loadCategories();

        return () => {
            mounted = false;
        };
    }, []);

    // Recursively flatten categories for easier lookup
    const flatCategories = useMemo(() => {
        const flat: FlatCategory[] = [];

        function flatten(category: ApiCategory, parentBreadcrumb: string, depth: number) {
            const breadcrumb = parentBreadcrumb
                ? `${parentBreadcrumb} › ${category.name}`
                : category.name;

            flat.push({
                id: category.id,
                name: category.name,
                parentId: category.parentId || null,
                breadcrumb,
                icon: category.icon,
                depth,
            });

            // Recursively add children
            if (category.children && category.children.length > 0) {
                category.children.forEach((child) => {
                    flatten(child, breadcrumb, depth + 1);
                });
            }
        }

        categories.forEach((root) => flatten(root, "", 0));
        return flat;
    }, [categories]);

    // Group categories by root parent for display
    const groupedCategories = useMemo(() => {
        const groups = new Map<string, FlatCategory[]>();

        function collectAll(
            category: ApiCategory,
            parentBreadcrumb: string,
            depth: number
        ): FlatCategory[] {
            const breadcrumb = parentBreadcrumb
                ? `${parentBreadcrumb} › ${category.name}`
                : category.name;

            const result: FlatCategory[] = [
                {
                    id: category.id,
                    name: category.name,
                    parentId: category.parentId || null,
                    breadcrumb,
                    icon: category.icon,
                    depth,
                },
            ];

            // Recursively collect children
            if (category.children && category.children.length > 0) {
                category.children.forEach((child) => {
                    result.push(...collectAll(child, breadcrumb, depth + 1));
                });
            }

            return result;
        }

        categories.forEach((root) => {
            const items = collectAll(root, "", 0);
            groups.set(root.name, items);
        });

        return groups;
    }, [categories]);

    // Find selected category name
    const selectedCategory = useMemo(() => {
        if (!value) return null;
        return flatCategories.find((c) => c.id === value) || null;
    }, [value, flatCategories]);

    const handleSelect = (category: FlatCategory) => {
        if (category.id === value) {
            // Deselect if clicking the same item
            onChange(null, null);
        } else {
            onChange(category.id, category.name);
        }
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled || loading}
                    className={cn(
                        "h-9 w-full justify-between font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading...
                        </span>
                    ) : selectedCategory ? (
                        <span className="truncate">{selectedCategory.breadcrumb}</span>
                    ) : (
                        <span>{placeholder}</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[--radix-popover-trigger-width] min-w-56 rounded-xl p-0 border bg-sidebar border-sidebar-border shadow-lg"
                align="start"
                sideOffset={4}
            >
                <Command className="bg-transparent">
                    <CommandInput
                        placeholder="Search categories..."
                        className="border-sidebar-border"
                    />
                    <CommandList className="p-1.5 pt-0">
                        {error ? (
                            <CommandEmpty className="text-destructive py-4">{error}</CommandEmpty>
                        ) : loading ? (
                            <CommandEmpty className="py-4">
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            </CommandEmpty>
                        ) : categories.length === 0 ? (
                            <CommandEmpty className="py-4 text-muted-foreground">
                                No categories found.
                            </CommandEmpty>
                        ) : (
                            Array.from(groupedCategories).map(([groupName, items]) => (
                                <CommandGroup
                                    key={groupName}
                                    heading={groupName}
                                    className="p-0 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
                                >
                                    {items.map((category) => {
                                        const Icon = getIconComponent(category.icon);
                                        // Indent based on depth: 0=root, 1=sub, 2=3rd level
                                        const paddingLeft =
                                            category.depth === 0
                                                ? "pl-2"
                                                : category.depth === 1
                                                  ? "pl-6"
                                                  : "pl-10";
                                        return (
                                            <CommandItem
                                                key={category.id}
                                                value={category.breadcrumb}
                                                onSelect={() => handleSelect(category)}
                                                className={cn(
                                                    "flex items-center gap-2 cursor-pointer rounded-lg py-1.5 text-sm font-semibold text-muted-foreground",
                                                    "data-[selected=true]:bg-sidebar-accent data-[selected=true]:text-sidebar-foreground",
                                                    paddingLeft
                                                )}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                <span className="truncate flex-1">
                                                    {category.name}
                                                </span>
                                                {value === category.id && (
                                                    <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
                                                )}
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            ))
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

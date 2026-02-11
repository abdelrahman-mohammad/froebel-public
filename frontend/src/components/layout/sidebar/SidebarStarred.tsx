"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    FileQuestion,
    GraduationCap,
    MoreHorizontal,
    Pencil,
    SquarePen,
    StarOff,
} from "lucide-react";

import {
    AnimatedImageIcon,
    AnimatedLucideIcon,
    AnimatedMenuText,
} from "@/components/ui/animated-icon";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
} from "@/components/ui/sidebar";

import type { StarredItem } from "@/lib/sidebar";

interface SidebarStarredProps {
    items: StarredItem[];
    isLoading?: boolean;
    onUnstar?: (itemId: string, itemType: "quiz" | "course") => void;
    onRename?: (itemId: string, itemType: "quiz" | "course", newName: string) => void;
}

export function SidebarStarred({ items, isLoading, onUnstar, onRename }: SidebarStarredProps) {
    const router = useRouter();
    const [renamingItemId, setRenamingItemId] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when entering rename mode
    useEffect(() => {
        if (renamingItemId && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [renamingItemId]);

    const handleStartRename = (item: StarredItem) => {
        setRenamingItemId(item.id);
        setRenameValue(item.name);
    };

    const handleSaveRename = (item: StarredItem) => {
        if (renameValue.trim() && renameValue !== item.name) {
            onRename?.(item.id, item.type, renameValue.trim());
        }
        setRenamingItemId(null);
        setRenameValue("");
    };

    const handleCancelRename = () => {
        setRenamingItemId(null);
        setRenameValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, item: StarredItem) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveRename(item);
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancelRename();
        }
    };

    const handleEdit = (item: StarredItem) => {
        const editorPath =
            item.type === "course" ? `/course/${item.id}/edit` : `/quiz/${item.id}/edit`;
        router.push(editorPath);
    };

    const renderItemIcon = (item: StarredItem, isRenaming = false) => {
        // When renaming, use static icons without animation
        if (isRenaming) {
            if (item.type === "quiz" && item.iconUrl) {
                return (
                    <div className="size-4 shrink-0 overflow-hidden rounded-lg">
                        <img src={item.iconUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                );
            }
            if (item.type === "course") {
                return <GraduationCap className="size-4 shrink-0" />;
            }
            return <FileQuestion className="size-4 shrink-0" />;
        }

        // Animated icons for normal state
        if (item.type === "quiz" && item.iconUrl) {
            return <AnimatedImageIcon src={item.iconUrl} alt="" rounded="rounded-lg" />;
        }
        if (item.type === "course") {
            return <AnimatedLucideIcon icon={GraduationCap} />;
        }
        return <AnimatedLucideIcon icon={FileQuestion} />;
    };

    // Don't render if no items and not loading
    if (!isLoading && items.length === 0) {
        return null;
    }

    // Sort items: courses first, then quizzes
    const sortedItems = [...items].sort((a, b) => {
        if (a.type === "course" && b.type === "quiz") return -1;
        if (a.type === "quiz" && b.type === "course") return 1;
        return 0;
    });

    return (
        <SidebarGroup className="pt-0">
            <SidebarGroupLabel>Starred</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {isLoading ? (
                        <>
                            <SidebarMenuSkeleton showIcon />
                            <SidebarMenuSkeleton showIcon />
                            <SidebarMenuSkeleton showIcon />
                        </>
                    ) : (
                        sortedItems.map((item) => (
                            <SidebarMenuItem key={item.id}>
                                {renamingItemId === item.id ? (
                                    <div className="flex items-center gap-1.5 p-2 w-full">
                                        {renderItemIcon(item, true /* isRenaming */)}
                                        <Input
                                            ref={inputRef}
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onKeyDown={(e) => handleKeyDown(e, item)}
                                            onBlur={() => handleSaveRename(item)}
                                            className="h-6 text-sm py-0 px-1"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <SidebarMenuButton asChild tooltip={item.name}>
                                            <Link href={item.url} className="group/item">
                                                {renderItemIcon(item)}
                                                <AnimatedMenuText className="flex-1 text-muted-foreground group-hover/item:text-sidebar-foreground group-hover/menu-item:[mask-image:linear-gradient(to_left,transparent_0px,black_32px)]">
                                                    {item.name}
                                                </AnimatedMenuText>
                                            </Link>
                                        </SidebarMenuButton>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuAction
                                                    showOnHover
                                                    className="!top-1/2 -translate-y-1/2 !right-0 h-8 w-8"
                                                >
                                                    <MoreHorizontal className="size-4" />
                                                </SidebarMenuAction>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="right" align="start">
                                                <DropdownMenuItem
                                                    onClick={() => onUnstar?.(item.id, item.type)}
                                                >
                                                    <StarOff className="size-4" />
                                                    Unstar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    onClick={() => handleStartRename(item)}
                                                >
                                                    <Pencil className="size-4" />
                                                    Rename
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                                    <SquarePen className="size-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
                            </SidebarMenuItem>
                        ))
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ChevronDown,
    FileQuestion,
    GraduationCap,
    MoreHorizontal,
    Pencil,
    SquarePen,
    Star,
    Trash2,
} from "lucide-react";

import {
    AnimatedImageIcon,
    AnimatedLucideIcon,
    AnimatedMenuText,
} from "@/components/ui/animated-icon";
import { Button } from "@/components/ui/button";
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
    useSidebar,
} from "@/components/ui/sidebar";

import { DURATIONS, TRANSITIONS, getTransition } from "@/lib/animations/sidebar-animations";
import type { RecentItem } from "@/lib/sidebar";

const STORAGE_KEY = "sidebar_recent_collapsed";

interface SidebarRecentProps {
    items: RecentItem[];
    isLoading?: boolean;
    onStar?: (itemId: string, itemType: "quiz" | "course") => void;
    onRemove?: (itemId: string, itemType: "quiz" | "course") => void;
    onRename?: (itemId: string, itemType: "quiz" | "course", newName: string) => void;
}

export function SidebarRecent({
    items,
    isLoading,
    onStar,
    onRemove,
    onRename,
}: SidebarRecentProps) {
    const router = useRouter();
    const { state: sidebarState } = useSidebar();
    const shouldReduceMotion = useReducedMotion();
    const isSidebarCollapsed = sidebarState === "collapsed";
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(STORAGE_KEY) === "true";
        }
        return false;
    });
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

    const toggleCollapsed = () => {
        const newValue = !isCollapsed;
        setIsCollapsed(newValue);
        localStorage.setItem(STORAGE_KEY, String(newValue));
    };

    const handleStartRename = (item: RecentItem) => {
        setRenamingItemId(item.id);
        setRenameValue(item.name);
    };

    const handleSaveRename = (item: RecentItem) => {
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

    const handleKeyDown = (e: React.KeyboardEvent, item: RecentItem) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveRename(item);
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancelRename();
        }
    };

    const handleEdit = (item: RecentItem) => {
        const editorPath =
            item.type === "course" ? `/course/${item.id}/edit` : `/quiz/${item.id}/edit`;
        router.push(editorPath);
    };

    const renderItemIcon = (item: RecentItem, isRenaming = false) => {
        // When renaming, use static icons without animation
        if (isRenaming) {
            if (item.type === "quiz" && item.iconUrl) {
                return (
                    <div className="size-4 shrink-0 overflow-hidden rounded-sm">
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
            return <AnimatedImageIcon src={item.iconUrl} alt="" rounded="rounded-sm" />;
        }
        if (item.type === "course") {
            return <AnimatedLucideIcon icon={GraduationCap} />;
        }
        return <AnimatedLucideIcon icon={FileQuestion} />;
    };

    // Hide entire section when sidebar is collapsed to icon mode
    if (isSidebarCollapsed) {
        return null;
    }

    return (
        <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
                <SidebarGroupLabel>Recent</SidebarGroupLabel>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={toggleCollapsed}
                    className="h-5 w-5"
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 0 : 180 }}
                        transition={getTransition(
                            TRANSITIONS.iconScale,
                            shouldReduceMotion ?? false
                        )}
                    >
                        <ChevronDown className="size-3" />
                    </motion.div>
                </Button>
            </div>
            <AnimatePresence initial={false}>
                {!isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                            height: getTransition(
                                TRANSITIONS.sectionCollapse,
                                shouldReduceMotion ?? false
                            ),
                            opacity: {
                                duration: shouldReduceMotion ? 0 : DURATIONS.fast,
                            },
                        }}
                        className="overflow-hidden"
                    >
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {isLoading ? (
                                    <>
                                        <SidebarMenuSkeleton />
                                        <SidebarMenuSkeleton />
                                        <SidebarMenuSkeleton />
                                    </>
                                ) : items.length === 0 ? (
                                    <p className="px-2 py-1 text-xs text-muted-foreground">
                                        No recent quizzes
                                    </p>
                                ) : (
                                    items.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            {renamingItemId === item.id ? (
                                                <div className="flex items-center gap-1.5 p-2 w-full">
                                                    {renderItemIcon(item, true /* isRenaming */)}
                                                    <Input
                                                        ref={inputRef}
                                                        value={renameValue}
                                                        onChange={(e) =>
                                                            setRenameValue(e.target.value)
                                                        }
                                                        onKeyDown={(e) => handleKeyDown(e, item)}
                                                        onBlur={() => handleSaveRename(item)}
                                                        className="h-6 text-sm py-0 px-1"
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <SidebarMenuButton asChild tooltip={item.name}>
                                                        <Link
                                                            href={item.url}
                                                            className="group/item"
                                                        >
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
                                                        <DropdownMenuContent
                                                            side="right"
                                                            align="start"
                                                        >
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onStar?.(item.id, item.type)
                                                                }
                                                            >
                                                                <Star className="size-4" />
                                                                Star
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    onRemove?.(item.id, item.type)
                                                                }
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Remove
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleStartRename(item)
                                                                }
                                                            >
                                                                <Pencil className="size-4" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleEdit(item)}
                                                            >
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
                    </motion.div>
                )}
            </AnimatePresence>
        </SidebarGroup>
    );
}

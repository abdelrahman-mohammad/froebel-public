"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    ChevronDown,
    ChevronUp,
    GraduationCap,
    MoreHorizontal,
    Pencil,
    SquarePen,
} from "lucide-react";

import { AnimatedLucideIcon, AnimatedMenuText } from "@/components/ui/animated-icon";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import type { CourseItem } from "@/lib/sidebar";

// Removed cn import - no longer needed after replacing grid-based collapse

const STORAGE_KEY = "sidebar_courses_collapsed";

interface SidebarCoursesProps {
    items: CourseItem[];
    isLoading?: boolean;
    onRename?: (itemId: string, newName: string) => void;
}

export function SidebarCourses({ items, isLoading, onRename }: SidebarCoursesProps) {
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

    const handleStartRename = (item: CourseItem) => {
        setRenamingItemId(item.id);
        setRenameValue(item.name);
    };

    const handleSaveRename = (item: CourseItem) => {
        if (renameValue.trim() && renameValue !== item.name) {
            onRename?.(item.id, renameValue.trim());
        }
        setRenamingItemId(null);
        setRenameValue("");
    };

    const handleCancelRename = () => {
        setRenamingItemId(null);
        setRenameValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent, item: CourseItem) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSaveRename(item);
        } else if (e.key === "Escape") {
            e.preventDefault();
            handleCancelRename();
        }
    };

    const handleEdit = (item: CourseItem) => {
        router.push(`/course/${item.id}/edit`);
    };

    // Don't render if no items and not loading
    if (!isLoading && items.length === 0) {
        return null;
    }

    // Sort items: owned first, then enrolled
    const sortedItems = [...items].sort((a, b) => {
        if (a.role === "owner" && b.role === "enrolled") return -1;
        if (a.role === "enrolled" && b.role === "owner") return 1;
        return 0;
    });

    // Hide entire section when sidebar is collapsed to icon mode
    if (isSidebarCollapsed) {
        return null;
    }

    return (
        <SidebarGroup>
            <div className="flex items-center justify-between pr-2">
                <SidebarGroupLabel>Courses</SidebarGroupLabel>
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
                                ) : (
                                    sortedItems.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            {renamingItemId === item.id ? (
                                                <div className="flex items-center gap-1.5 p-2 w-full">
                                                    <GraduationCap className="size-4 shrink-0" />
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
                                                            <AnimatedLucideIcon
                                                                icon={GraduationCap}
                                                            />
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

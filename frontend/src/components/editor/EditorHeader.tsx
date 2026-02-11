"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// Editor component with controlled input focus patterns
import React, { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeft, Check, Loader2, Pencil, Save, X } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { useEditor } from "@/contexts/EditorContext";

interface EditorHeaderProps {
    onSave: () => Promise<void>;
    isSaving: boolean;
    isNew?: boolean;
}

export function EditorHeader({ onSave, isSaving, isNew = true }: EditorHeaderProps) {
    const router = useRouter();
    const { state, updateTitle } = useEditor();
    const { quiz, isDirty } = state;

    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitleValue, setEditingTitleValue] = useState(quiz.title);
    const titleInputRef = useRef<HTMLInputElement>(null);

    // Warn before browser close/refresh when there are unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                // Chrome requires returnValue to be set
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    // Sync editing title with quiz title when it changes externally
    useEffect(() => {
        if (!isEditingTitle) {
            setEditingTitleValue(quiz.title);
        }
    }, [quiz.title, isEditingTitle]);

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    // Navigate with unsaved changes check
    const navigateTo = useCallback(
        (path: string) => {
            if (isDirty) {
                setPendingNavigation(path);
                setShowUnsavedDialog(true);
            } else {
                router.push(path);
            }
        },
        [isDirty, router]
    );

    const handleBack = useCallback(() => {
        navigateTo(isNew ? "/" : "/library");
    }, [navigateTo, isNew]);

    const handleLogoClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            navigateTo("/");
        },
        [navigateTo]
    );

    const handleDiscardAndLeave = useCallback(() => {
        setShowUnsavedDialog(false);
        if (pendingNavigation) {
            router.push(pendingNavigation);
            setPendingNavigation(null);
        }
    }, [router, pendingNavigation]);

    const handleStartEditTitle = useCallback(() => {
        setEditingTitleValue(quiz.title);
        setIsEditingTitle(true);
    }, [quiz.title]);

    const handleSaveTitle = useCallback(() => {
        const trimmedTitle = editingTitleValue.trim();
        if (trimmedTitle && trimmedTitle !== quiz.title) {
            updateTitle(trimmedTitle);
        }
        setIsEditingTitle(false);
    }, [editingTitleValue, quiz.title, updateTitle]);

    const handleCancelEditTitle = useCallback(() => {
        setEditingTitleValue(quiz.title);
        setIsEditingTitle(false);
    }, [quiz.title]);

    const handleTitleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter") {
                handleSaveTitle();
            } else if (e.key === "Escape") {
                handleCancelEditTitle();
            }
        },
        [handleSaveTitle, handleCancelEditTitle]
    );

    return (
        <header className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
            {/* Left: Logo, sidebar trigger, and back button */}
            <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Link
                    href="/"
                    onClick={handleLogoClick}
                    className="font-bold text-xl text-primary hover:opacity-80 transition-opacity hidden sm:block cursor-pointer"
                >
                    Froebel
                </Link>
                <div className="h-4 w-px bg-border hidden sm:block" />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className="gap-1"
                    disabled={isSaving}
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                </Button>
            </div>

            {/* Center: Editable Title */}
            <div className="flex items-center gap-2 flex-1 justify-center max-w-md mx-4">
                {isEditingTitle ? (
                    <div className="flex items-center gap-1 w-full">
                        <Input
                            ref={titleInputRef}
                            value={editingTitleValue}
                            onChange={(e) => setEditingTitleValue(e.target.value)}
                            onKeyDown={handleTitleKeyDown}
                            onBlur={handleSaveTitle}
                            className="text-center font-semibold h-8"
                            placeholder="Quiz title..."
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleSaveTitle}
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleCancelEditTitle}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <button
                        onClick={handleStartEditTitle}
                        className="flex items-center gap-2 text-lg font-semibold hover:bg-muted px-3 py-1 rounded-md transition-colors group"
                    >
                        <span className="truncate">
                            {quiz.title || (
                                <span className="text-muted-foreground italic">Untitled Quiz</span>
                            )}
                        </span>
                        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                        {isDirty && (
                            <span
                                className="h-2 w-2 rounded-full bg-warning shrink-0"
                                title="Unsaved changes"
                            />
                        )}
                    </button>
                )}
            </div>

            {/* Right: Save button */}
            <div className="flex items-center gap-2">
                <Button onClick={onSave} className="gap-2" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Saving...</span>
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            <span className="hidden sm:inline">Save</span>
                        </>
                    )}
                </Button>
            </div>

            {/* Unsaved changes dialog */}
            <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes
                            will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowUnsavedDialog(false)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDiscardAndLeave}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Discard Changes
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </header>
    );
}

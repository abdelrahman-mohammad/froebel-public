"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

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

import { useEditor, validateQuiz } from "@/contexts/EditorContext";

import { useNavigationGuard } from "@/hooks/useNavigationGuard";
import { useQuizEditor } from "@/hooks/useQuizEditor";

import { getQuizById, QuizApiError } from "@/lib/quiz/api";
import { apiQuizToLocal } from "@/lib/quiz/converters";

import { ConflictDialog } from "./ConflictDialog";
import { EditorWorkspace } from "./EditorWorkspace";

import type { QuizDetailDTO } from "@/lib/quiz/types";

interface QuizEditorProps {
    quizId: string;
    quizMeta: QuizDetailDTO | null;
}

export function QuizEditor({ quizId, quizMeta }: QuizEditorProps) {
    const router = useRouter();
    const { state, markSaved, setStatus, setQuiz, updateVersion, setShowValidationErrors } = useEditor();
    const { quiz, isDirty } = state;

    // API editor hook for quiz operations
    // Note: quizMeta from hook is used to update hasUnpublishedChanges after API calls
    const {
        updateQuizMeta,
        publishQuiz,
        updatePublished,
        quizMeta: hookQuizMeta,
        isSaving: isApiSaving,
        error: apiError,
        clearError,
    } = useQuizEditor();

    // Navigation guard for unsaved changes
    const { showDialog, confirmNavigation, cancelNavigation } = useNavigationGuard(isDirty);

    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showConflict, setShowConflict] = useState(false);
    const [isResolvingConflict, setIsResolvingConflict] = useState(false);
    const [conflictVersions, setConflictVersions] = useState<{
        server?: number;
        local?: number;
    }>({});
    // Track hasUnpublishedChanges and version together for atomic updates
    const [publishState, setPublishState] = useState({
        hasUnpublishedChanges: quizMeta?.hasUnpublishedChanges ?? false,
        lastAppliedVersion: quizMeta?.version ?? 0,
    });

    // Ref to always access current quiz state (avoids stale closures)
    const quizRef = useRef(quiz);
    useEffect(() => {
        quizRef.current = quiz;
    }, [quiz]);

    // Rate limiting: track last save time to prevent rapid consecutive saves
    const lastSaveTimeRef = useRef<number>(0);
    const SAVE_DEBOUNCE_MS = 1000; // Minimum 1 second between saves

    // Track in-flight save to prevent concurrent save operations
    const isSavingRef = useRef(false);
    const pendingSaveRef = useRef<{ versionOverride?: number; bypassRateLimit: boolean } | null>(
        null
    );

    // Sync hasUnpublishedChanges when hook's quizMeta updates (after API calls)
    // Uses atomic state update to prevent race conditions with out-of-order responses
    useEffect(() => {
        if (hookQuizMeta && hookQuizMeta.version !== undefined) {
            const newVersion = hookQuizMeta.version;
            // Use functional update to atomically check and update both values
            setPublishState((prev) => {
                // Only apply update if version is newer than what we've already applied
                if (newVersion >= prev.lastAppliedVersion) {
                    return {
                        hasUnpublishedChanges: hookQuizMeta.hasUnpublishedChanges ?? false,
                        lastAppliedVersion: newVersion,
                    };
                }
                return prev; // Keep previous state if version is stale
            });
        }
    }, [hookQuizMeta]);

    // Extract for easier access
    const hasUnpublishedChanges = publishState.hasUnpublishedChanges;

    /**
     * Build the update request object from current quiz state.
     * Extracted to eliminate code duplication across save/publish/update handlers.
     */
    const buildUpdateRequest = useCallback((versionOverride?: number) => {
        const currentQuiz = quizRef.current;
        return {
            title: currentQuiz.title || "Untitled Quiz",
            description: currentQuiz.description || undefined,
            iconUrl: currentQuiz.iconUrl || undefined,
            bannerUrl: currentQuiz.bannerUrl || undefined,
            courseId: currentQuiz.courseId || undefined,
            timeLimit: currentQuiz.timeLimit || undefined,
            shuffleQuestions: currentQuiz.settings?.shuffleQuestions,
            shuffleChoices: currentQuiz.settings?.shuffleChoices,
            showCorrectAnswers: currentQuiz.settings?.showCorrectAnswers,
            isPublic: currentQuiz.settings?.isPublic,
            passingScore: currentQuiz.settings?.passingScore ?? 50,
            tagNames: currentQuiz.tags,
            categoryId: currentQuiz.categoryId || undefined,
            // Access control
            allowAnonymous: currentQuiz.settings?.allowAnonymous,
            maxAttempts: currentQuiz.settings?.maxAttempts,
            // Access restriction settings
            requireAccessCode: currentQuiz.settings?.requireAccessCode,
            accessCode: currentQuiz.settings?.accessCode,
            filterIpAddresses: currentQuiz.settings?.filterIpAddresses,
            allowedIpAddresses: currentQuiz.settings?.allowedIpAddresses,
            // Scheduling settings
            availableFrom: currentQuiz.settings?.availableFrom,
            availableUntil: currentQuiz.settings?.availableTo,
            resultsVisibleFrom: currentQuiz.settings?.resultsVisibleFrom,
            // Optimistic locking version - use override if provided
            version: versionOverride ?? currentQuiz.version,
        };
    }, []);

    // Check if error is a version conflict (HTTP 409)
    const isConflictError = (error: unknown): boolean => {
        return error instanceof QuizApiError && error.status === 409;
    };

    // Internal save function that accepts an optional version override
    // Uses buildUpdateRequest helper and quizRef to avoid stale closures
    // Includes rate limiting and queuing to prevent concurrent API calls
    const performSave = useCallback(
        async (versionOverride?: number, bypassRateLimit = false) => {
            // Atomically claim the save slot first (sync JS is single-threaded)
            // This prevents race conditions where two rapid calls both pass checks
            if (isSavingRef.current) {
                pendingSaveRef.current = { versionOverride, bypassRateLimit };
                return;
            }
            isSavingRef.current = true;

            // Now check rate limit (can revert if needed since we claimed the slot)
            const now = Date.now();
            if (!bypassRateLimit && now - lastSaveTimeRef.current < SAVE_DEBOUNCE_MS) {
                isSavingRef.current = false; // Release the slot
                toast.info("Please wait before saving again");
                return;
            }

            lastSaveTimeRef.current = now;
            setIsSaving(true);
            // Clear both error sources to prevent stale error display
            setErrors([]);
            clearError();

            // Lightweight draft validation - show warnings but don't block
            const currentQuiz = quizRef.current;
            const draftWarnings = validateQuiz(currentQuiz, "draft");
            if (draftWarnings.length > 0) {
                // Show warnings but continue with save
                draftWarnings.forEach((w) => toast.warning(w.message));
            }

            try {
                // Save quiz metadata as draft
                const updatedQuiz = await updateQuizMeta(
                    buildUpdateRequest(versionOverride),
                    quizId
                );
                // Update the version in EditorContext to prevent false conflicts
                if (updatedQuiz.version !== undefined) {
                    // Update ref immediately to prevent race condition with useEffect
                    // (useEffect runs async after render, but queued save could run before)
                    quizRef.current = { ...quizRef.current, version: updatedQuiz.version };
                    updateVersion(updatedQuiz.version);
                }
                markSaved();
                toast.success("Draft saved");
            } catch (error) {
                console.error("Failed to save quiz:", error);
                if (isConflictError(error)) {
                    // Capture local version for conflict dialog
                    setConflictVersions({ local: quizRef.current.version });
                    setShowConflict(true);
                } else {
                    const errorMsg =
                        error instanceof Error ? error.message : "Failed to save quiz. Please try again.";
                    setErrors([errorMsg]);
                    toast.error(errorMsg);
                }
            } finally {
                isSavingRef.current = false;
                setIsSaving(false);

                // Process any queued save request
                if (pendingSaveRef.current) {
                    const pending = pendingSaveRef.current;
                    pendingSaveRef.current = null;
                    // Use latest state (quizRef.current) for the queued save
                    performSave(pending.versionOverride, pending.bypassRateLimit);
                }
            }
        },
        [buildUpdateRequest, clearError, markSaved, quizId, updateQuizMeta, updateVersion]
    );

    // Public save handler - wraps performSave without version override
    const handleSave = useCallback(() => performSave(), [performSave]);

    // Publish quiz - full validation required
    const handlePublish = useCallback(async () => {
        const currentQuiz = quizRef.current;
        // Full validation for publishing
        const validationErrors = validateQuiz(currentQuiz, "publish");
        if (validationErrors.length > 0) {
            setErrors(validationErrors.map((e) => e.message));
            setShowValidationErrors(true);
            toast.error("Please fix validation errors before publishing");
            return;
        }

        setIsSaving(true);
        // Clear both error sources to prevent stale error display
        setErrors([]);
        clearError();

        try {
            // Save first to ensure latest changes are persisted
            const updatedQuiz = await updateQuizMeta(buildUpdateRequest(), quizId);
            // Update version in case publish fails
            if (updatedQuiz.version !== undefined) {
                quizRef.current = { ...quizRef.current, version: updatedQuiz.version };
                updateVersion(updatedQuiz.version);
            }

            // Then publish
            const publishedQuiz = await publishQuiz(true, quizId);
            // Update version from the published response to prevent conflicts
            if (publishedQuiz.version !== undefined) {
                quizRef.current = { ...quizRef.current, version: publishedQuiz.version };
                updateVersion(publishedQuiz.version);
            }
            setStatus("published");
            markSaved();
            toast.success("Quiz published successfully!");
            router.push("/library");
        } catch (error) {
            console.error("Failed to publish quiz:", error);
            if (isConflictError(error)) {
                setConflictVersions({ local: quizRef.current.version });
                setShowConflict(true);
            } else {
                const errorMsg =
                    error instanceof Error
                        ? error.message
                        : "Failed to publish quiz. Please try again.";
                setErrors([errorMsg]);
                toast.error(errorMsg);
            }
        } finally {
            setIsSaving(false);
        }
    }, [buildUpdateRequest, clearError, markSaved, publishQuiz, quizId, router, setShowValidationErrors, setStatus, updateQuizMeta, updateVersion]);

    // Update published version - push draft changes to live
    const handleUpdatePublished = useCallback(async () => {
        const currentQuiz = quizRef.current;
        // Full validation required for updating published version
        const validationErrors = validateQuiz(currentQuiz, "publish");
        if (validationErrors.length > 0) {
            setErrors(validationErrors.map((e) => e.message));
            setShowValidationErrors(true);
            toast.error("Please fix validation errors before updating");
            return;
        }

        setIsSaving(true);
        // Clear both error sources to prevent stale error display
        setErrors([]);
        clearError();

        try {
            // Save first to ensure latest changes are persisted
            const updatedQuiz = await updateQuizMeta(buildUpdateRequest(), quizId);
            // Update version
            if (updatedQuiz.version !== undefined) {
                quizRef.current = { ...quizRef.current, version: updatedQuiz.version };
                updateVersion(updatedQuiz.version);
            }

            // Then update the published version
            const publishedQuiz = await updatePublished(quizId);
            // Update version from the published response to prevent conflicts
            if (publishedQuiz.version !== undefined) {
                quizRef.current = { ...quizRef.current, version: publishedQuiz.version };
                updateVersion(publishedQuiz.version);
            }
            markSaved();
            toast.success("Published version updated!");
        } catch (error) {
            console.error("Failed to update published version:", error);
            if (isConflictError(error)) {
                setConflictVersions({ local: quizRef.current.version });
                setShowConflict(true);
            } else {
                const errorMsg =
                    error instanceof Error
                        ? error.message
                        : "Failed to update published version. Please try again.";
                setErrors([errorMsg]);
                toast.error(errorMsg);
            }
        } finally {
            setIsSaving(false);
        }
    }, [buildUpdateRequest, clearError, markSaved, quizId, setShowValidationErrors, updatePublished, updateQuizMeta, updateVersion]);

    // Handle conflict resolution - reload from server
    const handleConflictReload = useCallback(async () => {
        if (!quizId) return;
        setIsResolvingConflict(true);
        try {
            const response = await getQuizById(quizId);
            const freshQuiz = apiQuizToLocal(response);
            // Update ref immediately for consistency
            quizRef.current = freshQuiz;
            setQuiz(freshQuiz);
            markSaved();
            setShowConflict(false);
            setConflictVersions({});
            toast.info("Quiz reloaded from server");
        } catch (error) {
            console.error("Failed to reload quiz:", error);
            toast.error("Failed to reload quiz from server");
        } finally {
            setIsResolvingConflict(false);
        }
    }, [quizId, setQuiz, markSaved]);

    // Handle conflict resolution - keep my changes (update version and retry)
    const handleConflictKeepMine = useCallback(async () => {
        if (!quizId) return;
        setIsResolvingConflict(true);
        try {
            // Fetch the latest version number from server
            const response = await getQuizById(quizId);
            const serverVersion = response.version ?? 0;
            // Update displayed server version in conflict dialog
            setConflictVersions((prev) => ({ ...prev, server: serverVersion }));
            // Update local state and ref for consistency
            quizRef.current = { ...quizRef.current, version: serverVersion };
            updateVersion(serverVersion);
            // Retry save with the new version passed directly, bypass rate limit for conflict retry
            await performSave(serverVersion, true);
            setShowConflict(false);
            setConflictVersions({});
        } catch (error) {
            console.error("Failed to update version:", error);
            // If we get another conflict, the dialog will reappear via performSave
            if (!isConflictError(error)) {
                toast.error("Failed to save. Please try again.");
            }
        } finally {
            setIsResolvingConflict(false);
        }
    }, [quizId, updateVersion, performSave]);

    const saving = isSaving || isApiSaving;
    const errorMessage = errors.length > 0 ? errors.join(". ") : apiError;

    return (
        <>
            <EditorWorkspace
                quizId={quizId}
                onSave={handleSave}
                onPublish={handlePublish}
                onUpdatePublished={handleUpdatePublished}
                isSaving={saving}
                status={quiz.status}
                hasUnpublishedChanges={hasUnpublishedChanges}
                error={errorMessage}
            />

            {/* Unsaved Changes Confirmation Dialog */}
            <AlertDialog open={showDialog} onOpenChange={cancelNavigation}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave this page? Your
                            changes will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelNavigation}>Stay</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmNavigation} variant="warning">
                            Leave
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Conflict Resolution Dialog */}
            <ConflictDialog
                open={showConflict}
                onReload={handleConflictReload}
                onKeepMine={handleConflictKeepMine}
                isLoading={isResolvingConflict}
                serverVersion={conflictVersions.server}
                localVersion={conflictVersions.local}
            />
        </>
    );
}

export default QuizEditor;

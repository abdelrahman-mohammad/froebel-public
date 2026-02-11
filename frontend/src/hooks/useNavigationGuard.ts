"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

export interface UseNavigationGuardReturn {
    /** Wrapped navigate function that checks for unsaved changes before navigating */
    navigate: (path: string) => void;
    /** Whether the confirmation dialog should be shown */
    showDialog: boolean;
    /** Confirm navigation (proceed despite unsaved changes) */
    confirmNavigation: () => void;
    /** Cancel navigation (stay on current page) */
    cancelNavigation: () => void;
    /** The path that was attempted before showing the dialog */
    pendingPath: string | null;
}

/**
 * Hook to guard against accidental navigation when there are unsaved changes.
 *
 * Features:
 * - Shows browser's native "beforeunload" dialog on tab close/refresh
 * - Intercepts browser back/forward button navigation
 * - Provides a confirmation dialog for in-app navigation
 *
 * Usage:
 * ```tsx
 * const { navigate, showDialog, confirmNavigation, cancelNavigation } = useNavigationGuard(isDirty);
 *
 * // Use navigate() instead of router.push() for links you want to guard
 * <Button onClick={() => navigate("/home")}>Go Home</Button>
 *
 * // Render the confirmation dialog
 * <AlertDialog open={showDialog} onOpenChange={cancelNavigation}>
 *   ...
 * </AlertDialog>
 * ```
 */
export function useNavigationGuard(isDirty: boolean): UseNavigationGuardReturn {
    const router = useRouter();
    const [showDialog, setShowDialog] = useState(false);
    const [pendingPath, setPendingPath] = useState<string | null>(null);
    const isNavigatingRef = useRef(false);
    const hasGuardStateRef = useRef(false);

    // Browser close/refresh - shows native browser dialog
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                // Modern browsers require returnValue to be set
                e.returnValue = "";
                return "";
            }
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // Browser back/forward buttons - intercept and show dialog
    useEffect(() => {
        if (!isDirty) {
            // Clean up guard state when no longer dirty
            if (hasGuardStateRef.current) {
                hasGuardStateRef.current = false;
            }
            return;
        }

        // Push a dummy state to detect back navigation (only once)
        const currentUrl = window.location.href;
        if (!hasGuardStateRef.current) {
            window.history.pushState({ navigationGuard: true }, "", currentUrl);
            hasGuardStateRef.current = true;
        }

        const handlePopState = () => {
            if (isNavigatingRef.current) {
                // We're intentionally navigating, don't block
                return;
            }

            if (isDirty) {
                // Block the navigation by pushing state back
                window.history.pushState({ navigationGuard: true }, "", currentUrl);
                // Note: Browser's popstate event doesn't provide the target URL.
                // This is a fundamental browser limitation - we can only know
                // the user tried to navigate away via back/forward, not where.
                // The confirmation dialog should display a generic message like
                // "Are you sure you want to leave?" instead of showing a destination.
                setPendingPath("__browser_back__");
                setShowDialog(true);
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [isDirty]);

    // Wrapped navigate function that checks for unsaved changes
    const navigate = useCallback(
        (path: string) => {
            if (isDirty) {
                // Store the pending path and show confirmation dialog
                setPendingPath(path);
                setShowDialog(true);
            } else {
                // No unsaved changes, navigate immediately
                router.push(path);
            }
        },
        [isDirty, router]
    );

    // Confirm navigation - proceed to the pending path
    const confirmNavigation = useCallback(() => {
        setShowDialog(false);
        isNavigatingRef.current = true;
        if (pendingPath === "__browser_back__") {
            // For browser back/forward, go back in history
            // We pushed a guard state, so go back twice to get to the actual previous page
            window.history.go(-2);
        } else if (pendingPath) {
            router.push(pendingPath);
        }
        setPendingPath(null);
        // Reset the flag after a short delay
        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 100);
    }, [router, pendingPath]);

    // Cancel navigation - stay on current page
    const cancelNavigation = useCallback(() => {
        setShowDialog(false);
        setPendingPath(null);
    }, []);

    return {
        navigate,
        showDialog,
        confirmNavigation,
        cancelNavigation,
        pendingPath,
    };
}

export default useNavigationGuard;

"use client";

import { useState } from "react";

import { AlertCircle, AlertTriangle, CheckCircle2, Info, Loader2, Trash2 } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { ShowcaseItem } from "../ShowcaseItem";

export function AlertDialogShowcase() {
    const [loadingOpen, setLoadingOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLoadingAction = async () => {
        setIsLoading(true);
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIsLoading(false);
        setLoadingOpen(false);
    };

    return (
        <ShowcaseItem
            title="Alert Dialog"
            description="Modal dialog for confirmations and critical actions"
        >
            <div className="space-y-8">
                {/* Default */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">Default</h4>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">Show Dialog</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Semantic Variants */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Semantic Variants
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {/* Informational */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <Info className="size-4" />
                                    Info
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                            <Info className="size-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <AlertDialogTitle>New Feature Available</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="pl-[52px]">
                                        We&apos;ve added a new export feature. You can now download
                                        your data in multiple formats including CSV, JSON, and PDF.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Maybe Later</AlertDialogCancel>
                                    <AlertDialogAction>Learn More</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Warning */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <AlertTriangle className="size-4" />
                                    Warning
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                                            <AlertTriangle className="size-5 text-yellow-600 dark:text-yellow-400" />
                                        </div>
                                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="pl-[52px]">
                                        You have unsaved changes that will be lost if you leave this
                                        page. Do you want to save your changes before continuing?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction variant="warning">
                                        Discard Changes
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Error/Danger */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">
                                    <Trash2 className="size-4" />
                                    Danger
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                                            <AlertCircle className="size-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="pl-[52px]">
                                        This action is permanent and cannot be undone. All your
                                        data, including projects, files, and settings will be
                                        permanently deleted.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction variant="destructive">
                                        Delete Account
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        {/* Success */}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline">
                                    <CheckCircle2 className="size-4" />
                                    Success
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                                            <CheckCircle2 className="size-5 text-green-600 dark:text-green-400" />
                                        </div>
                                        <AlertDialogTitle>Payment Successful</AlertDialogTitle>
                                    </div>
                                    <AlertDialogDescription className="pl-[52px]">
                                        Your payment of $49.99 has been processed successfully.
                                        You&apos;ll receive a confirmation email shortly.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogAction variant="success">
                                        View Receipt
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>

                {/* Loading State */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Loading State
                    </h4>
                    <AlertDialog open={loadingOpen} onOpenChange={setLoadingOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline">
                                <Loader2 className="size-4" />
                                With Async Action
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete the selected items. This action may
                                    take a few seconds to complete.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleLoadingAction();
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>

                {/* Controlled State */}
                <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                        Controlled (Programmatic)
                    </h4>
                    <ControlledAlertDialogExample />
                </div>

                {/* Accessibility Notes */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h4 className="text-sm font-medium mb-2">Accessibility Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>
                            • <strong>Focus trapped:</strong> Tab cycles within dialog only
                        </li>
                        <li>
                            • <strong>Escapable:</strong> Press Esc to dismiss
                        </li>
                        <li>
                            • <strong>Modal:</strong> Background is inert (aria-modal=true)
                        </li>
                        <li>
                            • <strong>Auto-focus:</strong> Focus moves to Cancel (least destructive)
                        </li>
                    </ul>
                </div>
            </div>
        </ShowcaseItem>
    );
}

function ControlledAlertDialogExample() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex gap-3">
            <Button variant="outline" onClick={() => setOpen(true)}>
                Open Programmatically
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Controlled Dialog</AlertDialogTitle>
                        <AlertDialogDescription>
                            This dialog was opened programmatically using state. You can close it
                            with Cancel, Continue, Esc key, or by clicking outside.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

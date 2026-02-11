"use client";

import { AlertTriangleIcon, Loader2Icon, RefreshCwIcon, SaveIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ConflictDialogProps {
    open: boolean;
    onReload: () => void;
    onKeepMine: () => void;
    isLoading?: boolean;
    serverVersion?: number;
    localVersion?: number;
}

export function ConflictDialog({
    open,
    onReload,
    onKeepMine,
    isLoading = false,
    serverVersion,
    localVersion,
}: ConflictDialogProps) {
    return (
        // Prevent closing via X or escape - user must make an explicit choice
        <Dialog open={open}>
            <DialogContent
                showCloseButton={false}
                onInteractOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
                aria-describedby="conflict-dialog-description"
                className="max-h-[85vh] overflow-y-auto"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangleIcon className="h-5 w-5 text-warning" />
                        Quiz Modified
                    </DialogTitle>
                    <DialogDescription id="conflict-dialog-description">
                        This quiz was modified by another user or in another tab. Your changes
                        conflict with the latest version on the server.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Version info if available */}
                    {(serverVersion !== undefined || localVersion !== undefined) && (
                        <div className="rounded-md bg-muted p-3 text-sm">
                            <p className="font-medium">Version Information</p>
                            <div className="mt-1 flex gap-4 text-muted-foreground">
                                {serverVersion !== undefined && (
                                    <span>Server: v{serverVersion}</span>
                                )}
                                {localVersion !== undefined && (
                                    <span>Your version: v{localVersion}</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Warning about data loss */}
                    <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                        <strong>Warning:</strong> Either choice will result in some changes being lost.
                        There is no way to merge changes automatically.
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Choose how to resolve this conflict:
                    </p>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start p-4 text-left"
                            onClick={onReload}
                            disabled={isLoading}
                            aria-label="Reload quiz from server, discarding your local changes"
                        >
                            <div className="flex w-full flex-col items-start">
                                <div className="flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2Icon className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="font-medium">Reload from Server</span>
                                </div>
                                <p className="mt-1 text-sm font-normal text-muted-foreground">
                                    Discard your local changes and load the latest version from the
                                    server.
                                </p>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="h-auto w-full justify-start p-4 text-left"
                            onClick={onKeepMine}
                            disabled={isLoading}
                            aria-label="Keep your local changes and overwrite the server version"
                        >
                            <div className="flex w-full flex-col items-start">
                                <div className="flex items-center gap-2">
                                    {isLoading ? (
                                        <Loader2Icon className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <SaveIcon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="font-medium">Keep My Changes</span>
                                </div>
                                <p className="mt-1 text-sm font-normal text-muted-foreground">
                                    Overwrite the server version with your local changes. The other
                                    user&apos;s changes will be lost.
                                </p>
                            </div>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

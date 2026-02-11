"use client";

import React from "react";

import { Brain, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mode option button styles
const modeOptionBase =
    "flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border bg-card text-card-foreground transition-all cursor-pointer hover:border-primary hover:bg-primary-light";

// Mode icon styles
const modeIconBase = "flex items-center justify-center w-16 h-16 rounded-full text-primary bg-primary/10";
const modeIconMemorize = "flex items-center justify-center w-16 h-16 rounded-full text-warning bg-warning/10";

export interface ModeSelectionModalProps {
    /** Whether the modal is open */
    open: boolean;
    /** Callback when modal is closed */
    onOpenChange: (open: boolean) => void;
    /** Callback when Test mode is selected */
    onSelectTest: () => void;
    /** Callback when Memorize mode is selected */
    onSelectMemorize: () => void;
}

/**
 * Modal for selecting between Test and Memorize modes
 */
export function ModeSelectionModal({
    open,
    onOpenChange,
    onSelectTest,
    onSelectMemorize,
}: ModeSelectionModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center">Choose Your Mode</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4 my-6">
                    <button className={modeOptionBase} onClick={onSelectTest}>
                        <div className={modeIconBase}>
                            <FileText className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold">Test Mode</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Take the quiz with scoring. Answer questions and see your results at the
                            end.
                        </p>
                    </button>

                    <button className={modeOptionBase} onClick={onSelectMemorize}>
                        <div className={modeIconMemorize}>
                            <Brain className="h-10 w-10" />
                        </div>
                        <h3 className="text-lg font-semibold">Memorize Mode</h3>
                        <p className="text-sm text-muted-foreground text-center">
                            Learn in batches with flashcards. See answers first, then test your
                            knowledge.
                        </p>
                    </button>
                </div>

                <div className="flex justify-center pt-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ModeSelectionModal;

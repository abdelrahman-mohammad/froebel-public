"use client";

import React from "react";

import { LayoutGrid, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { ViewMode } from "@/types/memorize";

export interface ViewModeToggleProps {
    /** Current view mode */
    viewMode: ViewMode;
    /** Callback when mode changes */
    onModeChange: (mode: ViewMode) => void;
}

/**
 * Toggle between "All at Once" and "One by One" view modes
 */
export function ViewModeToggle({ viewMode, onModeChange }: ViewModeToggleProps) {
    return (
        <div className="flex gap-2">
            <Button
                variant={viewMode === "all" ? "default" : "secondary"}
                size="sm"
                onClick={() => onModeChange("all")}
                className="gap-2"
            >
                <LayoutGrid className="h-4 w-4" />
                All at Once
            </Button>
            <Button
                variant={viewMode === "one" ? "default" : "secondary"}
                size="sm"
                onClick={() => onModeChange("one")}
                className="gap-2"
            >
                <Square className="h-4 w-4" />
                One by One
            </Button>
        </div>
    );
}

export default ViewModeToggle;

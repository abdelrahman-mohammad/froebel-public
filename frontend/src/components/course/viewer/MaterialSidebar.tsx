"use client";

import { Check, ChevronRight, Clock, File, FileText } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

import type { MaterialProgressItem } from "@/lib/course/types";
import { cn } from "@/lib/utils";

interface MaterialSidebarProps {
    materials: MaterialProgressItem[];
    selectedMaterialId: string | null;
    onSelectMaterial: (materialId: string) => void;
    progressPercentage: number;
    completedCount: number;
    totalCount: number;
}

export function MaterialSidebar({
    materials,
    selectedMaterialId,
    onSelectMaterial,
    progressPercentage,
    completedCount,
    totalCount,
}: MaterialSidebarProps) {
    // Sort by order
    const sortedMaterials = [...materials].sort((a, b) => a.order - b.order);

    return (
        <div className="flex flex-col h-full border-r bg-card">
            {/* Progress Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm text-muted-foreground">
                        {completedCount}/{totalCount}
                    </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(progressPercentage)}% complete
                </p>
            </div>

            {/* Materials List */}
            <ScrollArea className="flex-1">
                <div className="py-2">
                    {sortedMaterials.map((material, index) => {
                        const isSelected = material.materialId === selectedMaterialId;
                        const isCompleted = material.completed;

                        return (
                            <button
                                key={material.materialId}
                                onClick={() => onSelectMaterial(material.materialId)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                                    isSelected
                                        ? "bg-accent text-accent-foreground"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                {/* Completion indicator */}
                                <div
                                    className={cn(
                                        "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                                        isCompleted
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Material info */}
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            "text-sm font-medium truncate",
                                            isCompleted && !isSelected && "text-muted-foreground"
                                        )}
                                    >
                                        {material.title}
                                    </p>
                                </div>

                                {/* Selected indicator */}
                                {isSelected && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}

export default MaterialSidebar;

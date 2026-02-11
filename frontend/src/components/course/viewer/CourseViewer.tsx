"use client";

import { useCallback, useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { useCourseProgress } from "@/hooks/useCourseProgress";

import { getMaterial } from "@/lib/course/api";
import type { MaterialDTO } from "@/lib/course/types";

import { MaterialContent } from "./MaterialContent";
import { MaterialSidebar } from "./MaterialSidebar";

interface CourseViewerProps {
    courseId: string;
}

export function CourseViewer({ courseId }: CourseViewerProps) {
    const {
        progress,
        isLoading: isLoadingProgress,
        isUpdating,
        error,
        loadProgress,
        toggleComplete,
        isMaterialComplete,
    } = useCourseProgress();

    const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
    const [currentMaterial, setCurrentMaterial] = useState<MaterialDTO | null>(null);
    const [isLoadingMaterial, setIsLoadingMaterial] = useState(false);

    // Load progress on mount
    useEffect(() => {
        loadProgress(courseId);
    }, [courseId, loadProgress]);

    // Auto-select first material when progress loads
    useEffect(() => {
        if (progress && progress.materials.length > 0 && !selectedMaterialId) {
            // Find first incomplete material, or first material if all complete
            const firstIncomplete = progress.materials.find((m) => !m.completed);
            const materialToSelect = firstIncomplete || progress.materials[0];
            setSelectedMaterialId(materialToSelect.materialId);
        }
    }, [progress, selectedMaterialId]);

    // Load material content when selection changes
    useEffect(() => {
        if (selectedMaterialId) {
            loadMaterialContent(selectedMaterialId);
        }
    }, [selectedMaterialId]);

    const loadMaterialContent = async (materialId: string) => {
        setIsLoadingMaterial(true);
        try {
            const material = await getMaterial(courseId, materialId);
            setCurrentMaterial(material);
        } catch (err) {
            console.error("Failed to load material:", err);
        } finally {
            setIsLoadingMaterial(false);
        }
    };

    const handleSelectMaterial = (materialId: string) => {
        setSelectedMaterialId(materialId);
    };

    const handleToggleComplete = async () => {
        if (!selectedMaterialId) return;
        await toggleComplete(courseId, selectedMaterialId);
    };

    // Navigation
    const sortedMaterials = progress?.materials.sort((a, b) => a.order - b.order) || [];
    const currentIndex = sortedMaterials.findIndex((m) => m.materialId === selectedMaterialId);

    const handlePrevious =
        currentIndex > 0
            ? () => setSelectedMaterialId(sortedMaterials[currentIndex - 1].materialId)
            : null;

    const handleNext =
        currentIndex < sortedMaterials.length - 1
            ? () => setSelectedMaterialId(sortedMaterials[currentIndex + 1].materialId)
            : null;

    // Loading state
    if (isLoadingProgress) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                    <p className="text-destructive mb-2">{error}</p>
                </div>
            </div>
        );
    }

    // No progress (shouldn't happen if enrolled)
    if (!progress) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <p className="text-muted-foreground">No course data available</p>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-12rem)] border rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 flex-shrink-0">
                <MaterialSidebar
                    materials={progress.materials}
                    selectedMaterialId={selectedMaterialId}
                    onSelectMaterial={handleSelectMaterial}
                    progressPercentage={progress.progressPercentage}
                    completedCount={progress.completedMaterials}
                    totalCount={progress.totalMaterials}
                />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {isLoadingMaterial ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <MaterialContent
                        material={currentMaterial}
                        isComplete={
                            selectedMaterialId ? isMaterialComplete(selectedMaterialId) : false
                        }
                        isUpdating={isUpdating}
                        onToggleComplete={handleToggleComplete}
                        onPrevious={handlePrevious}
                        onNext={handleNext}
                        currentIndex={currentIndex}
                        totalCount={sortedMaterials.length}
                    />
                )}
            </div>
        </div>
    );
}

export default CourseViewer;

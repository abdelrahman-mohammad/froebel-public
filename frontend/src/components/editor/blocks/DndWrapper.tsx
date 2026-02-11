"use client";

import React, { useCallback, useState } from "react";

import {
    type CollisionDetection,
    DndContext,
    type DragEndEvent,
    type DragOverEvent,
    DragOverlay,
    type DragStartEvent,
    KeyboardSensor,
    type Modifier,
    PointerSensor,
    closestCenter,
    pointerWithin,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { cn } from "@/lib/utils";

import type { Chapter, Question } from "@/types/quiz";

// Helper to check if a collision is a drop zone
function isDropZone(data: Record<string, unknown> | undefined): boolean {
    return data?.type === "chapter-drop" || data?.type === "uncategorized-drop";
}

// Helper to check if a collision is a chapter (not a question)
function isChapter(data: Record<string, unknown> | undefined): boolean {
    return data?.type === "chapter";
}

// Custom collision detection that prioritizes chapter drop zones for questions
// Also locks reordering to same section (uncategorized with uncategorized, chapter with same chapter)
const createCollisionDetection = (
    activeType: string | null,
    activeChapterId: string | null
): CollisionDetection => {
    return (args) => {
        if (activeType === "question") {
            // Use pointerWithin to detect if pointer is inside a droppable
            const pointerCollisions = pointerWithin(args);

            // Find chapter drop zones - ONLY when pointer is strictly inside
            const dropZone = pointerCollisions.find((collision) => {
                const data = collision.data?.droppableContainer?.data?.current;
                return isDropZone(data);
            });

            // If pointer is inside a drop zone, return only that
            if (dropZone) {
                return [dropZone];
            }

            // For sortable items, use closestCenter but EXCLUDE drop zones, chapters,
            // and questions from DIFFERENT sections (different chapter or different categorization)
            const closestCollisions = closestCenter(args);
            return closestCollisions.filter((collision) => {
                const data = collision.data?.droppableContainer?.data?.current;
                if (isDropZone(data) || isChapter(data)) return false;

                // Only allow reordering with questions in the SAME section
                if (data?.type === "question") {
                    const overChapterId = data.question?.chapter || null;
                    // Both must be in the same chapter (or both uncategorized)
                    return activeChapterId === overChapterId;
                }

                return false;
            });
        }

        // For chapters, only collide with other chapters (not questions)
        if (activeType === "chapter") {
            const closestCollisions = closestCenter(args);
            return closestCollisions.filter((collision) => {
                const data = collision.data?.droppableContainer?.data?.current;
                return isChapter(data);
            });
        }

        // Default to closestCenter for other items
        return closestCenter(args);
    };
};

// Custom modifier that snaps draggable to center of drop zones
const snapToDroppable: Modifier = ({
    active,
    draggingNodeRect,
    overlayNodeRect,
    transform,
    over,
}) => {
    // Only snap when actively dragging and over a valid drop target
    if (!active || !over?.rect) {
        return transform;
    }

    // Only snap for chapter/uncategorized drop zones (not sortable items)
    const overData = over.data?.current;
    if (!isDropZone(overData)) {
        return transform;
    }

    // Use overlay rect if available (more accurate), fallback to dragging rect
    const sourceRect = overlayNodeRect || draggingNodeRect;
    if (!sourceRect) {
        return transform;
    }

    const targetRect = over.rect;

    // Current center of the dragged element (with current transform applied)
    const currentCenterX = sourceRect.left + sourceRect.width / 2 + transform.x;
    const currentCenterY = sourceRect.top + sourceRect.height / 2 + transform.y;

    // Target center (center of drop zone)
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    // Calculate offset needed to align centers
    const offsetX = targetCenterX - currentCenterX;
    const offsetY = targetCenterY - currentCenterY;

    return {
        ...transform,
        x: transform.x + offsetX,
        y: transform.y + offsetY,
    };
};

interface DragData {
    type: "question" | "chapter";
    question?: Question;
    chapter?: Chapter;
    index: number;
}

interface DndWrapperProps {
    children: React.ReactNode;
    items: string[]; // IDs of sortable items
    onDragEnd: (event: DragEndEvent) => void;
    onDragOver?: (event: DragOverEvent) => void;
    renderDragOverlay?: (
        activeId: string | null,
        data: DragData | null,
        dropZoneWidth: number | null
    ) => React.ReactNode;
}

export function DndWrapper({
    children,
    items,
    onDragEnd,
    onDragOver,
    renderDragOverlay,
}: DndWrapperProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeData, setActiveData] = useState<DragData | null>(null);
    const [isOverDropZone, setIsOverDropZone] = useState(false);
    const [dropZoneWidth, setDropZoneWidth] = useState<number | null>(null);
    const [dropZoneHeight, setDropZoneHeight] = useState<number | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Create collision detection based on what's being dragged
    const collisionDetection = useCallback(
        (args: Parameters<CollisionDetection>[0]) => {
            const activeChapterId = activeData?.question?.chapter || null;
            return createCollisionDetection(activeData?.type ?? null, activeChapterId)(args);
        },
        [activeData?.type, activeData?.question?.chapter]
    );

    function handleDragStart(event: DragStartEvent) {
        setActiveId(event.active.id as string);
        setActiveData(event.active.data.current as DragData);
        setIsOverDropZone(false);
        setDropZoneWidth(null);
        setDropZoneHeight(null);
    }

    function handleDragEnd(event: DragEndEvent) {
        setActiveId(null);
        setActiveData(null);
        setIsOverDropZone(false);
        setDropZoneWidth(null);
        setDropZoneHeight(null);
        onDragEnd(event);
    }

    function handleDragOver(event: DragOverEvent) {
        // Track if we're over a drop zone for transition effect
        const overData = event.over?.data?.current;
        const overDropZone = isDropZone(overData);
        setIsOverDropZone(overDropZone);

        // Capture drop zone dimensions for overlay resizing
        if (overDropZone && event.over?.rect) {
            setDropZoneWidth(event.over.rect.width);
            setDropZoneHeight(event.over.rect.height);
        } else {
            setDropZoneWidth(null);
            setDropZoneHeight(null);
        }

        onDragOver?.(event);
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={collisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            modifiers={[restrictToVerticalAxis, snapToDroppable]}
        >
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                {children}
            </SortableContext>
            <DragOverlay
                // Apply transition to the DragOverlay's internal container
                // The transition smooths the snap when entering drop zones
                style={isOverDropZone ? { transition: "transform 150ms ease-out" } : undefined}
            >
                {renderDragOverlay ? (
                    <div
                        className={cn(
                            "transition-[opacity,box-shadow,width] duration-150 ease-out",
                            // Visual feedback when snapped to drop zone
                            isOverDropZone
                                ? "opacity-100 shadow-xl shadow-primary/20"
                                : "opacity-90"
                        )}
                        style={
                            isOverDropZone && dropZoneWidth ? { width: dropZoneWidth } : undefined
                        }
                    >
                        {renderDragOverlay(activeId, activeData, dropZoneWidth)}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}

// Helper to compute new index after reorder
export function getNewIndex(
    items: string[],
    activeId: string,
    overId: string
): { oldIndex: number; newIndex: number } | null {
    const oldIndex = items.indexOf(activeId);
    const newIndex = items.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1) {
        return null;
    }

    return { oldIndex, newIndex };
}

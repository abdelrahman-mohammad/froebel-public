"use client";

import { useState } from "react";

import {
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    Clock,
    Eye,
    EyeOff,
    File,
    FileText,
    GripVertical,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { MaterialDTO } from "@/lib/course/types";

interface MaterialsListProps {
    materials: MaterialDTO[];
    onAdd: () => void;
    onEdit: (materialId: string) => void;
    onDelete: (materialId: string) => Promise<void>;
    onReorder: (materials: MaterialDTO[]) => Promise<void>;
    onTogglePublish: (materialId: string, published: boolean) => Promise<void>;
    isLoading?: boolean;
}

interface SortableMaterialItemProps {
    material: MaterialDTO;
    onEdit: () => void;
    onDelete: () => void;
    onTogglePublish: () => void;
}

function SortableMaterialItem({
    material,
    onEdit,
    onDelete,
    onTogglePublish,
}: SortableMaterialItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: material.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center gap-3 p-4 bg-card border rounded-lg ${
                isDragging ? "opacity-50 shadow-lg" : ""
            }`}
        >
            {/* Drag handle */}
            <button
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="h-5 w-5" />
            </button>

            {/* Content type icon */}
            <div className="flex-shrink-0">
                {material.contentType === "TEXT" ? (
                    <FileText className="h-5 w-5 text-blue-500" />
                ) : (
                    <File className="h-5 w-5 text-amber-500" />
                )}
            </div>

            {/* Material info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{material.title}</h4>
                    {!material.published && (
                        <Badge variant="outline" className="text-xs">
                            Draft
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                    <span className="capitalize">{material.contentType.toLowerCase()}</span>
                    {material.durationMinutes && (
                        <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {material.durationMinutes} min
                        </span>
                    )}
                    {material.quizCount > 0 && (
                        <span>
                            {material.quizCount} quiz
                            {material.quizCount !== 1 ? "zes" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Material actions</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onTogglePublish}>
                        {material.published ? (
                            <>
                                <EyeOff className="h-4 w-4" />
                                Unpublish
                            </>
                        ) : (
                            <>
                                <Eye className="h-4 w-4" />
                                Publish
                            </>
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export function MaterialsList({
    materials,
    onAdd,
    onEdit,
    onDelete,
    onReorder,
    onTogglePublish,
    isLoading,
}: MaterialsListProps) {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = materials.findIndex((m) => m.id === active.id);
            const newIndex = materials.findIndex((m) => m.id === over.id);

            const newMaterials = arrayMove(materials, oldIndex, newIndex).map((m, idx) => ({
                ...m,
                materialOrder: idx,
            }));

            await onReorder(newMaterials);
        }
    };

    const handleDeleteClick = (materialId: string) => {
        setMaterialToDelete(materialId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (materialToDelete) {
            await onDelete(materialToDelete);
        }
        setDeleteModalOpen(false);
        setMaterialToDelete(null);
    };

    // Sort materials by order
    const sortedMaterials = [...materials].sort((a, b) => a.materialOrder - b.materialOrder);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Materials</h3>
                <Button onClick={onAdd} size="sm" className="gap-2" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    Add Material
                </Button>
            </div>

            {sortedMaterials.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-medium mb-2">No materials yet</h4>
                    <p className="text-muted-foreground text-center mb-4 max-w-md">
                        Add materials to your course. Materials can be text content (Markdown) or
                        file attachments.
                    </p>
                    <Button onClick={onAdd} disabled={isLoading}>
                        <Plus className="h-4 w-4" />
                        Add First Material
                    </Button>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sortedMaterials.map((m) => m.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-2">
                            {sortedMaterials.map((material) => (
                                <SortableMaterialItem
                                    key={material.id}
                                    material={material}
                                    onEdit={() => onEdit(material.id)}
                                    onDelete={() => handleDeleteClick(material.id)}
                                    onTogglePublish={() =>
                                        onTogglePublish(material.id, !material.published)
                                    }
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {/* Delete Confirmation Modal */}
            <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Material</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this material? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default MaterialsList;

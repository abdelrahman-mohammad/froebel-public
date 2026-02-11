"use client";
/* eslint-disable react-hooks/set-state-in-effect */
// This file uses a valid pattern of syncing form state from loaded data
import { useCallback, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Save } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { type CourseValidationError, validateCourse } from "@/contexts/CourseEditorContext";

import { useCourseEditor } from "@/hooks/useCourseEditor";

import type { CreateMaterialRequest, UpdateMaterialRequest } from "@/lib/course/types";

import { CourseMetaForm } from "./CourseMetaForm";
import { MaterialModal } from "./MaterialModal";
import { MaterialsList } from "./MaterialsList";
import { QuizPicker } from "./QuizPicker";

interface CourseEditorProps {
    courseId?: string; // undefined for new course
}

export function CourseEditor({ courseId }: CourseEditorProps) {
    const router = useRouter();
    const isNewCourse = !courseId;

    const {
        course,
        materials,
        isLoading,
        isSaving,
        error,
        isDirty,
        loadCourse,
        createCourse,
        updateCourse,
        publishCourse,
        addMaterial,
        updateMaterial: updateMaterialApi,
        deleteMaterial: deleteMaterialApi,
        reorderMaterials,
        publishMaterial,
        clearError,
    } = useCourseEditor();

    // Local form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState<string | undefined>();
    const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">(
        "BEGINNER"
    );
    const [estimatedHours, setEstimatedHours] = useState<number | undefined>();
    const [tags, setTags] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [localIsDirty, setLocalIsDirty] = useState(false);

    // Modal state
    const [materialModalOpen, setMaterialModalOpen] = useState(false);
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
    const [quizPickerOpen, setQuizPickerOpen] = useState(false);
    const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);

    // Load course data
    useEffect(() => {
        if (courseId) {
            loadCourse(courseId);
        }
    }, [courseId, loadCourse]);

    // Sync form state with loaded course
    useEffect(() => {
        if (course) {
            setTitle(course.title);
            setDescription(course.description || "");
            setImageUrl(course.imageUrl);
            setDifficulty(course.difficulty);
            setEstimatedHours(course.estimatedHours);
            setTags(course.tags);
            setLocalIsDirty(false);
        }
    }, [course]);

    // Track form changes
    const handleFormChange = useCallback(() => {
        setLocalIsDirty(true);
    }, []);

    // Validate and save course
    const handleSave = async () => {
        const courseData = {
            title: title.trim(),
            description: description.trim() || undefined,
            imageUrl,
            difficulty,
            estimatedHours,
            tagNames: tags,
        };

        const errors = validateCourse(courseData);
        if (errors.length > 0) {
            const errorMap: Record<string, string> = {};
            errors.forEach((e) => {
                errorMap[e.field] = e.message;
            });
            setFormErrors(errorMap);
            return;
        }

        setFormErrors({});

        try {
            if (isNewCourse) {
                const newCourse = await createCourse(courseData);
                router.replace(`/course/${newCourse.id}/edit`);
            } else {
                await updateCourse(courseData);
                setLocalIsDirty(false);
            }
        } catch (err) {
            // Error is handled by hook
        }
    };

    // Toggle publish status
    const handleTogglePublish = async () => {
        if (!course) return;
        await publishCourse(!course.published);
    };

    // Material handlers
    const handleAddMaterial = () => {
        setEditingMaterialId(null);
        setMaterialModalOpen(true);
    };

    const handleEditMaterial = (materialId: string) => {
        setEditingMaterialId(materialId);
        setMaterialModalOpen(true);
    };

    const handleSaveMaterial = async (data: CreateMaterialRequest | UpdateMaterialRequest) => {
        if (editingMaterialId) {
            await updateMaterialApi(editingMaterialId, data);
        } else {
            await addMaterial(data as CreateMaterialRequest);
        }
        setMaterialModalOpen(false);
        setEditingMaterialId(null);
    };

    const handleDeleteMaterial = async (materialId: string) => {
        await deleteMaterialApi(materialId);
    };

    const handleReorderMaterials = async (newMaterials: typeof materials) => {
        const orders = newMaterials.map((m, idx) => ({
            materialId: m.id,
            order: idx,
        }));
        await reorderMaterials(orders);
    };

    const handleToggleMaterialPublish = async (materialId: string, published: boolean) => {
        await publishMaterial(materialId, published);
    };

    // Navigation with unsaved changes check
    const handleBack = () => {
        if (localIsDirty || isDirty) {
            setUnsavedChangesModalOpen(true);
        } else {
            router.push("/library?type=courses");
        }
    };

    const handleConfirmLeave = () => {
        router.push("/library?type=courses");
    };

    // Get editing material
    const editingMaterial = editingMaterialId
        ? materials.find((m) => m.id === editingMaterialId) || null
        : null;

    // Loading state
    if (isLoading && !isNewCourse) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">
                            {isNewCourse ? "Create Course" : "Edit Course"}
                        </h1>
                        {course && (
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant={course.published ? "default" : "outline"}>
                                    {course.published ? "Published" : "Draft"}
                                </Badge>
                                {localIsDirty && <Badge variant="secondary">Unsaved changes</Badge>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {!isNewCourse && (
                        <Button
                            variant="outline"
                            onClick={handleTogglePublish}
                            disabled={isSaving || materials.length === 0}
                        >
                            {course?.published ? (
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
                        </Button>
                    )}
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        <Save className="h-4 w-4" />
                        {isNewCourse ? "Create Course" : "Save"}
                    </Button>
                </div>
            </div>

            {/* Error display */}
            {error && (
                <div className="flex items-center gap-2 p-4 mb-6 rounded-lg bg-destructive/10 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                    <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto">
                        Dismiss
                    </Button>
                </div>
            )}

            {/* Course Details */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                    <CardDescription>Basic information about your course</CardDescription>
                </CardHeader>
                <CardContent>
                    <CourseMetaForm
                        title={title}
                        description={description}
                        imageUrl={imageUrl}
                        difficulty={difficulty}
                        estimatedHours={estimatedHours}
                        tags={tags}
                        onTitleChange={(v) => {
                            setTitle(v);
                            handleFormChange();
                        }}
                        onDescriptionChange={(v) => {
                            setDescription(v);
                            handleFormChange();
                        }}
                        onImageUrlChange={(v) => {
                            setImageUrl(v);
                            handleFormChange();
                        }}
                        onDifficultyChange={(v) => {
                            setDifficulty(v);
                            handleFormChange();
                        }}
                        onEstimatedHoursChange={(v) => {
                            setEstimatedHours(v);
                            handleFormChange();
                        }}
                        onTagsChange={(v) => {
                            setTags(v);
                            handleFormChange();
                        }}
                        errors={formErrors}
                    />
                </CardContent>
            </Card>

            {/* Materials Section - Only show after course is created */}
            {!isNewCourse && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Materials</CardTitle>
                        <CardDescription>
                            Add and organize learning materials for your course
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <MaterialsList
                            materials={materials}
                            onAdd={handleAddMaterial}
                            onEdit={handleEditMaterial}
                            onDelete={handleDeleteMaterial}
                            onReorder={handleReorderMaterials}
                            onTogglePublish={handleToggleMaterialPublish}
                            isLoading={isSaving}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Material Modal */}
            <MaterialModal
                open={materialModalOpen}
                onClose={() => {
                    setMaterialModalOpen(false);
                    setEditingMaterialId(null);
                }}
                material={editingMaterial}
                onSave={handleSaveMaterial}
                isSaving={isSaving}
            />

            {/* Quiz Picker */}
            <QuizPicker
                open={quizPickerOpen}
                onClose={() => setQuizPickerOpen(false)}
                onSelect={(quizIds) => {
                    // Handle quiz selection - attach to course
                    console.log("Selected quizzes:", quizIds);
                }}
            />

            {/* Unsaved Changes Modal */}
            <AlertDialog open={unsavedChangesModalOpen} onOpenChange={setUnsavedChangesModalOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to leave? Your changes
                            will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmLeave}>
                            Leave Without Saving
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default CourseEditor;

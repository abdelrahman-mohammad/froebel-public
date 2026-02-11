/**
 * useCourseEditor Hook
 * Manages course editing with API sync including materials and quiz associations
 */

"use client";

import { useCallback, useState } from "react";

import {
    attachQuizToCourse as attachQuizToCourseApi,
    attachQuizToMaterial as attachQuizToMaterialApi,
    createCourse as createCourseApi,
    createMaterial as createMaterialApi,
    deleteMaterial as deleteMaterialApi,
    detachQuizFromCourse as detachQuizFromCourseApi,
    detachQuizFromMaterial as detachQuizFromMaterialApi,
    getCourseById,
    getCourseErrorMessage,
    getMaterials,
    reorderMaterials as reorderMaterialsApi,
    setCoursePublished,
    setMaterialPublished as setMaterialPublishedApi,
    updateCourse as updateCourseApi,
    updateMaterial as updateMaterialApi,
} from "@/lib/course/api";
import type {
    CourseDetailDTO,
    CreateCourseRequest,
    CreateMaterialRequest,
    MaterialDTO,
    MaterialOrderItem,
    UpdateCourseRequest,
    UpdateMaterialRequest,
} from "@/lib/course/types";

export interface UseCourseEditorReturn {
    // Course state
    course: CourseDetailDTO | null;
    materials: MaterialDTO[];
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    isDirty: boolean;

    // Course operations
    loadCourse: (courseId: string) => Promise<CourseDetailDTO>;
    createCourse: (data: CreateCourseRequest) => Promise<CourseDetailDTO>;
    updateCourse: (data: UpdateCourseRequest) => Promise<CourseDetailDTO>;
    publishCourse: (published: boolean) => Promise<void>;

    // Material operations
    addMaterial: (data: CreateMaterialRequest) => Promise<MaterialDTO>;
    updateMaterial: (materialId: string, data: UpdateMaterialRequest) => Promise<MaterialDTO>;
    deleteMaterial: (materialId: string) => Promise<void>;
    reorderMaterials: (orders: MaterialOrderItem[]) => Promise<void>;
    publishMaterial: (materialId: string, published: boolean) => Promise<void>;

    // Quiz association operations
    attachQuizToCourse: (quizId: string) => Promise<void>;
    detachQuizFromCourse: (quizId: string) => Promise<void>;
    attachQuizToMaterial: (materialId: string, quizId: string) => Promise<void>;
    detachQuizFromMaterial: (materialId: string, quizId: string) => Promise<void>;

    // Utilities
    setDirty: (dirty: boolean) => void;
    reset: () => void;
    clearError: () => void;
}

export function useCourseEditor(): UseCourseEditorReturn {
    const [course, setCourse] = useState<CourseDetailDTO | null>(null);
    const [materials, setMaterials] = useState<MaterialDTO[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    // Load an existing course for editing
    const loadCourse = useCallback(async (courseId: string): Promise<CourseDetailDTO> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await getCourseById(courseId);
            setCourse(response);
            setMaterials(response.materials || []);
            setIsDirty(false);
            return response;
        } catch (err) {
            const message = getCourseErrorMessage(err);
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Create a new course
    const createCourse = useCallback(
        async (data: CreateCourseRequest): Promise<CourseDetailDTO> => {
            setIsSaving(true);
            setError(null);

            try {
                const response = await createCourseApi(data);
                setCourse(response);
                setMaterials(response.materials || []);
                setIsDirty(false);
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        []
    );

    // Update course metadata
    const updateCourse = useCallback(
        async (data: UpdateCourseRequest): Promise<CourseDetailDTO> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await updateCourseApi(course.id, data);
                setCourse(response);
                setMaterials(response.materials || []);
                setIsDirty(false);
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Publish or unpublish the course
    const publishCourse = useCallback(
        async (published: boolean): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await setCoursePublished(course.id, published);
                setCourse(response);
                setMaterials(response.materials || []);
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Add a new material
    const addMaterial = useCallback(
        async (data: CreateMaterialRequest): Promise<MaterialDTO> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await createMaterialApi(course.id, data);
                setMaterials((prev) => [...prev, response]);
                setCourse((prev) => {
                    if (!prev) return prev;
                    return { ...prev, materialCount: prev.materialCount + 1 };
                });
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Update an existing material
    const updateMaterial = useCallback(
        async (materialId: string, data: UpdateMaterialRequest): Promise<MaterialDTO> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await updateMaterialApi(course.id, materialId, data);
                setMaterials((prev) => prev.map((m) => (m.id === materialId ? response : m)));
                return response;
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Delete a material
    const deleteMaterial = useCallback(
        async (materialId: string): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                await deleteMaterialApi(course.id, materialId);
                // Optimistically update local state
                setMaterials((prev) => prev.filter((m) => m.id !== materialId));
                setCourse((prev) => {
                    if (!prev) return prev;
                    return { ...prev, materialCount: prev.materialCount - 1 };
                });
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                // Reload on error to revert optimistic update
                if (course) {
                    const materialsData = await getMaterials(course.id);
                    setMaterials(materialsData);
                }
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Reorder materials
    const reorderMaterials = useCallback(
        async (orders: MaterialOrderItem[]): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await reorderMaterialsApi(course.id, {
                    materialOrders: orders,
                });
                setMaterials(response);
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Publish or unpublish a material
    const publishMaterial = useCallback(
        async (materialId: string, published: boolean): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await setMaterialPublishedApi(course.id, materialId, published);
                setMaterials((prev) => prev.map((m) => (m.id === materialId ? response : m)));
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Attach a quiz to the course
    const attachQuizToCourse = useCallback(
        async (quizId: string): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await attachQuizToCourseApi(course.id, quizId);
                setCourse(response);
                setMaterials(response.materials || []);
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Detach a quiz from the course
    const detachQuizFromCourse = useCallback(
        async (quizId: string): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await detachQuizFromCourseApi(course.id, quizId);
                setCourse(response);
                setMaterials(response.materials || []);
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Attach a quiz to a material
    const attachQuizToMaterial = useCallback(
        async (materialId: string, quizId: string): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await attachQuizToMaterialApi(course.id, materialId, quizId);
                setMaterials((prev) => prev.map((m) => (m.id === materialId ? response : m)));
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Detach a quiz from a material
    const detachQuizFromMaterial = useCallback(
        async (materialId: string, quizId: string): Promise<void> => {
            if (!course) {
                throw new Error("No course loaded");
            }

            setIsSaving(true);
            setError(null);

            try {
                const response = await detachQuizFromMaterialApi(course.id, materialId, quizId);
                setMaterials((prev) => prev.map((m) => (m.id === materialId ? response : m)));
            } catch (err) {
                const message = getCourseErrorMessage(err);
                setError(message);
                throw err;
            } finally {
                setIsSaving(false);
            }
        },
        [course]
    );

    // Set dirty flag manually
    const setDirty = useCallback((dirty: boolean) => {
        setIsDirty(dirty);
    }, []);

    // Reset all state
    const reset = useCallback(() => {
        setCourse(null);
        setMaterials([]);
        setError(null);
        setIsDirty(false);
        setIsLoading(false);
        setIsSaving(false);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
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
        updateMaterial,
        deleteMaterial,
        reorderMaterials,
        publishMaterial,
        attachQuizToCourse,
        detachQuizFromCourse,
        attachQuizToMaterial,
        detachQuizFromMaterial,
        setDirty,
        reset,
        clearError,
    };
}

export default useCourseEditor;

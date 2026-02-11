"use client";

import React, { type ReactNode, createContext, useCallback, useContext, useReducer } from "react";

import type {
    CourseDetailDTO,
    CreateCourseRequest,
    CreateMaterialRequest,
    Difficulty,
    MaterialDTO,
    UpdateCourseRequest,
    UpdateMaterialRequest,
} from "@/lib/course/types";

// Editor state interface
export interface CourseEditorState {
    course: CourseDetailDTO | null;
    materials: MaterialDTO[];
    isDirty: boolean;
    editingMaterialId: string | null;
    isMaterialModalOpen: boolean;
    isQuizPickerOpen: boolean;
    quizPickerTarget: "course" | { materialId: string } | null;
}

// Actions for the editor reducer
export type CourseEditorAction =
    | {
          type: "SET_COURSE";
          payload: { course: CourseDetailDTO; materials: MaterialDTO[] };
      }
    | { type: "UPDATE_TITLE"; payload: string }
    | { type: "UPDATE_DESCRIPTION"; payload: string }
    | { type: "UPDATE_IMAGE_URL"; payload: string | undefined }
    | { type: "UPDATE_CATEGORY"; payload: string | undefined }
    | { type: "UPDATE_DIFFICULTY"; payload: Difficulty }
    | { type: "UPDATE_ESTIMATED_HOURS"; payload: number | undefined }
    | { type: "UPDATE_TAGS"; payload: string[] }
    | { type: "SET_MATERIALS"; payload: MaterialDTO[] }
    | { type: "ADD_MATERIAL"; payload: MaterialDTO }
    | { type: "UPDATE_MATERIAL"; payload: MaterialDTO }
    | { type: "DELETE_MATERIAL"; payload: string }
    | { type: "REORDER_MATERIALS"; payload: MaterialDTO[] }
    | { type: "OPEN_MATERIAL_MODAL"; payload: string | null }
    | { type: "CLOSE_MATERIAL_MODAL" }
    | { type: "OPEN_QUIZ_PICKER"; payload: "course" | { materialId: string } }
    | { type: "CLOSE_QUIZ_PICKER" }
    | { type: "MARK_SAVED" }
    | { type: "RESET" };

// Initial state factory
function createInitialState(): CourseEditorState {
    return {
        course: null,
        materials: [],
        isDirty: false,
        editingMaterialId: null,
        isMaterialModalOpen: false,
        isQuizPickerOpen: false,
        quizPickerTarget: null,
    };
}

// Create an empty course for new course creation
export function createEmptyCourse(): CreateCourseRequest {
    return {
        title: "",
        description: "",
        difficulty: "BEGINNER",
        tagNames: [],
    };
}

// Create an empty material
export function createEmptyMaterial(): CreateMaterialRequest {
    return {
        title: "",
        contentType: "TEXT",
        content: "",
    };
}

// Reducer function
function courseEditorReducer(
    state: CourseEditorState,
    action: CourseEditorAction
): CourseEditorState {
    switch (action.type) {
        case "SET_COURSE":
            return {
                ...state,
                course: action.payload.course,
                materials: action.payload.materials,
                isDirty: false,
            };

        case "UPDATE_TITLE":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, title: action.payload },
                isDirty: true,
            };

        case "UPDATE_DESCRIPTION":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, description: action.payload },
                isDirty: true,
            };

        case "UPDATE_IMAGE_URL":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, imageUrl: action.payload },
                isDirty: true,
            };

        case "UPDATE_CATEGORY":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, categoryId: action.payload },
                isDirty: true,
            };

        case "UPDATE_DIFFICULTY":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, difficulty: action.payload },
                isDirty: true,
            };

        case "UPDATE_ESTIMATED_HOURS":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, estimatedHours: action.payload },
                isDirty: true,
            };

        case "UPDATE_TAGS":
            if (!state.course) return state;
            return {
                ...state,
                course: { ...state.course, tags: action.payload },
                isDirty: true,
            };

        case "SET_MATERIALS":
            return {
                ...state,
                materials: action.payload,
            };

        case "ADD_MATERIAL":
            return {
                ...state,
                materials: [...state.materials, action.payload],
                isMaterialModalOpen: false,
                editingMaterialId: null,
            };

        case "UPDATE_MATERIAL": {
            const updatedMaterials = state.materials.map((m) =>
                m.id === action.payload.id ? action.payload : m
            );
            return {
                ...state,
                materials: updatedMaterials,
                isMaterialModalOpen: false,
                editingMaterialId: null,
            };
        }

        case "DELETE_MATERIAL": {
            const filteredMaterials = state.materials.filter((m) => m.id !== action.payload);
            return {
                ...state,
                materials: filteredMaterials,
            };
        }

        case "REORDER_MATERIALS":
            return {
                ...state,
                materials: action.payload,
            };

        case "OPEN_MATERIAL_MODAL":
            return {
                ...state,
                isMaterialModalOpen: true,
                editingMaterialId: action.payload,
            };

        case "CLOSE_MATERIAL_MODAL":
            return {
                ...state,
                isMaterialModalOpen: false,
                editingMaterialId: null,
            };

        case "OPEN_QUIZ_PICKER":
            return {
                ...state,
                isQuizPickerOpen: true,
                quizPickerTarget: action.payload,
            };

        case "CLOSE_QUIZ_PICKER":
            return {
                ...state,
                isQuizPickerOpen: false,
                quizPickerTarget: null,
            };

        case "MARK_SAVED":
            return {
                ...state,
                isDirty: false,
            };

        case "RESET":
            return createInitialState();

        default:
            return state;
    }
}

// Context type
interface CourseEditorContextType {
    state: CourseEditorState;
    // Course metadata
    updateTitle: (title: string) => void;
    updateDescription: (description: string) => void;
    updateImageUrl: (url: string | undefined) => void;
    updateCategory: (categoryId: string | undefined) => void;
    updateDifficulty: (difficulty: Difficulty) => void;
    updateEstimatedHours: (hours: number | undefined) => void;
    updateTags: (tags: string[]) => void;
    // Materials
    setMaterials: (materials: MaterialDTO[]) => void;
    addMaterial: (material: MaterialDTO) => void;
    updateMaterial: (material: MaterialDTO) => void;
    deleteMaterial: (materialId: string) => void;
    reorderMaterials: (materials: MaterialDTO[]) => void;
    // Material Modal
    openAddMaterialModal: () => void;
    openEditMaterialModal: (materialId: string) => void;
    closeMaterialModal: () => void;
    // Quiz Picker
    openCourseQuizPicker: () => void;
    openMaterialQuizPicker: (materialId: string) => void;
    closeQuizPicker: () => void;
    // Course
    setCourse: (course: CourseDetailDTO, materials: MaterialDTO[]) => void;
    markSaved: () => void;
    reset: () => void;
    // Helpers
    getEditingMaterial: () => MaterialDTO | null;
    getUpdateRequest: () => UpdateCourseRequest | null;
}

// Create context
const CourseEditorContext = createContext<CourseEditorContextType | null>(null);

// Provider props
interface CourseEditorProviderProps {
    children: ReactNode;
}

// Provider component
export function CourseEditorProvider({ children }: CourseEditorProviderProps) {
    const [state, dispatch] = useReducer(courseEditorReducer, undefined, createInitialState);

    // Course metadata actions
    const updateTitle = useCallback((title: string) => {
        dispatch({ type: "UPDATE_TITLE", payload: title });
    }, []);

    const updateDescription = useCallback((description: string) => {
        dispatch({ type: "UPDATE_DESCRIPTION", payload: description });
    }, []);

    const updateImageUrl = useCallback((url: string | undefined) => {
        dispatch({ type: "UPDATE_IMAGE_URL", payload: url });
    }, []);

    const updateCategory = useCallback((categoryId: string | undefined) => {
        dispatch({ type: "UPDATE_CATEGORY", payload: categoryId });
    }, []);

    const updateDifficulty = useCallback((difficulty: Difficulty) => {
        dispatch({ type: "UPDATE_DIFFICULTY", payload: difficulty });
    }, []);

    const updateEstimatedHours = useCallback((hours: number | undefined) => {
        dispatch({ type: "UPDATE_ESTIMATED_HOURS", payload: hours });
    }, []);

    const updateTags = useCallback((tags: string[]) => {
        dispatch({ type: "UPDATE_TAGS", payload: tags });
    }, []);

    // Material actions
    const setMaterials = useCallback((materials: MaterialDTO[]) => {
        dispatch({ type: "SET_MATERIALS", payload: materials });
    }, []);

    const addMaterial = useCallback((material: MaterialDTO) => {
        dispatch({ type: "ADD_MATERIAL", payload: material });
    }, []);

    const updateMaterial = useCallback((material: MaterialDTO) => {
        dispatch({ type: "UPDATE_MATERIAL", payload: material });
    }, []);

    const deleteMaterial = useCallback((materialId: string) => {
        dispatch({ type: "DELETE_MATERIAL", payload: materialId });
    }, []);

    const reorderMaterials = useCallback((materials: MaterialDTO[]) => {
        dispatch({ type: "REORDER_MATERIALS", payload: materials });
    }, []);

    // Material modal actions
    const openAddMaterialModal = useCallback(() => {
        dispatch({ type: "OPEN_MATERIAL_MODAL", payload: null });
    }, []);

    const openEditMaterialModal = useCallback((materialId: string) => {
        dispatch({ type: "OPEN_MATERIAL_MODAL", payload: materialId });
    }, []);

    const closeMaterialModal = useCallback(() => {
        dispatch({ type: "CLOSE_MATERIAL_MODAL" });
    }, []);

    // Quiz picker actions
    const openCourseQuizPicker = useCallback(() => {
        dispatch({ type: "OPEN_QUIZ_PICKER", payload: "course" });
    }, []);

    const openMaterialQuizPicker = useCallback((materialId: string) => {
        dispatch({ type: "OPEN_QUIZ_PICKER", payload: { materialId } });
    }, []);

    const closeQuizPicker = useCallback(() => {
        dispatch({ type: "CLOSE_QUIZ_PICKER" });
    }, []);

    // Course actions
    const setCourse = useCallback((course: CourseDetailDTO, materials: MaterialDTO[]) => {
        dispatch({ type: "SET_COURSE", payload: { course, materials } });
    }, []);

    const markSaved = useCallback(() => {
        dispatch({ type: "MARK_SAVED" });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "RESET" });
    }, []);

    // Helper to get the currently editing material
    const getEditingMaterial = useCallback((): MaterialDTO | null => {
        if (!state.editingMaterialId) return null;
        return state.materials.find((m) => m.id === state.editingMaterialId) || null;
    }, [state.editingMaterialId, state.materials]);

    // Helper to get update request from current state
    const getUpdateRequest = useCallback((): UpdateCourseRequest | null => {
        if (!state.course) return null;
        return {
            title: state.course.title,
            description: state.course.description,
            imageUrl: state.course.imageUrl,
            categoryId: state.course.categoryId,
            difficulty: state.course.difficulty,
            estimatedHours: state.course.estimatedHours,
            tagNames: state.course.tags,
        };
    }, [state.course]);

    const value: CourseEditorContextType = {
        state,
        updateTitle,
        updateDescription,
        updateImageUrl,
        updateCategory,
        updateDifficulty,
        updateEstimatedHours,
        updateTags,
        setMaterials,
        addMaterial,
        updateMaterial,
        deleteMaterial,
        reorderMaterials,
        openAddMaterialModal,
        openEditMaterialModal,
        closeMaterialModal,
        openCourseQuizPicker,
        openMaterialQuizPicker,
        closeQuizPicker,
        setCourse,
        markSaved,
        reset,
        getEditingMaterial,
        getUpdateRequest,
    };

    return <CourseEditorContext.Provider value={value}>{children}</CourseEditorContext.Provider>;
}

// Hook to use course editor context
export function useCourseEditor() {
    const context = useContext(CourseEditorContext);
    if (!context) {
        throw new Error("useCourseEditor must be used within a CourseEditorProvider");
    }
    return context;
}

// Validation utilities
export interface CourseValidationError {
    field: string;
    message: string;
}

export function validateCourse(
    course: CreateCourseRequest | UpdateCourseRequest
): CourseValidationError[] {
    const errors: CourseValidationError[] = [];

    if (!course.title || course.title.trim().length < 3) {
        errors.push({
            field: "title",
            message: "Title must be at least 3 characters",
        });
    }

    if (course.title && course.title.length > 200) {
        errors.push({
            field: "title",
            message: "Title must be less than 200 characters",
        });
    }

    if (course.description && course.description.length > 2000) {
        errors.push({
            field: "description",
            message: "Description must be less than 2000 characters",
        });
    }

    return errors;
}

export function validateMaterial(
    material: CreateMaterialRequest | UpdateMaterialRequest
): CourseValidationError[] {
    const errors: CourseValidationError[] = [];

    if (!material.title || material.title.trim().length < 3) {
        errors.push({
            field: "title",
            message: "Title must be at least 3 characters",
        });
    }

    if (material.title && material.title.length > 200) {
        errors.push({
            field: "title",
            message: "Title must be less than 200 characters",
        });
    }

    if (material.contentType === "TEXT" && !material.content) {
        errors.push({
            field: "content",
            message: "Content is required for text materials",
        });
    }

    if (material.contentType === "FILE" && !material.fileId) {
        errors.push({
            field: "fileId",
            message: "File is required for file materials",
        });
    }

    return errors;
}

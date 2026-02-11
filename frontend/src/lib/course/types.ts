/**
 * Course API Types
 * TypeScript definitions matching the Course API specification
 */

// ============================================
// Enums
// ============================================

/**
 * Course difficulty levels
 */
export type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

/**
 * Material content types
 */
export type MaterialContentType = "TEXT" | "FILE";

// ============================================
// Common Types
// ============================================

export interface CourseTag {
    id: string;
    name: string;
}

export interface CourseCategory {
    id: string;
    name: string;
}

export interface CourseQuizRef {
    id: string;
    title: string;
}

// ============================================
// Material DTOs
// ============================================

/**
 * Material response from API
 */
export interface MaterialDTO {
    id: string;
    courseId: string;
    title: string;
    contentType: MaterialContentType;
    content?: string;
    fileId?: string;
    materialOrder: number;
    durationMinutes?: number;
    published: boolean;
    quizCount: number;
    mediaIds: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Material for public view (titles only, no content)
 */
export interface PublicMaterialDTO {
    id: string;
    title: string;
    materialOrder: number;
    durationMinutes?: number;
}

// ============================================
// Course DTOs
// ============================================

/**
 * Course summary for list views
 */
export interface CourseSummaryDTO {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    difficulty: Difficulty;
    published: boolean;
    materialCount: number;
    quizCount: number;
    enrollmentCount: number;
    createdAt: string;
}

/**
 * Full course details with materials
 */
export interface CourseDetailDTO {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    categoryId?: string;
    categoryName?: string;
    difficulty: Difficulty;
    estimatedHours?: number;
    published: boolean;
    creatorId: string;
    creatorName: string;
    materialCount: number;
    quizCount: number;
    enrollmentCount: number;
    tags: string[];
    materials?: MaterialDTO[];
    quizzes?: CourseQuizRef[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Public course summary (for browse page)
 */
export interface PublicCourseSummaryDTO {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    difficulty: Difficulty;
    estimatedHours?: number;
    creatorName: string;
    materialCount: number;
    quizCount: number;
    enrollmentCount: number;
    tags: string[];
}

/**
 * Public course details (for course preview)
 */
export interface PublicCourseDetailDTO extends PublicCourseSummaryDTO {
    materials?: PublicMaterialDTO[];
}

// ============================================
// Enrollment DTOs
// ============================================

/**
 * Enrollment response after enrolling
 */
export interface EnrollmentDTO {
    id: string;
    courseId: string;
    courseTitle: string;
    courseDescription?: string;
    courseImageUrl?: string;
    creatorName: string;
    difficulty: Difficulty;
    estimatedHours?: number;
    materialCount: number;
    quizCount: number;
    tags: string[];
    enrolledAt: string;
    completedAt?: string;
    progressPercentage: number;
    completedMaterialCount: number;
}

/**
 * Enrollment summary for list views
 */
export interface EnrollmentSummaryDTO {
    id: string;
    courseId: string;
    courseTitle: string;
    courseImageUrl?: string;
    progressPercentage: number;
    completedMaterialCount: number;
    materialCount: number;
    enrolledAt: string;
    completedAt?: string;
}

// ============================================
// Progress DTOs
// ============================================

/**
 * Individual material progress
 */
export interface MaterialProgressItem {
    materialId: string;
    title: string;
    order: number;
    completed: boolean;
    completedAt?: string;
}

/**
 * Full course progress response
 */
export interface ProgressDTO {
    enrollmentId: string;
    courseId: string;
    courseTitle: string;
    progressPercentage: number;
    totalMaterials: number;
    completedMaterials: number;
    enrolledAt: string;
    completedAt?: string;
    materials: MaterialProgressItem[];
}

// ============================================
// Request DTOs
// ============================================

/**
 * Create course request
 */
export interface CreateCourseRequest {
    title: string;
    description?: string;
    imageUrl?: string;
    categoryId?: string;
    difficulty?: Difficulty;
    estimatedHours?: number;
    tagNames?: string[];
}

/**
 * Update course request
 */
export interface UpdateCourseRequest {
    title: string;
    description?: string;
    imageUrl?: string;
    categoryId?: string;
    difficulty?: Difficulty;
    estimatedHours?: number;
    tagNames?: string[];
}

/**
 * Create material request
 */
export interface CreateMaterialRequest {
    title: string;
    contentType: MaterialContentType;
    content?: string;
    fileId?: string;
    durationMinutes?: number;
    mediaIds?: string[];
}

/**
 * Update material request
 */
export interface UpdateMaterialRequest {
    title: string;
    contentType: MaterialContentType;
    content?: string;
    fileId?: string;
    durationMinutes?: number;
    mediaIds?: string[];
}

/**
 * Material order item for reordering
 */
export interface MaterialOrderItem {
    materialId: string;
    order: number;
}

/**
 * Reorder materials request
 */
export interface ReorderMaterialsRequest {
    materialOrders: MaterialOrderItem[];
}

// ============================================
// Pagination (reuse pattern from quiz types)
// ============================================

export interface PageableInfo {
    pageNumber: number;
    pageSize: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: PageableInfo;
    totalElements: number;
    totalPages: number;
}

// ============================================
// Error Response
// ============================================

export interface CourseApiErrorResponse {
    error: string;
    message: string;
    details?: Record<string, string>;
}

// ============================================
// Filter Types
// ============================================

export type SortOption = "newest" | "popular" | "updated";

export interface PublicCourseFilters {
    search?: string;
    categoryId?: string;
    difficulty?: Difficulty;
    tags?: string[];
    sortBy?: SortOption;
}

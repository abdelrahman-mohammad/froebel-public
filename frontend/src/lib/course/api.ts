/**
 * Course API Client
 * Fetch wrappers for course endpoints
 * Uses HttpOnly cookies for authentication (set by backend)
 */
import type {
    CourseApiErrorResponse,
    CourseDetailDTO,
    CourseSummaryDTO,
    CreateCourseRequest,
    CreateMaterialRequest,
    Difficulty,
    EnrollmentDTO,
    EnrollmentSummaryDTO,
    MaterialDTO,
    PaginatedResponse,
    ProgressDTO,
    PublicCourseDetailDTO,
    PublicCourseFilters,
    PublicCourseSummaryDTO,
    ReorderMaterialsRequest,
    UpdateCourseRequest,
    UpdateMaterialRequest,
} from "./types";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Get CSRF token from cookie (XSRF-TOKEN)
 * Spring Security sets this cookie for CSRF protection
 */
function getCsrfToken(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Custom error class for Course API errors
 */
export class CourseApiError extends Error {
    constructor(
        public status: number,
        public errorResponse: CourseApiErrorResponse
    ) {
        super(errorResponse.message);
        this.name = "CourseApiError";
    }
}

/**
 * Helper to make authenticated requests
 * Uses HttpOnly cookies for authentication (sent automatically)
 * CSRF token is included in X-XSRF-TOKEN header for state-changing requests
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Include CSRF token for state-changing methods (POST, PUT, DELETE)
    const method = options.method?.toUpperCase() || "GET";
    if (["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            (headers as Record<string, string>)["X-XSRF-TOKEN"] = csrfToken;
        }
    }

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies with requests
    });
}

/**
 * Helper to make unauthenticated (public) requests
 * Still includes credentials for CSRF cookie and potential authenticated users
 */
async function fetchPublic(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    return fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: "include", // Send cookies with requests
    });
}

/**
 * Helper to handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (response.status === 204) {
        return undefined as T;
    }

    const data = await response.json();

    if (!response.ok) {
        throw new CourseApiError(response.status, data as CourseApiErrorResponse);
    }

    return data as T;
}

/**
 * Get human-readable error message from API error
 */
export function getCourseErrorMessage(error: unknown): string {
    if (error instanceof CourseApiError) {
        if (error.status === 401) {
            return "Please log in to continue.";
        }
        if (error.status === 403) {
            return "You don't have permission to access this course.";
        }
        if (error.status === 404) {
            return "Course not found.";
        }
        if (error.status === 409) {
            return error.message; // Already enrolled, etc.
        }
        if (error.errorResponse.details) {
            const messages = Object.values(error.errorResponse.details);
            return messages.length > 0 ? messages[0] : error.message;
        }
        return error.message;
    }

    if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
            return "Unable to connect to server. Please check your connection.";
        }
        return error.message;
    }

    return "An unexpected error occurred";
}

// ============================================
// Course Management (Authenticated)
// ============================================

/**
 * List user's courses with pagination
 */
export async function getMyCourses(
    page = 0,
    size = 20,
    sort = "createdAt,desc"
): Promise<PaginatedResponse<CourseSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sort,
    });

    const response = await fetchWithAuth(`/api/v1/courses?${params}`);
    return handleResponse<PaginatedResponse<CourseSummaryDTO>>(response);
}

/**
 * Get course details by ID
 */
export async function getCourseById(courseId: string): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}`);
    return handleResponse<CourseDetailDTO>(response);
}

/**
 * Create a new course
 */
export async function createCourse(data: CreateCourseRequest): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth("/api/v1/courses", {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<CourseDetailDTO>(response);
}

/**
 * Update an existing course
 */
export async function updateCourse(
    courseId: string,
    data: UpdateCourseRequest
): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<CourseDetailDTO>(response);
}

/**
 * Delete a course
 */
export async function deleteCourse(courseId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}`, {
        method: "DELETE",
    });
    return handleResponse<void>(response);
}

/**
 * Publish or unpublish a course
 */
export async function setCoursePublished(
    courseId: string,
    published: boolean
): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/publish?publish=${published}`,
        { method: "PATCH" }
    );
    return handleResponse<CourseDetailDTO>(response);
}

// ============================================
// Material Management (Authenticated)
// ============================================

/**
 * List materials for a course
 */
export async function getMaterials(courseId: string): Promise<MaterialDTO[]> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials`);
    return handleResponse<MaterialDTO[]>(response);
}

/**
 * Get material by ID
 */
export async function getMaterial(courseId: string, materialId: string): Promise<MaterialDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials/${materialId}`);
    return handleResponse<MaterialDTO>(response);
}

/**
 * Add a material to a course
 */
export async function createMaterial(
    courseId: string,
    data: CreateMaterialRequest
): Promise<MaterialDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials`, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return handleResponse<MaterialDTO>(response);
}

/**
 * Update a material
 */
export async function updateMaterial(
    courseId: string,
    materialId: string,
    data: UpdateMaterialRequest
): Promise<MaterialDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials/${materialId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
    return handleResponse<MaterialDTO>(response);
}

/**
 * Delete a material
 */
export async function deleteMaterial(courseId: string, materialId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials/${materialId}`, {
        method: "DELETE",
    });
    return handleResponse<void>(response);
}

/**
 * Reorder materials in a course
 */
export async function reorderMaterials(
    courseId: string,
    data: ReorderMaterialsRequest
): Promise<MaterialDTO[]> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/materials/reorder`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
    return handleResponse<MaterialDTO[]>(response);
}

/**
 * Publish or unpublish a material
 */
export async function setMaterialPublished(
    courseId: string,
    materialId: string,
    published: boolean
): Promise<MaterialDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/materials/${materialId}/publish?publish=${published}`,
        { method: "PATCH" }
    );
    return handleResponse<MaterialDTO>(response);
}

// ============================================
// Quiz Association (Authenticated)
// ============================================

/**
 * Attach a quiz to a course
 */
export async function attachQuizToCourse(
    courseId: string,
    quizId: string
): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/quizzes/${quizId}`, {
        method: "POST",
    });
    return handleResponse<CourseDetailDTO>(response);
}

/**
 * Detach a quiz from a course
 */
export async function detachQuizFromCourse(
    courseId: string,
    quizId: string
): Promise<CourseDetailDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/quizzes/${quizId}`, {
        method: "DELETE",
    });
    return handleResponse<CourseDetailDTO>(response);
}

/**
 * Attach a quiz to a material
 */
export async function attachQuizToMaterial(
    courseId: string,
    materialId: string,
    quizId: string
): Promise<MaterialDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/materials/${materialId}/quizzes/${quizId}`,
        { method: "POST" }
    );
    return handleResponse<MaterialDTO>(response);
}

/**
 * Detach a quiz from a material
 */
export async function detachQuizFromMaterial(
    courseId: string,
    materialId: string,
    quizId: string
): Promise<MaterialDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/materials/${materialId}/quizzes/${quizId}`,
        { method: "DELETE" }
    );
    return handleResponse<MaterialDTO>(response);
}

// ============================================
// Public Course Browsing
// ============================================

/**
 * List public courses with pagination and filters
 */
export async function getPublicCourses(
    page = 0,
    size = 20,
    filters: PublicCourseFilters = {}
): Promise<PaginatedResponse<PublicCourseSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    if (filters.search) {
        params.set("search", filters.search);
    }
    if (filters.categoryId) {
        params.set("categoryId", filters.categoryId);
    }
    if (filters.difficulty) {
        params.set("difficulty", filters.difficulty);
    }
    if (filters.tags && filters.tags.length > 0) {
        filters.tags.forEach((tag) => params.append("tags", tag));
    }
    if (filters.sortBy) {
        params.set("sortBy", filters.sortBy);
    }

    const response = await fetchPublic(`/api/v1/courses/public?${params}`);
    return handleResponse<PaginatedResponse<PublicCourseSummaryDTO>>(response);
}

/**
 * Get public course details
 */
export async function getPublicCourse(courseId: string): Promise<PublicCourseDetailDTO> {
    const response = await fetchPublic(`/api/v1/courses/public/${courseId}`);
    return handleResponse<PublicCourseDetailDTO>(response);
}

/**
 * List public courses filtered by difficulty
 */
export async function getPublicCoursesByDifficulty(
    difficulty: Difficulty,
    page = 0,
    size = 20
): Promise<PaginatedResponse<PublicCourseSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    const response = await fetchPublic(`/api/v1/courses/public/difficulty/${difficulty}?${params}`);
    return handleResponse<PaginatedResponse<PublicCourseSummaryDTO>>(response);
}

// ============================================
// Enrollment (Authenticated)
// ============================================

/**
 * Enroll in a course
 */
export async function enrollInCourse(courseId: string): Promise<EnrollmentDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/enroll`, {
        method: "POST",
    });
    return handleResponse<EnrollmentDTO>(response);
}

/**
 * Unenroll from a course
 */
export async function unenrollFromCourse(courseId: string): Promise<void> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/enroll`, {
        method: "DELETE",
    });
    return handleResponse<void>(response);
}

/**
 * List user's enrollments with pagination
 */
export async function getMyEnrollments(
    page = 0,
    size = 20
): Promise<PaginatedResponse<EnrollmentSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    const response = await fetchWithAuth(`/api/v1/courses/enrolled?${params}`);
    return handleResponse<PaginatedResponse<EnrollmentSummaryDTO>>(response);
}

/**
 * List course enrollees (owner only)
 */
export async function getCourseEnrollees(
    courseId: string,
    page = 0,
    size = 20
): Promise<PaginatedResponse<EnrollmentSummaryDTO>> {
    const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
    });

    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/enrollments?${params}`);
    return handleResponse<PaginatedResponse<EnrollmentSummaryDTO>>(response);
}

// ============================================
// Progress Tracking (Authenticated)
// ============================================

/**
 * Get course progress for current user
 */
export async function getCourseProgress(courseId: string): Promise<ProgressDTO> {
    const response = await fetchWithAuth(`/api/v1/courses/${courseId}/progress`);
    return handleResponse<ProgressDTO>(response);
}

/**
 * Mark a material as complete
 */
export async function markMaterialComplete(
    courseId: string,
    materialId: string
): Promise<ProgressDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/materials/${materialId}/complete`,
        { method: "POST" }
    );
    return handleResponse<ProgressDTO>(response);
}

/**
 * Unmark a material as complete
 */
export async function unmarkMaterialComplete(
    courseId: string,
    materialId: string
): Promise<ProgressDTO> {
    const response = await fetchWithAuth(
        `/api/v1/courses/${courseId}/materials/${materialId}/complete`,
        { method: "DELETE" }
    );
    return handleResponse<ProgressDTO>(response);
}
